import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  HORIZONTAL_KEYS,
  VERTICAL_KEYS,
  useRovingFocus,
  type RovingFocusOptions,
} from "./use-roving-focus.js";

function Grid(props: RovingFocusOptions) {
  const roving = useRovingFocus(props);
  return (
    <svg>
      {props.counts.map((count, r) =>
        Array.from({ length: count }, (_, i) => (
          <circle
            key={`${r}-${i}`}
            role="img"
            aria-label={`${r}-${i}`}
            {...roving.itemProps(r, i)}
          />
        )),
      )}
    </svg>
  );
}

function press(label: string, key: string) {
  const el = screen.getByRole("img", { name: label });
  el.focus();
  return fireEvent.keyDown(el, { key });
}
const focused = () => document.activeElement?.getAttribute("aria-label");
const tabStops = () =>
  screen
    .getAllByRole("img")
    .filter((el) => el.getAttribute("tabindex") === "0")
    .map((el) => el.getAttribute("aria-label"));

describe("useRovingFocus", () => {
  it("moves along a row and clamps at the ends", () => {
    render(<Grid counts={[3]} itemKeys={HORIZONTAL_KEYS} />);
    press("0-0", "ArrowRight");
    expect(focused()).toBe("0-1");
    press("0-2", "ArrowRight");
    expect(focused()).toBe("0-2");
    press("0-0", "ArrowLeft");
    expect(focused()).toBe("0-0");
  });

  it("keeps exactly one tab stop, following focus", () => {
    render(<Grid counts={[3, 3]} itemKeys={HORIZONTAL_KEYS} rowKeys={VERTICAL_KEYS} />);
    expect(tabStops()).toEqual(["0-0"]);
    press("0-0", "ArrowRight");
    expect(tabStops()).toEqual(["0-1"]);
    press("0-1", "ArrowDown");
    expect(tabStops()).toEqual(["1-1"]);
    // Focusing a mark directly (e.g. by click) also moves the tab stop.
    fireEvent.focus(screen.getByRole("img", { name: "0-2" }));
    expect(tabStops()).toEqual(["0-2"]);
  });

  it("wraps when asked", () => {
    render(<Grid counts={[3]} itemKeys={HORIZONTAL_KEYS} wrap />);
    press("0-2", "ArrowRight");
    expect(focused()).toBe("0-0");
    press("0-0", "ArrowLeft");
    expect(focused()).toBe("0-2");
  });

  it("moves between rows, keeping the item index, and clamps", () => {
    render(<Grid counts={[2, 2]} itemKeys={HORIZONTAL_KEYS} rowKeys={VERTICAL_KEYS} />);
    press("0-1", "ArrowDown");
    expect(focused()).toBe("1-1");
    press("1-1", "ArrowDown");
    expect(focused()).toBe("1-1");
    press("1-0", "ArrowUp");
    expect(focused()).toBe("0-0");
    press("0-0", "ArrowUp");
    expect(focused()).toBe("0-0");
  });

  it("clamps the item when the next row is shorter and skips empty rows", () => {
    render(<Grid counts={[4, 0, 2]} itemKeys={HORIZONTAL_KEYS} rowKeys={VERTICAL_KEYS} />);
    press("0-3", "ArrowDown");
    expect(focused()).toBe("2-1");
    press("2-1", "ArrowUp");
    expect(focused()).toBe("0-1");
  });

  it("jumps with Home/End and PageUp/PageDown", () => {
    render(<Grid counts={[25]} itemKeys={HORIZONTAL_KEYS} />);
    press("0-3", "End");
    expect(focused()).toBe("0-24");
    press("0-24", "Home");
    expect(focused()).toBe("0-0");
    press("0-0", "PageDown");
    expect(focused()).toBe("0-10");
    press("0-20", "PageDown");
    expect(focused()).toBe("0-24");
    press("0-12", "PageUp");
    expect(focused()).toBe("0-2");
    press("0-2", "PageUp");
    expect(focused()).toBe("0-0");
  });

  it("activates with Enter and Space", () => {
    const onActivate = vi.fn();
    render(<Grid counts={[2]} itemKeys={HORIZONTAL_KEYS} onActivate={onActivate} />);
    expect(press("0-1", "Enter")).toBe(false);
    expect(press("0-0", " ")).toBe(false);
    expect(onActivate.mock.calls).toEqual([
      [0, 1],
      [0, 0],
    ]);
  });

  it("ignores Enter and Space without onActivate", () => {
    render(<Grid counts={[2]} itemKeys={HORIZONTAL_KEYS} />);
    expect(press("0-1", "Enter")).toBe(true);
  });

  it("supports several keys per direction", () => {
    const keys = { next: ["ArrowRight", "ArrowDown"], prev: ["ArrowLeft", "ArrowUp"] };
    render(<Grid counts={[3]} itemKeys={keys} />);
    press("0-0", "ArrowDown");
    expect(focused()).toBe("0-1");
    press("0-1", "ArrowUp");
    expect(focused()).toBe("0-0");
  });

  it("leaves unhandled keys alone (no preventDefault)", () => {
    render(<Grid counts={[2]} itemKeys={VERTICAL_KEYS} />);
    expect(press("0-0", "ArrowRight")).toBe(true);
    expect(focused()).toBe("0-0");
    expect(press("0-0", "ArrowDown")).toBe(false);
    expect(focused()).toBe("0-1");
  });

  it("keeps a valid tab stop when data shrinks", () => {
    const { rerender } = render(<Grid counts={[5]} itemKeys={HORIZONTAL_KEYS} />);
    press("0-3", "End");
    expect(tabStops()).toEqual(["0-4"]);
    rerender(<Grid counts={[2]} itemKeys={HORIZONTAL_KEYS} />);
    expect(tabStops()).toEqual(["0-1"]);
    rerender(<Grid counts={[0, 3]} itemKeys={HORIZONTAL_KEYS} />);
    expect(tabStops()).toEqual(["1-2"]);
  });
});
