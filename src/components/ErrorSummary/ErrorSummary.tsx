import { useEffect, useRef } from "react";
import * as styles from "./ErrorSummary.css.js";

type Props = {
  /** Map of fieldName → error message. Only entries with a non-empty message are rendered. */
  errors: Record<string, string>;
  /** Map of fieldName → DOM id of the corresponding input, used for anchor links. */
  fieldIds?: Record<string, string>;
};

export function ErrorSummary({ errors, fieldIds }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const entries = Object.entries(errors).filter(([, msg]) => !!msg);

  useEffect(() => {
    if (entries.length > 0) {
      ref.current?.focus();
    }
  }, [entries.length]);

  if (entries.length === 0) return null;

  return (
    <div ref={ref} role="alert" tabIndex={-1} className={styles.summary}>
      <h2 className={styles.title}>There is a problem</h2>
      <ul className={styles.list}>
        {entries.map(([field, msg]) => (
          <li key={field}>{fieldIds?.[field] ? <a href={`#${fieldIds[field]}`}>{msg}</a> : msg}</li>
        ))}
      </ul>
    </div>
  );
}
