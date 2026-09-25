import { extent, markerPath } from "../../utils/chart-math.js";
import type { NumberFormat } from "../../utils/labels.js";
import { seriesColor } from "../../utils/palette.js";
import type { ChartExportHandle } from "../../utils/use-chart-export.js";

export type { ChartExportHandle };
import { useContainerWidth } from "../../utils/use-container-width.js";
import { HORIZONTAL_KEYS, VERTICAL_KEYS, useRovingFocus } from "../../utils/use-roving-focus.js";
import { useSelection } from "../../utils/use-selection.js";
import { ChartFrame } from "../shared/ChartFrame.js";
import type { ChartFrameOptions } from "../shared/ChartFrame.js";
import { ChartLegend } from "../shared/ChartLegend.js";
import { markProps, useChart } from "../shared/use-chart.js";

export type RadarSeries = {
  name: string;
  data: number[];
  color?: string;
};

export type RadarPointIndex = { series: number; point: number };

export type RadarChartProps = ChartFrameOptions & {
  axes: string[];
  series: RadarSeries[];
  max?: number;
  /** Fixed diameter in px. Omit to fill the container's width. */
  size?: number;
  levels?: number;
  /** Formats values in marks and the table. Default: `Intl.NumberFormat(labels.locale)`. */
  formatValue?: NumberFormat;
  /** Passing this (or `onSelect`/`selectedIndex`) makes points toggle buttons. */
  onPointClick?: (seriesIndex: number, axisIndex: number, value: number) => void;
  selectedIndex?: RadarPointIndex | null;
  onSelect?: (index: RadarPointIndex | null) => void;
  exportRef?: React.Ref<ChartExportHandle>;
};

function polarToCartesian(cx: number, cy: number, r: number, angleIndex: number, total: number) {
  const angle = (Math.PI * 2 * angleIndex) / total - Math.PI / 2;
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
}

export function RadarChart({
  axes,
  series,
  max: maxProp,
  size: sizeProp,
  levels = 4,
  formatValue,
  onPointClick,
  selectedIndex,
  onSelect,
  exportRef,
  labels: labelOverrides,
  ...frame
}: RadarChartProps) {
  const { plotRef, labels, n, format, tooltip } = useChart(labelOverrides, formatValue, exportRef);
  const selection = useSelection<RadarPointIndex>(selectedIndex, onSelect, labels);
  const interactive = !!(onPointClick || onSelect || selectedIndex !== undefined);

  const measured = useContainerWidth(plotRef, 300);
  const size = sizeProp ?? measured;
  const c = size / 2;
  const radius = Math.max(size / 2 - 40, 0); // margin for labels
  const count = axes.length;
  // One value per axis: extra values have no axis to sit on; missing ones aren't drawn.
  const data = series.map((s) => s.data.slice(0, count));
  const values = data.flat();
  const maxVal = maxProp ?? Math.max(...values, 1);

  const activate = interactive
    ? (si: number, pi: number) => {
        selection.toggle({ series: si, point: pi });
        onPointClick?.(si, pi, data[si][pi]);
      }
    : undefined;

  const roving = useRovingFocus({
    counts: data.map((d) => d.length),
    itemKeys: HORIZONTAL_KEYS,
    rowKeys: VERTICAL_KEYS,
    wrap: true,
    onActivate: activate,
  });

  const [minVal, maxData] = values.length ? extent(values) : [0, 0];
  const summary = labels.summary(
    {
      type: "radar",
      series: series.length,
      points: values.length,
      x: count ? [axes[0], axes[count - 1]] : undefined,
      y: values.length ? [format(minVal), format(maxData)] : undefined,
    },
    n,
  );

  const gridLevels = Array.from({ length: levels }, (_, i) => ((i + 1) / levels) * radius);

  return (
    <ChartFrame
      {...frame}
      labels={labels}
      summary={summary}
      plotRef={plotRef}
      plotStyle={sizeProp ? { width: sizeProp, height: sizeProp } : { aspectRatio: "1" }}
      width={size}
      height={size}
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
        headers: [labels.axisColumn, ...series.map((s) => s.name)],
        rows: axes.map((axis, i) => ({
          key: i,
          cells: [axis, ...data.map((d) => (d[i] === undefined ? "" : format(d[i])))],
        })),
      }}
    >
      {gridLevels.map((r) => (
        <polygon
          key={r}
          points={Array.from({ length: count }, (_, i) => polarToCartesian(c, c, r, i, count))
            .map((p) => `${p.x},${p.y}`)
            .join(" ")}
          className="raster-radar__grid"
        />
      ))}

      {axes.map((axis, i) => {
        const end = polarToCartesian(c, c, radius, i, count);
        const labelPos = polarToCartesian(c, c, radius + 18, i, count);
        return (
          <g key={axis}>
            <line x1={c} y1={c} x2={end.x} y2={end.y} className="raster-chart__axis" />
            <text
              x={labelPos.x}
              y={labelPos.y}
              dy="0.35em"
              className="raster-chart__tick raster-radar__label"
            >
              {axis}
            </text>
          </g>
        );
      })}

      {series.map((s, si) => {
        const color = s.color ?? seriesColor(si);
        const points = data[si].map((v, i) =>
          polarToCartesian(c, c, (v / maxVal) * radius, i, count),
        );
        const polygon = points.map((p) => `${p.x},${p.y}`).join(" ");

        return (
          <g
            key={s.name}
            role="group"
            aria-label={labels.series(s.name, data[si].length, n)}
            data-series={(si % 8) + 1}
          >
            <polygon points={polygon} fill={color} className="raster-radar__area" />
            <polygon points={polygon} stroke={color} className="raster-radar__line" />
            {points.map((p, pi) => {
              const selected = selection.isSelected({ series: si, point: pi });
              return (
                <path
                  key={pi}
                  d={markerPath(si, p.x, p.y, 3.5)}
                  fill={color}
                  className="raster-radar__point"
                  {...markProps({
                    label: labels.mark(
                      {
                        series: s.name,
                        x: axes[pi],
                        y: format(data[si][pi]),
                        index: pi,
                        count: data[si].length,
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
    </ChartFrame>
  );
}
