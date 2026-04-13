export function composeEventHandlers<E extends { defaultPrevented: boolean }>(
  theirs: ((event: E) => void) | undefined,
  ours: ((event: E) => void) | undefined,
  { checkForDefaultPrevented = true }: { checkForDefaultPrevented?: boolean } = {},
): (event: E) => void {
  return (event) => {
    theirs?.(event);
    if (!checkForDefaultPrevented || !event.defaultPrevented) ours?.(event);
  };
}
