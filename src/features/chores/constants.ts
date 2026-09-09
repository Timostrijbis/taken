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

/**
 * The bundled notification sounds (CLAUDE.md section 5). One Android
 * notification channel is pre-created per entry in build step 4; 'Silent'
 * posts to a channel with no sound. The audio files themselves do not exist
 * yet, so these are names only for now.
 */
export const CHORE_SOUNDS = ['Chime', 'Marimba', 'Pebble', 'Bell', 'Kettle', 'Silent'];

/** The starter chores created on first launch (CLAUDE.md section 6). */
export const SEED_CHORES = [
  { name: 'Water plants', icon: 'leaf', intervalDays: 7, sound: 'Chime' },
  { name: 'Doing laundry', icon: 'shirt', intervalDays: 7, sound: 'Marimba' },
  { name: 'Take out the trash', icon: 'trash-2', intervalDays: 3, sound: 'Pebble' },
  { name: 'Clean the kitchen', icon: 'utensils', intervalDays: 3, sound: 'Bell' },
  { name: 'Dust shelves', icon: 'sofa', intervalDays: 14, sound: 'Silent' },
  { name: 'Clean the bathroom', icon: 'bath', intervalDays: 14, sound: 'Kettle' },
];
