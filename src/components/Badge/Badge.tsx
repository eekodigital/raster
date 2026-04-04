import type React from "react";
import * as styles from "./Badge.css.js";

export type BadgeVariant = "neutral" | "primary" | "success" | "danger" | "warning";

type BadgeProps = {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
};

export function Badge({ children, variant = "neutral", className }: BadgeProps) {
  return (
    <span className={[styles.root, styles.variants[variant], className].filter(Boolean).join(" ")}>
      {children}
    </span>
  );
}
