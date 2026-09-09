/**
 * Every colour in the app comes from here.
 *
 * The app follows the phone's system light/dark setting (CLAUDE.md section 9),
 * so each colour is defined twice: once for `light`, once for `dark`. Screens
 * never hard-code a colour; they call `useTheme()` below and read from it.
 */

const palette = {
  green: '#1E6F5C',
  greenLight: '#3FA58C',
  amber: '#C77700',
  amberLight: '#F0A21B',
  red: '#C0392B',
  redLight: '#E85B4B',
};

/** The set of colours every screen can use. Light and dark both provide all of them. */
export type ThemeColors = {
  background: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  textMuted: string;
  border: string;
  accent: string;
  /** Urgency colours for chore cards: calm -> due today -> overdue. */
  calm: string;
  due: string;
  overdue: string;
};

export const Colors: { light: ThemeColors; dark: ThemeColors } = {
  light: {
    background: '#F7F7F5',
    surface: '#FFFFFF',
    surfaceAlt: '#ECECE8',
    text: '#1A1A18',
    textMuted: '#6B6B66',
    border: '#DEDED8',
    accent: palette.green,
    calm: palette.green,
    due: palette.amber,
    overdue: palette.red,
  },
  dark: {
    background: '#121211',
    surface: '#1E1E1C',
    surfaceAlt: '#2A2A27',
    text: '#F2F2EF',
    textMuted: '#9A9A93',
    border: '#333330',
    accent: palette.greenLight,
    calm: palette.greenLight,
    due: palette.amberLight,
    overdue: palette.redLight,
  },
};
