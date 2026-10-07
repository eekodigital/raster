import { useMemo } from "react";
import type React from "react";

/**
 * @deprecated Pass a `ref` to the chart and use `exportSVG`/`exportPNG` from
 * `@eekodigital/raster/export` instead. `exportRef` will be removed in 4.0.
 */
export type ChartExportHandle = {
  /** Downloads the chart as SVG. Resolves once the export code has loaded. */
  exportSVG: (filename?: string) => Promise<void>;
  exportPNG: (filename?: string, scale?: number) => Promise<void>;
};

/**
 * The handle behind a chart's `exportRef`. The export code isn't bundled with
 * the chart: it's loaded with `import()` the first time it's used.
 */
export function useChartExport(
  containerRef: React.RefObject<HTMLElement | null>,
): ChartExportHandle {
  return useMemo(
    () => ({
      exportSVG: async (filename) =>
        (await import("./export-chart.js")).exportSVG(containerRef.current, filename),
      exportPNG: async (filename, scale) =>
        (await import("./export-chart.js")).exportPNG(containerRef.current, filename, scale),
    }),
    [containerRef],
  );
}
