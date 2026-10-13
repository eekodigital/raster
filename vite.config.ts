import { readFileSync, writeFileSync } from "node:fs";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite-plus";
import { clientEntries, entries } from "./scripts/entries.ts";
import { minifyCss } from "./src/utils/minify-css.ts";

export default defineConfig({
  plugins: [react()],
  pack: {
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
  },
  test: {
    name: "raster",
    environment: "happy-dom",
    setupFiles: ["./src/test-setup.ts"],
    exclude: ["docs/**", "node_modules/**"],
    coverage: {
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.test.{ts,tsx}",
        "src/test-setup.ts",
        "src/test-utils/**",
        "src/index.ts",
        "src/geo.ts",
      ],
      thresholds: {
        statements: 85,
        branches: 80,
        functions: 85,
        lines: 85,
      },
    },
  },
});
