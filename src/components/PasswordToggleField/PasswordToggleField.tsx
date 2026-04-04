import { useId, useState } from "react";
import * as styles from "./PasswordToggleField.css.js";
import * as fieldStyles from "../shared/field.css.js";

type PasswordToggleFieldProps = {
  label: string;
  hint?: string;
  error?: string;
  id?: string;
  autoComplete?: "current-password" | "new-password";
} & Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type" | "aria-describedby" | "aria-invalid" | "aria-errormessage" | "autoComplete"
>;

export function PasswordToggleField({
  label,
  hint,
  error,
  id: explicitId,
  autoComplete,
  ...inputProps
}: PasswordToggleFieldProps) {
  const generatedId = useId();
  const id = explicitId ?? generatedId;
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
  const [visible, setVisible] = useState(false);

  return (
    <div className={fieldStyles.field} data-error={error ? true : undefined}>
      <label htmlFor={id} className={fieldStyles.label}>
        {label}
      </label>

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

      <div className={styles.inputWrapper}>
        <input
          id={id}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          className={[styles.input, error ? styles.inputError : ""].filter(Boolean).join(" ")}
          aria-invalid={error ? true : undefined}
          aria-errormessage={errorId}
          aria-describedby={describedBy}
          {...inputProps}
        />
        <button
          type="button"
          className={styles.toggle}
          aria-label="Toggle password visibility"
          onClick={() => setVisible((v) => !v)}
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
    </div>
  );
}

function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M1 8C1 8 3.5 3 8 3C12.5 3 15 8 15 8C15 8 12.5 13 8 13C3.5 13 1 8 1 8Z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.25" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M2 2L14 14M6.5 6.6C6.2 6.9 6 7.4 6 8C6 9.1 6.9 10 8 10C8.6 10 9.1 9.8 9.4 9.5M4.1 4.2C2.8 5.1 1.8 6.4 1 8C2.2 10.7 4.9 12.5 8 12.5C9.3 12.5 10.5 12.1 11.6 11.5M6.5 3.6C7 3.5 7.5 3.5 8 3.5C11.1 3.5 13.8 5.3 15 8C14.6 8.9 14.1 9.7 13.4 10.4"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
