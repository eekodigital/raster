import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Portal } from "./Portal.js";

describe("Portal", () => {
  it("renders children into document.body by default", () => {
    const { baseElement } = render(
      <Portal>
        <span data-testid="portaled">hello</span>
      </Portal>,
    );
    const el = baseElement.querySelector('[data-testid="portaled"]');
    expect(el).not.toBeNull();
    expect(el?.parentElement).toBe(document.body);
  });

  it("renders children into a custom container when provided", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);

    render(
      <Portal container={container}>
        <span data-testid="portaled">hello</span>
      </Portal>,
    );

    const el = container.querySelector('[data-testid="portaled"]');
    expect(el).not.toBeNull();
    expect(el?.parentElement).toBe(container);

    container.remove();
  });
});
