import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Image,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppHomeScreen from './app';
import { Button } from '../src/components/ui/Button';
import { LogoMark } from '../src/components/ui/LogoMark';
import { COLORS } from '../src/constants/colors';

const APK_DOWNLOAD_URL = '#';
const PAYPAL_URL = 'https://paypal.me/DmitriiGrebeniuc';

const navItems = [
  { label: 'Что это', href: '#what' },
  { label: 'Как работает', href: '#how' },
  { label: 'Возможности', href: '#features' },
  { label: 'Скачать', href: '#download' },
  { label: 'Поддержать', href: '#support' },
] as const;

const steps = [
  ['Добавь варианты', 'Например: MacBook, Lenovo, ASUS или несколько городов для переезда.'],
  ['Задай критерии', 'Цена, удобство, надежность, перспективы, риски или любые другие важные параметры.'],
  ['Укажи важность', 'Не все критерии одинаковы. DeciMatrix учитывает вес каждого критерия.'],
  ['Оцени варианты', 'Поставь оценки по каждому критерию и получи итоговую картину.'],
  ['Получи AI-разбор', 'AI объяснит результат, сильные и слабые стороны вариантов.'],
] as const;

const features = [
  ['Взвешенная матрица', 'Критерии влияют на результат в зависимости от их важности.'],
  ['AI-помощь с критериями', 'Если сложно понять параметры сравнения, AI предложит критерии.'],
  ['AI-разбор результата', 'Приложение объясняет, почему один вариант оказался сильнее другого.'],
  ['Простой мобильный интерфейс', 'Без сложных таблиц и лишней перегрузки.'],
  ['Для разных решений', 'Подходит для личных, рабочих, бытовых и продуктовых выборов.'],
  ['Web и Android', 'Можно использовать в браузере или установить Android APK.'],
] as const;

const examples = [
  'Какой ноутбук купить?',
  'Куда переехать жить?',
  'Какую работу выбрать?',
  'Какой проект развивать первым?',
  'Какой курс или навык изучать?',
  'Какой вариант покупки выгоднее?',
  'Какую идею протестировать первой?',
  'Какой инструмент выбрать для работы?',
];

const contacts = [
  ['Telegram', 'https://t.me/jivot_piva'],
  ['Instagram', 'https://www.instagram.com/gathr.app/'],
  ['Gathr', 'https://gathr-app.site'],
  ['О Gathr', 'https://about.gathr-app.site/'],
] as const;

export default function LandingScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [supportMethod, setSupportMethod] = useState<'paypal' | 'mia'>('paypal');
  const isNarrow = width < 760;

  if (Platform.OS !== 'web') {
    return <AppHomeScreen />;
  }

  function openExternal(url: string): void {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }

    void Linking.openURL(url);
  }

  function openApp(): void {
    router.push('/app');
  }

  function goToHash(hash: string): void {
    if (typeof window !== 'undefined') {
      window.location.hash = hash;
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.page}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.header, isNarrow && styles.headerNarrow]}>
          <Link href="/" style={styles.brand}>
            <LogoMark size={38} rounded={12} />
            <Text style={styles.brandText}>DeciMatrix</Text>
          </Link>

          {!isNarrow ? (
            <View style={styles.nav}>
              {navItems.map((item) => (
                <Pressable
                  key={item.href}
                  accessibilityRole="link"
                  onPress={() => goToHash(item.href)}
                  style={({ pressed }) => pressed && styles.pressed}
                >
                  <Text style={styles.navText}>{item.label}</Text>
                </Pressable>
              ))}
            </View>
          ) : null}

          <Pressable
            accessibilityRole="link"
            onPress={openApp}
            style={({ pressed }) => [styles.headerCta, pressed && styles.pressed]}
          >
            <Text style={styles.headerCtaText}>Открыть приложение</Text>
          </Pressable>
        </View>

        <View style={[styles.hero, isNarrow && styles.heroNarrow]}>
          <View style={styles.heroText}>
            <Text style={styles.kicker}>Взвешенная матрица решений</Text>
            <Text style={[styles.heroTitle, isNarrow && styles.heroTitleNarrow]}>
              DeciMatrix
            </Text>
            <Text style={[styles.heroSubtitle, isNarrow && styles.heroSubtitleNarrow]}>
              Принимай решения не на эмоциях, а через критерии, веса и AI-разбор.
            </Text>
            <Text style={styles.heroDescription}>
              DeciMatrix помогает сравнивать варианты по важным критериям, видеть
              итоговую оценку и получать понятное объяснение результата с помощью AI.
            </Text>
            <View style={styles.heroActions}>
              <Button title="Открыть приложение" onPress={openApp} />
              <Button
                title="Скачать APK"
                variant="secondary"
                onPress={() => goToHash('#download')}
              />
              <Button
                title="Поддержать разработчика"
                variant="secondary"
                onPress={() => goToHash('#support')}
              />
            </View>
          </View>

          <View style={[styles.phonePreview, isNarrow && styles.phonePreviewNarrow]}>
            <View style={styles.phoneHeader}>
              <LogoMark size={34} rounded={11} />
              <Text style={styles.phoneBrand}>DeciMatrix</Text>
            </View>
            <Text style={styles.phoneTitle}>Какой ноутбук купить?</Text>
            <View style={styles.progressTrack}>
              <View style={styles.progressFill} />
            </View>
            <View style={styles.previewCard}>
              <Text style={styles.previewCardTitle}>Лучше всего подходит</Text>
              <Text style={styles.previewWinner}>MacBook Air M4</Text>
              <Text style={styles.previewPercent}>86% совпадения</Text>
              <Text style={styles.previewText}>
                Этот вариант лучше всего совпал с тем, что для тебя важнее всего.
              </Text>
            </View>
          </View>
        </View>

        <Section id="what" title="Что такое взвешенная матрица принятия решений?">
          <Text style={styles.sectionText}>
            Взвешенная матрица принятия решений - это способ сравнить несколько
            вариантов по набору критериев. Каждый критерий получает свой вес:
            чем он важнее, тем сильнее влияет на итоговый результат. Затем каждый
            вариант оценивается по этим критериям, а DeciMatrix рассчитывает итоговый балл.
          </Text>
          <View style={styles.noteCard}>
            <Text style={styles.noteTitle}>Пример</Text>
            <Text style={styles.sectionText}>
              При выборе ноутбука цена может иметь вес 30%, автономность - 25%,
              производительность - 25%, экран - 20%. Даже если один вариант дешевле,
              он не всегда победит, если сильно проигрывает по более важным критериям.
            </Text>
          </View>
          <Text style={styles.sectionText}>
            Такой подход не принимает решение за вас, но помогает увидеть его структуру
            и снизить влияние случайных эмоций.
          </Text>
        </Section>

        <Section title="Когда вариантов много, выбрать сложнее">
          <Text style={styles.sectionText}>
            Мы часто выбираем на ощущениях: какой ноутбук купить, куда переехать,
            какую работу выбрать, какой проект развивать первым. Проблема в том,
            что в голове все критерии смешиваются. DeciMatrix помогает разложить
            выбор на понятные части и увидеть, что действительно влияет на итог.
          </Text>
        </Section>

        <Section id="how" title="Как это работает">
          <View style={styles.stepsGrid}>
            {steps.map(([title, text], index) => (
              <View key={title} style={styles.stepCard}>
                <Text style={styles.stepNumber}>{index + 1}</Text>
                <Text style={styles.cardTitle}>{title}</Text>
                <Text style={styles.cardText}>{text}</Text>
              </View>
            ))}
          </View>
        </Section>

        <Section id="features" title="Возможности DeciMatrix">
          <View style={styles.cardsGrid}>
            {features.map(([title, text]) => (
              <View key={title} style={styles.featureCard}>
                <Text style={styles.cardTitle}>{title}</Text>
                <Text style={styles.cardText}>{text}</Text>
              </View>
            ))}
          </View>
        </Section>

        <Section title="Для каких решений подходит">
          <View style={styles.chips}>
            {examples.map((example) => (
              <View key={example} style={styles.chip}>
                <Text style={styles.chipText}>{example}</Text>
              </View>
            ))}
          </View>
        </Section>

        <Section id="download" title="Скачать DeciMatrix">
          <Text style={styles.sectionText}>
            DeciMatrix доступен как веб-приложение и тестовая Android APK-версия.
          </Text>
          <View style={styles.actionRow}>
            <Button title="Открыть веб-версию" onPress={openApp} />
            <Button
              title="Скачать APK для Android"
              variant="secondary"
              onPress={() => {
                if (APK_DOWNLOAD_URL === '#') {
                  return;
                }
                openExternal(APK_DOWNLOAD_URL);
              }}
              disabled={APK_DOWNLOAD_URL === '#'}
            />
          </View>
          <Text style={styles.smallText}>
            APK-версия пока распространяется вне Google Play. Android может показать
            предупреждение об установке из внешнего источника.
          </Text>
        </Section>

        <Section id="support" title="Поддержать разработчика">
          <Text style={styles.sectionText}>
            DeciMatrix развивается как независимый проект. Поддержка помогает оплачивать
            хостинг, AI-запросы, инструменты разработки, тестирование и новые функции.
          </Text>
          <View style={styles.supportTabs}>
            <SegmentButton
              title="PayPal"
              active={supportMethod === 'paypal'}
              onPress={() => setSupportMethod('paypal')}
            />
            <SegmentButton
              title="MIA QR"
              active={supportMethod === 'mia'}
              onPress={() => setSupportMethod('mia')}
            />
          </View>
          {supportMethod === 'paypal' ? (
            <View style={styles.supportCard}>
              <Text style={styles.cardTitle}>PayPal</Text>
              <Text style={styles.cardText}>Подходит для международной поддержки.</Text>
              <Button
                title="Поддержать через PayPal"
                variant="secondary"
                onPress={() => openExternal(PAYPAL_URL)}
              />
            </View>
          ) : (
            <View style={styles.supportCard}>
              <Text style={styles.cardTitle}>MIA QR</Text>
              <Text style={styles.cardText}>
                Для поддержки из Молдовы можно отсканировать QR-код в банковском приложении.
              </Text>
              <View style={styles.qrFrame}>
                <Image
                  source={{ uri: '/mia-qr.jpg' }}
                  style={styles.qrImage}
                  resizeMode="contain"
                />
              </View>
            </View>
          )}
        </Section>

        <Section id="contacts" title="Контакты">
          <Text style={styles.sectionText}>
            Если хочешь дать обратную связь, предложить идею или обсудить сотрудничество,
            можно связаться со мной.
          </Text>
          <View style={styles.contactGrid}>
            {contacts.map(([label, url]) => (
              <Pressable
                key={url}
                accessibilityRole="link"
                onPress={() => openExternal(url)}
                style={({ pressed }) => [styles.contactLink, pressed && styles.pressed]}
              >
                <Text style={styles.contactLabel}>{label}</Text>
                <Text style={styles.contactUrl}>{url.replace('https://', '')}</Text>
              </Pressable>
            ))}
          </View>
        </Section>

        <Section id="privacy" title="Конфиденциальность">
          <Text style={styles.sectionText}>
            Для работы AI-функций DeciMatrix может отправлять текст решения, варианты,
            критерии и оценки на backend приложения для обработки. Не вводите чувствительные
            персональные данные, пароли, документы, медицинскую или финансовую информацию.
            AI-разбор является вспомогательным объяснением и не заменяет профессиональную консультацию.
          </Text>
        </Section>

        <View style={[styles.footer, isNarrow && styles.footerNarrow]}>
          <View>
            <Text style={styles.footerBrand}>DeciMatrix</Text>
            <Text style={styles.footerText}>Independent digital product by Dmitrii Grebeniuc</Text>
          </View>
          <View style={[styles.footerLinks, isNarrow && styles.footerLinksNarrow]}>
            <FooterLink label="Открыть приложение" onPress={openApp} />
            <FooterLink label="Скачать APK" onPress={() => goToHash('#download')} />
            <FooterLink label="Поддержать" onPress={() => goToHash('#support')} />
            <FooterLink label="Контакты" onPress={() => goToHash('#contacts')} />
            <FooterLink label="Privacy note" onPress={() => goToHash('#privacy')} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

type SectionProps = {
  id?: string;
  title: string;
  children: React.ReactNode;
};

function Section({ id, title, children }: SectionProps) {
  return (
    <View id={id} nativeID={id} style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

type SegmentButtonProps = {
  title: string;
  active: boolean;
  onPress: () => void;
};

function SegmentButton({ title, active, onPress }: SegmentButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.segmentButton, active && styles.segmentButtonActive]}
    >
      <Text style={[styles.segmentButtonText, active && styles.segmentButtonTextActive]}>
        {title}
      </Text>
    </Pressable>
  );
}

type FooterLinkProps = {
  label: string;
  onPress: () => void;
};

function FooterLink({ label, onPress }: FooterLinkProps) {
  return (
    <Pressable accessibilityRole="link" onPress={onPress}>
      <Text style={styles.footerLink}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  page: {
    width: '100%',
    maxWidth: 1180,
    alignSelf: 'center',
    gap: 30,
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
  },
  headerNarrow: {
    alignItems: 'flex-start',
    flexDirection: 'column',
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    textDecorationLine: 'none',
  },
  brandText: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  nav: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 18,
  },
  navText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  headerCta: {
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.accent,
  },
  headerCtaText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.surface,
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 28,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 32,
    padding: 26,
    backgroundColor: COLORS.surface,
  },
  heroNarrow: {
    flexDirection: 'column',
    alignItems: 'stretch',
    padding: 18,
  },
  heroText: {
    flex: 1,
    minWidth: 0,
    gap: 14,
  },
  kicker: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    overflow: 'hidden',
    backgroundColor: COLORS.accentVeryLight,
    color: COLORS.accentDark,
    fontSize: 13,
    fontWeight: '800',
  },
  heroTitle: {
    fontSize: 56,
    lineHeight: 62,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  heroTitleNarrow: {
    fontSize: 42,
    lineHeight: 48,
  },
  heroSubtitle: {
    maxWidth: 660,
    fontSize: 25,
    lineHeight: 33,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  heroSubtitleNarrow: {
    fontSize: 21,
    lineHeight: 29,
  },
  heroDescription: {
    maxWidth: 620,
    fontSize: 17,
    lineHeight: 26,
    color: COLORS.textSecondary,
  },
  heroActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 4,
  },
  phonePreview: {
    width: 330,
    gap: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 32,
    padding: 22,
    backgroundColor: COLORS.background,
  },
  phonePreviewNarrow: {
    width: '100%',
  },
  phoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  phoneBrand: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  phoneTitle: {
    fontSize: 23,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  progressTrack: {
    height: 7,
    borderRadius: 999,
    backgroundColor: COLORS.accentLight,
  },
  progressFill: {
    width: '72%',
    height: '100%',
    borderRadius: 999,
    backgroundColor: COLORS.accent,
  },
  previewCard: {
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.accentLight,
    borderRadius: 24,
    padding: 18,
    backgroundColor: COLORS.accentVeryLight,
  },
  previewCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.accentDark,
  },
  previewWinner: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  previewPercent: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.accent,
  },
  previewText: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.textSecondary,
  },
  section: {
    gap: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 28,
    padding: 22,
    backgroundColor: COLORS.surface,
  },
  sectionTitle: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  sectionBody: {
    gap: 14,
  },
  sectionText: {
    maxWidth: 850,
    fontSize: 16,
    lineHeight: 25,
    color: COLORS.textSecondary,
  },
  noteCard: {
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.accentLight,
    borderRadius: 20,
    padding: 16,
    backgroundColor: COLORS.accentVeryLight,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.accentDark,
  },
  stepsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  stepCard: {
    flexGrow: 1,
    flexBasis: 190,
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    padding: 16,
    backgroundColor: COLORS.background,
  },
  stepNumber: {
    width: 34,
    height: 34,
    borderRadius: 17,
    overflow: 'hidden',
    textAlign: 'center',
    lineHeight: 34,
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.accentDark,
    backgroundColor: COLORS.accentLight,
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  featureCard: {
    flexGrow: 1,
    flexBasis: 280,
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    padding: 16,
    backgroundColor: COLORS.background,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  cardText: {
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.textSecondary,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    borderWidth: 1,
    borderColor: COLORS.accentLight,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: COLORS.accentVeryLight,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.accentDark,
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  smallText: {
    maxWidth: 760,
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.textMuted,
  },
  supportTabs: {
    flexDirection: 'row',
    maxWidth: 420,
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.accentLight,
    borderRadius: 18,
    padding: 5,
    backgroundColor: COLORS.accentVeryLight,
  },
  segmentButton: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 14,
    paddingVertical: 10,
  },
  segmentButtonActive: {
    backgroundColor: COLORS.surface,
  },
  segmentButtonText: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.textSecondary,
  },
  segmentButtonTextActive: {
    color: COLORS.accentDark,
  },
  supportCard: {
    maxWidth: 520,
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 22,
    padding: 16,
    backgroundColor: COLORS.background,
  },
  qrFrame: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    width: 280,
    height: 280,
    maxWidth: '100%',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 22,
    padding: 12,
    backgroundColor: COLORS.surface,
  },
  qrImage: {
    width: '100%',
    height: '100%',
  },
  contactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  contactLink: {
    flexGrow: 1,
    flexBasis: 240,
    gap: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    padding: 14,
    backgroundColor: COLORS.background,
  },
  contactLabel: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  contactUrl: {
    fontSize: 13,
    color: COLORS.accentDark,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 18,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 20,
  },
  footerNarrow: {
    flexDirection: 'column',
  },
  footerBrand: {
    fontSize: 19,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  footerText: {
    marginTop: 4,
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  footerLinks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: 14,
  },
  footerLinksNarrow: {
    justifyContent: 'flex-start',
  },
  footerLink: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.accentDark,
  },
  pressed: {
    opacity: 0.75,
  },
});
