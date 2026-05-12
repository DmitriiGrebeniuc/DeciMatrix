import { useRouter } from 'expo-router';
import { useEffect, useState, type ReactNode } from 'react';
import {
  Linking,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { AppHeader } from '../src/components/ui/AppHeader';
import { Button } from '../src/components/ui/Button';
import { Card } from '../src/components/ui/Card';
import { ConfirmModal } from '../src/components/ui/ConfirmModal';
import { LogoMark } from '../src/components/ui/LogoMark';
import { ScreenContainer } from '../src/components/ui/ScreenContainer';
import { useToast } from '../src/components/ui/Toast';
import { COLORS } from '../src/constants/colors';
import { calculateDecisionResult } from '../src/services/decisionCalculator';
import { canShowResult } from '../src/services/decisionValidation';
import { useDecisionStore } from '../src/store/decisionStore';
import type { Decision } from '../src/types/decision';
import { formatDecisionDate } from '../src/utils/dates';

const TAGLINE =
  'Разложи выбор по полочкам и посмотри, какой вариант подходит лучше.';
const GATHR_URL = 'https://about.gathr-app.site/';

type HomeModal = 'menu' | 'how-it-works' | 'about' | null;

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
  const { showToast } = useToast();
  const decisions = useDecisionStore((state) => state.decisions);
  const isLoaded = useDecisionStore((state) => state.isLoaded);
  const load = useDecisionStore((state) => state.load);
  const deleteDecision = useDecisionStore((state) => state.deleteDecision);
  const [homeModal, setHomeModal] = useState<HomeModal>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<Decision | null>(null);

  useEffect(() => {
    if (!isLoaded) {
      void load();
    }
  }, [isLoaded, load]);

  function openDecision(decision: Decision): void {
    router.push(`/decision/${decision.id}`);
  }

  function handleDeleteDecision(): void {
    if (!deleteCandidate) {
      return;
    }

    deleteDecision(deleteCandidate.id);
    setDeleteCandidate(null);
    showToast('Решение удалено', 'success');
  }

  async function openGathr(): Promise<void> {
    try {
      await Linking.openURL(GATHR_URL);
    } catch {
      showToast('Не получилось открыть ссылку', 'error');
    }
  }

  return (
    <ScreenContainer scroll>
      <AppHeader home showMenu onMenuPress={() => setHomeModal('menu')} />
      <View style={styles.header}>
        <View style={styles.titleBlock}>
          <Text style={styles.tagline}>{TAGLINE}</Text>
        </View>
        <Button
          title="Создать решение"
          onPress={() => router.push('/create')}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Последние решения</Text>

        {decisions.length === 0 ? (
          <Card>
            <View style={styles.emptyState}>
              <LogoMark size={56} />
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
                <Card key={decision.id}>
                  <View style={styles.cardContent}>
                    <View style={styles.cardHeader}>
                      <Pressable
                        accessibilityRole="button"
                        onPress={() => openDecision(decision)}
                        style={({ pressed }) => [
                          styles.cardTitleButton,
                          pressed && styles.pressed,
                        ]}
                      >
                        <Text style={styles.cardTitle} numberOfLines={2}>
                          {decision.title}
                        </Text>
                      </Pressable>

                      {decision.status === 'draft' ? (
                        <View style={styles.badge}>
                          <Text style={styles.badgeText}>Черновик</Text>
                        </View>
                      ) : null}

                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Удалить решение ${decision.title}`}
                        hitSlop={10}
                        onPress={() => setDeleteCandidate(decision)}
                        style={({ pressed }) => [
                          styles.deleteButton,
                          pressed && styles.pressed,
                        ]}
                      >
                        <Text style={styles.deleteText}>×</Text>
                      </Pressable>
                    </View>

                    <Pressable
                      accessibilityRole="button"
                      onPress={() => openDecision(decision)}
                      style={({ pressed }) => pressed && styles.pressed}
                    >
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
                            Изменено {formatDecisionDate(decision.updatedAt)}
                          </Text>
                        </View>
                      ) : (
                        <Text style={styles.continueText}>Продолжить</Text>
                      )}
                    </Pressable>
                  </View>
                </Card>
              );
            })}
          </View>
        )}
      </View>

      <HomeMenuModal
        visible={homeModal === 'menu'}
        onClose={() => setHomeModal(null)}
        onHowItWorks={() => setHomeModal('how-it-works')}
        onAbout={() => setHomeModal('about')}
      />
      <InfoModal
        visible={homeModal === 'how-it-works'}
        title="Как это работает"
        buttonTitle="Понятно"
        onClose={() => setHomeModal(null)}
      >
        <Text style={styles.infoText}>1. Добавь варианты.</Text>
        <Text style={styles.infoText}>2. Добавь критерии.</Text>
        <Text style={styles.infoText}>3. Покажи, что важнее.</Text>
        <Text style={styles.infoText}>4. Оцени варианты.</Text>
        <Text style={styles.infoText}>5. Получи результат.</Text>
        <Text style={styles.infoText}>
          DeciMatrix считает итог автоматически, но решение всегда остается за
          тобой.
        </Text>
      </InfoModal>
      <InfoModal
        visible={homeModal === 'about'}
        title="DeciMatrix"
        buttonTitle="Закрыть"
        onClose={() => setHomeModal(null)}
      >
        <Text style={styles.infoText}>
          Приложение помогает сравнивать варианты и принимать решения
          спокойнее.
        </Text>
        <Text style={styles.infoText}>Created by Dmitrii Grebeniuc.</Text>
        <View style={styles.gathrCard}>
          <Text style={styles.gathrTitle}>Другой проект автора</Text>
          <Text style={styles.gathrText}>
            Gathr помогает организовывать встречи и события проще: с понятными
            участниками, местом и деталями.
          </Text>
          <Button
            title="Открыть Gathr"
            variant="secondary"
            onPress={() => {
              void openGathr();
            }}
          />
        </View>
        <Text style={styles.infoText}>Версия: 1.0.0</Text>
      </InfoModal>
      <ConfirmModal
        visible={Boolean(deleteCandidate)}
        title="Удалить решение?"
        message="Это действие нельзя отменить."
        confirmLabel="Удалить"
        danger
        onConfirm={handleDeleteDecision}
        onCancel={() => setDeleteCandidate(null)}
      />
    </ScreenContainer>
  );
}

type HomeMenuModalProps = {
  visible: boolean;
  onClose: () => void;
  onHowItWorks: () => void;
  onAbout: () => void;
};

function HomeMenuModal({
  visible,
  onClose,
  onHowItWorks,
  onAbout,
}: HomeMenuModalProps) {
  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.menuSheet}>
          <Text style={styles.menuTitle}>Меню</Text>
          <MenuItem title="Как это работает" onPress={onHowItWorks} />
          <MenuItem title="О приложении" onPress={onAbout} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

type InfoModalProps = {
  visible: boolean;
  title: string;
  buttonTitle: string;
  children: ReactNode;
  onClose: () => void;
};

function InfoModal({
  visible,
  title,
  buttonTitle,
  children,
  onClose,
}: InfoModalProps) {
  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.infoSheet}>
          <Text style={styles.infoTitle}>{title}</Text>
          <View style={styles.infoContent}>{children}</View>
          <Button title={buttonTitle} onPress={onClose} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

type MenuItemProps = {
  title: string;
  onPress: () => void;
};

function MenuItem({ title, onPress }: MenuItemProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.menuItem, pressed && styles.pressed]}
    >
      <Text style={styles.menuItemText}>{title}</Text>
    </Pressable>
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
    alignItems: 'flex-start',
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
  cardTitleButton: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  badge: {
    borderWidth: 1,
    borderColor: COLORS.accentLight,
    borderRadius: 999,
    backgroundColor: COLORS.accentVeryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.accentDark,
  },
  deleteButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 999,
    backgroundColor: COLORS.surface,
  },
  deleteText: {
    marginTop: -2,
    fontSize: 22,
    lineHeight: 24,
    fontWeight: '700',
    color: COLORS.danger,
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 18,
    backgroundColor: 'rgba(31, 41, 51, 0.28)',
  },
  menuSheet: {
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 24,
    padding: 16,
    backgroundColor: COLORS.surface,
  },
  menuTitle: {
    paddingHorizontal: 4,
    paddingBottom: 4,
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  menuItem: {
    borderWidth: 1,
    borderColor: COLORS.accentLight,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 15,
    backgroundColor: COLORS.accentVeryLight,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.accentDark,
  },
  infoSheet: {
    gap: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 24,
    padding: 20,
    backgroundColor: COLORS.surface,
  },
  infoTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  infoContent: {
    gap: 10,
  },
  infoText: {
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.textSecondary,
  },
  gathrCard: {
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.accentLight,
    borderRadius: 18,
    padding: 16,
    backgroundColor: COLORS.accentVeryLight,
  },
  gathrTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  gathrText: {
    fontSize: 15,
    lineHeight: 21,
    color: COLORS.textSecondary,
  },
  pressed: {
    opacity: 0.75,
  },
});
