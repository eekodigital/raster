import { keyframes, style } from "@vanilla-extract/css";

const grow = keyframes({
  from: { width: "0%" },
  to: { width: "var(--gauge-pct)" },
});

export const wrapper = style({
  fontFamily: "var(--font-family-sans)",
  display: "flex",
  flexDirection: "column",
  gap: "var(--spacing-1)",
});

export const header = style({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "baseline",
  fontSize: "var(--font-size-sm)",
});

export const label = style({
  color: "var(--color-text-subtle)",
  fontWeight: "var(--font-weight-medium)",
});

export const value = style({
  color: "var(--color-text)",
  fontWeight: "var(--font-weight-bold)",
});

export const track = style({
  width: "100%",
  height: "8px",
  borderRadius: "4px",
  background: "var(--color-surface-raised)",
  overflow: "hidden",
});

export const fill = style({
  height: "100%",
  borderRadius: "4px",
  animation: `${grow} 0.6s ease both`,
  "@media": {
    "(prefers-reduced-motion: reduce)": { animation: "none" },
  },
});
