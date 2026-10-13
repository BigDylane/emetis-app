import { useCallback, useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { AnimatedSplash } from '@/components/ui/AnimatedSplash';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [showAnimatedSplash, setShowAnimatedSplash] = useState(true);

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  const handleSplashFinish = useCallback(() => {
    setShowAnimatedSplash(false);
  }, []);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(public)" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(traveler)" />
          <Stack.Screen name="(host)" />
        </Stack>
        {showAnimatedSplash && <AnimatedSplash onFinish={handleSplashFinish} />}
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
