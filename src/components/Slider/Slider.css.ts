import { style } from '@vanilla-extract/css';

export const root = style({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  userSelect: 'none',
  touchAction: 'none',
  width: '100%',
  selectors: {
    '&[data-orientation="horizontal"]': {
      height: '1.25rem',
    },
    '&[data-orientation="vertical"]': {
      flexDirection: 'column',
      width: '1.25rem',
      height: '100%',
      minHeight: '6rem',
    },
  },
});

export const track = style({
  backgroundColor: 'var(--color-surface-raised)',
  position: 'relative',
  flexGrow: 1,
  borderRadius: '9999px',
  selectors: {
    '[data-orientation="horizontal"] &': {
      height: '4px',
    },
    '[data-orientation="vertical"] &': {
      width: '4px',
    },
  },
});

export const range = style({
  position: 'absolute',
  backgroundColor: 'var(--color-interactive)',
  borderRadius: '9999px',
  height: '100%',
  selectors: {
    '[data-disabled] &': {
      backgroundColor: 'var(--color-border-strong)',
    },
  },
});

export const thumb = style({
  display: 'block',
  width: '1.125rem',
  height: '1.125rem',
  backgroundColor: 'var(--color-surface)',
  border: '2px solid var(--color-interactive)',
  borderRadius: '50%',
  boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
  cursor: 'pointer',
  position: 'relative',
  transition: 'background-color var(--duration-fast) var(--easing-ease)',
  selectors: {
    '&::before': {
      content: '""',
      position: 'absolute',
      inset: '-6px',
      borderRadius: '50%',
      background: 'var(--color-interactive)',
      opacity: 0,
      transition: 'opacity var(--duration-fast) var(--easing-ease)',
    },
    '&:hover::before': {
      opacity: 0.2,
    },
    '[data-theme="dark"] &:hover::before': {
      opacity: 0.3,
    },
    '&:focus-visible': {
      outline: '2px solid var(--color-focus-ring)',
      outlineOffset: '2px',
    },
    '[data-disabled] &': {
      borderColor: 'var(--color-border-strong)',
      cursor: 'not-allowed',
    },
    '[data-disabled] &::before': {
      display: 'none',
    },
  },
});
