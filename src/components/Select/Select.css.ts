import { style } from "@vanilla-extract/css";

export const trigger = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "var(--spacing-2)",
  width: "100%",
  fontFamily: "inherit",
  fontSize: "var(--font-size-base)",
  lineHeight: "var(--font-leading-normal)",
  color: "var(--color-text)",
  backgroundColor: "var(--color-surface)",
  border: "var(--border-width-thin) solid var(--color-border-strong)",
  borderRadius: "var(--radius-md)",
  padding: "var(--spacing-2) var(--spacing-3)",
  cursor: "pointer",
  transition:
    "border-color var(--duration-fast) var(--easing-ease), box-shadow var(--duration-fast) var(--easing-ease)",
  selectors: {
    "&:focus": {
      outline: "none",
      borderColor: "var(--color-interactive)",
      boxShadow: "var(--focus-ring)",
    },
    "&[data-disabled], &:disabled": {
      opacity: "var(--opacity-disabled)",
      cursor: "not-allowed",
      backgroundColor: "var(--color-inactive-bg)",
      color: "var(--color-text-subtle)",
    },
    "&[data-placeholder]": {
      color: "var(--color-text-subtle)",
    },
  },
});

export const triggerError = style({
  borderColor: "var(--color-danger)",
  selectors: {
    "&:focus": {
      borderColor: "var(--color-danger)",
      boxShadow: "0 0 0 3px var(--color-danger-border)",
    },
  },
});

export const icon = style({
  flexShrink: 0,
  color: "var(--color-text)",
});

export const content = style({
  position: "fixed",
  backgroundColor: "var(--color-surface)",
  border: "var(--border-width-thin) solid var(--color-border)",
  borderRadius: "var(--radius-md)",
  boxShadow: "var(--shadow-md)",
  zIndex: "var(--z-dropdown)",
  overflow: "hidden",
});

export const viewport = style({
  padding: "var(--spacing-1)",
});

export const item = style({
  display: "flex",
  alignItems: "center",
  gap: "var(--spacing-2)",
  padding: "var(--spacing-2) var(--spacing-3)",
  borderRadius: "var(--radius-sm)",
  fontSize: "var(--font-size-base)",
  color: "var(--color-text)",
  cursor: "pointer",
  outline: "none",
  userSelect: "none",
  // push indicator to the right
  paddingRight: "var(--spacing-8)",
  position: "relative",
  selectors: {
    "&[data-highlighted]": {
      backgroundColor: "var(--color-surface-raised)",
      color: "var(--color-text)",
    },
    "&[data-disabled], &:disabled": {
      opacity: "var(--opacity-disabled)",
      cursor: "not-allowed",
      pointerEvents: "none",
    },
    '&[data-state="checked"]': {
      color: "var(--color-interactive)",
    },
  },
});

export const itemIcon = style({
  flexShrink: 0,
  display: "flex",
  alignItems: "center",
});

export const itemIndicator = style({
  position: "absolute",
  right: "var(--spacing-3)",
  display: "flex",
  alignItems: "center",
  color: "var(--color-interactive)",
});
