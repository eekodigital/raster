import { extent, pieAngles, strokeArcPath, sum } from "../../utils/chart-math.js";
import { cn } from "../../utils/cn.js";
import type { NumberFormat } from "../../utils/labels.js";
import type { ChartExportHandle } from "../../utils/use-chart-export.js";

export type { ChartExportHandle };
import { useContainerWidth } from "../../utils/use-container-width.js";
import { ALL_ARROW_KEYS, useRovingFocus } from "../../utils/use-roving-focus.js";
import { useSelection } from "../../utils/use-selection.js";
import { ChartFrame } from "../shared/ChartFrame.js";
import type { ChartFrameOptions } from "../shared/ChartFrame.js";
import { ChartLegend } from "../shared/ChartLegend.js";
import { markProps, tooltipOverlay, useChart } from "../shared/use-chart.js";

export type DonutDatum = {
  label: string;
  value: number;
  color: string;
};

export type DonutChartProps = ChartFrameOptions & {
  data: DonutDatum[];
  /** Fixed diameter in px. Omit to fill the container's width. */
  size?: number;
  thickness?: number;
  /** Centre content (HTML). */
  children?: React.ReactNode;
  showLegend?: boolean;
  /** Formats values in marks and the table. Default: `Intl.NumberFormat(labels.locale)`. */
  formatValue?: NumberFormat;
  /** Passing this (or `onSelect`/`selectedIndex`) makes segments toggle buttons. */
  onSegmentClick?: (datum: DonutDatum, index: number) => void;
  selectedIndex?: number | null;
  onSelect?: (index: number | null) => void;
  exportRef?: React.Ref<ChartExportHandle>;
};

export function DonutChart({
  data,
  size: sizeProp,
  thickness = 24,
  children,
  showLegend = false,
  formatValue,
  onSegmentClick,
  selectedIndex,
  onSelect,
  exportRef,
  labels: labelOverrides,
  className,
  ...frame
}: DonutChartProps) {
  const { plotRef, labels, n, format, tooltip } = useChart(labelOverrides, formatValue, exportRef);
  const selection = useSelection<number>(selectedIndex, onSelect, labels);
  const interactive = !!(onSegmentClick || onSelect || selectedIndex !== undefined);
  const measured = useContainerWidth(plotRef, 160);
  const size = sizeProp ?? measured;

  const cx = size / 2;
  const outerRadius = size / 2 - 2; // room for the focus ring
  const midRadius = outerRadius - thickness / 2;

  const total = sum(data.map((d) => d.value));
  const angles = pieAngles(data.map((d) => d.value));
  const percent = new Intl.NumberFormat(labels.locale, { style: "percent" }).format;
  const pct = (v: number) => percent(total > 0 ? v / total : 0);
  // Zero-width segments aren't drawn or focusable.
  const visible = data.map((_, i) => i).filter((i) => angles[i].end - angles[i].start >= 0.001);

  const activate = interactive
    ? (_: number, item: number) => {
        const i = visible[item];
        selection.toggle(i);
        onSegmentClick?.(data[i], i);
      }
    : undefined;

  const roving = useRovingFocus({
    counts: [visible.length],
    itemKeys: ALL_ARROW_KEYS,
    wrap: true,
    onActivate: activate,
  });

  const [minVal, maxVal] = data.length ? extent(data.map((d) => d.value)) : [0, 0];
  const summary = labels.summary(
    {
      type: "donut",
      series: 1,
      points: data.length,
      y: data.length ? [format(minVal), format(maxVal)] : undefined,
    },
    n,
  );

  let sweepBefore = 0;

  return (
    <ChartFrame
      {...frame}
      className={cn("raster-donut", className)}
      labels={labels}
      summary={summary}
      plotRef={plotRef}
      plotStyle={sizeProp ? { width: sizeProp, height: sizeProp } : { aspectRatio: "1" }}
      width={size}
      height={size}
      selection={selection}
      overlay={tooltipOverlay(tooltip)}
      legend={
        showLegend && (
          <ChartLegend swatch="dot" items={data.map((d) => ({ label: d.label, color: d.color }))} />
        )
      }
      table={{
        caption: labels.tableCaption(frame.title),
        headers: ["Category", "Value", "Percentage"],
        rows: data.map((d, i) => ({ key: i, cells: [d.label, format(d.value), pct(d.value)] })),
      }}
    >
      {visible.map((i, item) => {
        const d = data[i];
        const { start, end } = angles[i];
        const sweep = end - start;
        const delay = sweepBefore * 200;
        sweepBefore += sweep;
        const selected = selection.isSelected(i);

        return (
          <path
            key={i}
            className="raster-donut__segment"
            data-series={(i % 8) + 1}
            d={strokeArcPath(cx, cx, midRadius, start, end)}
            fill="none"
            stroke={d.color}
            strokeWidth={selected ? thickness + 4 : thickness}
            pathLength={1}
            style={
              {
                "--donut-duration": `${Math.max(sweep * 200, 100)}ms`,
                "--donut-delay": `${delay}ms`,
              } as React.CSSProperties
            }
            {...markProps({
              label: labels.mark(
                {
                  x: d.label,
                  y: `${format(d.value)} (${pct(d.value)})`,
                  index: item,
                  count: visible.length,
                },
                n,
              ),
              row: 0,
              item,
              roving,
              tooltip,
              onActivate: activate,
              selected,
              dimmed: selection.selected !== null && !selected,
            })}
          />
        );
      })}

      {children && (
        <foreignObject x={0} y={0} width={size} height={size}>
          <div className="raster-donut__centre">{children}</div>
        </foreignObject>
      )}
    </ChartFrame>
  );
}
