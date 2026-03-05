import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
  CurrentUser,
  CurrentUserPayload,
} from '../../common/decorators/current-user.decorator';
import { SessionsService } from './sessions.service';
import { CreateSessionRequestDto, SubmitAnswerRequestDto, DiscussRequestDto } from './dto';

@Controller('sessions')
@UseGuards(JwtAuthGuard)
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post()
  create(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreateSessionRequestDto,
  ) {
    return this.sessionsService.create(user.id, dto.conceptId, dto.level);
  }

  @Get()
  findAll(
    @CurrentUser() user: CurrentUserPayload,
    @Query('state') state?: string,
    @Query('domain') domain?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.sessionsService.findByUser(user.id, {
      state,
      domain,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sessionsService.findById(id);
  }

  /* ── Session Flow ── */

  @Post(':id/start')
  startSession(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.sessionsService.startSession(id, user.id);
  }

  @Post(':id/objective')
  getObjectiveQuestion(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.sessionsService.getObjectiveQuestion(id, user.id);
  }

  @Post(':id/objective/answer')
  submitObjectiveAnswer(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: SubmitAnswerRequestDto,
  ) {
    return this.sessionsService.submitObjectiveAnswer(id, user.id, dto.answer);
  }

  @Post(':id/subjective')
  getSubjectiveQuestion(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.sessionsService.getSubjectiveQuestion(id, user.id);
  }

  @Post(':id/subjective/answer')
  submitSubjectiveAnswer(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: SubmitAnswerRequestDto,
  ) {
    return this.sessionsService.submitSubjectiveAnswer(id, user.id, dto.answer);
  }

  @Post(':id/application')
  getApplicationQuestion(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.sessionsService.getApplicationQuestion(id, user.id);
  }

  @Post(':id/application/answer')
  submitApplicationAnswer(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: SubmitAnswerRequestDto,
  ) {
    return this.sessionsService.submitApplicationAnswer(id, user.id, dto.answer);
  }

  @Post(':id/summary')
  getSessionSummary(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.sessionsService.getSessionSummary(id, user.id);
  }

  @Post(':id/discuss')
  discuss(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: DiscussRequestDto,
  ) {
    return this.sessionsService.discuss(id, user.id, dto.stepType, dto.message);
  }

  @Post(':id/re-evaluate')
  reEvaluate(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
    @Body('stepType') stepType: 'subjective' | 'application',
  ) {
    return this.sessionsService.reEvaluate(id, user.id, stepType);
  }
}
