import { useRef, useImperativeHandle } from "react";
import { extent, linearScale } from "../../utils/chart-math.js";
import { useChartExport } from "../../utils/use-chart-export.js";
import type { ChartExportHandle } from "../../utils/use-chart-export.js";
import { cn } from "../../utils/cn.js";
import { seriesColor } from "../../utils/palette.js";

type SparklineProps = {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  fill?: boolean;
  exportRef?: React.Ref<ChartExportHandle>;
  "aria-label": string;
  className?: string;
};

export function Sparkline({
  data,
  width = 80,
  height = 24,
  color = seriesColor(0),
  fill = false,
  exportRef,
  "aria-label": ariaLabel,
  className,
}: SparklineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const exportHandle = useChartExport(containerRef);
  useImperativeHandle(exportRef, () => exportHandle, [exportHandle]);
  if (data.length < 2) return null;

  const padding = 2;
  const plotWidth = width - padding * 2;
  const plotHeight = height - padding * 2;

  const [minVal, maxVal] = extent(data);
  const yScale = linearScale([minVal, maxVal], [plotHeight, 0]);

  const points = data.map((v, i) => ({
    x: padding + (i / (data.length - 1)) * plotWidth,
    y: padding + yScale(v),
  }));

  const polyline = points.map((p) => `${p.x},${p.y}`).join(" ");

  const areaPath = fill
    ? `M ${points.map((p) => `${p.x} ${p.y}`).join(" L ")} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`
    : undefined;

  return (
    <div ref={containerRef} style={{ display: "inline-block" }} data-chart-container>
      <svg
        className={cn("raster-sparkline", className)}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={ariaLabel}
      >
        {areaPath && <path d={areaPath} fill={color} className="raster-sparkline__area" />}
        <polyline points={polyline} stroke={color} className="raster-sparkline__line" />
      </svg>
    </div>
  );
}
