import { useState, useCallback, useRef } from 'react';

/**
 * Manages controlled/uncontrolled state for a component.
 * When `controlledValue` is defined, it is used directly.
 * Otherwise, internal state is used with `defaultValue` as the initial value.
 */
export function useControllableState<T>(
  controlledValue: T | undefined,
  defaultValue: T,
  onChange?: (value: T) => void,
): [T, (next: T) => void] {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const isControlled = controlledValue !== undefined;
  const isControlledRef = useRef(isControlled);
  isControlledRef.current = isControlled;

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const value = isControlled ? controlledValue : internalValue;

  const setValue = useCallback((next: T) => {
    if (!isControlledRef.current) setInternalValue(next);
    onChangeRef.current?.(next);
  }, []);

  return [value, setValue];
}
