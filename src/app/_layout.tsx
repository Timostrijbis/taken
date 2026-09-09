import { Caprasimo_400Regular } from '@expo-google-fonts/caprasimo';
import {
  Figtree_400Regular,
  Figtree_500Medium,
  Figtree_600SemiBold,
  Figtree_700Bold,
} from '@expo-google-fonts/figtree';
import { JetBrainsMono_400Regular } from '@expo-google-fonts/jetbrains-mono';
import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { TabBar } from '@/components/tab-bar';
import { useTheme } from '@/constants/use-theme';
import { migrate } from '@/db/database';

// Hold the splash screen until the fonts are ready, so the first frame the user
// sees is already in the right typeface rather than swapping under them.
SplashScreen.preventAutoHideAsync();

// Bring the database up to the current schema before any screen reads from it.
// This runs once, at import time, on the very first launch of the app process.
migrate();

/**
 * The root layout. In expo-router the file tree under `src/app` *is* the
 * navigation structure: this file wraps every screen, and each sibling file
 * (`index.tsx`, `groceries.tsx`) becomes one tab.
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
        <Tabs
          tabBar={(props) => <TabBar {...props} />}
          screenOptions={{
            // Each screen draws its own large title (the design uses a display
            // serif heading), so the stock navigation header is switched off.
            headerShown: false,
            sceneStyle: { backgroundColor: colors.bg },
          }}>
          <Tabs.Screen name="index" options={{ title: 'Chores' }} />
          <Tabs.Screen name="groceries" options={{ title: 'Groceries' }} />
        </Tabs>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
