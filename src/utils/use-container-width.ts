import { useEffect, useState } from "react";
import type React from "react";

/**
 * Tracks the current `clientWidth` of the referenced element via `ResizeObserver`.
 *
 * Returns `fallback` during SSR and the first client render (before the observer
 * fires). Zero-width measurements are ignored so a briefly hidden or unmounted
 * element doesn't collapse layouts that depend on the returned number.
 *
 * Chart components use this to render in display pixels rather than scaling a
 * fixed viewBox — so strokes, point radii, and tick labels keep their
 * CSS-specified sizes regardless of container width.
 */
export function useContainerWidth(
  ref: React.RefObject<HTMLElement | null>,
  fallback: number,
): number {
  const [width, setWidth] = useState(fallback);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const measured = Math.floor(entry.contentRect.width);
      if (measured > 0) setWidth(measured);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);

  return width;
}
