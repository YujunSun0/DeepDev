import { SESSION_TOKEN_LIMITS, PlanType } from '@deepdev/shared-types';

export function getTokenLimit(planType: string): number {
  return SESSION_TOKEN_LIMITS[planType as PlanType] ?? SESSION_TOKEN_LIMITS.FREE;
}

export function isTokenLimitExceeded(
  currentTokens: number,
  planType: string,
): boolean {
  return currentTokens >= getTokenLimit(planType);
}
