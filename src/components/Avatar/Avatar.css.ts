import { style, styleVariants } from "@vanilla-extract/css";

export const root = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  verticalAlign: "middle",
  overflow: "hidden",
  userSelect: "none",
  borderRadius: "50%",
  backgroundColor: "var(--color-surface-raised)",
  border: "1px solid var(--color-border)",
  flexShrink: 0,
});

export const rootSquare = style({
  borderRadius: "var(--radius-md)",
});

export const sizes = styleVariants({
  sm: { width: "2rem", height: "2rem", fontSize: "var(--font-size-xs)" },
  md: { width: "2.5rem", height: "2.5rem", fontSize: "var(--font-size-sm)" },
  lg: { width: "3.5rem", height: "3.5rem", fontSize: "var(--font-size-base)" },
});

export const image = style({
  width: "100%",
  height: "100%",
  objectFit: "cover",
  borderRadius: "inherit",
});

export const fallback = style({
  width: "100%",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "var(--font-weight-semibold)",
  color: "var(--color-text-subtle)",
  letterSpacing: "var(--font-tracking-wide)",
  textTransform: "uppercase",
  lineHeight: 1,
});
