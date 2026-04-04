import { cn } from '../../utils/cn.js';
import * as styles from './Separator.css.js';

interface SeparatorProps {
  orientation?: 'horizontal' | 'vertical';
  decorative?: boolean;
  className?: string;
}

export function Separator({
  orientation = 'horizontal',
  decorative = true,
  className,
}: SeparatorProps) {
  return (
    <div
      role={decorative ? 'none' : 'separator'}
      aria-orientation={!decorative ? orientation : undefined}
      data-orientation={orientation}
      className={cn(styles.root, className)}
    />
  );
}
