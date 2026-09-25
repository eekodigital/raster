import { useState, useRef, useCallback, useImperativeHandle, useEffect } from "react";
import {
  bandScale,
  linearScale,
  ticks,
  sum,
  shouldRotateLabels,
  labelSkip,
} from "../../utils/chart-math.js";
import { cn } from "../../utils/cn.js";
import { DEFAULT_SERIES_COLORS } from "../../utils/palette.js";
import { useChartExport } from "../../utils/use-chart-export.js";
import type { ChartExportHandle } from "../../utils/use-chart-export.js";

export type { ChartExportHandle };
import { useContainerWidth } from "../../utils/use-container-width.js";
import { HORIZONTAL_KEYS, VERTICAL_KEYS, useRovingFocus } from "../../utils/use-roving-focus.js";
import { ChartTooltip, useChartTooltip } from "../ChartTooltip/ChartTooltip.js";
import { ChartDataTable } from "../shared/ChartDataTable.js";
import { ChartLegend } from "../shared/ChartLegend.js";

export type BarDatum = {
  label: string;
  value: number;
};

type GridOption = "horizontal" | "vertical" | "both" | "none";

export type BarChartProps = {
  data: BarDatum[];
  colors?: string[];
  direction?: "vertical" | "horizontal";
  stacked?: boolean;
  grouped?: boolean;
  series?: string[];
  values?: number[][];
  xLabel?: string;
  yLabel?: string;
  grid?: GridOption;
  formatValue?: (value: number) => string;
  onBarClick?: (datum: BarDatum, index: number, seriesIndex?: number) => void;
  selectedIndex?: number | null;
  onSelect?: (index: number | null) => void;
  height?: number;
  exportRef?: React.Ref<ChartExportHandle>;
  "aria-label": string;
  className?: string;
};

const MARGIN_V = { top: 8, right: 8, bottom: 28, left: 40 };
const MARGIN_H = { top: 8, right: 8, bottom: 28, left: 80 };

export function BarChart({
  data,
  colors = DEFAULT_SERIES_COLORS as string[],
  direction = "vertical",
  stacked = false,
  grouped = false,
  series,
  values,
  xLabel,
  yLabel,
  grid = "horizontal",
  formatValue = String,
  onBarClick,
  selectedIndex: controlledSelected,
  onSelect,
  height: heightProp,
  exportRef,
  "aria-label": ariaLabel,
  className,
}: BarChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const exportHandle = useChartExport(containerRef);
  useImperativeHandle(exportRef, () => exportHandle, [exportHandle]);
  const { tooltipId, tooltipProps, hide, handlers } = useChartTooltip();

  // Selection state (controlled or uncontrolled)
  const [internalSelected, setInternalSelected] = useState<number | null>(null);
  const selected = controlledSelected !== undefined ? controlledSelected : internalSelected;
  const setSelected = useCallback(
    (index: number | null) => {
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

  const isHorizontal = direction === "horizontal";
  const isMulti = !!series && !!values;
  const chartWidth = useContainerWidth(containerRef, 720);
  const needsRotation =
    !isHorizontal && shouldRotateLabels(data.length, chartWidth - MARGIN_V.left - MARGIN_V.right);
  const MARGIN = isHorizontal
    ? MARGIN_H
    : { ...MARGIN_V, bottom: needsRotation ? 52 : MARGIN_V.bottom };
  const height = heightProp ?? (isHorizontal ? Math.max(120, data.length * 36) : 200);
  const plotWidth = chartWidth - MARGIN.left - MARGIN.right;
  const plotHeight = height - MARGIN.top - MARGIN.bottom;

  // Compute max value
  let maxVal: number;
  if (isMulti && values) {
    if (stacked) {
      maxVal = Math.max(...values.map((row) => sum(row)), 1);
    } else {
      maxVal = Math.max(...values.flat(), 1);
    }
  } else {
    maxVal = Math.max(...data.map((d) => d.value), 1);
  }

  const categoryScale = bandScale(data.length, [0, isHorizontal ? plotHeight : plotWidth], 0.2);
  const valueScale = linearScale([0, maxVal], isHorizontal ? [0, plotWidth] : [plotHeight, 0]);
  const valueTicks = ticks(0, maxVal, 4);
  const rotateLabels = !isHorizontal && shouldRotateLabels(data.length, plotWidth);
  const skip = isHorizontal
    ? labelSkip(data.length, plotHeight, 20)
    : labelSkip(data.length, plotWidth, rotateLabels ? 18 : 30);

  const roving = useRovingFocus({
    counts: [data.length],
    itemKeys: isHorizontal ? VERTICAL_KEYS : HORIZONTAL_KEYS,
  });

  // Simple single-value bars
  function renderSimpleBars() {
    return data.map((d, i) => {
      const tooltipContent = `${d.label}: ${d.value}`;
      const tip = handlers(tooltipContent);
      const isSelected = selected === i;
      const isDimmed = selected !== null && !isSelected;

      if (isHorizontal) {
        const barWidth = valueScale(d.value);
        return (
          <g key={d.label}>
            <rect
              ref={roving.ref(0, i)}
              className="raster-bar__bar raster-bar__bar--horizontal"
              style={{ animationDelay: `${i * 60}ms` }}
              x={0}
              y={categoryScale.offset(i)}
              width={barWidth}
              height={categoryScale.bandwidth}
              fill={colors[i % colors.length]}
              rx={2}
              tabIndex={i === 0 ? 0 : -1}
              role="img"
              aria-label={tooltipContent}
              aria-describedby={tip["aria-describedby"]}
              data-selected={isSelected ? "" : undefined}
              data-dimmed={isDimmed ? "" : undefined}
              onClick={() => {
                setSelected(isSelected ? null : i);
                onBarClick?.(d, i);
              }}
              onKeyDown={roving.onKeyDown(0, i)}
              onFocus={tip.onFocus}
              onBlur={() => {
                if (!isSelected) hide();
              }}
              onMouseEnter={tip.onMouseEnter}
              onMouseLeave={() => {
                if (!isSelected) tip.onMouseLeave();
              }}
            />
            {i % skip === 0 && (
              <text
                x={-6}
                y={categoryScale.offset(i) + categoryScale.bandwidth / 2}
                dy="0.35em"
                textAnchor="end"
                className="raster-chart__tick"
              >
                {d.label}
              </text>
            )}
          </g>
        );
      }

      const barHeight = plotHeight - valueScale(d.value);
      const labelX = categoryScale.offset(i) + categoryScale.bandwidth / 2;
      return (
        <g key={d.label}>
          <rect
            ref={roving.ref(0, i)}
            className="raster-bar__bar"
            style={{ animationDelay: `${i * 60}ms` }}
            x={categoryScale.offset(i)}
            y={valueScale(d.value)}
            width={categoryScale.bandwidth}
            height={barHeight}
            fill={colors[i % colors.length]}
            rx={2}
            tabIndex={i === 0 ? 0 : -1}
            role="img"
            aria-label={tooltipContent}
            aria-describedby={tip["aria-describedby"]}
            data-selected={isSelected ? "" : undefined}
            data-dimmed={isDimmed ? "" : undefined}
            onClick={() => {
              setSelected(isSelected ? null : i);
              onBarClick?.(d, i);
            }}
            onKeyDown={roving.onKeyDown(0, i)}
            onFocus={tip.onFocus}
            onBlur={() => {
              if (!isSelected) hide();
            }}
            onMouseEnter={tip.onMouseEnter}
            onMouseLeave={() => {
              if (!isSelected) tip.onMouseLeave();
            }}
          />
          {i % skip === 0 && (
            <text
              x={labelX}
              y={plotHeight + 16}
              textAnchor={rotateLabels ? "end" : "middle"}
              className="raster-chart__tick"
              transform={rotateLabels ? `rotate(-45, ${labelX}, ${plotHeight + 16})` : undefined}
            >
              {d.label}
            </text>
          )}
        </g>
      );
    });
  }

  // Multi-value stacked bars (vertical only for now)
  function renderStackedBars() {
    if (!values || !series) return null;
    return data.map((d, i) => {
      const row = values[i] ?? [];
      let cumulative = 0;
      return (
        <g key={d.label}>
          {row.map((v, si) => {
            const y0 = cumulative;
            cumulative += v;
            const tooltipContent = `${d.label} — ${series[si]}: ${v}`;
            const tip = handlers(tooltipContent);
            return (
              <rect
                key={si}
                className="raster-bar__bar"
                data-series={(si % 8) + 1}
                x={categoryScale.offset(i)}
                y={valueScale(cumulative)}
                width={categoryScale.bandwidth}
                height={valueScale(y0) - valueScale(cumulative)}
                fill={colors[si % colors.length]}
                rx={si === row.length - 1 ? 2 : 0}
                tabIndex={i === 0 && si === 0 ? 0 : -1}
                role="img"
                aria-label={tooltipContent}
                aria-describedby={tip["aria-describedby"]}
                onMouseEnter={tip.onMouseEnter}
                onMouseLeave={tip.onMouseLeave}
                onFocus={tip.onFocus}
                onBlur={hide}
              />
            );
          })}
          {i % skip === 0 && (
            <text
              x={categoryScale.offset(i) + categoryScale.bandwidth / 2}
              y={plotHeight + 16}
              textAnchor={rotateLabels ? "end" : "middle"}
              className="raster-chart__tick"
              transform={
                rotateLabels
                  ? `rotate(-45, ${categoryScale.offset(i) + categoryScale.bandwidth / 2}, ${plotHeight + 16})`
                  : undefined
              }
            >
              {d.label}
            </text>
          )}
        </g>
      );
    });
  }

  // Multi-value grouped bars (side by side)
  function renderGroupedBars() {
    if (!values || !series) return null;
    const seriesCount = series.length;
    const subBarWidth = categoryScale.bandwidth / seriesCount;
    return data.map((d, i) => {
      const row = values[i] ?? [];
      return (
        <g key={d.label}>
          {row.map((v, si) => {
            const tooltipContent = `${d.label} — ${series[si]}: ${formatValue(v)}`;
            const tip = handlers(tooltipContent);
            const barHeight = plotHeight - valueScale(v);
            return (
              <rect
                key={si}
                className="raster-bar__bar"
                data-series={(si % 8) + 1}
                style={{ animationDelay: `${(i * seriesCount + si) * 40}ms` }}
                x={categoryScale.offset(i) + si * subBarWidth}
                y={valueScale(v)}
                width={subBarWidth - 1}
                height={barHeight}
                fill={colors[si % colors.length]}
                rx={2}
                tabIndex={i === 0 && si === 0 ? 0 : -1}
                role="img"
                aria-label={tooltipContent}
                aria-describedby={tip["aria-describedby"]}
                data-clickable={onBarClick ? "" : undefined}
                onClick={onBarClick ? () => onBarClick(d, i, si) : undefined}
                onMouseEnter={tip.onMouseEnter}
                onMouseLeave={tip.onMouseLeave}
                onFocus={tip.onFocus}
                onBlur={hide}
              />
            );
          })}
          {i % skip === 0 && (
            <text
              x={categoryScale.offset(i) + categoryScale.bandwidth / 2}
              y={plotHeight + 16}
              textAnchor={rotateLabels ? "end" : "middle"}
              className="raster-chart__tick"
              transform={
                rotateLabels
                  ? `rotate(-45, ${categoryScale.offset(i) + categoryScale.bandwidth / 2}, ${plotHeight + 16})`
                  : undefined
              }
            >
              {d.label}
            </text>
          )}
        </g>
      );
    });
  }

  const showHGrid = grid === "horizontal" || grid === "both";
  const showVGrid = grid === "vertical" || grid === "both";

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
          {/* Grid lines + ticks */}
          {valueTicks.map((tick) => {
            if (isHorizontal) {
              const x = valueScale(tick);
              return (
                <g key={tick}>
                  {showVGrid && (
                    <line
                      x1={x}
                      x2={x}
                      y1={0}
                      y2={plotHeight}
                      className="raster-chart__grid"
                      strokeDasharray="2,4"
                    />
                  )}
                  <text
                    x={x}
                    y={plotHeight + 16}
                    textAnchor="middle"
                    className="raster-chart__tick"
                  >
                    {formatValue(tick)}
                  </text>
                </g>
              );
            }
            const y = valueScale(tick);
            return (
              <g key={tick} transform={`translate(0, ${y})`}>
                {showHGrid && (
                  <line
                    x1={0}
                    x2={plotWidth}
                    className="raster-chart__grid"
                    strokeDasharray="2,4"
                  />
                )}
                <text x={-6} dy="0.35em" textAnchor="end" className="raster-chart__tick">
                  {formatValue(tick)}
                </text>
              </g>
            );
          })}

          {/* Baseline */}
          {isHorizontal ? (
            <line x1={0} x2={0} y1={0} y2={plotHeight} className="raster-chart__axis" />
          ) : (
            <line
              x1={0}
              x2={plotWidth}
              y1={plotHeight}
              y2={plotHeight}
              className="raster-chart__axis"
            />
          )}

          {/* Axis labels */}
          {xLabel && (
            <text
              x={plotWidth / 2}
              y={plotHeight + 28}
              textAnchor="middle"
              className="raster-chart__tick"
            >
              {xLabel}
            </text>
          )}
          {yLabel && (
            <text
              x={-plotHeight / 2}
              y={-30}
              textAnchor="middle"
              transform="rotate(-90)"
              className="raster-chart__tick"
            >
              {yLabel}
            </text>
          )}

          {/* Bars */}
          {isMulti && grouped
            ? renderGroupedBars()
            : isMulti && stacked
              ? renderStackedBars()
              : renderSimpleBars()}
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
      {isMulti && series && (
        <ChartLegend
          items={series.map((s, i) => ({ label: s, color: colors[i % colors.length] }))}
        />
      )}

      <ChartDataTable
        aria-label={ariaLabel}
        headers={["Category", ...(isMulti && series ? series : ["Value"])]}
        rows={data.map((d, i) => ({
          key: d.label,
          cells: [d.label, ...(isMulti && values ? (values[i] ?? []) : [d.value])],
        }))}
      />
    </div>
  );
}
