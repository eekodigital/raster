import * as styles from './Breadcrumbs.css.js';

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
  className?: string;
  'aria-label'?: string;
};

export function Breadcrumbs({
  items,
  className,
  'aria-label': ariaLabel = 'Breadcrumb',
}: BreadcrumbsProps) {
  return (
    <nav aria-label={ariaLabel} className={[styles.nav, className].filter(Boolean).join(' ')}>
      <ol className={styles.list}>
        {items.map((item, i) => {
          const isCurrent = i === items.length - 1;
          return (
            <li key={item.href ?? item.label} className={styles.item}>
              {isCurrent || !item.href ? (
                <span
                  className={isCurrent ? styles.current : undefined}
                  aria-current={isCurrent ? 'page' : undefined}
                >
                  {item.label}
                </span>
              ) : (
                <a href={item.href} className={styles.link}>
                  {item.label}
                </a>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
