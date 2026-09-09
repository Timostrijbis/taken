import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Fonts } from '@/constants/theme';
import { useTheme } from '@/constants/use-theme';

/** Which icon and label each route gets, keyed by its filename in src/app. */
const TABS: Record<string, { label: string; icon: keyof typeof MaterialCommunityIcons.glyphMap }> = {
  index: { label: 'Chores', icon: 'format-list-checks' },
  groceries: { label: 'Groceries', icon: 'basket-outline' },
};

/**
 * The bottom tab bar from the design: a soft "sand" pill sits behind whichever
 * tab is active, instead of Android's default underline/tint treatment.
 *
 * Replacing the stock bar means we also take responsibility for the gesture
 * area at the bottom of the screen, which is what `insets.bottom` pads for.
 */
export function TabBar({ state, navigation }: BottomTabBarProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: colors.bg,
          borderTopColor: colors.line,
          paddingBottom: Math.max(insets.bottom, 12),
        },
      ]}>
      {state.routes.map((route, index) => {
        const tab = TABS[route.name];
        if (!tab) return null;

        const focused = state.index === index;

        return (
          <Pressable
            key={route.key}
            accessibilityRole="button"
            accessibilityState={focused ? { selected: true } : {}}
            accessibilityLabel={tab.label}
            onPress={() => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!focused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            }}
            style={[styles.tab, { backgroundColor: focused ? colors.sand : 'transparent' }]}>
            <MaterialCommunityIcons
              name={tab.icon}
              size={22}
              color={focused ? colors.ink : colors.muted}
            />
            <Text style={[styles.label, { color: focused ? colors.ink : colors.muted }]}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 10,
    paddingHorizontal: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    borderRadius: 20,
  },
  label: { fontFamily: Fonts.bodySemi, fontSize: 11.5 },
});
