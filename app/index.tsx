import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home</Text>
      <Link href="/create" style={styles.button}>
        Создать решение
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    padding: 24,
    backgroundColor: '#F7F7F8',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  button: {
    minWidth: 220,
    borderRadius: 8,
    backgroundColor: '#2563EB',
    paddingHorizontal: 20,
    paddingVertical: 14,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    overflow: 'hidden',
  },
});
