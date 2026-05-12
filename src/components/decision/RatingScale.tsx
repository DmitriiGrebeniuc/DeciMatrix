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
              { borderColor: RATING_COLORS[rating] },
              isSelected && {
                backgroundColor: RATING_COLORS[rating],
              },
            ]}
          >
            <Text
              style={[
                styles.label,
                isSelected && styles.selectedLabel,
              ]}
            >
              {RATING_LABELS[rating]}
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
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: COLORS.surface,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  selectedLabel: {
    color: COLORS.surface,
  },
});
