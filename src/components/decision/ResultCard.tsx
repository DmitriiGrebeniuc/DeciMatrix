import { StyleSheet, Text, View } from 'react-native';

import { COLORS } from '../../constants/colors';
import { formatPercent } from '../../utils/formatting';
import { Card } from '../ui/Card';

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
    <Card>
      <View style={styles.container}>
        <Text style={styles.label}>Лучший вариант</Text>
        <Text style={styles.title}>{winnerName}</Text>
        <View style={styles.percentPill}>
          <Text style={styles.percent}>{formatPercent(matchPercent)}</Text>
        </View>
        <Text style={styles.explanation}>{explanation}</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  percentPill: {
    alignSelf: 'flex-start',
    borderRadius: 16,
    backgroundColor: COLORS.accentLight,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  percent: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.accentDark,
  },
  explanation: {
    fontSize: 15,
    lineHeight: 21,
    color: COLORS.textSecondary,
  },
});
