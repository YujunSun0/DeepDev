import { Module } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { SessionsController } from './sessions.controller';
import { ConceptsModule } from '../concepts/concepts.module';
import { MasteryModule } from '../mastery/mastery.module';
import { UsageModule } from '../usage/usage.module';
import { UsersModule } from '../users/users.module';
import { LlmModule } from '../../llm/llm.module';

@Module({
  imports: [ConceptsModule, MasteryModule, UsageModule, UsersModule, LlmModule],
  controllers: [SessionsController],
  providers: [SessionsService],
  exports: [SessionsService],
})
export class SessionsModule {}
