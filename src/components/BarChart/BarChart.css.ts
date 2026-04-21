import { keyframes, style } from "@vanilla-extract/css";

const growUp = keyframes({
  from: { transform: "scaleY(0)" },
  to: { transform: "scaleY(1)" },
});

const growRight = keyframes({
  from: { transform: "scaleX(0)" },
  to: { transform: "scaleX(1)" },
});

export const wrapper = style({
  width: "100%",
  fontFamily: "var(--font-family-sans)",
});

export const svg = style({
  display: "block",
  overflow: "visible",
});

export const bar = style({
  cursor: "pointer",
  transition: "opacity 0.15s ease",
  transformBox: "fill-box",
  transformOrigin: "bottom",
  animation: `${growUp} 0.4s ease both`,
  selectors: {
    "&:hover": { opacity: 0.8 },
    "&:focus": { outline: "none" },
    "&:focus-visible": { outline: "2px solid var(--color-focus-ring)", outlineOffset: "1px" },
    "&[data-selected]": { stroke: "var(--color-text)", strokeWidth: "2px" },
    "&[data-dimmed]": { opacity: 0.3 },
  },
  "@media": {
    "(prefers-reduced-motion: reduce)": { transition: "none", animation: "none" },
  },
});

export const barHorizontal = style({
  cursor: "pointer",
  transition: "opacity 0.15s ease",
  transformBox: "fill-box",
  transformOrigin: "left",
  animation: `${growRight} 0.4s ease both`,
  selectors: {
    "&:hover": { opacity: 0.8 },
    "&:focus": { outline: "none" },
    "&:focus-visible": { outline: "2px solid var(--color-focus-ring)", outlineOffset: "1px" },
    "&[data-selected]": { stroke: "var(--color-text)", strokeWidth: "2px" },
    "&[data-dimmed]": { opacity: 0.3 },
  },
  "@media": {
    "(prefers-reduced-motion: reduce)": { transition: "none", animation: "none" },
  },
});

export const axisLine = style({
  stroke: "var(--color-border)",
  strokeWidth: 1,
});

export const axisLabel = style({
  fontSize: "var(--font-size-xs)",
  fill: "var(--color-text-subtle)",
});

export const tickLabel = style({
  fontSize: "var(--font-size-xs)",
  fill: "var(--color-text-subtle)",
});

export const legend = style({
  display: "flex",
  gap: "var(--spacing-3)",
  justifyContent: "center",
  marginTop: "var(--spacing-2)",
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

export const srOnly = style({
  display: "block",
  position: "absolute",
  width: "1px",
  height: "1px",
  padding: 0,
  margin: "-1px",
  overflow: "hidden",
  clipPath: "inset(50%)",
  whiteSpace: "nowrap",
  borderWidth: 0,
});
