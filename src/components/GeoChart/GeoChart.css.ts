import { style } from '@vanilla-extract/css';

export const wrapper = style({
  width: '100%',
  fontFamily: 'var(--font-family-sans)',
});

export const svg = style({
  display: 'block',
  width: '100%',
});

export const region = style({
  stroke: 'var(--color-surface)',
  strokeWidth: 0.5,
  transition: 'fill-opacity 0.15s ease',
  cursor: 'default',
  selectors: {
    '&:hover': { fillOpacity: 0.8 },
    '&:focus': { outline: 'none' },
    '&:focus-visible': { stroke: 'var(--color-focus-ring)', strokeWidth: 1.5 },
    '&[data-clickable]': { cursor: 'pointer' },
  },
  '@media': {
    '(prefers-reduced-motion: reduce)': { transition: 'none' },
  },
});

export const marker = style({
  stroke: 'var(--color-surface)',
  strokeWidth: 1,
  transition: 'fill-opacity 0.15s ease',
  cursor: 'default',
  selectors: {
    '&:hover': { fillOpacity: 0.8 },
    '&:focus': { outline: 'none' },
    '&:focus-visible': { stroke: 'var(--color-focus-ring)', strokeWidth: 2 },
    '&[data-clickable]': { cursor: 'pointer' },
  },
  '@media': {
    '(prefers-reduced-motion: reduce)': { transition: 'none' },
  },
});

export const legend = style({
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--spacing-2)',
  justifyContent: 'center',
  marginTop: 'var(--spacing-2)',
  fontSize: 'var(--font-size-xs)',
  color: 'var(--color-text-subtle)',
});

export const gradientBar = style({
  height: '8px',
  width: '120px',
  borderRadius: '4px',
});

export const srOnly = style({
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  borderWidth: 0,
});
