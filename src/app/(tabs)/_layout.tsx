import { Tabs } from 'expo-router/js-tabs';

import { TabBar } from '@/components/tab-bar';
import { useTheme } from '@/constants/use-theme';

/**
 * The two-tab layout. Each sibling file in this folder becomes one tab, and
 * the bar itself is drawn by our own component so it can use the design's
 * sand-pill treatment.
 */
export default function TabsLayout() {
  const { colors } = useTheme();

  return (
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
  );
}
