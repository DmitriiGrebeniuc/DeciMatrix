import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { RankingList } from '../src/components/decision/RankingList';
import { ResultCard } from '../src/components/decision/ResultCard';
import { Button } from '../src/components/ui/Button';
import { Card } from '../src/components/ui/Card';
import { ScreenContainer } from '../src/components/ui/ScreenContainer';
import { COLORS } from '../src/constants/colors';
import {
  calculateDecisionResult,
  getWinnerExplanation,
} from '../src/services/decisionCalculator';
import {
  canShowResult,
  getMissingScoresCount,
} from '../src/services/decisionValidation';
import { useDecisionStore } from '../src/store/decisionStore';

export default function ResultScreen() {
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
  const completeDecision = useDecisionStore(
    (state) => state.completeDecision
  );

  const decisionId = params.decisionId ?? currentDecisionId;
  const decision = useMemo(
    () => decisions.find((item) => item.id === decisionId),
    [decisions, decisionId]
  );
  const isReady = decision ? canShowResult(decision) : false;
  const missingScoresCount = decision ? getMissingScoresCount(decision) : 0;
  const result = useMemo(
    () => (decision && isReady ? calculateDecisionResult(decision) : null),
    [decision, isReady]
  );
  const winnerName =
    decision && result
      ? decision.options.find((option) => option.id === result.winnerOptionId)
          ?.name ?? 'Не определен'
      : 'Не определен';
  const winnerResult = result?.options[0];
  const explanation =
    decision && result ? getWinnerExplanation(decision, result) : '';

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

  function openRatings(): void {
    router.push({
      pathname: '/ratings',
      params: {
        decisionId,
      },
    });
  }

  function openImportance(): void {
    router.push({
      pathname: '/importance',
      params: {
        decisionId,
      },
    });
  }

  function handleSave(): void {
    if (!decisionId) {
      return;
    }

    completeDecision(decisionId);
    router.push(`/decision/${decisionId}`);
  }

  return (
    <ScreenContainer scroll>
      <View style={styles.container}>
        <Text style={styles.title}>Лучший вариант</Text>

        {!decision ? (
          <Card>
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Решение не найдено</Text>
              <Text style={styles.emptyText}>
                Вернись на главную и выбери решение из списка.
              </Text>
              <Button title="На главную" onPress={() => router.push('/')} />
            </View>
          </Card>
        ) : !isReady || !result || !winnerResult ? (
          <Card>
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                Осталось оценить {missingScoresCount} пунктов, чтобы показать
                результат.
              </Text>
              <Button title="Продолжить оценку" onPress={openRatings} />
            </View>
          </Card>
        ) : (
          <>
            <ResultCard
              winnerName={winnerName}
              matchPercent={winnerResult.matchPercent}
              explanation={explanation}
            />

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Рейтинг вариантов</Text>
              <RankingList results={result.options} options={decision.options} />
            </View>

            <View style={styles.actions}>
              <Button
                title="Изменить оценки"
                variant="secondary"
                onPress={openRatings}
              />
              <Button
                title="Изменить важность"
                variant="secondary"
                onPress={openImportance}
              />
              <Button title="Сохранить" onPress={handleSave} />
              <Button
                title="На главную"
                variant="secondary"
                onPress={() => router.push('/')}
              />
            </View>
          </>
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 22,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  actions: {
    gap: 12,
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
});
