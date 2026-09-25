import { extent, linearScale, markerPath, ticks, labelSkip } from "../../utils/chart-math.js";
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
    /** Formats x and y values. Default: `Intl.NumberFormat(labels.locale)`. */
    formatValue?: NumberFormat;
    /** Passing this (or `onSelect`/`selectedIndex`) makes points toggle buttons. */
    onPointClick?: (point: ScatterPoint, seriesIndex: number, pointIndex: number) => void;
    /** `point` is the index in the series' `data`. */
    selectedIndex?: ScatterPointIndex | null;
    onSelect?: (index: ScatterPointIndex | null) => void;
    exportRef?: React.Ref<ChartExportHandle>;
  };

const MARGIN = { top: 8, right: 8, bottom: 40, left: 50 };

export function ScatterChart({
  data,
  series: seriesProp,
  xLabel,
  yLabel,
  grid = "both",
  formatValue,
  onPointClick,
  selectedIndex,
  onSelect,
  height,
  aspectRatio,
  exportRef,
  labels: labelOverrides,
  ...frame
}: ScatterChartProps) {
  const { plotRef, labels, n, format, tooltip } = useChart(labelOverrides, formatValue, exportRef);
  const selection = useSelection<ScatterPointIndex>(selectedIndex, onSelect, labels);
  const interactive = !!(onPointClick || onSelect || selectedIndex !== undefined);

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

  const [xMin, xMax] = allPoints.length ? extent(allPoints.map((p) => p.x)) : [0, 1];
  const [yMin, yMax] = allPoints.length ? extent(allPoints.map((p) => p.y)) : [0, 1];

  const xScale = linearScale([xMin, xMax], [0, plotWidth]);
  const yScale = linearScale([yMin, yMax], [plotHeight, 0]);
  const xTicks = ticks(xMin, xMax, 5);
  const yTicks = ticks(yMin, yMax, 5);
  const xTickSkip = labelSkip(xTicks.length, plotWidth, 40);

  const showHGrid = grid === "horizontal" || grid === "both";
  const showVGrid = grid === "vertical" || grid === "both";

  const activate = interactive
    ? (si: number, item: number) => {
        const pi = order[si][item];
        selection.toggle({ series: si, point: pi });
        onPointClick?.(series[si].data[pi], si, pi);
      }
    : undefined;

  const roving = useRovingFocus({
    counts: series.map((s) => s.data.length),
    itemKeys: HORIZONTAL_KEYS,
    rowKeys: VERTICAL_KEYS,
    onActivate: activate,
  });

  const summary = labels.summary(
    {
      type: "scatter",
      series: series.length,
      points: allPoints.length,
      x: allPoints.length ? [format(xMin), format(xMax)] : undefined,
      y: allPoints.length ? [format(yMin), format(yMax)] : undefined,
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
            swatch="dot"
            marker
            items={series.map((s, i) => ({ label: s.name, color: s.color ?? seriesColor(i) }))}
          />
        )
      }
      table={{
        caption: labels.tableCaption(frame.title),
        // A point may have no label and a multi-series row no unique key, so
        // no cell is guaranteed to identify its row.
        rowHeaders: false,
        headers: [
          ...(series.length > 1 ? ["Series"] : []),
          ...(hasPointLabels ? ["Label"] : []),
          xLabel ?? "X",
          yLabel ?? "Y",
        ],
        rows: series.flatMap((s, si) =>
          s.data.map((p, i) => ({
            key: `${si}-${i}`,
            cells: [
              ...(series.length > 1 ? [s.name] : []),
              ...(hasPointLabels ? [p.label ?? ""] : []),
              format(p.x),
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

        {xTicks.map((tick, i) => (
          <g key={`x-${tick}`}>
            {showVGrid && (
              <line
                x1={xScale(tick)}
                x2={xScale(tick)}
                y1={0}
                y2={plotHeight}
                className="raster-chart__grid"
              />
            )}
            {i % xTickSkip === 0 && (
              <text
                x={xScale(tick)}
                y={plotHeight + 16}
                textAnchor="middle"
                className="raster-chart__tick"
              >
                {format(tick)}
              </text>
            )}
          </g>
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
            const x = format(p.x);
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
      </g>
    </ChartFrame>
  );
}
