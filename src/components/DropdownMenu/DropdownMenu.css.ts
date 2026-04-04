import { keyframes, style } from '@vanilla-extract/css';

const fadeIn = keyframes({
  from: { opacity: 0, transform: 'scale(0.97)' },
  to: { opacity: 1, transform: 'scale(1)' },
});

const fadeOut = keyframes({
  from: { opacity: 1, transform: 'scale(1)' },
  to: { opacity: 0, transform: 'scale(0.97)' },
});

export const content = style({
  position: 'fixed',
  minWidth: '10rem',
  backgroundColor: 'var(--color-surface)',
  border: 'var(--border-width-thin) solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  boxShadow: 'var(--shadow-md)',
  padding: 'var(--spacing-1)',
  zIndex: 'var(--z-dropdown)',
  selectors: {
    '&[data-state="open"]': {
      animation: `${fadeIn} var(--duration-fast) var(--easing-ease)`,
    },
    '&[data-state="closed"]': {
      animation: `${fadeOut} var(--duration-fast) var(--easing-ease)`,
    },
  },
});

const itemBase = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--spacing-2)',
  padding: 'var(--spacing-2) var(--spacing-3)',
  borderRadius: 'var(--radius-sm)',
  fontSize: 'var(--font-size-sm)',
  color: 'var(--color-text)',
  cursor: 'pointer',
  outline: 'none',
  userSelect: 'none' as const,
  position: 'relative' as const,
} as const;

export const item = style({
  ...itemBase,
  selectors: {
    '&[data-highlighted]': {
      backgroundColor: 'var(--color-surface-raised)',
    },
    '&[data-disabled]': {
      opacity: 'var(--opacity-disabled)',
      cursor: 'not-allowed',
      pointerEvents: 'none',
    },
  },
});

export const itemInset = style({
  paddingLeft: 'var(--spacing-8)',
});

export const checkboxItem = style({
  ...itemBase,
  paddingLeft: 'var(--spacing-7)',
  selectors: {
    '&[data-highlighted]': {
      backgroundColor: 'var(--color-surface-raised)',
    },
    '&[data-disabled]': {
      opacity: 'var(--opacity-disabled)',
      cursor: 'not-allowed',
    },
  },
});

export const radioItem = style({
  ...itemBase,
  paddingLeft: 'var(--spacing-7)',
  selectors: {
    '&[data-highlighted]': {
      backgroundColor: 'var(--color-surface-raised)',
    },
    '&[data-disabled]': {
      opacity: 'var(--opacity-disabled)',
      cursor: 'not-allowed',
    },
  },
});

export const itemIndicator = style({
  position: 'absolute',
  left: 'var(--spacing-2)',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 'var(--spacing-4)',
  height: 'var(--spacing-4)',
  selectors: {
    '[data-state="unchecked"] &': {
      display: 'none',
    },
  },
});

export const label = style({
  padding: 'var(--spacing-1) var(--spacing-3)',
  fontSize: 'var(--font-size-xs)',
  fontWeight: 'var(--font-weight-semibold)',
  color: 'var(--color-text-subtle)',
  userSelect: 'none',
});

export const separator = style({
  height: '1px',
  backgroundColor: 'var(--color-border)',
  margin: 'var(--spacing-1) calc(var(--spacing-3) * -1)',
});

export const subTrigger = style({
  ...itemBase,
  selectors: {
    '&[data-state="open"]': {
      backgroundColor: 'var(--color-surface-raised)',
    },
    '&[data-highlighted]': {
      backgroundColor: 'var(--color-surface-raised)',
    },
    // Chevron via pseudo-element
    '&::after': {
      content: '""',
      marginLeft: 'auto',
      width: '6px',
      height: '6px',
      borderRight: '1.5px solid var(--color-text)',
      borderBottom: '1.5px solid var(--color-text)',
      transform: 'rotate(-45deg)',
    },
  },
});
