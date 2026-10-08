import { useId } from "react";
import { cn } from "../../utils/cn.js";
import { numberFormatter } from "../../utils/labels.js";
import type { ChartLabelOverrides } from "../../utils/labels.js";
import { seriesColor } from "../../utils/palette.js";
import { fraction } from "../../utils/chart-math.js";

export type LinearGaugeProps = {
  value: number;
  min?: number;
  max: number;
  /** Visible title; also the meter's accessible name. */
  title: string;
  color?: string;
  height?: number;
  /** Formats the value for display and `aria-valuetext`. Default: `Intl.NumberFormat(labels.locale)`. */
  formatValue?: (value: number) => string;
  /** The number locale (`labels.locale`), as for the other charts. */
  labels?: ChartLabelOverrides;
  /** Visible value text. Default: "{value} / {max}". */
  formatLabel?: (value: number, max: number) => string;
  className?: string;
};

export function LinearGauge({
  value,
  min = 0,
  max,
  title,
  color = seriesColor(0),
  height = 8,
  formatValue,
  labels,
  formatLabel,
  className,
}: LinearGaugeProps) {
  const labelId = useId();
  const format = formatValue ?? numberFormatter(labels?.locale ?? "en");
  const pct = `${fraction(value, min, max) * 100}%`;
  return (
    <div
      className={cn("raster-linear-gauge", className)}
      role="meter"
      aria-labelledby={labelId}
      aria-valuenow={value}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuetext={format(value)}
    >
      <div className="raster-linear-gauge__header">
        <span id={labelId} className="raster-linear-gauge__label">
          {title}
        </span>
        <span className="raster-linear-gauge__value">
          {formatLabel ? formatLabel(value, max) : `${format(value)} / ${format(max)}`}
        </span>
      </div>
      <div className="raster-linear-gauge__track" style={{ height }}>
        <div
          className="raster-linear-gauge__fill"
          style={{ width: pct, background: color, "--gauge-pct": pct } as React.CSSProperties}
        />
      </div>
    </div>
  );
}
