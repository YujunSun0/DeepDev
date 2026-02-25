import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MasteryService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * MVP 단순 가중 평균: MC = (0.4 × OC) + (0.3 × SC) + (0.3 × AC)
   */
  calculateSessionScore(
    objectiveScore: number,
    subjectiveScore: number,
    applicationScore: number,
  ): number {
    return 0.4 * objectiveScore + 0.3 * subjectiveScore + 0.3 * applicationScore;
  }

  classifyMastery(score: number): string {
    if (score >= 80) return 'MASTERED';
    if (score >= 50) return 'INTERMEDIATE';
    return 'WEAK';
  }

  async updateMastery(userId: string, conceptId: string, sessionScore: number) {
    const existing = await this.prisma.userMastery.findUnique({
      where: { userId_conceptId: { userId, conceptId } },
    });

    if (existing) {
      const alpha = 0.7;
      const newScore = existing.masteryScore * alpha + sessionScore * (1 - alpha);

      return this.prisma.userMastery.update({
        where: { userId_conceptId: { userId, conceptId } },
        data: {
          masteryScore: Math.round(newScore * 100) / 100,
          attemptCount: { increment: 1 },
          lastUpdated: new Date(),
        },
      });
    }

    return this.prisma.userMastery.create({
      data: {
        userId,
        conceptId,
        masteryScore: Math.round(sessionScore * 100) / 100,
        attemptCount: 1,
      },
    });
  }

  async getUserMasteries(userId: string) {
    return this.prisma.userMastery.findMany({
      where: { userId },
      include: { concept: true },
      orderBy: { lastUpdated: 'desc' },
    });
  }

  async getWeakConcepts(userId: string) {
    return this.prisma.userMastery.findMany({
      where: {
        userId,
        masteryScore: { lt: 50 },
      },
      include: { concept: true },
      orderBy: { masteryScore: 'asc' },
    });
  }

  async getGlobalSkillIndex(userId: string): Promise<number> {
    const masteries = await this.prisma.userMastery.findMany({
      where: { userId },
      include: { concept: true },
    });

    if (masteries.length === 0) return 0;

    const totalWeight = masteries.reduce(
      (sum, m) => sum + m.concept.masteryWeight,
      0,
    );
    const weightedSum = masteries.reduce(
      (sum, m) => sum + m.masteryScore * m.concept.masteryWeight,
      0,
    );

    return totalWeight > 0
      ? Math.round((weightedSum / totalWeight) * 100) / 100
      : 0;
  }
}
