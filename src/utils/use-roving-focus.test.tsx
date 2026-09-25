import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
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
            ref={roving.ref(r, i)}
            tabIndex={-1}
            role="img"
            aria-label={`${r}-${i}`}
            onKeyDown={roving.onKeyDown(r, i)}
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
});
