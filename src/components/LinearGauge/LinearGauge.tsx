import * as styles from './LinearGauge.css.js';

type LinearGaugeProps = {
  value: number;
  max: number;
  label?: string;
  color?: string;
  height?: number;
  format?: (value: number) => string;
  formatLabel?: (value: number, max: number) => string;
  'aria-label': string;
  className?: string;
};

export function LinearGauge({
  value,
  max,
  label,
  color = 'var(--color-interactive)',
  height = 8,
  format = (v) => String(v),
  formatLabel,
  'aria-label': ariaLabel,
  className,
}: LinearGaugeProps) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const cls = [styles.wrapper, className].filter(Boolean).join(' ');

  return (
    <div
      className={cls}
      role="meter"
      aria-label={ariaLabel}
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      {label && (
        <div className={styles.header}>
          <span className={styles.label}>{label}</span>
          <span className={styles.value}>
            {formatLabel ? formatLabel(value, max) : `${format(value)} / ${format(max)}`}
          </span>
        </div>
      )}
      <div className={styles.track} style={{ height }}>
        <div
          className={styles.fill}
          style={
            {
              width: `${pct}%`,
              background: color,
              '--gauge-pct': `${pct}%`,
            } as React.CSSProperties
          }
        />
      </div>
    </div>
  );
}
