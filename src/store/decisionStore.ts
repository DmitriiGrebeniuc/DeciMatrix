import { create } from 'zustand';

import { RATING_VALUES } from '../constants/ratings';
import {
  loadDecisions,
  saveDecisions,
} from '../services/storageService';
import type { Decision, RatingLevel } from '../types/decision';
import { getNowIso } from '../utils/dates';
import { createId } from '../utils/ids';

type DecisionStore = {
  decisions: Decision[];
  currentDecisionId: string | null;
  isLoaded: boolean;
  load: () => Promise<void>;
  createDecision: (title: string, description?: string) => string;
  setCurrentDecision: (decisionId: string | null) => void;
  updateDecision: (decisionId: string, data: Partial<Decision>) => void;
  deleteDecision: (decisionId: string) => void;
  addOption: (decisionId: string, name: string) => void;
  removeOption: (decisionId: string, optionId: string) => void;
  addCriterion: (decisionId: string, name: string) => void;
  removeCriterion: (decisionId: string, criterionId: string) => void;
  updateCriterionImportance: (
    decisionId: string,
    criterionId: string,
    importance: number
  ) => void;
  setScore: (
    decisionId: string,
    optionId: string,
    criterionId: string,
    rating: RatingLevel
  ) => void;
  completeDecision: (decisionId: string) => void;
};

function clampImportance(value: number): number {
  return Math.min(100, Math.max(1, value));
}

function persistDecisions(decisions: Decision[]): void {
  void saveDecisions(decisions);
}

export const useDecisionStore = create<DecisionStore>((set, get) => ({
  decisions: [],
  currentDecisionId: null,
  isLoaded: false,

  async load() {
    const decisions = await loadDecisions();

    set({
      decisions,
      isLoaded: true,
    });
  },

  createDecision(title, description) {
    const now = getNowIso();
    const decisionId = createId('decision');
    const decision: Decision = {
      id: decisionId,
      title,
      description,
      createdAt: now,
      updatedAt: now,
      status: 'draft',
      options: [],
      criteria: [],
      scores: [],
    };
    const decisions = [...get().decisions, decision];

    set({
      decisions,
      currentDecisionId: decisionId,
    });
    persistDecisions(decisions);

    return decisionId;
  },

  setCurrentDecision(decisionId) {
    set({ currentDecisionId: decisionId });
  },

  updateDecision(decisionId, data) {
    const now = getNowIso();
    const decisions = get().decisions.map((decision) =>
      decision.id === decisionId
        ? {
            ...decision,
            ...data,
            id: decision.id,
            createdAt: decision.createdAt,
            updatedAt: now,
          }
        : decision
    );

    set({ decisions });
    persistDecisions(decisions);
  },

  deleteDecision(decisionId) {
    const decisions = get().decisions.filter(
      (decision) => decision.id !== decisionId
    );
    const currentDecisionId =
      get().currentDecisionId === decisionId ? null : get().currentDecisionId;

    set({
      decisions,
      currentDecisionId,
    });
    persistDecisions(decisions);
  },

  addOption(decisionId, name) {
    const now = getNowIso();
    const decisions = get().decisions.map((decision) => {
      if (decision.id !== decisionId) {
        return decision;
      }

      return {
        ...decision,
        updatedAt: now,
        options: [
          ...decision.options,
          {
            id: createId('option'),
            name,
            order: decision.options.length + 1,
          },
        ],
      };
    });

    set({ decisions });
    persistDecisions(decisions);
  },

  removeOption(decisionId, optionId) {
    const now = getNowIso();
    const decisions = get().decisions.map((decision) => {
      if (decision.id !== decisionId) {
        return decision;
      }

      return {
        ...decision,
        updatedAt: now,
        options: decision.options.filter((option) => option.id !== optionId),
        scores: decision.scores.filter((score) => score.optionId !== optionId),
      };
    });

    set({ decisions });
    persistDecisions(decisions);
  },

  addCriterion(decisionId, name) {
    const now = getNowIso();
    const decisions = get().decisions.map((decision) => {
      if (decision.id !== decisionId) {
        return decision;
      }

      return {
        ...decision,
        updatedAt: now,
        criteria: [
          ...decision.criteria,
          {
            id: createId('criterion'),
            name,
            importance: 50,
            order: decision.criteria.length + 1,
          },
        ],
      };
    });

    set({ decisions });
    persistDecisions(decisions);
  },

  removeCriterion(decisionId, criterionId) {
    const now = getNowIso();
    const decisions = get().decisions.map((decision) => {
      if (decision.id !== decisionId) {
        return decision;
      }

      return {
        ...decision,
        updatedAt: now,
        criteria: decision.criteria.filter(
          (criterion) => criterion.id !== criterionId
        ),
        scores: decision.scores.filter(
          (score) => score.criterionId !== criterionId
        ),
      };
    });

    set({ decisions });
    persistDecisions(decisions);
  },

  updateCriterionImportance(decisionId, criterionId, importance) {
    const now = getNowIso();
    const nextImportance = clampImportance(importance);
    const decisions = get().decisions.map((decision) => {
      if (decision.id !== decisionId) {
        return decision;
      }

      return {
        ...decision,
        updatedAt: now,
        criteria: decision.criteria.map((criterion) =>
          criterion.id === criterionId
            ? {
                ...criterion,
                importance: nextImportance,
              }
            : criterion
        ),
      };
    });

    set({ decisions });
    persistDecisions(decisions);
  },

  setScore(decisionId, optionId, criterionId, rating) {
    const now = getNowIso();
    const value = RATING_VALUES[rating];
    const decisions = get().decisions.map((decision) => {
      if (decision.id !== decisionId) {
        return decision;
      }

      const hasExistingScore = decision.scores.some(
        (score) =>
          score.optionId === optionId && score.criterionId === criterionId
      );
      const scores = hasExistingScore
        ? decision.scores.map((score) =>
            score.optionId === optionId && score.criterionId === criterionId
              ? {
                  ...score,
                  rating,
                  value,
                }
              : score
          )
        : [
            ...decision.scores,
            {
              optionId,
              criterionId,
              rating,
              value,
            },
          ];

      return {
        ...decision,
        updatedAt: now,
        scores,
      };
    });

    set({ decisions });
    persistDecisions(decisions);
  },

  completeDecision(decisionId) {
    const now = getNowIso();
    const decisions = get().decisions.map((decision) =>
      decision.id === decisionId
        ? {
            ...decision,
            status: 'completed' as const,
            updatedAt: now,
          }
        : decision
    );

    set({ decisions });
    persistDecisions(decisions);
  },
}));
