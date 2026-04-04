import { useId, useRef } from "react";
import * as fieldStyles from "../shared/field.css.js";
import * as styles from "./DateInput.css.js";

export type DateValue = {
  day: string;
  month: string;
  year: string;
};

type DateInputProps = {
  label: string;
  hint?: string;
  error?: string;
  id?: string;
  name?: string;
  value?: DateValue;
  defaultValue?: DateValue;
  onChange?: (value: DateValue) => void;
  disabled?: boolean;
};

export function DateInput({
  label,
  hint,
  error,
  id: explicitId,
  name,
  value,
  defaultValue,
  onChange,
  disabled,
}: DateInputProps) {
  const generatedId = useId();
  const id = explicitId ?? generatedId;
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  const dayRef = useRef<HTMLInputElement>(null);
  const monthRef = useRef<HTMLInputElement>(null);
  const yearRef = useRef<HTMLInputElement>(null);

  const current = (): DateValue => ({
    day: dayRef.current?.value ?? "",
    month: monthRef.current?.value ?? "",
    year: yearRef.current?.value ?? "",
  });

  const handleDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.length === 2) monthRef.current?.focus();
    onChange?.(current());
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.length === 2) yearRef.current?.focus();
    onChange?.(current());
  };

  return (
    <div className={styles.field} data-error={error ? true : undefined}>
      <label className={fieldStyles.label}>{label}</label>

      {hint && (
        <span id={hintId} className={fieldStyles.hint}>
          {hint}
        </span>
      )}

      {error && (
        <span id={errorId} className={fieldStyles.error}>
          <span className={fieldStyles.errorPrefix}>Error:</span> {error}
        </span>
      )}

      <div className={styles.inputs} aria-describedby={describedBy}>
        <div className={styles.inputGroup}>
          <label htmlFor={`${id}-day`} className={styles.inputLabel}>
            Day
          </label>
          <input
            ref={dayRef}
            id={`${id}-day`}
            name={name ? `${name}-day` : undefined}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={2}
            placeholder="DD"
            defaultValue={defaultValue?.day}
            value={value?.day}
            onChange={handleDayChange}
            disabled={disabled}
            data-error={error ? true : undefined}
            className={[styles.input, styles.inputDay].join(" ")}
            aria-invalid={error ? true : undefined}
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor={`${id}-month`} className={styles.inputLabel}>
            Month
          </label>
          <input
            ref={monthRef}
            id={`${id}-month`}
            name={name ? `${name}-month` : undefined}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={2}
            placeholder="MM"
            defaultValue={defaultValue?.month}
            value={value?.month}
            onChange={handleMonthChange}
            disabled={disabled}
            data-error={error ? true : undefined}
            className={[styles.input, styles.inputMonth].join(" ")}
            aria-invalid={error ? true : undefined}
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor={`${id}-year`} className={styles.inputLabel}>
            Year
          </label>
          <input
            ref={yearRef}
            id={`${id}-year`}
            name={name ? `${name}-year` : undefined}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={4}
            placeholder="YYYY"
            defaultValue={defaultValue?.year}
            value={value?.year}
            onChange={() => onChange?.(current())}
            disabled={disabled}
            data-error={error ? true : undefined}
            className={[styles.input, styles.inputYear].join(" ")}
            aria-invalid={error ? true : undefined}
          />
        </div>
      </div>
    </div>
  );
}
