import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
  CurrentUser,
  CurrentUserPayload,
} from '../../common/decorators/current-user.decorator';
import { UsersService } from './users.service';
import { PatchMeDto } from './dto/patch-me.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getMe(@CurrentUser() user: CurrentUserPayload) {
    const fullUser = await this.usersService.findById(user.id);
    return {
      id: fullUser!.id,
      email: fullUser!.email,
      name: fullUser!.name,
      planType: fullUser!.planType,
      preferredLanguage: fullUser!.preferredLanguage,
      createdAt: fullUser!.createdAt,
    };
  }

  @Patch('me')
  async patchMe(@CurrentUser() user: CurrentUserPayload, @Body() dto: PatchMeDto) {
    const updated = await this.usersService.updateProfile(user.id, {
      name: dto.name,
      preferredLanguage: dto.preferredLanguage,
    });
    return {
      id: updated.id,
      email: updated.email,
      name: updated.name,
      planType: updated.planType,
      preferredLanguage: updated.preferredLanguage,
      createdAt: updated.createdAt,
    };
  }
}
