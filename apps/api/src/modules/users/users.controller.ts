import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
  CurrentUser,
  CurrentUserPayload,
} from '../../common/decorators/current-user.decorator';
import { UsersService } from './users.service';

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
      createdAt: fullUser!.createdAt,
    };
  }
}
