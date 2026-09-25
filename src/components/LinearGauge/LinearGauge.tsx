import { cn } from "../../utils/cn.js";
import { seriesColor } from "../../utils/palette.js";

type LinearGaugeProps = {
  value: number;
  max: number;
  label?: string;
  color?: string;
  height?: number;
  format?: (value: number) => string;
  formatLabel?: (value: number, max: number) => string;
  "aria-label": string;
  className?: string;
};

export function LinearGauge({
  value,
  max,
  label,
  color = seriesColor(0),
  height = 8,
  format = (v) => String(v),
  formatLabel,
  "aria-label": ariaLabel,
  className,
}: LinearGaugeProps) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div
      className={cn("raster-linear-gauge", className)}
      role="meter"
      aria-label={ariaLabel}
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      {label && (
        <div className="raster-linear-gauge__header">
          <span className="raster-linear-gauge__label">{label}</span>
          <span className="raster-linear-gauge__value">
            {formatLabel ? formatLabel(value, max) : `${format(value)} / ${format(max)}`}
          </span>
        </div>
      )}
      <div className="raster-linear-gauge__track" style={{ height }}>
        <div
          className="raster-linear-gauge__fill"
          style={
            {
              width: `${pct}%`,
              background: color,
              "--gauge-pct": `${pct}%`,
            } as React.CSSProperties
          }
        />
      </div>
    </div>
  );
}
