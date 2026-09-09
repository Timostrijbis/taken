/**
 * Every colour in the app comes from here.
 *
 * These tokens are taken verbatim from the Claude Design canvas
 * ("Chores + Grocery App"), so the app and the design stay in step. The app
 * follows the phone's system light/dark setting (CLAUDE.md section 9), which
 * is why each token is defined twice.
 *
 * Screens never hard-code a colour; they call `useTheme()` and read from it.
 */

/** The set of colours every screen can use. Light and dark both provide all of them. */
export type ThemeColors = {
  /** Page background. */
  bg: string;
  /** Raised surfaces: cards, the add-item pill, menus. */
  card: string;
  /** Primary text. */
  ink: string;
  /** Secondary text, icons, ticked-item text. */
  muted: string;
  /** Hairline borders and dividers. */
  line: string;
  /** Terracotta. Buttons, the active checkbox, the "Add" affordance. */
  accent: string;
  /** Text drawn on top of `accent`. */
  accentInk: string;
  /** Soft fill behind the selected tab and icon washes. */
  sand: string;
  /** Toasts invert against the page. */
  toastBg: string;
  toastInk: string;
  /** Chore urgency (CLAUDE.md section 6): distant, due today, overdue. */
  calm: string;
  today: string;
  over: string;
  /** Destructive actions. */
  danger: string;
};

export const Colors: { light: ThemeColors; dark: ThemeColors } = {
  light: {
    bg: '#f5ead8',
    card: '#f9f4ed',
    ink: '#201e1d',
    muted: '#645c50',
    line: '#dcd3c4',
    accent: '#c67139',
    accentInk: '#fff6ee',
    sand: '#ebddc5',
    toastBg: '#2e2b25',
    toastInk: '#f9f4ed',
    calm: '#56633f',
    today: '#a9581f',
    over: '#a4372a',
    danger: '#a4372a',
  },
  dark: {
    bg: '#201e1d',
    card: '#2e2b25',
    ink: '#f9f4ed',
    muted: '#c0b6a5',
    line: '#474238',
    accent: '#f6a06b',
    accentInk: '#402310',
    sand: '#38342c',
    toastBg: '#f9f4ed',
    toastInk: '#201e1d',
    calm: '#aebf92',
    today: '#f6a06b',
    over: '#f0907a',
    danger: '#f0907a',
  },
};

/**
 * Font families, by role.
 *
 * The names on the right are the keys the fonts are registered under in
 * `_layout.tsx`. Caprasimo is the display face used for screen titles,
 * Figtree carries body text, and JetBrains Mono is reserved for the small
 * technical captions (countdowns, notes).
 */
export const Fonts = {
  display: 'Caprasimo_400Regular',
  body: 'Figtree_400Regular',
  bodyMedium: 'Figtree_500Medium',
  bodySemi: 'Figtree_600SemiBold',
  bodyBold: 'Figtree_700Bold',
  mono: 'JetBrainsMono_400Regular',
} as const;
