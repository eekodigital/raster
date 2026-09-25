import { useImperativeHandle, useRef } from "react";
import type React from "react";
import { numberFormatter, resolveLabels } from "../../utils/labels.js";
import type { ChartLabels, NumberFormat } from "../../utils/labels.js";
import { useChartExport } from "../../utils/use-chart-export.js";
import type { ChartExportHandle } from "../../utils/use-chart-export.js";
import type { useRovingFocus } from "../../utils/use-roving-focus.js";
import { useChartTooltip } from "../ChartTooltip/ChartTooltip.js";

type Tooltip = ReturnType<typeof useChartTooltip>;

/** Wiring every framed chart shares: labels, number format, tooltip, export. */
export function useChart(
  labelOverrides: Partial<ChartLabels> | undefined,
  formatValue: NumberFormat | undefined,
  exportRef: React.Ref<ChartExportHandle> | undefined,
) {
  const plotRef = useRef<HTMLDivElement>(null);
  const exportHandle = useChartExport(plotRef);
  useImperativeHandle(exportRef, () => exportHandle, [exportHandle]);
  const labels = resolveLabels(labelOverrides);
  const n = numberFormatter(labels.locale);
  const tooltip = useChartTooltip();
  return { plotRef, labels, n, format: formatValue ?? n, tooltip };
}

type MarkOptions = {
  label: string;
  row: number;
  item: number;
  roving: ReturnType<typeof useRovingFocus>;
  tooltip: Tooltip;
  /** Marks are `button`s with `aria-pressed` when set; static `img`s otherwise. */
  onActivate?: (row: number, item: number) => void;
  selected?: boolean;
  dimmed?: boolean;
};

/** Role, name, state, focus and tooltip props for one chart mark. */
export function markProps({
  label,
  row,
  item,
  roving,
  tooltip,
  onActivate,
  selected = false,
  dimmed = false,
}: MarkOptions) {
  const tip = tooltip.handlers(label);
  const keepTip = () => {
    if (!selected) tooltip.hide();
  };
  return {
    ...roving.itemProps(row, item, tip.onFocus),
    role: onActivate ? "button" : "img",
    "aria-label": label,
    "aria-pressed": onActivate ? selected : undefined,
    "data-selected": selected ? "" : undefined,
    "data-dimmed": dimmed ? "" : undefined,
    onClick: onActivate ? () => onActivate(row, item) : undefined,
    onBlur: keepTip,
    onMouseEnter: tip.onMouseEnter,
    onMouseLeave: keepTip,
  };
}
