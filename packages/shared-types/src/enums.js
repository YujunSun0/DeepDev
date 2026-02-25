"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PLAN_MAX_LEVEL = exports.SESSION_DAILY_LIMITS = exports.SESSION_TOKEN_LIMITS = exports.ConceptLevel = exports.MasteryLevel = exports.SessionState = exports.PlanType = void 0;
var PlanType;
(function (PlanType) {
    PlanType["FREE"] = "FREE";
    PlanType["PRO"] = "PRO";
    PlanType["MASTER"] = "MASTER";
})(PlanType || (exports.PlanType = PlanType = {}));
var SessionState;
(function (SessionState) {
    SessionState["INIT"] = "INIT";
    SessionState["CONCEPT_EXPLAINED"] = "CONCEPT_EXPLAINED";
    SessionState["BASIC_QUESTION"] = "BASIC_QUESTION";
    SessionState["ADVANCED_QUESTION"] = "ADVANCED_QUESTION";
    SessionState["SELF_EXPLANATION"] = "SELF_EXPLANATION";
    SessionState["EVALUATION"] = "EVALUATION";
    SessionState["SUMMARY"] = "SUMMARY";
    SessionState["CLOSED"] = "CLOSED";
})(SessionState || (exports.SessionState = SessionState = {}));
var MasteryLevel;
(function (MasteryLevel) {
    MasteryLevel["WEAK"] = "WEAK";
    MasteryLevel["INTERMEDIATE"] = "INTERMEDIATE";
    MasteryLevel["MASTERED"] = "MASTERED";
})(MasteryLevel || (exports.MasteryLevel = MasteryLevel = {}));
var ConceptLevel;
(function (ConceptLevel) {
    ConceptLevel[ConceptLevel["LEVEL_1"] = 1] = "LEVEL_1";
    ConceptLevel[ConceptLevel["LEVEL_2"] = 2] = "LEVEL_2";
    ConceptLevel[ConceptLevel["LEVEL_3"] = 3] = "LEVEL_3";
    ConceptLevel[ConceptLevel["LEVEL_4"] = 4] = "LEVEL_4";
    ConceptLevel[ConceptLevel["LEVEL_5"] = 5] = "LEVEL_5";
})(ConceptLevel || (exports.ConceptLevel = ConceptLevel = {}));
exports.SESSION_TOKEN_LIMITS = {
    [PlanType.FREE]: 3000,
    [PlanType.PRO]: 8000,
    [PlanType.MASTER]: 15000,
};
exports.SESSION_DAILY_LIMITS = {
    [PlanType.FREE]: 1,
    [PlanType.PRO]: 5,
    [PlanType.MASTER]: 999,
};
exports.PLAN_MAX_LEVEL = {
    [PlanType.FREE]: 2,
    [PlanType.PRO]: 4,
    [PlanType.MASTER]: 5,
};
//# sourceMappingURL=enums.js.map