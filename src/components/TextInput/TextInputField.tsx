import { useId } from 'react';
import { TextInput } from './TextInput.js';
import * as styles from './TextInputField.css.js';

type TextInputFieldProps = {
  label: string;
  hint?: string;
  error?: string;
} & Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'aria-describedby' | 'aria-invalid' | 'aria-errormessage'
>;

export function TextInputField({
  label,
  hint,
  error,
  id: explicitId,
  ...inputProps
}: TextInputFieldProps) {
  const generatedId = useId();
  const id = explicitId ?? generatedId;
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

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

      <TextInput
        id={id}
        hasError={!!error}
        aria-invalid={error ? true : undefined}
        aria-errormessage={errorId}
        aria-describedby={describedBy}
        {...inputProps}
      />
    </div>
  );
}
