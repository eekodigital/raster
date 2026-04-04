import { globalKeyframes, style } from '@vanilla-extract/css';

globalKeyframes('draw', { to: { strokeDashoffset: '0' } });

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

export const segment = style({
  cursor: 'pointer',
  transition: 'opacity 0.15s ease, stroke-width 0.15s ease',
  selectors: {
    '&:hover': { opacity: 0.8 },
    '&:focus': { outline: 'none' },
    '&:focus-visible': { outline: '2px solid var(--color-focus-ring)', outlineOffset: '2px' },
    '&[data-dimmed]': { opacity: 0.3 },
  },
  '@media': {
    '(prefers-reduced-motion: reduce)': { transition: 'none', animation: 'none' },
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
  fontSize: 'var(--font-size-sm)',
  color: 'var(--color-text)',
});

export const legend = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: 'var(--spacing-2)',
  justifyContent: 'center',
  marginTop: 'var(--spacing-2)',
});

export const legendItem = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 'var(--spacing-1)',
  fontSize: 'var(--font-size-xs)',
  color: 'var(--color-text-subtle)',
});

export const legendSwatch = style({
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  flexShrink: 0,
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
