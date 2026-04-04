import { style } from "@vanilla-extract/css";

export const list = style({
  display: "grid",
  gridTemplateColumns: "1fr",
  margin: 0,
  padding: 0,
  borderTop: "1px solid var(--color-border)",
});

export const listPlain = style({
  display: "grid",
  gridTemplateColumns: "1fr",
  margin: 0,
  padding: 0,
});

export const row = style({
  display: "grid",
  gridTemplateColumns: "1fr 2fr auto",
  gap: "var(--spacing-4)",
  alignItems: "baseline",
  padding: "var(--spacing-3) 0",
  borderBottom: "1px solid var(--color-border)",
});

export const rowPlain = style({
  display: "grid",
  gridTemplateColumns: "1fr 2fr auto",
  gap: "var(--spacing-4)",
  alignItems: "baseline",
  padding: "var(--spacing-2) 0",
});

export const key = style({
  fontWeight: "var(--font-weight-medium)",
  color: "var(--color-text-subtle)",
  fontSize: "var(--font-size-sm)",
  margin: 0,
});

export const keyPlain = style({
  fontWeight: "var(--font-weight-semibold)",
  color: "var(--color-text)",
  fontSize: "var(--font-size-sm)",
  margin: 0,
});

export const value = style({
  color: "var(--color-text)",
  margin: 0,
  wordBreak: "break-word",
});

export const actions = style({
  display: "flex",
  gap: "var(--spacing-3)",
  alignItems: "center",
  whiteSpace: "nowrap",
});
