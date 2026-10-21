import { useCallback, useRef } from "react";
import type React from "react";

/**
 * A ref callback that sets a component's own ref and the caller's `ref`,
 * keeping a React 19 callback ref's cleanup.
 */
export function useMergedRef<T>(
  own: React.RefObject<T | null>,
  ref: React.Ref<T> | undefined,
): (el: T | null) => () => void {
  return useCallback(
    (el: T | null) => {
      own.current = el;
      if (typeof ref === "function") {
        const cleanup = ref(el);
        return () => {
          own.current = null;
          if (typeof cleanup === "function") cleanup();
          else ref(null);
        };
      }
      if (ref) ref.current = el;
      return () => {
        own.current = null;
        if (ref) ref.current = null;
      };
    },
    [own, ref],
  );
}

/** Root-element charts (Gauge, Sparkline): their own ref, merged with the caller's `ref`. */
export function useRootRef<T extends HTMLElement>(ref: React.Ref<T> | undefined) {
  const containerRef = useRef<T>(null);
  return { containerRef, rootRef: useMergedRef(containerRef, ref) };
}
