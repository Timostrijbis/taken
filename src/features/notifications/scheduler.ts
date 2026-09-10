import * as Notifications from 'expo-notifications';

import { intervalLabel, nextDueAt } from '@/features/chores/due';
import { listChores } from '@/features/chores/repository';

import { channelIdFor, ensureChannels } from './channels';

/**
 * Turning the database into scheduled notifications (CLAUDE.md section 5).
 *
 * The design rule is that **the database is the truth and the scheduled
 * notifications are a disposable projection of it**. We never try to patch the
 * schedule in place — time-zone changes, app updates and OS quirks all
 * desynchronise it, and a wrong pending alarm is invisible until it fires at
 * the wrong moment. Instead every reconcile throws the whole schedule away and
 * rebuilds it from the rows.
 *
 * That makes reconcile cheap to call and safe to call often: on launch, after
 * a completion, and after any edit.
 */

/** Whether the user has actually granted notification permission. */
export async function hasPermission(): Promise<boolean> {
  const { granted } = await Notifications.getPermissionsAsync();
  return granted;
}

/**
 * Asks for permission if it has not been decided yet.
 *
 * On Android 13+ this shows the system prompt. If the user has already said no
 * we do not ask again — Android would not show the prompt a second time
 * anyway, and the answer is changed in system settings, not here.
 */
export async function requestPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;

  const asked = await Notifications.requestPermissionsAsync();
  return asked.granted;
}

/**
 * Cancels everything pending and reschedules one notification per chore.
 *
 * Two deliberate omissions:
 *
 * - **One occurrence ahead per chore, never a run of them.** The next one is
 *   scheduled when this one is completed, which is also what keeps the
 *   schedule correct after an interval edit.
 * - **A chore that is already overdue gets nothing.** Its notification fired on
 *   its due date and that is the end of it (CLAUDE.md section 5: one per due
 *   date, then silence). Rescheduling it here would re-nag on every launch,
 *   which is exactly the behaviour v1 rules out. The red card is the ongoing
 *   signal instead.
 */
export async function reconcile(): Promise<void> {
  if (!(await hasPermission())) {
    // Without permission there is nothing to post to. Clear any stale schedule
    // left over from when permission was granted, then stop.
    await Notifications.cancelAllScheduledNotificationsAsync();
    return;
  }

  await ensureChannels();
  await Notifications.cancelAllScheduledNotificationsAsync();

  const now = Date.now();

  for (const chore of listChores()) {
    if (chore.soundKey === 'silent') {
      // A silent chore still has a channel, but there is no point waking the
      // device for a notification that makes no sound and does not vibrate.
      // It stays a purely visual reminder on the grid.
      continue;
    }

    const due = nextDueAt(chore, now);
    if (due <= now) continue;

    await Notifications.scheduleNotificationAsync({
      // A stable id per chore, so a stray duplicate can never accumulate even
      // if a cancel were to fail.
      identifier: `chore:${chore.id}`,
      content: {
        title: chore.name,
        body: `Due now · every ${intervalLabel(chore.intervalDays)}`,
        // Carried so a future "Done" button on the notification itself
        // (post-v1, CLAUDE.md section 6) knows which chore it belongs to.
        data: { choreId: chore.id },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: due,
        // This is what selects the sound: the channel carries it, the
        // notification does not.
        channelId: channelIdFor(chore.soundKey),
      },
    });
  }
}

/**
 * Fire-and-forget wrapper for call sites that are not async — the completion
 * handler on a card, for instance. A scheduling failure must never take down
 * the screen the user is looking at, so it is logged and swallowed.
 */
export function reconcileInBackground(): void {
  reconcile().catch((error) => console.error('[taken] reconcile failed', error));
}
