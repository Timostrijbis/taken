import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Toast, useToast } from '@/components/toast';
import { Fonts } from '@/constants/theme';
import { useTheme } from '@/constants/use-theme';
import { AddItemRow } from '@/features/groceries/components/add-item-row';
import { CheckedSection } from '@/features/groceries/components/checked-section';
import { UncheckedList } from '@/features/groceries/components/unchecked-list';
import { useGroceries } from '@/features/groceries/use-groceries';

/**
 * Screen 2 — the grocery list (CLAUDE.md section 7). One list, Google Keep
 * behaviour: type at the top to add, tick to drop an item into the collapsed
 * ticked section, drag the grip to reorder, and use the overflow menu to
 * uncheck or delete everything ticked.
 */
export default function GroceriesScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const groceries = useGroceries();

  const [menuOpen, setMenuOpen] = useState(false);
  const [checkedOpen, setCheckedOpen] = useState(false);
  const toast = useToast();

  const toggle = useCallback(
    (id: string) => {
      const item = groceries.items.find((i) => i.id === id);
      if (!item) return;
      // Ticking something reveals the ticked section, so the item is visibly
      // going somewhere rather than just vanishing.
      if (!item.checked) setCheckedOpen(true);
      groceries.toggle(id, !item.checked);
    },
    [groceries],
  );

  const checkedCount = groceries.checked.length;

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.ink }]}>Groceries</Text>
        <Pressable
          onPress={() => setMenuOpen(true)}
          accessibilityRole="button"
          accessibilityLabel="List options"
          style={styles.headerButton}>
          <MaterialCommunityIcons name="dots-vertical" size={21} color={colors.muted} />
        </Pressable>
      </View>

      <AddItemRow onAdd={groceries.add} />

      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled">
        <UncheckedList
          items={groceries.unchecked}
          onToggle={toggle}
          onRename={groceries.rename}
          onReorder={groceries.reorder}
        />
        <CheckedSection
          items={groceries.checked}
          open={checkedOpen}
          onToggleOpen={() => setCheckedOpen((v) => !v)}
          onToggleItem={toggle}
        />
      </ScrollView>

      <Toast message={toast.message} />

      {menuOpen && (
        <Pressable
          style={styles.scrim}
          accessibilityRole="button"
          accessibilityLabel="Close menu"
          onPress={() => setMenuOpen(false)}>
          <View
            style={[
              styles.menu,
              { top: insets.top + 58, backgroundColor: colors.card, borderColor: colors.line },
            ]}>
            <Pressable
              onPress={() => {
                setMenuOpen(false);
                if (checkedCount === 0) return toast.show('Nothing is ticked');
                groceries.uncheckAll();
                toast.show(`Unchecked ${checkedCount} item${checkedCount === 1 ? '' : 's'}`);
              }}
              style={[styles.menuItem, { borderBottomColor: colors.line, borderBottomWidth: StyleSheet.hairlineWidth }]}>
              <Text style={[styles.menuText, { color: colors.ink }]}>Uncheck all items</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setMenuOpen(false);
                if (checkedCount === 0) return toast.show('Nothing is ticked');
                groceries.clearChecked();
                toast.show(`Deleted ${checkedCount} ticked item${checkedCount === 1 ? '' : 's'}`);
              }}
              style={styles.menuItem}>
              <Text style={[styles.menuText, { color: colors.ink }]}>Delete checked items</Text>
            </Pressable>
          </View>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingLeft: 22,
    paddingRight: 8,
    paddingTop: 14,
    paddingBottom: 6,
  },
  title: { fontFamily: Fonts.display, fontSize: 32, lineHeight: 38 },
  headerButton: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 999 },
  list: { flex: 1 },
  listContent: { paddingHorizontal: 10, paddingTop: 6, paddingBottom: 40 },
  scrim: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(32, 30, 29, 0.28)' },
  menu: {
    position: 'absolute',
    right: 14,
    width: 226,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  menuItem: { paddingVertical: 15, paddingHorizontal: 18 },
  menuText: { fontFamily: Fonts.bodyMedium, fontSize: 15 },
});
