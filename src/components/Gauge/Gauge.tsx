import { useRef, useImperativeHandle } from "react";
import { useChartExport } from "../../utils/use-chart-export.js";
import type { ChartExportHandle } from "../../utils/use-chart-export.js";
import * as styles from "./Gauge.css.js";

type GaugeProps = {
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
  color = "var(--color-interactive)",
  trackColor = "var(--color-border)",
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

  const cls = [styles.wrapper, className].filter(Boolean).join(" ");

  return (
    <div
      ref={containerRef}
      className={cls}
      style={{ width: size, height: size }}
      role="meter"
      aria-label={ariaLabel}
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      <svg className={styles.svg} width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Track */}
        <circle
          className={styles.track}
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={thickness}
        />
        {/* Fill */}
        <circle
          className={styles.fill}
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
          <div className={styles.centre} style={{ width: size, height: size }}>
            <span className={styles.value}>{format(value)}</span>
            {label && <span className={styles.label}>{label}</span>}
          </div>
        </foreignObject>
      </svg>
    </div>
  );
}
