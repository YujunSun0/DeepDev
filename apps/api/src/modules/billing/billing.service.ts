import {
  Injectable,
  Logger,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { UsageService } from '../usage/usage.service';
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

const PLAN_PRICES: Record<string, number> = {
  FREE: 0,
  PRO: 29_000,
  MASTER: 59_000,
};

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);
  private readonly apiKey: string;
  private readonly signingSecret: string;
  private readonly storeId: string;
  private readonly proVariantId: string;
  private readonly frontendUrl: string;

  private readonly checkoutEnabled: boolean;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly usageService: UsageService,
  ) {
    this.apiKey = this.config.get<string>('LEMONSQUEEZY_API_KEY', '');
    this.signingSecret = this.config.get<string>('LEMONSQUEEZY_SIGNING_SECRET', '');
    this.storeId = this.config.get<string>('LEMONSQUEEZY_STORE_ID', '');
    this.proVariantId = this.config.get<string>('LEMONSQUEEZY_PRO_VARIANT_ID', '');
    this.checkoutEnabled = this.config.get<string>('BILLING_CHECKOUT_ENABLED', 'true') === 'true';
    this.frontendUrl =
      this.config.get<string>('FRONTEND_URL') ||
      this.config.get<string>('SITE_URL') ||
      'http://localhost:3000';
  }

  isCheckoutEnabled(): boolean {
    return this.checkoutEnabled;
  }

  async createCheckout(userId: string) {
    if (!this.checkoutEnabled) {
      throw new BadRequestException('결제가 준비 중입니다. 곧 이용 가능합니다.');
    }
    if (!this.apiKey || !this.storeId || !this.proVariantId) {
      throw new BadRequestException('결제 시스템이 아직 설정되지 않았습니다');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('사용자를 찾을 수 없습니다');
    if (user.planType === 'PRO') throw new ForbiddenException('이미 PRO 플랜을 사용 중입니다');

    const redirectUrl = `${this.frontendUrl.replace(/\/$/, '')}/billing?checkout=success`;

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
            product_options: {
              redirect_url: redirectUrl,
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
      const errText = await response.text();
      this.logger.error(
        `Lemon Squeezy checkout creation failed (${response.status}): ${errText}`,
      );

      let detail = '';
      try {
        const parsed = JSON.parse(errText) as {
          errors?: Array<{ detail?: string; title?: string; status?: string }>;
        };
        detail = parsed.errors
          ?.map((e) => e.detail || e.title)
          .filter(Boolean)
          .join('; ') ?? '';
      } catch {
        detail = errText.slice(0, 300);
      }

      throw new BadRequestException(
        detail
          ? `체크아웃 생성에 실패했습니다: ${detail}`
          : '체크아웃 생성에 실패했습니다',
      );
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
    const resourceId = String(payload.data?.id ?? '');
    const customerId = String(attrs.customer_id ?? '');

    switch (eventName) {
      case 'order_created': {
        await this.prisma.user.update({
          where: { id: userId },
          data: {
            planType: 'PRO',
            lsCustomerId: customerId || user.lsCustomerId,
            subscriptionStatus: attrs.status ?? 'paid',
          },
        });
        this.logger.log(`User ${userId} plan updated to PRO (event: ${eventName})`);
        break;
      }
      case 'subscription_created':
      case 'subscription_updated': {
        const status = attrs.status as string | undefined;
        const keepPro =
          status === 'active' ||
          status === 'on_trial' ||
          status === 'paused' ||
          status === 'past_due' ||
          status === 'cancelled' ||
          status === 'canceled';

        await this.prisma.user.update({
          where: { id: userId },
          data: {
            planType: status === 'expired' ? 'FREE' : keepPro ? 'PRO' : user.planType,
            lsCustomerId: customerId || user.lsCustomerId,
            lsSubscriptionId: resourceId || user.lsSubscriptionId,
            subscriptionStatus: status ?? user.subscriptionStatus,
          },
        });
        this.logger.log(
          `User ${userId} subscription synced (event: ${eventName}, status: ${status})`,
        );
        break;
      }
      case 'subscription_cancelled': {
        // 기간 종료까지 PRO 유지, 상태만 표시
        await this.prisma.user.update({
          where: { id: userId },
          data: {
            subscriptionStatus: attrs.status ?? 'cancelled',
            lsSubscriptionId: resourceId || user.lsSubscriptionId,
          },
        });
        this.logger.log(`User ${userId} subscription cancelled (keeps plan until period end)`);
        break;
      }
      case 'subscription_expired': {
        await this.prisma.user.update({
          where: { id: userId },
          data: {
            planType: 'FREE',
            subscriptionStatus: attrs.status,
          },
        });
        this.logger.log(`User ${userId} subscription expired, downgraded to FREE`);
        break;
      }
      default:
        this.logger.log(`Unhandled event: ${eventName}`);
    }

    return { received: true };
  }

  async getSubscriptionSummary(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('사용자를 찾을 수 없습니다');

    const usage = await this.usageService.getUsageStatus(userId);
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const nextMonth = new Date(monthStart);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    let renewsAt: string | null = null;
    let endsAt: string | null = null;
    let portalUrl: string | null = null;
    let updatePaymentMethodUrl: string | null = null;
    let cardBrand: string | null = null;
    let cardLastFour: string | null = null;
    let lsStatus: string | null = user.subscriptionStatus;
    let cancelled = false;

    if (user.lsSubscriptionId && this.apiKey) {
      try {
        const response = await fetch(
          `https://api.lemonsqueezy.com/v1/subscriptions/${user.lsSubscriptionId}`,
          {
            headers: {
              'Accept': 'application/vnd.api+json',
              'Authorization': `Bearer ${this.apiKey}`,
            },
          },
        );
        if (response.ok) {
          const result: any = await response.json();
          const attrs = result.data?.attributes ?? {};
          renewsAt = attrs.renews_at ?? null;
          endsAt = attrs.ends_at ?? null;
          lsStatus = attrs.status ?? lsStatus;
          cancelled = Boolean(attrs.cancelled) || lsStatus === 'cancelled' || lsStatus === 'canceled';
          portalUrl = attrs.urls?.customer_portal ?? null;
          updatePaymentMethodUrl = attrs.urls?.update_payment_method ?? null;
          cardBrand = attrs.card_brand ?? null;
          cardLastFour = attrs.card_last_four ?? null;

          if (lsStatus && lsStatus !== user.subscriptionStatus) {
            await this.prisma.user.update({
              where: { id: userId },
              data: { subscriptionStatus: lsStatus },
            });
          }
        } else {
          this.logger.warn(
            `Failed to fetch LS subscription ${user.lsSubscriptionId}: ${response.status}`,
          );
        }
      } catch (err) {
        this.logger.warn('Lemon Squeezy subscription fetch failed', err);
      }
    }

    return {
      planType: user.planType,
      status: lsStatus,
      cancelled,
      priceMonthly: PLAN_PRICES[user.planType] ?? 0,
      renewsAt,
      endsAt,
      usageResetsAt: nextMonth.toISOString(),
      cardBrand,
      cardLastFour,
      portalUrl,
      updatePaymentMethodUrl,
      hasSubscription: Boolean(user.lsSubscriptionId),
      usage,
    };
  }

  private async updateSubscriptionCancelled(userId: string, cancelled: boolean) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.lsSubscriptionId) {
      throw new BadRequestException('활성 구독이 없습니다');
    }
    if (!this.apiKey) {
      throw new BadRequestException('결제 시스템이 아직 설정되지 않았습니다');
    }

    const response = await fetch(
      `https://api.lemonsqueezy.com/v1/subscriptions/${user.lsSubscriptionId}`,
      {
        method: 'PATCH',
        headers: {
          'Accept': 'application/vnd.api+json',
          'Content-Type': 'application/vnd.api+json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          data: {
            type: 'subscriptions',
            id: user.lsSubscriptionId,
            attributes: { cancelled },
          },
        }),
      },
    );

    if (!response.ok) {
      const errText = await response.text();
      this.logger.error(
        `Lemon Squeezy subscription ${cancelled ? 'cancel' : 'resume'} failed: ${errText}`,
      );
      throw new BadRequestException(
        cancelled ? '구독 해지에 실패했습니다' : '구독 재개에 실패했습니다',
      );
    }

    const result: any = await response.json();
    const attrs = result.data?.attributes ?? {};

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionStatus: attrs.status ?? (cancelled ? 'cancelled' : 'active'),
        // 기간 종료 전까지는 PRO 유지
        planType: attrs.status === 'expired' ? 'FREE' : 'PRO',
      },
    });

    return this.getSubscriptionSummary(userId);
  }

  async cancelSubscription(userId: string) {
    return this.updateSubscriptionCancelled(userId, true);
  }

  async resumeSubscription(userId: string) {
    return this.updateSubscriptionCancelled(userId, false);
  }

  async getPortalUrl(userId: string) {
    const summary = await this.getSubscriptionSummary(userId);
    if (!summary.portalUrl) {
      throw new BadRequestException('활성 구독이 없거나 포털을 열 수 없습니다');
    }
    return { portalUrl: summary.portalUrl };
  }
}
