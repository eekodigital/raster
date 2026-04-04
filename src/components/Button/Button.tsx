import { cn } from '../../utils/cn.js';
import * as styles from './Button.css.js';

type ButtonVariant = 'primary' | 'secondary' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

type BaseProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
};

type ButtonRenderProps = { className: string };

type ButtonProps = BaseProps & {
  children?: React.ReactNode | ((props: ButtonRenderProps) => React.ReactElement);
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'>;

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  const cls = cn(styles.button, styles[variant], styles[size], className);

  if (typeof children === 'function') {
    return children({ className: cls });
  }

  return (
    <button className={cls} {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
}
