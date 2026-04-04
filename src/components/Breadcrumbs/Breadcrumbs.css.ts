import { style } from "@vanilla-extract/css";

export const nav = style({
  fontSize: "var(--font-size-sm)",
});

export const list = style({
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: "var(--spacing-1)",
  listStyle: "none",
  margin: 0,
  padding: 0,
});

export const item = style({
  display: "flex",
  alignItems: "center",
  gap: "var(--spacing-1)",
  selectors: {
    "&:not(:last-child)::after": {
      content: '"/"',
      color: "var(--color-text-subtle)",
      marginLeft: "var(--spacing-1)",
    },
  },
});

export const link = style({
  color: "var(--color-interactive)",
  textDecoration: "none",
  selectors: {
    "&:hover": { textDecoration: "underline" },
    "&:focus-visible": {
      outline: "none",
      boxShadow: "var(--focus-ring)",
      borderRadius: "var(--radius-sm)",
    },
  },
});

export const current = style({
  color: "var(--color-text-subtle)",
});
