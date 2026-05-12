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
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'secondary' ? COLORS.accent : COLORS.surface}
        />
      ) : (
        <Text
          style={[
            styles.title,
            variant === 'secondary' && styles.secondaryTitle,
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  primary: {
    backgroundColor: COLORS.accent,
  },
  secondary: {
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.muted,
  },
  danger: {
    backgroundColor: COLORS.danger,
  },
  disabled: {
    opacity: 0.45,
  },
  pressed: {
    opacity: 0.85,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.surface,
  },
  secondaryTitle: {
    color: COLORS.textPrimary,
  },
});
