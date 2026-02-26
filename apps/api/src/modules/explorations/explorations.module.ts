import { Module } from '@nestjs/common';
import { ExplorationsService } from './explorations.service';
import { ExplorationsController } from './explorations.controller';
import { LlmModule } from '../../llm/llm.module';
import { UsageModule } from '../usage/usage.module';

@Module({
  imports: [LlmModule, UsageModule],
  controllers: [ExplorationsController],
  providers: [ExplorationsService],
  exports: [ExplorationsService],
})
export class ExplorationsModule {}
