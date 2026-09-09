import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Fonts } from '@/constants/theme';
import { useTheme } from '@/constants/use-theme';

/**
 * Screen 1 — Chores. Because the file is named `index.tsx`, this is the tab
 * the app opens on. The 2-column chore grid from the design arrives in build
 * step 3; for now the screen just carries the shared header treatment.
 */
export default function ChoresScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.ink }]}>Chores</Text>
        <Text style={[styles.summary, { color: colors.muted }]}>nothing here yet</Text>
      </View>

      <View style={styles.body}>
        <Text style={[styles.note, { color: colors.muted }]}>
          The chore grid lands here in step 3.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { paddingLeft: 22, paddingRight: 8, paddingTop: 14, paddingBottom: 6 },
  title: { fontFamily: Fonts.display, fontSize: 32, lineHeight: 38 },
  summary: { fontFamily: Fonts.body, fontSize: 13, marginTop: 4 },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  note: { fontFamily: Fonts.mono, fontSize: 11 },
});
