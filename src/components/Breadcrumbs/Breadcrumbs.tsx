import type { ComponentType, ReactNode } from "react";
import * as styles from "./Breadcrumbs.css.js";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export type BreadcrumbLinkProps = {
  href: string;
  className: string;
  children: ReactNode;
};

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
  className?: string;
  "aria-label"?: string;
  /**
   * Optional custom renderer for non-current items with an `href`. Lets consumers
   * inject a router-aware link (e.g. React Router's `Link`, Next's `Link`, TanStack
   * Router, etc.) without Breadcrumbs depending on any specific router.
   *
   * The component receives `href`, `className`, and `children`. Pre-bind any
   * additional props (prefetch hints, analytics, etc.) in a wrapper on the
   * consumer side. Defaults to a plain `<a>` element.
   */
  renderLink?: ComponentType<BreadcrumbLinkProps>;
};

export function Breadcrumbs({
  items,
  className,
  "aria-label": ariaLabel = "Breadcrumb",
  renderLink: LinkComponent,
}: BreadcrumbsProps) {
  return (
    <nav aria-label={ariaLabel} className={[styles.nav, className].filter(Boolean).join(" ")}>
      <ol className={styles.list}>
        {items.map((item, i) => {
          const isCurrent = i === items.length - 1;
          return (
            <li key={item.href ?? item.label} className={styles.item}>
              {isCurrent || !item.href ? (
                <span
                  className={isCurrent ? styles.current : undefined}
                  aria-current={isCurrent ? "page" : undefined}
                >
                  {item.label}
                </span>
              ) : LinkComponent ? (
                <LinkComponent href={item.href} className={styles.link}>
                  {item.label}
                </LinkComponent>
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
