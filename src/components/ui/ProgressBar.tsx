import { StyleSheet, View } from 'react-native';
import type { DimensionValue } from 'react-native';

import { COLORS } from '../../constants/colors';

type ProgressBarProps = {
  progress: number;
};

function clampProgress(value: number): number {
  return Math.min(1, Math.max(0, value));
}

export function ProgressBar({ progress }: ProgressBarProps) {
  const width: DimensionValue = `${clampProgress(progress) * 100}%`;

  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 8,
    overflow: 'hidden',
    borderRadius: 999,
    backgroundColor: COLORS.muted,
  },
  fill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: COLORS.accent,
  },
});
