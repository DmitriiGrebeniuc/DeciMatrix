import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CriterionCard } from '../src/components/decision/CriterionCard';
import { AppHeader } from '../src/components/ui/AppHeader';
import { Button } from '../src/components/ui/Button';
import { Card } from '../src/components/ui/Card';
import { ScreenContainer } from '../src/components/ui/ScreenContainer';
import { TextInput } from '../src/components/ui/TextInput';
import { useToast } from '../src/components/ui/Toast';
import { COLORS } from '../src/constants/colors';
import { ENABLE_AI_FEATURES } from '../src/constants/features';
import { suggestCriteria } from '../src/services/aiService';
import { useDecisionStore } from '../src/store/decisionStore';

export default function AddCriteriaScreen() {
  const router = useRouter();
  const { showToast } = useToast();
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
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isSuggestingCriteria, setIsSuggestingCriteria] = useState(false);
  const [didRequestAiSuggestions, setDidRequestAiSuggestions] = useState(false);

  const decisionId = params.decisionId ?? currentDecisionId;
  const decision = useMemo(
    () => decisions.find((item) => item.id === decisionId),
    [decisions, decisionId]
  );
  const trimmedCriterionName = criterionName.trim();
  const canContinue = (decision?.criteria.length ?? 0) >= 2;
  const hasEnoughOptions = (decision?.options.length ?? 0) >= 2;

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
    setAiSuggestions((suggestions) =>
      suggestions.filter(
        (suggestion) =>
          suggestion.trim().toLowerCase() !== nextName.toLowerCase()
      )
    );
    setCriterionName('');
    setError(undefined);
  }

  function handleRemoveCriterion(criterionId: string): void {
    if (!decisionId) {
      return;
    }

    removeCriterion(decisionId, criterionId);
  }

  async function handleSuggestCriteria(): Promise<void> {
    if (!decision) {
      return;
    }

    if (!hasEnoughOptions) {
      showToast('Сначала добавь минимум два варианта', 'neutral');
      return;
    }

    setDidRequestAiSuggestions(true);
    setIsSuggestingCriteria(true);

    try {
      const criteria = await suggestCriteria({
        decisionTitle: decision.title,
        options: decision.options.map((option) => option.name),
        existingCriteria: decision.criteria.map((criterion) => criterion.name),
      });
      const nextSuggestions = criteria.filter(
        (criterion, index, list) =>
          !hasCriterion(criterion) &&
          list.findIndex(
            (item) => item.trim().toLowerCase() === criterion.trim().toLowerCase()
          ) === index
      );

      setAiSuggestions(nextSuggestions);
    } catch {
      showToast('Не получилось получить критерии', 'error');
    } finally {
      setIsSuggestingCriteria(false);
    }
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
      <AppHeader title="Критерии" />
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

        {ENABLE_AI_FEATURES ? (
          <View style={styles.aiBlock}>
            <Pressable
              accessibilityRole="button"
              disabled={!decision || isSuggestingCriteria}
              onPress={() => {
                void handleSuggestCriteria();
              }}
              style={({ pressed }) => [
                styles.aiActionCard,
                pressed && !isSuggestingCriteria && styles.pressed,
                (!decision || isSuggestingCriteria) && styles.aiActionDisabled,
              ]}
            >
              <View style={styles.aiActionTop}>
                <View style={styles.aiIcon}>
                  <Text style={styles.aiIconText}>✦</Text>
                </View>
                <View style={styles.aiActionTextWrap}>
                  <View style={styles.aiTitleRow}>
                    <Text style={styles.aiActionTitle}>
                      {isSuggestingCriteria
                        ? 'Подбираем критерии...'
                        : 'Подобрать критерии с AI'}
                    </Text>
                    <View style={styles.aiBadge}>
                      <Text style={styles.aiBadgeText}>AI</Text>
                    </View>
                  </View>
                  <Text style={styles.aiActionDescription}>
                    AI предложит критерии на основе твоего решения и вариантов.
                  </Text>
                </View>
              </View>
            </Pressable>

            {didRequestAiSuggestions && aiSuggestions.length === 0 && !isSuggestingCriteria ? (
              <Text style={styles.aiEmptyText}>
                Не получилось подобрать критерии. Попробуй добавить их вручную.
              </Text>
            ) : null}

            {aiSuggestions.length > 0 ? (
              <Card>
                <View style={styles.aiSuggestions}>
                  <View style={styles.aiTitleRow}>
                    <Text style={styles.aiSuggestionsTitle}>AI предложил</Text>
                    <View style={styles.aiBadge}>
                      <Text style={styles.aiBadgeText}>AI</Text>
                    </View>
                  </View>
                  <View style={styles.chips}>
                    {aiSuggestions.map((criterion) => {
                      const isDisabled = hasCriterion(criterion) || !decisionId;

                      return (
                        <CriteriaChip
                          key={criterion}
                          title={criterion}
                          disabled={isDisabled}
                          onPress={() => handleAddCriterion(criterion)}
                        />
                      );
                    })}
                  </View>
                </View>
              </Card>
            ) : null}
          </View>
        ) : null}

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

type CriteriaChipProps = {
  title: string;
  disabled: boolean;
  onPress: () => void;
};

function CriteriaChip({ title, disabled, onPress }: CriteriaChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        disabled && styles.chipDisabled,
        pressed && !disabled && styles.chipPressed,
      ]}
    >
      <Text style={[styles.chipText, disabled && styles.chipTextDisabled]}>
        {title}
      </Text>
    </Pressable>
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
  aiBlock: {
    gap: 12,
  },
  aiActionCard: {
    borderWidth: 1,
    borderColor: COLORS.accentLight,
    borderRadius: 22,
    padding: 16,
    backgroundColor: COLORS.accentVeryLight,
  },
  aiActionDisabled: {
    opacity: 0.75,
  },
  aiActionTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  aiIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.accentLight,
  },
  aiIconText: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.accentDark,
  },
  aiActionTextWrap: {
    flex: 1,
    gap: 5,
  },
  aiTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  aiActionTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.accentDark,
  },
  aiActionDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.textSecondary,
  },
  aiBadge: {
    borderRadius: 999,
    backgroundColor: COLORS.accentLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  aiBadgeText: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.accentDark,
  },
  aiEmptyText: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.textSecondary,
  },
  aiSuggestions: {
    gap: 12,
  },
  aiSuggestionsTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: COLORS.accentLight,
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
    color: COLORS.accent,
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
  pressed: {
    opacity: 0.82,
  },
});
