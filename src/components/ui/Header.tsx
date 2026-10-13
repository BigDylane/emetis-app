import { useEffect } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { measure, runOnUI, useAnimatedRef } from 'react-native-reanimated';
import { useThemeColors } from '@/hooks/useThemeColors';
import { appName } from '@/lib/appInfo';
import { headerLogoLayout } from '@/lib/headerLogoLayout';

export function Header() {
  const colors = useThemeColors();
  const logoRef = useAnimatedRef<Image>();

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
    <View
      style={[
        styles.container,
        { backgroundColor: colors.screenBackground, borderBottomColor: colors.border },
      ]}
    >
      <Image
        ref={logoRef}
        onLayout={measureLogo}
        source={require('@/assets/images/splash-icon.png')}
        style={[styles.logo, { tintColor: colors.primary }]}
        resizeMode="contain"
      />
      <Text style={[styles.title, { color: colors.foreground }]}>{appName.toLowerCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
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
  },
});
