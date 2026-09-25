import { useCallback, useRef } from "react";
import type React from "react";

type KeyMap = { next: readonly string[]; prev: readonly string[] };

export type RovingFocusOptions = {
  /** Number of focusable items in each row (e.g. points per series). */
  counts: readonly number[];
  /** Keys that move within a row. */
  itemKeys: KeyMap;
  /** Keys that move between rows. Omit for a single row. */
  rowKeys?: KeyMap;
  /** Wrap around at the ends of a row instead of stopping. */
  wrap?: boolean;
};

export const HORIZONTAL_KEYS: KeyMap = { next: ["ArrowRight"], prev: ["ArrowLeft"] };
export const VERTICAL_KEYS: KeyMap = { next: ["ArrowDown"], prev: ["ArrowUp"] };

/**
 * Arrow-key focus movement across a grid of chart marks (rows = series,
 * items = points). Marks register themselves with `ref(row, item)` and call
 * `onKeyDown(row, item)`; the hook moves DOM focus to the target mark. Keys
 * it doesn't handle fall through untouched.
 */
export function useRovingFocus({ counts, itemKeys, rowKeys, wrap = false }: RovingFocusOptions) {
  const elements = useRef(new Map<string, SVGElement>());

  const ref = useCallback(
    (row: number, item: number) => (el: SVGElement | null) => {
      if (el) elements.current.set(`${row}-${item}`, el);
    },
    [],
  );

  const onKeyDown = useCallback(
    (row: number, item: number) => (e: React.KeyboardEvent) => {
      let r = row;
      let i = item;
      const count = counts[row] ?? 0;

      if (itemKeys.next.includes(e.key)) i = wrap ? (i + 1) % count : Math.min(i + 1, count - 1);
      else if (itemKeys.prev.includes(e.key))
        i = wrap ? (i - 1 + count) % count : Math.max(i - 1, 0);
      else if (rowKeys?.next.includes(e.key)) r = Math.min(r + 1, counts.length - 1);
      else if (rowKeys?.prev.includes(e.key)) r = Math.max(r - 1, 0);
      else return;

      e.preventDefault();
      (elements.current.get(`${r}-${i}`) as HTMLOrSVGElement | undefined)?.focus();
    },
    [counts, itemKeys, rowKeys, wrap],
  );

  return { ref, onKeyDown };
}
