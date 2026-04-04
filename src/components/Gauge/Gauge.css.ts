import { style } from '@vanilla-extract/css';

export const wrapper = style({
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: 'var(--font-family-sans)',
});

export const svg = style({
  display: 'block',
});

export const track = style({
  opacity: 0.15,
});

export const fill = style({
  transition: 'stroke-dashoffset 0.6s ease',
  '@media': {
    '(prefers-reduced-motion: reduce)': { transition: 'none' },
  },
});

export const centre = style({
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  pointerEvents: 'none',
  textAlign: 'center',
});

export const value = style({
  fontSize: 'var(--font-size-2xl)',
  fontWeight: 'var(--font-weight-bold)',
  color: 'var(--color-text)',
  lineHeight: 1,
});

export const label = style({
  fontSize: 'var(--font-size-xs)',
  color: 'var(--color-text-subtle)',
});
