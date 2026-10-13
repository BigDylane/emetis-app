import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
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

        const color = isFocused ? Colors.light.primary : Colors.light.mutedForeground;
        const icon = options.tabBarIcon?.({ focused: isFocused, color, size: 24 });

        return (
          <Pressable key={route.key} onPress={onPress} style={styles.item}>
            {icon}
          </Pressable>
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
});
