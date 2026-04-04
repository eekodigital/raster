import { globalStyle, style } from '@vanilla-extract/css';

export const card = style({
  padding: 'var(--spacing-4)',
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-lg)',
  transition: 'border-color var(--duration-fast) var(--easing-ease)',
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--spacing-2)',
  height: '100%',
});

globalStyle(`a:hover > ${card}, li:hover > ${card}`, {
  borderColor: 'var(--color-border-strong)',
});

globalStyle(`${card} > strong`, {
  fontWeight: 'var(--font-weight-medium)',
  fontSize: 'var(--font-size-lg)',
  color: 'var(--color-text)',
});

globalStyle(`${card} > p`, {
  width: '100%',
  margin: '0',
  fontSize: 'var(--font-size-sm)',
});
