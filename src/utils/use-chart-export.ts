import { useEffect, useImperativeHandle, useRef } from "react";
import type React from "react";
import { useMergedRef } from "./use-merged-ref.js";

/**
 * @deprecated Pass a `ref` to the chart and use `exportSVG`/`exportPNG` from
 * `@eekodigital/raster/export` instead. `exportRef` will be removed in 4.0.
 */
export type ChartExportHandle = {
  exportSVG: (filename?: string) => void;
  exportPNG: (filename?: string, scale?: number) => Promise<void>;
};

type ExportModule = typeof import("./export-chart.js");
const load = () => import("./export-chart.js");

/**
 * Wires a chart's (deprecated) `exportRef`. The export code isn't bundled
 * with the chart: when an `exportRef` is attached it's loaded in the
 * background, so by the time someone exports, the download usually happens
 * inside their click. Charts without an `exportRef` never load it.
 */
export function useExportRef(
  exportRef: React.Ref<ChartExportHandle> | undefined,
  containerRef: React.RefObject<HTMLElement | null>,
): void {
  const loaded = useRef<ExportModule | null>(null);
  const wanted = !!exportRef;
  useEffect(() => {
    // A failed preload is retried on first use, which reports the error.
    if (wanted)
      load().then(
        (m) => (loaded.current = m),
        () => {},
      );
  }, [wanted]);
  useImperativeHandle(exportRef, () => {
    const get = async () => loaded.current ?? (loaded.current = await load());
    return {
      exportSVG: (filename) => {
        if (loaded.current) loaded.current.exportSVG(containerRef.current, filename);
        else get().then((m) => m.exportSVG(containerRef.current, filename), console.error);
      },
      exportPNG: async (filename, scale) =>
        (await get()).exportPNG(containerRef.current, filename, scale),
    };
  }, [containerRef]);
}

/**
 * Root-element charts (Gauge, Sparkline): their own ref, the caller's `ref`,
 * and the deprecated `exportRef`.
 */
export function useRootRef<T extends HTMLElement>(
  exportRef: React.Ref<ChartExportHandle> | undefined,
  ref: React.Ref<T> | undefined,
) {
  const containerRef = useRef<T>(null);
  useExportRef(exportRef, containerRef);
  return { containerRef, rootRef: useMergedRef(containerRef, ref) };
}
