import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

interface UserStats {
  streak: number;
  totalSessions: number;
  maxScore: number;
  conceptMasteredCount: number;
  domainCount: number;
  todaySessions: number;
  perfectScoreCount: number;
  earlyBirdCount: number;
  explorationTurns: number;
  conceptCount: number;
}

@Injectable()
export class AchievementsService {
  constructor(private readonly prisma: PrismaService) {}

  /** GET /achievements - 업적 정의 목록 */
  async getDefinitions() {
    return this.prisma.achievement.findMany({
      orderBy: { sortOrder: 'asc' },
    });
  }

  /** GET /achievements/me - 내 업적 달성 현황 + 진행률 */
  async getForUser(userId: string) {
    const [achievements, userAchievements, stats] = await Promise.all([
      this.prisma.achievement.findMany({ orderBy: { sortOrder: 'asc' } }),
      this.prisma.userAchievement.findMany({
        where: { userId },
        select: { achievementId: true, value: true, achievedAt: true },
      }),
      this.computeStats(userId),
    ]);

    const unlockedMap = new Map(
      userAchievements.map((ua) => [
        ua.achievementId,
        { value: ua.value, achievedAt: ua.achievedAt },
      ]),
    );

    const records = achievements
      .filter((a) => a.category === 'record')
      .map((a) => ({
        id: a.id,
        code: a.code,
        name: a.name,
        description: a.description,
        icon: a.icon,
        category: a.category,
        currentValue: this.getRecordValue(a.code, stats),
        achievedAt: this.getRecordAchievedAt(a.code, stats),
      }));

    const awards = achievements
      .filter((a) => a.category === 'award')
      .map((a) => {
        const ua = unlockedMap.get(a.id);
        const progress = this.getAwardProgress(a, stats);
        return {
          id: a.id,
          code: a.code,
          name: a.name,
          description: a.description,
          icon: a.icon,
          category: a.category,
          targetValue: a.targetValue,
          tier: a.tier,
          unlocked: !!ua,
          value: ua?.value ?? 0,
          achievedAt: ua?.achievedAt ?? null,
          progress,
        };
      });

    return { records, awards };
  }

  async checkAndAward(userId: string) {
    const stats = await this.computeStats(userId);
    const achievements = await this.prisma.achievement.findMany({
      where: { category: 'award' },
      orderBy: { sortOrder: 'asc' },
    });
    const existing = await this.prisma.userAchievement.findMany({
      where: { userId },
      select: { achievementId: true },
    });
    const unlockedIds = new Set(existing.map((e) => e.achievementId));

    const toAward: { achievementId: string; value: number }[] = [];
    for (const a of achievements) {
      if (unlockedIds.has(a.id)) continue;
      const { met, value } = this.checkAwardRequirement(a, stats);
      if (met) {
        toAward.push({ achievementId: a.id, value });
        unlockedIds.add(a.id);
      }
    }

    const awardedNames: string[] = [];
    if (toAward.length > 0) {
      await this.prisma.userAchievement.createMany({
        data: toAward.map(({ achievementId, value }) => ({
          userId,
          achievementId,
          value,
        })),
      });
      const awardedAchievements = achievements.filter((a) =>
        toAward.some((t) => t.achievementId === a.id),
      );
      awardedNames.push(...awardedAchievements.map((a) => a.description));
    }
    return { awarded: toAward.length, achievementNames: awardedNames };
  }

  /** 진행률 알림: 달성은 아니지만 조건 부합 시 (연속 학습왕, 새벽형, 빠른 학습자) */
  async getProgressNotification(
    userId: string,
    lastSessionCreatedAt: Date,
  ): Promise<{
    code: string;
    name: string;
    description: string;
    icon: string | null;
    current: number;
    target: number;
    message: string;
  } | null> {
    const stats = await this.computeStats(userId);
    const achievements = await this.prisma.achievement.findMany({
      where: { category: 'award' },
      orderBy: { sortOrder: 'asc' },
    });
    const unlocked = await this.prisma.userAchievement.findMany({
      where: { userId },
      select: { achievementId: true },
    });
    const unlockedIds = new Set(unlocked.map((u) => u.achievementId));
    const unlockedCodes = new Set(
      achievements.filter((a) => unlockedIds.has(a.id)).map((a) => a.code),
    );

    const STREAK_TARGETS = [3, 7, 14, 30];
    const STREAK_CODES = ['STREAK_3', 'STREAK_7', 'STREAK_14', 'STREAK_30'];

    if (stats.streak >= 1) {
      const nextTarget = STREAK_TARGETS.find((t) => stats.streak < t);
      if (nextTarget != null) {
        const idx = STREAK_TARGETS.indexOf(nextTarget);
        const a = achievements.find((x) => x.code === STREAK_CODES[idx]);
        if (a) {
          return {
            code: a.code,
            name: a.name,
            description: a.description,
            icon: a.icon,
            current: stats.streak,
            target: nextTarget,
            message: `${stats.streak}일 연속 학습 완료! (목표 ${nextTarget}일)`,
          };
        }
      }
    }

    const h = lastSessionCreatedAt.getHours();
    if (h >= 5 && h < 7 && stats.earlyBirdCount >= 1) {
      const nextTarget = stats.earlyBirdCount < 5 ? 5 : stats.earlyBirdCount < 20 ? 20 : null;
      if (nextTarget != null && !unlockedCodes.has(nextTarget === 5 ? 'EARLY_BIRD_5' : 'EARLY_BIRD_20')) {
        const a = achievements.find((x) => x.code === (nextTarget === 5 ? 'EARLY_BIRD_5' : 'EARLY_BIRD_20'));
        if (a) {
          return {
            code: a.code,
            name: a.name,
            description: a.description,
            icon: a.icon,
            current: stats.earlyBirdCount,
            target: nextTarget,
            message: `새벽 학습 ${stats.earlyBirdCount}회 완료! (목표 ${nextTarget}회)`,
          };
        }
      }
    }

    if (stats.todaySessions >= 1 && stats.todaySessions < 3 && !unlockedCodes.has('SPEED_LEARNER_3')) {
      const a = achievements.find((x) => x.code === 'SPEED_LEARNER_3');
      if (a) {
        return {
          code: a.code,
          name: a.name,
          description: a.description,
          icon: a.icon,
          current: stats.todaySessions,
          target: 3,
          message: `오늘 ${stats.todaySessions}세션 완료! (목표 3세션)`,
        };
      }
    }

    return null;
  }

  private async computeStats(userId: string): Promise<UserStats> {
    const [sessions, masteries, explorations] = await Promise.all([
      this.prisma.session.findMany({
        where: { userId, state: 'CLOSED' },
        include: { concept: { select: { domain: true } } },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.userMastery.findMany({
        where: { userId },
        select: { masteryScore: true },
      }),
      this.prisma.exploration.findMany({
        where: { userId },
        select: { messages: true },
      }),
    ]);

    const dates = new Set(
      sessions.map((s) => {
        const d = new Date(s.createdAt);
        return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      }),
    );

    const today = new Date();
    const todayKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
    let streak = 0;
    if (dates.has(todayKey)) {
      let check = new Date(today);
      for (let i = 0; i < 365; i++) {
        const key = `${check.getFullYear()}-${check.getMonth()}-${check.getDate()}`;
        if (dates.has(key)) {
          streak++;
          check.setDate(check.getDate() - 1);
        } else break;
      }
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todaySessions = sessions.filter(
      (s) => new Date(s.createdAt) >= todayStart,
    ).length;

    const scores = sessions.map((s) => s.score).filter((x): x is number => x != null);
    const maxScore = scores.length > 0 ? Math.max(...scores) : 0;

    const conceptMasteredCount = masteries.filter((m) => m.masteryScore >= 80).length;

    const domains = new Set(sessions.map((s) => s.concept.domain));
    const domainCount = domains.size;

    const perfectScoreCount = sessions.filter(
      (s) => s.score != null && s.score >= 100,
    ).length;

    let earlyBirdCount = 0;
    for (const s of sessions) {
      const h = new Date(s.createdAt).getHours();
      if (h >= 5 && h < 7) earlyBirdCount++;
    }

    let explorationTurns = 0;
    for (const e of explorations) {
      const msgs = (e.messages as unknown[]) ?? [];
      explorationTurns += Math.floor(msgs.length / 2);
    }

    const concepts = new Set(sessions.map((s) => s.conceptId));
    const conceptCount = concepts.size;

    return {
      streak,
      totalSessions: sessions.length,
      maxScore,
      conceptMasteredCount,
      domainCount,
      todaySessions,
      perfectScoreCount,
      earlyBirdCount,
      explorationTurns,
      conceptCount,
    };
  }

  private getRecordValue(code: string, stats: UserStats): number {
    switch (code) {
      case 'STREAK_MAX':
        return stats.streak;
      case 'SESSION_TOTAL':
        return stats.totalSessions;
      case 'SCORE_MAX':
        return Math.round(stats.maxScore * 10) / 10;
      case 'CONCEPT_MASTERED':
        return stats.conceptMasteredCount;
      case 'DOMAIN_EXPLORER':
        return stats.domainCount;
      default:
        return 0;
    }
  }

  private getRecordAchievedAt(code: string, stats: UserStats): string | null {
    if (this.getRecordValue(code, stats) === 0) return null;
    return new Date().toISOString();
  }

  private getAwardProgress(
    a: { code: string; targetValue: number },
    stats: UserStats,
  ) {
    let current = 0;
    switch (a.code) {
      case 'STREAK_3':
      case 'STREAK_7':
      case 'STREAK_14':
      case 'STREAK_30':
        current = stats.streak;
        break;
      case 'SESSION_5':
      case 'SESSION_10':
      case 'SESSION_25':
      case 'SESSION_50':
      case 'SESSION_100':
        current = stats.totalSessions;
        break;
      case 'PERFECT_1':
      case 'PERFECT_5':
      case 'PERFECT_10':
        current = stats.perfectScoreCount;
        break;
      case 'EARLY_BIRD_5':
      case 'EARLY_BIRD_20':
        current = stats.earlyBirdCount;
        break;
      case 'EXPLORER_3':
      case 'EXPLORER_10':
      case 'EXPLORER_30':
        current = stats.explorationTurns;
        break;
      case 'CONCEPT_COLLECTOR_5':
      case 'CONCEPT_COLLECTOR_15':
      case 'CONCEPT_COLLECTOR_30':
        current = stats.conceptCount;
        break;
      case 'ALL_ROUNDER_4':
        current = stats.domainCount;
        break;
      case 'SPEED_LEARNER_3':
        current = stats.todaySessions;
        break;
      default:
        current = 0;
    }
    return { current, target: a.targetValue };
  }

  private checkAwardRequirement(
    a: { code: string; targetValue: number },
    stats: UserStats,
  ): { met: boolean; value: number } {
    const progress = this.getAwardProgress(a, stats);
    const met = progress.current >= progress.target;
    return { met, value: progress.current };
  }
}
