import { style } from '@vanilla-extract/css';

export const list = style({
  display: 'flex',
  borderBottom: 'var(--border-width-thin) solid var(--color-border)',
  gap: 'var(--spacing-1)',
});

export const trigger = style({
  padding: 'var(--spacing-2) var(--spacing-3)',
  border: 'none',
  borderBottom: '2px solid transparent',
  background: 'none',
  fontFamily: 'inherit',
  fontSize: 'var(--font-size-sm)',
  fontWeight: 'var(--font-weight-medium)',
  color: 'var(--color-text-subtle)',
  cursor: 'pointer',
  marginBottom: '-1px',
  transition:
    'color var(--duration-fast) var(--easing-ease), border-color var(--duration-fast) var(--easing-ease)',
  selectors: {
    '&[data-state="active"]': {
      color: 'var(--color-interactive)',
      borderBottomColor: 'var(--color-interactive)',
    },
    '&:hover:not([data-state="active"])': {
      color: 'var(--color-text)',
    },
    '&:focus-visible': {
      outline: '2px solid var(--color-focus-ring)',
      outlineOffset: '2px',
      borderRadius: 'var(--radius-sm)',
    },
    '&[data-disabled]': {
      opacity: 'var(--opacity-disabled)',
      cursor: 'not-allowed',
    },
  },
});

export const content = style({
  paddingTop: 'var(--spacing-4)',
  selectors: {
    '&:focus-visible': {
      outline: '2px solid var(--color-focus-ring)',
      outlineOffset: '2px',
    },
  },
});
