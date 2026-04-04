import { style, styleVariants } from "@vanilla-extract/css";

export const base = style({
  boxSizing: "border-box",
});

const spacingScale = [
  "1",
  "1-5",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "10",
  "12",
  "16",
  "20",
  "24",
] as const;

function spacingEntries(prop: "padding" | "paddingInline" | "paddingBlock") {
  const entries: Record<string, Record<string, string>> = {};
  for (const s of spacingScale) {
    entries[s] = { [prop]: `var(--spacing-${s})` };
  }
  return entries;
}

export const padding = styleVariants(spacingEntries("padding"));
export const paddingX = styleVariants(spacingEntries("paddingInline"));
export const paddingY = styleVariants(spacingEntries("paddingBlock"));
