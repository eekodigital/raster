import { keyframes, style } from '@vanilla-extract/css';

const fadeIn = keyframes({
  from: { opacity: 0 },
  to: { opacity: 1 },
});

export const wrapper = style({
  width: '100%',
  fontFamily: 'var(--font-family-sans)',
});

export const svg = style({
  display: 'block',
  width: '100%',
  overflow: 'visible',
});

export const point = style({
  animation: `${fadeIn} 0.3s ease both`,
  transition: 'r 0.15s ease',
  cursor: 'default',
  selectors: {
    '&:hover': { r: '6' },
    '&:focus': { outline: 'none' },
    '&:focus-visible': { r: '7', stroke: 'var(--color-focus-ring)', strokeWidth: '2' },
    '&[data-clickable]': { cursor: 'pointer' },
  },
  '@media': {
    '(prefers-reduced-motion: reduce)': { animation: 'none', transition: 'none' },
  },
});

export const axisLine = style({
  stroke: 'var(--color-border)',
  strokeWidth: 1,
});

export const gridLine = style({
  stroke: 'var(--color-border)',
  strokeWidth: 1,
  strokeDasharray: '2,4',
});

export const tickLabel = style({
  fontSize: 'var(--font-size-xs)',
  fill: 'var(--color-text-subtle)',
});

export const axisTitle = style({
  fontSize: 'var(--font-size-xs)',
  fill: 'var(--color-text-subtle)',
  fontWeight: 'var(--font-weight-medium)',
});

export const legendItem = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 'var(--spacing-1)',
  fontSize: 'var(--font-size-xs)',
  color: 'var(--color-text-subtle)',
});

export const legendDot = style({
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  flexShrink: 0,
});

export const legend = style({
  display: 'flex',
  gap: 'var(--spacing-3)',
  justifyContent: 'center',
  marginTop: 'var(--spacing-2)',
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
