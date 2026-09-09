import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Fonts } from '@/constants/theme';
import { useTheme } from '@/constants/use-theme';

import { glyphFor } from '../constants';
import { shortLabel, urgencyOf, washFor } from '../due';
import type { Chore } from '../types';

type Props = {
  chore: Chore;
  now: number;
  width: number;
  onOpen: () => void;
  onDone: () => void;
};

/**
 * One card in the chore grid.
 *
 * Colour carries the meaning (CLAUDE.md section 6): the countdown text, the
 * dot beside it and the card's border all take the urgency colour — calm green
 * when distant, amber when due today, red once overdue. Only the wash behind
 * the icon uses the chore's own colour.
 */
export function ChoreCard({ chore, now, width, onOpen, onDone }: Props) {
  const { colors, isDark } = useTheme();

  const urgency = urgencyOf(chore, now);
  const tone = colors[urgency === 'over' ? 'over' : urgency === 'today' ? 'today' : 'calm'];
  const edge = urgency === 'calm' ? colors.line : tone;

  return (
    <Pressable
      onPress={onOpen}
      accessibilityRole="button"
      accessibilityLabel={`${chore.name}, ${shortLabel(chore, now)}`}
      style={[styles.card, { width, backgroundColor: colors.card, borderColor: edge }]}>
      <View style={styles.top}>
        <View style={[styles.iconCircle, { backgroundColor: washFor(chore.color, isDark) }]}>
          <MaterialCommunityIcons name={glyphFor(chore.icon)} size={26} color={tone} />
        </View>

        <Pressable
          onPress={onDone}
          accessibilityRole="button"
          accessibilityLabel={`Mark ${chore.name} done`}
          // Widens the tap target beyond the visible 34pt circle.
          hitSlop={8}
          style={[styles.doneButton, { backgroundColor: colors.bg, borderColor: colors.line }]}>
          <MaterialCommunityIcons name="check" size={17} color={colors.muted} />
        </Pressable>
      </View>

      <View style={styles.bottom}>
        <Text style={[styles.name, { color: colors.ink }]} numberOfLines={2}>
          {chore.name}
        </Text>
        <View style={styles.countdown}>
          <View style={[styles.dot, { backgroundColor: tone }]} />
          <Text style={[styles.short, { color: tone }]}>{shortLabel(chore, now)}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 150,
    borderRadius: 28,
    borderWidth: 1,
    paddingTop: 16,
    paddingHorizontal: 14,
    paddingBottom: 14,
    alignItems: 'center',
    justifyContent: 'space-between',
    // Android renders shadows from `elevation`; the design's soft lift.
    elevation: 1,
  },
  top: { width: '100%', flexDirection: 'row', justifyContent: 'center' },
  iconCircle: { width: 52, height: 52, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  doneButton: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 34,
    height: 34,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottom: { width: '100%', marginTop: 12 },
  name: { fontFamily: Fonts.bodySemi, fontSize: 15, lineHeight: 18, textAlign: 'center' },
  countdown: { marginTop: 7, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  dot: { width: 7, height: 7, borderRadius: 999 },
  short: { fontFamily: Fonts.mono, fontSize: 11 },
});
