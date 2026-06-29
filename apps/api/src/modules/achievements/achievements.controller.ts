import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
  CurrentUser,
  CurrentUserPayload,
} from '../../common/decorators/current-user.decorator';
import { AchievementsService } from './achievements.service';

@Controller('achievements')
@UseGuards(JwtAuthGuard)
export class AchievementsController {
  constructor(private readonly achievementsService: AchievementsService) {}

  @Get()
  getDefinitions() {
    return this.achievementsService.getDefinitions();
  }

  @Get('me')
  getMyAchievements(@CurrentUser() user: CurrentUserPayload) {
    return this.achievementsService.getForUser(user.id);
  }

  @Post('check')
  check(@CurrentUser() user: CurrentUserPayload) {
    return this.achievementsService.checkOnLogin(user.id);
  }
}
