import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Fonts } from '@/constants/theme';
import { useTheme } from '@/constants/use-theme';

import type { GroceryItem } from '../types';
import { Checkbox } from './checkbox';

type Props = {
  items: GroceryItem[];
  open: boolean;
  onToggleOpen: () => void;
  onToggleItem: (id: string) => void;
};

/**
 * The collapsed "N ticked items" section (CLAUDE.md section 7). Ticked items
 * live here until they are explicitly deleted; tapping one sends it back to
 * the bottom of the main list.
 */
export function CheckedSection({ items, open, onToggleOpen, onToggleItem }: Props) {
  const { colors } = useTheme();

  if (items.length === 0) return null;

  const label = `${items.length} ticked item${items.length === 1 ? '' : 's'}`;

  return (
    <View style={[styles.wrap, { borderTopColor: colors.line }]}>
      <Pressable
        onPress={onToggleOpen}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        style={styles.header}>
        <MaterialCommunityIcons
          name="chevron-right"
          size={18}
          color={colors.muted}
          style={{ transform: [{ rotate: open ? '90deg' : '0deg' }] }}
        />
        <Text style={[styles.headerLabel, { color: colors.muted }]}>{label}</Text>
      </Pressable>

      {open &&
        items.map((item) => (
          <View key={item.id} style={styles.row}>
            <Pressable
              onPress={() => onToggleItem(item.id)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: true }}
              accessibilityLabel={item.text}
              style={styles.checkboxHit}>
              <Checkbox checked />
            </Pressable>
            <Text style={[styles.text, { color: colors.muted }]} numberOfLines={1}>
              {item.text}
            </Text>
          </View>
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 14, marginHorizontal: 8, borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 8 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, paddingHorizontal: 6 },
  headerLabel: { fontFamily: Fonts.bodySemi, fontSize: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 4 },
  // Aligns the ticked checkbox with the unchecked ones, which sit to the right
  // of a 34pt drag handle.
  checkboxHit: { width: 40, height: 44, marginLeft: 34, alignItems: 'center', justifyContent: 'center' },
  text: {
    flex: 1,
    fontFamily: Fonts.body,
    fontSize: 16,
    paddingVertical: 10,
    paddingRight: 8,
    textDecorationLine: 'line-through',
  },
});
