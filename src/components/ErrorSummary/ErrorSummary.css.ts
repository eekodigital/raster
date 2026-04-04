import { globalStyle, style } from "@vanilla-extract/css";

export const summary = style({
  border: "3px solid var(--color-danger)",
  padding: "var(--spacing-4) var(--spacing-5)",
  marginBottom: "var(--spacing-6)",
});

export const title = style({
  fontSize: "var(--font-size-base)",
  fontWeight: "var(--font-weight-semibold)",
  margin: "0 0 var(--spacing-2) 0",
  color: "var(--color-text)",
});

export const list = style({
  margin: 0,
  padding: "0 0 0 var(--spacing-5)",
});

globalStyle(`${list} li`, {
  marginBottom: "var(--spacing-1)",
  fontSize: "var(--font-size-sm)",
});

globalStyle(`${list} a`, {
  color: "var(--color-danger)",
  fontWeight: "var(--font-weight-medium)",
});

globalStyle(`${list} a:hover`, {
  textDecoration: "none",
});
