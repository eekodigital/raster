import { useRef, useImperativeHandle } from "react";
import { extent, linearScale, ticks, labelSkip } from "../../utils/chart-math.js";
import { cn } from "../../utils/cn.js";
import { seriesColor } from "../../utils/palette.js";
import { useChartExport } from "../../utils/use-chart-export.js";
import type { ChartExportHandle } from "../../utils/use-chart-export.js";

export type { ChartExportHandle };
import { useContainerWidth } from "../../utils/use-container-width.js";
import { HORIZONTAL_KEYS, VERTICAL_KEYS, useRovingFocus } from "../../utils/use-roving-focus.js";
import { ChartTooltip, useChartTooltip } from "../ChartTooltip/ChartTooltip.js";
import { ChartDataTable } from "../shared/ChartDataTable.js";
import { ChartLegend } from "../shared/ChartLegend.js";

export type ScatterPoint = {
  x: number;
  y: number;
  label?: string;
};

export type ScatterSeries = {
  name: string;
  data: ScatterPoint[];
  color?: string;
};

type GridOption = "horizontal" | "vertical" | "both" | "none";

export type ScatterChartProps = {
  /** Single series — pass an array of points. */
  data?: ScatterPoint[];
  /** Multi-series — pass named series. */
  series?: ScatterSeries[];
  xLabel?: string;
  yLabel?: string;
  grid?: GridOption;
  formatValue?: (value: number) => string;
  onPointClick?: (point: ScatterPoint, seriesIndex: number, pointIndex: number) => void;
  height?: number;
  exportRef?: React.Ref<ChartExportHandle>;
  "aria-label": string;
  className?: string;
};

const MARGIN = { top: 8, right: 8, bottom: 40, left: 50 };

export function ScatterChart({
  data,
  series: seriesProp,
  xLabel,
  yLabel,
  grid = "both",
  formatValue = String,
  onPointClick,
  height = 240,
  exportRef,
  "aria-label": ariaLabel,
  className,
}: ScatterChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const exportHandle = useChartExport(containerRef);
  useImperativeHandle(exportRef, () => exportHandle, [exportHandle]);
  const { tooltipId, tooltipProps, hide, handlers } = useChartTooltip();

  // Normalise single data to a series
  const series: ScatterSeries[] = seriesProp ?? (data ? [{ name: "Data", data }] : []);
  const allPoints = series.flatMap((s) => s.data);
  const hasPointLabels = allPoints.some((p) => p.label);

  const chartWidth = useContainerWidth(containerRef, 720);
  const plotWidth = chartWidth - MARGIN.left - MARGIN.right;
  const plotHeight = height - MARGIN.top - MARGIN.bottom;

  const xValues = allPoints.map((p) => p.x);
  const yValues = allPoints.map((p) => p.y);
  const [xMin, xMax] = xValues.length ? extent(xValues) : [0, 1];
  const [yMin, yMax] = yValues.length ? extent(yValues) : [0, 1];

  const xScale = linearScale([xMin, xMax], [0, plotWidth]);
  const yScale = linearScale([yMin, yMax], [plotHeight, 0]);
  const xTicks = ticks(xMin, xMax, 5);
  const yTicks = ticks(yMin, yMax, 5);
  const xTickSkip = labelSkip(xTicks.length, plotWidth, 40);

  const showHGrid = grid === "horizontal" || grid === "both";
  const showVGrid = grid === "vertical" || grid === "both";

  const roving = useRovingFocus({
    counts: series.map((s) => s.data.length),
    itemKeys: HORIZONTAL_KEYS,
    rowKeys: VERTICAL_KEYS,
  });

  return (
    <div
      ref={containerRef}
      className={cn("raster-chart", className)}
      data-chart-container
      style={{ position: "relative" }}
    >
      <svg
        className="raster-chart__svg"
        width={chartWidth}
        height={height}
        role="img"
        aria-label={ariaLabel}
      >
        <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>
          {/* Grid + Y ticks */}
          {yTicks.map((tick) => (
            <g key={`y-${tick}`} transform={`translate(0, ${yScale(tick)})`}>
              {showHGrid && <line x1={0} x2={plotWidth} className="raster-chart__grid" />}
              <text x={-8} dy="0.35em" textAnchor="end" className="raster-chart__tick">
                {formatValue(tick)}
              </text>
            </g>
          ))}

          {/* X ticks + vertical grid */}
          {xTicks.map((tick, i) => (
            <g key={`x-${tick}`}>
              {showVGrid && (
                <line
                  x1={xScale(tick)}
                  x2={xScale(tick)}
                  y1={0}
                  y2={plotHeight}
                  className="raster-chart__grid"
                />
              )}
              {i % xTickSkip === 0 && (
                <text
                  x={xScale(tick)}
                  y={plotHeight + 16}
                  textAnchor="middle"
                  className="raster-chart__tick"
                >
                  {formatValue(tick)}
                </text>
              )}
            </g>
          ))}

          {/* Axes */}
          <line
            x1={0}
            x2={plotWidth}
            y1={plotHeight}
            y2={plotHeight}
            className="raster-chart__axis"
          />
          <line x1={0} x2={0} y1={0} y2={plotHeight} className="raster-chart__axis" />

          {/* Axis labels */}
          {xLabel && (
            <text
              x={plotWidth / 2}
              y={plotHeight + 32}
              textAnchor="middle"
              className="raster-chart__tick raster-chart__axis-title"
            >
              {xLabel}
            </text>
          )}
          {yLabel && (
            <text
              x={-plotHeight / 2}
              y={-38}
              textAnchor="middle"
              transform="rotate(-90)"
              className="raster-chart__tick raster-chart__axis-title"
            >
              {yLabel}
            </text>
          )}

          {/* Points */}
          {series.map((s, si) => {
            const color = s.color ?? seriesColor(si);
            return (
              <g key={s.name} role="group" aria-label={s.name} data-series={(si % 8) + 1}>
                {s.data.map((p, pi) => {
                  const tooltipContent = p.label
                    ? `${s.name}: ${p.label} (${formatValue(p.x)}, ${formatValue(p.y)})`
                    : `${s.name}: (${formatValue(p.x)}, ${formatValue(p.y)})`;
                  const tip = handlers(tooltipContent);
                  return (
                    <circle
                      key={pi}
                      ref={roving.ref(si, pi)}
                      cx={xScale(p.x)}
                      cy={yScale(p.y)}
                      r={4}
                      fill={color}
                      className="raster-scatter__point"
                      style={{ animationDelay: `${(si * s.data.length + pi) * 20}ms` }}
                      tabIndex={si === 0 && pi === 0 ? 0 : -1}
                      role="img"
                      aria-label={tooltipContent}
                      aria-describedby={tip["aria-describedby"]}
                      data-clickable={onPointClick ? "" : undefined}
                      onClick={onPointClick ? () => onPointClick(p, si, pi) : undefined}
                      onKeyDown={roving.onKeyDown(si, pi)}
                      onFocus={tip.onFocus}
                      onBlur={hide}
                      onMouseEnter={tip.onMouseEnter}
                      onMouseLeave={tip.onMouseLeave}
                    />
                  );
                })}
              </g>
            );
          })}
        </g>
      </svg>

      <ChartTooltip
        id={tooltipId}
        visible={tooltipProps.visible}
        x={tooltipProps.x}
        y={tooltipProps.y}
        content={tooltipProps.content}
      />

      {/* Legend for multi-series */}
      {series.length > 1 && (
        <ChartLegend
          swatch="dot"
          items={series.map((s, i) => ({ label: s.name, color: s.color ?? seriesColor(i) }))}
        />
      )}

      {/* Hidden data table */}
      <ChartDataTable
        aria-label={ariaLabel}
        headers={[
          ...(series.length > 1 ? ["Series"] : []),
          ...(hasPointLabels ? ["Label"] : []),
          xLabel ?? "X",
          yLabel ?? "Y",
        ]}
        rows={series.flatMap((s) =>
          s.data.map((p, i) => ({
            key: `${s.name}-${i}`,
            cells: [
              ...(series.length > 1 ? [s.name] : []),
              ...(hasPointLabels ? [p.label ?? ""] : []),
              formatValue(p.x),
              formatValue(p.y),
            ],
          })),
        )}
      />
    </div>
  );
}
