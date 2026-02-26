import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ConceptsModule } from './modules/concepts/concepts.module';
import { SessionsModule } from './modules/sessions/sessions.module';
import { MasteryModule } from './modules/mastery/mastery.module';
import { ExplorationsModule } from './modules/explorations/explorations.module';
import { UsageModule } from './modules/usage/usage.module';
import { LlmModule } from './llm/llm.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ConceptsModule,
    SessionsModule,
    MasteryModule,
    ExplorationsModule,
    UsageModule,
    LlmModule,
  ],
})
export class AppModule {}
