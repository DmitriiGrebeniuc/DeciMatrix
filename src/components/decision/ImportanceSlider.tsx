import Slider from '@react-native-community/slider';
import { StyleSheet, Text, View } from 'react-native';

import { COLORS } from '../../constants/colors';
import { getImportanceLabel } from '../../services/decisionCalculator';
import { Card } from '../ui/Card';

type ImportanceSliderProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
};

export function ImportanceSlider({
  label,
  value,
  onChange,
}: ImportanceSliderProps) {
  return (
    <Card>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.valueLabel}>{getImportanceLabel(value)}</Text>
      </View>
      <Slider
        minimumValue={1}
        maximumValue={100}
        step={1}
        value={value}
        onValueChange={onChange}
        minimumTrackTintColor={COLORS.accent}
        maximumTrackTintColor={COLORS.border}
        thumbTintColor={COLORS.accent}
        style={styles.slider}
      />
      <View style={styles.scaleLabels}>
        <Text style={styles.scaleText}>мало важно</Text>
        <Text style={styles.scaleText}>критично</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 4,
    marginBottom: 8,
  },
  label: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  valueLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  slider: {
    minHeight: 44,
  },
  scaleLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  scaleText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
});
