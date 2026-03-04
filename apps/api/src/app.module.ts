import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ConceptsModule } from './modules/concepts/concepts.module';
import { SessionsModule } from './modules/sessions/sessions.module';
import { MasteryModule } from './modules/mastery/mastery.module';
import { ExplorationsModule } from './modules/explorations/explorations.module';
import { UsageModule } from './modules/usage/usage.module';
import { BillingModule } from './modules/billing/billing.module';
import { HealthModule } from './modules/health/health.module';
import { LlmModule } from './llm/llm.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
      ignoreEnvFile: process.env.NODE_ENV === 'production',
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ConceptsModule,
    SessionsModule,
    MasteryModule,
    ExplorationsModule,
    UsageModule,
    BillingModule,
    HealthModule,
    LlmModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
