import { style } from "@vanilla-extract/css";

export const banner = style({
  borderRadius: "var(--radius-md)",
  padding: "var(--spacing-4)",
  display: "flex",
  gap: "var(--spacing-3)",
  alignItems: "flex-start",
});

export const variantInfo = style({
  background: "var(--color-interactive-subtle)",
  outline: "1px solid color-mix(in srgb, var(--color-interactive) 30%, transparent)",
  color: "var(--color-text)",
});

export const variantSuccess = style({
  background: "var(--color-success-bg)",
  outline: "1px solid var(--color-success-border)",
  color: "var(--color-text)",
});

export const variantWarning = style({
  background: "var(--color-warning-bg)",
  outline: "1px solid var(--color-warning-border)",
  color: "var(--color-text)",
});

export const variantDanger = style({
  background: "var(--color-danger-bg)",
  outline: "1px solid var(--color-danger-border)",
  color: "var(--color-text)",
});

export const body = style({
  flex: 1,
  minWidth: 0,
});

export const title = style({
  fontWeight: "var(--font-weight-semibold)",
  marginBottom: "var(--spacing-1)",
});
