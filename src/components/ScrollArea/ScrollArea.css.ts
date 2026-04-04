import { style } from '@vanilla-extract/css';

export const root = style({
  overflow: 'hidden',
  position: 'relative',
});

export const viewport = style({
  width: '100%',
  height: '100%',
  borderRadius: 'inherit',
});

export const scrollbar = style({
  display: 'flex',
  userSelect: 'none',
  touchAction: 'none',
  padding: '2px 2px 0',
  background: 'transparent',
  transition: 'background var(--duration-fast) var(--easing-ease)',
  selectors: {
    '&:hover': {
      background: 'var(--color-surface-raised)',
    },
    '&[data-orientation="vertical"]': {
      width: '10px',
    },
    '&[data-orientation="horizontal"]': {
      flexDirection: 'column',
      height: '10px',
    },
  },
});

export const thumb = style({
  flex: 1,
  background: 'var(--color-border-strong)',
  borderRadius: '9999px',
  position: 'relative',
  selectors: {
    '&::before': {
      content: '""',
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '100%',
      height: '100%',
      minWidth: '44px',
      minHeight: '44px',
    },
    '&:hover': {
      background: 'var(--color-interactive)',
    },
  },
});

export const corner = style({
  background: 'var(--color-surface-raised)',
});
