import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { RatingScale } from '../src/components/decision/RatingScale';
import { Button } from '../src/components/ui/Button';
import { AppHeader } from '../src/components/ui/AppHeader';
import { Card } from '../src/components/ui/Card';
import { ProgressBar } from '../src/components/ui/ProgressBar';
import { ScreenContainer } from '../src/components/ui/ScreenContainer';
import { COLORS } from '../src/constants/colors';
import { RATING_LABELS } from '../src/constants/ratings';
import { findFirstMissingScore } from '../src/services/decisionValidation';
import { useDecisionStore } from '../src/store/decisionStore';
import type { Criterion, Option } from '../src/types/decision';

type RatingPair = {
  option: Option;
  criterion: Criterion;
};

function buildRatingPairs(options: Option[], criteria: Criterion[]): RatingPair[] {
  return options.flatMap((option) =>
    criteria.map((criterion) => ({
      option,
      criterion,
    }))
  );
}

export default function RateOptionsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ decisionId?: string }>();
  const decisions = useDecisionStore((state) => state.decisions);
  const currentDecisionId = useDecisionStore(
    (state) => state.currentDecisionId
  );
  const isLoaded = useDecisionStore((state) => state.isLoaded);
  const load = useDecisionStore((state) => state.load);
  const setCurrentDecision = useDecisionStore(
    (state) => state.setCurrentDecision
  );
  const setScore = useDecisionStore((state) => state.setScore);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isInitialIndexSet, setIsInitialIndexSet] = useState(false);

  const decisionId = params.decisionId ?? currentDecisionId;
  const decision = useMemo(
    () => decisions.find((item) => item.id === decisionId),
    [decisions, decisionId]
  );
  const pairs = useMemo(
    () =>
      decision
        ? buildRatingPairs(decision.options, decision.criteria)
        : [],
    [decision]
  );
  const currentPair = pairs[currentIndex];
  const currentScore =
    decision && currentPair
      ? decision.scores.find(
          (score) =>
            score.optionId === currentPair.option.id &&
            score.criterionId === currentPair.criterion.id
        )
      : undefined;
  const progress = pairs.length > 0 ? (currentIndex + 1) / pairs.length : 0;

  useEffect(() => {
    if (!isLoaded) {
      void load();
    }
  }, [isLoaded, load]);

  useEffect(() => {
    if (params.decisionId) {
      setCurrentDecision(params.decisionId);
    }
  }, [params.decisionId, setCurrentDecision]);

  useEffect(() => {
    setCurrentIndex(0);
    setIsInitialIndexSet(false);
  }, [decisionId]);

  useEffect(() => {
    if (!decision || pairs.length === 0 || isInitialIndexSet) {
      return;
    }

    const firstMissingScore = findFirstMissingScore(decision);
    const firstMissingIndex = firstMissingScore
      ? pairs.findIndex(
          (pair) =>
            pair.option.id === firstMissingScore.optionId &&
            pair.criterion.id === firstMissingScore.criterionId
        )
      : -1;

    setCurrentIndex(firstMissingIndex >= 0 ? firstMissingIndex : 0);
    setIsInitialIndexSet(true);
  }, [decision, pairs, isInitialIndexSet]);

  function handleBack(): void {
    if (currentIndex > 0) {
      setCurrentIndex((index) => index - 1);
      return;
    }

    router.push({
      pathname: '/importance',
      params: {
        decisionId,
      },
    });
  }

  function handleNext(): void {
    if (!decisionId || !currentScore) {
      return;
    }

    if (currentIndex < pairs.length - 1) {
      setCurrentIndex((index) => index + 1);
      return;
    }

    router.push({
      pathname: '/result',
      params: {
        decisionId,
      },
    });
  }

  return (
    <ScreenContainer scroll>
      <AppHeader title="Оценка" />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.progressText}>
            {pairs.length > 0
              ? `Оценка ${currentIndex + 1} из ${pairs.length}`
              : 'Оценка 0 из 0'}
          </Text>
          <ProgressBar progress={progress} />
        </View>

        {!decision || !currentPair ? (
          <Card>
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Оценки пока недоступны</Text>
              <Text style={styles.emptyText}>
                Вернись назад и проверь, что добавлены минимум два варианта и
                два критерия.
              </Text>
              <Button title="Назад" onPress={handleBack} />
            </View>
          </Card>
        ) : (
          <Card>
            <View style={styles.cardContent}>
              <View style={styles.optionBlock}>
                <Text style={styles.label}>Вариант</Text>
                <Text style={styles.optionName}>{currentPair.option.name}</Text>
              </View>

              <Text style={styles.criterion}>
                Критерий: {currentPair.criterion.name}
              </Text>

              <Text style={styles.question}>
                Как этот вариант справляется с критерием?
              </Text>

              <RatingScale
                value={currentScore?.rating}
                onChange={(rating) =>
                  setScore(
                    decision.id,
                    currentPair.option.id,
                    currentPair.criterion.id,
                    rating
                  )
                }
              />

              {currentScore ? (
                <Text style={styles.selectedText}>
                  Твоя оценка: {RATING_LABELS[currentScore.rating]}
                </Text>
              ) : null}
            </View>
          </Card>
        )}

        <View style={styles.actions}>
          <View style={styles.action}>
            <Button title="Назад" variant="secondary" onPress={handleBack} />
          </View>
          <View style={styles.action}>
            <Button
              title="Далее"
              onPress={handleNext}
              disabled={!currentScore}
            />
          </View>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 22,
  },
  header: {
    gap: 10,
  },
  progressText: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  cardContent: {
    gap: 18,
  },
  optionBlock: {
    gap: 4,
  },
  label: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  optionName: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  criterion: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.accent,
  },
  question: {
    fontSize: 18,
    lineHeight: 25,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  selectedText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  emptyState: {
    gap: 14,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  emptyText: {
    fontSize: 15,
    lineHeight: 21,
    color: COLORS.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  action: {
    flex: 1,
  },
});
