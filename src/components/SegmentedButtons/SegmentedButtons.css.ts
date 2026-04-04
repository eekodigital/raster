import { globalStyle, style } from "@vanilla-extract/css";

export const group = style({
  display: "inline-flex",
});

export const item = style({
  padding: "var(--spacing-1) var(--spacing-3)",
  fontSize: "var(--font-size-xs)",
  fontFamily: "var(--font-family-sans)",
  fontWeight: "var(--font-weight-medium)",
  lineHeight: "var(--font-leading-normal)",
  border: "1px solid var(--color-border-strong)",
  background: "var(--color-surface)",
  color: "var(--color-text-subtle)",
  cursor: "pointer",
  position: "relative",
  transition: `background var(--duration-fast) var(--easing-ease), color var(--duration-fast) var(--easing-ease)`,
  selectors: {
    "&:first-child": {
      borderRadius: "var(--radius-sm) 0 0 var(--radius-sm)",
    },
    "&:last-child": {
      borderRadius: "0 var(--radius-sm) var(--radius-sm) 0",
    },
    "&:not(:first-child)": {
      marginLeft: "-1px",
    },
    "&:focus-visible": {
      outline: "2px solid var(--color-focus-ring)",
      outlineOffset: "2px",
      zIndex: 1,
    },
    '&[data-state="checked"]': {
      background: "var(--color-interactive-subtle)",
      color: "var(--color-interactive)",
      borderColor: "var(--color-interactive)",
      zIndex: 1,
    },
    "&[data-disabled]": {
      opacity: "var(--opacity-disabled)",
      cursor: "not-allowed",
    },
  },
});

// When a custom --segment-color is set, use it for the checked state
globalStyle(`${item}[data-state="checked"][style*="--segment-color"]`, {
  color: "var(--segment-color)",
  borderColor: "var(--segment-color)",
});

globalStyle(`${item}[data-state="checked"][style*="--segment-bg"]`, {
  background: "var(--segment-bg)",
});
