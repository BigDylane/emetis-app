import Constants from 'expo-constants';
import { appName } from './appInfo';

test('falls back to "Emetis" when expoConfig has no name (e.g. under Jest)', () => {
  expect(Constants.expoConfig?.name).toBeUndefined();
  expect(appName).toBe('Emetis');
});
