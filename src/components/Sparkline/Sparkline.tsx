import { useRef, useImperativeHandle } from "react";
import { extent, linearScale } from "../../utils/chart-math.js";
import { cn } from "../../utils/cn.js";
import { numberFormatter, resolveLabels } from "../../utils/labels.js";
import type { ChartLabels, NumberFormat } from "../../utils/labels.js";
import { seriesColor } from "../../utils/palette.js";
import { useChartExport } from "../../utils/use-chart-export.js";
import type { ChartExportHandle } from "../../utils/use-chart-export.js";

export type { ChartExportHandle };
import { SR_ONLY_STYLE } from "../shared/ChartDataTable.js";

export type SparklineProps = {
  data: number[];
  /** What the values are. Not displayed; it leads the text summary. */
  title: string;
  /** Fixed width in px. Omit to fill the container's width. */
  width?: number;
  height?: number;
  color?: string;
  fill?: boolean;
  /** Formats values in the summary. Default: `Intl.NumberFormat(labels.locale)`. */
  formatValue?: NumberFormat;
  labels?: Partial<ChartLabels>;
  exportRef?: React.Ref<ChartExportHandle>;
  className?: string;
};

/**
 * Word-sized trend line. The drawing is decorative (`aria-hidden`); a
 * visually hidden text summary — title, range, first and last value — carries
 * the information instead of a data table.
 */
export function Sparkline({
  data,
  title,
  width,
  height = 24,
  color = seriesColor(0),
  fill = false,
  formatValue,
  labels: labelOverrides,
  exportRef,
  className,
}: SparklineProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const exportHandle = useChartExport(containerRef);
  useImperativeHandle(exportRef, () => exportHandle, [exportHandle]);
  if (data.length < 2) return null;

  const labels = resolveLabels(labelOverrides);
  const n = numberFormatter(labels.locale);
  const format = formatValue ?? n;

  // Drawn in a nominal box and stretched to the container
  // (preserveAspectRatio="none"); strokes don't scale.
  const w = width ?? 100;
  const padding = 2;
  const [minVal, maxVal] = extent(data);
  const yScale = linearScale([minVal, maxVal], [height - padding * 2, 0]);
  const points = data.map((v, i) => ({
    x: padding + (i / (data.length - 1)) * (w - padding * 2),
    y: padding + yScale(v),
  }));
  const line = points.map((p) => `${p.x},${p.y}`).join(" ");
  const areaPath = fill
    ? `M ${points.map((p) => `${p.x} ${p.y}`).join(" L ")} L ${points[points.length - 1].x} ${height - padding} L ${padding} ${height - padding} Z`
    : undefined;

  const summary = labels.summary(
    {
      type: "sparkline",
      series: 1,
      points: data.length,
      y: [format(minVal), format(maxVal)],
      first: format(data[0]),
      last: format(data[data.length - 1]),
    },
    n,
  );

  return (
    <span
      ref={containerRef}
      className={cn("raster-sparkline", className)}
      style={{ width: width ?? "100%", height }}
      data-chart-container
    >
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${w} ${height}`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {areaPath && <path d={areaPath} fill={color} className="raster-sparkline__area" />}
        <polyline points={line} stroke={color} className="raster-sparkline__line" />
      </svg>
      <span className="raster-sr-only" style={SR_ONLY_STYLE}>
        {`${title}: ${summary}`}
      </span>
    </span>
  );
}
