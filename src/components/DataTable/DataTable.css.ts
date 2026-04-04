import { globalStyle, style } from '@vanilla-extract/css';

export const outer = style({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--spacing-3)',
});

export const filterBar = style({
  padding: 'var(--spacing-3) var(--spacing-4)',
  background: 'var(--color-surface-raised)',
});

export const filterInput = style({
  width: '100%',
  padding: 'var(--spacing-2) var(--spacing-3)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  fontSize: 'var(--font-size-sm)',
  color: 'var(--color-text)',
  background: 'var(--color-surface)',
  selectors: {
    '&:focus': {
      outline: '2px solid var(--color-focus-ring)',
      outlineOffset: '2px',
      borderColor: 'var(--color-interactive)',
    },
    '&::placeholder': {
      color: 'var(--color-text-placeholder)',
    },
  },
});

export const wrapper = style({
  width: '100%',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-lg)',
  overflow: 'hidden',
});

export const tableScroll = style({
  overflowX: 'auto',
});

export const table = style({
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: 'var(--font-size-sm)',
  background: 'var(--color-surface)',
});

export const caption = style({
  captionSide: 'top',
  textAlign: 'left',
  padding: 'var(--spacing-3) var(--spacing-4)',
  fontSize: 'var(--font-size-base)',
  fontWeight: 'var(--font-weight-semibold)',
  color: 'var(--color-text)',
  borderBottom: '1px solid var(--color-border)',
});

globalStyle(`${table} th, ${table} td`, {
  padding: 'var(--spacing-3) var(--spacing-4)',
  textAlign: 'left',
  verticalAlign: 'top',
  borderBottom: '1px solid var(--color-border)',
});

globalStyle(`${table} tbody tr:last-child td`, {
  borderBottom: 'none',
});

globalStyle(`${table} th`, {
  position: 'relative',
  fontWeight: 'var(--font-weight-medium)',
  fontSize: 'var(--font-size-xs)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: 'var(--color-text-subtle)',
  background: 'var(--color-surface-raised)',
  whiteSpace: 'nowrap',
});

globalStyle(`${table} tbody tr:hover td`, {
  background: 'var(--color-surface-raised)',
});

export const sortable = style({});

globalStyle(`${table} th.${sortable}`, {
  padding: 0,
});

export const sortBtn = style({
  display: 'flex',
  alignItems: 'baseline',
  gap: 'var(--spacing-1)',
  width: '100%',
  padding: 'var(--spacing-3) var(--spacing-4)',
  background: 'none',
  border: 'none',
  font: 'inherit',
  fontWeight: 'var(--font-weight-medium)',
  fontSize: 'var(--font-size-xs)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: 'var(--color-text-subtle)',
  cursor: 'pointer',
  textAlign: 'left',
  whiteSpace: 'nowrap',
  selectors: {
    '&:hover': { color: 'var(--color-text)', textDecoration: 'underline' },
    '&:focus-visible': {
      outline: '2px solid var(--color-focus-ring)',
      outlineOffset: '-2px',
    },
  },
});

export const sortIcon = style({
  color: 'var(--color-text-placeholder)',
  fontSize: '0.75em',
  flexShrink: 0,
});

globalStyle(`[data-sorted] .${sortBtn}`, { color: 'var(--color-text)' });
globalStyle(`[data-sorted] .${sortIcon}`, { color: 'var(--color-text)' });
globalStyle(`${table} [data-align="right"]`, { textAlign: 'right' });
globalStyle(`${table} [data-align="center"]`, { textAlign: 'center' });
globalStyle(`[data-align="right"] .${sortBtn}`, { justifyContent: 'flex-end' });
globalStyle(`[data-align="center"] .${sortBtn}`, { justifyContent: 'center' });

export const resizeHandle = style({
  position: 'absolute',
  top: 0,
  right: 0,
  height: '100%',
  width: '4px',
  cursor: 'col-resize',
  userSelect: 'none',
  touchAction: 'none',
  background: 'transparent',
  selectors: {
    '&:hover': { background: 'var(--color-border)' },
    '&[data-resizing]': { background: 'var(--color-interactive)' },
  },
});

export const pinned = style({});

globalStyle(`${table} td.${pinned}`, {
  background: 'var(--color-surface)',
});

globalStyle(`${table} tbody tr:hover td.${pinned}`, {
  background: 'var(--color-surface-raised)',
});

globalStyle(`${table} [data-pin-last-left]`, {
  boxShadow: '2px 0 4px -2px var(--color-border)',
});

globalStyle(`${table} [data-pin-first-right]`, {
  boxShadow: '-2px 0 4px -2px var(--color-border)',
});

export const paginationBar = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: 'var(--spacing-2) var(--spacing-1)',
});

export const paginationInfo = style({
  fontSize: 'var(--font-size-sm)',
  color: 'var(--color-text-subtle)',
});

export const paginationActions = style({
  display: 'flex',
  gap: 'var(--spacing-2)',
});

export const pageBtn = style({
  padding: 'var(--spacing-1) var(--spacing-3)',
  background: 'none',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  fontSize: 'var(--font-size-sm)',
  color: 'var(--color-text)',
  cursor: 'pointer',
  selectors: {
    '&:hover:not(:disabled)': { background: 'var(--color-surface-raised)' },
    '&:focus-visible': {
      outline: '2px solid var(--color-focus-ring)',
      outlineOffset: '2px',
    },
    '&:disabled': {
      opacity: 'var(--opacity-disabled)',
      cursor: 'not-allowed',
    },
  },
});
