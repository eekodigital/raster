import { style } from "@vanilla-extract/css";

export const details = style({});

export const summary = style({
  color: "var(--color-interactive)",
  cursor: "pointer",
  listStyle: "none",
  display: "inline-flex",
  alignItems: "center",
  gap: "var(--spacing-1)",
  fontSize: "var(--font-size-sm)",
  textDecoration: "underline",
  textUnderlineOffset: "0.15em",
  selectors: {
    "&::-webkit-details-marker": { display: "none" },
    "&::before": {
      content: '""',
      display: "inline-block",
      width: "0.375em",
      height: "0.375em",
      borderRight: "1.5px solid currentColor",
      borderBottom: "1.5px solid currentColor",
      transform: "rotate(-45deg)",
      transition: "transform var(--duration-fast) var(--easing-ease)",
      flexShrink: 0,
    },
    "details[open] > &::before": {
      transform: "rotate(45deg)",
    },
    "&:hover": {
      color: "var(--color-interactive-hover)",
    },
    "&:focus-visible": {
      outline: "2px solid var(--color-focus-ring)",
      outlineOffset: "2px",
      borderRadius: "var(--radius-sm)",
      textDecoration: "none",
    },
  },
});

export const content = style({
  paddingTop: "var(--spacing-2)",
  fontSize: "var(--font-size-sm)",
  color: "var(--color-text)",
});
