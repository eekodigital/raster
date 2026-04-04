import { style, styleVariants } from '@vanilla-extract/css';

export const base = style({
  display: 'flex',
});

export const directions = styleVariants({
  row: { flexDirection: 'row' },
  column: { flexDirection: 'column' },
});

export const wrapping = styleVariants({
  wrap: { flexWrap: 'wrap' },
  nowrap: { flexWrap: 'nowrap' },
});

export const alignments = styleVariants({
  start: { alignItems: 'flex-start' },
  center: { alignItems: 'center' },
  end: { alignItems: 'flex-end' },
  baseline: { alignItems: 'baseline' },
  stretch: { alignItems: 'stretch' },
});

export const justifications = styleVariants({
  start: { justifyContent: 'flex-start' },
  center: { justifyContent: 'center' },
  end: { justifyContent: 'flex-end' },
  between: { justifyContent: 'space-between' },
  around: { justifyContent: 'space-around' },
});

const spacingScale = [
  '1',
  '1-5',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '10',
  '12',
  '16',
  '20',
  '24',
] as const;

function gapEntries() {
  const entries: Record<string, Record<string, string>> = {};
  for (const s of spacingScale) {
    entries[s] = { gap: `var(--spacing-${s})` };
  }
  return entries;
}

export const gaps = styleVariants(gapEntries());
