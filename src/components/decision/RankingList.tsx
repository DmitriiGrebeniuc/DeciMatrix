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
      {results.map((result, index) => {
        const displayRank = getDisplayRank(results, result, index);

        return (
          <Card key={result.optionId}>
            <View style={styles.row}>
              <Text style={styles.rank}>{displayRank}</Text>
              <Text style={styles.name} numberOfLines={2}>
                {getOptionName(options, result.optionId)}
              </Text>
              <Text style={styles.percent}>
                {formatPercent(result.matchPercent)}
              </Text>
            </View>
          </Card>
        );
      })}
    </View>
  );
}

function getDisplayRank(
  results: OptionResult[],
  result: OptionResult,
  index: number
): number {
  const displayPercent = Math.round(result.matchPercent);
  const samePercentIndex = results.findIndex(
    (item) => Math.round(item.matchPercent) === displayPercent
  );

  return samePercentIndex >= 0 ? samePercentIndex + 1 : index + 1;
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
