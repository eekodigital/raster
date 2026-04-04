import { vanillaExtractPlugin } from "@vanilla-extract/rollup-plugin";
import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts", "src/data-table.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  plugins: [vanillaExtractPlugin()],
});
