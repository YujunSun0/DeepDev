import {
  Controller,
  Post,
  Get,
  Req,
  Headers,
  UseGuards,
  RawBodyRequest,
  Logger,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { Request } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import { BillingService } from './billing.service';

@Controller('billing')
export class BillingController {
  private readonly logger = new Logger(BillingController.name);

  constructor(private readonly billingService: BillingService) {}

  @Get('status')
  getCheckoutStatus() {
    return { checkoutEnabled: this.billingService.isCheckoutEnabled() };
  }

  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  createCheckout(@CurrentUser() user: CurrentUserPayload) {
    return this.billingService.createCheckout(user.id);
  }

  @Post('webhook')
  @SkipThrottle()
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-signature') signature: string,
  ) {
    const rawBody = req.rawBody;
    if (!rawBody) {
      return { error: 'No raw body - ensure rawBody is enabled for webhook route' };
    }
    try {
      return await this.billingService.handleWebhook(rawBody, signature ?? '');
    } catch (e) {
      this.logger.error('Webhook error', e);
      throw e;
    }
  }

  @Get('portal')
  @UseGuards(JwtAuthGuard)
  getPortalUrl(@CurrentUser() user: CurrentUserPayload) {
    return this.billingService.getPortalUrl(user.id);
  }
}
