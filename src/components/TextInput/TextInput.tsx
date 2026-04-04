import * as styles from "./TextInput.css.js";

type TextInputProps = {
  hasError?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>;

export function TextInput({ hasError, className, ...props }: TextInputProps) {
  return (
    <input
      className={[styles.input, hasError && styles.error, className].filter(Boolean).join(" ")}
      {...props}
    />
  );
}
