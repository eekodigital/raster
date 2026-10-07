import { useEffect, useRef, useState } from "react";
import {
  catmullRomPath,
  compactPath,
  decimate,
  nearestIndex,
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

export type { ChartExportHandle, XAxis };
import { plotSize, useContainerWidth } from "../../utils/use-container-width.js";
import type { PlotSizeOptions } from "../../utils/use-container-width.js";
import {
  HORIZONTAL_KEYS,
  VERTICAL_KEYS,
  movePosition,
  useRovingFocus,
} from "../../utils/use-roving-focus.js";
import { useSelection } from "../../utils/use-selection.js";
import { SR_ONLY_STYLE } from "../shared/ChartDataTable.js";
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
  ...frame
}: LineChartProps) {
  const { plotRef, labels, n, format, tooltip } = useChart(labelOverrides, formatValue, exportRef);
  const selection = useSelection<LinePointIndex>(selectedIndex, onSelect, labels);
  const interactive = !!(onPointClick || onSelect || selectedIndex !== undefined);
  const longest = Math.max(0, ...series.map((s) => s.data.length));
  const isDense = typeof dense === "boolean" ? dense : longest > (dense ?? 200);
  // Dense mode: the slider's point, and whether its marker shows (focus or hover).
  const [current, setCurrent] = useState<LinePointIndex>({ series: 0, point: 0 });
  const [showing, setShowing] = useState<"" | "focus" | "hover">("");
  const markerRef = useRef<SVGPathElement>(null);

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

  // Each point's x as text: its category, or its formatted date.
  const names = x ? x.names(labels.locale) : categories!;
  const count = names.length;
  const xScale = (i: number) =>
    x ? x.position(i, plotWidth) : count <= 1 ? plotWidth / 2 : (i / (count - 1)) * plotWidth;
  const yScale = linearScale([yMin, yMax], [plotHeight, 0]);
  const yTicks = ticks(yMin, yMax, 4);
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

  // Dense mode's current point, kept in range as data changes.
  const cs = Math.min(current.series, Math.max(series.length - 1, 0));
  const cp = Math.max(0, Math.min(current.point, (series[cs]?.data.length ?? 0) - 1));
  const currentLabel = isDense && series[cs]?.data.length ? pointLabel(cs, cp) : "";
  const tipVisible = tooltip.tooltipProps.visible;
  useEffect(() => {
    const el = markerRef.current;
    const box = plotRef.current;
    if (isDense && showing && el && box)
      tooltip.show(currentLabel, el.getBoundingClientRect(), box.getBoundingClientRect());
    else if (isDense && tipVisible) tooltip.hide();
    // oxlint-disable-next-line exhaustive-deps -- tipVisible only guards a redundant hide.
  }, [isDense, showing, currentLabel, plotRef, tooltip.show, tooltip.hide]);

  /** Nearest point to the pointer: by x, then the series nearest in y. */
  const pointAt = (e: React.MouseEvent<SVGRectElement>): LinePointIndex | null => {
    const box = e.currentTarget.ownerSVGElement!.getBoundingClientRect();
    const px = e.clientX - box.left - MARGIN.left;
    const py = e.clientY - box.top - MARGIN.top;
    const point = nearestIndex(
      names.map((_, i) => xScale(i)),
      px,
    );
    let best: LinePointIndex | null = null;
    pos.forEach((p, si) => {
      if (
        p[point] &&
        (!best || Math.abs(p[point].y - py) < Math.abs(pos[best.series][point].y - py))
      )
        best = { series: si, point };
    });
    return best;
  };

  // The slider takes the same keys as marks: points along, series up and down.
  const onSliderKey = (e: React.KeyboardEvent) => {
    const to = movePosition(
      series.map((s) => s.data.length),
      { row: cs, item: cp },
      e.key,
      HORIZONTAL_KEYS,
      VERTICAL_KEYS,
    );
    if (to) setCurrent({ series: to.row, point: to.item });
    else if ((e.key === " " || e.key === "Enter") && activate) activate(cs, cp);
    else return;
    e.preventDefault();
  };

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
      overlay={
        isDense &&
        series[cs]?.data.length > 0 && (
          <input
            type="range"
            className="raster-line__slider"
            style={SR_ONLY_STYLE}
            min={0}
            max={series[cs].data.length - 1}
            step={1}
            value={cp}
            aria-label={series[cs].name}
            aria-valuetext={
              selection.isSelected({ series: cs, point: cp })
                ? `${currentLabel}, ${labels.selected}`
                : currentLabel
            }
            onChange={(e) => setCurrent({ series: cs, point: +e.target.value })}
            onKeyDown={onSliderKey}
            onFocus={() => setShowing("focus")}
            onBlur={() => setShowing("")}
          />
        )
      }
      table={{
        caption: labels.tableCaption(frame.title),
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
          const path = isDense
            ? (r: { x: number; y: number }[]) => compactPath(decimate(r))
            : curve === "smooth"
              ? catmullRomPath
              : polylinePath;
          const linePath = runs.map(path).join(" ");
          // Each run's area closes along its baseline, right to left.
          const areaPath =
            area &&
            runs
              .map(
                (r) =>
                  `${path(r)} ${path(
                    (below ? r : [r[0], r[r.length - 1]])
                      .map((p) => ({ x: p.x, y: p.b }))
                      .toReversed(),
                  ).replace(/^M/, "L")} Z`,
              )
              .join(" ");

          // Line length for the draw-in animation. Across gaps it overstates,
          // which only means the line finishes drawing a little early.
          const lineLength = points.reduce(
            (len, p, j) =>
              j === 0 ? 0 : len + Math.hypot(p.x - points[j - 1].x, p.y - points[j - 1].y),
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

        {isDense && (
          <>
            <rect
              className="raster-line__hit"
              width={Math.max(plotWidth, 0)}
              height={Math.max(plotHeight, 0)}
              fill="transparent"
              aria-hidden="true"
              onMouseMove={(e) => {
                const at = pointAt(e);
                if (!at) return;
                setCurrent(at);
                if (!showing) setShowing("hover");
              }}
              onMouseLeave={() => showing === "hover" && setShowing("")}
              onClick={(e) => {
                const at = pointAt(e);
                if (at && activate) activate(at.series, at.point);
              }}
            />
            {[
              showing && { series: cs, point: cp },
              selection.selected && !(showing && selection.isSelected({ series: cs, point: cp }))
                ? selection.selected
                : null,
            ].map((m) => {
              if (!m || !pos[m.series]?.[m.point]) return null;
              const isCurrent = !!showing && m.series === cs && m.point === cp;
              const { x: mx, y: my } = pos[m.series][m.point];
              const focused = isCurrent && showing === "focus";
              return [
                // A drawn focus ring: CSS outlines on scaled SVG shapes land off-centre.
                focused && (
                  <circle
                    key="ring"
                    cx={mx}
                    cy={my}
                    r={9}
                    className="raster-line__ring"
                    aria-hidden="true"
                  />
                ),
                <path
                  key={isCurrent ? "current" : "selected"}
                  ref={isCurrent ? markerRef : undefined}
                  d={markerPath(m.series, mx, my, 3.5)}
                  fill={series[m.series].color ?? seriesColor(m.series)}
                  className="raster-line__point raster-line__marker"
                  aria-hidden="true"
                  data-focused={focused ? "" : undefined}
                  data-selected={selection.isSelected(m) ? "" : undefined}
                />,
              ];
            })}
          </>
        )}
      </g>
    </ChartFrame>
  );
}
