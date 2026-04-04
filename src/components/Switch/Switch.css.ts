import { style } from '@vanilla-extract/css';

export const root = style({
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  width: '2.75rem',
  height: '1.5rem',
  flexShrink: 0,
  cursor: 'pointer',
  border: 'none',
  borderRadius: '9999px',
  backgroundColor: 'var(--color-border-strong)',
  padding: 0,
  transition: 'background-color var(--duration-fast) var(--easing-ease)',
  selectors: {
    '&[data-state="checked"]': {
      backgroundColor: 'var(--color-interactive)',
    },
    '&[data-disabled]': {
      opacity: 'var(--opacity-disabled)',
      cursor: 'not-allowed',
    },
    '&:focus-visible': {
      outline: '2px solid var(--color-focus-ring)',
      outlineOffset: '2px',
    },
  },
});

export const thumb = style({
  display: 'block',
  width: '1.125rem',
  height: '1.125rem',
  borderRadius: '9999px',
  backgroundColor: 'var(--color-surface)',
  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
  transform: 'translateX(0.1875rem)',
  transition: 'transform var(--duration-fast) var(--easing-ease)',
  selectors: {
    '[data-state="checked"] &': {
      transform: 'translateX(1.4375rem)',
    },
  },
});
