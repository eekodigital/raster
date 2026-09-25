import { useCallback, useRef, useState } from "react";
import type React from "react";

type KeyMap = { next: readonly string[]; prev: readonly string[] };
type Position = { row: number; item: number };

export type RovingFocusOptions = {
  /** Number of focusable items in each row (e.g. points per series). */
  counts: readonly number[];
  /** Keys that move within a row. */
  itemKeys: KeyMap;
  /** Keys that move between rows. Omit for a single row. */
  rowKeys?: KeyMap;
  /** Wrap around at the ends of a row instead of stopping. */
  wrap?: boolean;
  /** Called on Enter or Space. Omit for static (non-interactive) marks. */
  onActivate?: (row: number, item: number) => void;
};

export const HORIZONTAL_KEYS: KeyMap = { next: ["ArrowRight"], prev: ["ArrowLeft"] };
export const VERTICAL_KEYS: KeyMap = { next: ["ArrowDown"], prev: ["ArrowUp"] };
export const ALL_ARROW_KEYS: KeyMap = {
  next: ["ArrowRight", "ArrowDown"],
  prev: ["ArrowLeft", "ArrowUp"],
};

/** PageUp/PageDown move this many marks. */
export const PAGE_SIZE = 10;

/** Nearest row at or after (dir 1) / before (dir -1) `from` that has items. */
function findRow(counts: readonly number[], from: number, dir: 1 | -1): number {
  for (let r = from; r >= 0 && r < counts.length; r += dir) if (counts[r] > 0) return r;
  return -1;
}

function clampPosition(counts: readonly number[], { row, item }: Position): Position {
  let r = row < counts.length ? findRow(counts, row, 1) : -1;
  if (r === -1) r = findRow(counts, Math.min(row, counts.length - 1), -1);
  if (r === -1) return { row: 0, item: 0 };
  return { row: r, item: Math.min(item, counts[r] - 1) };
}

/**
 * Roving tabindex across a grid of chart marks (rows = series, items = points).
 * The active mark is kept in state, so exactly one mark is in the tab order
 * and it survives re-renders. Spread `itemProps(row, item)` onto each mark.
 *
 * Keys: `itemKeys` and Home/End/PageUp/PageDown move within a row, `rowKeys`
 * move between rows (skipping empty ones), Enter/Space call `onActivate`.
 * Anything else falls through untouched.
 */
export function useRovingFocus({
  counts,
  itemKeys,
  rowKeys,
  wrap = false,
  onActivate,
}: RovingFocusOptions) {
  const elements = useRef(new Map<string, SVGElement>());
  const [stored, setActive] = useState<Position>({ row: 0, item: 0 });
  const active = clampPosition(counts, stored);

  const onKeyDown = useCallback(
    (row: number, item: number, e: React.KeyboardEvent) => {
      let r = row;
      let i = item;
      const count = counts[row] ?? 0;
      const last = count - 1;
      const { key } = e;

      if (itemKeys.next.includes(key)) i = wrap ? (i + 1) % count : Math.min(i + 1, last);
      else if (itemKeys.prev.includes(key)) i = wrap ? (i - 1 + count) % count : Math.max(i - 1, 0);
      else if (key === "Home") i = 0;
      else if (key === "End") i = last;
      else if (key === "PageDown") i = Math.min(i + PAGE_SIZE, last);
      else if (key === "PageUp") i = Math.max(i - PAGE_SIZE, 0);
      else if (rowKeys?.next.includes(key) || rowKeys?.prev.includes(key)) {
        const dir = rowKeys.next.includes(key) ? 1 : -1;
        const target = findRow(counts, row + dir, dir);
        if (target !== -1) {
          r = target;
          i = Math.min(i, counts[r] - 1);
        }
      } else if ((key === "Enter" || key === " ") && onActivate) {
        e.preventDefault();
        onActivate(row, item);
        return;
      } else return;

      e.preventDefault();
      setActive({ row: r, item: i });
      (elements.current.get(`${r}-${i}`) as HTMLOrSVGElement | undefined)?.focus();
    },
    [counts, itemKeys, rowKeys, wrap, onActivate],
  );

  const itemProps = (
    row: number,
    item: number,
    onFocus?: (e: React.FocusEvent<SVGElement>) => void,
  ) => ({
    ref: (el: SVGElement | null) => {
      if (el) elements.current.set(`${row}-${item}`, el);
      else elements.current.delete(`${row}-${item}`);
    },
    tabIndex: active.row === row && active.item === item ? 0 : -1,
    onFocus: (e: React.FocusEvent<SVGElement>) => {
      setActive({ row, item });
      onFocus?.(e);
    },
    onKeyDown: (e: React.KeyboardEvent) => onKeyDown(row, item, e),
  });

  return { itemProps, active };
}
