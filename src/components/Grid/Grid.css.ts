import { style, styleVariants } from '@vanilla-extract/css';

export const grid = style({
  display: 'grid',
  boxSizing: 'border-box',
  width: '100%',
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

export const alignments = styleVariants({
  start: { alignItems: 'start' },
  center: { alignItems: 'center' },
  end: { alignItems: 'end' },
  stretch: { alignItems: 'stretch' },
});

export const col = style({
  boxSizing: 'border-box',
  minWidth: 0,
});
