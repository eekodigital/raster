import { style } from "@vanilla-extract/css";

export const tag = style({
  fontSize: "var(--font-size-xs)",
  padding: "0.15em 0.5em",
  borderRadius: "var(--radius-sm)",
  fontWeight: "var(--font-weight-medium)",
  display: "inline-flex",
  alignItems: "center",
});

export const variantSuccess = style({
  color: "var(--color-success)",
  background: "var(--color-success-bg)",
  outline: "1px solid var(--color-success-border)",
});

export const variantDanger = style({
  color: "var(--color-danger)",
  background: "var(--color-danger-bg)",
  outline: "1px solid var(--color-danger-border)",
});

export const variantWarning = style({
  color: "var(--color-warning)",
  background: "var(--color-warning-bg)",
  outline: "1px solid var(--color-warning-border)",
});

export const variantInfo = style({
  color: "var(--color-interactive)",
  background: "var(--color-interactive-subtle)",
  outline: "1px solid color-mix(in srgb, var(--color-interactive) 30%, transparent)",
});

export const variantNeutral = style({
  color: "var(--color-inactive)",
  background: "var(--color-inactive-bg)",
  outline: "1px solid var(--color-inactive-border)",
});
