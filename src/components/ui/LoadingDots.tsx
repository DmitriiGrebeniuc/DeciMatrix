import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { COLORS } from '../../constants/colors';

const DOTS = [0, 1, 2, 3] as const;

export function LoadingDots() {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(progress, {
        toValue: 4,
        duration: 1400,
        useNativeDriver: true,
      })
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [progress]);

  return (
    <View style={styles.container}>
      {DOTS.map((index) => {
        const opacity = progress.interpolate({
          inputRange: [index, index + 0.15, index + 0.85, index + 1],
          outputRange: [0.35, 1, 1, 0.35],
          extrapolate: 'clamp',
        });
        const scale = progress.interpolate({
          inputRange: [index, index + 0.5, index + 1],
          outputRange: [0.9, 1.18, 0.9],
          extrapolate: 'clamp',
        });

        return (
          <Animated.View
            key={index}
            style={[
              styles.dot,
              {
                opacity,
                transform: [{ scale }],
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 999,
    backgroundColor: COLORS.accent,
  },
});
