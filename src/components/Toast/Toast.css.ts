import { keyframes, style } from '@vanilla-extract/css';

const slideIn = keyframes({
  from: { transform: 'translateX(calc(100% + var(--spacing-4)))' },
  to: { transform: 'translateX(0)' },
});

const slideOut = keyframes({
  from: { transform: 'translateX(0)' },
  to: { transform: 'translateX(calc(100% + var(--spacing-4)))' },
});

const fadeIn = keyframes({
  from: { opacity: 0 },
  to: { opacity: 1 },
});

export const viewport = style({
  position: 'fixed',
  bottom: 'var(--spacing-4)',
  right: 'var(--spacing-4)',
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--spacing-2)',
  width: '22rem',
  maxWidth: '100vw',
  margin: 0,
  padding: 0,
  listStyle: 'none',
  zIndex: 'var(--z-toast)',
  outline: 'none',
});

export const root = style({
  position: 'relative',
  backgroundColor: 'var(--color-surface)',
  border: 'var(--border-width-thin) solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  boxShadow: 'var(--shadow-lg)',
  padding: 'var(--spacing-4)',
  display: 'grid',
  gridTemplateAreas: '"title action" "description action"',
  gridTemplateColumns: 'auto max-content',
  columnGap: 'var(--spacing-4)',
  alignItems: 'center',
  selectors: {
    '&[data-state="open"]': {
      animation: `${slideIn} var(--duration-fast) var(--easing-ease), ${fadeIn} var(--duration-fast) var(--easing-ease)`,
    },
    '&[data-state="closed"]': {
      animation: `${slideOut} var(--duration-fast) var(--easing-ease)`,
    },
  },
});

export const title = style({
  gridArea: 'title',
  fontWeight: 'var(--font-weight-medium)',
  fontSize: 'var(--font-size-sm)',
  color: 'var(--color-text)',
  marginBottom: 'var(--spacing-1)',
});

export const description = style({
  gridArea: 'description',
  fontSize: 'var(--font-size-sm)',
  color: 'var(--color-text-subtle)',
  lineHeight: 'var(--font-leading-normal)',
});

export const action = style({
  gridArea: 'action',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: 'inherit',
  fontSize: 'var(--font-size-xs)',
  fontWeight: 'var(--font-weight-medium)',
  color: 'var(--color-interactive)',
  background: 'none',
  border: 'var(--border-width-thin) solid var(--color-interactive)',
  borderRadius: 'var(--radius-sm)',
  padding: 'var(--spacing-1) var(--spacing-2)',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  selectors: {
    '&:hover': {
      backgroundColor: 'var(--color-interactive-subtle)',
    },
    '&:focus-visible': {
      outline: '2px solid var(--color-focus-ring)',
      outlineOffset: '2px',
    },
  },
});

export const close = style({
  position: 'absolute',
  top: 'var(--spacing-2)',
  right: 'var(--spacing-2)',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '1.25rem',
  height: '1.25rem',
  borderRadius: 'var(--radius-sm)',
  border: 'none',
  background: 'none',
  cursor: 'pointer',
  color: 'var(--color-text-subtle)',
  fontSize: 'var(--font-size-xs)',
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
