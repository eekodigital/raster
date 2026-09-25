/**
 * Default categorical series palette.
 *
 * Derived from Okabe–Ito: the eight hues are reordered so adjacent series stay
 * distinguishable under protan/deutan simulation, and each is lightness-adjusted
 * so every series keeps ≥3:1 contrast against its surface (WCAG 1.4.11). The
 * light and dark sets are chosen separately (not an automatic flip) and picked
 * per colour scheme with `light-dark()`, so they follow the page's
 * `color-scheme`.
 *
 * `palette.test.ts` recomputes the contrast; change these values only with it.
 */
export const SERIES_PALETTE_LIGHT = [
  "#0072b2", // blue
  "#d55e00", // vermillion
  "#059c72", // bluish green
  "#7a4fb0", // purple
  "#b87f09", // orange
  "#3093c6", // sky blue
  "#968d09", // olive
  "#c2709e", // reddish purple
] as const;

export const SERIES_PALETTE_DARK = [
  "#308dcf",
  "#d55e00",
  "#009e73",
  "#9a7fd0",
  "#c28608",
  "#3e9ed2",
  "#a19705",
  "#c775a3",
] as const;

/** Surfaces the palettes are validated against (see palette.test.ts). */
export const PALETTE_SURFACES = {
  light: ["#ffffff", "#f5f5f5"],
  dark: ["#121212", "#262626"],
} as const;

export const SERIES_COUNT = SERIES_PALETTE_LIGHT.length;

/**
 * `var(--raster-series-N, light-dark(light, dark))` for each slot. Apps set
 * `--raster-series-N` to theme the palette; without it the validated default
 * applies.
 */
export const DEFAULT_SERIES_COLORS: readonly string[] = SERIES_PALETTE_LIGHT.map(
  (light, i) => `var(--raster-series-${i + 1}, light-dark(${light}, ${SERIES_PALETTE_DARK[i]}))`,
);

/** Default colour for series `index`, cycling after the eighth. */
export function seriesColor(index: number): string {
  return DEFAULT_SERIES_COLORS[index % SERIES_COUNT];
}
