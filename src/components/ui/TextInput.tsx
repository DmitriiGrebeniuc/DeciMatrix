import {
  StyleSheet,
  Text,
  TextInput as NativeTextInput,
  View,
} from 'react-native';

import { COLORS } from '../../constants/colors';

type TextInputProps = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  error?: string;
};

export function TextInput({
  value,
  onChangeText,
  placeholder,
  multiline = false,
  error,
}: TextInputProps) {
  return (
    <View style={styles.container}>
      <NativeTextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textSecondary}
        multiline={multiline}
        returnKeyType={multiline ? 'default' : 'done'}
        textAlignVertical={multiline ? 'top' : 'center'}
        style={[
          styles.input,
          multiline && styles.multiline,
          error && styles.inputError,
        ]}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  input: {
    minHeight: 54,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    fontSize: 17,
    color: COLORS.textPrimary,
  },
  multiline: {
    minHeight: 116,
  },
  inputError: {
    borderColor: COLORS.danger,
  },
  error: {
    fontSize: 13,
    color: COLORS.danger,
  },
});
