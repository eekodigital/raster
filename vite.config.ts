import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite-plus";

export default defineConfig({
  plugins: [vanillaExtractPlugin(), react()],
  test: {
    name: "raster",
    environment: "happy-dom",
    setupFiles: ["./src/test-setup.ts"],
    exclude: ["docs/**", "node_modules/**"],
    coverage: {
      exclude: ["**/*.css.ts", "**/index.ts"],
      thresholds: {
        statements: 82,
        branches: 76,
        functions: 80,
        lines: 84,
      },
    },
  },
});
