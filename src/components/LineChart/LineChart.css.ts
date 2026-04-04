import { keyframes, style } from '@vanilla-extract/css';

const drawIn = keyframes({
  from: { strokeDashoffset: 'var(--line-length)' },
  to: { strokeDashoffset: '0' },
});

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

export const line = style({
  fill: 'none',
  strokeWidth: 2,
  strokeLinejoin: 'round',
  strokeLinecap: 'round',
  animation: `${drawIn} 0.8s ease both`,
  '@media': {
    '(prefers-reduced-motion: reduce)': { animation: 'none' },
  },
});

export const area = style({
  opacity: 0.15,
  animation: `${fadeIn} 0.6s ease 0.4s both`,
  '@media': {
    '(prefers-reduced-motion: reduce)': { animation: 'none' },
  },
});

export const point = style({
  cursor: 'pointer',
  transition: 'r 0.15s ease, opacity 0.15s ease',
  animation: `${fadeIn} 0.3s ease 0.6s both`,
  selectors: {
    '&:hover': { r: '5' },
    '&:focus': { outline: 'none' },
    '&:focus-visible': { r: '6', stroke: 'var(--color-focus-ring)', strokeWidth: '2' },
    '&[data-selected]': { r: '5', stroke: 'var(--color-text)', strokeWidth: '2' },
    '&[data-dimmed]': { opacity: 0.3 },
  },
  '@media': {
    '(prefers-reduced-motion: reduce)': { transition: 'none', animation: 'none' },
  },
});

export const axisLine = style({
  stroke: 'var(--color-border)',
  strokeWidth: 1,
});

export const tickLabel = style({
  fontSize: 'var(--font-size-xs)',
  fill: 'var(--color-text-subtle)',
});

export const legendItem = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 'var(--spacing-1)',
  fontSize: 'var(--font-size-xs)',
  color: 'var(--color-text-subtle)',
});

export const legendSwatch = style({
  width: '12px',
  height: '3px',
  borderRadius: '2px',
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
