import { db } from '@/db/database';

import type { GroceryItem } from './types';

/** The shape SQLite hands back; snake_case, and booleans as 0/1. */
type Row = {
  id: string;
  text: string;
  checked: number;
  sort_order: number;
  checked_at: number | null;
};

function toItem(row: Row): GroceryItem {
  return {
    id: row.id,
    text: row.text,
    checked: row.checked === 1,
    sortOrder: row.sort_order,
    checkedAt: row.checked_at,
  };
}

/**
 * A unique id for a new row. This app runs on exactly one device with no
 * server to collide with, so time plus randomness is sufficient and avoids
 * pulling in a uuid dependency.
 */
function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Gap between adjacent items, leaving room to drop things in between. */
const SORT_STEP = 1000;

/**
 * Every item, unchecked first in their drag order, then checked items with the
 * most recently ticked at the top (this is how Google Keep orders them).
 */
export function listItems(): GroceryItem[] {
  const rows = db.getAllSync<Row>(
    `SELECT id, text, checked, sort_order, checked_at
       FROM grocery_items
      ORDER BY checked ASC,
               CASE WHEN checked = 0 THEN sort_order END ASC,
               CASE WHEN checked = 1 THEN checked_at END DESC`,
  );
  return rows.map(toItem);
}

/** Adds an item to the bottom of the unchecked list. Returns the new row. */
export function addItem(text: string): GroceryItem {
  const trimmed = text.trim();
  const last = db.getFirstSync<{ max: number | null }>(
    'SELECT MAX(sort_order) AS max FROM grocery_items WHERE checked = 0',
  );
  const sortOrder = (last?.max ?? 0) + SORT_STEP;
  const item: GroceryItem = {
    id: newId(),
    text: trimmed,
    checked: false,
    sortOrder,
    checkedAt: null,
  };

  db.runSync(
    'INSERT INTO grocery_items (id, text, checked, sort_order, checked_at) VALUES (?, ?, 0, ?, NULL)',
    item.id,
    item.text,
    item.sortOrder,
  );
  return item;
}

/** Rewrites an item's text. */
export function updateText(id: string, text: string): void {
  db.runSync('UPDATE grocery_items SET text = ? WHERE id = ?', text.trim(), id);
}

/**
 * Ticks or unticks an item.
 *
 * Unticking sends the item back to the *bottom* of the unchecked list
 * (CLAUDE.md section 7), so it gets a fresh sort_order rather than returning
 * to the position it held before it was ticked.
 */
export function setChecked(id: string, checked: boolean): void {
  if (checked) {
    db.runSync(
      'UPDATE grocery_items SET checked = 1, checked_at = ? WHERE id = ?',
      Date.now(),
      id,
    );
    return;
  }

  const last = db.getFirstSync<{ max: number | null }>(
    'SELECT MAX(sort_order) AS max FROM grocery_items WHERE checked = 0',
  );
  db.runSync(
    'UPDATE grocery_items SET checked = 0, checked_at = NULL, sort_order = ? WHERE id = ?',
    (last?.max ?? 0) + SORT_STEP,
    id,
  );
}

/** Deletes one item outright. */
export function deleteItem(id: string): void {
  db.runSync('DELETE FROM grocery_items WHERE id = ?', id);
}

/** Overflow menu: "Delete checked items". */
export function deleteChecked(): void {
  db.runSync('DELETE FROM grocery_items WHERE checked = 1');
}

/** Overflow menu: "Uncheck all items". They return in the order they were ticked. */
export function uncheckAll(): void {
  db.withTransactionSync(() => {
    const checked = db.getAllSync<{ id: string }>(
      'SELECT id FROM grocery_items WHERE checked = 1 ORDER BY checked_at ASC',
    );
    const last = db.getFirstSync<{ max: number | null }>(
      'SELECT MAX(sort_order) AS max FROM grocery_items WHERE checked = 0',
    );
    let next = (last?.max ?? 0) + SORT_STEP;

    for (const row of checked) {
      db.runSync(
        'UPDATE grocery_items SET checked = 0, checked_at = NULL, sort_order = ? WHERE id = ?',
        next,
        row.id,
      );
      next += SORT_STEP;
    }
  });
}

/**
 * Persists a drag-reorder. `orderedIds` is the full unchecked list in its new
 * order; positions are rewritten in one transaction so a crash mid-way cannot
 * leave the list scrambled.
 */
export function reorderUnchecked(orderedIds: string[]): void {
  db.withTransactionSync(() => {
    orderedIds.forEach((id, index) => {
      db.runSync('UPDATE grocery_items SET sort_order = ? WHERE id = ?', (index + 1) * SORT_STEP, id);
    });
  });
}
