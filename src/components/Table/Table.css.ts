import { globalStyle, style } from "@vanilla-extract/css";

export const wrapper = style({
  width: "100%",
  overflowX: "auto",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-lg)",
});

export const table = style({
  width: "100%",
  borderCollapse: "collapse",
  fontSize: "var(--font-size-sm)",
  background: "var(--color-surface)",
});

export const caption = style({
  captionSide: "top",
  textAlign: "left",
  padding: "var(--spacing-3) var(--spacing-4)",
  fontSize: "var(--font-size-base)",
  fontWeight: "var(--font-weight-semibold)",
  color: "var(--color-text)",
  borderBottom: "1px solid var(--color-border)",
});

globalStyle(`${table} th, ${table} td`, {
  padding: "var(--spacing-3) var(--spacing-4)",
  textAlign: "left",
  verticalAlign: "top",
  borderBottom: "1px solid var(--color-border)",
});

globalStyle(`${table} tbody tr:last-child td`, {
  borderBottom: "none",
});

globalStyle(`${table} th`, {
  fontWeight: "var(--font-weight-medium)",
  fontSize: "var(--font-size-xs)",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  color: "var(--color-text-subtle)",
  background: "var(--color-surface-raised)",
  whiteSpace: "nowrap",
});

globalStyle(`${table} tbody tr:hover td`, {
  background: "var(--color-surface-raised)",
});
