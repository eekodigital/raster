import { style } from "@vanilla-extract/css";

export const root = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "var(--spacing-2)",
});

export const nav = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "var(--spacing-1)",
});

export const button = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: "2.25rem",
  height: "2.25rem",
  padding: "0 var(--spacing-2)",
  borderRadius: "var(--radius-md)",
  border: "1px solid transparent",
  background: "transparent",
  color: "var(--color-interactive)",
  fontSize: "var(--font-size-sm)",
  fontWeight: "var(--font-weight-normal)",
  fontFamily: "inherit",
  textDecoration: "none",
  cursor: "pointer",
  transition:
    "background-color var(--duration-fast) var(--easing-ease), border-color var(--duration-fast) var(--easing-ease)",
  selectors: {
    '&:hover:not(:disabled):not([aria-disabled="true"]):not([aria-current="page"])': {
      background: "var(--color-interactive-subtle)",
      borderColor: "var(--color-interactive)",
    },
    "&:focus-visible": {
      outline: "none",
      boxShadow: "var(--focus-ring)",
    },
    "&:disabled": {
      opacity: "var(--opacity-disabled)",
      cursor: "not-allowed",
    },
  },
});

export const buttonDisabled = style({
  opacity: "var(--opacity-disabled)",
  cursor: "not-allowed",
  pointerEvents: "none",
});

export const buttonCurrent = style({
  background: "var(--color-interactive)",
  color: "var(--color-interactive-text)",
  borderColor: "var(--color-interactive)",
  fontWeight: "var(--font-weight-medium)",
  cursor: "default",
  selectors: {
    "&:hover": {
      background: "var(--color-interactive-hover)",
      borderColor: "var(--color-interactive-hover)",
    },
  },
});

export const ellipsis = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  height: "2.25rem",
  padding: "0 var(--spacing-1)",
  color: "var(--color-text-subtle)",
  fontSize: "var(--font-size-sm)",
  userSelect: "none",
});

export const range = style({
  margin: 0,
  color: "var(--color-text-subtle)",
  fontSize: "var(--font-size-sm)",
});
