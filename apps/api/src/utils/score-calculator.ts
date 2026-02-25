/**
 * MVP 점수 계산: S = (0.4 × OC) + (0.3 × SC) + (0.3 × AC)
 */
export function calculateBaseScore(
  objectiveScore: number,
  subjectiveScore: number,
  applicationScore: number,
): number {
  return 0.4 * objectiveScore + 0.3 * subjectiveScore + 0.3 * applicationScore;
}

export function classifyMasteryLevel(
  score: number,
): 'MASTERED' | 'INTERMEDIATE' | 'WEAK' {
  if (score >= 80) return 'MASTERED';
  if (score >= 50) return 'INTERMEDIATE';
  return 'WEAK';
}
