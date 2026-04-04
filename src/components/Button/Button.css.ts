import { style } from '@vanilla-extract/css';

export const button = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 'var(--spacing-2)',
  borderRadius: 'var(--radius-md)',
  fontFamily: 'inherit',
  fontWeight: 'var(--font-weight-medium)',
  lineHeight: 'var(--font-leading-tight)',
  cursor: 'pointer',
  transition:
    'background-color var(--duration-fast) var(--easing-ease), color var(--duration-fast) var(--easing-ease), border-color var(--duration-fast) var(--easing-ease), box-shadow var(--duration-fast) var(--easing-ease)',
  textDecoration: 'none',
  whiteSpace: 'nowrap',
  border: 'var(--border-width-thin) solid transparent',
  selectors: {
    '&:focus-visible': { outline: 'none', boxShadow: 'var(--focus-ring)' },
    '&:disabled': { opacity: 'var(--opacity-disabled)', cursor: 'not-allowed' },
  },
});

export const sm = style({
  padding: 'var(--spacing-1) var(--spacing-3)',
  fontSize: 'var(--font-size-sm)',
});

export const md = style({
  padding: 'var(--spacing-2) var(--spacing-4)',
  fontSize: 'var(--font-size-base)',
});

export const lg = style({
  padding: 'var(--spacing-3) var(--spacing-6)',
  fontSize: 'var(--font-size-lg)',
});

export const primary = style({
  backgroundColor: 'var(--color-interactive)',
  color: 'var(--color-interactive-text)',
  borderColor: 'var(--color-interactive)',
  selectors: {
    '&:hover:not(:disabled)': {
      backgroundColor: 'var(--color-interactive-hover)',
      borderColor: 'var(--color-interactive-hover)',
      color: 'var(--color-interactive-text)',
    },
    '&:active:not(:disabled)': {
      backgroundColor: 'var(--color-interactive-active)',
      borderColor: 'var(--color-interactive-active)',
    },
  },
});

export const secondary = style({
  backgroundColor: 'transparent',
  color: 'var(--color-interactive)',
  borderColor: 'var(--color-interactive)',
  selectors: {
    '&:hover:not(:disabled)': {
      backgroundColor: 'var(--color-interactive-subtle)',
      borderColor: 'var(--color-interactive-hover)',
      color: 'var(--color-interactive-hover)',
    },
    '&:active:not(:disabled)': {
      backgroundColor: 'var(--color-interactive-subtle)',
      borderColor: 'var(--color-interactive-active)',
      color: 'var(--color-interactive-active)',
    },
  },
});

export const danger = style({
  backgroundColor: 'transparent',
  color: 'var(--color-danger)',
  borderColor: 'var(--color-danger)',
  selectors: {
    '&:hover:not(:disabled)': {
      backgroundColor: 'color-mix(in srgb, var(--color-danger) 10%, transparent)',
    },
    '&:active:not(:disabled)': {
      backgroundColor: 'color-mix(in srgb, var(--color-danger) 20%, transparent)',
    },
  },
});
