import { useEffect } from 'react';
import { Image, StyleSheet, Text } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const ENTRANCE_DURATION = 500;
const HOLD_DURATION = 900;
const EXIT_DURATION = 350;
const BOUNCE_SCALE = 1.08;

interface AnimatedSplashProps {
  onFinish: () => void;
}

export function AnimatedSplash({ onFinish }: AnimatedSplashProps) {
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.85);
  const overlayOpacity = useSharedValue(1);

  useEffect(() => {
    logoOpacity.value = withTiming(1, {
      duration: ENTRANCE_DURATION,
      easing: Easing.out(Easing.quad),
    });
    logoScale.value = withSequence(
      withTiming(BOUNCE_SCALE, {
        duration: ENTRANCE_DURATION,
        easing: Easing.out(Easing.back(1.5)),
      }),
      withTiming(1, { duration: 150, easing: Easing.inOut(Easing.quad) }),
    );

    overlayOpacity.value = withDelay(
      ENTRANCE_DURATION + HOLD_DURATION,
      withTiming(0, { duration: EXIT_DURATION, easing: Easing.in(Easing.quad) }, () => {
        runOnJS(onFinish)();
      }),
    );

    return () => {
      cancelAnimation(logoOpacity);
      cancelAnimation(logoScale);
      cancelAnimation(overlayOpacity);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  return (
    <Animated.View style={[styles.overlay, overlayStyle]} pointerEvents="none">
      <Animated.View style={logoStyle}>
        <Image
          source={require('@/assets/images/icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
      <Text style={styles.title}>Emetis</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#208AEF',
    gap: 16,
  },
  logo: {
    width: 96,
    height: 96,
  },
  title: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
