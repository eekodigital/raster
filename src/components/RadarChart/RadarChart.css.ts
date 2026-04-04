import { style } from "@vanilla-extract/css";

export const wrapper = style({
  width: "100%",
  fontFamily: "var(--font-family-sans)",
});

export const svg = style({
  display: "block",
  width: "100%",
});

export const gridLine = style({
  fill: "none",
  stroke: "var(--color-border)",
  strokeWidth: 1,
});

export const axisLine = style({
  stroke: "var(--color-border)",
  strokeWidth: 1,
});

export const axisLabel = style({
  fontSize: "var(--font-size-xs)",
  fill: "var(--color-text-subtle)",
  textAnchor: "middle",
});

export const seriesArea = style({
  opacity: 0.15,
});

export const seriesLine = style({
  fill: "none",
  strokeWidth: 2,
});

export const point = style({
  transition: "r 0.15s ease",
  selectors: {
    "&:focus": { outline: "none" },
    "&:focus-visible": { r: "6", stroke: "var(--color-focus-ring)", strokeWidth: "2" },
  },
  "@media": {
    "(prefers-reduced-motion: reduce)": { transition: "none" },
  },
});

export const legendItem = style({
  display: "inline-flex",
  alignItems: "center",
  gap: "var(--spacing-1)",
  fontSize: "var(--font-size-xs)",
  color: "var(--color-text-subtle)",
});

export const legendSwatch = style({
  width: "12px",
  height: "3px",
  borderRadius: "2px",
  flexShrink: 0,
});

export const legend = style({
  display: "flex",
  gap: "var(--spacing-3)",
  justifyContent: "center",
  marginTop: "var(--spacing-2)",
});

export const srOnly = style({
  position: "absolute",
  width: "1px",
  height: "1px",
  padding: 0,
  margin: "-1px",
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  borderWidth: 0,
});
