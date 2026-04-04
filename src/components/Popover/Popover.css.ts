import { keyframes, style } from '@vanilla-extract/css';

const fadeIn = keyframes({
  from: { opacity: 0, transform: 'scale(0.97)' },
  to: { opacity: 1, transform: 'scale(1)' },
});

const fadeOut = keyframes({
  from: { opacity: 1, transform: 'scale(1)' },
  to: { opacity: 0, transform: 'scale(0.97)' },
});

export const content = style({
  position: 'fixed',
  backgroundColor: 'var(--color-surface)',
  border: 'var(--border-width-thin) solid var(--color-border)',
  borderRadius: 'var(--radius-lg)',
  boxShadow: 'var(--shadow-md)',
  padding: 'var(--spacing-4)',
  zIndex: 'var(--z-dropdown)',
  selectors: {
    '&[data-state="open"]': {
      animation: `${fadeIn} var(--duration-fast) var(--easing-ease)`,
    },
    '&[data-state="closed"]': {
      animation: `${fadeOut} var(--duration-fast) var(--easing-ease)`,
    },
    '&:focus': {
      outline: 'none',
    },
  },
});

export const arrow = style({
  fill: 'var(--color-border)',
});

export const close = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '1.5rem',
  height: '1.5rem',
  borderRadius: 'var(--radius-sm)',
  border: 'none',
  background: 'none',
  cursor: 'pointer',
  color: 'var(--color-text-subtle)',
  transition: 'background-color var(--duration-fast) var(--easing-ease)',
  selectors: {
    '&:hover': {
      backgroundColor: 'var(--color-surface-raised)',
      color: 'var(--color-text)',
    },
    '&:focus-visible': {
      outline: '2px solid var(--color-focus-ring)',
      outlineOffset: '2px',
    },
  },
});
