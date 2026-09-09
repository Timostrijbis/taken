import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Fonts } from '@/constants/theme';
import { useTheme } from '@/constants/use-theme';

/**
 * The rounded "List item" field at the top of the grocery screen. Submitting
 * with the keyboard's return key or tapping "Add" both add the item, and the
 * field stays focused so several items can be typed in a row.
 */
export function AddItemRow({ onAdd }: { onAdd: (text: string) => void }) {
  const { colors } = useTheme();
  const [text, setText] = useState('');

  const submit = () => {
    if (!text.trim()) return;
    onAdd(text);
    setText('');
  };

  return (
    <View style={styles.outer}>
      <View style={[styles.pill, { backgroundColor: colors.card, borderColor: colors.line }]}>
        <MaterialCommunityIcons name="plus" size={20} color={colors.ink} style={styles.plus} />
        <TextInput
          value={text}
          onChangeText={setText}
          onSubmitEditing={submit}
          placeholder="List item"
          placeholderTextColor={colors.muted}
          returnKeyType="done"
          // Keeps the keyboard up so the next item can be typed straight away.
          // (`submitBehavior` supersedes the older `blurOnSubmit` prop.)
          submitBehavior="submit"
          style={[styles.input, { color: colors.ink }]}
        />
        <Pressable onPress={submit} accessibilityRole="button" disabled={!text.trim()}>
          <Text style={[styles.add, { color: colors.accent, opacity: text.trim() ? 1 : 0.35 }]}>
            Add
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: { paddingHorizontal: 18, paddingTop: 10, paddingBottom: 2 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 13,
    paddingHorizontal: 18,
  },
  plus: { opacity: 0.5 },
  input: { flex: 1, minWidth: 0, fontFamily: Fonts.body, fontSize: 16, padding: 0 },
  add: { fontFamily: Fonts.bodySemi, fontSize: 14 },
});
