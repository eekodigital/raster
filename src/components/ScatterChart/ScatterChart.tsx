import { useRef, useCallback, useImperativeHandle } from "react";
import { extent, linearScale, ticks, labelSkip } from "../../utils/chart-math.js";
import { useChartExport } from "../../utils/use-chart-export.js";
import type { ChartExportHandle } from "../../utils/use-chart-export.js";
import { ChartTooltip, useChartTooltip } from "../ChartTooltip/ChartTooltip.js";
import * as styles from "./ScatterChart.css.js";

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

type ScatterChartProps = {
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

const DEFAULT_COLORS = [
  "var(--color-interactive)",
  "var(--color-success)",
  "var(--color-danger)",
  "var(--color-warning)",
  "var(--color-inactive)",
];

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
  const focusedRef = useRef({ series: 0, point: 0 });
  const pointsRef = useRef<Map<string, SVGCircleElement>>(new Map());
  const { tooltipId, tooltipProps, hide, handlers } = useChartTooltip();

  // Normalise single data to a series
  const series: ScatterSeries[] = seriesProp ?? (data ? [{ name: "Data", data }] : []);
  const allPoints = series.flatMap((s) => s.data);

  const chartWidth = 400;
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

  const handleKeyDown = useCallback(
    (si: number, pi: number, e: React.KeyboardEvent) => {
      let nextSi = si;
      let nextPi = pi;
      const len = series[si]?.data.length ?? 0;

      if (e.key === "ArrowRight") nextPi = Math.min(pi + 1, len - 1);
      else if (e.key === "ArrowLeft") nextPi = Math.max(pi - 1, 0);
      else if (e.key === "ArrowDown") nextSi = Math.min(si + 1, series.length - 1);
      else if (e.key === "ArrowUp") nextSi = Math.max(si - 1, 0);
      else return;

      e.preventDefault();
      focusedRef.current = { series: nextSi, point: nextPi };
      pointsRef.current.get(`${nextSi}-${nextPi}`)?.focus();
    },
    [series],
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
          {/* Grid + Y ticks */}
          {yTicks.map((tick) => (
            <g key={`y-${tick}`} transform={`translate(0, ${yScale(tick)})`}>
              {showHGrid && <line x1={0} x2={plotWidth} className={styles.gridLine} />}
              <text x={-8} dy="0.35em" textAnchor="end" className={styles.tickLabel}>
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
                  className={styles.gridLine}
                />
              )}
              {i % xTickSkip === 0 && (
                <text
                  x={xScale(tick)}
                  y={plotHeight + 16}
                  textAnchor="middle"
                  className={styles.tickLabel}
                >
                  {formatValue(tick)}
                </text>
              )}
            </g>
          ))}

          {/* Axes */}
          <line x1={0} x2={plotWidth} y1={plotHeight} y2={plotHeight} className={styles.axisLine} />
          <line x1={0} x2={0} y1={0} y2={plotHeight} className={styles.axisLine} />

          {/* Axis labels */}
          {xLabel && (
            <text
              x={plotWidth / 2}
              y={plotHeight + 32}
              textAnchor="middle"
              className={styles.axisTitle}
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
              className={styles.axisTitle}
            >
              {yLabel}
            </text>
          )}

          {/* Points */}
          {series.map((s, si) => {
            const color = s.color ?? DEFAULT_COLORS[si % DEFAULT_COLORS.length];
            return (
              <g key={s.name} role="region" aria-label={s.name}>
                {s.data.map((p, pi) => {
                  const tooltipContent = p.label
                    ? `${s.name}: ${p.label} (${formatValue(p.x)}, ${formatValue(p.y)})`
                    : `${s.name}: (${formatValue(p.x)}, ${formatValue(p.y)})`;
                  const tip = handlers(tooltipContent);
                  return (
                    <circle
                      key={pi}
                      ref={(el) => {
                        if (el) pointsRef.current.set(`${si}-${pi}`, el);
                      }}
                      cx={xScale(p.x)}
                      cy={yScale(p.y)}
                      r={4}
                      fill={color}
                      className={styles.point}
                      style={{ animationDelay: `${(si * s.data.length + pi) * 20}ms` }}
                      tabIndex={si === 0 && pi === 0 ? 0 : -1}
                      role="img"
                      aria-label={tooltipContent}
                      aria-describedby={tip["aria-describedby"]}
                      data-clickable={onPointClick ? "" : undefined}
                      onClick={onPointClick ? () => onPointClick(p, si, pi) : undefined}
                      onKeyDown={(e) => handleKeyDown(si, pi, e)}
                      onFocus={(e) => {
                        focusedRef.current = { series: si, point: pi };
                        tip.onFocus(e);
                      }}
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
        <div className={styles.legend}>
          {series.map((s, i) => (
            <span key={s.name} className={styles.legendItem}>
              <span
                className={styles.legendDot}
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
            {series.length > 1 && <th>Series</th>}
            {allPoints.some((p) => p.label) && <th>Label</th>}
            <th>{xLabel ?? "X"}</th>
            <th>{yLabel ?? "Y"}</th>
          </tr>
        </thead>
        <tbody>
          {series.flatMap((s) =>
            s.data.map((p, i) => (
              <tr key={`${s.name}-${i}`}>
                {series.length > 1 && <td>{s.name}</td>}
                {allPoints.some((pt) => pt.label) && <td>{p.label ?? ""}</td>}
                <td>{formatValue(p.x)}</td>
                <td>{formatValue(p.y)}</td>
              </tr>
            )),
          )}
        </tbody>
      </table>
    </div>
  );
}
