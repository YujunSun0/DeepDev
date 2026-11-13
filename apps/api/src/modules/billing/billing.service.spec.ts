import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import * as crypto from 'crypto';
import { BillingService, REFUNDED_STATUS } from './billing.service';

const SECRET = 'pdl_ntfset_test_secret';

function signedHeader(body: Buffer, ts = Math.floor(Date.now() / 1000)) {
  const h1 = crypto.createHmac('sha256', SECRET).update(`${ts}:${body.toString()}`).digest('hex');
  return `ts=${ts};h1=${h1}`;
}

let seq = 0;
function event(eventType: string, data: Record<string, any>, occurredAt = new Date().toISOString()) {
  seq += 1;
  return Buffer.from(
    JSON.stringify({ event_id: `evt_${seq}`, event_type: eventType, occurred_at: occurredAt, data }),
  );
}

function subscription(overrides: Record<string, any> = {}) {
  return {
    id: 'sub_1',
    status: 'active',
    customer_id: 'ctm_1',
    custom_data: { user_id: 'user-1' },
    scheduled_change: null,
    ...overrides,
  };
}

describe('BillingService (Paddle)', () => {
  let service: BillingService;
  let user: any;
  let seenEvents: Set<string>;
  let prisma: any;
  let fetchMock: jest.Mock;

  beforeEach(() => {
    user = {
      id: 'user-1',
      email: 'user@example.com',
      planType: 'FREE',
      paddleCustomerId: null,
      paddleSubscriptionId: null,
      paddleEventAt: null,
      subscriptionStatus: null,
    };
    seenEvents = new Set();
    const findByWhere = async ({ where }: any) => {
      if (where.id && where.id !== user.id) return null;
      if (where.paddleSubscriptionId && where.paddleSubscriptionId !== user.paddleSubscriptionId) return null;
      if (where.paddleCustomerId && where.paddleCustomerId !== user.paddleCustomerId) return null;
      return { ...user };
    };
    prisma = {
      user: {
        findUnique: jest.fn(findByWhere),
        findFirst: jest.fn(findByWhere),
        update: jest.fn(async ({ data }) => {
          user = { ...user, ...data };
          return user;
        }),
      },
      webhookEvent: {
        create: jest.fn(async ({ data }) => {
          if (seenEvents.has(data.eventId)) {
            throw new Prisma.PrismaClientKnownRequestError('dup', {
              code: 'P2002',
              clientVersion: 'test',
            });
          }
          seenEvents.add(data.eventId);
        }),
        delete: jest.fn(async ({ where }) => seenEvents.delete(where.eventId)),
      },
    };
    const env: Record<string, string> = {
      PADDLE_WEBHOOK_SECRET: SECRET,
      PADDLE_API_KEY: 'pdl_sdbx_apikey_test',
      PADDLE_CLIENT_SIDE_TOKEN: 'test_token',
      PADDLE_PRO_PRICE_ID: 'pri_pro',
    };
    const config = { get: (key: string, def?: string) => env[key] ?? def } as unknown as ConfigService;
    service = new BillingService(prisma, config, { getUsageStatus: async () => ({}) } as any);

    fetchMock = jest.fn(async () => ({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ data: { id: 'txn_1', status: 'canceled' } }),
    }));
    (global as any).fetch = fetchMock;
  });

  const send = (body: Buffer) => service.handleWebhook(body, signedHeader(body));

  describe('서명 검증', () => {
    it('올바른 서명을 통과시킨다', async () => {
      await expect(send(event('transaction.created', {}))).resolves.toEqual({ received: true });
    });

    it('틀린 서명·잘못된 형식은 500이 아니라 400으로 거절한다', async () => {
      const body = event('subscription.created', subscription());
      const ts = Math.floor(Date.now() / 1000);
      for (const header of ['', 'garbage', `ts=${ts};h1=abc`, `ts=${ts};h1=${'f'.repeat(64)}`]) {
        await expect(service.handleWebhook(body, header)).rejects.toBeInstanceOf(BadRequestException);
      }
    });

    it('5분 넘게 지난 서명은 재전송 공격으로 보고 거절한다', async () => {
      const body = event('subscription.created', subscription());
      const old = Math.floor(Date.now() / 1000) - 600;
      await expect(service.handleWebhook(body, signedHeader(body, old))).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('secret 교체 중 h1이 여러 개여도 하나만 맞으면 통과한다', () => {
      const body = Buffer.from('{}');
      const ts = Math.floor(Date.now() / 1000);
      const valid = signedHeader(body, ts).split(';')[1];
      expect(service.verifySignature(body, `ts=${ts};h1=${'0'.repeat(64)};${valid}`)).toBe(true);
    });
  });

  describe('중복·실패 처리', () => {
    it('같은 event_id는 한 번만 처리한다', async () => {
      const body = event('subscription.created', subscription());
      expect(await send(body)).toEqual({ received: true });
      expect(await send(body)).toEqual({ received: true, duplicate: true });
      expect(prisma.user.update).toHaveBeenCalledTimes(1);
    });

    it('처리 중 실패하면 기록을 지워 재전송 때 다시 처리한다', async () => {
      const body = event('subscription.created', subscription());
      prisma.user.update.mockRejectedValueOnce(new Error('db down'));
      await expect(send(body)).rejects.toThrow('db down');
      expect(await send(body)).toEqual({ received: true });
      expect(user.planType).toBe('PRO');
    });
  });

  describe('구독 동기화', () => {
    it('구독이 생성되면 PRO로 올리고 Paddle ID를 저장한다', async () => {
      await send(event('subscription.created', subscription()));
      expect(user).toMatchObject({
        planType: 'PRO',
        paddleCustomerId: 'ctm_1',
        paddleSubscriptionId: 'sub_1',
        subscriptionStatus: 'active',
      });
    });

    it('해지 예약(scheduled_change)은 기간 끝까지 PRO를 유지한다', async () => {
      await send(event('subscription.created', subscription()));
      await send(
        event(
          'subscription.updated',
          subscription({ scheduled_change: { action: 'cancel', effective_at: '2026-12-13T00:00:00Z' } }),
        ),
      );
      expect(user.planType).toBe('PRO');
    });

    it('결제 지연(past_due) 중에는 PRO 유지, 최종 해지되면 FREE', async () => {
      await send(event('subscription.created', subscription()));
      await send(event('subscription.past_due', subscription({ status: 'past_due' })));
      expect(user.planType).toBe('PRO');
      await send(event('subscription.canceled', subscription({ status: 'canceled' })));
      expect(user.planType).toBe('FREE');
    });

    it('늦게 도착한 오래된 이벤트는 무시한다', async () => {
      await send(event('subscription.canceled', subscription({ status: 'canceled' }), '2026-11-13T10:00:00Z'));
      await send(event('subscription.updated', subscription({ status: 'active' }), '2026-11-13T09:00:00Z'));
      expect(user.planType).toBe('FREE');
    });

    it('새 구독을 시작한 뒤 이전 구독의 해지 이벤트가 와도 PRO를 유지한다', async () => {
      await send(event('subscription.created', subscription({ id: 'sub_new' })));
      await send(event('subscription.canceled', subscription({ id: 'sub_old', status: 'canceled' })));
      expect(user.planType).toBe('PRO');
      expect(user.paddleSubscriptionId).toBe('sub_new');
    });

    it('custom_data가 없어도 구독 ID로 사용자를 찾는다', async () => {
      await send(event('subscription.created', subscription()));
      await send(event('subscription.canceled', subscription({ status: 'canceled', custom_data: null })));
      expect(user.planType).toBe('FREE');
    });
  });

  describe('환불·차지백', () => {
    beforeEach(async () => {
      await send(event('subscription.created', subscription()));
      fetchMock.mockClear();
    });

    const adjustment = (overrides: Record<string, any> = {}) => ({
      id: 'adj_1',
      action: 'refund',
      type: 'full',
      status: 'approved',
      subscription_id: 'sub_1',
      customer_id: 'ctm_1',
      transaction_id: 'txn_1',
      ...overrides,
    });

    it('승인 대기 중인 환불은 아직 아무것도 하지 않는다', async () => {
      await send(event('adjustment.created', adjustment({ status: 'pending_approval' })));
      expect(user.planType).toBe('PRO');
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('전액 환불이 승인되면 FREE로 내리고 구독을 즉시 해지한다', async () => {
      await send(event('adjustment.updated', adjustment()));
      expect(user.planType).toBe('FREE');
      expect(user.subscriptionStatus).toBe(REFUNDED_STATUS);
      expect(fetchMock).toHaveBeenCalledWith(
        'https://sandbox-api.paddle.com/subscriptions/sub_1/cancel',
        expect.objectContaining({ method: 'POST', body: JSON.stringify({ effective_from: 'immediately' }) }),
      );
    });

    it('부분 환불은 플랜을 유지한다', async () => {
      await send(event('adjustment.updated', adjustment({ type: 'partial' })));
      expect(user.planType).toBe('PRO');
    });

    it('차지백은 부분이어도 FREE로 내린다', async () => {
      await send(event('adjustment.created', adjustment({ action: 'chargeback', type: 'partial' })));
      expect(user.planType).toBe('FREE');
    });

    it('환불 후 늦게 온 active 업데이트로 PRO가 되살아나지 않는다', async () => {
      await send(event('adjustment.updated', adjustment()));
      await send(event('subscription.updated', subscription({ status: 'active' })));
      expect(user.planType).toBe('FREE');
      expect(user.subscriptionStatus).toBe(REFUNDED_STATUS);
    });

    it('환불된 사용자가 새로 구독하면 다시 PRO가 된다', async () => {
      await send(event('adjustment.updated', adjustment()));
      await send(event('subscription.created', subscription({ id: 'sub_2' })));
      expect(user.planType).toBe('PRO');
      expect(user.subscriptionStatus).toBe('active');
      expect(user.paddleSubscriptionId).toBe('sub_2');
    });

    it('환불된 구독은 재개할 수 없다', async () => {
      await send(event('adjustment.updated', adjustment()));
      await expect(service.resumeSubscription('user-1')).rejects.toThrow('환불된 구독');
    });
  });

  describe('결제창', () => {
    it('서버에서 user_id를 담은 거래를 만든다', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 201,
        text: async () => JSON.stringify({ data: { id: 'txn_new' } }),
      });
      const result = await service.createCheckout('user-1');
      expect(result).toEqual({ transactionId: 'txn_new', customerEmail: 'user@example.com' });
      const [url, init] = fetchMock.mock.calls[0];
      expect(url).toBe('https://sandbox-api.paddle.com/transactions');
      expect(JSON.parse(init.body)).toEqual({
        items: [{ price_id: 'pri_pro', quantity: 1 }],
        custom_data: { user_id: 'user-1' },
      });
    });

    it('이미 유료 플랜이면 결제창을 만들지 않는다', async () => {
      user.planType = 'PRO';
      await expect(service.createCheckout('user-1')).rejects.toThrow('이미 유료 플랜');
      expect(fetchMock).not.toHaveBeenCalled();
    });
  });
});
