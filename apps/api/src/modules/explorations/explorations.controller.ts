import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
  CurrentUser,
  CurrentUserPayload,
} from '../../common/decorators/current-user.decorator';
import { ExplorationsService } from './explorations.service';
import { CreateExplorationDto, SendMessageDto } from './dto';

@Controller('explorations')
@UseGuards(JwtAuthGuard)
export class ExplorationsController {
  constructor(private readonly explorationsService: ExplorationsService) {}

  @Post()
  create(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreateExplorationDto,
  ) {
    return this.explorationsService.create(user.id, dto.conceptId, dto.message);
  }

  @Get()
  findAll(@CurrentUser() user: CurrentUserPayload) {
    return this.explorationsService.findByUser(user.id);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.explorationsService.findById(id, user.id);
  }

  @Post(':id/message')
  sendMessage(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: SendMessageDto,
  ) {
    return this.explorationsService.sendMessage(id, user.id, dto.message);
  }
}
