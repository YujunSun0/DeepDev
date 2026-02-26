import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { getPlanLimit, type PlanLimit } from './plan-limits';

export interface UsageStatus {
  plan: string;
  limits: PlanLimit;
  month: {
    sessions: number;
    tokens: number;
    explorations: number;
  };
  percent: {
    sessions: number;
    tokens: number;
    explorations: number;
  };
  warning: boolean;
  exceeded: boolean;
}

function getMonthStart(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

@Injectable()
export class UsageService {
  constructor(private readonly prisma: PrismaService) {}

  async getUsageStatus(userId: string): Promise<UsageStatus> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const planType = user?.planType ?? 'FREE';
    const limits = getPlanLimit(planType);
    const monthStart = getMonthStart();

    const [sessionsCount, sessionTokens, explorationsCount, explorationTokens] =
      await Promise.all([
        this.prisma.session.count({
          where: { userId, createdAt: { gte: monthStart } },
        }),
        this.prisma.session.aggregate({
          where: { userId, createdAt: { gte: monthStart } },
          _sum: { tokenUsed: true },
        }),
        this.prisma.exploration.count({
          where: { userId, createdAt: { gte: monthStart } },
        }),
        this.prisma.exploration.aggregate({
          where: { userId, createdAt: { gte: monthStart } },
          _sum: { tokenUsed: true },
        }),
      ]);

    const monthTokens =
      (sessionTokens._sum.tokenUsed ?? 0) +
      (explorationTokens._sum.tokenUsed ?? 0);

    const pct = (used: number, limit: number) =>
      limit === Infinity ? 0 : Math.round((used / limit) * 100);

    const sessionPercent = pct(sessionsCount, limits.monthlySessions);
    const tokenPercent = pct(monthTokens, limits.monthlyTokens);
    const explorationPercent = pct(explorationsCount, limits.monthlyExplorations);

    const maxPercent = Math.max(sessionPercent, tokenPercent, explorationPercent);

    return {
      plan: planType,
      limits,
      month: {
        sessions: sessionsCount,
        tokens: monthTokens,
        explorations: explorationsCount,
      },
      percent: {
        sessions: sessionPercent,
        tokens: tokenPercent,
        explorations: explorationPercent,
      },
      warning: maxPercent >= 80,
      exceeded: maxPercent >= 100,
    };
  }

  async canCreateSession(userId: string): Promise<{ allowed: boolean; reason?: string }> {
    const status = await this.getUsageStatus(userId);

    if (status.month.sessions >= status.limits.monthlySessions) {
      return { allowed: false, reason: `월 세션 한도(${status.limits.monthlySessions}회)에 도달했습니다. 플랜을 업그레이드해보세요.` };
    }
    if (status.month.tokens >= status.limits.monthlyTokens) {
      return { allowed: false, reason: '월 토큰 한도에 도달했습니다. 플랜을 업그레이드해보세요.' };
    }

    return { allowed: true };
  }

  async canUseExploration(userId: string): Promise<{ allowed: boolean; reason?: string }> {
    const status = await this.getUsageStatus(userId);

    if (status.month.tokens >= status.limits.monthlyTokens) {
      return { allowed: false, reason: '월 토큰 한도에 도달했습니다. 플랜을 업그레이드해보세요.' };
    }

    return { allowed: true };
  }

  async canCreateExploration(userId: string): Promise<{ allowed: boolean; reason?: string }> {
    const status = await this.getUsageStatus(userId);

    if (status.month.explorations >= status.limits.monthlyExplorations) {
      return { allowed: false, reason: `월 탐구 대화 한도(${status.limits.monthlyExplorations}개)에 도달했습니다. 플랜을 업그레이드해보세요.` };
    }
    if (status.month.tokens >= status.limits.monthlyTokens) {
      return { allowed: false, reason: '월 토큰 한도에 도달했습니다. 플랜을 업그레이드해보세요.' };
    }

    return { allowed: true };
  }
}
