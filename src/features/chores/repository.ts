import { db } from '@/db/database';

import { CHORE_COLORS, SEED_CHORES } from './constants';
import type { Chore } from './types';

type Row = {
  id: string;
  name: string;
  icon: string;
  color: string;
  interval_days: number;
  sound_key: string;
  last_completed_at: number | null;
  created_at: number;
  sort_order: number;
  completion_count: number;
};

function toChore(row: Row): Chore {
  return {
    id: row.id,
    name: row.name,
    icon: row.icon,
    color: row.color,
    intervalDays: row.interval_days,
    soundKey: row.sound_key,
    lastCompletedAt: row.last_completed_at,
    createdAt: row.created_at,
    sortOrder: row.sort_order,
    completionCount: row.completion_count,
  };
}

function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

const SELECT = `
  SELECT c.id, c.name, c.icon, c.color, c.interval_days, c.sound_key,
         c.last_completed_at, c.created_at, c.sort_order,
         (SELECT COUNT(*) FROM completions WHERE chore_id = c.id) AS completion_count
    FROM chores c`;

export function listChores(): Chore[] {
  return db.getAllSync<Row>(`${SELECT} ORDER BY c.sort_order ASC`).map(toChore);
}

export function getChore(id: string): Chore | null {
  const row = db.getFirstSync<Row>(`${SELECT} WHERE c.id = ?`, id);
  return row ? toChore(row) : null;
}

export type NewChore = {
  name: string;
  icon: string;
  color: string;
  intervalDays: number;
  soundKey: string;
};

export function createChore(input: NewChore): Chore {
  const last = db.getFirstSync<{ max: number | null }>(
    'SELECT MAX(sort_order) AS max FROM chores',
  );
  const id = newId();

  db.runSync(
    `INSERT INTO chores
       (id, name, icon, color, interval_days, sound_key, last_completed_at, created_at, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, NULL, ?, ?)`,
    id,
    input.name.trim(),
    input.icon,
    input.color,
    input.intervalDays,
    input.soundKey,
    Date.now(),
    (last?.max ?? 0) + 1,
  );

  return getChore(id)!;
}

/** Applies a partial edit. Only the fields present are written. */
export function updateChore(id: string, fields: Partial<NewChore>): void {
  const sets: string[] = [];
  const values: (string | number)[] = [];

  if (fields.name !== undefined) {
    sets.push('name = ?');
    values.push(fields.name.trim());
  }
  if (fields.icon !== undefined) {
    sets.push('icon = ?');
    values.push(fields.icon);
  }
  if (fields.color !== undefined) {
    sets.push('color = ?');
    values.push(fields.color);
  }
  if (fields.intervalDays !== undefined) {
    sets.push('interval_days = ?');
    values.push(fields.intervalDays);
  }
  if (fields.soundKey !== undefined) {
    sets.push('sound_key = ?');
    values.push(fields.soundKey);
  }
  if (sets.length === 0) return;

  db.runSync(`UPDATE chores SET ${sets.join(', ')} WHERE id = ?`, ...values, id);
}

/**
 * Records a completion.
 *
 * Two writes, in one transaction: a permanent row in `completions`, and the
 * denormalised `last_completed_at` the due-date maths reads. The history is
 * kept in full from day one (CLAUDE.md section 4) even though nothing displays
 * it in v1 — that is what makes streaks and heat-maps possible later.
 */
export function markDone(id: string, at: number = Date.now()): void {
  db.withTransactionSync(() => {
    db.runSync(
      'INSERT INTO completions (id, chore_id, completed_at) VALUES (?, ?, ?)',
      newId(),
      id,
      at,
    );
    db.runSync('UPDATE chores SET last_completed_at = ? WHERE id = ?', at, id);
  });
}

/** Deletes a chore. Its completions cascade away with it. */
export function deleteChore(id: string): void {
  db.runSync('DELETE FROM chores WHERE id = ?', id);
}

/** Inserts the six starter chores. Used on first launch and by Reset. */
export function seedChores(): void {
  db.withTransactionSync(() => {
    SEED_CHORES.forEach((seed, index) => {
      db.runSync(
        `INSERT INTO chores
           (id, name, icon, color, interval_days, sound_key, last_completed_at, created_at, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, NULL, ?, ?)`,
        newId(),
        seed.name,
        seed.icon,
        CHORE_COLORS[index % CHORE_COLORS.length],
        seed.intervalDays,
        seed.sound,
        Date.now(),
        index + 1,
      );
    });
  });
}

/**
 * Seeds only if the table has never held anything.
 *
 * Deliberately not "seed if empty": deleting every chore is a legitimate thing
 * to do, and the six starters should not silently reappear on next launch.
 * The marker row in `app_state` is what distinguishes the two cases.
 */
export function seedChoresOnce(): void {
  const seeded = db.getFirstSync<{ value: string }>(
    "SELECT value FROM app_state WHERE key = 'chores_seeded'",
  );
  if (seeded) return;

  seedChores();
  db.runSync("INSERT INTO app_state (key, value) VALUES ('chores_seeded', '1')");
}
