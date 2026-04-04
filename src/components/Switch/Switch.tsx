import { useCallback } from 'react';
import { cn } from '../../utils/cn.js';
import { useControllableState } from '../../utils/use-controllable-state.js';
import * as styles from './Switch.css.js';

type RootProps = {
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

export function Root({
  checked: controlledChecked,
  defaultChecked = false,
  onCheckedChange,
  disabled = false,
  name,
  value = 'on',
  required,
  className,
  children,
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
      type="button"
      role="switch"
      aria-checked={checked}
      data-state={checked ? 'checked' : 'unchecked'}
      data-disabled={disabled ? '' : undefined}
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
