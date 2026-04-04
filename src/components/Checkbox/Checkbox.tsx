import { useId, useCallback } from 'react';
import { useControllableState } from '../../utils/use-controllable-state.js';
import * as styles from './Checkbox.css.js';

type CheckboxProps = {
  label: string;
  checked?: boolean | 'indeterminate';
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean | 'indeterminate') => void;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  value?: string;
  id?: string;
};

export function Checkbox({
  label,
  id: explicitId,
  checked: controlledChecked,
  defaultChecked = false,
  onCheckedChange,
  disabled,
  required,
  name,
  value = 'on',
}: CheckboxProps) {
  const generatedId = useId();
  const id = explicitId ?? generatedId;

  const [checked, setChecked] = useControllableState<boolean | 'indeterminate'>(
    controlledChecked,
    defaultChecked,
    onCheckedChange,
  );

  const toggle = useCallback(() => {
    if (disabled) return;
    setChecked(checked === true ? false : true);
  }, [disabled, checked, setChecked]);

  return (
    <div className={styles.item}>
      <button
        type="button"
        role="checkbox"
        id={id}
        className={styles.root}
        aria-checked={checked === 'indeterminate' ? 'mixed' : checked}
        aria-required={required || undefined}
        data-state={
          checked === true ? 'checked' : checked === 'indeterminate' ? 'indeterminate' : 'unchecked'
        }
        data-disabled={disabled ? '' : undefined}
        disabled={disabled}
        onClick={toggle}
      >
        {(checked === true || checked === 'indeterminate') && (
          <span className={styles.indicator}>
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none" aria-hidden="true">
              {checked === 'indeterminate' ? (
                <line
                  x1="1"
                  y1="4"
                  x2="9"
                  y2="4"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                />
              ) : (
                <path
                  d="M1 4L3.5 6.5L9 1"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </svg>
          </span>
        )}
      </button>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      {name && checked === true && <input type="hidden" name={name} value={value} />}
    </div>
  );
}

type CheckboxGroupProps = {
  legend: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
};

export function CheckboxGroup({ legend, hint, error, children }: CheckboxGroupProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <fieldset
      className={styles.group}
      data-error={error ? true : undefined}
      aria-describedby={[hintId, errorId].filter(Boolean).join(' ') || undefined}
    >
      <legend className={styles.legend}>{legend}</legend>

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

      <div className={styles.items}>{children}</div>
    </fieldset>
  );
}
