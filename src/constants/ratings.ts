import type { RatingLevel } from '../types/decision';

export const RATING_VALUES: Record<RatingLevel, number> = {
  bad: 2,
  weak: 4,
  normal: 6,
  good: 8,
  excellent: 10,
};

export const RATING_LABELS: Record<RatingLevel, string> = {
  bad: 'плохо',
  weak: 'слабовато',
  normal: 'нормально',
  good: 'хорошо',
  excellent: 'отлично',
};

export const RATING_LEVELS: RatingLevel[] = [
  'bad',
  'weak',
  'normal',
  'good',
  'excellent',
];
