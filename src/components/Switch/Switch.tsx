import { useCallback } from "react";
import { cn } from "../../utils/cn.js";
import { useControllableState } from "../../utils/use-controllable-state.js";
import * as styles from "./Switch.css.js";

type RootOwnProps = {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  name?: string;
  value?: string;
  required?: boolean;
  className?: string;
  children?: React.ReactNode;
};

type RootProps = RootOwnProps &
  Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    keyof RootOwnProps | "type" | "role" | "aria-checked" | "onClick"
  >;

export function Root({
  checked: controlledChecked,
  defaultChecked = false,
  onCheckedChange,
  disabled = false,
  name,
  value = "on",
  required,
  className,
  children,
  ...buttonProps
}: RootProps) {
  const [checked, setChecked] = useControllableState(
    controlledChecked,
    defaultChecked,
    onCheckedChange,
  );

  const toggle = useCallback(() => {
    if (disabled) return;
    setChecked(!checked);
  }, [disabled, checked, setChecked]);

  return (
    <button
      {...buttonProps}
      type="button"
      role="switch"
      aria-checked={checked}
      data-state={checked ? "checked" : "unchecked"}
      data-disabled={disabled ? "" : undefined}
      disabled={disabled}
      className={cn(styles.root, className)}
      onClick={toggle}
      name={name}
      value={value}
      aria-required={required || undefined}
    >
      {children}
    </button>
  );
}

type ThumbProps = {
  className?: string;
};

export function Thumb({ className }: ThumbProps) {
  return <span className={cn(styles.thumb, className)} />;
}
