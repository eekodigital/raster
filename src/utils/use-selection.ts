import { useCallback, useState } from "react";
import type { ChartLabels } from "./labels.js";

/** Equal by value for primitives and flat objects (e.g. `{ series, point }`). */
export function sameSelection<T>(a: T | null, b: T | null): boolean {
  if (a === b) return true;
  if (!a || !b || typeof a !== "object") return false;
  return Object.keys(a).every((k) => a[k as keyof T] === b[k as keyof T]);
}

export type Selection<T> = {
  selected: T | null;
  isSelected: (value: T) => boolean;
  /** Select `value`, or clear it if it's already selected. */
  toggle: (value: T) => void;
  /** Clears the selection; returns false when there was nothing to clear. */
  clear: () => boolean;
  /** Text for the chart's live region (off-focus changes only). */
  announcement: string;
};

/**
 * Controlled-or-uncontrolled selection for chart marks. Pass `controlled`
 * (`null` for none) to control it; leave it `undefined` for internal state.
 */
export function useSelection<T>(
  controlled: T | null | undefined,
  onSelect: ((value: T | null) => void) | undefined,
  labels: ChartLabels,
): Selection<T> {
  const [internal, setInternal] = useState<T | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const selected = controlled !== undefined ? controlled : internal;

  const set = useCallback(
    (value: T | null) => {
      if (controlled === undefined) setInternal(value);
      onSelect?.(value);
    },
    [controlled, onSelect],
  );

  return {
    selected,
    isSelected: (value) => selected !== null && sameSelection(selected, value),
    toggle: (value) => {
      setAnnouncement("");
      set(sameSelection(selected, value) ? null : value);
    },
    clear: () => {
      if (selected === null) return false;
      set(null);
      setAnnouncement(labels.selectionCleared);
      return true;
    },
    announcement,
  };
}
