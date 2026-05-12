import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { OptionCard } from '../src/components/decision/OptionCard';
import { Button } from '../src/components/ui/Button';
import { Card } from '../src/components/ui/Card';
import { ScreenContainer } from '../src/components/ui/ScreenContainer';
import { TextInput } from '../src/components/ui/TextInput';
import { COLORS } from '../src/constants/colors';
import { useDecisionStore } from '../src/store/decisionStore';

export default function AddOptionsScreen() {
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
  const addOption = useDecisionStore((state) => state.addOption);
  const removeOption = useDecisionStore((state) => state.removeOption);
  const [optionName, setOptionName] = useState('');
  const [error, setError] = useState<string | undefined>();

  const decisionId = params.decisionId ?? currentDecisionId;
  const decision = useMemo(
    () => decisions.find((item) => item.id === decisionId),
    [decisions, decisionId]
  );
  const trimmedOptionName = optionName.trim();
  const canContinue = (decision?.options.length ?? 0) >= 2;

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

  function handleAddOption(): void {
    if (!decisionId || trimmedOptionName.length === 0) {
      return;
    }

    const hasDuplicate = decision?.options.some(
      (option) =>
        option.name.trim().toLowerCase() === trimmedOptionName.toLowerCase()
    );

    if (hasDuplicate) {
      setError('Такой вариант уже есть.');
      return;
    }

    addOption(decisionId, trimmedOptionName);
    setOptionName('');
    setError(undefined);
  }

  function handleRemoveOption(optionId: string): void {
    if (!decisionId) {
      return;
    }

    removeOption(decisionId, optionId);
  }

  function handleNext(): void {
    if (!decisionId || !canContinue) {
      return;
    }

    router.push({
      pathname: '/criteria',
      params: {
        decisionId,
      },
    });
  }

  return (
    <ScreenContainer scroll>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Между чем выбираем?</Text>
          <Text style={styles.hint}>
            Добавь варианты, между которыми выбираешь.
          </Text>
        </View>

        <View style={styles.addRow}>
          <View style={styles.inputWrap}>
            <TextInput
              value={optionName}
              onChangeText={(value) => {
                setOptionName(value);
                setError(undefined);
              }}
              placeholder="Например: MacBook Air M4"
              error={error}
            />
          </View>
          <View style={styles.addButton}>
            <Button
              title="+"
              onPress={handleAddOption}
              disabled={trimmedOptionName.length === 0 || !decisionId}
            />
          </View>
        </View>

        {!decision ? (
          <Card>
            <Text style={styles.emptyText}>
              Решение не найдено. Вернись назад и создай решение заново.
            </Text>
          </Card>
        ) : (
          <View style={styles.list}>
            {decision.options.map((option) => (
              <OptionCard
                key={option.id}
                name={option.name}
                onDelete={() => handleRemoveOption(option.id)}
              />
            ))}
          </View>
        )}

        {!canContinue ? (
          <Text style={styles.helper}>
            Добавь минимум два варианта, чтобы было что сравнивать.
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
