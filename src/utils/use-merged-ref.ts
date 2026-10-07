import { useCallback } from "react";
import type React from "react";

/** A ref callback that sets a component's own ref and the caller's `ref`. */
export function useMergedRef<T>(
  own: React.RefObject<T | null>,
  ref: React.Ref<T> | undefined,
): (el: T | null) => void {
  return useCallback(
    (el: T | null) => {
      own.current = el;
      if (typeof ref === "function") ref(el);
      else if (ref) ref.current = el;
    },
    [own, ref],
  );
}
