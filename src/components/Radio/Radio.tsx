import { createContext, useContext, useId, useCallback, useRef } from "react";
import { useControllableState } from "../../utils/use-controllable-state.js";
import * as styles from "./Radio.css.js";

type RadioGroupCtx = {
  value: string;
  name: string;
  disabled: boolean;
  onValueChange: (value: string) => void;
  registerRadio: (value: string, el: HTMLButtonElement | null) => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
};

const Ctx = createContext<RadioGroupCtx>({
  value: "",
  name: "",
  disabled: false,
  onValueChange: () => {},
  registerRadio: () => {},
  handleKeyDown: () => {},
});

type RadioProps = {
  label: string;
  value: string;
  disabled?: boolean;
  id?: string;
};

export function Radio({ label, value, disabled: itemDisabled, id: explicitId }: RadioProps) {
  const generatedId = useId();
  const id = explicitId ?? generatedId;
  const {
    value: groupValue,
    name,
    disabled: groupDisabled,
    onValueChange,
    registerRadio,
    handleKeyDown,
  } = useContext(Ctx);
  const checked = groupValue === value;
  const disabled = itemDisabled || groupDisabled;

  return (
    <div className={styles.item}>
      <button
        type="button"
        role="radio"
        id={id}
        className={styles.root}
        aria-checked={checked}
        data-state={checked ? "checked" : "unchecked"}
        data-disabled={disabled ? "" : undefined}
        disabled={disabled}
        tabIndex={checked ? 0 : -1}
        ref={(el) => {
          registerRadio(value, el);
        }}
        onKeyDown={handleKeyDown}
        onClick={() => {
          if (!disabled) onValueChange(value);
        }}
      >
        <span className={styles.indicator} />
      </button>
      {name && checked && <input type="hidden" name={name} value={value} />}
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
    </div>
  );
}

type RadioGroupProps = {
  legend: string;
  hint?: string;
  error?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  name?: string;
  disabled?: boolean;
  children: React.ReactNode;
};

export function RadioGroup({
  legend,
  hint,
  error,
  value: controlledValue,
  defaultValue = "",
  onValueChange,
  name,
  disabled = false,
  children,
}: RadioGroupProps) {
  const id = useId();
  const legendId = `${id}-legend`;
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const generatedName = name ?? id;

  const [value, setValue] = useControllableState(controlledValue, defaultValue, onValueChange);

  const radiosRef = useRef<Map<string, HTMLButtonElement>>(new Map());
  const orderRef = useRef<string[]>([]);

  const registerRadio = useCallback((val: string, el: HTMLButtonElement | null) => {
    if (el) {
      radiosRef.current.set(val, el);
      if (!orderRef.current.includes(val)) orderRef.current.push(val);
    } else {
      radiosRef.current.delete(val);
      orderRef.current = orderRef.current.filter((v) => v !== val);
    }
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const order = orderRef.current;
      const count = order.length;
      if (count === 0) return;

      const currentValue = value;
      const currentIdx = order.indexOf(currentValue);
      let nextIdx = currentIdx;

      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        nextIdx = (currentIdx + 1) % count;
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        nextIdx = (currentIdx - 1 + count) % count;
      } else {
        return;
      }

      // Skip disabled radios
      let attempts = 0;
      while (attempts < count) {
        const el = radiosRef.current.get(order[nextIdx]);
        if (el && !el.disabled) break;
        if (e.key === "ArrowDown" || e.key === "ArrowRight") {
          nextIdx = (nextIdx + 1) % count;
        } else {
          nextIdx = (nextIdx - 1 + count) % count;
        }
        attempts++;
      }
      if (attempts >= count) return;

      e.preventDefault();
      const nextValue = order[nextIdx];
      setValue(nextValue);
      radiosRef.current.get(nextValue)?.focus();
    },
    [value, setValue],
  );

  const handleValueChange = useCallback(
    (val: string) => {
      setValue(val);
    },
    [setValue],
  );

  return (
    <div className={styles.group} data-error={error ? true : undefined}>
      <span id={legendId} className={styles.legend}>
        {legend}
      </span>

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

      <div
        role="radiogroup"
        className={styles.items}
        aria-labelledby={legendId}
        aria-describedby={[hintId, errorId].filter(Boolean).join(" ") || undefined}
      >
        <Ctx.Provider
          value={{
            value,
            name: generatedName,
            disabled,
            onValueChange: handleValueChange,
            registerRadio,
            handleKeyDown,
          }}
        >
          {children}
        </Ctx.Provider>
      </div>
    </div>
  );
}
