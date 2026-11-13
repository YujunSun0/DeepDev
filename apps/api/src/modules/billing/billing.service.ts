import {
  Injectable,
  Logger,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, User } from '@prisma/client';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { UsageService } from '../usage/usage.service';

/** Paddle webhook 공통 형식 (https://developer.paddle.com/webhooks/overview) */
export interface PaddleWebhookEvent {
  event_id: string;
  event_type: string;
  occurred_at: string;
  data: Record<string, any>;
}

interface PaddleSubscription {
  id: string;
  status: 'active' | 'trialing' | 'past_due' | 'paused' | 'canceled';
  customer_id: string;
  custom_data?: { user_id?: string } | null;
  next_billed_at?: string | null;
  canceled_at?: string | null;
  scheduled_change?: { action: 'cancel' | 'pause' | 'resume'; effective_at: string } | null;
  management_urls?: { update_payment_method?: string | null; cancel?: string } | null;
}

interface PaddleAdjustment {
  id: string;
  action: string;
  type?: 'full' | 'partial';
  status: 'pending_approval' | 'approved' | 'rejected' | 'reversed';
  subscription_id?: string | null;
  customer_id?: string | null;
  transaction_id: string;
}

export type PaddleEnvironment = 'sandbox' | 'production';

/** 전액 환불·차지백된 사용자 표시용 상태값 (Paddle 구독 상태값과 구분) */
export const REFUNDED_STATUS = 'refunded';

/** 이 상태의 구독은 유료 기능 이용 가능 (past_due: Paddle이 결제 재시도 중) */
const PRO_STATUSES = new Set(['active', 'trialing', 'past_due']);

/** webhook 서명 timestamp 허용 오차 (재전송 공격 방지) */
const SIGNATURE_TOLERANCE_SEC = 300;

const PLAN_PRICES: Record<string, number> = {
  FREE: 0,
  PRO: 29_000,
  MASTER: 59_000,
};

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);
  private readonly apiKey: string;
  private readonly clientToken: string;
  private readonly webhookSecret: string;
  private readonly proPriceId: string;
  private readonly environment: PaddleEnvironment;
  private readonly apiBase: string;
  private readonly checkoutEnabled: boolean;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly usageService: UsageService,
  ) {
    this.apiKey = this.config.get<string>('PADDLE_API_KEY', '');
    this.clientToken = this.config.get<string>('PADDLE_CLIENT_SIDE_TOKEN', '');
    this.webhookSecret = this.config.get<string>('PADDLE_WEBHOOK_SECRET', '');
    this.proPriceId = this.config.get<string>('PADDLE_PRO_PRICE_ID', '');
    this.checkoutEnabled = this.config.get<string>('BILLING_CHECKOUT_ENABLED', 'true') === 'true';

    // PADDLE_ENV가 없으면 API 키 접두사로 판단 (pdl_sdbx_ → sandbox)
    const envSetting = this.config.get<string>('PADDLE_ENV', '');
    this.environment =
      envSetting === 'production' || envSetting === 'sandbox'
        ? envSetting
        : this.apiKey.startsWith('pdl_sdbx_')
          ? 'sandbox'
          : 'production';
    this.apiBase =
      this.environment === 'sandbox' ? 'https://sandbox-api.paddle.com' : 'https://api.paddle.com';
  }

  /** 결제 가능 여부 + 프론트에서 Paddle.js 초기화에 필요한 공개 값 (client-side token은 공개용) */
  getCheckoutStatus() {
    const configured = Boolean(this.apiKey && this.clientToken && this.proPriceId);
    return {
      checkoutEnabled: this.checkoutEnabled && configured,
      paddle: configured
        ? { clientToken: this.clientToken, environment: this.environment }
        : null,
    };
  }

  // ─────────────────────────────────────────────
  // Paddle API
  // ─────────────────────────────────────────────

  private async paddleRequest<T = any>(
    method: 'GET' | 'POST' | 'PATCH',
    path: string,
    body?: unknown,
  ): Promise<T> {
    if (!this.apiKey) {
      throw new BadRequestException('결제 시스템이 아직 설정되지 않았습니다');
    }
    const response = await fetch(`${this.apiBase}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    const text = await response.text();
    let json: any = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      // JSON이 아닌 응답은 아래에서 그대로 기록
    }

    if (!response.ok) {
      const detail = json?.error?.detail ?? text.slice(0, 300);
      this.logger.error(`Paddle ${method} ${path} failed (${response.status}): ${detail}`);
      throw new PaddleApiError(response.status, json?.error?.code, detail);
    }
    return json?.data as T;
  }

  // ─────────────────────────────────────────────
  // Checkout
  // ─────────────────────────────────────────────

  /**
   * 서버에서 거래(transaction)를 만들어 user_id를 custom_data에 고정한다.
   * 프론트는 transactionId로 Paddle.js 결제창을 연다. (클라이언트가 user_id를 조작할 수 없음)
   */
  async createCheckout(userId: string) {
    if (!this.checkoutEnabled) {
      throw new BadRequestException('결제가 준비 중입니다. 곧 이용 가능합니다.');
    }
    if (!this.apiKey || !this.clientToken || !this.proPriceId) {
      throw new BadRequestException('결제 시스템이 아직 설정되지 않았습니다');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('사용자를 찾을 수 없습니다');
    if (user.planType !== 'FREE') {
      throw new ForbiddenException('이미 유료 플랜을 사용 중입니다');
    }

    const transaction = await this.paddleRequest<{ id: string }>('POST', '/transactions', {
      items: [{ price_id: this.proPriceId, quantity: 1 }],
      custom_data: { user_id: userId },
      ...(user.paddleCustomerId ? { customer_id: user.paddleCustomerId } : {}),
    }).catch((e) => {
      throw new BadRequestException(
        e instanceof PaddleApiError ? `결제창을 열 수 없습니다: ${e.detail}` : '결제창을 열 수 없습니다',
      );
    });

    return {
      transactionId: transaction.id,
      // 이미 Paddle 고객이면 거래에 고객이 연결돼 있으므로 이메일을 따로 넘기지 않음
      customerEmail: user.paddleCustomerId ? null : user.email,
    };
  }

  // ─────────────────────────────────────────────
  // Webhook
  // ─────────────────────────────────────────────

  /**
   * Paddle-Signature: "ts=1671552777;h1=<hex>" (secret 교체 중에는 h1이 여러 개일 수 있음)
   * 서명 대상은 `${ts}:${rawBody}` 의 HMAC-SHA256
   */
  verifySignature(rawBody: Buffer, header: string, nowSec = Math.floor(Date.now() / 1000)): boolean {
    if (!this.webhookSecret || !header) return false;

    let ts = '';
    const signatures: string[] = [];
    for (const part of header.split(';')) {
      const [key, value] = part.split('=');
      if (key === 'ts') ts = value ?? '';
      if (key === 'h1' && value) signatures.push(value);
    }
    if (!/^\d+$/.test(ts) || signatures.length === 0) return false;
    if (Math.abs(nowSec - Number(ts)) > SIGNATURE_TOLERANCE_SEC) return false;

    const expected = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(`${ts}:`)
      .update(rawBody)
      .digest();

    return signatures.some((sig) => {
      const received = Buffer.from(sig, 'hex');
      // timingSafeEqual은 길이가 다르면 예외를 던지므로 먼저 길이 비교
      return received.length === expected.length && crypto.timingSafeEqual(received, expected);
    });
  }

  async handleWebhook(rawBody: Buffer, signature: string) {
    if (!this.verifySignature(rawBody, signature)) {
      this.logger.warn('Invalid Paddle webhook signature - check PADDLE_WEBHOOK_SECRET');
      throw new BadRequestException('유효하지 않은 서명입니다');
    }

    let event: PaddleWebhookEvent;
    try {
      event = JSON.parse(rawBody.toString());
    } catch {
      throw new BadRequestException('잘못된 webhook payload입니다');
    }
    if (!event?.event_id || !event.event_type) {
      throw new BadRequestException('잘못된 webhook payload입니다');
    }

    // 중복 처리 방지: Paddle은 재전송 시 같은 event_id를 보냄
    try {
      await this.prisma.webhookEvent.create({
        data: { eventId: event.event_id, eventType: event.event_type },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        this.logger.log(`Duplicate webhook ignored: ${event.event_type} (${event.event_id})`);
        return { received: true, duplicate: true };
      }
      throw e;
    }

    try {
      await this.processWebhookEvent(event);
    } catch (e) {
      // 처리 실패 시 기록을 지워 Paddle 재전송 때 다시 처리되도록 함
      await this.prisma.webhookEvent
        .delete({ where: { eventId: event.event_id } })
        .catch(() => undefined);
      throw e;
    }

    return { received: true };
  }

  private async processWebhookEvent(event: PaddleWebhookEvent) {
    this.logger.log(`Paddle webhook: ${event.event_type} (${event.event_id})`);

    if (event.event_type.startsWith('subscription.')) {
      await this.syncSubscription(event.data as PaddleSubscription, new Date(event.occurred_at));
      return;
    }
    if (event.event_type === 'adjustment.created' || event.event_type === 'adjustment.updated') {
      await this.handleAdjustment(event.data as PaddleAdjustment);
      return;
    }
    this.logger.log(`Unhandled Paddle event: ${event.event_type}`);
  }

  private async findUser(opts: {
    userId?: string | null;
    subscriptionId?: string | null;
    customerId?: string | null;
  }): Promise<User | null> {
    if (opts.userId) {
      const user = await this.prisma.user.findUnique({ where: { id: opts.userId } });
      if (user) return user;
    }
    if (opts.subscriptionId) {
      const user = await this.prisma.user.findFirst({
        where: { paddleSubscriptionId: opts.subscriptionId },
      });
      if (user) return user;
    }
    if (opts.customerId) {
      return this.prisma.user.findFirst({ where: { paddleCustomerId: opts.customerId } });
    }
    return null;
  }

  /** subscription.created / updated / activated / canceled / past_due / paused / resumed */
  private async syncSubscription(sub: PaddleSubscription, occurredAt: Date) {
    const user = await this.findUser({
      userId: sub.custom_data?.user_id,
      subscriptionId: sub.id,
      customerId: sub.customer_id,
    });
    if (!user) {
      this.logger.warn(`No user for Paddle subscription ${sub.id}`);
      return;
    }

    const isCurrent = !user.paddleSubscriptionId || user.paddleSubscriptionId === sub.id;
    const grantsPro = PRO_STATUSES.has(sub.status);

    // 다른(이전) 구독의 이벤트가 현재 구독을 덮어쓰지 않도록: 새 구독은 유효한 상태일 때만 현재 구독으로 교체
    if (!isCurrent && !grantsPro) {
      this.logger.log(`Ignoring ${sub.status} event for non-current subscription ${sub.id}`);
      return;
    }
    // 같은 구독의 오래된 이벤트가 늦게 도착한 경우 무시
    if (isCurrent && user.paddleEventAt && occurredAt < user.paddleEventAt) {
      this.logger.log(`Ignoring stale event for subscription ${sub.id}`);
      return;
    }
    // 환불된 구독은 해지 처리 중에도 active 업데이트가 올 수 있으므로 다시 PRO로 올리지 않음
    if (isCurrent && user.subscriptionStatus === REFUNDED_STATUS) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { planType: 'FREE', paddleEventAt: occurredAt },
      });
      return;
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        planType: grantsPro ? 'PRO' : 'FREE',
        paddleCustomerId: sub.customer_id || user.paddleCustomerId,
        paddleSubscriptionId: sub.id,
        subscriptionStatus: sub.status,
        paddleEventAt: occurredAt,
      },
    });
    this.logger.log(`User ${user.id} synced: subscription ${sub.id} → ${sub.status}`);
  }

  /** 전액 환불(승인됨)·차지백 → 즉시 FREE 전환 + 구독 즉시 해지 */
  private async handleAdjustment(adj: PaddleAdjustment) {
    const isRefund = adj.action === 'refund';
    const isChargeback = adj.action === 'chargeback';
    if (!isRefund && !isChargeback) return;
    if (adj.status !== 'approved') {
      this.logger.log(`Adjustment ${adj.id} is ${adj.status} - waiting for approval`);
      return;
    }
    if (isRefund && adj.type !== 'full') {
      this.logger.log(`Partial refund ${adj.id} - plan kept`);
      return;
    }

    const user = await this.findUser({
      subscriptionId: adj.subscription_id,
      customerId: adj.customer_id,
    });
    if (!user) {
      this.logger.warn(`No user for Paddle adjustment ${adj.id}`);
      return;
    }
    // 이전 구독 결제의 환불이면 현재 구독에는 영향 없음
    if (adj.subscription_id && user.paddleSubscriptionId && adj.subscription_id !== user.paddleSubscriptionId) {
      this.logger.log(`Refund ${adj.id} is for a previous subscription - plan kept`);
      return;
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { planType: 'FREE', subscriptionStatus: REFUNDED_STATUS },
    });
    this.logger.log(`User ${user.id} ${adj.action} (${adj.id}) → downgraded to FREE`);

    const subscriptionId = adj.subscription_id || user.paddleSubscriptionId;
    if (subscriptionId) {
      // 이미 해지된 구독이면 Paddle이 오류를 반환하므로 로그만 남김
      await this.paddleRequest('POST', `/subscriptions/${subscriptionId}/cancel`, {
        effective_from: 'immediately',
      }).catch((e) =>
        this.logger.warn(`Could not cancel refunded subscription ${subscriptionId}: ${e?.detail ?? e}`),
      );
    }
  }

  // ─────────────────────────────────────────────
  // 구독 관리 화면
  // ─────────────────────────────────────────────

  async getSubscriptionSummary(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('사용자를 찾을 수 없습니다');

    const usage = await this.usageService.getUsageStatus(userId);
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const nextMonth = new Date(monthStart);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    let status: string | null = user.subscriptionStatus;
    let renewsAt: string | null = null;
    let endsAt: string | null = null;
    let cancelled = false;
    let updatePaymentMethodUrl: string | null = null;
    let cardBrand: string | null = null;
    let cardLastFour: string | null = null;

    const refunded = user.subscriptionStatus === REFUNDED_STATUS;
    if (user.paddleSubscriptionId && this.apiKey && !refunded) {
      const [subResult, txnResult] = await Promise.allSettled([
        this.paddleRequest<PaddleSubscription>('GET', `/subscriptions/${user.paddleSubscriptionId}`),
        this.paddleRequest<any[]>(
          'GET',
          `/transactions?subscription_id=${user.paddleSubscriptionId}&status=completed&order_by=billed_at[DESC]&per_page=1`,
        ),
      ]);

      if (subResult.status === 'fulfilled' && subResult.value) {
        const sub = subResult.value;
        status = sub.status;
        cancelled = sub.scheduled_change?.action === 'cancel';
        renewsAt = cancelled ? null : (sub.next_billed_at ?? null);
        endsAt = cancelled ? sub.scheduled_change!.effective_at : (sub.canceled_at ?? null);
        updatePaymentMethodUrl = sub.management_urls?.update_payment_method ?? null;
      } else if (subResult.status === 'rejected') {
        this.logger.warn(`Paddle subscription fetch failed: ${subResult.reason}`);
      }

      if (txnResult.status === 'fulfilled') {
        const card = txnResult.value?.[0]?.payments?.[0]?.method_details?.card;
        cardBrand = card?.type ?? null;
        cardLastFour = card?.last4 ?? null;
      }
    }

    return {
      planType: user.planType,
      status,
      cancelled,
      priceMonthly: PLAN_PRICES[user.planType] ?? 0,
      renewsAt,
      endsAt,
      usageResetsAt: nextMonth.toISOString(),
      cardBrand,
      cardLastFour,
      // 결제 수단 변경은 구독의 management_urls 사용, 포털 전체는 /billing/portal 에서 그때그때 발급
      portalUrl: null as string | null,
      updatePaymentMethodUrl,
      hasSubscription: Boolean(user.paddleSubscriptionId) && !refunded,
      usage,
    };
  }

  private async getManageableSubscription(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.paddleSubscriptionId) {
      throw new BadRequestException('활성 구독이 없습니다');
    }
    if (user.subscriptionStatus === REFUNDED_STATUS) {
      throw new BadRequestException('환불된 구독은 변경할 수 없습니다. 새로 구독해 주세요.');
    }
    return user;
  }

  /** 이번 결제 기간이 끝나면 해지 (그때까지 PRO 유지) */
  async cancelSubscription(userId: string) {
    const user = await this.getManageableSubscription(userId);
    const sub = await this.paddleRequest<PaddleSubscription>(
      'POST',
      `/subscriptions/${user.paddleSubscriptionId}/cancel`,
      { effective_from: 'next_billing_period' },
    ).catch(() => {
      throw new BadRequestException('구독 해지에 실패했습니다');
    });
    await this.prisma.user.update({
      where: { id: userId },
      data: { subscriptionStatus: sub.status },
    });
    return this.getSubscriptionSummary(userId);
  }

  /** 해지 예약 취소 (Paddle에서는 scheduled_change 제거) */
  async resumeSubscription(userId: string) {
    const user = await this.getManageableSubscription(userId);
    const sub = await this.paddleRequest<PaddleSubscription>(
      'PATCH',
      `/subscriptions/${user.paddleSubscriptionId}`,
      { scheduled_change: null },
    ).catch(() => {
      throw new BadRequestException('구독 재개에 실패했습니다. 이미 종료된 구독은 새로 구독해 주세요.');
    });
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionStatus: sub.status,
        planType: PRO_STATUSES.has(sub.status) ? 'PRO' : 'FREE',
      },
    });
    return this.getSubscriptionSummary(userId);
  }

  /** Paddle 고객 포털 (영수증·결제 내역). 세션 URL은 일시적이라 요청 시마다 발급 */
  async getPortalUrl(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.paddleCustomerId) {
      throw new BadRequestException('결제 내역이 없습니다');
    }
    const session = await this.paddleRequest<{ urls: { general: { overview: string } } }>(
      'POST',
      `/customers/${user.paddleCustomerId}/portal-sessions`,
      user.paddleSubscriptionId ? { subscription_ids: [user.paddleSubscriptionId] } : {},
    ).catch(() => {
      throw new BadRequestException('결제 포털을 열 수 없습니다');
    });
    return { portalUrl: session.urls.general.overview };
  }
}

export class PaddleApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string | undefined,
    readonly detail: string,
  ) {
    super(`Paddle API error ${status}: ${detail}`);
  }
}
