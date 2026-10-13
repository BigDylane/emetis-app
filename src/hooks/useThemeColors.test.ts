import { renderHook } from '@testing-library/react-native';
import * as ReactNative from 'react-native';
import { useThemeColors } from './useThemeColors';
import { Colors } from '@/constants/colors';

test('returns light colors when the system scheme is light', () => {
  jest.spyOn(ReactNative, 'useColorScheme').mockReturnValue('light');

  const { result } = renderHook(() => useThemeColors());

  expect(result.current).toEqual(Colors.light);
});

test('returns dark colors when the system scheme is dark', () => {
  jest.spyOn(ReactNative, 'useColorScheme').mockReturnValue('dark');

  const { result } = renderHook(() => useThemeColors());

  expect(result.current).toEqual(Colors.dark);
});
