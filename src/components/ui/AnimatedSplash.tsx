import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  interpolate,
  measure,
  runOnJS,
  useAnimatedRef,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { Colors } from '@/constants/colors';
import { appName } from '@/lib/appInfo';
import { headerLogoLayout } from '@/lib/headerLogoLayout';

const ENTER_DURATION = 1100;
const LETTERS_START_DELAY = 750;
const LETTERS_DURATION = 1800;
const HOLD_DURATION = 750;
const EXIT_DURATION = 500;
const EXIT_TOTAL_DELAY = LETTERS_START_DELAY + LETTERS_DURATION + HOLD_DURATION;

const CHEVRON_START_OFFSET = 320;
const CHEVRON_START_SCALE = 1.5;
const CHEVRON_START_ROTATE = -35;

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
  const chevronRef = useAnimatedRef<Animated.Image>();

  const chevronTranslateX = useSharedValue(CHEVRON_START_OFFSET);
  const chevronTranslateY = useSharedValue(0);
  const chevronScale = useSharedValue(CHEVRON_START_SCALE);
  const chevronRotate = useSharedValue(CHEVRON_START_ROTATE);
  const chevronOpacity = useSharedValue(1);
  const lettersProgress = useSharedValue(0);
  const backdropOpacity = useSharedValue(1);
  const textOpacity = useSharedValue(1);

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

    // The 0-duration withTiming below exists only to land its completion
    // callback - a worklet running on the UI thread - at the exact moment the
    // exit phase should begin, so the chevron and the header's logo (if any)
    // can be measured synchronously right before the exit transforms are
    // computed and kicked off.
    backdropOpacity.value = withDelay(
      EXIT_TOTAL_DELAY,
      withTiming(1, { duration: 0 }, () => {
        const header = headerLogoLayout.value;
        const chevron = measure(chevronRef);

        if (header && chevron) {
          const dx = header.x + header.width / 2 - (chevron.pageX + chevron.width / 2);
          const dy = header.y + header.height / 2 - (chevron.pageY + chevron.height / 2);
          const targetScale = header.width / chevron.width;

          chevronTranslateX.value = withTiming(chevronTranslateX.value + dx, {
            duration: EXIT_DURATION,
            easing: Easing.inOut(Easing.cubic),
          });
          chevronTranslateY.value = withTiming(dy, {
            duration: EXIT_DURATION,
            easing: Easing.inOut(Easing.cubic),
          });
          chevronScale.value = withTiming(targetScale, {
            duration: EXIT_DURATION,
            easing: Easing.inOut(Easing.cubic),
          });
        } else {
          chevronOpacity.value = withTiming(0, {
            duration: EXIT_DURATION,
            easing: Easing.in(Easing.quad),
          });
        }

        textOpacity.value = withTiming(0, {
          duration: EXIT_DURATION,
          easing: Easing.in(Easing.quad),
        });
        backdropOpacity.value = withTiming(
          0,
          { duration: EXIT_DURATION, easing: Easing.in(Easing.quad) },
          () => {
            runOnJS(onFinish)();
          },
        );
      }),
    );

    return () => {
      cancelAnimation(chevronTranslateX);
      cancelAnimation(chevronTranslateY);
      cancelAnimation(chevronScale);
      cancelAnimation(chevronRotate);
      cancelAnimation(chevronOpacity);
      cancelAnimation(lettersProgress);
      cancelAnimation(backdropOpacity);
      cancelAnimation(textOpacity);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const chevronStyle = useAnimatedStyle(() => ({
    opacity: chevronOpacity.value,
    transform: [
      { translateX: chevronTranslateX.value },
      { translateY: chevronTranslateY.value },
      { scale: chevronScale.value },
      { rotate: `${chevronRotate.value}deg` },
    ],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  const letters = appName.toLowerCase().split('');

  return (
    <View style={styles.root} pointerEvents="none">
      <Animated.View style={[styles.backdrop, backdropStyle]} />
      <View style={styles.lockup}>
        <Animated.Image
          ref={chevronRef}
          source={require('@/assets/images/splash-icon.png')}
          style={[styles.logo, chevronStyle]}
          resizeMode="contain"
        />
        <Animated.View style={[styles.lettersRow, textStyle]}>
          {letters.map((letter, index) => (
            <AnimatedLetter
              key={`${letter}-${index}`}
              letter={letter}
              index={index}
              total={letters.length}
              progress={lettersProgress}
            />
          ))}
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.light.primary,
  },
  lockup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 92,
    height: 92,
    marginRight: 14,
  },
  lettersRow: {
    flexDirection: 'row',
  },
  letter: {
    color: '#ffffff',
    fontSize: 60,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
});
