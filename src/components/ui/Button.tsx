import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { COLORS } from '../../constants/colors';

type ButtonVariant = 'primary' | 'secondary' | 'danger';

type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        styles[variant],
        pressed && variant === 'primary' && !isDisabled && styles.primaryPressed,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? COLORS.surface : COLORS.accent}
        />
      ) : (
        <Text
          style={[
            styles.title,
            variant === 'secondary' && styles.secondaryTitle,
            variant === 'danger' && styles.dangerTitle,
            isDisabled && styles.disabledTitle,
          ]}
          numberOfLines={1}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  primary: {
    backgroundColor: COLORS.accent,
  },
  primaryPressed: {
    backgroundColor: COLORS.accentDark,
  },
  secondary: {
    borderWidth: 1,
    borderColor: COLORS.accentLight,
    backgroundColor: COLORS.surface,
  },
  danger: {
    borderWidth: 1,
    borderColor: '#FCA5A5',
    backgroundColor: COLORS.surface,
  },
  disabled: {
    borderColor: COLORS.border,
    backgroundColor: '#E5E7EB',
  },
  pressed: {
    transform: [{ scale: 0.99 }],
    opacity: 0.9,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.surface,
  },
  secondaryTitle: {
    color: COLORS.accent,
  },
  dangerTitle: {
    color: COLORS.danger,
  },
  disabledTitle: {
    color: COLORS.textSecondary,
  },
});
