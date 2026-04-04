import { useRef, type CSSProperties } from "react";
import { cn } from "../../utils/cn.js";
import * as styles from "./SegmentedButtons.css.js";

export type SegmentedOption = {
  value: string;
  label: string;
  /** Override the active colour for this segment (CSS custom property value). */
  color?: string;
  /** Override the active background for this segment. */
  bg?: string;
};

type SegmentedButtonsProps = {
  options: SegmentedOption[];
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  name?: string;
  "aria-label"?: string;
  className?: string;
};

export function SegmentedButtons({
  options,
  value,
  onValueChange,
  disabled,
  name,
  "aria-label": ariaLabel,
  className,
}: SegmentedButtonsProps) {
  const groupRef = useRef<HTMLDivElement>(null);

  function handleKeyDown(e: React.KeyboardEvent) {
    const buttons = Array.from(
      groupRef.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]') ?? [],
    );
    const count = buttons.length;
    if (count === 0) return;

    const currentIdx = buttons.indexOf(document.activeElement as HTMLButtonElement);

    let nextIdx = currentIdx;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      nextIdx = (currentIdx + 1) % count;
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      nextIdx = (currentIdx - 1 + count) % count;
    } else {
      return;
    }

    e.preventDefault();
    const nextValue = options[nextIdx]?.value;
    if (nextValue && !disabled) {
      onValueChange(nextValue);
      buttons[nextIdx]?.focus();
    }
  }

  return (
    <div
      role="radiogroup"
      ref={groupRef}
      onKeyDown={handleKeyDown}
      className={cn(styles.group, className)}
      aria-label={ariaLabel}
    >
      {options.map((opt) => {
        const checked = value === opt.value;
        const itemStyle: CSSProperties = {};
        if (opt.color) (itemStyle as Record<string, string>)["--segment-color"] = opt.color;
        if (opt.bg) (itemStyle as Record<string, string>)["--segment-bg"] = opt.bg;

        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={checked}
            data-state={checked ? "checked" : "unchecked"}
            className={styles.item}
            style={Object.keys(itemStyle).length > 0 ? itemStyle : undefined}
            tabIndex={value === opt.value ? 0 : -1}
            disabled={disabled}
            onClick={() => {
              if (!disabled) onValueChange(opt.value);
            }}
          >
            {opt.label}
          </button>
        );
      })}
      {name && <input type="hidden" name={name} value={value} />}
    </div>
  );
}
