import { StyleSheet, Text, View } from 'react-native';

import { COLORS } from '../../constants/colors';
import type { Option, OptionResult } from '../../types/decision';
import { formatPercent } from '../../utils/formatting';
import { Card } from '../ui/Card';

type RankingListProps = {
  results: OptionResult[];
  options: Option[];
};

function getOptionName(options: Option[], optionId: string): string {
  return options.find((option) => option.id === optionId)?.name ?? optionId;
}

export function RankingList({ results, options }: RankingListProps) {
  return (
    <View style={styles.container}>
      {results.map((result) => (
        <Card key={result.optionId}>
          <View style={styles.row}>
            <Text style={styles.rank}>{result.rank}</Text>
            <Text style={styles.name}>
              {getOptionName(options, result.optionId)}
            </Text>
            <Text style={styles.percent}>
              {formatPercent(result.matchPercent)}
            </Text>
          </View>
        </Card>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: COLORS.accentLight,
    textAlign: 'center',
    lineHeight: 32,
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.accentDark,
  },
  name: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  percent: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.accent,
  },
});
