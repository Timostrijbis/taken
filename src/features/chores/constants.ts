import type MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

type MCIName = keyof typeof MaterialCommunityIcons.glyphMap;

/**
 * The curated household icon set (CLAUDE.md section 6): thirty hand-picked
 * icons, finite and coherent by design rather than a searchable library.
 *
 * The keys are the names used in the Claude Design canvas (which are Lucide's)
 * and are what gets stored in the `chores.icon` column. The values are the
 * Material Community Icons drawn in their place — the canvas fetches Lucide
 * SVGs from a CDN per icon, which an app with no runtime network access
 * (CLAUDE.md section 2) cannot do. Storing the stable Lucide key means the
 * mapping can be swapped for real Lucide later without touching the database.
 */
export const CHORE_ICONS: { key: string; glyph: MCIName }[] = [
  { key: 'leaf', glyph: 'leaf' },
  { key: 'shirt', glyph: 'tshirt-crew-outline' },
  { key: 'trash-2', glyph: 'trash-can-outline' },
  { key: 'utensils', glyph: 'silverware-fork-knife' },
  { key: 'bath', glyph: 'shower' },
  { key: 'sofa', glyph: 'sofa-outline' },
  { key: 'droplet', glyph: 'water' },
  { key: 'flower-2', glyph: 'flower-outline' },
  { key: 'wind', glyph: 'weather-windy' },
  { key: 'brush', glyph: 'broom' },
  { key: 'hammer', glyph: 'hammer' },
  { key: 'wrench', glyph: 'wrench-outline' },
  { key: 'car', glyph: 'car' },
  { key: 'bike', glyph: 'bike' },
  { key: 'book-open', glyph: 'book-open-outline' },
  { key: 'mail', glyph: 'email-outline' },
  { key: 'package', glyph: 'package-variant-closed' },
  { key: 'shopping-cart', glyph: 'cart-outline' },
  { key: 'refrigerator', glyph: 'fridge-outline' },
  { key: 'microwave', glyph: 'microwave' },
  { key: 'lightbulb', glyph: 'lightbulb-outline' },
  { key: 'thermometer', glyph: 'thermometer' },
  { key: 'key', glyph: 'key-variant' },
  { key: 'recycle', glyph: 'recycle' },
  { key: 'spray-can', glyph: 'spray' },
  { key: 'dog', glyph: 'dog' },
  { key: 'cat', glyph: 'cat' },
  { key: 'coffee', glyph: 'coffee-outline' },
  { key: 'scissors', glyph: 'content-cut' },
  { key: 'bed', glyph: 'bed-outline' },
];

const ICON_BY_KEY = new Map(CHORE_ICONS.map((i) => [i.key, i.glyph]));

/** Falls back to the first icon if a stored key is ever unknown. */
export function glyphFor(key: string): MCIName {
  return ICON_BY_KEY.get(key) ?? CHORE_ICONS[0].glyph;
}

/** The six chore colours offered in the picker. */
export const CHORE_COLORS = ['#c67139', '#7a8a5e', '#b2622d', '#56633f', '#82796a', '#f6a06b'];

export type ChoreSound = {
  /**
   * Written to `chores.sound_key` and used as the Android notification channel
   * id. Treat these as permanent: a channel cannot be renamed or altered once
   * created, and existing rows in the database refer to them.
   */
  key: string;
  /** What the picker shows. Safe to reword at any time. */
  label: string;
  /**
   * Base filename under `assets/sounds`, matching the `sounds` array in
   * app.json. `null` means the silent channel, which is a real channel that
   * simply has no sound attached.
   */
  file: string | null;
};

/**
 * The bundled notification sounds (CLAUDE.md section 5).
 *
 * These five .wav files are baked into the APK at build time by the
 * expo-notifications config plugin, and one Android channel is pre-created per
 * entry. Adding a sixth means a new native build, not just a JS reload.
 *
 * Source: Kenney's "Interface Sounds" pack, CC0 1.0 (public domain) —
 * see assets/sounds/README.md.
 */
export const CHORE_SOUNDS: ChoreSound[] = [
  { key: 'chime', label: 'Chime', file: 'chime.wav' },
  { key: 'ping', label: 'Ping', file: 'ping.wav' },
  { key: 'pebble', label: 'Pebble', file: 'pebble.wav' },
  { key: 'rise', label: 'Rise', file: 'rise.wav' },
  { key: 'nudge', label: 'Nudge', file: 'nudge.wav' },
  { key: 'silent', label: 'Silent', file: null },
];

/**
 * The label for a stored key. Falls back to the key itself so a row written by
 * a future version never renders as blank.
 */
export function soundLabel(key: string): string {
  return CHORE_SOUNDS.find((sound) => sound.key === key)?.label ?? key;
}

/** The starter chores created on first launch (CLAUDE.md section 6). */
export const SEED_CHORES = [
  { name: 'Water plants', icon: 'leaf', intervalDays: 7, sound: 'chime' },
  { name: 'Doing laundry', icon: 'shirt', intervalDays: 7, sound: 'ping' },
  { name: 'Take out the trash', icon: 'trash-2', intervalDays: 3, sound: 'pebble' },
  { name: 'Clean the kitchen', icon: 'utensils', intervalDays: 3, sound: 'rise' },
  { name: 'Dust shelves', icon: 'sofa', intervalDays: 14, sound: 'silent' },
  { name: 'Clean the bathroom', icon: 'bath', intervalDays: 14, sound: 'nudge' },
];
