import { extent, linearScale, markerPath, ticks, labelSkip } from "../../utils/chart-math.js";
import type { NumberFormat } from "../../utils/labels.js";
import type { XAxis, XTick } from "../../utils/time.js";
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
import type { NumericReferenceLine } from "../shared/ReferenceLines.js";
import { markProps, useChart } from "../shared/use-chart.js";
import type { MarkClick } from "../shared/use-chart.js";

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

export type ScatterPointIndex = { series: number; point: number };

export type ScatterChartProps = ChartFrameOptions &
  PlotSizeOptions & {
    /** Single series — pass an array of points. */
    data?: ScatterPoint[];
    /** Multi-series — pass named series. */
    series?: ScatterSeries[];
    xLabel?: string;
    yLabel?: string;
    grid?: GridOption;
    /** Formats y values, and x values unless `formatX` is set. Default: `Intl.NumberFormat(labels.locale)`. */
    formatValue?: NumberFormat;
    /**
     * Formats x values in ticks, point names, the table and the summary, e.g.
     * dates from epoch ms. Default: `formatValue`.
     */
    formatX?: NumberFormat;
    /**
     * A date axis for x: `timeAxis(points.map((p) => p.x))` from
     * `@eekodigital/raster/time`, with x values as epoch ms. Ticks fall on
     * calendar boundaries and x values are worded as dates. Overrides `formatX`.
     */
    xAxis?: XAxis;
    /**
     * Called when a mark is clicked (or activated with Enter/Space), with its
     * index (as `onSelect` gives it), value (its y) and point. Passing this (or
     * `onSelect`/`selectedIndex`) makes marks toggle buttons.
     */
    onMarkClick?: (mark: MarkClick<ScatterPointIndex, ScatterPoint>) => void;
    /** `point` is the index in the series' `data`. */
    selectedIndex?: ScatterPointIndex | null;
    onSelect?: (index: ScatterPointIndex | null) => void;
    /** Targets, thresholds or goals: dashed, labelled lines across y (or x with `axis: "x"`), named in the summary and table caption. */
    referenceLines?: NumericReferenceLine[];
  };

const MARGIN = { top: 8, right: 8, bottom: 40, left: 50 };

export function ScatterChart({
  data,
  series: seriesProp,
  xLabel,
  yLabel,
  grid = "both",
  formatValue,
  formatX,
  xAxis,
  onMarkClick,
  selectedIndex,
  onSelect,
  height,
  aspectRatio,
  labels: labelOverrides,
  referenceLines = [],
  ...frame
}: ScatterChartProps) {
  const { plotRef, labels, n, format, tooltip, describe } = useChart(labelOverrides, formatValue);
  const selection = useSelection<ScatterPointIndex>(selectedIndex, onSelect, labels);
  const interactive = !!(onMarkClick || onSelect || selectedIndex !== undefined);

  const fx = xAxis ? (v: number) => xAxis.format(v, labels.locale) : (formatX ?? format);
  const series: ScatterSeries[] = seriesProp ?? (data ? [{ name: "Data", data }] : []);
  const named = !!seriesProp;
  const allPoints = series.flatMap((s) => s.data);
  const hasPointLabels = allPoints.some((p) => p.label);
  // Keyboard order follows x, so Left/Right match the drawing.
  const order = series.map((s) =>
    s.data.map((_, i) => i).sort((a, b) => s.data[a].x - s.data[b].x),
  );

  const size = plotSize(useContainerWidth(plotRef, 720), { height, aspectRatio }, 240);
  const plotWidth = size.width - MARGIN.left - MARGIN.right;
  const plotHeight = size.height - MARGIN.top - MARGIN.bottom;

  // The data's range (for the summary), and the scales' range, which also
  // reaches every reference line.
  const xs = allPoints.map((p) => p.x);
  const ys = allPoints.map((p) => p.y);
  const [dataXMin, dataXMax] = xs.length ? extent(xs) : [0, 1];
  const [dataYMin, dataYMax] = ys.length ? extent(ys) : [0, 1];
  const [xMin, xMax] = extent([dataXMin, dataXMax, ...referenceValues(referenceLines, "x")]);
  const [yMin, yMax] = extent([dataYMin, dataYMax, ...referenceValues(referenceLines, "y")]);

  // A date axis places points and ticks on its own (calendar) scale.
  const xScale = xAxis
    ? (v: number) => xAxis.at(v, plotWidth)
    : linearScale([xMin, xMax], [0, plotWidth]);
  const yScale = linearScale([yMin, yMax], [plotHeight, 0]);
  const xTicks = xAxis ? [] : ticks(xMin, xMax, 5);
  const yTicks = ticks(yMin, yMax, 5);
  // Custom x labels (e.g. dates) can be wider than numbers: thin by their
  // estimated width (7 px a character, plus a gap).
  const xTickSkip = labelSkip(
    xTicks.length,
    plotWidth,
    formatX ? Math.max(40, ...xTicks.map((t) => fx(t).length * 7 + 12)) : 40,
  );
  const xLabels: XTick[] = xAxis
    ? xAxis.ticks(plotWidth, labels.locale)
    : xTicks
        .filter((_, i) => i % xTickSkip === 0)
        .map((t) => ({ x: xScale(t), text: fx(t), anchor: "middle" }));
  const xGrid = xAxis ? xLabels.map((t) => t.x) : xTicks.map(xScale);

  const showHGrid = grid === "horizontal" || grid === "both";
  const showVGrid = grid === "vertical" || grid === "both";

  const activate = interactive
    ? (si: number, item: number) => {
        const pi = order[si][item];
        selection.toggle({ series: si, point: pi });
        const p = series[si].data[pi];
        onMarkClick?.({ index: { series: si, point: pi }, value: p.y, datum: p });
      }
    : undefined;

  const roving = useRovingFocus({
    counts: series.map((s) => s.data.length),
    itemKeys: HORIZONTAL_KEYS,
    rowKeys: VERTICAL_KEYS,
    onActivate: activate,
  });

  const references = placeReferences(
    referenceLines,
    (r) =>
      Number.isFinite(r.value)
        ? r.axis === "x"
          ? [xScale(r.value), fx(r.value)]
          : [yScale(r.value), format(r.value)]
        : null,
    plotWidth,
    plotHeight,
    labels,
  );
  const referenceTexts = references.map((r) => r.text);

  const summary = describe({
    type: "scatter",
    series: series.length,
    points: allPoints.length,
    x: allPoints.length ? [fx(dataXMin), fx(dataXMax)] : undefined,
    y: allPoints.length ? [format(dataYMin), format(dataYMax)] : undefined,
    references: referenceTexts,
  });

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
        series.length > 1 && (
          <ChartLegend
            swatch="dot"
            marker
            items={series.map((s, i) => ({ label: s.name, color: s.color ?? seriesColor(i) }))}
          />
        )
      }
      table={{
        caption: referenceCaption(labels.tableCaption(frame.title), referenceTexts, labels),
        // A point may have no label and a multi-series row no unique key, so
        // no cell is guaranteed to identify its row.
        rowHeaders: false,
        headers: [
          ...(series.length > 1 ? [labels.seriesColumn] : []),
          ...(hasPointLabels ? [labels.labelColumn] : []),
          xLabel ?? labels.xColumn,
          yLabel ?? labels.yColumn,
        ],
        rows: series.flatMap((s, si) =>
          s.data.map((p, i) => ({
            key: `${si}-${i}`,
            cells: [
              ...(series.length > 1 ? [s.name] : []),
              ...(hasPointLabels ? [p.label ?? ""] : []),
              fx(p.x),
              format(p.y),
            ],
          })),
        ),
      }}
    >
      <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>
        {yTicks.map((tick) => (
          <g key={`y-${tick}`} transform={`translate(0, ${yScale(tick)})`}>
            {showHGrid && <line x1={0} x2={plotWidth} className="raster-chart__grid" />}
            <text x={-8} dy="0.35em" textAnchor="end" className="raster-chart__tick">
              {format(tick)}
            </text>
          </g>
        ))}

        {showVGrid &&
          xGrid.map((gx, i) => (
            <line
              key={`xg-${i}`}
              x1={gx}
              x2={gx}
              y1={0}
              y2={plotHeight}
              className="raster-chart__grid"
            />
          ))}
        {xLabels.map((t, i) => (
          <text
            key={`x-${i}`}
            x={t.x}
            y={plotHeight + 16}
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
        <line x1={0} x2={0} y1={0} y2={plotHeight} className="raster-chart__axis" />

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

        {series.map((s, si) => {
          const color = s.color ?? seriesColor(si);
          const points = order[si].map((pi, item) => {
            const p = s.data[pi];
            const x = fx(p.x);
            const selected = selection.isSelected({ series: si, point: pi });
            return (
              <path
                key={pi}
                d={markerPath(si, xScale(p.x), yScale(p.y), 4)}
                fill={color}
                className="raster-scatter__point"
                style={{ animationDelay: `${Math.min(pi, 50) * 20}ms` }}
                {...markProps({
                  label: labels.mark(
                    {
                      series: named ? s.name : undefined,
                      x: p.label ? `${p.label} (${x})` : x,
                      y: format(p.y),
                      index: item,
                      count: s.data.length,
                    },
                    n,
                  ),
                  row: si,
                  item,
                  roving,
                  tooltip,
                  onActivate: activate,
                  selected,
                  dimmed: selection.selected !== null && !selected,
                })}
              />
            );
          });
          return named ? (
            <g
              key={si}
              role="group"
              aria-label={labels.series(s.name, s.data.length, n)}
              data-series={(si % 8) + 1}
            >
              {points}
            </g>
          ) : (
            <g key={si} data-series={1}>
              {points}
            </g>
          );
        })}
        <ReferenceLines lines={references} plotWidth={plotWidth} plotHeight={plotHeight} />
      </g>
    </SvgChartFrame>
  );
}
