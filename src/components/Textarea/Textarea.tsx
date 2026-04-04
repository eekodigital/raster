import * as styles from "./Textarea.css.js";

type TextareaProps = {
  hasError?: boolean;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ hasError, className, ...props }: TextareaProps) {
  return (
    <textarea
      className={[styles.textarea, hasError ? styles.error : "", className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}
