import type React from "react";

type PossibleRef<T> = React.Ref<T> | undefined;

function setRef<T>(ref: PossibleRef<T>, value: T | null) {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref != null) {
    (ref as React.MutableRefObject<T | null>).current = value;
  }
}

export function mergeRefs<T>(...refs: PossibleRef<T>[]): React.RefCallback<T> {
  return (value) => {
    for (const ref of refs) setRef(ref, value);
  };
}
