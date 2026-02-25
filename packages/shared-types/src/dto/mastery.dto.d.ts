export interface MasteryResponse {
    conceptId: string;
    conceptName: string;
    masteryScore: number;
    masteryLevel: string;
    attemptCount: number;
    lastUpdated: string;
}
export interface DashboardResponse {
    globalSkillIndex: number;
    totalSessions: number;
    masteryList: MasteryResponse[];
    weakConcepts: MasteryResponse[];
    recentSessions: {
        id: string;
        conceptName: string;
        score: number;
        createdAt: string;
    }[];
}
