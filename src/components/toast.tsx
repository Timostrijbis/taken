import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Fonts } from '@/constants/theme';
import { useTheme } from '@/constants/use-theme';

/** Shows a brief message that clears itself. */
export function useToast() {
  const [message, setMessage] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((next: string) => {
    setMessage(next);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setMessage(''), 2600);
  }, []);

  // Clear the pending timer if the screen goes away mid-toast.
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  return { message, show };
}

/** The pill that inverts against the page, as in the design. */
export function Toast({ message, bottom = 24 }: { message: string; bottom?: number }) {
  const { colors } = useTheme();
  if (!message) return null;

  return (
    <View style={[styles.toast, { bottom, backgroundColor: colors.toastBg }]} pointerEvents="none">
      <Text style={[styles.text, { color: colors.toastInk }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: 16,
    right: 16,
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  text: { fontFamily: Fonts.body, fontSize: 13.5 },
});
