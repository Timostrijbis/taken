import { Caprasimo_400Regular } from '@expo-google-fonts/caprasimo';
import {
  Figtree_400Regular,
  Figtree_500Medium,
  Figtree_600SemiBold,
  Figtree_700Bold,
} from '@expo-google-fonts/figtree';
import { JetBrainsMono_400Regular } from '@expo-google-fonts/jetbrains-mono';
import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useTheme } from '@/constants/use-theme';
import { migrate } from '@/db/database';

// Hold the splash screen until the fonts are ready, so the first frame the user
// sees is already in the right typeface rather than swapping under them.
SplashScreen.preventAutoHideAsync();

// Bring the database up to the current schema before any screen reads from it.
// This runs once, at import time, on the very first launch of the app process.
migrate();

/**
 * The root layout: a stack.
 *
 * The two tabs live inside it as the `(tabs)` group — parentheses mean the
 * folder groups files without adding a segment to the URL. Anything outside
 * that group (the chore detail and add screens) is pushed *over* the tabs as a
 * full screen, which is why the tab bar disappears on them, matching the
 * design.
 */
export default function RootLayout() {
  const { colors, isDark } = useTheme();

  const [fontsLoaded] = useFonts({
    Caprasimo_400Regular,
    Figtree_400Regular,
    Figtree_500Medium,
    Figtree_600SemiBold,
    Figtree_700Bold,
    JetBrainsMono_400Regular,
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    // GestureHandlerRootView must sit at the very top of the tree for
    // drag-to-reorder on the grocery list to work.
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.bg },
          }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="chore/[id]" />
          <Stack.Screen name="chore/new" />
        </Stack>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
