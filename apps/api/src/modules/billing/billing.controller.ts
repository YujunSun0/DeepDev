import {
  Controller,
  Post,
  Get,
  Req,
  Headers,
  UseGuards,
  RawBodyRequest,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import { BillingService } from './billing.service';

@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  createCheckout(@CurrentUser() user: CurrentUserPayload) {
    return this.billingService.createCheckout(user.id);
  }

  @Post('webhook')
  handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-signature') signature: string,
  ) {
    const rawBody = req.rawBody;
    if (!rawBody) {
      return { error: 'No raw body' };
    }
    return this.billingService.handleWebhook(rawBody, signature ?? '');
  }

  @Get('portal')
  @UseGuards(JwtAuthGuard)
  getPortalUrl(@CurrentUser() user: CurrentUserPayload) {
    return this.billingService.getPortalUrl(user.id);
  }
}
