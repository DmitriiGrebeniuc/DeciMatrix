import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ImportanceSlider } from '../src/components/decision/ImportanceSlider';
import { Button } from '../src/components/ui/Button';
import { AppHeader } from '../src/components/ui/AppHeader';
import { Card } from '../src/components/ui/Card';
import { ScreenContainer } from '../src/components/ui/ScreenContainer';
import { COLORS } from '../src/constants/colors';
import { useDecisionStore } from '../src/store/decisionStore';

export default function SetImportanceScreen() {
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
  const updateCriterionImportance = useDecisionStore(
    (state) => state.updateCriterionImportance
  );

  const decisionId = params.decisionId ?? currentDecisionId;
  const decision = useMemo(
    () => decisions.find((item) => item.id === decisionId),
    [decisions, decisionId]
  );
  const hasCriteria = (decision?.criteria.length ?? 0) > 0;

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

  function handleNext(): void {
    if (!decisionId || !hasCriteria) {
      return;
    }

    router.push({
      pathname: '/ratings',
      params: {
        decisionId,
      },
    });
  }

  return (
    <ScreenContainer scroll>
      <AppHeader title="Важность" />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Насколько это важно?</Text>
          <Text style={styles.hint}>
            Покажи, что важнее. Проценты мы посчитаем сами.
          </Text>
        </View>

        {!decision || !hasCriteria ? (
          <Card>
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Критерии не найдены</Text>
              <Text style={styles.emptyText}>
                Вернись назад и добавь минимум два критерия для сравнения.
              </Text>
              <Button title="Назад к критериям" onPress={() => router.back()} />
            </View>
          </Card>
        ) : (
          <View style={styles.list}>
            {decision.criteria.map((criterion) => (
              <ImportanceSlider
                key={criterion.id}
                label={criterion.name}
                value={criterion.importance}
                onChange={(value) =>
                  updateCriterionImportance(decision.id, criterion.id, value)
                }
              />
            ))}
          </View>
        )}

        <Button title="Далее" onPress={handleNext} disabled={!hasCriteria} />
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
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  hint: {
    fontSize: 16,
    lineHeight: 23,
    color: COLORS.textSecondary,
  },
  list: {
    gap: 14,
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
