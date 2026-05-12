import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS } from '../../constants/colors';
import { RATING_LABELS, RATING_LEVELS } from '../../constants/ratings';
import type { RatingLevel } from '../../types/decision';

type RatingScaleProps = {
  value?: RatingLevel;
  onChange: (rating: RatingLevel) => void;
};

const RATING_COLORS: Record<RatingLevel, string> = {
  bad: COLORS.ratingBad,
  weak: COLORS.ratingWeak,
  normal: COLORS.ratingNormal,
  good: COLORS.ratingGood,
  excellent: COLORS.ratingExcellent,
};

export function RatingScale({ value, onChange }: RatingScaleProps) {
  return (
    <View style={styles.container}>
      {RATING_LEVELS.map((rating) => {
        const isSelected = value === rating;

        return (
          <Pressable
            accessibilityRole="button"
            key={rating}
            onPress={() => onChange(rating)}
            style={[
              styles.segment,
              { borderColor: isSelected ? RATING_COLORS[rating] : COLORS.border },
              isSelected && styles.selectedSegment,
            ]}
          >
            <View
              style={[
                styles.colorMark,
                { backgroundColor: RATING_COLORS[rating] },
              ]}
            />
            <Text
              style={[
                styles.label,
                isSelected && styles.selectedLabel,
              ]}
              numberOfLines={1}
            >
              {RATING_LABELS[rating]}
            </Text>
            <Text style={[styles.check, !isSelected && styles.hiddenCheck]}>
              ✓
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  segment: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    borderWidth: 2,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: COLORS.surface,
  },
  selectedSegment: {
    backgroundColor: COLORS.accentLight,
  },
  colorMark: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  label: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  selectedLabel: {
    color: COLORS.textPrimary,
  },
  check: {
    width: 18,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.accentDark,
  },
  hiddenCheck: {
    opacity: 0,
  },
});
