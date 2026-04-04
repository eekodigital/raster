import * as styles from "./Spinner.css.js";

type SpinnerSize = "sm" | "md" | "lg";

interface SpinnerProps {
  size?: SpinnerSize;
  label?: string;
  className?: string;
}

export function Spinner({ size = "md", label = "Loading", className }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={[styles.root, styles.sizes[size], className].filter(Boolean).join(" ")}
    />
  );
}
