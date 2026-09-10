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
import { Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useTheme } from '@/constants/use-theme';
import { reconcile, requestPermission } from '@/features/notifications/scheduler';
import { migrate } from '@/db/database';

// Hold the splash screen until the fonts are ready, so the first frame the user
// sees is already in the right typeface rather than swapping under them.
SplashScreen.preventAutoHideAsync();

// Bring the database up to the current schema before any screen reads from it.
// This runs once, at import time, on the very first launch of the app process.
//
// It is wrapped because this code runs *outside* React: if it threw here, the
// whole module would fail to load and the app would show a blank white screen
// with no clue as to why. Instead we remember the message and render it below,
// so a broken migration is something you can read off the phone.
let migrationError: string | null = null;
try {
  migrate();
} catch (error) {
  migrationError = error instanceof Error ? error.message : String(error);
  console.error('[taken] migration failed', error);
}

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

  // The second value is the *error* slot. Without reading it, a font that
  // fails to load leaves `fontsLoaded` false forever and the screen below
  // stays blank permanently — the app would look frozen with nothing logged.
  const [fontsLoaded, fontError] = useFonts({
    Caprasimo_400Regular,
    Figtree_400Regular,
    Figtree_500Medium,
    Figtree_600SemiBold,
    Figtree_700Bold,
    JetBrainsMono_400Regular,
  });

  // Ready means "stop waiting", not "everything worked". If a font failed we
  // carry on and Android substitutes its own face: wrong typography beats no
  // app at all.
  const ready = fontsLoaded || !!fontError;

  useEffect(() => {
    if (fontError) console.error('[taken] font loading failed', fontError);
  }, [fontError]);

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  // Reconcile once per app launch (CLAUDE.md section 5). Android's alarms can
  // drift out of step with the database after a time-zone change, an app
  // update or an OS-level cleanup, and a wrong pending alarm is invisible
  // until it fires at the wrong moment — so the schedule is rebuilt from the
  // rows every time the app starts.
  //
  // The permission prompt rides along here because it has to precede any
  // scheduling: without permission there is nothing to post to.
  useEffect(() => {
    requestPermission()
      .then(() => reconcile())
      .catch((error) => console.error('[taken] startup reconcile failed', error));
  }, []);

  if (migrationError) return <StartupError message={migrationError} />;

  if (!ready) return null;

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

/**
 * The last-resort screen. Shown when the database could not be brought up to
 * date, which is the one failure that happens before React can render anything
 * useful. Plain inline styles and no custom fonts on purpose — this has to work
 * when the rest of the app does not.
 */
function StartupError({ message }: { message: string }) {
  return (
    <View style={{ flex: 1, backgroundColor: '#f5ead8', padding: 28, justifyContent: 'center' }}>
      <Text style={{ fontSize: 20, fontWeight: '700', color: '#201e1d', marginBottom: 12 }}>
        taken could not start
      </Text>
      <Text style={{ fontSize: 14, color: '#645c50', marginBottom: 18 }}>
        The database could not be upgraded. Reinstalling the app clears its data
        and starts fresh.
      </Text>
      <Text style={{ fontSize: 13, color: '#a4372a' }}>{message}</Text>
    </View>
  );
}
