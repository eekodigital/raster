import { useState, useRef, useCallback, useImperativeHandle, useEffect } from "react";
import { catmullRomPath, extent, linearScale, ticks, labelSkip } from "../../utils/chart-math.js";
import { useChartExport } from "../../utils/use-chart-export.js";
import type { ChartExportHandle } from "../../utils/use-chart-export.js";
import { ChartTooltip, useChartTooltip } from "../ChartTooltip/ChartTooltip.js";
import * as styles from "./LineChart.css.js";

export type LineSeries = {
  name: string;
  data: number[];
  color?: string;
};

type GridOption = "horizontal" | "vertical" | "both" | "none";

type LineChartProps = {
  series: LineSeries[];
  labels: string[];
  area?: boolean;
  stacked?: boolean;
  curve?: "linear" | "smooth";
  xLabel?: string;
  yLabel?: string;
  grid?: GridOption;
  formatValue?: (value: number) => string;
  onPointClick?: (seriesIndex: number, pointIndex: number, value: number) => void;
  selectedIndex?: { series: number; point: number } | null;
  onSelect?: (index: { series: number; point: number } | null) => void;
  height?: number;
  exportRef?: React.Ref<ChartExportHandle>;
  "aria-label": string;
  className?: string;
};

const DEFAULT_COLORS = [
  "var(--color-interactive)",
  "var(--color-success)",
  "var(--color-danger)",
  "var(--color-warning)",
  "var(--color-inactive)",
];

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
  const focusedRef = useRef({ series: 0, point: 0 });
  const pointsRef = useRef<Map<string, SVGCircleElement>>(new Map());
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

  const chartWidth = 400;
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
  const xLabelSkip = labelSkip(labels.length, plotWidth);

  const handleKeyDown = useCallback(
    (seriesIdx: number, pointIdx: number, e: React.KeyboardEvent) => {
      let si = seriesIdx;
      let pi = pointIdx;

      if (e.key === "ArrowRight") pi = Math.min(pi + 1, labels.length - 1);
      else if (e.key === "ArrowLeft") pi = Math.max(pi - 1, 0);
      else if (e.key === "ArrowDown") si = Math.min(si + 1, series.length - 1);
      else if (e.key === "ArrowUp") si = Math.max(si - 1, 0);
      else return;

      e.preventDefault();
      focusedRef.current = { series: si, point: pi };
      pointsRef.current.get(`${si}-${pi}`)?.focus();
    },
    [labels.length, series.length],
  );

  const cls = [styles.wrapper, className].filter(Boolean).join(" ");

  return (
    <div ref={containerRef} className={cls} data-chart-container style={{ position: "relative" }}>
      <svg
        className={styles.svg}
        viewBox={`0 0 ${chartWidth} ${height}`}
        role="img"
        aria-label={ariaLabel}
      >
        <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>
          {/* Y-axis ticks + horizontal grid */}
          {yTicks.map((tick) => (
            <g key={tick} transform={`translate(0, ${yScale(tick)})`}>
              {showHGrid && (
                <line x1={0} x2={plotWidth} className={styles.axisLine} strokeDasharray="2,4" />
              )}
              <text x={-8} dy="0.35em" textAnchor="end" className={styles.tickLabel}>
                {formatValue(tick)}
              </text>
            </g>
          ))}

          {/* X-axis labels + vertical grid */}
          {labels.map((label, i) => (
            <g key={label}>
              {showVGrid && (
                <line
                  x1={xScale(i)}
                  x2={xScale(i)}
                  y1={0}
                  y2={plotHeight}
                  className={styles.axisLine}
                  strokeDasharray="2,4"
                />
              )}
              {i % xLabelSkip === 0 && (
                <text
                  x={xScale(i)}
                  y={plotHeight + 16}
                  textAnchor="middle"
                  className={styles.tickLabel}
                >
                  {label}
                </text>
              )}
            </g>
          ))}

          {/* Axis baselines */}
          <line x1={0} x2={plotWidth} y1={plotHeight} y2={plotHeight} className={styles.axisLine} />

          {/* Axis labels */}
          {xLabel && (
            <text
              x={plotWidth / 2}
              y={plotHeight + 32}
              textAnchor="middle"
              className={styles.tickLabel}
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
              className={styles.tickLabel}
            >
              {yLabel}
            </text>
          )}

          {/* Series (render in reverse for stacked so first series is on top) */}
          {(stacked ? [...series].toReversed() : series).map((s, rawIdx) => {
            const si = stacked ? series.length - 1 - rawIdx : rawIdx;
            const color = s.color ?? DEFAULT_COLORS[si % DEFAULT_COLORS.length];
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
              <g key={s.name} role="region" aria-label={s.name}>
                {areaPath && <path d={areaPath} fill={color} className={styles.area} />}
                <path
                  d={linePath}
                  stroke={color}
                  fill="none"
                  className={styles.line}
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
                      ref={(el) => {
                        if (el) pointsRef.current.set(`${si}-${pi}`, el);
                      }}
                      cx={p.x}
                      cy={p.y}
                      r={isSelected ? 5 : 3}
                      fill={color}
                      className={styles.point}
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
                      onKeyDown={(e) => handleKeyDown(si, pi, e)}
                      onFocus={(e) => {
                        focusedRef.current = { series: si, point: pi };
                        tip.onFocus(e);
                      }}
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
        <div className={styles.legend}>
          {series.map((s, i) => (
            <span key={s.name} className={styles.legendItem}>
              <span
                className={styles.legendSwatch}
                style={{ background: s.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length] }}
              />
              {s.name}
            </span>
          ))}
        </div>
      )}

      {/* Hidden data table */}
      <table className={styles.srOnly} aria-label={ariaLabel}>
        <thead>
          <tr>
            <th>Period</th>
            {series.map((s) => (
              <th key={s.name}>{s.name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {labels.map((label, i) => (
            <tr key={label}>
              <td>{label}</td>
              {series.map((s) => (
                <td key={s.name}>{formatValue(s.data[i])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
