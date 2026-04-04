import * as styles from './NotificationBanner.css.js';

export type NotificationBannerVariant = 'info' | 'success' | 'warning' | 'danger';

const variantClass: Record<NotificationBannerVariant, string> = {
  info: styles.variantInfo,
  success: styles.variantSuccess,
  warning: styles.variantWarning,
  danger: styles.variantDanger,
};

type NotificationBannerProps = {
  variant?: NotificationBannerVariant;
  title?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  role?: 'alert' | 'status' | 'region';
  'aria-label'?: string;
};

export function NotificationBanner({
  variant = 'info',
  title,
  children,
  className,
  role = 'region',
  'aria-label': ariaLabel,
}: NotificationBannerProps) {
  const resolvedLabel = ariaLabel ?? (typeof title === 'string' ? title : undefined);
  const cls = [styles.banner, variantClass[variant], className].filter(Boolean).join(' ');
  return (
    <div
      className={cls}
      role={role}
      aria-label={role === 'region' ? resolvedLabel : undefined}
      aria-live={role === 'alert' ? 'assertive' : role === 'status' ? 'polite' : undefined}
    >
      <div className={styles.body}>
        {title && <p className={styles.title}>{title}</p>}
        {children}
      </div>
    </div>
  );
}
