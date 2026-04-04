import { style } from "@vanilla-extract/css";

export const root = style({
  width: "100%",
});

export const trigger = style({
  all: "unset",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
  padding: "var(--spacing-3) var(--spacing-4)",
  fontFamily: "var(--font-family-sans)",
  fontSize: "var(--font-size-base)",
  fontWeight: "var(--font-weight-medium)",
  color: "var(--color-text)",
  cursor: "pointer",
  borderRadius: "var(--radius-md)",
  border: "1px solid var(--color-border)",
  backgroundColor: "var(--color-surface)",
  transition: "background-color var(--duration-fast) var(--easing-ease)",
  selectors: {
    "&:hover": {
      backgroundColor: "var(--color-surface-raised)",
    },
    "&:focus-visible": {
      outline: "2px solid var(--color-focus-ring)",
      outlineOffset: "2px",
    },
  },
});

export const chevron = style({
  transition: "transform var(--duration-fast) var(--easing-ease)",
  flexShrink: 0,
  selectors: {
    '[data-state="open"] &': {
      transform: "rotate(180deg)",
    },
  },
});

export const content = style({
  overflow: "hidden",
  selectors: {
    '&[data-state="open"]': {
      animation: "none",
    },
    '&[data-state="closed"]': {
      animation: "none",
    },
  },
});

export const contentInner = style({
  padding: "var(--spacing-3) var(--spacing-4)",
});
