import * as Notifications from 'expo-notifications';

import { CHORE_SOUNDS } from '@/features/chores/constants';

/**
 * Notification channels (CLAUDE.md section 5).
 *
 * On Android 8 and later the *channel* owns the sound, not the notification,
 * and a channel is immutable once created: its sound, importance and vibration
 * are frozen the moment it first exists, and nothing the app does afterwards
 * can change them. Even deleting and recreating a channel does not reset it —
 * Android remembers the original settings under the same id.
 *
 * So instead of one channel whose sound we edit, there is one channel per
 * bundled sound, all created up front. Choosing a different sound for a chore
 * means posting to a different channel.
 *
 * The practical consequence: **never change the settings below for an id that
 * has already shipped.** To alter a sound, add a new key in CHORE_SOUNDS,
 * which produces a new channel id.
 */

/** The channel id for a stored sound key. */
export function channelIdFor(soundKey: string): string {
  return `chore_${soundKey}`;
}

/**
 * Creates every channel. Safe to call on each launch: for an id that already
 * exists Android ignores the settings entirely, so this is a no-op after the
 * first run.
 */
export async function ensureChannels(): Promise<void> {
  for (const sound of CHORE_SOUNDS) {
    const silent = sound.file === null;

    await Notifications.setNotificationChannelAsync(channelIdFor(sound.key), {
      // The user sees these names in Android's own notification settings, so
      // they are worded for that screen rather than for our picker.
      name: silent ? 'Chore reminders (silent)' : `Chore reminders (${sound.label})`,
      // DEFAULT posts to the status bar and makes a sound without taking over
      // the screen. HIGH would heads-up-pop over whatever is in front — too
      // aggressive for a chore that is allowed to wait.
      importance: silent
        ? Notifications.AndroidImportance.LOW
        : Notifications.AndroidImportance.DEFAULT,
      // Only the base filename, as the Expo docs require — not a path.
      sound: sound.file,
      enableVibrate: !silent,
      vibrationPattern: silent ? undefined : [0, 220],
    });
  }
}
