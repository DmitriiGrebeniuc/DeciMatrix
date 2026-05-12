import type {
  CalculatedResult,
  Criterion,
  CriterionContribution,
  Decision,
  OptionResult,
  Score,
} from '../types/decision';

function getSafeNumber(value: number): number {
  return Number.isFinite(value) ? value : 0;
}

function findScore(
  scores: Score[],
  optionId: string,
  criterionId: string
): Score | undefined {
  return scores.find(
    (score) => score.optionId === optionId && score.criterionId === criterionId
  );
}

function getCriterionName(criteria: Criterion[], criterionId: string): string {
  return (
    criteria.find((criterion) => criterion.id === criterionId)?.name ??
    criterionId
  );
}

export function calculateDecisionResult(decision: Decision): CalculatedResult {
  const totalImportance = decision.criteria.reduce(
    (sum, criterion) => sum + getSafeNumber(criterion.importance),
    0
  );

  if (totalImportance <= 0) {
    return {
      decisionId: decision.id,
      winnerOptionId: null,
      options: [],
    };
  }

  const optionResults = decision.options.map<OptionResult>((option) => {
    const criterionBreakdown =
      decision.criteria.map<CriterionContribution>((criterion) => {
        const score = findScore(decision.scores, option.id, criterion.id);
        const scoreValue = getSafeNumber(score?.value ?? 0);
        const normalizedWeight =
          getSafeNumber(criterion.importance) / totalImportance;
        const weightedScore = scoreValue * normalizedWeight;

        return {
          criterionId: criterion.id,
          rating: score?.rating,
          scoreValue,
          normalizedWeight,
          weightedScore,
        };
      });

    const totalScore = criterionBreakdown.reduce(
      (sum, contribution) => sum + contribution.weightedScore,
      0
    );

    return {
      optionId: option.id,
      totalScore,
      matchPercent: (totalScore / 10) * 100,
      rank: 0,
      criterionBreakdown,
    };
  });

  const rankedOptions = [...optionResults]
    .sort((left, right) => right.totalScore - left.totalScore)
    .map<OptionResult>((optionResult, index) => ({
      ...optionResult,
      rank: index + 1,
    }));

  return {
    decisionId: decision.id,
    winnerOptionId: rankedOptions[0]?.optionId ?? null,
    options: rankedOptions,
  };
}

export function getImportanceLabel(value: number): string {
  if (value <= 20) {
    return 'почти не важно';
  }

  if (value <= 40) {
    return 'немного важно';
  }

  if (value <= 60) {
    return 'важно';
  }

  if (value <= 80) {
    return 'очень важно';
  }

  return 'критично';
}

export function getResultLabel(matchPercent: number): string {
  if (matchPercent >= 90) {
    return 'почти идеальное совпадение';
  }

  if (matchPercent >= 80) {
    return 'очень сильный вариант';
  }

  if (matchPercent >= 70) {
    return 'хороший вариант';
  }

  if (matchPercent >= 60) {
    return 'нормальный вариант';
  }

  if (matchPercent >= 40) {
    return 'спорный вариант';
  }

  return 'слабое совпадение';
}

export function getWinnerExplanation(
  decision: Decision,
  result: CalculatedResult
): string {
  const winner = result.options.find(
    (optionResult) => optionResult.optionId === result.winnerOptionId
  );

  if (!winner) {
    return 'Недостаточно данных, чтобы определить победителя.';
  }

  const strongestCriteria = [...winner.criterionBreakdown]
    .sort((left, right) => right.weightedScore - left.weightedScore)
    .filter((contribution) => contribution.weightedScore > 0)
    .slice(0, 3)
    .map((contribution) =>
      getCriterionName(decision.criteria, contribution.criterionId)
    );

  if (strongestCriteria.length === 0) {
    return 'Этот вариант подходит лучше остальных, но данных пока маловато для подробного объяснения.';
  }

  return `Этот вариант лучше всего совпал с тем, что для тебя важнее всего: ${strongestCriteria.join(
    ', '
  )}.`;
}

/*
Unit-like smoke check:
const result = calculateDecisionResult(decision);
console.assert(result.options[0]?.rank === 1);
console.assert(decision.options.length > 0);
*/
