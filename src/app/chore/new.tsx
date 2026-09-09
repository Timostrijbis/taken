import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Toast, useToast } from '@/components/toast';
import { Fonts } from '@/constants/theme';
import { useTheme } from '@/constants/use-theme';
import {
  ColorPicker,
  FieldLabel,
  IconPicker,
  IntervalStepper,
  SoundPicker,
} from '@/features/chores/components/pickers';
import { CHORE_COLORS, CHORE_SOUNDS, glyphFor } from '@/features/chores/constants';
import { washFor } from '@/features/chores/due';
import * as repo from '@/features/chores/repository';

/**
 * The add-chore screen (CLAUDE.md section 6).
 *
 * Unlike the detail screen, this one holds a draft in memory and only writes
 * when Save is pressed - there is no row to edit until the chore exists. A new
 * chore has never been completed, so it is due immediately.
 */
export default function NewChoreScreen() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const toast = useToast();

  const [name, setName] = useState('');
  const [icon, setIcon] = useState('leaf');
  const [color, setColor] = useState(CHORE_COLORS[0]);
  const [intervalDays, setIntervalDays] = useState(7);
  const [soundKey, setSoundKey] = useState(CHORE_SOUNDS[0]);

  const save = () => {
    if (!name.trim()) {
      toast.show('Give the chore a name first');
      return;
    }
    repo.createChore({ name, icon, color, intervalDays, soundKey });
    router.back();
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Cancel"
          style={styles.headerButton}>
          <MaterialCommunityIcons name="close" size={21} color={colors.ink} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.ink }]}>New chore</Text>
        <Pressable
          onPress={save}
          accessibilityRole="button"
          style={[styles.saveButton, { backgroundColor: colors.accent }]}>
          <Text style={[styles.saveText, { color: colors.accentInk }]}>Save</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <View style={[styles.card, styles.nameCard, { backgroundColor: colors.card, borderColor: colors.line }]}>
          <View style={[styles.previewIcon, { backgroundColor: washFor(color, isDark) }]}>
            <MaterialCommunityIcons name={glyphFor(icon)} size={23} color={color} />
          </View>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Chore name"
            placeholderTextColor={colors.muted}
            style={[styles.nameInput, { color: colors.ink }]}
          />
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.line }]}>
          <FieldLabel>Pick an icon · 30 household icons</FieldLabel>
          <View style={styles.pickerSpace}>
            <IconPicker value={icon} onChange={setIcon} />
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.line }]}>
          <IntervalStepper value={intervalDays} onChange={setIntervalDays} />
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.line }]}>
          <FieldLabel>Colour</FieldLabel>
          <View style={styles.pickerSpace}>
            <ColorPicker value={color} onChange={setColor} />
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.line }]}>
          <FieldLabel>Sound</FieldLabel>
          <View style={styles.pickerSpace}>
            <SoundPicker value={soundKey} onChange={setSoundKey} />
          </View>
        </View>
      </ScrollView>

      <Toast message={toast.message} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingHorizontal: 8, paddingTop: 10 },
  headerButton: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, fontFamily: Fonts.display, fontSize: 20 },
  saveButton: { paddingVertical: 11, paddingHorizontal: 20, marginRight: 10, borderRadius: 999 },
  saveText: { fontFamily: Fonts.bodySemi, fontSize: 14 },
  body: { paddingHorizontal: 18, paddingTop: 8, paddingBottom: 40, gap: 16 },
  card: { borderRadius: 28, borderWidth: 1, paddingVertical: 16, paddingHorizontal: 18 },
  nameCard: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  previewIcon: { width: 48, height: 48, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  nameInput: { flex: 1, minWidth: 0, fontFamily: Fonts.bodySemi, fontSize: 17, padding: 0 },
  pickerSpace: { marginTop: 12 },
});
