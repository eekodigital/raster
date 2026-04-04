import { keyframes, style } from "@vanilla-extract/css";

const fadeIn = keyframes({
  from: { opacity: 0 },
  to: { opacity: 1 },
});

const fadeOut = keyframes({
  from: { opacity: 1 },
  to: { opacity: 0 },
});

const contentIn = keyframes({
  from: { opacity: 0, transform: "translate(-50%, -48%) scale(0.96)" },
  to: { opacity: 1, transform: "translate(-50%, -50%) scale(1)" },
});

const contentOut = keyframes({
  from: { opacity: 1, transform: "translate(-50%, -50%) scale(1)" },
  to: { opacity: 0, transform: "translate(-50%, -48%) scale(0.96)" },
});

export const overlay = style({
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  zIndex: "var(--z-overlay)",
  selectors: {
    '&[data-state="open"]': {
      animation: `${fadeIn} var(--duration-fast) var(--easing-ease)`,
    },
    '&[data-state="closed"]': {
      animation: `${fadeOut} var(--duration-fast) var(--easing-ease)`,
    },
  },
});

export const content = style({
  position: "fixed",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90vw",
  maxWidth: "32rem",
  maxHeight: "85dvh",
  overflowY: "auto",
  backgroundColor: "var(--color-surface)",
  borderRadius: "var(--radius-lg)",
  boxShadow: "var(--shadow-lg)",
  padding: "var(--spacing-6)",
  zIndex: "var(--z-modal)",
  selectors: {
    '&[data-state="open"]': {
      animation: `${contentIn} var(--duration-fast) var(--easing-ease)`,
    },
    '&[data-state="closed"]': {
      animation: `${contentOut} var(--duration-fast) var(--easing-ease)`,
    },
    "&:focus": {
      outline: "none",
    },
  },
});

export const title = style({
  margin: "0 0 var(--spacing-2)",
  fontSize: "var(--font-size-lg)",
  fontWeight: "var(--font-weight-semibold)",
  color: "var(--color-text)",
  lineHeight: "var(--font-leading-tight)",
  paddingRight: "var(--spacing-6)",
});

export const description = style({
  margin: "0 0 var(--spacing-6)",
  fontSize: "var(--font-size-sm)",
  color: "var(--color-text-subtle)",
  lineHeight: "var(--font-leading-normal)",
});

export const close = style({
  position: "absolute",
  top: "var(--spacing-4)",
  right: "var(--spacing-4)",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "1.75rem",
  height: "1.75rem",
  borderRadius: "var(--radius-sm)",
  border: "none",
  background: "none",
  cursor: "pointer",
  color: "var(--color-text-subtle)",
  transition: "background-color var(--duration-fast) var(--easing-ease)",
  selectors: {
    "&:hover": {
      backgroundColor: "var(--color-surface-raised)",
      color: "var(--color-text)",
    },
    "&:focus-visible": {
      outline: "2px solid var(--color-focus-ring)",
      outlineOffset: "2px",
    },
  },
});
