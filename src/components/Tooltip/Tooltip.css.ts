import { keyframes, style } from "@vanilla-extract/css";

const fadeIn = keyframes({
  from: { opacity: 0, transform: "scale(0.95)" },
  to: { opacity: 1, transform: "scale(1)" },
});

export const content = style({
  position: "fixed",
  backgroundColor: "var(--color-text)",
  color: "var(--color-surface)",
  borderRadius: "var(--radius-sm)",
  padding: "0.3125rem var(--spacing-2)",
  fontSize: "var(--font-size-xs)",
  fontWeight: "var(--font-weight-medium)",
  lineHeight: "var(--font-leading-tight)",
  maxWidth: "16rem",
  animation: `${fadeIn} var(--duration-fast) var(--easing-ease)`,
  zIndex: "var(--z-tooltip)",
  userSelect: "none",
});

export const arrow = style({
  fill: "var(--color-text)",
});
