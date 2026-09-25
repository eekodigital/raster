import { useRef, useImperativeHandle } from "react";
import { cn } from "../../utils/cn.js";
import { seriesColor } from "../../utils/palette.js";
import { useChartExport } from "../../utils/use-chart-export.js";
import type { ChartExportHandle } from "../../utils/use-chart-export.js";
import { useContainerWidth } from "../../utils/use-container-width.js";
import { HORIZONTAL_KEYS, VERTICAL_KEYS, useRovingFocus } from "../../utils/use-roving-focus.js";
import { ChartDataTable } from "../shared/ChartDataTable.js";
import { ChartLegend } from "../shared/ChartLegend.js";

export type RadarSeries = {
  name: string;
  data: number[];
  color?: string;
};

type RadarChartProps = {
  axes: string[];
  series: RadarSeries[];
  max?: number;
  size?: number;
  levels?: number;
  onPointClick?: (seriesIndex: number, axisIndex: number, value: number) => void;
  exportRef?: React.Ref<ChartExportHandle>;
  "aria-label": string;
  className?: string;
};

function polarToCartesian(cx: number, cy: number, r: number, angleIndex: number, total: number) {
  const angle = (Math.PI * 2 * angleIndex) / total - Math.PI / 2;
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
}

export function RadarChart({
  axes,
  series,
  max: maxProp,
  size: sizeProp,
  levels = 4,
  exportRef,
  "aria-label": ariaLabel,
  className,
}: RadarChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const exportHandle = useChartExport(containerRef);
  useImperativeHandle(exportRef, () => exportHandle, [exportHandle]);

  // If `size` is passed, respect it (controlled); otherwise measure the
  // container so the chart fits whatever width the caller gave us.
  const measured = useContainerWidth(containerRef, 300);
  const size = sizeProp ?? measured;
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 40; // margin for labels
  const count = axes.length;

  const maxVal = maxProp ?? Math.max(...series.flatMap((s) => s.data), 1);

  const roving = useRovingFocus({
    counts: series.map(() => count),
    itemKeys: HORIZONTAL_KEYS,
    rowKeys: VERTICAL_KEYS,
    wrap: true,
  });

  // Grid circles
  const gridLevels = Array.from({ length: levels }, (_, i) => ((i + 1) / levels) * radius);

  return (
    <div ref={containerRef} className={cn("raster-chart", className)}>
      <svg
        className="raster-chart__svg"
        width={size}
        height={size}
        role="img"
        aria-label={ariaLabel}
      >
        {/* Grid levels */}
        {gridLevels.map((r) => {
          const points = Array.from({ length: count }, (_, i) =>
            polarToCartesian(cx, cy, r, i, count),
          );
          const polygon = points.map((p) => `${p.x},${p.y}`).join(" ");
          return <polygon key={r} points={polygon} className="raster-radar__grid" />;
        })}

        {/* Axis lines + labels */}
        {axes.map((axis, i) => {
          const end = polarToCartesian(cx, cy, radius, i, count);
          const labelPos = polarToCartesian(cx, cy, radius + 18, i, count);
          return (
            <g key={axis}>
              <line x1={cx} y1={cy} x2={end.x} y2={end.y} className="raster-chart__axis" />
              <text
                x={labelPos.x}
                y={labelPos.y}
                dy="0.35em"
                className="raster-chart__tick raster-radar__label"
              >
                {axis}
              </text>
            </g>
          );
        })}

        {/* Series */}
        {series.map((s, si) => {
          const color = s.color ?? seriesColor(si);
          const points = s.data.map((v, i) => {
            const r = (v / maxVal) * radius;
            return polarToCartesian(cx, cy, r, i, count);
          });
          const polygon = points.map((p) => `${p.x},${p.y}`).join(" ");

          return (
            <g key={s.name} role="group" aria-label={s.name} data-series={(si % 8) + 1}>
              <polygon points={polygon} fill={color} className="raster-radar__area" />
              <polygon points={polygon} stroke={color} className="raster-radar__line" />
              {points.map((p, pi) => (
                <circle
                  key={pi}
                  ref={roving.ref(si, pi)}
                  cx={p.x}
                  cy={p.y}
                  r={3}
                  fill={color}
                  className="raster-radar__point"
                  tabIndex={si === 0 && pi === 0 ? 0 : -1}
                  role="img"
                  aria-label={`${s.name}, ${axes[pi]}: ${s.data[pi]}`}
                  onKeyDown={roving.onKeyDown(si, pi)}
                />
              ))}
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      {series.length > 1 && (
        <ChartLegend
          items={series.map((s, i) => ({ label: s.name, color: s.color ?? seriesColor(i) }))}
        />
      )}

      {/* Hidden data table */}
      <ChartDataTable
        aria-label={ariaLabel}
        headers={["Axis", ...series.map((s) => s.name)]}
        rows={axes.map((axis, i) => ({
          key: axis,
          cells: [axis, ...series.map((s) => s.data[i])],
        }))}
      />
    </div>
  );
}
