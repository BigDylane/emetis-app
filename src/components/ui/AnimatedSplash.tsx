import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { Colors } from '@/constants/colors';
import { appName } from '@/lib/appInfo';

const ENTER_DURATION = 450;
const LETTERS_START_DELAY = 320;
const LETTERS_DURATION = 700;
const HOLD_DURATION = 500;
const EXIT_DURATION = 350;

const CHEVRON_START_OFFSET = 320;
const CHEVRON_START_SCALE = 1.35;
const CHEVRON_START_ROTATE = -18;

interface AnimatedSplashProps {
  onFinish: () => void;
}

interface AnimatedLetterProps {
  letter: string;
  index: number;
  total: number;
  progress: SharedValue<number>;
}

function AnimatedLetter({ letter, index, total, progress }: AnimatedLetterProps) {
  const style = useAnimatedStyle(() => {
    const start = index / total;
    const end = (index + 1) / total;
    const value = interpolate(progress.value, [start, end], [0, 1], 'clamp');

    return {
      opacity: value,
      transform: [{ translateY: interpolate(value, [0, 1], [10, 0]) }],
    };
  });

  return (
    <Animated.Text style={[styles.letter, style]}>{letter === ' ' ? ' ' : letter}</Animated.Text>
  );
}

export function AnimatedSplash({ onFinish }: AnimatedSplashProps) {
  const chevronTranslateX = useSharedValue(CHEVRON_START_OFFSET);
  const chevronScale = useSharedValue(CHEVRON_START_SCALE);
  const chevronRotate = useSharedValue(CHEVRON_START_ROTATE);
  const lettersProgress = useSharedValue(0);
  const overlayOpacity = useSharedValue(1);

  useEffect(() => {
    chevronTranslateX.value = withTiming(0, {
      duration: ENTER_DURATION,
      easing: Easing.out(Easing.cubic),
    });
    chevronScale.value = withSequence(
      withTiming(1.1, { duration: ENTER_DURATION * 0.7, easing: Easing.out(Easing.quad) }),
      withTiming(1, { duration: ENTER_DURATION * 0.3, easing: Easing.inOut(Easing.quad) }),
    );
    chevronRotate.value = withTiming(0, {
      duration: ENTER_DURATION,
      easing: Easing.out(Easing.cubic),
    });

    lettersProgress.value = withDelay(
      LETTERS_START_DELAY,
      withTiming(1, { duration: LETTERS_DURATION, easing: Easing.out(Easing.quad) }),
    );

    overlayOpacity.value = withDelay(
      LETTERS_START_DELAY + LETTERS_DURATION + HOLD_DURATION,
      withTiming(0, { duration: EXIT_DURATION, easing: Easing.in(Easing.quad) }, () => {
        runOnJS(onFinish)();
      }),
    );

    return () => {
      cancelAnimation(chevronTranslateX);
      cancelAnimation(chevronScale);
      cancelAnimation(chevronRotate);
      cancelAnimation(lettersProgress);
      cancelAnimation(overlayOpacity);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: chevronTranslateX.value },
      { scale: chevronScale.value },
      { rotate: `${chevronRotate.value}deg` },
    ],
  }));

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const letters = appName.split('');

  return (
    <Animated.View style={[styles.overlay, overlayStyle]} pointerEvents="none">
      <View style={styles.lockup}>
        <Animated.Image
          source={require('@/assets/images/splash-icon.png')}
          style={[styles.logo, chevronStyle]}
          resizeMode="contain"
        />
        <View style={styles.lettersRow}>
          {letters.map((letter, index) => (
            <AnimatedLetter
              key={`${letter}-${index}`}
              letter={letter}
              index={index}
              total={letters.length}
              progress={lettersProgress}
            />
          ))}
        </View>
      </View>
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
    backgroundColor: Colors.light.primary,
  },
  lockup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 88,
    height: 88,
    marginRight: 14,
  },
  lettersRow: {
    flexDirection: 'row',
  },
  letter: {
    color: '#ffffff',
    fontSize: 48,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
