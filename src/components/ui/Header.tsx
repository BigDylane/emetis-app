import { useEffect } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { measure, runOnUI, useAnimatedRef } from 'react-native-reanimated';
import { useSessionStore } from '@/auth/sessionStore';
import { useThemeColors } from '@/hooks/useThemeColors';
import { appName } from '@/lib/appInfo';
import { headerLogoLayout } from '@/lib/headerLogoLayout';

const HEADER_BACKGROUND = '#FFFFFF';
const HEADER_TEXT_COLOR = '#171717';

export function Header() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const logoRef = useAnimatedRef<Image>();
  const user = useSessionStore((state) => state.user);

  function goHome() {
    if (user?.role === 'traveler') {
      router.navigate('/(traveler)/(tabs)');
    } else if (user?.role === 'host') {
      router.navigate('/(host)/(tabs)');
    } else {
      router.navigate('/(public)');
    }
  }

  useEffect(() => {
    return () => {
      headerLogoLayout.value = null;
    };
  }, []);

  function measureLogo() {
    runOnUI(() => {
      'worklet';
      const layout = measure(logoRef);
      if (layout) {
        headerLogoLayout.value = {
          x: layout.pageX,
          y: layout.pageY,
          width: layout.width,
          height: layout.height,
        };
      }
    })();
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
      {/* Header toujours blanc: icônes sombres quel que soit le thème du téléphone */}
      <StatusBar style="dark" />
      <Pressable style={styles.brand} onPress={goHome} hitSlop={8}>
        <Image
          ref={logoRef}
          onLayout={measureLogo}
          source={require('@/assets/images/splash-icon.png')}
          style={[styles.logo, { tintColor: colors.primary }]}
          resizeMode="contain"
        />
        <Text style={styles.title}>{appName.toLowerCase()}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: HEADER_BACKGROUND,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E1E3E6',
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
    color: HEADER_TEXT_COLOR,
  },
});
