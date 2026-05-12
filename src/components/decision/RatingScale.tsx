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
          <View key={rating} style={styles.item}>
            <Pressable
              accessibilityRole="button"
              onPress={() => onChange(rating)}
              style={({ pressed }) => [
                styles.segment,
                { backgroundColor: RATING_COLORS[rating] },
                isSelected && styles.selectedSegment,
                pressed && styles.pressedSegment,
              ]}
            />
            <Text
              style={[styles.label, isSelected && styles.selectedLabel]}
              numberOfLines={1}
            >
              {RATING_LABELS[rating]}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  item: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    gap: 7,
  },
  segment: {
    width: '100%',
    height: 48,
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: 10,
  },
  selectedSegment: {
    borderColor: COLORS.accentDark,
    transform: [{ scale: 1.07 }],
    shadowColor: COLORS.accentDark,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 4,
  },
  pressedSegment: {
    opacity: 0.88,
  },
  label: {
    maxWidth: '100%',
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  selectedLabel: {
    color: COLORS.accentDark,
    fontWeight: '900',
  },
});
