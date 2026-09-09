/** One row of the `chores` table. */
export type Chore = {
  id: string;
  name: string;
  /** Key into the curated icon set; see constants.ts. */
  icon: string;
  color: string;
  intervalDays: number;
  soundKey: string;
  /** Epoch ms of the last completion, or null if never done. */
  lastCompletedAt: number | null;
  createdAt: number;
  sortOrder: number;
  /** How many completions are on record. Derived by the repository. */
  completionCount: number;
};

/** How close a chore is to being due. Drives every colour on the card. */
export type Urgency = 'calm' | 'today' | 'over';
