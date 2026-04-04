import { style } from "@vanilla-extract/css";

export const root = style({
  display: "flex",
  gap: "var(--spacing-2)",
});

export const cell = style({
  width: "2.75rem",
  height: "3rem",
  textAlign: "center",
  fontFamily: "inherit",
  fontSize: "var(--font-size-lg)",
  fontWeight: "var(--font-weight-medium)",
  color: "var(--color-text)",
  backgroundColor: "var(--color-surface)",
  border: "var(--border-width-thin) solid var(--color-border-strong)",
  borderRadius: "var(--radius-md)",
  appearance: "none",
  transition:
    "border-color var(--duration-fast) var(--easing-ease), box-shadow var(--duration-fast) var(--easing-ease)",
  selectors: {
    "&:focus": {
      outline: "none",
      borderColor: "var(--color-interactive)",
      boxShadow: "var(--focus-ring)",
    },
    "&[data-filled]": {
      borderColor: "var(--color-interactive)",
    },
    "&:disabled": {
      opacity: "var(--opacity-disabled)",
      cursor: "not-allowed",
      backgroundColor: "var(--color-surface-raised)",
    },
  },
});
