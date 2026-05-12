import { Image, StyleSheet, View } from 'react-native';

type LogoMarkProps = {
  size?: number;
  rounded?: number;
};

export function LogoMark({ size = 40, rounded = 12 }: LogoMarkProps) {
  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: rounded,
        },
      ]}
    >
      <Image
        source={require('../../../assets/branding/logo/logo-mark.png')}
        style={{
          width: size,
          height: size,
          borderRadius: rounded,
        }}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
});
