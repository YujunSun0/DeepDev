# DeepDev Mastery Scoring Mathematical Model (v1.0)

------------------------------------------------------------------------

# 1. Objective

본 문서는 DeepDev의 숙련도(Mastery) 계산을 위한 수학적 모델을 정의한다.

목표:

1.  개념별 숙련도를 정량화
2.  학습자의 실력 척도를 일관성 있게 유지
3.  난이도 및 시도 횟수를 반영
4.  장기 성장 추이를 측정 가능하게 설계

------------------------------------------------------------------------

# 2. Core Variables

각 Concept C에 대해:

-   MC : Mastery Score (0 \~ 100)
-   A : Attempt Count
-   OC : Objective Score (객관식 정답률)
-   SC : Subjective Score (서술 논리 점수)
-   AC : Application Score (응용 문제 점수)
-   DL : Difficulty Level (1\~5)
-   TF : Time Factor (최근 학습 가중치)

------------------------------------------------------------------------

# 3. Base Session Score

세션 1회 점수 S는:

S = (0.4 × OC) + (0.3 × SC) + (0.3 × AC)

범위: 0 ≤ S ≤ 100

------------------------------------------------------------------------

# 4. Difficulty Weighting

난이도 가중치 WD:

WD = 1 + (DL - 1) × 0.1

예:

Level 1 → 1.0\
Level 3 → 1.2\
Level 5 → 1.4

Weighted Session Score:

SW = S × WD

------------------------------------------------------------------------

# 5. Time Decay Function

최근 학습에 더 큰 가중치를 주기 위해 지수 감쇠 함수 적용.

TF = e\^(-λt)

λ (lambda) = 0.05 (기본값) t = 마지막 학습 이후 경과 일수

보정 점수:

ST = SW × TF

------------------------------------------------------------------------

# 6. Mastery Update Formula

이전 Mastery Score를 MC_prev 라 할 때:

MC_new = (MC_prev × α) + (ST × (1 - α))

α = 0.7 (기존 숙련도 유지 비율)

초기값:

MC_initial = ST

------------------------------------------------------------------------

# 7. Attempt Penalty / Bonus

A = 시도 횟수

Penalty Factor PF:

PF = 1 - (min(A, 5) × 0.02)

즉 최대 10% 감점.

최종 숙련도:

MC_final = MC_new × PF

------------------------------------------------------------------------

# 8. Concept Dependency Adjustment

만약 Concept C가 Prerequisite Concept P에 의존한다면:

If MC_P \< 50: MC_C = MC_C × 0.8

즉 선행 개념 미숙 시 20% 감산.

------------------------------------------------------------------------

# 9. Mastery Classification

MC ≥ 80 → Mastered\
50 ≤ MC \< 80 → Intermediate\
MC \< 50 → Weak

------------------------------------------------------------------------

# 10. Global Skill Index (GSI)

사용자의 전체 JS 실력 지표:

GSI = Σ (MC_i × Wi) / Σ Wi

Wi = 각 Concept의 중요도 가중치

------------------------------------------------------------------------

# 11. Weak Concept Priority Score

Weak Priority (WP):

WP = (100 - MC) × DL × Dependency_Weight

Priority Queue에 높은 값부터 재추천.

------------------------------------------------------------------------

# 12. Future Enhancements

1.  Bayesian Knowledge Tracing 적용 가능
2.  Elo Rating 기반 개념 경쟁 모델
3.  IRT (Item Response Theory) 통합
4.  Reinforcement Learning 기반 난이도 자동 조정

------------------------------------------------------------------------

# 13. MVP Simplified Version

MVP에서는:

-   Time Decay 제거
-   Dependency Adjustment 제거
-   단순 가중 평균 사용

MC = (0.4 × OC) + (0.3 × SC) + (0.3 × AC)
