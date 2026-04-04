import { style } from "@vanilla-extract/css";

export const root = style({
  flexShrink: 0,
  backgroundColor: "var(--color-border)",
  selectors: {
    '&[data-orientation="horizontal"]': {
      height: "1px",
      width: "100%",
      margin: "var(--spacing-4) 0",
    },
    '&[data-orientation="vertical"]': {
      height: "100%",
      width: "1px",
      margin: "0 var(--spacing-4)",
    },
  },
});
