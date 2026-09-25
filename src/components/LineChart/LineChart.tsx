import { useState, useRef, useCallback, useImperativeHandle, useEffect } from "react";
import { catmullRomPath, extent, linearScale, ticks, labelSkip } from "../../utils/chart-math.js";
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

export type LineSeries = {
  name: string;
  data: number[];
  color?: string;
};

type GridOption = "horizontal" | "vertical" | "both" | "none";

export type LineChartProps = {
  series: LineSeries[];
  labels: string[];
  area?: boolean;
  stacked?: boolean;
  curve?: "linear" | "smooth";
  xLabel?: string;
  yLabel?: string;
  grid?: GridOption;
  formatValue?: (value: number) => string;
  /**
   * Minimum horizontal space (in display px) between adjacent x-axis labels.
   * When labels are wider than the default 30px budget (e.g. full dates like
   * "2026-04-20"), bump this so labels thin out enough not to overlap.
   */
  xLabelMinSpacing?: number;
  onPointClick?: (seriesIndex: number, pointIndex: number, value: number) => void;
  selectedIndex?: { series: number; point: number } | null;
  onSelect?: (index: { series: number; point: number } | null) => void;
  height?: number;
  exportRef?: React.Ref<ChartExportHandle>;
  "aria-label": string;
  className?: string;
};

const MARGIN = { top: 8, right: 8, bottom: 40, left: 50 };

export function LineChart({
  series,
  labels,
  area = false,
  stacked = false,
  curve = "linear",
  xLabel,
  yLabel,
  grid = "horizontal",
  formatValue = String,
  xLabelMinSpacing = 30,
  onPointClick,
  selectedIndex: controlledSelected,
  onSelect,
  height = 200,
  exportRef,
  "aria-label": ariaLabel,
  className,
}: LineChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const exportHandle = useChartExport(containerRef);
  useImperativeHandle(exportRef, () => exportHandle, [exportHandle]);
  const { tooltipId, tooltipProps, hide, handlers } = useChartTooltip();

  type PointIndex = { series: number; point: number };
  const [internalSelected, setInternalSelected] = useState<PointIndex | null>(null);
  const selected = controlledSelected !== undefined ? controlledSelected : internalSelected;
  const setSelected = useCallback(
    (index: PointIndex | null) => {
      if (controlledSelected === undefined) setInternalSelected(index);
      onSelect?.(index);
    },
    [controlledSelected, onSelect],
  );

  useEffect(() => {
    if (selected === null) return;
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setSelected(null);
    }
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [selected, setSelected]);

  const chartWidth = useContainerWidth(containerRef, 720);
  const plotWidth = chartWidth - MARGIN.left - MARGIN.right;
  const plotHeight = height - MARGIN.top - MARGIN.bottom;

  // Compute stacked data if needed
  const stackedData: number[][] = stacked
    ? series.reduce<number[][]>((acc, s, si) => {
        const prev = si > 0 ? acc[si - 1] : s.data.map(() => 0);
        acc.push(s.data.map((v, i) => v + prev[i]));
        return acc;
      }, [])
    : series.map((s) => s.data);

  const allValues = stackedData.flat();
  const [minVal, maxVal] = allValues.length ? extent(allValues) : [0, 1];
  const yMin = Math.min(0, minVal);
  const yMax = Math.max(maxVal, 1);

  const showHGrid = grid === "horizontal" || grid === "both";
  const showVGrid = grid === "vertical" || grid === "both";

  const xScale = (i: number) =>
    labels.length <= 1 ? plotWidth / 2 : (i / (labels.length - 1)) * plotWidth;
  const yScale = linearScale([yMin, yMax], [plotHeight, 0]);
  const yTicks = ticks(yMin, yMax, 4);
  // If the consumer has pre-decimated their labels (passing "" for positions
  // they want to hide — e.g. every Monday, or the first of each month), defer
  // entirely to them. Otherwise fall back to width-based auto-skipping.
  const hasManualXLabels = labels.some((l) => l === "");
  const xLabelSkip = hasManualXLabels ? 1 : labelSkip(labels.length, plotWidth, xLabelMinSpacing);
  // Edge labels anchor to their x position rather than centering on it, so a
  // wide label at index 0 or at the last shown index doesn't extend past the
  // plot area and overlap the chart's container border.
  const visibleLabelIndices = labels
    .map((label, i) => (label !== "" && i % xLabelSkip === 0 ? i : -1))
    .filter((i) => i !== -1);
  const firstVisibleLabelIndex = visibleLabelIndices[0];
  const lastVisibleLabelIndex = visibleLabelIndices[visibleLabelIndices.length - 1];

  const roving = useRovingFocus({
    counts: series.map(() => labels.length),
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
          {/* Y-axis ticks + horizontal grid */}
          {yTicks.map((tick) => (
            <g key={tick} transform={`translate(0, ${yScale(tick)})`}>
              {showHGrid && (
                <line x1={0} x2={plotWidth} className="raster-chart__grid" strokeDasharray="2,4" />
              )}
              <text x={-8} dy="0.35em" textAnchor="end" className="raster-chart__tick">
                {formatValue(tick)}
              </text>
            </g>
          ))}

          {/* X-axis labels + vertical grid */}
          {labels.map((label, i) => (
            <g key={`${i}-${label}`}>
              {showVGrid && (
                <line
                  x1={xScale(i)}
                  x2={xScale(i)}
                  y1={0}
                  y2={plotHeight}
                  className="raster-chart__grid"
                  strokeDasharray="2,4"
                />
              )}
              {label !== "" && i % xLabelSkip === 0 && (
                <text
                  x={xScale(i)}
                  y={plotHeight + 20}
                  textAnchor={
                    i === firstVisibleLabelIndex
                      ? "start"
                      : i === lastVisibleLabelIndex
                        ? "end"
                        : "middle"
                  }
                  className="raster-chart__tick"
                >
                  {label}
                </text>
              )}
            </g>
          ))}

          {/* Axis baselines */}
          <line
            x1={0}
            x2={plotWidth}
            y1={plotHeight}
            y2={plotHeight}
            className="raster-chart__axis"
          />

          {/* Axis labels */}
          {xLabel && (
            <text
              x={plotWidth / 2}
              y={plotHeight + 36}
              textAnchor="middle"
              className="raster-chart__tick"
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
              className="raster-chart__tick"
            >
              {yLabel}
            </text>
          )}

          {/* Series (render in reverse for stacked so first series is on top) */}
          {(stacked ? [...series].toReversed() : series).map((s, rawIdx) => {
            const si = stacked ? series.length - 1 - rawIdx : rawIdx;
            const color = s.color ?? seriesColor(si);
            const displayData = stackedData[si];
            const points = displayData.map((v, i) => ({ x: xScale(i), y: yScale(v) }));

            // Build line path
            let linePath: string;
            if (curve === "smooth") {
              linePath = catmullRomPath(points);
            } else {
              linePath = `M ${points.map((p) => `${p.x} ${p.y}`).join(" L ")}`;
            }

            // Build area path
            let areaPath: string | undefined;
            if (area) {
              const baseline =
                stacked && si > 0
                  ? stackedData[si - 1].map((v, i) => ({ x: xScale(i), y: yScale(v) })).toReversed()
                  : [
                      { x: points[points.length - 1].x, y: plotHeight },
                      { x: points[0].x, y: plotHeight },
                    ];

              if (curve === "smooth") {
                const baselinePath =
                  stacked && si > 0
                    ? catmullRomPath(baseline.toReversed()).replace(/^M/, "L")
                    : `L ${baseline.map((p) => `${p.x} ${p.y}`).join(" L ")}`;
                areaPath = `${linePath} ${baselinePath} Z`;
              } else {
                areaPath = `${linePath} L ${baseline.map((p) => `${p.x} ${p.y}`).join(" L ")} Z`;
              }
            }

            // Line length for draw-in animation
            const lineLength = points.reduce(
              (len, p, j) =>
                j === 0 ? 0 : len + Math.hypot(p.x - points[j - 1].x, p.y - points[j - 1].y),
              0,
            );

            return (
              <g key={s.name} role="group" aria-label={s.name} data-series={(si % 8) + 1}>
                {areaPath && <path d={areaPath} fill={color} className="raster-line__area" />}
                <path
                  d={linePath}
                  stroke={color}
                  fill="none"
                  className="raster-line__line"
                  style={
                    {
                      "--line-length": `${lineLength}`,
                      strokeDasharray: `${lineLength}`,
                    } as React.CSSProperties
                  }
                />
                {points.map((p, pi) => {
                  const originalValue = s.data[pi];
                  const tooltipContent = `${s.name}, ${labels[pi]}: ${formatValue(originalValue)}`;
                  const tip = handlers(tooltipContent);
                  const isSelected = selected?.series === si && selected?.point === pi;
                  const isDimmed = selected !== null && !isSelected;
                  return (
                    <circle
                      key={pi}
                      ref={roving.ref(si, pi)}
                      cx={p.x}
                      cy={p.y}
                      r={isSelected ? 5 : 3}
                      fill={color}
                      className="raster-line__point"
                      tabIndex={si === 0 && pi === 0 ? 0 : -1}
                      role="img"
                      aria-label={tooltipContent}
                      aria-describedby={tip["aria-describedby"]}
                      data-selected={isSelected ? "" : undefined}
                      data-dimmed={isDimmed ? "" : undefined}
                      onClick={() => {
                        setSelected(isSelected ? null : { series: si, point: pi });
                        onPointClick?.(si, pi, originalValue);
                      }}
                      onKeyDown={roving.onKeyDown(si, pi)}
                      onFocus={tip.onFocus}
                      onBlur={() => {
                        if (!isSelected) hide();
                      }}
                      onMouseEnter={tip.onMouseEnter}
                      onMouseLeave={() => {
                        if (!isSelected) tip.onMouseLeave();
                      }}
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

      {/* Legend */}
      {series.length > 1 && (
        <ChartLegend
          items={series.map((s, i) => ({ label: s.name, color: s.color ?? seriesColor(i) }))}
        />
      )}

      {/* Hidden data table */}
      <ChartDataTable
        aria-label={ariaLabel}
        headers={["Period", ...series.map((s) => s.name)]}
        rows={labels.map((label, i) => ({
          key: label,
          cells: [label, ...series.map((s) => formatValue(s.data[i]))],
        }))}
      />
    </div>
  );
}
