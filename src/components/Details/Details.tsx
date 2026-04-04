import * as styles from "./Details.css.js";

type DetailsProps = React.DetailsHTMLAttributes<HTMLDetailsElement> & {
  summary: React.ReactNode;
  children: React.ReactNode;
};

export function Details({ summary, children, className, ...props }: DetailsProps) {
  const cls = [styles.details, className].filter(Boolean).join(" ");
  return (
    <details className={cls} {...props}>
      <summary className={styles.summary}>{summary}</summary>
      <div className={styles.content}>{children}</div>
    </details>
  );
}
