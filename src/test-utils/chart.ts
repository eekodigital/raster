import { fireEvent, screen } from "@testing-library/react";

/** Focus the mark named `name` (any role) and press `key` on it. */
export function press(el: Element, key: string) {
  (el as HTMLElement).focus();
  return fireEvent.keyDown(el, { key });
}

export const focusedName = () => document.activeElement?.getAttribute("aria-label");

/** Names of elements currently in the tab order inside `root`. */
export function tabStops(root: ParentNode = document) {
  return [...root.querySelectorAll('[tabindex="0"]')].map((el) => el.getAttribute("aria-label"));
}

export function openTable() {
  fireEvent.click(screen.getByRole("button", { name: "Show data table" }));
  return screen.getByRole("table");
}

/** Rows of the (opened) data table as arrays of cell text, header row first. */
export function tableText(table: HTMLElement) {
  return [...table.querySelectorAll("tr")].map((tr) =>
    [...tr.querySelectorAll("th, td")].map((c) => c.textContent),
  );
}
