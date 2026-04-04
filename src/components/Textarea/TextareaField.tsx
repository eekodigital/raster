import { useId, useState } from 'react';
import { Textarea } from './Textarea.js';
import * as styles from '../shared/field.css.js';

type TextareaFieldProps = {
  label: string;
  hint?: string;
  error?: string;
} & Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  'aria-describedby' | 'aria-invalid' | 'aria-errormessage'
>;

export function TextareaField({
  label,
  hint,
  error,
  id: explicitId,
  maxLength,
  onChange,
  defaultValue,
  value,
  ...textareaProps
}: TextareaFieldProps) {
  const generatedId = useId();
  const id = explicitId ?? generatedId;
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const countId = maxLength ? `${id}-count` : undefined;

  const initialLength =
    value != null ? String(value).length : defaultValue != null ? String(defaultValue).length : 0;
  const [charCount, setCharCount] = useState(initialLength);

  const describedBy = [hintId, errorId, countId].filter(Boolean).join(' ') || undefined;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCharCount(e.target.value.length);
    onChange?.(e);
  };

  const remaining = maxLength != null ? maxLength - charCount : null;
  const isOver = remaining != null && remaining < 0;

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

      <Textarea
        id={id}
        hasError={!!error}
        aria-invalid={error ? true : undefined}
        aria-errormessage={errorId}
        aria-describedby={describedBy}
        maxLength={maxLength}
        onChange={handleChange}
        defaultValue={defaultValue}
        value={value}
        {...textareaProps}
      />

      {maxLength != null && (
        <span
          id={countId}
          className={[styles.characterCount, isOver ? styles.characterCountOver : undefined]
            .filter(Boolean)
            .join(' ')}
          aria-live="polite"
        >
          {remaining != null && remaining >= 0
            ? `${remaining} character${remaining === 1 ? '' : 's'} remaining`
            : `${Math.abs(remaining!)} character${Math.abs(remaining!) === 1 ? '' : 's'} too many`}
        </span>
      )}
    </div>
  );
}
