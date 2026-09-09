import * as SQLite from 'expo-sqlite';

/**
 * The single SQLite connection for the whole app.
 *
 * `openDatabaseSync` creates the file the first time it runs and re-opens it
 * on every later launch. The file lives in the app's private storage on the
 * phone, so it survives closing the app and is wiped only if the app is
 * uninstalled. It is never uploaded anywhere (CLAUDE.md section 2).
 */
const db = SQLite.openDatabaseSync('taken.db');

/**
 * Migrations.
 *
 * SQLite keeps a number per database file called `user_version`, which starts
 * at 0. We use it as "how many migrations have already run on this phone".
 * Each migration below moves it up by one. This is what lets us change the
 * schema in a later build without wiping the user's data: the app compares the
 * number in the file against the list here and runs only what is missing.
 *
 * Rule: never edit a migration that has already shipped. Add a new one.
 */
const MIGRATIONS: { version: number; up: (database: SQLite.SQLiteDatabase) => void }[] = [
  {
    version: 1,
    up: (database) => {
      // Grocery list (CLAUDE.md section 4).
      // sort_order is REAL, not INTEGER, on purpose: to drag an item between
      // two others we can store the midpoint of their two values (e.g. between
      // 3 and 4 -> 3.5) and rewrite one row, instead of renumbering the list.
      database.execSync(`
        CREATE TABLE IF NOT EXISTS grocery_items (
          id          TEXT PRIMARY KEY NOT NULL,
          text        TEXT NOT NULL,
          checked     INTEGER NOT NULL DEFAULT 0,
          sort_order  REAL NOT NULL,
          checked_at  INTEGER
        );
      `);
    },
  },
];

/**
 * Brings the database file up to the newest schema. Safe to call on every
 * launch: if nothing is outstanding it does nothing.
 */
export function migrate(): void {
  const row = db.getFirstSync<{ user_version: number }>('PRAGMA user_version');
  let current = row?.user_version ?? 0;

  for (const migration of MIGRATIONS) {
    if (migration.version <= current) continue;

    // Each migration runs inside a transaction, so a failure part-way through
    // leaves the database untouched rather than half-upgraded.
    db.withTransactionSync(() => {
      migration.up(db);
      // PRAGMA does not accept bound parameters, so the number is inlined.
      // It comes from our own constant above, never from user input.
      db.execSync(`PRAGMA user_version = ${migration.version}`);
    });

    current = migration.version;
  }
}

export { db };
