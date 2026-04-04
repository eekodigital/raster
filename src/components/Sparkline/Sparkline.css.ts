import { style } from '@vanilla-extract/css';

export const svg = style({
  display: 'inline-block',
  verticalAlign: 'middle',
});

export const line = style({
  fill: 'none',
  strokeWidth: 1.5,
  strokeLinejoin: 'round',
  strokeLinecap: 'round',
});

export const area = style({
  opacity: 0.1,
});
