import { useColorScheme } from 'react-native';

import { Colors, type ThemeColors } from './theme';

/**
 * Returns the colour set matching the phone's current light/dark setting.
 * `useColorScheme()` re-renders the screen automatically when the user flips
 * their system theme, so nothing else needs to listen for that change.
 */
export function useTheme(): { colors: ThemeColors; isDark: boolean } {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  return { colors: isDark ? Colors.dark : Colors.light, isDark };
}
