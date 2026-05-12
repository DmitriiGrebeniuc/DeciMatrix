import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';

import { BrandedLoadingScreen } from '../src/components/ui/BrandedLoadingScreen';
import { ToastProvider } from '../src/components/ui/Toast';

export default function RootLayout() {
  const [isLoadingVisible, setIsLoadingVisible] = useState(true);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setIsLoadingVisible(false);
    }, 1100);

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  if (isLoadingVisible) {
    return <BrandedLoadingScreen />;
  }

  return (
    <ToastProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ title: 'Home' }} />
        <Stack.Screen name="create" options={{ title: 'Create Decision' }} />
        <Stack.Screen name="options" options={{ title: 'Add Options' }} />
        <Stack.Screen name="criteria" options={{ title: 'Add Criteria' }} />
        <Stack.Screen name="importance" options={{ title: 'Set Importance' }} />
        <Stack.Screen name="ratings" options={{ title: 'Rate Options' }} />
        <Stack.Screen name="result" options={{ title: 'Result' }} />
        <Stack.Screen name="decision/[id]" options={{ title: 'Decision Details' }} />
      </Stack>
    </ToastProvider>
  );
}
