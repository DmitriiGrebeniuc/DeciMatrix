import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { RankingList } from '../src/components/decision/RankingList';
import { ResultCard } from '../src/components/decision/ResultCard';
import { AppHeader } from '../src/components/ui/AppHeader';
import { Button } from '../src/components/ui/Button';
import { Card } from '../src/components/ui/Card';
import { ScreenContainer } from '../src/components/ui/ScreenContainer';
import { useToast } from '../src/components/ui/Toast';
import { COLORS } from '../src/constants/colors';
import { ENABLE_AI_FEATURES } from '../src/constants/features';
import {
  calculateDecisionResult,
  getWinnerExplanation,
} from '../src/services/decisionCalculator';
import {
  canShowResult,
  getMissingScoresCount,
} from '../src/services/decisionValidation';
import {
  analyzeResult,
  type AiResultAnalysis,
  type AnalyzeResultRequest,
} from '../src/services/aiService';
import { getResultOutcome, type ResultOutcome } from '../src/services/resultOutcome';
import { useDecisionStore } from '../src/store/decisionStore';
import type {
  CalculatedResult,
  Decision,
  OptionResult,
} from '../src/types/decision';

export default function ResultScreen() {
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
  const completeDecision = useDecisionStore(
    (state) => state.completeDecision
  );
  const [aiAnalysis, setAiAnalysis] = useState<AiResultAnalysis | null>(null);
  const [isAnalyzingResult, setIsAnalyzingResult] = useState(false);

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
  const outcomeDetails = result ? getResultOutcome(result) : null;
  const winnerResult = outcomeDetails?.first ?? null;
  const resultTitle = outcomeDetails
    ? getOutcomeTitle(outcomeDetails.outcome)
    : 'Лучше всего подходит';
  const resultCardTitle =
    decision && outcomeDetails
      ? getResultCardTitle(decision, outcomeDetails.tiedOptions, winnerResult)
      : 'Не определен';
  const explanation =
    decision && result && outcomeDetails
      ? getOutcomeExplanation(decision, result, outcomeDetails)
      : '';
  const comparedOptions =
    decision && outcomeDetails
      ? getComparedOptions(decision, outcomeDetails)
      : [];
  const resultSignature = `${decision?.updatedAt ?? ''}:${
    outcomeDetails?.outcome ?? ''
  }:${result?.options
    .map((option) => `${option.optionId}:${option.matchPercent}`)
    .join('|')}`;

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

  useEffect(() => {
    setAiAnalysis(null);
  }, [resultSignature]);

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
      showToast('Не получилось сохранить решение', 'error');
      return;
    }

    completeDecision(decisionId);
    showToast('Решение сохранено', 'success');
    router.push(`/decision/${decisionId}`);
  }

  async function handleAnalyzeResult(): Promise<void> {
    if (!decision || !result || !outcomeDetails) {
      return;
    }

    setIsAnalyzingResult(true);

    try {
      const analysis = await analyzeResult(
        buildAnalyzeResultPayload(decision, result, outcomeDetails.outcome)
      );
      setAiAnalysis(analysis);
    } catch {
      showToast('Не получилось получить AI-разбор', 'error');
    } finally {
      setIsAnalyzingResult(false);
    }
  }

  return (
    <ScreenContainer scroll>
      <AppHeader title="Результат" />
      <View style={styles.container}>
        <Text style={styles.title}>{resultTitle}</Text>

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
        ) : !isReady || !result || !winnerResult || !outcomeDetails ? (
          <Card>
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                Осталось оценить {missingScoresCount} пунктов - и можно будет
                показать результат.
              </Text>
              <Button title="Продолжить оценку" onPress={openRatings} />
            </View>
          </Card>
        ) : (
          <>
            <ResultCard
              outcome={outcomeDetails.outcome}
              winnerName={resultCardTitle}
              matchPercent={winnerResult.matchPercent}
              explanation={explanation}
              comparedOptions={comparedOptions}
            />

            {ENABLE_AI_FEATURES ? (
              <AiAnalysisBlock
                analysis={aiAnalysis}
                isLoading={isAnalyzingResult}
                onGenerate={() => {
                  void handleAnalyzeResult();
                }}
              />
            ) : null}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Рейтинг</Text>
              <RankingList results={result.options} options={decision.options} />
            </View>

            <View style={styles.actions}>
              <Button title="Сохранить" onPress={handleSave} />
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

type AiAnalysisBlockProps = {
  analysis: AiResultAnalysis | null;
  isLoading: boolean;
  onGenerate: () => void;
};

function AiAnalysisBlock({
  analysis,
  isLoading,
  onGenerate,
}: AiAnalysisBlockProps) {
  return (
    <Card>
      <View style={styles.aiBlock}>
        <View style={styles.aiHeader}>
          <Text style={styles.aiTitle}>AI-разбор</Text>
          <Text style={styles.aiHint}>
            Дополнительный взгляд на результат, без замены твоего выбора.
          </Text>
        </View>

        {!analysis ? (
          <Button
            title={isLoading ? 'Готовим AI-разбор...' : 'Сгенерировать AI-разбор'}
            variant="secondary"
            disabled={isLoading}
            onPress={onGenerate}
          />
        ) : (
          <View style={styles.aiContent}>
            <Text style={styles.aiSummary}>{analysis.summary}</Text>
            <AnalysisList title="Что решило исход" items={analysis.reasons} />
            <AnalysisList title="Где можно ошибиться" items={analysis.cautions} />
            <AnalysisList title="Что проверить перед выбором" items={analysis.advice} />
          </View>
        )}
      </View>
    </Card>
  );
}

type AnalysisListProps = {
  title: string;
  items: string[];
};

function AnalysisList({ title, items }: AnalysisListProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <View style={styles.analysisList}>
      <Text style={styles.analysisTitle}>{title}</Text>
      {items.map((item) => (
        <Text key={item} style={styles.analysisItem}>
          - {item}
        </Text>
      ))}
    </View>
  );
}

function buildAnalyzeResultPayload(
  decision: Decision,
  result: CalculatedResult,
  outcome: ResultOutcome
): AnalyzeResultRequest {
  return {
    decisionTitle: decision.title,
    options: decision.options.map((option) => ({
      id: option.id,
      name: option.name,
    })),
    criteria: decision.criteria.map((criterion) => ({
      id: criterion.id,
      name: criterion.name,
      importance: criterion.importance,
    })),
    scores: decision.scores.map((score) => ({
      optionId: score.optionId,
      criterionId: score.criterionId,
      rating: score.rating,
      value: score.value,
    })),
    result: {
      winnerOptionId: result.winnerOptionId,
      outcome,
      ranking: result.options.map((optionResult) => ({
        optionId: optionResult.optionId,
        optionName: getOptionName(decision, optionResult),
        matchPercent: optionResult.matchPercent,
        rank: optionResult.rank,
      })),
    },
  };
}

function getOptionName(decision: Decision, optionResult?: OptionResult | null) {
  if (!optionResult) {
    return 'Не определен';
  }

  return (
    decision.options.find((option) => option.id === optionResult.optionId)
      ?.name ?? 'Не определен'
  );
}

function getOutcomeTitle(outcome: ResultOutcome): string {
  if (outcome === 'tie') {
    return 'Ничья';
  }

  if (outcome === 'close_call') {
    return 'Очень близкий результат';
  }

  return 'Лучше всего подходит';
}

function getResultCardTitle(
  decision: Decision,
  tiedOptions: OptionResult[],
  winnerResult: OptionResult | null
): string {
  if (tiedOptions.length > 1) {
    return tiedOptions.map((option) => getOptionName(decision, option)).join(' и ');
  }

  return getOptionName(decision, winnerResult);
}

function getOutcomeExplanation(
  decision: Decision,
  result: CalculatedResult,
  outcomeDetails: ReturnType<typeof getResultOutcome>
): string {
  const firstName = getOptionName(decision, outcomeDetails.first);
  const secondName = getOptionName(decision, outcomeDetails.second);

  if (outcomeDetails.outcome === 'tie') {
    if (outcomeDetails.tiedOptions.length > 2) {
      const names = outcomeDetails.tiedOptions
        .map((option) => getOptionName(decision, option))
        .join(', ');

      return `${names} набрали одинаковый результат. Эти варианты одинаково совпали с твоими критериями. Чтобы выбрать точнее, можно добавить еще один критерий или пересмотреть важность.`;
    }

    return `${firstName} и ${secondName} набрали одинаковый результат. Эти варианты одинаково совпали с твоими критериями. Чтобы выбрать точнее, можно добавить еще один критерий или пересмотреть важность.`;
  }

  if (outcomeDetails.outcome === 'close_call') {
    return `${firstName} немного впереди, но ${secondName} почти не уступает. Разница небольшая. Если сомневаешься, проверь самые важные критерии или добавь еще один критерий.`;
  }

  return getWinnerExplanation(decision, result);
}

function getComparedOptions(
  decision: Decision,
  outcomeDetails: ReturnType<typeof getResultOutcome>
) {
  if (outcomeDetails.outcome === 'tie') {
    return outcomeDetails.tiedOptions.map((option) => ({
      name: getOptionName(decision, option),
      matchPercent: option.matchPercent,
    }));
  }

  if (
    outcomeDetails.outcome === 'close_call' &&
    outcomeDetails.first &&
    outcomeDetails.second
  ) {
    return [outcomeDetails.first, outcomeDetails.second].map((option) => ({
      name: getOptionName(decision, option),
      matchPercent: option.matchPercent,
    }));
  }

  return [];
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
  aiBlock: {
    gap: 14,
  },
  aiHeader: {
    gap: 5,
  },
  aiTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  aiHint: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.textSecondary,
  },
  aiContent: {
    gap: 14,
  },
  aiSummary: {
    borderWidth: 1,
    borderColor: COLORS.accentLight,
    borderRadius: 16,
    padding: 14,
    backgroundColor: COLORS.accentVeryLight,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  analysisList: {
    gap: 6,
  },
  analysisTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.accentDark,
  },
  analysisItem: {
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.textSecondary,
  },
});
