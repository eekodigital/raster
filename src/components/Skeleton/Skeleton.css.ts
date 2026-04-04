import { keyframes, style, styleVariants } from '@vanilla-extract/css';

const shimmer = keyframes({
  '0%': { backgroundPosition: '-200% 0' },
  '100%': { backgroundPosition: '200% 0' },
});

export const root = style({
  display: 'block',
  borderRadius: 'var(--radius-md)',
  background: `linear-gradient(
    90deg,
    var(--color-surface-raised) 25%,
    var(--color-border) 50%,
    var(--color-surface-raised) 75%
  )`,
  backgroundSize: '200% 100%',
  animation: `${shimmer} 1.5s ease-in-out infinite`,
});

export const variants = styleVariants({
  text: {
    height: '1em',
    borderRadius: '4px',
  },
  heading: {
    height: '1.5em',
    borderRadius: '4px',
  },
  circular: {
    borderRadius: '50%',
  },
  rectangular: {
    borderRadius: 'var(--radius-md)',
  },
});
