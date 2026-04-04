import { cn } from "../../utils/cn.js";
import * as styles from "./Progress.css.js";

interface ProgressProps {
  value?: number | null;
  max?: number;
  label?: string;
  className?: string;
}

export function Progress({ value, max = 100, label, className }: ProgressProps) {
  const isIndeterminate = value == null;
  const pct = !isIndeterminate ? (value / max) * 100 : null;
  return (
    <div
      role="progressbar"
      aria-valuenow={isIndeterminate ? undefined : value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label}
      data-state={isIndeterminate ? "indeterminate" : "complete"}
      className={cn(styles.root, className)}
    >
      <div
        className={styles.indicator}
        style={{ transform: pct != null ? `translateX(-${100 - pct}%)` : undefined }}
      />
    </div>
  );
}
