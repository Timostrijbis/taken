/** One row of the grocery list. Mirrors the `grocery_items` table. */
export type GroceryItem = {
  id: string;
  text: string;
  checked: boolean;
  /** Fractional position within the unchecked list; see database.ts. */
  sortOrder: number;
  /** Epoch ms when it was ticked, or null while unchecked. */
  checkedAt: number | null;
};
