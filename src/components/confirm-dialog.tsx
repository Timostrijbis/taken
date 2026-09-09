import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Fonts } from '@/constants/theme';
import { useTheme } from '@/constants/use-theme';

type Props = {
  visible: boolean;
  title: string;
  body: string;
  actionLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
};

/**
 * The confirm sheet from the design, used before anything destructive —
 * deleting a chore takes its completion history with it (CLAUDE.md section 6).
 */
export function ConfirmDialog({ visible, title, body, actionLabel, onCancel, onConfirm }: Props) {
  const { colors } = useTheme();
  if (!visible) return null;

  return (
    <Pressable style={styles.scrim} onPress={onCancel} accessibilityLabel="Cancel">
      {/* Stops a tap inside the card from closing it. */}
      <Pressable style={[styles.card, { backgroundColor: colors.card }]} onPress={() => {}}>
        <Text style={[styles.title, { color: colors.ink }]}>{title}</Text>
        <Text style={[styles.body, { color: colors.muted }]}>{body}</Text>
        <View style={styles.actions}>
          <Pressable onPress={onCancel} style={styles.cancel} accessibilityRole="button">
            <Text style={[styles.cancelText, { color: colors.muted }]}>Cancel</Text>
          </Pressable>
          <Pressable
            onPress={onConfirm}
            style={[styles.confirm, { backgroundColor: colors.accent }]}
            accessibilityRole="button">
            <Text style={[styles.confirmText, { color: colors.accentInk }]}>{actionLabel}</Text>
          </Pressable>
        </View>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(32, 30, 29, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 26,
  },
  card: { borderRadius: 28, paddingTop: 26, paddingHorizontal: 24, paddingBottom: 18, width: '100%' },
  title: { fontFamily: Fonts.display, fontSize: 21, lineHeight: 25 },
  body: { fontFamily: Fonts.body, fontSize: 14, marginTop: 10, lineHeight: 21 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 20 },
  cancel: { paddingVertical: 12, paddingHorizontal: 18, borderRadius: 999 },
  cancelText: { fontFamily: Fonts.bodySemi, fontSize: 14 },
  confirm: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 999 },
  confirmText: { fontFamily: Fonts.bodySemi, fontSize: 14 },
});
