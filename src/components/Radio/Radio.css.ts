import { style } from '@vanilla-extract/css';

export const item = style({
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--spacing-2)',
});

// Radix RadioGroup.Item renders a <button role="radio"> with data-state
export const root = style({
  flexShrink: 0,
  width: '1.375rem',
  height: '1.375rem',
  margin: 0,
  padding: 0,
  cursor: 'pointer',
  appearance: 'none',
  border: 'var(--border-width-thin) solid var(--color-border-strong)',
  borderRadius: '50%',
  backgroundColor: 'var(--color-surface)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'border-color var(--duration-fast) var(--easing-ease)',
  selectors: {
    '&[data-state="checked"]': {
      borderColor: 'var(--color-interactive)',
    },
    '&:focus-visible': {
      outline: '2px solid var(--color-focus-ring)',
      outlineOffset: '2px',
    },
    '&[data-disabled]': {
      opacity: 'var(--opacity-disabled)',
      cursor: 'not-allowed',
    },
  },
});

// Radix RadioGroup.Indicator — only rendered when checked
export const indicator = style({
  width: '0.625rem',
  height: '0.625rem',
  borderRadius: '50%',
  backgroundColor: 'var(--color-interactive)',
  selectors: {
    '[data-state="unchecked"] &': {
      display: 'none',
    },
  },
});

export const label = style({
  fontSize: 'var(--font-size-base)',
  color: 'var(--color-text)',
  lineHeight: 'var(--font-leading-normal)',
  cursor: 'pointer',
  selectors: {
    '[data-disabled] ~ &': {
      opacity: 'var(--opacity-disabled)',
      cursor: 'not-allowed',
    },
  },
});

// Group wrapper — div instead of fieldset; uses aria-labelledby
export const group = style({
  margin: 0,
  padding: 0,
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

export const legend = style({
  display: 'block',
  fontSize: 'var(--font-size-base)',
  fontWeight: 'var(--font-weight-semibold)',
  color: 'var(--color-text)',
  lineHeight: 'var(--font-leading-tight)',
  marginBottom: 'var(--spacing-1)',
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

export const items = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--spacing-2)',
});
