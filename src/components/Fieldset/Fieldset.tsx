import * as styles from './Fieldset.css.js';

type FieldsetProps = {
  legend: React.ReactNode;
  hint?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export function Fieldset({ legend, hint, children, className }: FieldsetProps) {
  const cls = [styles.fieldset, className].filter(Boolean).join(' ');
  return (
    <fieldset className={cls}>
      <legend className={styles.legend}>
        {legend}
        {hint && <span className={styles.hint}>{hint}</span>}
      </legend>
      {children}
    </fieldset>
  );
}
