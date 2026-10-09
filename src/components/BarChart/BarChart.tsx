import {
  bandScale,
  extent,
  linearScale,
  ticks,
  sum,
  TICK_CHAR,
  truncateLabel,
  labelSkip,
  niceExtent,
} from "../../utils/chart-math.js";
import type { NumberFormat } from "../../utils/labels.js";
import { seriesColor } from "../../utils/palette.js";

export type { NumericReferenceLine };
import { plotSize, useContainerWidth } from "../../utils/use-container-width.js";
import type { PlotSizeOptions } from "../../utils/use-container-width.js";
import { HORIZONTAL_KEYS, VERTICAL_KEYS, useRovingFocus } from "../../utils/use-roving-focus.js";
import { useSelection } from "../../utils/use-selection.js";
import { SvgChartFrame } from "../shared/ChartFrame.js";
import type { ChartFrameOptions } from "../shared/ChartFrame.js";
import { ChartLegend } from "../shared/ChartLegend.js";
import {
  ReferenceLines,
  placeReferences,
  referenceCaption,
  referenceValues,
} from "../shared/ReferenceLines.js";
import type { Box, NumericReferenceLine } from "../shared/ReferenceLines.js";
import { markProps, useChart } from "../shared/use-chart.js";
import type { MarkClick } from "../shared/use-chart.js";

export type BarDatum = {
  label: string;
  value: number;
  /** The bar's colour. Default: the palette, one colour per bar. */
  color?: string;
};

export type BarSeries = {
  name: string;
  /** One value per category. */
  data: number[];
  color?: string;
};

/** A bar: its series and its category. */
export type BarPointIndex = { series: number; point: number };

type GridOption = "horizontal" | "vertical" | "both" | "none";

export type BarChartProps = ChartFrameOptions &
  PlotSizeOptions &
  (
    | {
        /** One bar per category: `{ label, value, color? }[]`. */
        data: BarDatum[];
        series?: never;
        categories?: never;
      }
    | {
        /**
         * Several series, as on LineChart: `{ name, data, color? }[]`, one
         * value per category. Grouped side by side, or `stacked`.
         */
        series: BarSeries[];
        /** The categories, one per value in each series. */
        categories: string[];
        data?: never;
      }
  ) & {
    direction?: "vertical" | "horizontal";
    /** Stack several series in one bar per category, instead of side by side. */
    stacked?: boolean;
    xLabel?: string;
    yLabel?: string;
    grid?: GridOption;
    /** Formats values in ticks, marks and the table. Default: `Intl.NumberFormat(labels.locale)`. */
    formatValue?: NumberFormat;
    /**
     * Called when a bar is clicked (or activated with Enter/Space): its index,
     * value and `{ label, value }`. Passing this (or `onSelect`/`selectedIndex`)
     * makes bars toggle buttons.
     */
    onMarkClick?: (mark: MarkClick<BarPointIndex, BarDatum>) => void;
    /** The selected bar. */
    selectedIndex?: BarPointIndex | null;
    onSelect?: (index: BarPointIndex | null) => void;
    /** Targets, thresholds or goals across the value axis: dashed, labelled lines, named in the summary and table caption. */
    referenceLines?: Omit<NumericReferenceLine, "axis">[];
  };

const MARGIN_V = { top: 8, right: 8, bottom: 28, left: 40 };
const MARGIN_H = { top: 8, right: 8, bottom: 28, left: 40 };
/** Longest rotated category label, in px, before it's cut with an ellipsis. */
const ROTATED_LABEL_MAX = 100;
/** Vertical stacks: Up climbs the stack (next series), Down descends. */
const STACK_KEYS = { next: ["ArrowUp"], prev: ["ArrowDown"] };

export function BarChart({
  data,
  series: seriesProp,
  categories: categoriesProp,
  direction = "vertical",
  stacked = false,
  xLabel,
  yLabel,
  grid = "horizontal",
  formatValue,
  onMarkClick,
  selectedIndex,
  onSelect,
  height: heightProp,
  aspectRatio,
  labels: labelOverrides,
  referenceLines = [],
  ...frame
}: BarChartProps) {
  const { plotRef, labels, n, format, tooltip, describe } = useChart(labelOverrides, formatValue);
  const selection = useSelection<BarPointIndex>(selectedIndex, onSelect, labels);
  const interactive = !!(onMarkClick || onSelect || selectedIndex !== undefined);

  // One shape inside: series × categories. `data` is a single unnamed series.
  const multi = !!seriesProp;
  // Missing props (from plain JS, or the v3 API) render an empty chart, not a crash.
  const categories = seriesProp ? (categoriesProp ?? []) : (data ?? []).map((d) => d.label);
  const rows: BarSeries[] = seriesProp ?? [{ name: "", data: (data ?? []).map((d) => d.value) }];
  const count = categories.length;
  const cell = (si: number, i: number) => rows[si].data[i] ?? 0;
  const color = (si: number, i: number) =>
    multi ? (rows[si].color ?? seriesColor(si)) : (data?.[i]?.color ?? seriesColor(i));

  const isHorizontal = direction === "horizontal";
  const width = useContainerWidth(plotRef, 720);
  // Category labels by their estimated width: rotated when they're wider than
  // a bar's slot (vertical), or given a left margin to fit (horizontal), up to
  // a limit past which they're cut with an ellipsis.
  const longest = Math.max(0, ...categories.map((c) => c.length)) * TICK_CHAR;
  const rotateLabels =
    !isHorizontal && count > 1 && longest + 8 > (width - MARGIN_V.left - MARGIN_V.right) / count;
  const labelRoom = isHorizontal
    ? Math.min(longest, Math.max(28, Math.round(width * 0.4) - 12))
    : rotateLabels
      ? Math.min(longest, ROTATED_LABEL_MAX)
      : Infinity;
  const MARGIN = isHorizontal
    ? { ...MARGIN_H, left: Math.max(MARGIN_H.left, labelRoom + 12) }
    : // A label rotated 45° drops by its length × sin 45°.
      { ...MARGIN_V, bottom: rotateLabels ? Math.ceil(labelRoom * 0.71) + 22 : 28 };
  const size = plotSize(
    width,
    { height: heightProp, aspectRatio },
    isHorizontal ? Math.max(120, count * 36) : 200,
  );
  const plotWidth = size.width - MARGIN.left - MARGIN.right;
  const plotHeight = size.height - MARGIN.top - MARGIN.bottom;

  const barValues = rows.flatMap((r) => categories.map((_, i) => r.data[i] ?? 0));
  // The value scale reaches every reference line.
  const maxVal = Math.max(
    ...(stacked ? categories.map((_, i) => sum(rows.map((_, si) => cell(si, i)))) : barValues),
    ...referenceValues(referenceLines, "y"),
    1,
  );

  const categoryScale = bandScale(count, [0, isHorizontal ? plotHeight : plotWidth], 0.2);
  // Rounded out to whole ticks, so no bar is beyond the last gridline.
  const valueMax = niceExtent(0, maxVal, 4)[1];
  const valueScale = linearScale([0, valueMax], isHorizontal ? [0, plotWidth] : [plotHeight, 0]);
  const valueTicks = ticks(0, valueMax, 4);
  // Lines below zero fall off the plot (bars start at 0) and are left out.
  const references = placeReferences(
    referenceLines.map((r) => ({ ...r, axis: isHorizontal ? ("x" as const) : undefined })),
    (r) => (Number.isFinite(r.value) ? [valueScale(r.value), format(r.value)] : null),
    plotWidth,
    plotHeight,
    labels,
  );
  const referenceTexts = references.map((r) => r.text);
  const skip = isHorizontal
    ? labelSkip(count, plotHeight, 20)
    : rotateLabels
      ? labelSkip(count, plotWidth, 18)
      : 1;

  const activate = interactive
    ? (si: number, i: number) => {
        const index = { series: si, point: i };
        selection.toggle(index);
        onMarkClick?.({
          index,
          value: cell(si, i),
          // A single series gives back your own datum; several, the bar's { label, value }.
          datum: multi ? { label: categories[i], value: cell(si, i) } : data![i],
        });
      }
    : undefined;

  const roving = useRovingFocus({
    counts: rows.map(() => count),
    itemKeys: isHorizontal ? VERTICAL_KEYS : HORIZONTAL_KEYS,
    // Series keys are the other axis from category keys: Left/Right between
    // series of horizontal bars; Up/Down (Up climbing a stack) for vertical.
    rowKeys: multi
      ? isHorizontal
        ? HORIZONTAL_KEYS
        : stacked
          ? STACK_KEYS
          : VERTICAL_KEYS
      : undefined,
    onActivate: activate,
  });

  const [minVal, maxBar] = barValues.length ? extent(barValues) : [0, 0];
  const summary = describe({
    type: "bar",
    series: rows.length,
    points: barValues.length,
    x: count ? [categories[0], categories[count - 1]] : undefined,
    y: barValues.length ? [format(minVal), format(maxBar)] : undefined,
    references: referenceTexts,
  });

  const subBarWidth = categoryScale.bandwidth / (stacked ? 1 : rows.length);
  /** A bar's rectangle in plot px. */
  const barRect = (si: number, i: number) => {
    const v = cell(si, i);
    let below = 0;
    if (stacked) for (let s = 0; s < si; s++) below += cell(s, i);
    const band = multi && !stacked ? Math.max(subBarWidth - 1, 0) : categoryScale.bandwidth;
    const bandStart = categoryScale.offset(i) + (stacked ? 0 : si * subBarWidth);
    const from = stacked ? below : 0;
    return isHorizontal
      ? {
          x: valueScale(from),
          y: bandStart,
          width: valueScale(from + v) - valueScale(from),
          height: band,
        }
      : {
          x: bandStart,
          y: valueScale(from + v),
          width: band,
          height: valueScale(from) - valueScale(from + v),
        };
  };
  const bars = rows.map((row, si) => {
    const marks = categories.map((label, i) => {
      const selected = selection.isSelected({ series: si, point: i });
      return (
        <rect
          key={i}
          {...barRect(si, i)}
          className={
            isHorizontal ? "raster-bar__bar raster-bar__bar--horizontal" : "raster-bar__bar"
          }
          style={{ animationDelay: `${(i * rows.length + si) * 40}ms` }}
          fill={color(si, i)}
          rx={stacked && si < rows.length - 1 ? 0 : 2}
          {...markProps({
            label: labels.mark(
              {
                series: multi ? row.name : undefined,
                x: label,
                y: format(cell(si, i)),
                index: i,
                count,
              },
              n,
            ),
            row: si,
            item: i,
            roving,
            tooltip,
            onActivate: activate,
            selected,
            dimmed: selection.selected !== null && !selected,
          })}
        />
      );
    });
    return multi ? (
      <g
        key={row.name}
        role="group"
        aria-label={labels.series(row.name, count, n)}
        data-series={(si % 8) + 1}
      >
        {marks}
      </g>
    ) : (
      marks
    );
  });

  const showHGrid = grid === "horizontal" || grid === "both";
  const showVGrid = grid === "vertical" || grid === "both";

  return (
    <SvgChartFrame
      {...frame}
      labels={labels}
      summary={summary}
      plotRef={plotRef}
      plotStyle={size.style}
      width={size.width}
      height={size.height}
      selection={selection}
      tooltip={tooltip}
      legend={
        multi && (
          <ChartLegend items={rows.map((r, si) => ({ label: r.name, color: color(si, 0) }))} />
        )
      }
      table={{
        caption: referenceCaption(labels.tableCaption(frame.title), referenceTexts, labels),
        headers: [
          labels.categoryColumn,
          ...(multi ? rows.map((r) => r.name) : [labels.valueColumn]),
        ],
        rows: categories.map((label, i) => ({
          key: i,
          cells: [label, ...rows.map((_, si) => format(cell(si, i)))],
        })),
      }}
    >
      <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>
        {valueTicks.map((tick) => {
          if (isHorizontal) {
            const x = valueScale(tick);
            return (
              <g key={tick}>
                {showVGrid && (
                  <line x1={x} x2={x} y1={0} y2={plotHeight} className="raster-chart__grid" />
                )}
                <text x={x} y={plotHeight + 16} textAnchor="middle" className="raster-chart__tick">
                  {format(tick)}
                </text>
              </g>
            );
          }
          return (
            <g key={tick} transform={`translate(0, ${valueScale(tick)})`}>
              {showHGrid && <line x1={0} x2={plotWidth} className="raster-chart__grid" />}
              <text x={-6} dy="0.35em" textAnchor="end" className="raster-chart__tick">
                {format(tick)}
              </text>
            </g>
          );
        })}

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

        {/* Category labels */}
        {categories.map((label, i) => {
          if (i % skip !== 0) return null;
          const mid = categoryScale.offset(i) + categoryScale.bandwidth / 2;
          return isHorizontal ? (
            <text
              key={i}
              x={-6}
              y={mid}
              dy="0.35em"
              textAnchor="end"
              className="raster-chart__tick"
            >
              {truncateLabel(label, labelRoom)}
            </text>
          ) : (
            <text
              key={i}
              x={mid}
              y={plotHeight + 16}
              textAnchor={rotateLabels ? "end" : "middle"}
              className="raster-chart__tick"
              transform={rotateLabels ? `rotate(-45, ${mid}, ${plotHeight + 16})` : undefined}
            >
              {truncateLabel(label, labelRoom)}
            </text>
          );
        })}

        {bars}
        <ReferenceLines
          lines={references}
          plotWidth={plotWidth}
          plotHeight={plotHeight}
          avoid={{
            boxes: rows.flatMap((_, si) =>
              categories.map((_, i): Box => {
                const r = barRect(si, i);
                return [r.x, r.y, r.x + r.width, r.y + r.height];
              }),
            ),
          }}
        />
      </g>
    </SvgChartFrame>
  );
}
