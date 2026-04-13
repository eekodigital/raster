import { render, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createRef } from "react";
import { Slot } from "./slot.js";

describe("Slot", () => {
  it("renders the child element only — no wrapper", () => {
    const { container } = render(
      <Slot data-testid="slot">
        <button type="button">Click</button>
      </Slot>,
    );
    expect(container.querySelectorAll("button")).toHaveLength(1);
    expect(container.querySelector("button")?.dataset.testid).toBe("slot");
  });

  it("merges className", () => {
    const { container } = render(
      <Slot className="from-slot">
        <button type="button" className="from-child">
          x
        </button>
      </Slot>,
    );
    expect(container.querySelector("button")?.className).toBe("from-child from-slot");
  });

  it("merges style with slot winning on conflict", () => {
    const { container } = render(
      <Slot style={{ color: "red", padding: 4 }}>
        <button type="button" style={{ color: "blue", margin: 2 }}>
          x
        </button>
      </Slot>,
    );
    const btn = container.querySelector("button")!;
    expect(btn.style.color).toBe("red");
    expect(btn.style.padding).toBe("4px");
    expect(btn.style.margin).toBe("2px");
  });

  it("composes onClick handlers (both fire)", () => {
    const childClick = vi.fn();
    const slotClick = vi.fn();
    const { container } = render(
      <Slot onClick={slotClick}>
        <button type="button" onClick={childClick}>
          x
        </button>
      </Slot>,
    );
    fireEvent.click(container.querySelector("button")!);
    expect(childClick).toHaveBeenCalled();
    expect(slotClick).toHaveBeenCalled();
  });

  it("skips slot handler when child calls preventDefault", () => {
    const slotClick = vi.fn();
    const { container } = render(
      <Slot onClick={slotClick}>
        <button type="button" onClick={(e) => e.preventDefault()}>
          x
        </button>
      </Slot>,
    );
    fireEvent.click(container.querySelector("button")!);
    expect(slotClick).not.toHaveBeenCalled();
  });

  it("forwards refs", () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <Slot ref={ref as unknown as React.Ref<HTMLElement>}>
        <button type="button">x</button>
      </Slot>,
    );
    expect(ref.current?.tagName).toBe("BUTTON");
  });
});
