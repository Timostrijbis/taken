/**
 * Fixed height of one grocery row, in points.
 *
 * Drag-to-reorder works out which slot the finger is over by dividing the drag
 * distance by this number, so every unchecked row must actually be this tall.
 * It matches the design: a 44pt touch target inside 2pt of vertical padding.
 */
export const ROW_HEIGHT = 48;
