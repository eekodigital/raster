import { readdirSync } from "node:fs";
import { vanillaExtractPlugin } from "@vanilla-extract/rollup-plugin";
import { defineConfig } from "tsdown";

// Discover every component dir under src/components and emit one bundle per
// component (e.g. dist/components/Pagination/Pagination.mjs). Each per-
// component bundle side-effect-loads only its own .vanilla.css, so a
// consumer who imports `Pagination` no longer pulls in the chart, gauge,
// breadcrumb, etc. CSS that they don't use.
//
// `shared/` is the in-repo helpers dir, not a component (no Component.tsx).
const componentDirs = readdirSync("./src/components", { withFileTypes: true })
  .filter((d) => d.isDirectory() && d.name !== "shared")
  .map((d) => d.name);

const componentEntries = Object.fromEntries(
  componentDirs.map((name) => [`components/${name}/${name}`, `src/components/${name}/${name}.tsx`]),
);

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "data-table": "src/data-table.ts",
    ...componentEntries,
  },
  format: ["esm"],
  dts: true,
  clean: true,
  plugins: [vanillaExtractPlugin()],
});
