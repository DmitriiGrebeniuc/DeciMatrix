import { StyleSheet, Text, View } from 'react-native';

import { COLORS } from '../../constants/colors';
import type { ResultOutcome } from '../../services/resultOutcome';
import { formatPercent } from '../../utils/formatting';

type ComparedOption = {
  name: string;
  matchPercent: number;
};

type ResultCardProps = {
  outcome?: ResultOutcome;
  winnerName: string;
  matchPercent: number;
  explanation: string;
  comparedOptions?: ComparedOption[];
};

export function ResultCard({
  outcome = 'winner',
  winnerName,
  matchPercent,
  explanation,
  comparedOptions = [],
}: ResultCardProps) {
  const isWinner = outcome === 'winner';

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{getLabel(outcome)}</Text>
      <Text style={styles.title}>{winnerName}</Text>

      {isWinner ? (
        <View style={styles.percentPill}>
          <Text style={styles.percent}>
            {formatPercent(matchPercent)} совпадения
          </Text>
        </View>
      ) : (
        <View style={styles.comparisonList}>
          {comparedOptions.map((option) => (
            <View key={option.name} style={styles.comparisonRow}>
              <Text style={styles.comparisonName} numberOfLines={2}>
                {option.name}
              </Text>
              <Text style={styles.comparisonPercent}>
                {formatPercent(option.matchPercent)}
              </Text>
            </View>
          ))}
        </View>
      )}

      <Text style={styles.explanation}>{explanation}</Text>
    </View>
  );
}

function getLabel(outcome: ResultOutcome): string {
  if (outcome === 'tie') {
    return 'Ничья';
  }

  if (outcome === 'close_call') {
    return 'Очень близкий результат';
  }

  return 'Лучше всего подходит';
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.accentLight,
    borderRadius: 24,
    padding: 20,
    backgroundColor: COLORS.accentVeryLight,
  },
  label: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.accentDark,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  percentPill: {
    alignSelf: 'flex-start',
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  percent: {
    fontSize: 30,
    fontWeight: '800',
    color: COLORS.accentDark,
  },
  comparisonList: {
    gap: 8,
  },
  comparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.accentLight,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: COLORS.surface,
  },
  comparisonName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  comparisonPercent: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.accentDark,
  },
  explanation: {
    fontSize: 15,
    lineHeight: 21,
    color: COLORS.textPrimary,
  },
});
