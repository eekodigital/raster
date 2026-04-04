import * as styles from './Tag.css.js';

export type TagVariant = 'neutral' | 'success' | 'danger' | 'warning' | 'info';

const variantClass: Record<TagVariant, string> = {
  neutral: styles.variantNeutral,
  success: styles.variantSuccess,
  danger: styles.variantDanger,
  warning: styles.variantWarning,
  info: styles.variantInfo,
};

type TagProps = {
  children: React.ReactNode;
  variant?: TagVariant;
  className?: string;
};

export function Tag({ children, variant = 'neutral', className }: TagProps) {
  const cls = [styles.tag, variantClass[variant], className].filter(Boolean).join(' ');
  return <span className={cls}>{children}</span>;
}
