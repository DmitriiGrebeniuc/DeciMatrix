export type DecisionStatus = 'draft' | 'completed';

export type RatingLevel = 'bad' | 'weak' | 'normal' | 'good' | 'excellent';

export type Decision = {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  status: DecisionStatus;
  options: Option[];
  criteria: Criterion[];
  scores: Score[];
};

export type Option = {
  id: string;
  name: string;
  description?: string;
  order: number;
};

export type Criterion = {
  id: string;
  name: string;
  description?: string;
  importance: number;
  order: number;
};

export type Score = {
  optionId: string;
  criterionId: string;
  rating: RatingLevel;
  value: number;
};

export type CalculatedResult = {
  decisionId: string;
  winnerOptionId: string | null;
  options: OptionResult[];
};

export type OptionResult = {
  optionId: string;
  totalScore: number;
  matchPercent: number;
  rank: number;
  criterionBreakdown: CriterionContribution[];
};

export type CriterionContribution = {
  criterionId: string;
  rating?: RatingLevel;
  scoreValue: number;
  normalizedWeight: number;
  weightedScore: number;
};
