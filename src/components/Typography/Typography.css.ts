import { style, styleVariants } from '@vanilla-extract/css';

export const base = style({
  margin: 0,
  fontFamily: 'var(--font-family-sans)',
  color: 'var(--color-text)',
});

// Heading sizes
export const headingSizes = styleVariants({
  '1': {
    fontFamily: 'var(--font-family-serif)',
    fontSize: 'var(--font-size-4xl)',
    fontWeight: 'var(--font-weight-bold)',
    lineHeight: 'var(--font-leading-tight)',
    letterSpacing: 'var(--font-tracking-tight)',
  },
  '2': {
    fontFamily: 'var(--font-family-serif)',
    fontSize: 'var(--font-size-3xl)',
    fontWeight: 'var(--font-weight-bold)',
    lineHeight: 'var(--font-leading-tight)',
    letterSpacing: 'var(--font-tracking-tight)',
  },
  '3': {
    fontFamily: 'var(--font-family-sans)',
    fontSize: 'var(--font-size-2xl)',
    fontWeight: 'var(--font-weight-semibold)',
    lineHeight: 'var(--font-leading-snug)',
  },
  '4': {
    fontFamily: 'var(--font-family-sans)',
    fontSize: 'var(--font-size-xl)',
    fontWeight: 'var(--font-weight-semibold)',
    lineHeight: 'var(--font-leading-snug)',
  },
  '5': {
    fontFamily: 'var(--font-family-sans)',
    fontSize: 'var(--font-size-lg)',
    fontWeight: 'var(--font-weight-medium)',
    lineHeight: 'var(--font-leading-normal)',
  },
  '6': {
    fontFamily: 'var(--font-family-sans)',
    fontSize: 'var(--font-size-base)',
    fontWeight: 'var(--font-weight-medium)',
    lineHeight: 'var(--font-leading-normal)',
  },
});

// Text sizes
export const textSizes = styleVariants({
  sm: {
    fontSize: 'var(--font-size-sm)',
    lineHeight: 'var(--font-leading-normal)',
  },
  base: {
    fontSize: 'var(--font-size-base)',
    lineHeight: 'var(--font-leading-normal)',
  },
  lg: {
    fontSize: 'var(--font-size-lg)',
    lineHeight: 'var(--font-leading-relaxed)',
  },
});

// Text variants (colour)
export const textVariants = styleVariants({
  default: {
    color: 'var(--color-text)',
  },
  subtle: {
    color: 'var(--color-text-subtle)',
  },
  strong: {
    color: 'var(--color-text)',
    fontWeight: 'var(--font-weight-semibold)',
  },
  danger: {
    color: 'var(--color-danger)',
  },
});
