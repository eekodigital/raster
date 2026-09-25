import {
  bandScale,
  extent,
  linearScale,
  ticks,
  sum,
  shouldRotateLabels,
  labelSkip,
} from "../../utils/chart-math.js";
import type { NumberFormat } from "../../utils/labels.js";
import { DEFAULT_SERIES_COLORS } from "../../utils/palette.js";
import type { ChartExportHandle } from "../../utils/use-chart-export.js";

export type { ChartExportHandle };
import { plotSize, useContainerWidth } from "../../utils/use-container-width.js";
import type { PlotSizeOptions } from "../../utils/use-container-width.js";
import { HORIZONTAL_KEYS, VERTICAL_KEYS, useRovingFocus } from "../../utils/use-roving-focus.js";
import { useSelection } from "../../utils/use-selection.js";
import { ChartFrame } from "../shared/ChartFrame.js";
import type { ChartFrameOptions } from "../shared/ChartFrame.js";
import { ChartLegend } from "../shared/ChartLegend.js";
import { markProps, useChart } from "../shared/use-chart.js";

export type BarDatum = {
  label: string;
  value: number;
};

type GridOption = "horizontal" | "vertical" | "both" | "none";

export type BarChartProps = ChartFrameOptions &
  PlotSizeOptions & {
    data: BarDatum[];
    colors?: string[];
    direction?: "vertical" | "horizontal";
    stacked?: boolean;
    grouped?: boolean;
    /** Series names for stacked/grouped bars. */
    series?: string[];
    /** `values[category][series]` for stacked/grouped bars. */
    values?: number[][];
    xLabel?: string;
    yLabel?: string;
    grid?: GridOption;
    /** Formats values in ticks, marks and the table. Default: `Intl.NumberFormat(labels.locale)`. */
    formatValue?: NumberFormat;
    /** Passing this (or `onSelect`/`selectedIndex`) makes bars toggle buttons. */
    onBarClick?: (datum: BarDatum, index: number, seriesIndex?: number) => void;
    /** Selected category index. In stacked/grouped mode the whole category is selected. */
    selectedIndex?: number | null;
    onSelect?: (index: number | null) => void;
    exportRef?: React.Ref<ChartExportHandle>;
  };

const MARGIN_V = { top: 8, right: 8, bottom: 28, left: 40 };
const MARGIN_H = { top: 8, right: 8, bottom: 28, left: 80 };
/** Vertical stacks: Up climbs the stack (next series), Down descends. */
const STACK_KEYS = { next: ["ArrowUp"], prev: ["ArrowDown"] };

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
  formatValue,
  onBarClick,
  selectedIndex,
  onSelect,
  height: heightProp,
  aspectRatio,
  exportRef,
  labels: labelOverrides,
  ...frame
}: BarChartProps) {
  const { plotRef, labels, n, format, tooltip } = useChart(labelOverrides, formatValue, exportRef);
  const selection = useSelection<number>(selectedIndex, onSelect, labels);
  const interactive = !!(onBarClick || onSelect || selectedIndex !== undefined);

  const isHorizontal = direction === "horizontal";
  const multi = series && values && (stacked || grouped) ? { series, values } : null;
  const width = useContainerWidth(plotRef, 720);
  const rotateLabels =
    !isHorizontal && shouldRotateLabels(data.length, width - MARGIN_V.left - MARGIN_V.right);
  const MARGIN = isHorizontal ? MARGIN_H : { ...MARGIN_V, bottom: rotateLabels ? 52 : 28 };
  const size = plotSize(
    width,
    { height: heightProp, aspectRatio },
    isHorizontal ? Math.max(120, data.length * 36) : 200,
  );
  const plotWidth = size.width - MARGIN.left - MARGIN.right;
  const plotHeight = size.height - MARGIN.top - MARGIN.bottom;

  const cell = (i: number, si: number) => multi?.values[i]?.[si] ?? 0;
  const barValues = multi ? multi.values.flat() : data.map((d) => d.value);
  const maxVal = Math.max(
    ...(multi && stacked ? multi.values.map((row) => sum(row)) : barValues),
    1,
  );

  const categoryScale = bandScale(data.length, [0, isHorizontal ? plotHeight : plotWidth], 0.2);
  const valueScale = linearScale([0, maxVal], isHorizontal ? [0, plotWidth] : [plotHeight, 0]);
  const valueTicks = ticks(0, maxVal, 4);
  const skip = isHorizontal
    ? labelSkip(data.length, plotHeight, 20)
    : labelSkip(data.length, plotWidth, rotateLabels ? 18 : 30);

  const activate = interactive
    ? (row: number, i: number) => {
        selection.toggle(i);
        onBarClick?.(data[i], i, multi ? row : undefined);
      }
    : undefined;

  const roving = useRovingFocus({
    counts: multi ? multi.series.map(() => data.length) : [data.length],
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
  const summary = labels.summary(
    {
      type: "bar",
      series: multi ? multi.series.length : 1,
      points: barValues.length,
      x: data.length ? [data[0].label, data[data.length - 1].label] : undefined,
      y: barValues.length ? [format(minVal), format(maxBar)] : undefined,
    },
    n,
  );

  function bar(
    key: React.Key,
    row: number,
    i: number,
    value: number,
    geometry: object,
    extra: object,
  ) {
    const selected = selection.isSelected(i);
    return (
      <rect
        key={key}
        {...geometry}
        {...extra}
        {...markProps({
          label: labels.mark(
            {
              series: multi?.series[row],
              x: data[i].label,
              y: format(value),
              index: i,
              count: data.length,
            },
            n,
          ),
          row,
          item: i,
          roving,
          tooltip,
          onActivate: activate,
          selected,
          dimmed: selection.selected !== null && !selected,
        })}
      />
    );
  }

  function renderSimpleBars() {
    return data.map((d, i) =>
      bar(
        i,
        0,
        i,
        d.value,
        isHorizontal
          ? {
              x: 0,
              y: categoryScale.offset(i),
              width: valueScale(d.value),
              height: categoryScale.bandwidth,
            }
          : {
              x: categoryScale.offset(i),
              y: valueScale(d.value),
              width: categoryScale.bandwidth,
              height: plotHeight - valueScale(d.value),
            },
        {
          className: isHorizontal
            ? "raster-bar__bar raster-bar__bar--horizontal"
            : "raster-bar__bar",
          style: { animationDelay: `${i * 60}ms` },
          fill: colors[i % colors.length],
          rx: 2,
        },
      ),
    );
  }

  function renderSeriesBars({ series: names }: NonNullable<typeof multi>) {
    const subBarWidth = categoryScale.bandwidth / names.length;
    return names.map((name, si) => (
      <g
        key={name}
        role="group"
        aria-label={labels.series(name, data.length, n)}
        data-series={(si % 8) + 1}
      >
        {data.map((_, i) => {
          const v = cell(i, si);
          let below = 0;
          if (stacked) for (let s = 0; s < si; s++) below += cell(i, s);
          const band = stacked ? categoryScale.bandwidth : Math.max(subBarWidth - 1, 0);
          const bandStart = categoryScale.offset(i) + (stacked ? 0 : si * subBarWidth);
          const from = stacked ? below : 0;
          const geometry = isHorizontal
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
          return bar(i, si, i, v, geometry, {
            className: isHorizontal
              ? "raster-bar__bar raster-bar__bar--horizontal"
              : "raster-bar__bar",
            style: { animationDelay: `${(i * names.length + si) * 40}ms` },
            fill: colors[si % colors.length],
            rx: stacked && si < names.length - 1 ? 0 : 2,
          });
        })}
      </g>
    ));
  }

  const showHGrid = grid === "horizontal" || grid === "both";
  const showVGrid = grid === "vertical" || grid === "both";

  return (
    <ChartFrame
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
          <ChartLegend
            items={multi.series.map((s, i) => ({ label: s, color: colors[i % colors.length] }))}
          />
        )
      }
      table={{
        caption: labels.tableCaption(frame.title),
        headers: ["Category", ...(multi ? multi.series : ["Value"])],
        rows: data.map((d, i) => ({
          key: i,
          cells: [
            d.label,
            ...(multi ? multi.series.map((_, si) => format(cell(i, si))) : [format(d.value)]),
          ],
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
        {data.map((d, i) => {
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
              {d.label}
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
              {d.label}
            </text>
          );
        })}

        {multi ? renderSeriesBars(multi) : renderSimpleBars()}
      </g>
    </ChartFrame>
  );
}
