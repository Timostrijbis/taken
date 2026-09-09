import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/constants/use-theme';

/**
 * The square checkbox from the design: an outlined box when unticked, and a
 * filled terracotta box with a check inside once ticked.
 */
export function Checkbox({ checked }: { checked: boolean }) {
  const { colors } = useTheme();

  if (!checked) {
    return <View style={[styles.box, { borderWidth: 2, borderColor: colors.muted }]} />;
  }

  return (
    <View style={[styles.box, styles.center, { backgroundColor: colors.accent }]}>
      <MaterialCommunityIcons name="check" size={14} color={colors.accentInk} />
    </View>
  );
}

const styles = StyleSheet.create({
  box: { width: 21, height: 21, borderRadius: 6 },
  center: { alignItems: 'center', justifyContent: 'center' },
});
