import { style } from "@vanilla-extract/css";

export const input = style({
  display: "block",
  fontSize: "var(--font-size-sm)",
  selectors: {
    "&::file-selector-button": {
      padding: "var(--spacing-2) var(--spacing-4)",
      border: "1px solid var(--color-interactive)",
      borderRadius: "var(--radius-md)",
      background: "transparent",
      color: "var(--color-interactive)",
      fontFamily: "inherit",
      fontSize: "var(--font-size-sm)",
      fontWeight: "var(--font-weight-medium)",
      cursor: "pointer",
      marginRight: "var(--spacing-3)",
      transition: "background-color var(--duration-fast) var(--easing-ease)",
    },
    "&::file-selector-button:hover": {
      background: "var(--color-interactive-subtle)",
    },
    "&:focus-visible": {
      outline: "none",
      boxShadow: "var(--focus-ring)",
      borderRadius: "var(--radius-sm)",
    },
    "&[data-error]": {
      color: "var(--color-danger)",
    },
    "&[data-error]::file-selector-button": {
      borderColor: "var(--color-danger)",
      color: "var(--color-danger)",
    },
    "&[data-error]::file-selector-button:hover": {
      background: "var(--color-danger-bg)",
    },
  },
});
