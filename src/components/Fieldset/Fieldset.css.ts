import { style } from "@vanilla-extract/css";

export const fieldset = style({
  border: "none",
  margin: 0,
  padding: 0,
  // Stack the legend + child fields with the same gap forms use, so
  // consumers don't have to reach for a layout wrapper around every
  // Fieldset to get sensible vertical rhythm.
  display: "flex",
  flexDirection: "column",
  gap: "var(--spacing-4)",
});

export const legend = style({
  fontWeight: "var(--font-weight-medium)",
  fontSize: "var(--font-size-lg)",
  // Spacing to the first field is now handled by the fieldset's flex gap.
  padding: 0,
  width: "100%",
});

export const hint = style({
  display: "block",
  fontSize: "var(--font-size-sm)",
  color: "var(--color-text-subtle)",
  marginTop: "var(--spacing-1)",
  marginBottom: "var(--spacing-2)",
});
