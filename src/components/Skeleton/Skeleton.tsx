import type React from "react";
import * as styles from "./Skeleton.css.js";

type SkeletonVariant = "text" | "heading" | "circular" | "rectangular";

type SkeletonProps = {
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
  className?: string;
  style?: React.CSSProperties;
};

export function Skeleton({ variant = "text", width, height, className, style }: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      className={[styles.root, styles.variants[variant], className].filter(Boolean).join(" ")}
      style={{ width, height, ...style }}
    />
  );
}
