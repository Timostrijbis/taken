import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/constants/use-theme';

/**
 * Screen 2 — Grocery list. This is the first real feature we build
 * (build step 2), because it is the simplest complete one.
 */
export default function GroceriesScreen() {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <MaterialCommunityIcons name="cart-outline" size={64} color={colors.accent} />
      <Text style={[styles.title, { color: colors.text }]}>Groceries</Text>
      <Text style={[styles.body, { color: colors.textMuted }]}>
        The checklist lands here in step 2.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  title: { fontSize: 28, fontWeight: '600' },
  body: { fontSize: 15, textAlign: 'center', paddingHorizontal: 32 },
});
