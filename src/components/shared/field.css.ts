import { style } from '@vanilla-extract/css';

// Shared field wrapper styles used by all field components
// (TextInputField, TextareaField, SelectField, CheckboxGroup, RadioGroup)

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

export const label = style({
  fontSize: 'var(--font-size-base)',
  fontWeight: 'var(--font-weight-medium)',
  color: 'var(--color-text)',
  lineHeight: 'var(--font-leading-tight)',
});

export const hint = style({
  fontSize: 'var(--font-size-sm)',
  color: 'var(--color-text-subtle)',
  lineHeight: 'var(--font-leading-normal)',
});

export const error = style({
  fontSize: 'var(--font-size-sm)',
  fontWeight: 'var(--font-weight-medium)',
  color: 'var(--color-danger)',
  lineHeight: 'var(--font-leading-normal)',
});

export const errorPrefix = style({
  position: 'absolute',
  width: '1px',
  height: '1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
});

export const characterCount = style({
  fontSize: 'var(--font-size-sm)',
  color: 'var(--color-text-subtle)',
  textAlign: 'right',
});

export const characterCountOver = style({
  color: 'var(--color-danger)',
  fontWeight: 'var(--font-weight-medium)',
});
