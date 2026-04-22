import { useState, useRef, useCallback } from "react";
import * as styles from "./OneTimePasswordField.css.js";

type OneTimePasswordFieldProps = {
  length?: number;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  name?: string;
  passwordMask?: boolean;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  cellAriaLabel?: (index: number, length: number) => string;
};

export function OneTimePasswordField({
  length = 6,
  value: controlledValue,
  defaultValue = "",
  onValueChange,
  onComplete,
  disabled,
  name,
  passwordMask,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  cellAriaLabel = (i, total) => `Character ${i + 1} of ${total}`,
}: OneTimePasswordFieldProps) {
  const [internalValue, setInternalValue] = useState(defaultValue.padEnd(length, ""));
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue!.padEnd(length, "") : internalValue;
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const updateValue = useCallback(
    (newValue: string) => {
      const trimmed = newValue.slice(0, length);
      if (!isControlled) setInternalValue(trimmed.padEnd(length, ""));
      onValueChange?.(trimmed.replace(/ +$/, ""));
      if (trimmed.replace(/ /g, "").length === length) {
        onComplete?.(trimmed);
      }
    },
    [isControlled, length, onValueChange, onComplete],
  );

  const handleInput = useCallback(
    (index: number, char: string) => {
      const chars = value.split("");
      chars[index] = char;
      const newValue = chars.join("");
      updateValue(newValue);
      if (char && index < length - 1) {
        inputsRef.current[index + 1]?.focus();
      }
    },
    [value, length, updateValue],
  );

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace") {
        e.preventDefault();
        const chars = value.split("");
        if (chars[index] && chars[index] !== " ") {
          chars[index] = " ";
          updateValue(chars.join(""));
        } else if (index > 0) {
          chars[index - 1] = " ";
          updateValue(chars.join(""));
          inputsRef.current[index - 1]?.focus();
        }
      } else if (e.key === "ArrowLeft" && index > 0) {
        inputsRef.current[index - 1]?.focus();
      } else if (e.key === "ArrowRight" && index < length - 1) {
        inputsRef.current[index + 1]?.focus();
      }
    },
    [value, length, updateValue],
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault();
      const pasted = e.clipboardData.getData("text").slice(0, length);
      updateValue(pasted.padEnd(length, " "));
      const nextIndex = Math.min(pasted.length, length - 1);
      inputsRef.current[nextIndex]?.focus();
    },
    [length, updateValue],
  );

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      className={styles.root}
    >
      {Array.from({ length }, (_, i) => (
        <input
          key={i}
          ref={(el) => {
            inputsRef.current[i] = el;
          }}
          type={passwordMask ? "password" : "text"}
          inputMode="numeric"
          maxLength={1}
          className={styles.cell}
          aria-label={cellAriaLabel(i, length)}
          value={value[i] === " " ? "" : (value[i] ?? "")}
          disabled={disabled}
          autoComplete={i === 0 ? "one-time-code" : "off"}
          onChange={(e) => {
            const char = e.target.value.slice(-1);
            if (char) handleInput(i, char);
          }}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
        />
      ))}
      {name && <input type="hidden" name={name} value={value.replace(/ +$/, "")} />}
    </div>
  );
}
