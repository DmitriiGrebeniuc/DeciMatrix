import { Image, StyleSheet, Text, View } from 'react-native';

import { COLORS } from '../../constants/colors';
import { LoadingDots } from './LoadingDots';

export function BrandedLoadingScreen() {
  return (
    <View style={styles.screen}>
      <View style={styles.center}>
        <Image
          source={require('../../../assets/branding/logo/logo-mark.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.brand}>DeciMatrix</Text>
        <LoadingDots />
      </View>

      <View style={styles.waveBack} />
      <View style={styles.waveFront} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: COLORS.background,
  },
  center: {
    zIndex: 2,
    alignItems: 'center',
    gap: 18,
    marginTop: -40,
  },
  logo: {
    width: 132,
    height: 118,
  },
  brand: {
    fontSize: 34,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  waveBack: {
    position: 'absolute',
    right: -130,
    bottom: -95,
    width: 460,
    height: 210,
    borderRadius: 150,
    backgroundColor: COLORS.accentLight,
    opacity: 0.72,
    transform: [{ rotate: '-8deg' }],
  },
  waveFront: {
    position: 'absolute',
    bottom: -118,
    left: -120,
    width: 520,
    height: 240,
    borderRadius: 170,
    backgroundColor: COLORS.accent,
    opacity: 0.2,
    transform: [{ rotate: '8deg' }],
  },
});
