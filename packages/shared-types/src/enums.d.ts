export declare enum PlanType {
    FREE = "FREE",
    PRO = "PRO",
    MASTER = "MASTER"
}
export declare enum SessionState {
    INIT = "INIT",
    CONCEPT_EXPLAINED = "CONCEPT_EXPLAINED",
    BASIC_QUESTION = "BASIC_QUESTION",
    ADVANCED_QUESTION = "ADVANCED_QUESTION",
    SELF_EXPLANATION = "SELF_EXPLANATION",
    EVALUATION = "EVALUATION",
    SUMMARY = "SUMMARY",
    CLOSED = "CLOSED"
}
export declare enum MasteryLevel {
    WEAK = "WEAK",
    INTERMEDIATE = "INTERMEDIATE",
    MASTERED = "MASTERED"
}
export declare enum ConceptLevel {
    LEVEL_1 = 1,
    LEVEL_2 = 2,
    LEVEL_3 = 3,
    LEVEL_4 = 4,
    LEVEL_5 = 5
}
export declare const SESSION_TOKEN_LIMITS: Record<PlanType, number>;
export declare const SESSION_DAILY_LIMITS: Record<PlanType, number>;
export declare const PLAN_MAX_LEVEL: Record<PlanType, number>;
