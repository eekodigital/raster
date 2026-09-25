import { useState, useRef, useCallback, useImperativeHandle, useEffect } from "react";
import { pieAngles, strokeArcPath, sum } from "../../utils/chart-math.js";
import { cn } from "../../utils/cn.js";
import { useChartExport } from "../../utils/use-chart-export.js";
import type { ChartExportHandle } from "../../utils/use-chart-export.js";

export type { ChartExportHandle };
import { useRovingFocus } from "../../utils/use-roving-focus.js";
import { ChartTooltip, useChartTooltip } from "../ChartTooltip/ChartTooltip.js";
import { ChartDataTable } from "../shared/ChartDataTable.js";
import { ChartLegend } from "../shared/ChartLegend.js";

const DONUT_KEYS = {
  next: ["ArrowRight", "ArrowDown"],
  prev: ["ArrowLeft", "ArrowUp"],
} as const;

export type DonutDatum = {
  label: string;
  value: number;
  color: string;
};

export type DonutChartProps = {
  data: DonutDatum[];
  size?: number;
  thickness?: number;
  children?: React.ReactNode;
  showLegend?: boolean;
  onSegmentClick?: (datum: DonutDatum, index: number) => void;
  selectedIndex?: number | null;
  onSelect?: (index: number | null) => void;
  exportRef?: React.Ref<ChartExportHandle>;
  "aria-label": string;
  className?: string;
};

export function DonutChart({
  data,
  size = 160,
  showLegend = false,
  onSegmentClick,
  selectedIndex: controlledSelected,
  onSelect,
  thickness = 24,
  children,
  exportRef,
  "aria-label": ariaLabel,
  className,
}: DonutChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const exportHandle = useChartExport(containerRef);
  useImperativeHandle(exportRef, () => exportHandle, [exportHandle]);
  const { tooltipId, tooltipProps, hide, handlers } = useChartTooltip();

  const [internalSelected, setInternalSelected] = useState<number | null>(null);
  const selected = controlledSelected !== undefined ? controlledSelected : internalSelected;
  const setSelected = useCallback(
    (index: number | null) => {
      if (controlledSelected === undefined) setInternalSelected(index);
      onSelect?.(index);
    },
    [controlledSelected, onSelect],
  );

  useEffect(() => {
    if (selected === null) return;
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setSelected(null);
    }
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [selected, setSelected]);

  const cx = size / 2;
  const cy = size / 2;
  const outerRadius = size / 2 - 2; // 2px margin for focus ring
  const innerRadius = outerRadius - thickness;

  const total = sum(data.map((d) => d.value));
  const angles = pieAngles(data.map((d) => d.value));

  const roving = useRovingFocus({ counts: [data.length], itemKeys: DONUT_KEYS, wrap: true });

  return (
    <div
      ref={containerRef}
      className={cn("raster-donut", className)}
      style={{ width: size, height: size }}
      data-chart-container
    >
      <svg
        className="raster-donut__svg"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={ariaLabel}
      >
        {data.map((d, i) => {
          const { start, end } = angles[i];
          if (end - start < 0.001) return null;

          const pct = total > 0 ? Math.round((d.value / total) * 100) : 0;
          const midRadius = (outerRadius + innerRadius) / 2;
          const path = strokeArcPath(cx, cy, midRadius, start, end);
          const tooltipContent = `${d.label}: ${d.value} (${pct}%)`;
          const tip = handlers(tooltipContent);

          const priorSweep = angles.slice(0, i).reduce((s, a) => s + (a.end - a.start), 0);
          const sweep = end - start;
          const duration = Math.max(sweep * 200, 100);
          const delayMs = priorSweep * 200;

          const isSelected = selected === i;
          const isDimmed = selected !== null && !isSelected;

          return (
            <path
              key={d.label}
              ref={roving.ref(0, i)}
              className="raster-donut__segment"
              data-series={(i % 8) + 1}
              d={path}
              fill="none"
              stroke={d.color}
              strokeWidth={isSelected ? thickness + 4 : thickness}
              strokeLinecap="butt"
              pathLength={1}
              tabIndex={i === 0 ? 0 : -1}
              role="img"
              aria-label={tooltipContent}
              aria-describedby={tip["aria-describedby"]}
              data-selected={isSelected ? "" : undefined}
              data-dimmed={isDimmed ? "" : undefined}
              onClick={() => {
                setSelected(isSelected ? null : i);
                onSegmentClick?.(d, i);
              }}
              onKeyDown={roving.onKeyDown(0, i)}
              onFocus={tip.onFocus}
              onBlur={() => {
                if (!isSelected) hide();
              }}
              onMouseEnter={tip.onMouseEnter}
              onMouseLeave={() => {
                if (!isSelected) tip.onMouseLeave();
              }}
              style={{
                strokeDasharray: 1,
                strokeDashoffset: 1,
                animation: `raster-donut-draw ${duration}ms linear ${delayMs}ms forwards`,
                cursor: "pointer",
              }}
            />
          );
        })}

        {children && (
          <foreignObject x={0} y={0} width={size} height={size}>
            <div className="raster-donut__centre" style={{ width: size, height: size }}>
              {children}
            </div>
          </foreignObject>
        )}
      </svg>

      <ChartTooltip
        id={tooltipId}
        visible={tooltipProps.visible}
        x={tooltipProps.x}
        y={tooltipProps.y}
        content={tooltipProps.content}
      />

      {/* Hidden data table for screen readers */}
      <ChartDataTable
        aria-label={ariaLabel}
        headers={["Category", "Value", "Percentage"]}
        rows={data.map((d) => {
          const pct = total > 0 ? Math.round((d.value / total) * 100) : 0;
          return { key: d.label, cells: [d.label, d.value, `${pct}%`] };
        })}
      />

      {/* Legend */}
      {showLegend && (
        <ChartLegend swatch="dot" items={data.map((d) => ({ label: d.label, color: d.color }))} />
      )}
    </div>
  );
}
