import { style } from "@vanilla-extract/css";

export const error = style({
  borderColor: "var(--color-danger)",
  selectors: {
    "&:focus": {
      borderColor: "var(--color-danger)",
      boxShadow: "0 0 0 3px var(--color-danger-border)",
    },
  },
});

export const textarea = style({
  display: "block",
  width: "100%",
  fontFamily: "inherit",
  fontSize: "var(--font-size-base)",
  lineHeight: "var(--font-leading-normal)",
  color: "var(--color-text)",
  backgroundColor: "var(--color-surface)",
  border: "var(--border-width-thin) solid var(--color-border-strong)",
  borderRadius: "var(--radius-md)",
  padding: "var(--spacing-2) var(--spacing-3)",
  resize: "vertical",
  transition:
    "border-color var(--duration-fast) var(--easing-ease), box-shadow var(--duration-fast) var(--easing-ease)",
  selectors: {
    "&::placeholder": { color: "var(--color-text-placeholder)" },
    "&:focus": {
      outline: "none",
      borderColor: "var(--color-interactive)",
      boxShadow: "var(--focus-ring)",
    },
    "&:disabled": {
      opacity: "var(--opacity-disabled)",
      cursor: "not-allowed",
      backgroundColor: "var(--color-surface-raised)",
    },
  },
});
