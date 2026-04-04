import { keyframes, style } from '@vanilla-extract/css';

const indeterminate = keyframes({
  '0%': { transform: 'translateX(-100%)' },
  '100%': { transform: 'translateX(400%)' },
});

export const root = style({
  position: 'relative',
  overflow: 'hidden',
  backgroundColor: 'var(--color-surface-raised)',
  borderRadius: '9999px',
  width: '100%',
  height: '0.5rem',
});

export const indicator = style({
  height: '100%',
  backgroundColor: 'var(--color-interactive)',
  borderRadius: '9999px',
  transition: 'transform var(--duration-slow) var(--easing-ease)',
  selectors: {
    '[data-state="indeterminate"] &': {
      width: '40%',
      animation: `${indeterminate} 1.5s ease-in-out infinite`,
    },
  },
});
