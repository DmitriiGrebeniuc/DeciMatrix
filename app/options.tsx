import { StyleSheet, Text, View } from 'react-native';

export default function AddOptionsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Options</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#F7F7F8',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
});
