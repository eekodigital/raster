import type { CSSProperties, ElementType, ReactNode } from 'react';
import * as styles from './Box.css.js';

type SpacingToken =
  | '1'
  | '1-5'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '10'
  | '12'
  | '16'
  | '20'
  | '24';

export type BoxProps = {
  children: ReactNode;
  as?: ElementType;
  padding?: SpacingToken;
  paddingX?: SpacingToken;
  paddingY?: SpacingToken;
  className?: string;
  style?: CSSProperties;
};

export function Box({
  children,
  as: Tag = 'div',
  padding,
  paddingX,
  paddingY,
  className,
  style,
}: BoxProps) {
  const cls = [
    styles.base,
    padding && styles.padding[padding],
    paddingX && styles.paddingX[paddingX],
    paddingY && styles.paddingY[paddingY],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Tag className={cls} style={style}>
      {children}
    </Tag>
  );
}
