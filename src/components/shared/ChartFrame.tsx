import { useId } from "react";
import type React from "react";
import { cn } from "../../utils/cn.js";
import { resolveLabels } from "../../utils/labels.js";
import type { ChartLabels } from "../../utils/labels.js";
import type { Selection } from "../../utils/use-selection.js";
import { ChartTooltip } from "../ChartTooltip/ChartTooltip.js";
import type { useChartTooltip } from "../ChartTooltip/ChartTooltip.js";
import { ChartDataTable, SR_ONLY_STYLE } from "./ChartDataTable.js";
import type { ChartTableData, DataTableMode } from "./ChartDataTable.js";

/** Props every framed chart accepts. */
export type ChartFrameOptions = {
  /** Visible title. Names the figure and captions the data table. */
  title: string;
  /** Keep the title for assistive technology but hide it visually. */
  hideTitle?: boolean;
  /** Generated strings (English by default) and the number locale. */
  labels?: Partial<ChartLabels>;
  /** How the data table is offered. Default `disclosure`. */
  dataTable?: DataTableMode;
  className?: string;
  /** The chart's figure element, e.g. for `exportSVG` from `@eekodigital/raster/export`. */
  ref?: React.Ref<HTMLDivElement>;
};

/** Props of the public `ChartFrame`, for wrapping a chart raster doesn't draw. */
export type ChartFrameProps = {
  /** Visible title. Names the figure and captions the data table. */
  title: string;
  /** Keep the title for assistive technology but hide it visually. */
  hideTitle?: boolean;
  /** The text alternative: what the chart shows. `describeChart` writes one in raster's words. */
  summary: string;
  /** The data, offered as a table. `caption` defaults to `labels.tableCaption(title)`. */
  table?: Omit<ChartTableData, "caption"> & { caption?: string };
  /** How the data table is offered. Default `disclosure`. */
  dataTable?: DataTableMode;
  /** Generated strings (English by default) and the number locale. */
  labels?: Partial<ChartLabels>;
  /** Shown under the chart. */
  legend?: React.ReactNode;
  className?: string;
  ref?: React.Ref<HTMLDivElement>;
  /** The chart: any SVG, canvas or HTML, rendered as it is. */
  children: React.ReactNode;
};

type FigureProps = Pick<
  ChartFrameProps,
  "ref" | "title" | "hideTitle" | "className" | "summary" | "legend" | "dataTable"
> & {
  labels: ChartLabels;
  table?: ChartTableData;
  plotRef?: React.RefObject<HTMLDivElement | null>;
  plotStyle?: React.CSSProperties;
  onKeyDown?: React.KeyboardEventHandler<HTMLDivElement>;
  /** Live region text; the region is left out when undefined. */
  status?: React.ReactNode;
  /** The plot's content, given the title's id. */
  plot: (titleId: string) => React.ReactNode;
};

/**
 * The accessible figure every chart shares: `div[role=figure]` named by the
 * visible title and described by the summary › plot › legend › data table
 * disclosure › live region.
 */
function Figure({
  ref,
  title,
  hideTitle,
  className,
  summary,
  labels,
  legend,
  table,
  dataTable,
  plotRef,
  plotStyle,
  onKeyDown,
  status,
  plot,
}: FigureProps) {
  const id = useId();
  const titleId = `${id}-title`;
  const summaryId = `${id}-summary`;

  return (
    <div
      ref={ref}
      role="figure"
      aria-labelledby={titleId}
      aria-describedby={summaryId}
      className={cn("raster-chart", className)}
      onKeyDown={onKeyDown}
    >
      <div
        id={titleId}
        className={hideTitle ? "raster-chart__title raster-sr-only" : "raster-chart__title"}
        style={hideTitle ? SR_ONLY_STYLE : undefined}
      >
        {title}
      </div>
      <p id={summaryId} className="raster-sr-only" style={SR_ONLY_STYLE}>
        {summary}
      </p>
      <div ref={plotRef} className="raster-chart__plot" style={plotStyle} data-chart-container>
        {plot(titleId)}
      </div>
      {legend}
      {table && (
        <ChartDataTable {...table} labels={labels} mode={dataTable} describedBy={titleId} />
      )}
      {status !== undefined && (
        <div role="status" className="raster-sr-only" style={SR_ONLY_STYLE}>
          {status}
        </div>
      )}
    </div>
  );
}

/**
 * Raster's accessible frame around a chart it doesn't draw: a figure named by
 * the visible title and described by `summary`, the chart as it is, a legend,
 * and the "Show data table" disclosure, all in the server-rendered HTML. For
 * products that need zoom, brushing or Canvas, which raster doesn't provide.
 */
export function ChartFrame({ labels: overrides, table, children, ...props }: ChartFrameProps) {
  const labels = resolveLabels(overrides);
  return (
    <Figure
      {...props}
      labels={labels}
      table={table && { ...table, caption: table.caption ?? labels.tableCaption(props.title) }}
      plot={() => children}
    />
  );
}

export type SvgChartFrameProps = Omit<ChartFrameOptions, "labels"> & {
  labels: ChartLabels;
  summary: string;
  plotRef: React.RefObject<HTMLDivElement | null>;
  /** CSS size of the plot (height or aspect-ratio), so SSR doesn't shift. */
  plotStyle?: React.CSSProperties;
  /** Drawing size (viewBox). */
  width: number;
  height: number;
  svgClassName?: string;
  /** The chart's tooltip, drawn over the SVG. Decorative: marks already carry the text. */
  tooltip?: ReturnType<typeof useChartTooltip>;
  legend?: React.ReactNode;
  /** HTML over the plot, e.g. a dense chart's focusable slider. */
  overlay?: React.ReactNode;
  table: ChartTableData;
  // oxlint-disable-next-line no-explicit-any
  selection?: Selection<any>;
  children: React.ReactNode;
};

/**
 * Raster's own charts: the figure around an SVG
 * (`svg[role=group][aria-roledescription=chart]`), with the tooltip and live
 * region. Escape inside the figure dismisses the tooltip and clears the
 * selection, and stops there when it did either, so a surrounding dialog
 * stays open.
 */
export function SvgChartFrame({
  width,
  height,
  svgClassName,
  tooltip,
  overlay,
  selection,
  children,
  ...props
}: SvgChartFrameProps) {
  return (
    <Figure
      {...props}
      onKeyDown={(e) => {
        if (e.key !== "Escape") return;
        const hadTip = !!tooltip?.tooltipProps.visible;
        if (hadTip) tooltip.hide();
        const cleared = !!selection?.clear();
        if (hadTip || cleared) e.stopPropagation();
      }}
      status={selection?.announcement ?? ""}
      plot={(titleId) => (
        <>
          <svg
            data-raster-chart=""
            className={cn("raster-chart__svg", svgClassName)}
            width="100%"
            height="100%"
            viewBox={`0 0 ${width} ${height}`}
            role="group"
            aria-roledescription={props.labels.chart}
            aria-labelledby={titleId}
          >
            {children}
          </svg>
          {overlay}
          {tooltip && <ChartTooltip id={tooltip.tooltipId} {...tooltip.tooltipProps} decorative />}
        </>
      )}
    />
  );
}
