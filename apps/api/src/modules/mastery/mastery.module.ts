import { Module } from '@nestjs/common';
import { MasteryService } from './mastery.service';
import { MasteryController } from './mastery.controller';

@Module({
  controllers: [MasteryController],
  providers: [MasteryService],
  exports: [MasteryService],
})
export class MasteryModule {}
