import { useId } from "react";
import { fraction } from "../../utils/chart-math.js";
import { cn } from "../../utils/cn.js";
import { numberFormatter } from "../../utils/labels.js";
import type { ChartLabelOverrides } from "../../utils/labels.js";
import { seriesColor } from "../../utils/palette.js";
import { useRootRef } from "../../utils/use-merged-ref.js";

import { useContainerWidth } from "../../utils/use-container-width.js";

export type GaugeProps = {
  value: number;
  min?: number;
  max: number;
  /** Visible title; also the meter's accessible name. */
  title: string;
  color?: string;
  trackColor?: string;
  /** Fixed diameter in px. Omit to fill the container's width. */
  size?: number;
  thickness?: number;
  /** Formats the displayed value and `aria-valuetext`. Default: `Intl.NumberFormat(labels.locale)`. */
  formatValue?: (value: number) => string;
  /** The number locale (`labels.locale`), as for the other charts. */
  labels?: ChartLabelOverrides;
  /** The chart's root element, e.g. for `exportSVG` from `@eekodigital/raster/export`. */
  ref?: React.Ref<HTMLDivElement>;
  className?: string;
};

export function Gauge({
  value,
  min = 0,
  max,
  title,
  color = seriesColor(0),
  trackColor = "var(--raster-grid, currentColor)",
  size: sizeProp,
  thickness = 10,
  formatValue,
  labels,
  ref,
  className,
}: GaugeProps) {
  const { containerRef, rootRef } = useRootRef<HTMLDivElement>(ref);
  const measured = useContainerWidth(containerRef, 120);
  const size = sizeProp ?? measured;
  const labelId = useId();

  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - fraction(value, min, max));
  const c = size / 2;
  const text = (formatValue ?? numberFormatter(labels?.locale ?? "en"))(value);

  return (
    <div
      ref={rootRef}
      className={cn("raster-gauge", className)}
      style={sizeProp ? { width: sizeProp, height: sizeProp } : undefined}
      role="meter"
      aria-labelledby={labelId}
      aria-valuenow={value}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuetext={text}
      data-chart-container
    >
      <svg
        data-raster-chart=""
        className="raster-gauge__svg"
        width="100%"
        height="100%"
        viewBox={`0 0 ${size} ${size}`}
      >
        <circle
          className="raster-gauge__track"
          cx={c}
          cy={c}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={thickness}
        />
        <circle
          className="raster-gauge__fill"
          cx={c}
          cy={c}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${c} ${c})`}
        />
        <foreignObject x={0} y={0} width={size} height={size}>
          <div className="raster-gauge__centre">
            <span className="raster-gauge__value">{text}</span>
            <span id={labelId} className="raster-gauge__label">
              {title}
            </span>
          </div>
        </foreignObject>
      </svg>
    </div>
  );
}
