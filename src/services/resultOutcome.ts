import type { CalculatedResult, OptionResult } from '../types/decision';

export type ResultOutcome = 'winner' | 'close_call' | 'tie';

type ResultOutcomeDetails = {
  outcome: ResultOutcome;
  first: OptionResult | null;
  second: OptionResult | null;
  tiedOptions: OptionResult[];
};

const TIE_TOTAL_SCORE_THRESHOLD = 0.05;
const CLOSE_MATCH_PERCENT_THRESHOLD = 2;

export function getResultOutcome(
  result: CalculatedResult
): ResultOutcomeDetails {
  const [first, second] = result.options;

  if (!first || !second) {
    return {
      outcome: 'winner',
      first: first ?? null,
      second: null,
      tiedOptions: first ? [first] : [],
    };
  }

  const totalScoreDifference = Math.abs(first.totalScore - second.totalScore);

  if (totalScoreDifference < TIE_TOTAL_SCORE_THRESHOLD) {
    return {
      outcome: 'tie',
      first,
      second,
      tiedOptions: getTiedOptions(result.options, first),
    };
  }

  const roundedPercentIsSame =
    Math.round(first.matchPercent) === Math.round(second.matchPercent);
  const matchPercentDifference = Math.abs(
    first.matchPercent - second.matchPercent
  );

  if (
    roundedPercentIsSame ||
    matchPercentDifference < CLOSE_MATCH_PERCENT_THRESHOLD
  ) {
    return {
      outcome: 'close_call',
      first,
      second,
      tiedOptions: [],
    };
  }

  return {
    outcome: 'winner',
    first,
    second,
    tiedOptions: [first],
  };
}

function getTiedOptions(
  options: OptionResult[],
  first: OptionResult
): OptionResult[] {
  const firstDisplayPercent = Math.round(first.matchPercent);

  return options.filter((option) => {
    const totalScoreDifference = Math.abs(option.totalScore - first.totalScore);
    const displayPercentIsSame =
      Math.round(option.matchPercent) === firstDisplayPercent;

    return (
      totalScoreDifference < TIE_TOTAL_SCORE_THRESHOLD || displayPercentIsSame
    );
  });
}
