import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useTheme } from '@/constants/use-theme';

/**
 * The root layout. In expo-router, the file tree under `src/app` *is* the
 * navigation structure: this file wraps every screen, and each sibling file
 * (`index.tsx`, `groceries.tsx`) becomes one tab below.
 */
export default function RootLayout() {
  const { colors, isDark } = useTheme();

  return (
    // GestureHandlerRootView must sit at the very top of the tree for
    // drag-to-reorder on the grocery list to work later on.
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <Tabs
          screenOptions={{
            headerStyle: { backgroundColor: colors.surface },
            headerTitleStyle: { color: colors.text },
            headerShadowVisible: false,
            tabBarActiveTintColor: colors.accent,
            tabBarInactiveTintColor: colors.textMuted,
            tabBarStyle: {
              backgroundColor: colors.surface,
              borderTopColor: colors.border,
            },
          }}>
          <Tabs.Screen
            name="index"
            options={{
              title: 'Chores',
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="broom" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="groceries"
            options={{
              title: 'Groceries',
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="cart-outline" size={size} color={color} />
              ),
            }}
          />
        </Tabs>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
