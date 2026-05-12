import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../src/components/ui/Button';
import { ScreenContainer } from '../src/components/ui/ScreenContainer';
import { TextInput } from '../src/components/ui/TextInput';
import { COLORS } from '../src/constants/colors';
import { useDecisionStore } from '../src/store/decisionStore';

export default function CreateDecisionScreen() {
  const router = useRouter();
  const createDecision = useDecisionStore((state) => state.createDecision);
  const setCurrentDecision = useDecisionStore(
    (state) => state.setCurrentDecision
  );
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const trimmedTitle = title.trim();
  const isDisabled = trimmedTitle.length === 0;

  function handleNext(): void {
    if (isDisabled) {
      return;
    }

    const decisionId = createDecision(
      trimmedTitle,
      description.trim() || undefined
    );

    setCurrentDecision(decisionId);
    router.push({
      pathname: '/options',
      params: {
        decisionId,
      },
    });
  }

  return (
    <ScreenContainer scroll>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Что ты хочешь решить?</Text>
          <Text style={styles.hint}>
            Сформулируй выбор как вопрос. Так результат будет понятнее.
          </Text>
        </View>

        <View style={styles.form}>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Например: Какой ноутбук купить?"
          />
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Короткое описание, необязательно"
            multiline
          />
        </View>

        <Button title="Далее" onPress={handleNext} disabled={isDisabled} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 28,
  },
  header: {
    gap: 10,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  hint: {
    fontSize: 16,
    lineHeight: 23,
    color: COLORS.textSecondary,
  },
  form: {
    gap: 14,
  },
});
