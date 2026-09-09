import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ConfirmDialog } from '@/components/confirm-dialog';
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
import { glyphFor } from '@/features/chores/constants';
import { historyLabel, longLabel, urgencyOf, washFor } from '@/features/chores/due';
import * as repo from '@/features/chores/repository';
import { useChore } from '@/features/chores/use-chores';

/**
 * The chore detail / edit screen (CLAUDE.md section 6).
 *
 * Every control writes straight to the database and re-reads, so there is no
 * separate save step and an edit can never be half-applied. Changing the
 * interval takes effect immediately and retroactively, because the due date is
 * derived from the last completion rather than stored.
 */
export default function ChoreDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { chore, now, refresh } = useChore(id);
  const toast = useToast();

  const [confirmOpen, setConfirmOpen] = useState(false);
  // Holds the in-progress name while typing; null means "show the stored one".
  const [draftName, setDraftName] = useState<string | null>(null);

  if (!chore) {
    return <View style={[styles.screen, { backgroundColor: colors.bg }]} />;
  }

  const urgency = urgencyOf(chore, now);
  const tone = colors[urgency === 'over' ? 'over' : urgency === 'today' ? 'today' : 'calm'];
  const edge = urgency === 'calm' ? colors.line : tone;

  const patch = (fields: Parameters<typeof repo.updateChore>[1]) => {
    repo.updateChore(chore.id, fields);
    refresh();
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Back"
          style={styles.headerButton}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={colors.ink} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.ink }]}>Edit chore</Text>
      </View>

      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        {/* Hero: what this chore is, and the one action you usually want. */}
        <View style={[styles.hero, { backgroundColor: colors.card, borderColor: edge }]}>
          <View style={[styles.heroIcon, { backgroundColor: washFor(chore.color, isDark) }]}>
            <MaterialCommunityIcons name={glyphFor(chore.icon)} size={36} color={tone} />
          </View>
          <Text style={[styles.heroName, { color: colors.ink }]}>{chore.name}</Text>
          <Text style={[styles.heroLong, { color: tone }]}>{longLabel(chore, now)}</Text>
          <Text style={[styles.heroHistory, { color: colors.muted }]}>
            {historyLabel(chore, now)}
          </Text>

          <Pressable
            onPress={() => {
              repo.markDone(chore.id);
              refresh();
              router.back();
            }}
            accessibilityRole="button"
            style={[styles.primaryButton, { backgroundColor: colors.accent }]}>
            <MaterialCommunityIcons name="check" size={20} color={colors.accentInk} />
            <Text style={[styles.primaryText, { color: colors.accentInk }]}>Mark done</Text>
          </Pressable>
        </View>

        {/* The editable fields, as one grouped card. */}
        <View style={[styles.fields, { backgroundColor: colors.card, borderColor: colors.line }]}>
          <View style={[styles.field, { borderBottomColor: colors.line }]}>
            <FieldLabel>Name</FieldLabel>
            <TextInput
              value={draftName ?? chore.name}
              onChangeText={setDraftName}
              onEndEditing={() => {
                const next = (draftName ?? '').trim();
                if (next && next !== chore.name) patch({ name: next });
                setDraftName(null);
              }}
              style={[styles.nameInput, { color: colors.ink }]}
            />
          </View>

          <View style={[styles.field, { borderBottomColor: colors.line }]}>
            <IntervalStepper
              value={chore.intervalDays}
              onChange={(days) => patch({ intervalDays: days })}
            />
            <Text style={[styles.note, { color: colors.muted }]}>
              retroactive - next due is recomputed from the last completion, so nothing overdue can
              hide
            </Text>
          </View>

          <View style={[styles.field, { borderBottomColor: colors.line }]}>
            <FieldLabel>Icon</FieldLabel>
            <View style={styles.pickerSpace}>
              <IconPicker value={chore.icon} onChange={(icon) => patch({ icon })} />
            </View>
          </View>

          <View style={[styles.field, { borderBottomColor: colors.line }]}>
            <FieldLabel>Colour</FieldLabel>
            <View style={styles.pickerSpace}>
              <ColorPicker value={chore.color} onChange={(color) => patch({ color })} />
            </View>
          </View>

          <View style={styles.fieldLast}>
            <FieldLabel>Sound</FieldLabel>
            <View style={styles.pickerSpace}>
              <SoundPicker value={chore.soundKey} onChange={(soundKey) => patch({ soundKey })} />
            </View>
            <Text style={[styles.note, { color: colors.muted }]}>
              each sound is a pre-created notification channel
            </Text>
          </View>
        </View>

        <Pressable
          onPress={() => toast.show('Notifications arrive in step 4')}
          accessibilityRole="button"
          style={[styles.outlineButton, { borderColor: colors.line }]}>
          <MaterialCommunityIcons name="bell-ring-outline" size={18} color={colors.muted} />
          <Text style={[styles.outlineText, { color: colors.muted }]}>Preview the reminder</Text>
        </Pressable>

        <Pressable
          onPress={() => setConfirmOpen(true)}
          accessibilityRole="button"
          style={[styles.dangerButton, { borderColor: colors.danger }]}>
          <Text style={[styles.dangerText, { color: colors.danger }]}>Delete chore</Text>
        </Pressable>
      </ScrollView>

      <Toast message={toast.message} />

      <ConfirmDialog
        visible={confirmOpen}
        title={`Delete ${chore.name}?`}
        body="Gone for good, completion history included."
        actionLabel="Delete"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          repo.deleteChore(chore.id);
          setConfirmOpen(false);
          router.back();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingHorizontal: 8, paddingTop: 10 },
  headerButton: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, fontFamily: Fonts.bodySemi, fontSize: 16 },
  body: { paddingHorizontal: 18, paddingTop: 6, paddingBottom: 40 },
  hero: {
    borderRadius: 28,
    borderWidth: 1,
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
    gap: 10,
  },
  heroIcon: { width: 74, height: 74, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  heroName: { fontFamily: Fonts.display, fontSize: 23, lineHeight: 26, textAlign: 'center' },
  heroLong: { fontFamily: Fonts.bodySemi, fontSize: 14 },
  heroHistory: { fontFamily: Fonts.mono, fontSize: 10.5, textAlign: 'center' },
  primaryButton: {
    marginTop: 8,
    alignSelf: 'stretch',
    height: 54,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },
  primaryText: { fontFamily: Fonts.bodySemi, fontSize: 16 },
  fields: { marginTop: 18, borderRadius: 28, borderWidth: 1, overflow: 'hidden' },
  field: { paddingVertical: 16, paddingHorizontal: 18, borderBottomWidth: StyleSheet.hairlineWidth },
  fieldLast: { paddingVertical: 16, paddingHorizontal: 18 },
  nameInput: { fontFamily: Fonts.bodyMedium, fontSize: 17, paddingTop: 4, paddingBottom: 0 },
  pickerSpace: { marginTop: 12 },
  note: { fontFamily: Fonts.mono, fontSize: 10, marginTop: 12, lineHeight: 15 },
  outlineButton: {
    marginTop: 16,
    height: 50,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },
  outlineText: { fontFamily: Fonts.bodySemi, fontSize: 14 },
  dangerButton: {
    marginTop: 12,
    height: 50,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerText: { fontFamily: Fonts.bodySemi, fontSize: 14 },
});
