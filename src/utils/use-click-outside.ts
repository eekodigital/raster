import { useEffect, useRef } from "react";
import type React from "react";

/**
 * Detects clicks outside a referenced element and calls the handler.
 * Optionally excludes additional refs (e.g. a trigger button) from "outside".
 */
export function useClickOutside(
  handler: () => void,
  active: boolean,
  excludeRefs?: React.RefObject<HTMLElement | null>[],
) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active) return;

    function handleClick(e: MouseEvent) {
      const target = e.target as Node;
      if (ref.current && !ref.current.contains(target)) {
        const excluded = excludeRefs?.some((r) => r.current?.contains(target));
        if (!excluded) handler();
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [handler, active, excludeRefs]);

  return ref;
}
