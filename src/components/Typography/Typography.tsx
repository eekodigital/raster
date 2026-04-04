import type React from "react";
import * as styles from "./Typography.css.js";

type HeadingLevel = "1" | "2" | "3" | "4" | "5" | "6";

type HeadingProps = {
  level?: HeadingLevel;
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  className?: string;
  children: React.ReactNode;
};

export function Heading({ level = "2", as, className, children }: HeadingProps) {
  const Tag = (as ?? (`h${level}` as const)) as React.ElementType;
  return (
    <Tag className={[styles.base, styles.headingSizes[level], className].filter(Boolean).join(" ")}>
      {children}
    </Tag>
  );
}

type TextSize = "sm" | "base" | "lg";
type TextVariant = "default" | "subtle" | "strong" | "danger";

type TextProps = {
  size?: TextSize;
  variant?: TextVariant;
  as?: React.ElementType;
  className?: string;
  children: React.ReactNode;
};

export function Text({
  size = "base",
  variant = "default",
  as: Tag = "p",
  className,
  children,
}: TextProps) {
  return (
    <Tag
      className={[styles.base, styles.textSizes[size], styles.textVariants[variant], className]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </Tag>
  );
}
