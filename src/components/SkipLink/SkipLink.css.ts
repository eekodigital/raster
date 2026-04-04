import { style } from '@vanilla-extract/css';

export const skipLink = style({
  position: 'absolute',
  top: 'var(--spacing-2)',
  left: 'var(--spacing-2)',
  padding: 'var(--spacing-2) var(--spacing-4)',
  background: 'var(--color-interactive)',
  color: 'var(--color-interactive-text)',
  borderRadius: 'var(--radius-md)',
  fontWeight: 'var(--font-weight-medium)',
  fontSize: 'var(--font-size-sm)',
  textDecoration: 'none',
  zIndex: 9999,
  transform: 'translateY(-200%)',
  transition: 'transform var(--duration-fast) var(--easing-ease)',
  selectors: {
    '&:focus': {
      transform: 'translateY(0)',
      outline: 'none',
      boxShadow: 'var(--focus-ring)',
    },
  },
});
