import { makeMutable } from 'react-native-reanimated';

export interface LayoutRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const headerLogoLayout = makeMutable<LayoutRect | null>(null);
