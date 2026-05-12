import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { RankingList } from '../../src/components/decision/RankingList';
import { Button } from '../../src/components/ui/Button';
import { Card } from '../../src/components/ui/Card';
import { ScreenContainer } from '../../src/components/ui/ScreenContainer';
import { COLORS } from '../../src/constants/colors';
import { calculateDecisionResult } from '../../src/services/decisionCalculator';
import {
  canShowResult,
  getMissingScoresCount,
} from '../../src/services/decisionValidation';
import { useDecisionStore } from '../../src/store/decisionStore';
import type { Decision } from '../../src/types/decision';

function getDraftNextPath(decision: Decision): '/options' | '/criteria' | '/ratings' | '/result' {
  if (decision.options.length < 2) {
    return '/options';
  }

  if (decision.criteria.length < 2) {
    return '/criteria';
  }

  if (getMissingScoresCount(decision) > 0) {
    return '/ratings';
  }

  return '/result';
}

export default function DecisionDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const decisions = useDecisionStore((state) => state.decisions);
  const isLoaded = useDecisionStore((state) => state.isLoaded);
  const load = useDecisionStore((state) => state.load);
  const setCurrentDecision = useDecisionStore(
    (state) => state.setCurrentDecision
  );
  const deleteDecision = useDecisionStore((state) => state.deleteDecision);

  const decision = useMemo(
    () => decisions.find((item) => item.id === id),
    [decisions, id]
  );
  const result = useMemo(
    () =>
      decision && decision.status === 'completed' && canShowResult(decision)
        ? calculateDecisionResult(decision)
        : null,
    [decision]
  );
  const winnerName =
    decision && result
      ? decision.options.find((option) => option.id === result.winnerOptionId)
          ?.name ?? 'Не определен'
      : null;

  useEffect(() => {
    if (!isLoaded) {
      void load();
    }
  }, [isLoaded, load]);

  useEffect(() => {
    if (id) {
      setCurrentDecision(id);
    }
  }, [id, setCurrentDecision]);

  function openStep(pathname: '/options' | '/criteria' | '/importance' | '/ratings' | '/result'): void {
    if (!id) {
      return;
    }

    router.push({
      pathname,
      params: {
        decisionId: id,
      },
    });
  }

  function handleContinueDraft(): void {
    if (!decision) {
      return;
    }

    openStep(getDraftNextPath(decision));
  }

  function confirmDelete(): void {
    if (!id) {
      return;
    }

    Alert.alert(
      'Удалить решение?',
      'Это действие нельзя отменить.',
      [
        {
          text: 'Отмена',
          style: 'cancel',
        },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: () => {
            deleteDecision(id);
            router.push('/');
          },
        },
      ]
    );
  }

  return (
    <ScreenContainer scroll>
      {!decision ? (
        <Card>
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Решение не найдено</Text>
            <Text style={styles.emptyText}>
              Возможно, оно было удалено или еще не загружено.
            </Text>
            <Button title="На главную" onPress={() => router.push('/')} />
          </View>
        </Card>
      ) : decision.status === 'draft' ? (
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>{decision.title}</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Черновик</Text>
              </View>
            </View>
            <Text style={styles.subtitle}>Решение еще не завершено.</Text>
          </View>

          <Button title="Продолжить" onPress={handleContinueDraft} />
        </View>
      ) : (
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>{decision.title}</Text>
            <Text style={styles.subtitle}>
              Победитель: {winnerName ?? 'результат пока нельзя рассчитать'}
            </Text>
          </View>

          {result ? (
            <RankingList results={result.options} options={decision.options} />
          ) : (
            <Card>
              <Text style={styles.emptyText}>
                Результат нельзя показать, потому что часть данных отсутствует.
              </Text>
            </Card>
          )}

          <View style={styles.actions}>
            <Button
              title="Изменить варианты"
              variant="secondary"
              onPress={() => openStep('/options')}
            />
            <Button
              title="Изменить критерии"
              variant="secondary"
              onPress={() => openStep('/criteria')}
            />
            <Button
              title="Изменить важность"
              variant="secondary"
              onPress={() => openStep('/importance')}
            />
            <Button
              title="Изменить оценки"
              variant="secondary"
              onPress={() => openStep('/ratings')}
            />
            <Button
              title="Удалить решение"
              variant="danger"
              onPress={confirmDelete}
            />
          </View>
        </View>
      )}
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  title: {
    flex: 1,
    fontSize: 30,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 23,
    color: COLORS.textSecondary,
  },
  badge: {
    borderRadius: 999,
    backgroundColor: COLORS.accentLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.accentDark,
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
