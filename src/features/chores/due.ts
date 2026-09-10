import { soundLabel } from './constants';
import type { Chore, Urgency } from './types';

export const DAY_MS = 86_400_000;

/**
 * When the next reminder is due.
 *
 * This is never stored (CLAUDE.md section 4) — it is recomputed from the last
 * completion every time it is needed. That is what makes an interval edit
 * retroactive: change the interval and the due date moves immediately, so a
 * chore that is already overdue cannot be hidden by editing it.
 *
 * A chore that has never been completed counts from when it was *created*, so
 * a new 7-day chore is first due seven days later rather than instantly. The
 * anchor has to be a fixed point in the past: an earlier version used
 * `now - DAY_MS`, which is recomputed on every render and reconcile, so the
 * due date slid forward continuously and the chore never actually came due.
 */
export function nextDueAt(chore: Chore, now: number): number {
  const base = chore.lastCompletedAt ?? chore.createdAt;
  return base + chore.intervalDays * DAY_MS;
}

export function urgencyOf(chore: Chore, now: number): Urgency {
  const remaining = nextDueAt(chore, now) - now;
  if (remaining < 0) return 'over';
  if (remaining < DAY_MS) return 'today';
  return 'calm';
}

/** The short countdown under a card's name: "in 3d", "in 5h", "2d overdue". */
export function shortLabel(chore: Chore, now: number): string {
  const remaining = nextDueAt(chore, now) - now;

  if (remaining < 0) {
    const days = Math.floor(-remaining / DAY_MS);
    if (days >= 1) return `${days}d overdue`;
    return `${Math.max(1, Math.round(-remaining / 3_600_000))}h overdue`;
  }
  if (remaining < DAY_MS) return `in ${Math.max(1, Math.round(remaining / 3_600_000))}h`;
  return `in ${Math.round(remaining / DAY_MS)}d`;
}

/** The fuller sentence on the detail screen. */
export function longLabel(chore: Chore, now: number): string {
  const remaining = nextDueAt(chore, now) - now;
  if (remaining < 0) return `Overdue — ${shortLabel(chore, now)}`;
  if (remaining < DAY_MS) return `Due today, ${shortLabel(chore, now)}`;
  return `Next reminder ${shortLabel(chore, now)}`;
}

export function intervalLabel(days: number): string {
  return `${days} ${days === 1 ? 'day' : 'days'}`;
}

/** The small mono caption on the detail screen. */
export function historyLabel(chore: Chore, now: number): string {
  const last =
    chore.lastCompletedAt === null
      ? 'never done'
      : `last done ${Math.round((now - chore.lastCompletedAt) / DAY_MS)}d ago`;
  return `${last} · ${chore.completionCount} in history · ${soundLabel(chore.soundKey).toLowerCase()}`;
}

/**
 * The chore's colour at low opacity, used as the wash behind its icon.
 * Dark mode needs a slightly stronger tint to read against the dark card.
 */
export function washFor(color: string, isDark: boolean): string {
  return `${color}${isDark ? '2e' : '22'}`;
}

/** The one-line summary under the "Chores" title. */
export function summaryLine(chores: Chore[], now: number): string {
  const overdue = chores.filter((c) => urgencyOf(c, now) === 'over').length;
  const today = chores.filter((c) => urgencyOf(c, now) === 'today').length;
  if (overdue) return `${overdue} overdue · ${today} due today`;
  if (today) return `${today} due today · rest is calm`;
  return 'nothing due — all calm';
}
