import { StyleSheet, Text, View } from 'react-native';

import { COLORS } from '../../constants/colors';
import { formatPercent } from '../../utils/formatting';

type ResultCardProps = {
  winnerName: string;
  matchPercent: number;
  explanation: string;
};

export function ResultCard({
  winnerName,
  matchPercent,
  explanation,
}: ResultCardProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Лучше всего подходит</Text>
      <Text style={styles.title}>{winnerName}</Text>
      <View style={styles.percentPill}>
        <Text style={styles.percent}>{formatPercent(matchPercent)} совпадения</Text>
      </View>
      <Text style={styles.explanation}>{explanation}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
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
  explanation: {
    fontSize: 15,
    lineHeight: 21,
    color: COLORS.textPrimary,
  },
});
