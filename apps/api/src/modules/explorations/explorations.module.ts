import { Module } from '@nestjs/common';
import { ExplorationsService } from './explorations.service';
import { ExplorationsController } from './explorations.controller';
import { LlmModule } from '../../llm/llm.module';

@Module({
  imports: [LlmModule],
  controllers: [ExplorationsController],
  providers: [ExplorationsService],
  exports: [ExplorationsService],
})
export class ExplorationsModule {}
