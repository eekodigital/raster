/**
 * The raster chart theming contract.
 *
 * Charts read these custom properties, and nothing else, from the page. Each
 * one has a fallback, so a chart renders legibly with none of them set:
 *
 * - `text`, `textSubtle`, `axis`, `focus`, `selected` fall back to `currentColor`
 * - `grid` falls back to `color-mix(in srgb, currentColor 25%, transparent)`
 * - `series1`–`series8` fall back to a validated light/dark palette via `light-dark()`
 * - `surface`, `tooltipBg`, `tooltipText` fall back to fixed light/dark values via `light-dark()`
 *
 * This is a plain object of `var(--raster-*)` strings with no runtime
 * dependencies. vanilla-extract users can pass it straight to
 * `createGlobalTheme(selector, rasterVars, tokens)` or `assignVars(rasterVars, tokens)`;
 * plain-CSS users can set the custom property names directly.
 */
export const rasterVars = {
  text: "var(--raster-text)",
  textSubtle: "var(--raster-text-subtle)",
  surface: "var(--raster-surface)",
  grid: "var(--raster-grid)",
  axis: "var(--raster-axis)",
  focus: "var(--raster-focus)",
  selected: "var(--raster-selected)",
  tooltipBg: "var(--raster-tooltip-bg)",
  tooltipText: "var(--raster-tooltip-text)",
  series1: "var(--raster-series-1)",
  series2: "var(--raster-series-2)",
  series3: "var(--raster-series-3)",
  series4: "var(--raster-series-4)",
  series5: "var(--raster-series-5)",
  series6: "var(--raster-series-6)",
  series7: "var(--raster-series-7)",
  series8: "var(--raster-series-8)",
} as const;

export type RasterVars = typeof rasterVars;
export type RasterVarName = keyof RasterVars;
