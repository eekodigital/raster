import { readFileSync, writeFileSync } from "node:fs";
import { defineConfig } from "tsdown";
import { minifyCss } from "./src/utils/minify-css.ts";

/**
 * Public entry points. Each becomes `dist/<name>.mjs` and is listed in
 * package.json `exports`; shared code is split into chunks, so importing one
 * chart pulls in only that chart and its helpers.
 *
 * No entry imports CSS: styles ship as a single `dist/styles.css`
 * (`@eekodigital/raster/styles.css`), minified from `src/styles.css`.
 */

export const entries = {
  index: "src/index.ts",
  theme: "src/theme.ts",
  time: "src/time.ts",
  export: "src/export.ts",
  frame: "src/frame.ts",
  labels: "src/labels.ts",
  geo: "src/geo.ts",
  "bar-chart": "src/components/BarChart/BarChart.tsx",
  "chart-tooltip": "src/components/ChartTooltip/ChartTooltip.tsx",
  "donut-chart": "src/components/DonutChart/DonutChart.tsx",
  gauge: "src/components/Gauge/Gauge.tsx",
  "line-chart": "src/components/LineChart/LineChart.tsx",
  "linear-gauge": "src/components/LinearGauge/LinearGauge.tsx",
  "radar-chart": "src/components/RadarChart/RadarChart.tsx",
  "scatter-chart": "src/components/ScatterChart/ScatterChart.tsx",
  sparkline: "src/components/Sparkline/Sparkline.tsx",
} as const;

/**
 * Entries that export React components start with `"use client"`, so React
 * Server Components can import them directly. They're still server-rendered
 * (SSR); the directive only marks where hydration starts. Entries of plain
 * functions and values (`time`, `theme`, `export`) stay unmarked, so server
 * code can call them.
 */
export const clientEntries = new Set<string>([
  "index",
  "frame",
  "geo",
  "bar-chart",
  "chart-tooltip",
  "donut-chart",
  "gauge",
  "line-chart",
  "linear-gauge",
  "radar-chart",
  "scatter-chart",
  "sparkline",
]);

export default defineConfig({
  entry: entries,
  format: ["esm"],
  outputOptions: {
    banner: (chunk) => (chunk.isEntry && clientEntries.has(chunk.name) ? '"use client";' : ""),
  },
  dts: true,
  clean: true,
  hooks: {
    "build:done": () => {
      writeFileSync("dist/styles.css", minifyCss(readFileSync("src/styles.css", "utf8")));
    },
  },
});
