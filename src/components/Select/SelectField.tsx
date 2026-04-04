import { useId } from 'react';
import { Select } from './Select.js';
import type { SelectOption } from './Select.js';
import * as styles from '../shared/field.css.js';

type SelectFieldProps = {
  label: string;
  hint?: string;
  error?: string;
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  id?: string;
};

export function SelectField({
  label,
  hint,
  error,
  id: explicitId,
  ...selectProps
}: SelectFieldProps) {
  const generatedId = useId();
  const id = explicitId ?? generatedId;
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className={styles.field} data-error={error ? true : undefined}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>

      {hint && (
        <span id={hintId} className={styles.hint}>
          {hint}
        </span>
      )}

      {error && (
        <span id={errorId} className={styles.error}>
          <span className={styles.errorPrefix}>Error:</span> {error}
        </span>
      )}

      <Select id={id} hasError={!!error} {...selectProps} />
    </div>
  );
}
