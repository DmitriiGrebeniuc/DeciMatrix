import { useRouter } from 'expo-router';
import { useEffect, useState, type ReactNode } from 'react';
import {
  Image,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
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
const PAYPAL_URL = 'https://paypal.me/DmitriiGrebeniuc';

type HomeModal = 'menu' | 'how-it-works' | 'about' | 'support' | null;
type SupportMethod = 'paypal' | 'mia';

const SUPPORT_COPY = {
  title: 'Поддержать DeciMatrix',
  description:
    'Если тебе полезна идея DeciMatrix, ты можешь поддержать развитие проекта. Поддержка помогает оплачивать хостинг, AI-запросы, инструменты и новые функции.',
  paypalDescription: 'Подходит для международной поддержки.',
  paypalButton: 'Открыть PayPal',
  miaDescription:
    'Удобный способ поддержать проект из Молдовы. Отсканируйте QR-код в банковском приложении.',
};

const SUPPORT_CONTACTS = [
  {
    icon: 'TG',
    title: 'Telegram',
    value: '@jivot_piva',
    url: 'https://t.me/jivot_piva',
  },
  {
    icon: 'BOT',
    title: 'Telegram bot',
    value: 't.me/gathrapp_bot',
    url: 'https://t.me/gathrapp_bot',
  },
  {
    icon: 'IG',
    title: 'Instagram',
    value: 'instagram.com/gathr.app',
    url: 'https://www.instagram.com/gathr.app/',
  },
  {
    icon: 'WEB',
    title: 'Сайт',
    value: 'gathr-app.site',
    url: 'https://gathr-app.site',
  },
  {
    icon: 'INFO',
    title: 'О проекте',
    value: 'about.gathr-app.site',
    url: 'https://about.gathr-app.site/',
  },
] as const;

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

  async function openExternalUrl(url: string): Promise<void> {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.open(url, '_blank', 'noopener,noreferrer');
        return;
      }

      await Linking.openURL(url);
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
        onSupport={() => setHomeModal('support')}
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
        <Text style={styles.infoText}>Создано Дмитрием Гребенюком.</Text>
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
              void openExternalUrl(GATHR_URL);
            }}
          />
        </View>
        <Text style={styles.infoText}>Версия: 1.0.0</Text>
      </InfoModal>
      <SupportModal
        visible={homeModal === 'support'}
        onClose={() => setHomeModal(null)}
        onOpenPayPal={() => {
          void openExternalUrl(PAYPAL_URL);
        }}
        onOpenUrl={(url) => {
          void openExternalUrl(url);
        }}
      />
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
  onSupport: () => void;
};

function HomeMenuModal({
  visible,
  onClose,
  onHowItWorks,
  onAbout,
  onSupport,
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
          <MenuItem title="Поддержать проект" onPress={onSupport} />
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

type SupportModalProps = {
  visible: boolean;
  onClose: () => void;
  onOpenPayPal: () => void;
  onOpenUrl: (url: string) => void;
};

function SupportModal({
  visible,
  onClose,
  onOpenPayPal,
  onOpenUrl,
}: SupportModalProps) {
  const [method, setMethod] = useState<SupportMethod>('paypal');
  const copy = SUPPORT_COPY;

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Pressable style={styles.modalBackdrop} onPress={onClose} />
        <View style={styles.supportSheet}>
          <ScrollView
            style={styles.supportScroller}
            contentContainerStyle={styles.supportScroll}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>{copy.title}</Text>
              <Text style={styles.infoText}>{copy.description}</Text>
            </View>

            <SegmentedControl
              value={method}
              options={[
                { label: 'PayPal', value: 'paypal' },
                { label: 'MIA QR', value: 'mia' },
              ]}
              onChange={setMethod}
            />

            {method === 'paypal' ? (
              <View style={styles.supportCard}>
                <Text style={styles.supportMethodTitle}>PayPal</Text>
                <Text style={styles.infoText}>{copy.paypalDescription}</Text>
                <Button
                  title={copy.paypalButton}
                  variant="secondary"
                  onPress={onOpenPayPal}
                />
              </View>
            ) : (
              <View style={styles.supportCard}>
                <Text style={styles.supportMethodTitle}>MIA QR</Text>
                <Text style={styles.infoText}>{copy.miaDescription}</Text>
                <View style={styles.qrFrame}>
                  <Image
                    source={require('../public/mia-qr.jpg')}
                    style={styles.qrImage}
                    resizeMode="contain"
                  />
                </View>
              </View>
            )}

            <View style={styles.contactsCard}>
              <View style={styles.contactsHeader}>
                <Text style={styles.supportMethodTitle}>Контакты</Text>
                <Text style={styles.infoText}>
                  Если хочешь связаться со мной по поводу проекта,
                  сотрудничества или обратной связи, используй один из
                  контактов ниже.
                </Text>
              </View>
              <View style={styles.contactsList}>
                {SUPPORT_CONTACTS.map((contact) => (
                  <ContactRow
                    key={contact.url}
                    icon={contact.icon}
                    title={contact.title}
                    value={contact.value}
                    onPress={() => onOpenUrl(contact.url)}
                  />
                ))}
              </View>
            </View>

            <Button title="Закрыть" onPress={onClose} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

type ContactRowProps = {
  icon: string;
  title: string;
  value: string;
  onPress: () => void;
};

function ContactRow({ icon, title, value, onPress }: ContactRowProps) {
  return (
    <Pressable
      accessibilityRole="link"
      onPress={onPress}
      style={({ pressed }) => [
        styles.contactRow,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.contactIcon}>
        <Text style={styles.contactIconText}>{icon}</Text>
      </View>
      <View style={styles.contactTextWrap}>
        <Text style={styles.contactTitle} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.contactValue} numberOfLines={1}>
          {value}
        </Text>
      </View>
      <Text style={styles.contactArrow}>›</Text>
    </Pressable>
  );
}

type SegmentOption<T extends string> = {
  label: string;
  value: T;
};

type SegmentedControlProps<T extends string> = {
  value: T;
  options: SegmentOption<T>[];
  onChange: (value: T) => void;
};

function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <View style={styles.segmented}>
      {options.map((option) => {
        const isSelected = option.value === value;

        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            onPress={() => onChange(option.value)}
            style={[
              styles.segment,
              isSelected && styles.segmentSelected,
            ]}
          >
            <Text
              style={[
                styles.segmentText,
                isSelected && styles.segmentTextSelected,
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
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
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
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
  supportSheet: {
    width: '100%',
    maxHeight: '96%',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 24,
    backgroundColor: COLORS.surface,
    overflow: 'hidden',
  },
  supportScroller: {
    flexGrow: 0,
  },
  supportScroll: {
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 28,
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
  segmented: {
    flexDirection: 'row',
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.accentLight,
    borderRadius: 16,
    padding: 4,
    backgroundColor: COLORS.accentVeryLight,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 12,
    paddingVertical: 9,
  },
  segmentSelected: {
    backgroundColor: COLORS.surface,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textSecondary,
  },
  segmentTextSelected: {
    color: COLORS.accentDark,
  },
  supportCard: {
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    padding: 12,
    backgroundColor: COLORS.surface,
  },
  contactsCard: {
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    padding: 12,
    backgroundColor: COLORS.surface,
  },
  contactsHeader: {
    gap: 6,
  },
  contactsList: {
    gap: 8,
  },
  contactRow: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.accentLight,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: COLORS.accentVeryLight,
  },
  contactIcon: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.accentLight,
  },
  contactIconText: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.accentDark,
  },
  contactTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  contactTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  contactValue: {
    marginTop: 2,
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  contactArrow: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.accent,
  },
  supportMethodTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  qrFrame: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    width: 244,
    height: 244,
    borderRadius: 18,
    padding: 8,
    backgroundColor: COLORS.surface,
  },
  qrImage: {
    width: 228,
    height: 228,
  },
  pressed: {
    opacity: 0.75,
  },
});
