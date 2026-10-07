import {
  catmullRomPath,
  compactPath,
  decimate,
  polylinePath,
  extent,
  linearScale,
  markerPath,
  ticks,
  labelSkip,
} from "../../utils/chart-math.js";
import type { NumberFormat } from "../../utils/labels.js";
import type { XAxis, XTick } from "../../utils/time.js";
import { seriesColor } from "../../utils/palette.js";
import type { ChartExportHandle } from "../../utils/use-chart-export.js";

export type { ChartExportHandle, ReferenceLine, XAxis };
import { plotSize, useContainerWidth } from "../../utils/use-container-width.js";
import type { PlotSizeOptions } from "../../utils/use-container-width.js";
import { HORIZONTAL_KEYS, VERTICAL_KEYS, useRovingFocus } from "../../utils/use-roving-focus.js";
import { useSelection } from "../../utils/use-selection.js";
import { ChartFrame } from "../shared/ChartFrame.js";
import type { ChartFrameOptions } from "../shared/ChartFrame.js";
import { ChartLegend } from "../shared/ChartLegend.js";
import { ReferenceLines, referenceCaption } from "../shared/ReferenceLines.js";
import type { PlacedReference, ReferenceLine } from "../shared/ReferenceLines.js";
import { markProps, useChart } from "../shared/use-chart.js";
import { DenseOverlay } from "./DenseOverlay.js";

export type LineSeries = {
  name: string;
  data: number[];
  color?: string;
};

type GridOption = "horizontal" | "vertical" | "both" | "none";

export type LinePointIndex = { series: number; point: number };

export type LineChartProps = ChartFrameOptions &
  PlotSizeOptions &
  (
    | {
        /**
         * X-axis categories, one per data point, evenly spaced. They name each
         * point and label the data table, so keep them complete: use
         * `xTickFilter`/`formatXTick` to thin or shorten the axis labels. (A
         * `""` category still hides its tick, but also leaves that point
         * without an x value in its name.)
         */
        categories: string[];
        x?: never;
      }
    | {
        /**
         * A date axis instead of categories: `timeAxis(dates, options)` from
         * `@eekodigital/raster/time`. Points are spaced by elapsed time, ticks
         * fall on calendar boundaries, and the line breaks at gaps.
         */
        x: XAxis;
        categories?: never;
      }
  ) & {
    series: LineSeries[];
    /**
     * Which x-axis ticks to label, by category index. Replaces the automatic
     * thinning (`xLabelMinSpacing`). Points and the table keep every category.
     * Categories only.
     */
    xTickFilter?: (index: number, category: string) => boolean;
    /** Text for an x-axis tick. Return `""` to hide it. Default: the category. Categories only. */
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
     * Default 30 for categories; a time axis estimates it from its labels.
     */
    xLabelMinSpacing?: number;
    /** Passing this (or `onSelect`/`selectedIndex`) makes points toggle buttons. */
    onPointClick?: (seriesIndex: number, pointIndex: number, value: number) => void;
    selectedIndex?: LinePointIndex | null;
    onSelect?: (index: LinePointIndex | null) => void;
    exportRef?: React.Ref<ChartExportHandle>;
    /**
     * Dense mode for long series: each series is one downsampled path with no
     * per-point marks, and a single slider steps through the points. `true` or
     * `false` forces it; a number is the threshold. Default: on when a series
     * has more than 200 points.
     */
    dense?: boolean | number;
    /** Targets, thresholds or goals (`axis: "x"` needs a time axis): dashed, labelled lines, named in the summary and table caption. */
    referenceLines?: ReferenceLine[];
  };

const MARGIN = { top: 8, right: 8, bottom: 40, left: 50 };

export function LineChart({
  series,
  categories,
  x,
  area = false,
  stacked = false,
  curve = "linear",
  xLabel,
  yLabel,
  grid = "horizontal",
  formatValue,
  xLabelMinSpacing,
  xTickFilter,
  formatXTick,
  onPointClick,
  selectedIndex,
  onSelect,
  height: heightProp,
  aspectRatio,
  exportRef,
  labels: labelOverrides,
  dense,
  referenceLines = [],
  ...frame
}: LineChartProps) {
  const { plotRef, labels, n, format, tooltip } = useChart(labelOverrides, formatValue, exportRef);
  const selection = useSelection<LinePointIndex>(selectedIndex, onSelect, labels);
  const interactive = !!(onPointClick || onSelect || selectedIndex !== undefined);
  const longest = Math.max(0, ...series.map((s) => s.data.length));
  const isDense = typeof dense === "boolean" ? dense : longest > (dense ?? 200);

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
  // The value scale reaches every horizontal reference line.
  const yRefs = referenceLines.filter((r) => r.axis !== "x").map((r) => +r.value);
  const yMin = Math.min(0, minVal, ...yRefs);
  const yMax = Math.max(maxVal, 1, ...yRefs);

  const showHGrid = grid === "horizontal" || grid === "both";
  const showVGrid = grid === "vertical" || grid === "both";

  // Each point's x as text: its category, or its formatted date.
  const names = x ? x.names(labels.locale) : categories!;
  const count = names.length;
  const xScale = (i: number) =>
    x ? x.position(i, plotWidth) : count <= 1 ? plotWidth / 2 : (i / (count - 1)) * plotWidth;
  const yScale = linearScale([yMin, yMax], [plotHeight, 0]);
  const yTicks = ticks(yMin, yMax, 4);
  // Vertical lines need a time axis, and are left out when off the plot.
  const references = referenceLines.flatMap((r): PlacedReference[] => {
    const v = typeof r.value === "string" && r.axis === "x" ? Date.parse(r.value) : +r.value;
    if (r.axis !== "x")
      return [{ at: yScale(v), vertical: false, text: labels.referenceLine(r.label, format(v)) }];
    const at = x ? x.at(v, plotWidth) : NaN;
    return at >= 0 && at <= plotWidth
      ? [{ at, vertical: true, text: labels.referenceLine(r.label, x!.format(v, labels.locale)) }]
      : [];
  });
  const referenceTexts = references.map((r) => r.text);
  // Which ticks get a label. A filter wins; otherwise defer to consumers who
  // pre-decimated with "" categories; otherwise thin by width, always keeping
  // the last category (and dropping the one before it if that would crowd it).
  // A time axis places its own ticks.
  const last = count - 1;
  const hasManualXLabels = names.some((l) => l === "");
  let tickIndices = x ? [] : names.map((_, i) => i);
  if (!x) {
    if (xTickFilter) {
      tickIndices = tickIndices.filter((i) => xTickFilter(i, names[i]));
    } else if (!hasManualXLabels) {
      const skip = labelSkip(count, plotWidth, xLabelMinSpacing ?? 30);
      tickIndices = tickIndices.filter((i) => i % skip === 0);
      if (last > 0 && tickIndices.at(-1) !== last) {
        if (last - tickIndices.at(-1)! < skip && tickIndices.length > 1) tickIndices.pop();
        tickIndices.push(last);
      }
    }
  }
  // Only the true first and last categories sit at the plot edges, so only
  // they anchor inwards; every other label centres on its point.
  const xTicks = x
    ? x.ticks(plotWidth, labels.locale, xLabelMinSpacing)
    : tickIndices
        .map((i): XTick => ({
          x: xScale(i),
          text: formatXTick ? formatXTick(names[i], i) : names[i],
          anchor: last < 1 ? "middle" : i === 0 ? "start" : i === last ? "end" : "middle",
        }))
        .filter((t) => t.text !== "");

  const activate = interactive
    ? (si: number, pi: number) => {
        const point = { series: si, point: pi };
        // A dense chart's slider has no pressed state to report, so announce it.
        selection.toggle(
          point,
          isDense
            ? selection.isSelected(point)
              ? labels.selectionCleared
              : `${pointLabel(si, pi)}, ${labels.selected}`
            : undefined,
        );
        onPointClick?.(si, pi, series[si].data[pi]);
      }
    : undefined;

  const roving = useRovingFocus({
    counts: series.map((s) => s.data.length),
    itemKeys: HORIZONTAL_KEYS,
    rowKeys: VERTICAL_KEYS,
    onActivate: activate,
  });

  const pos = stackedData.map((d) => d.map((v, i) => ({ x: xScale(i), y: yScale(v) })));
  const pointLabel = (si: number, pi: number) =>
    labels.mark(
      {
        series: series[si].name,
        x: names[pi] ?? "",
        y: format(series[si].data[pi]),
        index: pi,
        count: series[si].data.length,
      },
      n,
    );

  const rawValues = series.flatMap((s) => s.data);
  const [rawMin, rawMax] = rawValues.length ? extent(rawValues) : [0, 0];
  const named = names.filter(Boolean);
  const summary = labels.summary(
    {
      type: "line",
      series: series.length,
      points: rawValues.length,
      x: named.length ? [named[0], named[named.length - 1]] : undefined,
      y: rawValues.length ? [format(rawMin), format(rawMax)] : undefined,
      references: referenceTexts,
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
      tooltip={isDense ? undefined : tooltip}
      legend={
        series.length > 1 && (
          <ChartLegend
            marker
            items={series.map((s, i) => ({ label: s.name, color: s.color ?? seriesColor(i) }))}
          />
        )
      }
      overlay={
        isDense && (
          <DenseOverlay
            width={size.width}
            height={size.height}
            left={MARGIN.left}
            top={MARGIN.top}
            plotWidth={plotWidth}
            plotHeight={plotHeight}
            pos={pos}
            xs={names.map((_, i) => xScale(i))}
            series={series.map((s, i) => ({ name: s.name, color: s.color ?? seriesColor(i) }))}
            label={pointLabel}
            selectedText={labels.selected}
            selection={selection}
            activate={activate}
          />
        )
      }
      table={{
        caption: referenceCaption(labels.tableCaption(frame.title), referenceTexts, labels),
        headers: [x ? labels.dateColumn : labels.periodColumn, ...series.map((s) => s.name)],
        rows: names.map((label, i) => ({
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
          (x ? xTicks.map((t) => t.x) : names.map((_, i) => xScale(i))).map((gx, i) => (
            <line key={i} x1={gx} x2={gx} y1={0} y2={plotHeight} className="raster-chart__grid" />
          ))}
        {xTicks.map((t, i) => (
          <text
            key={i}
            x={t.x}
            y={plotHeight + 20}
            textAnchor={t.anchor}
            className="raster-chart__tick"
          >
            {t.text}
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
          // Each point carries its area baseline: the series below, or the x axis.
          const below = stacked && si > 0 && stackedData[si - 1];
          const points = pos[si].map((p, i) => ({
            ...p,
            b: below ? yScale(below[i]) : plotHeight,
          }));
          if (!points.length) return null;

          // Runs of points the line joins: a time axis breaks it at gaps.
          const runs: (typeof points)[] = [];
          points.forEach((p, i) => {
            if (!i || x?.gap(i)) runs.push([]);
            runs[runs.length - 1].push(p);
          });
          // Dense lines are straight (curves can't be seen at that density),
          // downsampled and compact.
          const drawn = isDense ? runs.map(decimate) : runs;
          const path = isDense ? compactPath : curve === "smooth" ? catmullRomPath : polylinePath;
          const linePath = drawn.map(path).join(" ");
          // Each run's area closes along its baseline, right to left.
          const areaPath =
            area &&
            drawn
              .map(
                (r) =>
                  `${path(r)} ${path(
                    (below ? r : [r[0], r[r.length - 1]])
                      .map((p) => ({ x: p.x, y: p.b }))
                      .toReversed(),
                  ).replace(/^M/, "L")} Z`,
              )
              .join(" ");

          // Length of the drawn line, for the draw-in animation.
          const lineLength = drawn.reduce(
            (len, r) =>
              r.reduce(
                (l, p, j) => (j ? l + Math.hypot(p.x - r[j - 1].x, p.y - r[j - 1].y) : l),
                len,
              ),
            0,
          );

          return (
            <g
              key={s.name}
              role={isDense ? undefined : "group"}
              aria-label={isDense ? undefined : labels.series(s.name, s.data.length, n)}
              data-series={(si % 8) + 1}
            >
              {areaPath && <path d={areaPath} fill={color} className="raster-line__area" />}
              <path
                d={linePath}
                stroke={color}
                className={
                  isDense ? "raster-line__line raster-line__line--dense" : "raster-line__line"
                }
                style={
                  {
                    "--line-length": `${lineLength}`,
                    strokeDasharray: `${lineLength}`,
                  } as React.CSSProperties
                }
              />
              {isDense && runs.some((r) => r.length === 1) && (
                // Points a gap leaves on their own would otherwise vanish.
                <path
                  d={runs
                    .filter((r) => r.length === 1)
                    .map((r) => markerPath(si, r[0].x, r[0].y, 2))
                    .join("")}
                  fill={color}
                  className="raster-line__dots"
                  aria-hidden="true"
                />
              )}
              {!isDense &&
                points.map((p, pi) => {
                  const selected = selection.isSelected({ series: si, point: pi });
                  return (
                    <path
                      key={pi}
                      d={markerPath(si, p.x, p.y, 3.5)}
                      fill={color}
                      className="raster-line__point"
                      {...markProps({
                        label: pointLabel(si, pi),
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

        <ReferenceLines lines={references} plotWidth={plotWidth} plotHeight={plotHeight} />
      </g>
    </ChartFrame>
  );
}
