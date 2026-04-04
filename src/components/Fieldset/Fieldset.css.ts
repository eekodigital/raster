import { style } from '@vanilla-extract/css';

export const fieldset = style({
  border: 'none',
  margin: 0,
  padding: 0,
});

export const legend = style({
  fontWeight: 'var(--font-weight-medium)',
  fontSize: 'var(--font-size-lg)',
  marginBottom: 'var(--spacing-3)',
  padding: 0,
  width: '100%',
});

export const hint = style({
  display: 'block',
  fontSize: 'var(--font-size-sm)',
  color: 'var(--color-text-subtle)',
  marginTop: 'var(--spacing-1)',
  marginBottom: 'var(--spacing-2)',
});
