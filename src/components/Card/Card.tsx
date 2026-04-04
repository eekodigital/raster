import * as styles from './Card.css.js';

type CardProps = {
  children: React.ReactNode;
  className?: string;
};

export function Card({ children, className }: CardProps) {
  const cls = [styles.card, className].filter(Boolean).join(' ');
  return <div className={cls}>{children}</div>;
}
