import { style } from '@vanilla-extract/css';

export const root = style({
  display: 'contents',
});

export const inputWrapper = style({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
});

export const input = style({
  display: 'block',
  width: '100%',
  fontFamily: 'inherit',
  fontSize: 'var(--font-size-base)',
  lineHeight: 'var(--font-leading-normal)',
  color: 'var(--color-text)',
  backgroundColor: 'var(--color-surface)',
  border: 'var(--border-width-thin) solid var(--color-border-strong)',
  borderRadius: 'var(--radius-md)',
  padding: 'var(--spacing-2) var(--spacing-10) var(--spacing-2) var(--spacing-3)',
  appearance: 'none',
  transition:
    'border-color var(--duration-fast) var(--easing-ease), box-shadow var(--duration-fast) var(--easing-ease)',
  selectors: {
    '&:focus': {
      outline: 'none',
      borderColor: 'var(--color-interactive)',
      boxShadow: 'var(--focus-ring)',
    },
    '&:disabled': {
      opacity: 'var(--opacity-disabled)',
      cursor: 'not-allowed',
      backgroundColor: 'var(--color-surface-raised)',
    },
    '&::placeholder': {
      color: 'var(--color-text-subtle)',
    },
  },
});

export const inputError = style({
  borderColor: 'var(--color-danger)',
  selectors: {
    '&:focus': {
      borderColor: 'var(--color-danger)',
      boxShadow: '0 0 0 3px var(--color-danger-border)',
    },
  },
});

export const toggle = style({
  position: 'absolute',
  right: 'var(--spacing-3)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 'var(--spacing-1)',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: 'var(--color-text-subtle)',
  borderRadius: 'var(--radius-sm)',
  transition: 'color var(--duration-fast) var(--easing-ease)',
  selectors: {
    '&:hover': {
      color: 'var(--color-text)',
    },
    '&:focus-visible': {
      outline: '2px solid var(--color-focus-ring)',
      outlineOffset: '2px',
    },
  },
});
