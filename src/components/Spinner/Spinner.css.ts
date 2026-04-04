import { keyframes, style, styleVariants } from '@vanilla-extract/css';

const spin = keyframes({
  from: { transform: 'rotate(0deg)' },
  to: { transform: 'rotate(360deg)' },
});

export const root = style({
  display: 'inline-block',
  borderRadius: '50%',
  border: '2px solid var(--color-border)',
  borderTopColor: 'var(--color-interactive)',
  animation: `${spin} 0.7s linear infinite`,
  flexShrink: 0,
});

export const sizes = styleVariants({
  sm: { width: '1rem', height: '1rem' },
  md: { width: '1.5rem', height: '1.5rem' },
  lg: { width: '2rem', height: '2rem' },
});
