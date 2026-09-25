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

export default defineConfig({
  entry: entries,
  format: ["esm"],
  dts: true,
  clean: true,
  hooks: {
    "build:done": () => {
      writeFileSync("dist/styles.css", minifyCss(readFileSync("src/styles.css", "utf8")));
    },
  },
});
