import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { reconcileInBackground } from '@/features/notifications/scheduler';

import * as repo from './repository';
import type { Chore } from './types';

/**
 * Holds the chore list for the grid.
 *
 * As with groceries, the database is the source of truth: every action writes
 * first and then re-reads. `useFocusEffect` re-reads whenever the screen comes
 * back into view, so returning from the detail screen shows the edit
 * immediately.
 */
export function useChores() {
  const [chores, setChores] = useState<Chore[]>([]);
  // Bumped on every refresh so the countdown labels recompute against a fresh
  // clock rather than one captured when the screen first rendered.
  const [now, setNow] = useState(() => Date.now());

  const refresh = useCallback(() => {
    repo.seedChoresOnce();
    setChores(repo.listChores());
    setNow(Date.now());
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const markDone = useCallback(
    (id: string) => {
      repo.markDone(id);
      refresh();
      // The completion moved this chore's next due date, so its pending
      // notification is now wrong. Rebuild the schedule from the rows.
      reconcileInBackground();
    },
    [refresh],
  );

  return { chores, now, refresh, markDone };
}

/** Loads a single chore for the detail screen. */
export function useChore(id: string) {
  const [chore, setChore] = useState<Chore | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const refresh = useCallback(() => {
    setChore(repo.getChore(id));
    setNow(Date.now());
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  return { chore, now, refresh };
}
