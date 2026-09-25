import { useId } from "react";
import type React from "react";
import { cn } from "../../utils/cn.js";
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
};

export type ChartFrameProps = Omit<ChartFrameOptions, "labels"> & {
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
  table: ChartTableData;
  // oxlint-disable-next-line no-explicit-any
  selection?: Selection<any>;
  children: React.ReactNode;
};

/**
 * Shared chart structure:
 *
 * `div[role=figure]` (named by the visible title, described by a generated
 * summary) › `svg[role=group][aria-roledescription=chart]` › legend › data
 * table disclosure › live region. Escape inside the figure dismisses the
 * tooltip and clears the selection, and stops there when it did either, so a
 * surrounding dialog stays open.
 */
export function ChartFrame({
  title,
  hideTitle,
  labels,
  dataTable,
  className,
  summary,
  plotRef,
  plotStyle,
  width,
  height,
  svgClassName,
  tooltip,
  legend,
  table,
  selection,
  children,
}: ChartFrameProps) {
  const id = useId();
  const titleId = `${id}-title`;
  const summaryId = `${id}-summary`;

  return (
    <div
      role="figure"
      aria-labelledby={titleId}
      aria-describedby={summaryId}
      className={cn("raster-chart", className)}
      onKeyDown={(e) => {
        if (e.key !== "Escape") return;
        const hadTip = !!tooltip?.tooltipProps.visible;
        if (hadTip) tooltip.hide();
        const cleared = !!selection?.clear();
        if (hadTip || cleared) e.stopPropagation();
      }}
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
        <svg
          className={cn("raster-chart__svg", svgClassName)}
          width="100%"
          height="100%"
          viewBox={`0 0 ${width} ${height}`}
          role="group"
          aria-roledescription={labels.chart}
          aria-labelledby={titleId}
        >
          {children}
        </svg>
        {tooltip && <ChartTooltip id={tooltip.tooltipId} {...tooltip.tooltipProps} decorative />}
      </div>
      {legend}
      <ChartDataTable {...table} labels={labels} mode={dataTable} describedBy={titleId} />
      <div role="status" className="raster-sr-only" style={SR_ONLY_STYLE}>
        {selection?.announcement}
      </div>
    </div>
  );
}
