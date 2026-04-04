import { useState, useCallback, useEffect, useRef, useId } from "react";
import type React from "react";
import { Portal as PortalComponent } from "../Portal/Portal.js";
import { cn } from "../../utils/cn.js";
import { positionOverlay } from "../../utils/position-overlay.js";
import { useControllableState } from "../../utils/use-controllable-state.js";
import { useEscapeKey } from "../../utils/use-escape-key.js";
import * as styles from "./Select.css.js";

export type SelectOption = {
  value: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
};

type SelectProps = {
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  hasError?: boolean;
  name?: string;
  required?: boolean;
  id?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
};

export function Select({
  options,
  value: controlledValue,
  defaultValue,
  onValueChange,
  placeholder,
  disabled,
  hasError,
  name,
  required,
  id: explicitId,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
}: SelectProps) {
  const generatedId = useId();
  const id = explicitId ?? generatedId;
  const listboxId = `${id}-listbox`;

  const [value, setValue] = useControllableState(
    controlledValue,
    defaultValue ?? "",
    onValueChange,
  );

  const [open, setOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value);

  const selectValue = useCallback(
    (val: string) => {
      const opt = options.find((o) => o.value === val);
      if (opt?.disabled) return;
      setValue(val);
      setOpen(false);
      triggerRef.current?.focus();
    },
    [setValue, options],
  );

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node) &&
        listRef.current &&
        !listRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Close on Escape
  useEscapeKey(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, open);

  // Focus first enabled option on open
  useEffect(() => {
    if (!open) return;
    const idx = options.findIndex((o) => !o.disabled);
    setFocusedIndex(idx >= 0 ? idx : 0);
  }, [open, options]);

  // Position and focus the listbox after the portal has painted
  useEffect(() => {
    if (!open) return;
    const el = listRef.current;
    const trigger = triggerRef.current;
    if (!el || !trigger) return;
    positionOverlay(trigger, el, "bottom-start");
    el.style.minWidth = `${trigger.getBoundingClientRect().width}px`;
    el.focus({ preventScroll: true });
  }, [open]);

  // Scroll focused option into view
  useEffect(() => {
    if (!open || focusedIndex < 0) return;
    const items = listRef.current?.querySelectorAll<HTMLElement>('[role="option"]');
    items?.[focusedIndex]?.scrollIntoView({ block: "nearest" });
  }, [open, focusedIndex]);

  function handleTriggerKeyDown(e: React.KeyboardEvent) {
    if (disabled) return;
    if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
    }
  }

  function handleListKeyDown(e: React.KeyboardEvent) {
    const count = options.length;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((prev) => {
        let next = (prev + 1) % count;
        while (options[next]?.disabled && next !== prev) next = (next + 1) % count;
        return next;
      });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((prev) => {
        let next = (prev - 1 + count) % count;
        while (options[next]?.disabled && next !== prev) next = (next - 1 + count) % count;
        return next;
      });
    } else if (e.key === "Home") {
      e.preventDefault();
      const idx = options.findIndex((o) => !o.disabled);
      if (idx >= 0) setFocusedIndex(idx);
    } else if (e.key === "End") {
      e.preventDefault();
      for (let i = count - 1; i >= 0; i--) {
        if (!options[i].disabled) {
          setFocusedIndex(i);
          break;
        }
      }
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (focusedIndex >= 0 && !options[focusedIndex]?.disabled) {
        selectValue(options[focusedIndex].value);
      }
    }
  }

  const triggerCls = cn(styles.trigger, hasError && styles.triggerError);

  return (
    <>
      <button
        type="button"
        role="combobox"
        ref={triggerRef}
        id={id}
        className={triggerCls}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={open ? listboxId : undefined}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledby}
        disabled={disabled}
        onClick={() => {
          if (!disabled) setOpen(!open);
        }}
        onKeyDown={handleTriggerKeyDown}
      >
        <span>{selectedOption ? selectedOption.label : placeholder}</span>
        <span className={styles.icon}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path
              d="M2.5 4.5L6 8L9.5 4.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>

      {open && (
        <PortalComponent>
          <div
            ref={listRef}
            role="listbox"
            id={listboxId}
            className={styles.content}
            data-state="open"
            tabIndex={-1}
            onKeyDown={handleListKeyDown}
            onBlur={(e) => {
              if (
                !listRef.current?.contains(e.relatedTarget as Node) &&
                !triggerRef.current?.contains(e.relatedTarget as Node)
              ) {
                setOpen(false);
              }
            }}
          >
            <div className={styles.viewport}>
              {options.map((opt, i) => {
                const isSelected = value === opt.value;
                const isFocused = focusedIndex === i;
                return (
                  <div
                    key={opt.value}
                    role="option"
                    aria-selected={isSelected}
                    aria-disabled={opt.disabled || undefined}
                    data-disabled={opt.disabled ? "" : undefined}
                    data-highlighted={isFocused ? "" : undefined}
                    className={styles.item}
                    onClick={() => {
                      if (!opt.disabled) selectValue(opt.value);
                    }}
                    onMouseMove={() => setFocusedIndex(i)}
                  >
                    {opt.icon && <span className={styles.itemIcon}>{opt.icon}</span>}
                    <span>{opt.label}</span>
                    {isSelected && (
                      <span className={styles.itemIndicator}>
                        <svg
                          width="10"
                          height="8"
                          viewBox="0 0 10 8"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path
                            d="M1 4L3.5 6.5L9 1"
                            stroke="currentColor"
                            strokeWidth="1.75"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </PortalComponent>
      )}

      {name && <input type="hidden" name={name} value={value} required={required} />}
    </>
  );
}
