import * as styles from './SkipLink.css.js';

type SkipLinkProps = {
  href?: string;
  children?: React.ReactNode;
};

export function SkipLink({
  href = '#main-content',
  children = 'Skip to main content',
}: SkipLinkProps) {
  return (
    <a href={href} className={styles.skipLink}>
      {children}
    </a>
  );
}
