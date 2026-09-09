import { useCallback, useEffect, useMemo, useState } from 'react';

import * as repo from './repository';
import type { GroceryItem } from './types';

/**
 * Holds the grocery list for the screen.
 *
 * The database is the source of truth: every action writes to SQLite first and
 * then re-reads the list. The list is small (a household's groceries), so
 * re-reading is instant and we never risk the screen disagreeing with the
 * stored data.
 */
export function useGroceries() {
  const [items, setItems] = useState<GroceryItem[]>([]);

  const refresh = useCallback(() => {
    setItems(repo.listItems());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  /** Unchecked items, in drag order. */
  const unchecked = useMemo(() => items.filter((i) => !i.checked), [items]);
  /** Ticked items, most recently ticked first — the collapsed section. */
  const checked = useMemo(() => items.filter((i) => i.checked), [items]);

  const add = useCallback(
    (text: string) => {
      if (!text.trim()) return;
      repo.addItem(text);
      refresh();
    },
    [refresh],
  );

  const rename = useCallback(
    (id: string, text: string) => {
      repo.updateText(id, text);
      refresh();
    },
    [refresh],
  );

  const toggle = useCallback(
    (id: string, checkedNext: boolean) => {
      repo.setChecked(id, checkedNext);
      refresh();
    },
    [refresh],
  );

  const remove = useCallback(
    (id: string) => {
      repo.deleteItem(id);
      refresh();
    },
    [refresh],
  );

  const clearChecked = useCallback(() => {
    repo.deleteChecked();
    refresh();
  }, [refresh]);

  const uncheckAll = useCallback(() => {
    repo.uncheckAll();
    refresh();
  }, [refresh]);

  /**
   * Commits a drag-reorder. The new order is applied to the screen immediately
   * so the item does not visibly snap back, then written to the database.
   */
  const reorder = useCallback(
    (orderedIds: string[]) => {
      const byId = new Map(items.map((i) => [i.id, i]));
      const reordered = orderedIds.map((id) => byId.get(id)).filter(Boolean) as GroceryItem[];
      setItems([...reordered, ...items.filter((i) => i.checked)]);
      repo.reorderUnchecked(orderedIds);
      refresh();
    },
    [items, refresh],
  );

  return {
    items,
    unchecked,
    checked,
    add,
    rename,
    toggle,
    remove,
    clearChecked,
    uncheckAll,
    reorder,
    refresh,
  };
}
