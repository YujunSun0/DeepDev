export interface PlanLimit {
  monthlySessions: number;
  monthlyTokens: number;
  explorationTurns: number;
  monthlyExplorations: number;
  /** 학습·탐구할 수 있는 최대 개념 레벨 (PRD 7장: Free 2 / Pro 4 / Master 5) */
  maxLevel: number;
}

export const PLAN_LIMITS: Record<string, PlanLimit> = {
  FREE: {
    monthlySessions: 10,
    monthlyTokens: 100_000,
    explorationTurns: 10,
    monthlyExplorations: 3,
    maxLevel: 2,
  },
  PRO: {
    monthlySessions: 100,
    monthlyTokens: 5_000_000,
    explorationTurns: 20,
    monthlyExplorations: 30,
    maxLevel: 4,
  },
  MASTER: {
    monthlySessions: 300,
    monthlyTokens: 15_000_000,
    explorationTurns: 30,
    monthlyExplorations: 100,
    maxLevel: 5,
  },
};

const PLAN_NAMES: Record<string, string> = { FREE: 'Free', PRO: 'Pro', MASTER: 'Master' };

export function getPlanLimit(planType: string): PlanLimit {
  return PLAN_LIMITS[planType] ?? PLAN_LIMITS.FREE;
}

/** 레벨이 플랜 한도를 넘으면 사용자에게 보여줄 안내 문구, 허용되면 null */
export function getLevelLockMessage(planType: string, level: number): string | null {
  const { maxLevel } = getPlanLimit(planType);
  if (level <= maxLevel) return null;

  const planName = PLAN_NAMES[planType] ?? 'Free';
  const upgrade = Object.entries(PLAN_LIMITS).find(([, limit]) => limit.maxLevel >= level);
  const upgradeHint = upgrade
    ? ` ${PLAN_NAMES[upgrade[0]]} 플랜으로 업그레이드하면 Level ${upgrade[1].maxLevel}까지 이용할 수 있어요.`
    : '';
  return `현재 플랜(${planName})에서는 Level ${maxLevel}까지 이용할 수 있습니다.${upgradeHint}`;
}
