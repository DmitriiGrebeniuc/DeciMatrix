import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS } from '../../constants/colors';
import { LogoMark } from './LogoMark';

type AppHeaderProps = {
  title?: string;
  home?: boolean;
  showMenu?: boolean;
  onMenuPress?: () => void;
};

export function AppHeader({
  title,
  home = false,
  showMenu = false,
  onMenuPress,
}: AppHeaderProps) {
  const router = useRouter();

  if (home) {
    return (
      <View style={styles.header}>
        <View style={styles.brand}>
          <LogoMark size={38} />
          <Text style={styles.brandText}>DeciMatrix</Text>
        </View>
        {showMenu ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Открыть меню"
            onPress={onMenuPress}
            style={({ pressed }) => [
              styles.menuButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.menuText}>...</Text>
          </Pressable>
        ) : null}
      </View>
    );
  }

  return (
    <View style={styles.header}>
      <Pressable
        accessibilityRole="button"
        onPress={() => router.back()}
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
      >
        <Text style={styles.backText}>{'<'}</Text>
      </Pressable>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.headerSpacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 18,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  brandText: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  menuButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  menuText: {
    marginTop: -6,
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.accent,
  },
  backButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pressed: {
    opacity: 0.85,
  },
  backText: {
    marginTop: -2,
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.accent,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  headerSpacer: {
    width: 42,
  },
});
