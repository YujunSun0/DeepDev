export interface PlanLimit {
  monthlySessions: number;
  monthlyTokens: number;
  explorationTurns: number;
  monthlyExplorations: number;
}

export const PLAN_LIMITS: Record<string, PlanLimit> = {
  FREE: {
    monthlySessions: 10,
    monthlyTokens: 100_000,
    explorationTurns: 10,
    monthlyExplorations: 3,
  },
  PRO: {
    monthlySessions: 100,
    monthlyTokens: 5_000_000,
    explorationTurns: 20,
    monthlyExplorations: 30,
  },
  MASTER: {
    monthlySessions: 300,
    monthlyTokens: 15_000_000,
    explorationTurns: 30,
    monthlyExplorations: 100,
  },
};

export function getPlanLimit(planType: string): PlanLimit {
  return PLAN_LIMITS[planType] ?? PLAN_LIMITS.FREE;
}
