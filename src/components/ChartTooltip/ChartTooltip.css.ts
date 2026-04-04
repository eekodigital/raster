import { style } from '@vanilla-extract/css';

export const tooltip = style({
  position: 'absolute',
  pointerEvents: 'none',
  padding: 'var(--spacing-1) var(--spacing-2)',
  background: 'var(--color-text)',
  color: 'var(--color-text-inverse)',
  fontSize: 'var(--font-size-xs)',
  fontFamily: 'var(--font-family-sans)',
  borderRadius: 'var(--radius-sm)',
  whiteSpace: 'nowrap',
  zIndex: 10,
  opacity: 0,
  transition: 'opacity 0.15s ease',
  selectors: {
    '&[data-visible]': { opacity: 1 },
  },
  '@media': {
    '(prefers-reduced-motion: reduce)': { transition: 'none' },
  },
});
