import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '../src/components/ui/Card';
import { Button } from '../src/components/ui/Button';
import { ScreenContainer } from '../src/components/ui/ScreenContainer';
import { COLORS } from '../src/constants/colors';
import { calculateDecisionResult } from '../src/services/decisionCalculator';
import { canShowResult } from '../src/services/decisionValidation';
import { useDecisionStore } from '../src/store/decisionStore';
import type { Decision } from '../src/types/decision';
import { formatDecisionDate } from '../src/utils/dates';

const TAGLINE =
  'Разложи выбор по полочкам и посмотри, какой вариант подходит лучше.';

function getWinnerName(decision: Decision): string | null {
  if (!canShowResult(decision)) {
    return null;
  }

  const result = calculateDecisionResult(decision);
  const winner = decision.options.find(
    (option) => option.id === result.winnerOptionId
  );

  return winner?.name ?? null;
}

export default function HomeScreen() {
  const router = useRouter();
  const decisions = useDecisionStore((state) => state.decisions);
  const isLoaded = useDecisionStore((state) => state.isLoaded);
  const load = useDecisionStore((state) => state.load);

  useEffect(() => {
    if (!isLoaded) {
      void load();
    }
  }, [isLoaded, load]);

  function openDecision(decision: Decision): void {
    router.push(`/decision/${decision.id}`);
  }

  return (
    <ScreenContainer scroll>
      <View style={styles.header}>
        <View style={styles.titleBlock}>
          <Text style={styles.appName}>DeciMatrix</Text>
          <Text style={styles.tagline}>{TAGLINE}</Text>
        </View>
        <Button
          title="Создать решение"
          onPress={() => router.push('/create')}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Мои решения</Text>

        {decisions.length === 0 ? (
          <Card>
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Пока здесь пусто</Text>
              <Text style={styles.emptyText}>
                Создай первое решение - добавь варианты, критерии и получи
                понятный результат.
              </Text>
            </View>
          </Card>
        ) : (
          <View style={styles.list}>
            {decisions.map((decision) => {
              const winnerName =
                decision.status === 'completed'
                  ? getWinnerName(decision)
                  : null;

              return (
                <Card
                  key={decision.id}
                  onPress={() => openDecision(decision)}
                >
                  <View style={styles.cardContent}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.cardTitle}>{decision.title}</Text>
                      {decision.status === 'draft' ? (
                        <View style={styles.badge}>
                          <Text style={styles.badgeText}>Черновик</Text>
                        </View>
                      ) : null}
                    </View>

                    {decision.status === 'completed' ? (
                      <View style={styles.cardMeta}>
                        {winnerName ? (
                          <Text style={styles.winner}>
                            Лучший вариант: {winnerName}
                          </Text>
                        ) : (
                          <Text style={styles.muted}>
                            Результат пока нельзя рассчитать
                          </Text>
                        )}
                        <Text style={styles.muted}>
                          Обновлено: {formatDecisionDate(decision.updatedAt)}
                        </Text>
                      </View>
                    ) : (
                      <Text style={styles.continueText}>Продолжить</Text>
                    )}
                  </View>
                </Card>
              );
            })}
          </View>
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 24,
    paddingBottom: 28,
  },
  titleBlock: {
    gap: 10,
  },
  appName: {
    fontSize: 34,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  tagline: {
    fontSize: 17,
    lineHeight: 24,
    color: COLORS.textSecondary,
  },
  section: {
    gap: 14,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  emptyState: {
    gap: 8,
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
  list: {
    gap: 12,
  },
  cardContent: {
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  cardTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
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
  cardMeta: {
    gap: 4,
  },
  winner: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  muted: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  continueText: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.accent,
  },
});
