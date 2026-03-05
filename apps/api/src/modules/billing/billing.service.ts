import {
  Injectable,
  Logger,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import * as crypto from 'crypto';

interface LsWebhookPayload {
  meta: {
    event_name: string;
    custom_data?: { user_id?: string };
  };
  data: {
    id: string;
    type: string;
    attributes: {
      store_id: number;
      customer_id: number;
      variant_id: number;
      status: string;
      urls?: {
        customer_portal?: string;
        update_payment_method?: string;
      };
      [key: string]: any;
    };
  };
}

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);
  private readonly apiKey: string;
  private readonly signingSecret: string;
  private readonly storeId: string;
  private readonly proVariantId: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    this.apiKey = this.config.get<string>('LEMONSQUEEZY_API_KEY', '');
    this.signingSecret = this.config.get<string>('LEMONSQUEEZY_SIGNING_SECRET', '');
    this.storeId = this.config.get<string>('LEMONSQUEEZY_STORE_ID', '');
    this.proVariantId = this.config.get<string>('LEMONSQUEEZY_PRO_VARIANT_ID', '');
  }

  async createCheckout(userId: string) {
    if (!this.apiKey || !this.storeId || !this.proVariantId) {
      throw new BadRequestException('결제 시스템이 아직 설정되지 않았습니다');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('사용자를 찾을 수 없습니다');
    if (user.planType === 'PRO') throw new ForbiddenException('이미 PRO 플랜을 사용 중입니다');

    const response = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        data: {
          type: 'checkouts',
          attributes: {
            checkout_data: {
              email: user.email,
              name: user.name ?? undefined,
              custom: { user_id: userId },
            },
          },
          relationships: {
            store: { data: { type: 'stores', id: this.storeId } },
            variant: { data: { type: 'variants', id: this.proVariantId } },
          },
        },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      this.logger.error('Lemon Squeezy checkout creation failed', err);
      throw new BadRequestException('체크아웃 생성에 실패했습니다');
    }

    const result: any = await response.json();
    return { checkoutUrl: result.data.attributes.url as string };
  }

  verifySignature(rawBody: Buffer, signature: string): boolean {
    if (!this.signingSecret) return false;
    const hmac = crypto.createHmac('sha256', this.signingSecret);
    const digest = hmac.update(rawBody).digest('hex');
    return crypto.timingSafeEqual(
      Buffer.from(digest),
      Buffer.from(signature),
    );
  }

  async handleWebhook(rawBody: Buffer, signature: string) {
    this.logger.log('Webhook received, signature present: ' + !!signature);

    if (!this.verifySignature(rawBody, signature)) {
      this.logger.warn('Invalid webhook signature - check LEMONSQUEEZY_SIGNING_SECRET');
      throw new BadRequestException('유효하지 않은 서명입니다');
    }

    const payload: LsWebhookPayload = JSON.parse(rawBody.toString());
    const eventName = payload.meta.event_name;
    const customData = payload.meta.custom_data;
    const userId = customData?.user_id ? String(customData.user_id) : undefined;

    this.logger.log(`Webhook: ${eventName}, custom_data: ${JSON.stringify(customData)}`);

    if (!userId) {
      this.logger.warn('Webhook missing user_id in custom_data - skipping');
      return { received: true };
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      this.logger.warn(`User not found: ${userId}`);
      return { received: true };
    }

    const attrs = payload.data?.attributes ?? {};
    const subscriptionId = String(payload.data?.id ?? '');
    const customerId = String(attrs.customer_id ?? '');

    switch (eventName) {
      case 'order_created':
      case 'subscription_created':
      case 'subscription_updated': {
        const isActive =
          eventName === 'order_created' ||
          attrs.status === 'active' ||
          attrs.status === 'on_trial';
        await this.prisma.user.update({
          where: { id: userId },
          data: {
            planType: isActive ? 'PRO' : user.planType,
            lsCustomerId: customerId || user.lsCustomerId,
            lsSubscriptionId: subscriptionId || user.lsSubscriptionId,
            subscriptionStatus: attrs.status ?? user.subscriptionStatus,
          },
        });
        this.logger.log(`User ${userId} plan updated to PRO (event: ${eventName})`);
        break;
      }
      case 'subscription_cancelled':
      case 'subscription_expired': {
        await this.prisma.user.update({
          where: { id: userId },
          data: {
            planType: 'FREE',
            subscriptionStatus: attrs.status,
          },
        });
        this.logger.log(`User ${userId} subscription ${eventName}, downgraded to FREE`);
        break;
      }
      default:
        this.logger.log(`Unhandled event: ${eventName}`);
    }

    return { received: true };
  }

  async getPortalUrl(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.lsSubscriptionId) {
      throw new BadRequestException('활성 구독이 없습니다');
    }

    const response = await fetch(
      `https://api.lemonsqueezy.com/v1/subscriptions/${user.lsSubscriptionId}`,
      {
        headers: {
          'Accept': 'application/vnd.api+json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
      },
    );

    if (!response.ok) {
      throw new BadRequestException('구독 정보를 불러올 수 없습니다');
    }

    const result: any = await response.json();
    const portalUrl = result.data.attributes.urls?.customer_portal as string | undefined;

    if (!portalUrl) {
      throw new BadRequestException('포털 URL을 찾을 수 없습니다');
    }

    return { portalUrl };
  }
}
