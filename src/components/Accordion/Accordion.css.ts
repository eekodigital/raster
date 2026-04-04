import { keyframes, style } from '@vanilla-extract/css';

const slideDown = keyframes({
  from: { height: '0' },
  to: { height: 'var(--radix-accordion-content-height)' },
});

const slideUp = keyframes({
  from: { height: 'var(--radix-accordion-content-height)' },
  to: { height: '0' },
});

export const root = style({
  borderTop: 'var(--border-width-thin) solid var(--color-border)',
  width: '100%',
});

export const item = style({
  borderBottom: 'var(--border-width-thin) solid var(--color-border)',
});

export const trigger = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
  padding: 'var(--spacing-4) 0',
  background: 'none',
  border: 'none',
  fontFamily: 'inherit',
  fontSize: 'var(--font-size-base)',
  fontWeight: 'var(--font-weight-medium)',
  color: 'var(--color-text)',
  cursor: 'pointer',
  textAlign: 'left',
  // Chevron via pseudo-element
  selectors: {
    '&::after': {
      content: '""',
      flexShrink: 0,
      width: '8px',
      height: '8px',
      borderRight: '1.5px solid var(--color-text)',
      borderBottom: '1.5px solid var(--color-text)',
      transform: 'rotate(45deg) translateY(-2px)',
      transition: 'transform var(--duration-fast) var(--easing-ease)',
    },
    '&[data-state="open"]::after': {
      transform: 'rotate(-135deg) translateY(-2px)',
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
  overflow: 'hidden',
  paddingBottom: 'var(--spacing-4)',
  selectors: {
    '&[data-state="open"]': {
      animation: `${slideDown} var(--duration-fast) var(--easing-ease)`,
    },
    '&[data-state="closed"]': {
      animation: `${slideUp} var(--duration-fast) var(--easing-ease)`,
    },
  },
});
