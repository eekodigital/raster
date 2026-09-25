import { useId } from "react";
import { cn } from "../../utils/cn.js";
import { numberFormatter } from "../../utils/labels.js";
import { seriesColor } from "../../utils/palette.js";
import { fraction } from "../Gauge/Gauge.js";

export type LinearGaugeProps = {
  value: number;
  min?: number;
  max: number;
  /** Visible label; also the meter's accessible name. */
  label: string;
  color?: string;
  height?: number;
  /** Formats the value for display and `aria-valuetext`. Default: `Intl.NumberFormat("en")`. */
  format?: (value: number) => string;
  /** Visible value text. Default: "{value} / {max}". */
  formatLabel?: (value: number, max: number) => string;
  className?: string;
};

export function LinearGauge({
  value,
  min = 0,
  max,
  label,
  color = seriesColor(0),
  height = 8,
  format = numberFormatter("en"),
  formatLabel,
  className,
}: LinearGaugeProps) {
  const labelId = useId();
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
          {label}
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
