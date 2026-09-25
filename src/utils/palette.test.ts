import { describe, expect, it } from "vitest";
import {
  DEFAULT_SERIES_COLORS,
  PALETTE_SURFACES,
  SERIES_PALETTE_DARK,
  SERIES_PALETTE_LIGHT,
  seriesColor,
} from "./palette.js";

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG 2.x contrast ratio. */
export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

describe("contrast()", () => {
  it("matches known WCAG values", () => {
    expect(contrast("#000000", "#ffffff")).toBeCloseTo(21, 5);
    expect(contrast("#777777", "#ffffff")).toBeCloseTo(4.48, 2);
  });
});

describe("default series palette", () => {
  it("has eight distinct slots per scheme", () => {
    expect(SERIES_PALETTE_LIGHT).toHaveLength(8);
    expect(SERIES_PALETTE_DARK).toHaveLength(8);
    expect(new Set(SERIES_PALETTE_LIGHT).size).toBe(8);
    expect(new Set(SERIES_PALETTE_DARK).size).toBe(8);
  });

  for (const [scheme, palette] of [
    ["light", SERIES_PALETTE_LIGHT],
    ["dark", SERIES_PALETTE_DARK],
  ] as const) {
    for (const surface of PALETTE_SURFACES[scheme]) {
      it(`every ${scheme} series has ≥3:1 contrast on ${surface} (WCAG 1.4.11)`, () => {
        for (const color of palette) {
          expect(contrast(color, surface), `${color} on ${surface}`).toBeGreaterThanOrEqual(3);
        }
      });
    }
  }

  it("reads --raster-series-N with a light-dark() fallback", () => {
    expect(DEFAULT_SERIES_COLORS[0]).toBe("var(--raster-series-1, light-dark(#0072b2, #308dcf))");
    DEFAULT_SERIES_COLORS.forEach((c, i) => {
      expect(c).toBe(
        `var(--raster-series-${i + 1}, light-dark(${SERIES_PALETTE_LIGHT[i]}, ${SERIES_PALETTE_DARK[i]}))`,
      );
    });
  });

  it("cycles after eight series", () => {
    expect(seriesColor(8)).toBe(seriesColor(0));
    expect(seriesColor(9)).toBe(seriesColor(1));
  });
});
