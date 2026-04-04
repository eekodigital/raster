import { style, styleVariants } from '@vanilla-extract/css';

export const root = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '9999px',
  fontFamily: 'var(--font-family-sans)',
  fontSize: 'var(--font-size-xs)',
  fontWeight: 'var(--font-weight-semibold)',
  lineHeight: 1,
  minWidth: '1.25rem',
  height: '1.25rem',
  padding: '0 var(--spacing-1-5)',
  whiteSpace: 'nowrap',
});

export const variants = styleVariants({
  neutral: {
    color: 'var(--color-text-subtle)',
    background: 'var(--color-inactive-bg)',
    outline: '1px solid var(--color-border)',
  },
  primary: {
    color: 'var(--color-interactive-text)',
    background: 'var(--color-interactive)',
  },
  success: {
    color: 'var(--color-success)',
    background: 'var(--color-success-bg)',
    outline: '1px solid var(--color-success-border)',
  },
  danger: {
    color: 'var(--color-danger)',
    background: 'var(--color-danger-bg)',
    outline: '1px solid var(--color-danger-border)',
  },
  warning: {
    color: 'var(--color-warning)',
    background: 'var(--color-warning-bg)',
    outline: '1px solid var(--color-warning-border)',
  },
});
