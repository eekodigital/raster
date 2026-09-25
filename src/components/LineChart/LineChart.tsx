import {
  catmullRomPath,
  extent,
  linearScale,
  markerPath,
  ticks,
  labelSkip,
} from "../../utils/chart-math.js";
import type { NumberFormat } from "../../utils/labels.js";
import { seriesColor } from "../../utils/palette.js";
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

export type LineSeries = {
  name: string;
  data: number[];
  color?: string;
};

type GridOption = "horizontal" | "vertical" | "both" | "none";

export type LinePointIndex = { series: number; point: number };

export type LineChartProps = ChartFrameOptions &
  PlotSizeOptions & {
    series: LineSeries[];
    /**
     * X-axis categories, one per data point. They name each point and label the
     * data table, so keep them complete: use `xTickFilter`/`formatXTick` to
     * thin or shorten the axis labels. (A `""` category still hides its tick,
     * but also leaves that point without an x value in its name.)
     */
    categories: string[];
    /**
     * Which x-axis ticks to label, by category index. Replaces the automatic
     * thinning (`xLabelMinSpacing`). Points and the table keep every category.
     */
    xTickFilter?: (index: number, category: string) => boolean;
    /** Text for an x-axis tick. Return `""` to hide it. Default: the category. */
    formatXTick?: (category: string, index: number) => string;
    area?: boolean;
    stacked?: boolean;
    curve?: "linear" | "smooth";
    xLabel?: string;
    yLabel?: string;
    grid?: GridOption;
    /** Formats values in ticks, marks and the table. Default: `Intl.NumberFormat(labels.locale)`. */
    formatValue?: NumberFormat;
    /**
     * Minimum horizontal space (in display px) between adjacent x-axis labels.
     * When labels are wider than the default 30px budget (e.g. full dates like
     * "2026-04-20"), bump this so labels thin out enough not to overlap.
     */
    xLabelMinSpacing?: number;
    /** Passing this (or `onSelect`/`selectedIndex`) makes points toggle buttons. */
    onPointClick?: (seriesIndex: number, pointIndex: number, value: number) => void;
    selectedIndex?: LinePointIndex | null;
    onSelect?: (index: LinePointIndex | null) => void;
    exportRef?: React.Ref<ChartExportHandle>;
  };

const MARGIN = { top: 8, right: 8, bottom: 40, left: 50 };

export function LineChart({
  series,
  categories,
  area = false,
  stacked = false,
  curve = "linear",
  xLabel,
  yLabel,
  grid = "horizontal",
  formatValue,
  xLabelMinSpacing = 30,
  xTickFilter,
  formatXTick,
  onPointClick,
  selectedIndex,
  onSelect,
  height: heightProp,
  aspectRatio,
  exportRef,
  labels: labelOverrides,
  ...frame
}: LineChartProps) {
  const { plotRef, labels, n, format, tooltip } = useChart(labelOverrides, formatValue, exportRef);
  const selection = useSelection<LinePointIndex>(selectedIndex, onSelect, labels);
  const interactive = !!(onPointClick || onSelect || selectedIndex !== undefined);

  const size = plotSize(useContainerWidth(plotRef, 720), { height: heightProp, aspectRatio }, 200);
  const plotWidth = size.width - MARGIN.left - MARGIN.right;
  const plotHeight = size.height - MARGIN.top - MARGIN.bottom;

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
    categories.length <= 1 ? plotWidth / 2 : (i / (categories.length - 1)) * plotWidth;
  const yScale = linearScale([yMin, yMax], [plotHeight, 0]);
  const yTicks = ticks(yMin, yMax, 4);
  // Which ticks get a label. A filter wins; otherwise defer to consumers who
  // pre-decimated with "" categories; otherwise thin by width, always keeping
  // the last category (and dropping the one before it if that would crowd it).
  const last = categories.length - 1;
  const hasManualXLabels = categories.some((l) => l === "");
  let tickIndices = categories.map((_, i) => i);
  if (xTickFilter) {
    tickIndices = tickIndices.filter((i) => xTickFilter(i, categories[i]));
  } else if (!hasManualXLabels) {
    const skip = labelSkip(categories.length, plotWidth, xLabelMinSpacing);
    tickIndices = tickIndices.filter((i) => i % skip === 0);
    if (last > 0 && tickIndices.at(-1) !== last) {
      if (last - tickIndices.at(-1)! < skip && tickIndices.length > 1) tickIndices.pop();
      tickIndices.push(last);
    }
  }
  const xTicks = tickIndices
    .map((i) => ({ i, text: formatXTick ? formatXTick(categories[i], i) : categories[i] }))
    .filter((t) => t.text !== "");
  // Only the true first and last categories sit at the plot edges, so only
  // they anchor inwards; every other label centres on its point.
  const tickAnchor = (i: number) =>
    last < 1 ? "middle" : i === 0 ? "start" : i === last ? "end" : "middle";

  const activate = interactive
    ? (si: number, pi: number) => {
        selection.toggle({ series: si, point: pi });
        onPointClick?.(si, pi, series[si].data[pi]);
      }
    : undefined;

  const roving = useRovingFocus({
    counts: series.map((s) => s.data.length),
    itemKeys: HORIZONTAL_KEYS,
    rowKeys: VERTICAL_KEYS,
    onActivate: activate,
  });

  const rawValues = series.flatMap((s) => s.data);
  const [rawMin, rawMax] = rawValues.length ? extent(rawValues) : [0, 0];
  const named = categories.filter(Boolean);
  const summary = labels.summary(
    {
      type: "line",
      series: series.length,
      points: rawValues.length,
      x: named.length ? [named[0], named[named.length - 1]] : undefined,
      y: rawValues.length ? [format(rawMin), format(rawMax)] : undefined,
    },
    n,
  );

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
        series.length > 1 && (
          <ChartLegend
            marker
            items={series.map((s, i) => ({ label: s.name, color: s.color ?? seriesColor(i) }))}
          />
        )
      }
      table={{
        caption: labels.tableCaption(frame.title),
        headers: [labels.periodColumn, ...series.map((s) => s.name)],
        rows: categories.map((label, i) => ({
          key: i,
          cells: [label, ...series.map((s) => (s.data[i] === undefined ? "" : format(s.data[i])))],
        })),
      }}
    >
      <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>
        {yTicks.map((tick) => (
          <g key={tick} transform={`translate(0, ${yScale(tick)})`}>
            {showHGrid && <line x1={0} x2={plotWidth} className="raster-chart__grid" />}
            <text x={-8} dy="0.35em" textAnchor="end" className="raster-chart__tick">
              {format(tick)}
            </text>
          </g>
        ))}

        {showVGrid &&
          categories.map((_, i) => (
            <line
              key={i}
              x1={xScale(i)}
              x2={xScale(i)}
              y1={0}
              y2={plotHeight}
              className="raster-chart__grid"
            />
          ))}
        {xTicks.map(({ i, text }) => (
          <text
            key={i}
            x={xScale(i)}
            y={plotHeight + 20}
            textAnchor={tickAnchor(i)}
            className="raster-chart__tick"
          >
            {text}
          </text>
        ))}

        <line
          x1={0}
          x2={plotWidth}
          y1={plotHeight}
          y2={plotHeight}
          className="raster-chart__axis"
        />

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

        {/* Series (reversed when stacked so the first series is on top) */}
        {(stacked ? [...series].toReversed() : series).map((s, rawIdx) => {
          const si = stacked ? series.length - 1 - rawIdx : rawIdx;
          const color = s.color ?? seriesColor(si);
          const points = stackedData[si].map((v, i) => ({ x: xScale(i), y: yScale(v) }));
          if (!points.length) return null;

          const linePath =
            curve === "smooth"
              ? catmullRomPath(points)
              : `M ${points.map((p) => `${p.x} ${p.y}`).join(" L ")}`;

          let areaPath: string | undefined;
          if (area) {
            const baseline =
              stacked && si > 0
                ? stackedData[si - 1].map((v, i) => ({ x: xScale(i), y: yScale(v) })).toReversed()
                : [
                    { x: points[points.length - 1].x, y: plotHeight },
                    { x: points[0].x, y: plotHeight },
                  ];
            const baselinePath =
              curve === "smooth" && stacked && si > 0
                ? catmullRomPath(baseline.toReversed()).replace(/^M/, "L")
                : `L ${baseline.map((p) => `${p.x} ${p.y}`).join(" L ")}`;
            areaPath = `${linePath} ${baselinePath} Z`;
          }

          // Line length for the draw-in animation.
          const lineLength = points.reduce(
            (len, p, j) =>
              j === 0 ? 0 : len + Math.hypot(p.x - points[j - 1].x, p.y - points[j - 1].y),
            0,
          );

          return (
            <g
              key={s.name}
              role="group"
              aria-label={labels.series(s.name, s.data.length, n)}
              data-series={(si % 8) + 1}
            >
              {areaPath && <path d={areaPath} fill={color} className="raster-line__area" />}
              <path
                d={linePath}
                stroke={color}
                className="raster-line__line"
                style={
                  {
                    "--line-length": `${lineLength}`,
                    strokeDasharray: `${lineLength}`,
                  } as React.CSSProperties
                }
              />
              {points.map((p, pi) => {
                const selected = selection.isSelected({ series: si, point: pi });
                return (
                  <path
                    key={pi}
                    d={markerPath(si, p.x, p.y, 3.5)}
                    fill={color}
                    className="raster-line__point"
                    {...markProps({
                      label: labels.mark(
                        {
                          series: s.name,
                          x: categories[pi] ?? "",
                          y: format(s.data[pi]),
                          index: pi,
                          count: s.data.length,
                        },
                        n,
                      ),
                      row: si,
                      item: pi,
                      roving,
                      tooltip,
                      onActivate: activate,
                      selected,
                      dimmed: selection.selected !== null && !selected,
                    })}
                  />
                );
              })}
            </g>
          );
        })}
      </g>
    </ChartFrame>
  );
}
