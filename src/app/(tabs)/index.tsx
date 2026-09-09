import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Toast, useToast } from '@/components/toast';
import { Fonts } from '@/constants/theme';
import { useTheme } from '@/constants/use-theme';
import { ChoreCard } from '@/features/chores/components/chore-card';
import { intervalLabel, summaryLine } from '@/features/chores/due';
import { useChores } from '@/features/chores/use-chores';

const GRID_PADDING = 18;
const GRID_GAP = 14;

/**
 * Screen 1 — the chore grid (CLAUDE.md section 6). Two columns of cards
 * colour-coded by urgency; tap a card to edit it, tap the check on the card to
 * mark it done, and the button bottom-right adds a new one.
 */
export default function ChoresScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { chores, now, markDone } = useChores();
  const toast = useToast();

  // Two equal columns inside the page padding, with one gap between them.
  const cardWidth = (width - GRID_PADDING * 2 - GRID_GAP) / 2;

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.ink }]}>Chores</Text>
          <Text style={[styles.summary, { color: colors.muted }]}>
            {summaryLine(chores, now)}
          </Text>
        </View>
        <Pressable
          onPress={() => toast.show('Settings arrive in step 5')}
          accessibilityRole="button"
          accessibilityLabel="Settings"
          style={styles.headerButton}>
          <MaterialCommunityIcons name="cog-outline" size={22} color={colors.muted} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.grid}>
        {chores.map((chore) => (
          <ChoreCard
            key={chore.id}
            chore={chore}
            now={now}
            width={cardWidth}
            onOpen={() => router.push({ pathname: '/chore/[id]', params: { id: chore.id } })}
            onDone={() => {
              markDone(chore.id);
              toast.show(`${chore.name} done · next in ${intervalLabel(chore.intervalDays)}`);
            }}
          />
        ))}
      </ScrollView>

      <Toast message={toast.message} bottom={24} />

      <Pressable
        onPress={() => router.push('/chore/new')}
        accessibilityRole="button"
        accessibilityLabel="Add a chore"
        style={[styles.fab, { backgroundColor: colors.accent }]}>
        <MaterialCommunityIcons name="plus" size={27} color={colors.accentInk} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingLeft: 22,
    paddingRight: 8,
    paddingTop: 14,
    paddingBottom: 6,
  },
  title: { fontFamily: Fonts.display, fontSize: 32, lineHeight: 38 },
  summary: { fontFamily: Fonts.body, fontSize: 13, marginTop: 4 },
  headerButton: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 999 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
    paddingHorizontal: GRID_PADDING,
    paddingTop: 10,
    // Clears the floating add button.
    paddingBottom: 100,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 62,
    height: 62,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },
});
