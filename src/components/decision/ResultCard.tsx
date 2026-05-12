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
        <Text style={styles.percent}>{formatPercent(matchPercent)}</Text>
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
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  percent: {
    fontSize: 34,
    fontWeight: '800',
    color: COLORS.accent,
  },
  explanation: {
    fontSize: 15,
    lineHeight: 21,
    color: COLORS.textSecondary,
  },
});
