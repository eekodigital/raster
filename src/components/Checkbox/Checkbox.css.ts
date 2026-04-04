import { style } from "@vanilla-extract/css";

export const item = style({
  display: "flex",
  alignItems: "center",
  gap: "var(--spacing-2)",
});

export const root = style({
  flexShrink: 0,
  width: "1.375rem",
  height: "1.375rem",
  margin: 0,
  padding: 0,
  cursor: "pointer",
  appearance: "none",
  border: "var(--border-width-thin) solid var(--color-border-strong)",
  borderRadius: "var(--radius-sm)",
  backgroundColor: "var(--color-surface)",
  color: "var(--color-surface)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition:
    "background-color var(--duration-fast) var(--easing-ease), border-color var(--duration-fast) var(--easing-ease)",
  selectors: {
    '&[data-state="checked"]': {
      backgroundColor: "var(--color-interactive)",
      borderColor: "var(--color-interactive)",
      color: "var(--color-surface)",
    },
    '&[data-state="indeterminate"]': {
      backgroundColor: "var(--color-interactive)",
      borderColor: "var(--color-interactive)",
      color: "var(--color-surface)",
    },
    "&:focus-visible": {
      outline: "2px solid var(--color-focus-ring)",
      outlineOffset: "2px",
    },
    "&[data-disabled]": {
      opacity: "var(--opacity-disabled)",
      cursor: "not-allowed",
    },
  },
});

export const indicator = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

export const label = style({
  fontSize: "var(--font-size-base)",
  color: "var(--color-text)",
  lineHeight: "var(--font-leading-normal)",
  cursor: "pointer",
  selectors: {
    "[data-disabled] ~ &": {
      opacity: "var(--opacity-disabled)",
      cursor: "not-allowed",
    },
  },
});

// Group variant — fieldset + legend
export const group = style({
  border: "none",
  margin: 0,
  padding: 0,
  display: "flex",
  flexDirection: "column",
  gap: "var(--spacing-1)",
  selectors: {
    "&[data-error]": {
      borderLeft: "4px solid var(--color-danger)",
      paddingLeft: "var(--spacing-3)",
    },
  },
});

export const legend = style({
  float: "left",
  width: "100%",
  fontSize: "var(--font-size-base)",
  fontWeight: "var(--font-weight-semibold)",
  color: "var(--color-text)",
  lineHeight: "var(--font-leading-tight)",
  marginBottom: "var(--spacing-1)",
});

export const hint = style({
  fontSize: "var(--font-size-sm)",
  color: "var(--color-text-subtle)",
  lineHeight: "var(--font-leading-normal)",
});

export const error = style({
  fontSize: "var(--font-size-sm)",
  fontWeight: "var(--font-weight-medium)",
  color: "var(--color-danger)",
  lineHeight: "var(--font-leading-normal)",
});

export const errorPrefix = style({
  position: "absolute",
  width: "1px",
  height: "1px",
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
});

export const items = style({
  display: "flex",
  flexDirection: "column",
  gap: "var(--spacing-2)",
  // Clear the float from legend
  clear: "left",
});
