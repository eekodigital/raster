import { useRef, useImperativeHandle } from "react";
import { useChartExport } from "../../utils/use-chart-export.js";
import type { ChartExportHandle } from "../../utils/use-chart-export.js";

export type { ChartExportHandle };
import { cn } from "../../utils/cn.js";
import { seriesColor } from "../../utils/palette.js";

export type GaugeProps = {
  value: number;
  max: number;
  label?: string;
  color?: string;
  trackColor?: string;
  size?: number;
  thickness?: number;
  format?: (value: number) => string;
  exportRef?: React.Ref<ChartExportHandle>;
  "aria-label": string;
  className?: string;
};

export function Gauge({
  value,
  max,
  label,
  color = seriesColor(0),
  trackColor = "var(--raster-grid, currentColor)",
  size = 120,
  thickness = 10,
  format = (v) => String(v),
  exportRef,
  "aria-label": ariaLabel,
  className,
}: GaugeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const exportHandle = useChartExport(containerRef);
  useImperativeHandle(exportRef, () => exportHandle, [exportHandle]);
  const pct = max > 0 ? Math.min(value / max, 1) : 0;
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct);
  const cx = size / 2;
  const cy = size / 2;

  return (
    <div
      ref={containerRef}
      className={cn("raster-gauge", className)}
      style={{ width: size, height: size }}
      role="meter"
      aria-label={ariaLabel}
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      <svg className="raster-gauge__svg" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Track */}
        <circle
          className="raster-gauge__track"
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={thickness}
        />
        {/* Fill */}
        <circle
          className="raster-gauge__fill"
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${cx} ${cy})`}
        />
        <foreignObject x={0} y={0} width={size} height={size}>
          <div className="raster-gauge__centre" style={{ width: size, height: size }}>
            <span className="raster-gauge__value">{format(value)}</span>
            {label && <span className="raster-gauge__label">{label}</span>}
          </div>
        </foreignObject>
      </svg>
    </div>
  );
}
