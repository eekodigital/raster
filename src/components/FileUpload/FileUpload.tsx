import { useId } from "react";
import * as fieldStyles from "../shared/field.css.js";
import * as styles from "./FileUpload.css.js";

type FileInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type" | "aria-describedby" | "aria-invalid" | "aria-errormessage"
> & {
  hasError?: boolean;
};

export function FileInput({ hasError, className, ...props }: FileInputProps) {
  return (
    <input
      type="file"
      className={[styles.input, className].filter(Boolean).join(" ")}
      data-error={hasError ? true : undefined}
      {...props}
    />
  );
}

type FileUploadFieldProps = {
  label: string;
  hint?: string;
  error?: string;
  id?: string;
} & Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type" | "aria-describedby" | "aria-invalid" | "aria-errormessage"
>;

export function FileUploadField({
  label,
  hint,
  error,
  id: explicitId,
  ...inputProps
}: FileUploadFieldProps) {
  const generatedId = useId();
  const id = explicitId ?? generatedId;
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

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

      <FileInput
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
