import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Fonts } from '@/constants/theme';
import { useTheme } from '@/constants/use-theme';

import { CHORE_COLORS, CHORE_ICONS, CHORE_SOUNDS } from '../constants';
import { intervalLabel } from '../due';

/** Small uppercase caption above each group of controls. */
export function FieldLabel({ children }: { children: string }) {
  const { colors } = useTheme();
  return <Text style={[styles.fieldLabel, { color: colors.muted }]}>{children}</Text>;
}

/** The 6-column grid of the thirty curated household icons. */
export function IconPicker({ value, onChange }: { value: string; onChange: (key: string) => void }) {
  const { colors } = useTheme();

  return (
    <View style={styles.iconGrid}>
      {CHORE_ICONS.map((icon) => {
        const selected = icon.key === value;
        return (
          <Pressable
            key={icon.key}
            onPress={() => onChange(icon.key)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={icon.key}
            style={[
              styles.iconCell,
              {
                backgroundColor: selected ? colors.accent : colors.sand,
                borderColor: selected ? colors.accent : colors.line,
              },
            ]}>
            <MaterialCommunityIcons
              name={icon.glyph}
              size={20}
              color={selected ? colors.accentInk : colors.muted}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

/** The six colour swatches; the selected one gets a ring and a check. */
export function ColorPicker({ value, onChange }: { value: string; onChange: (c: string) => void }) {
  const { colors } = useTheme();

  return (
    <View style={styles.swatchRow}>
      {CHORE_COLORS.map((color) => {
        const selected = color === value;
        return (
          <Pressable
            key={color}
            onPress={() => onChange(color)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={`Colour ${color}`}
            style={[
              styles.swatch,
              {
                backgroundColor: color,
                borderColor: selected ? colors.ink : 'transparent',
              },
            ]}>
            {selected && <MaterialCommunityIcons name="check" size={17} color="#ffffff" />}
          </Pressable>
        );
      })}
    </View>
  );
}

/** The bundled notification sounds, as selectable chips. */
export function SoundPicker({ value, onChange }: { value: string; onChange: (s: string) => void }) {
  const { colors } = useTheme();

  return (
    <View style={styles.chipRow}>
      {CHORE_SOUNDS.map((sound) => {
        const selected = sound === value;
        return (
          <Pressable
            key={sound}
            onPress={() => onChange(sound)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            style={[
              styles.chip,
              {
                backgroundColor: selected ? colors.accent : 'transparent',
                borderColor: selected ? colors.accent : colors.line,
              },
            ]}>
            <Text style={[styles.chipText, { color: selected ? colors.accentInk : colors.ink }]}>
              {sound}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** "Repeat every N days", with minus/plus buttons. */
export function IntervalStepper({
  value,
  onChange,
}: {
  value: number;
  onChange: (days: number) => void;
}) {
  const { colors } = useTheme();

  return (
    <View style={styles.stepperRow}>
      <View>
        <FieldLabel>Repeat every</FieldLabel>
        <Text style={[styles.stepperValue, { color: colors.ink }]}>{intervalLabel(value)}</Text>
      </View>
      <View style={styles.stepperButtons}>
        <Pressable
          onPress={() => onChange(Math.max(1, value - 1))}
          accessibilityRole="button"
          accessibilityLabel="Shorter interval"
          style={[styles.stepperButton, { borderColor: colors.line }]}>
          <MaterialCommunityIcons name="minus" size={18} color={colors.ink} />
        </Pressable>
        <Pressable
          onPress={() => onChange(value + 1)}
          accessibilityRole="button"
          accessibilityLabel="Longer interval"
          style={[styles.stepperButton, { borderColor: colors.line }]}>
          <MaterialCommunityIcons name="plus" size={18} color={colors.ink} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fieldLabel: {
    fontFamily: Fonts.body,
    fontSize: 10.5,
    letterSpacing: 0.85,
    textTransform: 'uppercase',
  },
  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  // Six per row, accounting for the five 8pt gaps between them.
  iconCell: {
    width: '14.2%',
    aspectRatio: 1,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatchRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  swatch: {
    width: 40,
    height: 40,
    borderRadius: 999,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingVertical: 10, paddingHorizontal: 15, borderRadius: 999, borderWidth: 1 },
  chipText: { fontFamily: Fonts.bodyMedium, fontSize: 13.5 },
  stepperRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  stepperValue: { fontFamily: Fonts.bodyMedium, fontSize: 17, marginTop: 3 },
  stepperButtons: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stepperButton: {
    width: 42,
    height: 42,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
