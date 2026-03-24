import { atomWithStorage } from 'jotai/utils';

import { ThemeMode } from './types';

const getSystemTheme = (): ThemeMode => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? ThemeMode.DARK
      : ThemeMode.LIGHT;
  }
  return ThemeMode.DARK;
};

const themeModeState = atomWithStorage<ThemeMode>('theme-mode', getSystemTheme());

export { themeModeState };
