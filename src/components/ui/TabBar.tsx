import { useEffect, type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';

interface TabBarRoute {
  key: string;
  name: string;
  params?: object;
}

interface TabBarProps {
  state: { routes: TabBarRoute[]; index: number };
  descriptors: Record<
    string,
    {
      options: {
        tabBarIcon?: (props: { focused: boolean; color: string; size: number }) => ReactNode;
      };
    }
  >;
  navigation: {
    emit(event: { type: 'tabPress'; target: string; canPreventDefault: true }): {
      defaultPrevented: boolean;
    };
    navigate(name: string, params?: object): void;
  };
}

interface TabBarItemProps {
  focused: boolean;
  onPress: () => void;
  renderIcon?: (color: string) => ReactNode;
}

function TabBarItem({ focused, onPress, renderIcon }: TabBarItemProps) {
  const scale = useSharedValue(1);
  const activeOpacity = useSharedValue(focused ? 1 : 0);

  useEffect(() => {
    activeOpacity.value = withTiming(focused ? 1 : 0, {
      duration: 200,
      easing: Easing.out(Easing.quad),
    });
  }, [focused, activeOpacity]);

  function handlePressIn() {
    scale.value = withTiming(0.82, { duration: 100, easing: Easing.out(Easing.quad) });
  }

  function handlePressOut() {
    scale.value = withSpring(1, { damping: 10, stiffness: 220 });
  }

  const bounceStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const activeStyle = useAnimatedStyle(() => ({
    opacity: activeOpacity.value,
  }));

  const inactiveStyle = useAnimatedStyle(() => ({
    opacity: 1 - activeOpacity.value,
  }));

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.item}
    >
      <Animated.View style={bounceStyle}>
        <View style={styles.iconSlot}>
          <Animated.View style={[styles.iconLayer, inactiveStyle]}>
            {renderIcon?.(Colors.light.mutedForeground)}
          </Animated.View>
          <Animated.View style={[styles.iconLayer, activeStyle]}>
            {renderIcon?.(Colors.light.primary)}
          </Animated.View>
        </View>
      </Animated.View>
    </Pressable>
  );
}

export function TabBar({ state, descriptors, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom + 14 }]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        function onPress() {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        }

        return (
          <TabBarItem
            key={route.key}
            focused={isFocused}
            onPress={onPress}
            renderIcon={(color) => options.tabBarIcon?.({ focused: isFocused, color, size: 24 })}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E1E3E6',
    paddingTop: 16,
  },
  item: {
    flex: 1,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconSlot: {
    width: 24,
    height: 24,
  },
  iconLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});
