/**
 * 플랜별 학습·탐구 가능 최대 레벨 (PRD 7장).
 * 서버(apps/api/src/modules/usage/plan-limits.ts의 maxLevel)와 같은 값을 유지해야 합니다.
 * 화면 잠금은 안내용이고, 실제 제한은 서버가 검증합니다.
 */
export const PLAN_MAX_LEVEL: Record<string, number> = {
  FREE: 2,
  PRO: 4,
  MASTER: 5,
};

export function getMaxLevel(planType: string | null | undefined): number {
  return PLAN_MAX_LEVEL[planType ?? 'FREE'] ?? PLAN_MAX_LEVEL.FREE;
}
