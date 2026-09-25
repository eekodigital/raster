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

export type PlotSizeOptions = {
  /** Fixed plot height in px. */
  height?: number;
  /** Width ÷ height. Takes precedence over `height`. */
  aspectRatio?: number;
};

/**
 * Drawing size for a plot `width` px wide, plus the CSS that sizes the plot
 * box. The box is sized by CSS (not the measured width), so server and client
 * render the same layout and nothing shifts once the width is measured.
 */
export function plotSize(
  width: number,
  { height, aspectRatio }: PlotSizeOptions,
  defaultHeight: number,
): { width: number; height: number; style: React.CSSProperties } {
  if (aspectRatio) {
    return {
      width,
      height: Math.round(width / aspectRatio),
      style: { aspectRatio: String(aspectRatio) },
    };
  }
  const h = height ?? defaultHeight;
  return { width, height: h, style: { height: h } };
}
