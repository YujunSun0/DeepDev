import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
  CurrentUser,
  CurrentUserPayload,
} from '../../common/decorators/current-user.decorator';
import { MasteryService } from './mastery.service';

@Controller('mastery')
@UseGuards(JwtAuthGuard)
export class MasteryController {
  constructor(private readonly masteryService: MasteryService) {}

  @Get()
  getMasteries(@CurrentUser() user: CurrentUserPayload) {
    return this.masteryService.getUserMasteries(user.id);
  }

  @Get('weak')
  getWeakConcepts(@CurrentUser() user: CurrentUserPayload) {
    return this.masteryService.getWeakConcepts(user.id);
  }

  @Get('gsi')
  async getGlobalSkillIndex(@CurrentUser() user: CurrentUserPayload) {
    const gsi = await this.masteryService.getGlobalSkillIndex(user.id);
    return { globalSkillIndex: gsi };
  }
}
