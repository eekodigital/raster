/// <reference types="node" />
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { rasterVars } from "./theme.js";
import { DEFAULT_SERIES_COLORS } from "./utils/palette.js";

const SRC = import.meta.dirname;

const CONTRACT = [
  "--raster-text",
  "--raster-text-subtle",
  "--raster-surface",
  "--raster-grid",
  "--raster-axis",
  "--raster-focus",
  "--raster-selected",
  "--raster-tooltip-bg",
  "--raster-tooltip-text",
  "--raster-series-1",
  "--raster-series-2",
  "--raster-series-3",
  "--raster-series-4",
  "--raster-series-5",
  "--raster-series-6",
  "--raster-series-7",
  "--raster-series-8",
];

const css = readFileSync(join(SRC, "styles.css"), "utf8");

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const path = join(dir, d.name);
    if (d.isDirectory()) return sourceFiles(path);
    return /\.(ts|tsx|css)$/.test(d.name) && !/\.test\.tsx?$/.test(d.name) ? [path] : [];
  });
}
const sources = [
  ...sourceFiles(SRC).map((path) => ({ path, text: readFileSync(path, "utf8") })),
  // The palette builds its var() strings from a template; check the output.
  { path: "DEFAULT_SERIES_COLORS", text: DEFAULT_SERIES_COLORS.join("\n") },
];

/** Custom properties read via var(), with comments stripped. */
function varReads(text: string): string[] {
  const code = text.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
  return [...code.matchAll(/var\(\s*(--[\w-]*\w)\b/g)]
    .map((m) => m[1])
    .filter((name) => !code.includes(`var(${name}-\${`));
}

describe("/theme contract", () => {
  it("exports exactly the documented variables, as var() references", () => {
    expect(rasterVars).toMatchInlineSnapshot(`
      {
        "axis": "var(--raster-axis)",
        "focus": "var(--raster-focus)",
        "grid": "var(--raster-grid)",
        "selected": "var(--raster-selected)",
        "series1": "var(--raster-series-1)",
        "series2": "var(--raster-series-2)",
        "series3": "var(--raster-series-3)",
        "series4": "var(--raster-series-4)",
        "series5": "var(--raster-series-5)",
        "series6": "var(--raster-series-6)",
        "series7": "var(--raster-series-7)",
        "series8": "var(--raster-series-8)",
        "surface": "var(--raster-surface)",
        "text": "var(--raster-text)",
        "textSubtle": "var(--raster-text-subtle)",
        "tooltipBg": "var(--raster-tooltip-bg)",
        "tooltipText": "var(--raster-tooltip-text)",
      }
    `);
    expect(Object.values(rasterVars).map((v) => v.slice(4, -1))).toEqual(CONTRACT);
  });

  it("is a plain object with no runtime imports", () => {
    const theme = readFileSync(join(SRC, "theme.ts"), "utf8");
    expect(theme).not.toMatch(/^import /m);
  });

  it("charts read no custom properties outside the contract", () => {
    const internal = new Set(["--line-length", "--gauge-pct"]);
    for (const { path, text } of sources) {
      for (const name of varReads(text)) {
        if (internal.has(name)) continue;
        expect(CONTRACT, `${path} reads ${name}`).toContain(name);
      }
    }
  });

  it("no source reads app tokens (--color-*, --font-*, --spacing-*)", () => {
    for (const { path, text } of sources) {
      expect(
        varReads(text).filter((n) => /^--(color|font|spacing)-/.test(n)),
        path,
      ).toEqual([]);
    }
  });

  it("every contract variable is read by the stylesheet or the default palette", () => {
    const read = new Set(sources.flatMap(({ text }) => varReads(text)));
    for (const name of CONTRACT) expect(read, name).toContain(name);
  });

  it("declares nothing at :root", () => {
    const code = css.replace(/\/\*[\s\S]*?\*\//g, "");
    expect(code).not.toMatch(/:root/);
    expect(code).not.toMatch(/^\s*--raster-[\w-]+\s*:/m);
  });

  it("falls back to currentColor for text, axis, focus and selection", () => {
    for (const name of ["--raster-text", "--raster-axis", "--raster-focus", "--raster-selected"]) {
      const reads = [...css.matchAll(new RegExp(`var\\(${name},\\s*([^)]+)\\)`, "g"))];
      expect(reads.length, name).toBeGreaterThan(0);
      for (const [, fallback] of reads) expect(fallback.trim(), name).toBe("currentColor");
    }
  });

  it("falls back to a 25% currentColor mix for the grid", () => {
    const reads = [...css.matchAll(/var\(--raster-grid,\s*(.+?)\);/g)];
    expect(reads.length).toBeGreaterThan(0);
    for (const [, fallback] of reads) {
      expect(fallback).toBe("color-mix(in srgb, currentColor 25%, transparent)");
    }
  });

  it("ships forced-colours rules using system colours", () => {
    const block = css.slice(css.indexOf("@media (forced-colors: active)"));
    expect(block).toContain("CanvasText");
    expect(block).toContain("Highlight");
    expect(block).toMatch(/stroke-dasharray/);
  });
});
