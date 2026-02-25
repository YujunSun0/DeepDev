export enum PlanType {
  FREE = 'FREE',
  PRO = 'PRO',
  MASTER = 'MASTER',
}

export enum SessionState {
  INIT = 'INIT',
  CONCEPT_EXPLAINED = 'CONCEPT_EXPLAINED',
  BASIC_QUESTION = 'BASIC_QUESTION',
  ADVANCED_QUESTION = 'ADVANCED_QUESTION',
  SELF_EXPLANATION = 'SELF_EXPLANATION',
  EVALUATION = 'EVALUATION',
  SUMMARY = 'SUMMARY',
  CLOSED = 'CLOSED',
}

export enum MasteryLevel {
  WEAK = 'WEAK',
  INTERMEDIATE = 'INTERMEDIATE',
  MASTERED = 'MASTERED',
}

export enum ConceptLevel {
  LEVEL_1 = 1,
  LEVEL_2 = 2,
  LEVEL_3 = 3,
  LEVEL_4 = 4,
  LEVEL_5 = 5,
}

export const SESSION_TOKEN_LIMITS: Record<PlanType, number> = {
  [PlanType.FREE]: 3000,
  [PlanType.PRO]: 8000,
  [PlanType.MASTER]: 15000,
};

export const SESSION_DAILY_LIMITS: Record<PlanType, number> = {
  [PlanType.FREE]: 1,
  [PlanType.PRO]: 5,
  [PlanType.MASTER]: 999,
};

export const PLAN_MAX_LEVEL: Record<PlanType, number> = {
  [PlanType.FREE]: 2,
  [PlanType.PRO]: 4,
  [PlanType.MASTER]: 5,
};
