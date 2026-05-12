import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CriterionCard } from '../src/components/decision/CriterionCard';
import { Button } from '../src/components/ui/Button';
import { Card } from '../src/components/ui/Card';
import { ScreenContainer } from '../src/components/ui/ScreenContainer';
import { TextInput } from '../src/components/ui/TextInput';
import { COLORS } from '../src/constants/colors';
import { useDecisionStore } from '../src/store/decisionStore';

const SUGGESTED_CRITERIA = [
  'Цена',
  'Качество',
  'Удобство',
  'Скорость',
  'Риск',
  'Надежность',
  'Дизайн',
  'Польза',
];

export default function AddCriteriaScreen() {
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
  const addCriterion = useDecisionStore((state) => state.addCriterion);
  const removeCriterion = useDecisionStore((state) => state.removeCriterion);
  const [criterionName, setCriterionName] = useState('');
  const [error, setError] = useState<string | undefined>();

  const decisionId = params.decisionId ?? currentDecisionId;
  const decision = useMemo(
    () => decisions.find((item) => item.id === decisionId),
    [decisions, decisionId]
  );
  const trimmedCriterionName = criterionName.trim();
  const canContinue = (decision?.criteria.length ?? 0) >= 2;

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

  function hasCriterion(name: string): boolean {
    return (
      decision?.criteria.some(
        (criterion) =>
          criterion.name.trim().toLowerCase() === name.trim().toLowerCase()
      ) ?? false
    );
  }

  function handleAddCriterion(name: string): void {
    const nextName = name.trim();

    if (!decisionId || nextName.length === 0) {
      return;
    }

    if (hasCriterion(nextName)) {
      setError('Такой критерий уже есть.');
      return;
    }

    addCriterion(decisionId, nextName);
    setCriterionName('');
    setError(undefined);
  }

  function handleRemoveCriterion(criterionId: string): void {
    if (!decisionId) {
      return;
    }

    removeCriterion(decisionId, criterionId);
  }

  function handleNext(): void {
    if (!decisionId || !canContinue) {
      return;
    }

    router.push({
      pathname: '/importance',
      params: {
        decisionId,
      },
    });
  }

  return (
    <ScreenContainer scroll>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Что важно при выборе?</Text>
          <Text style={styles.hint}>
            Критерии - это то, что влияет на твой выбор.
          </Text>
        </View>

        <View style={styles.addRow}>
          <View style={styles.inputWrap}>
            <TextInput
              value={criterionName}
              onChangeText={(value) => {
                setCriterionName(value);
                setError(undefined);
              }}
              placeholder="Например: Цена"
              error={error}
            />
          </View>
          <View style={styles.addButton}>
            <Button
              title="+"
              onPress={() => handleAddCriterion(trimmedCriterionName)}
              disabled={trimmedCriterionName.length === 0 || !decisionId}
            />
          </View>
        </View>

        <View style={styles.chips}>
          {SUGGESTED_CRITERIA.map((criterion) => {
            const isDisabled = hasCriterion(criterion) || !decisionId;

            return (
              <Pressable
                key={criterion}
                disabled={isDisabled}
                onPress={() => handleAddCriterion(criterion)}
                style={({ pressed }) => [
                  styles.chip,
                  isDisabled && styles.chipDisabled,
                  pressed && !isDisabled && styles.chipPressed,
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    isDisabled && styles.chipTextDisabled,
                  ]}
                >
                  {criterion}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {!decision ? (
          <Card>
            <Text style={styles.emptyText}>
              Решение не найдено. Вернись назад и создай решение заново.
            </Text>
          </Card>
        ) : (
          <View style={styles.list}>
            {decision.criteria.map((criterion) => (
              <CriterionCard
                key={criterion.id}
                name={criterion.name}
                onDelete={() => handleRemoveCriterion(criterion.id)}
              />
            ))}
          </View>
        )}

        {!canContinue ? (
          <Text style={styles.helper}>
            Добавь минимум два критерия для сравнения.
          </Text>
        ) : null}

        <Button title="Далее" onPress={handleNext} disabled={!canContinue} />
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
  addRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  inputWrap: {
    flex: 1,
  },
  addButton: {
    width: 58,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: COLORS.surface,
  },
  chipDisabled: {
    backgroundColor: COLORS.muted,
    opacity: 0.55,
  },
  chipPressed: {
    backgroundColor: COLORS.accentLight,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  chipTextDisabled: {
    color: COLORS.textSecondary,
  },
  list: {
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    lineHeight: 21,
    color: COLORS.textSecondary,
  },
  helper: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.textSecondary,
  },
});
