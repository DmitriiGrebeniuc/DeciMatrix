import type { Decision } from '../types/decision';

type MissingScore = {
  optionId: string;
  criterionId: string;
};

function hasScore(
  decision: Decision,
  optionId: string,
  criterionId: string
): boolean {
  return decision.scores.some(
    (score) => score.optionId === optionId && score.criterionId === criterionId
  );
}

function getTotalImportance(decision: Decision): number {
  return decision.criteria.reduce(
    (sum, criterion) => sum + criterion.importance,
    0
  );
}

export function canGoToOptions(decision: Decision): boolean {
  return decision.title.trim().length > 0;
}

export function canGoToCriteria(decision: Decision): boolean {
  return decision.options.length >= 2;
}

export function canGoToImportance(decision: Decision): boolean {
  return decision.criteria.length >= 2;
}

export function canGoToRatings(decision: Decision): boolean {
  return (
    decision.options.length >= 2 &&
    decision.criteria.length >= 2 &&
    decision.criteria.every((criterion) => criterion.importance > 0)
  );
}

export function getRequiredScoresCount(decision: Decision): number {
  return decision.options.length * decision.criteria.length;
}

export function getMissingScoresCount(decision: Decision): number {
  let missingCount = 0;

  for (const option of decision.options) {
    for (const criterion of decision.criteria) {
      if (!hasScore(decision, option.id, criterion.id)) {
        missingCount += 1;
      }
    }
  }

  return missingCount;
}

export function findFirstMissingScore(decision: Decision): MissingScore | null {
  for (const option of decision.options) {
    for (const criterion of decision.criteria) {
      if (!hasScore(decision, option.id, criterion.id)) {
        return {
          optionId: option.id,
          criterionId: criterion.id,
        };
      }
    }
  }

  return null;
}

export function canShowResult(decision: Decision): boolean {
  return (
    canGoToRatings(decision) &&
    getMissingScoresCount(decision) === 0 &&
    getTotalImportance(decision) > 0
  );
}
