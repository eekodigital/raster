import { Children, cloneElement, isValidElement } from "react";
import type React from "react";
import { cn } from "./cn.js";
import { composeEventHandlers } from "./compose-event-handlers.js";
import { mergeRefs } from "./merge-refs.js";

type AnyProps = Record<string, unknown>;

export type SlotProps = {
  children?: React.ReactNode;
  ref?: React.Ref<HTMLElement>;
} & React.HTMLAttributes<HTMLElement>;

export function Slot({ children, ...slotProps }: SlotProps) {
  if (!isValidElement(children)) {
    return Children.count(children) > 1 ? Children.only(null) : null;
  }

  const child = children as React.ReactElement<AnyProps & { ref?: React.Ref<unknown> }>;
  const childProps = child.props;

  const merged: AnyProps = { ...childProps };

  for (const key of Object.keys(slotProps) as (keyof typeof slotProps)[]) {
    const slotValue = (slotProps as AnyProps)[key];
    const childValue = (childProps as AnyProps)[key];

    if (/^on[A-Z]/.test(key)) {
      merged[key] = composeEventHandlers(
        childValue as ((e: { defaultPrevented: boolean }) => void) | undefined,
        slotValue as ((e: { defaultPrevented: boolean }) => void) | undefined,
      );
    } else if (key === "style") {
      merged[key] = { ...(childValue as object), ...(slotValue as object) };
    } else if (key === "className") {
      merged[key] = cn(childValue as string | undefined, slotValue as string | undefined);
    } else {
      merged[key] = slotValue;
    }
  }

  merged.ref = mergeRefs(
    (slotProps as { ref?: React.Ref<unknown> }).ref,
    (childProps as { ref?: React.Ref<unknown> }).ref,
  );

  return cloneElement(child, merged);
}
