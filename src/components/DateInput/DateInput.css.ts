import { style } from '@vanilla-extract/css';

export const field = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--spacing-1)',
  selectors: {
    '&[data-error]': {
      borderLeft: '4px solid var(--color-danger)',
      paddingLeft: 'var(--spacing-3)',
    },
  },
});

export const inputs = style({
  display: 'flex',
  gap: 'var(--spacing-3)',
  alignItems: 'flex-end',
  flexWrap: 'wrap',
});

export const inputGroup = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--spacing-1)',
});

export const inputLabel = style({
  fontSize: 'var(--font-size-xs)',
  color: 'var(--color-text-subtle)',
  fontWeight: 'var(--font-weight-medium)',
});

export const input = style({
  padding: 'var(--spacing-2)',
  border: '1px solid var(--color-border-strong)',
  borderRadius: 'var(--radius-sm)',
  fontFamily: 'inherit',
  fontSize: 'var(--font-size-base)',
  background: 'var(--color-surface)',
  color: 'var(--color-text)',
  appearance: 'none',
  MozAppearance: 'textfield',
  selectors: {
    '&:focus-visible': {
      outline: 'none',
      boxShadow: 'var(--focus-ring)',
    },
    '&[data-error]': {
      borderColor: 'var(--color-danger)',
    },
    '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
      appearance: 'none',
    },
  },
});

export const inputDay = style({ width: '3.5rem' });
export const inputMonth = style({ width: '3.5rem' });
export const inputYear = style({ width: '5rem' });
