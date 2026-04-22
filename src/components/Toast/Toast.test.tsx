import { act, render, screen } from "@testing-library/react";
import { fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { axe } from "../../test-utils/axe.js";
import * as Toast from "./Toast.js";

function renderToast({ open = true }: { open?: boolean } = {}) {
  return render(
    <Toast.Provider>
      <Toast.Root open={open}>
        <Toast.Title>File saved</Toast.Title>
        <Toast.Description>Your changes have been saved.</Toast.Description>
        <Toast.Close aria-label="Dismiss" />
      </Toast.Root>
      <Toast.Viewport />
    </Toast.Provider>,
  );
}

describe("Toast", () => {
  it("shows title and description when open", () => {
    renderToast();
    expect(screen.getByText("File saved")).toBeDefined();
    expect(screen.getByText("Your changes have been saved.")).toBeDefined();
  });

  it("is not visible when closed", () => {
    renderToast({ open: false });
    expect(screen.queryByText("File saved")).toBeNull();
  });

  it("has a dismiss button", () => {
    renderToast();
    expect(screen.getByRole("button", { name: "Dismiss" })).toBeDefined();
  });

  it("dismiss button is focusable", () => {
    renderToast();
    const dismiss = screen.getByRole("button", { name: "Dismiss" });
    dismiss.focus();
    expect(document.activeElement).toBe(dismiss);
  });

  it("auto-dismisses after the specified duration", () => {
    vi.useFakeTimers();
    render(
      <Toast.Provider>
        <Toast.Root duration={1000}>
          <Toast.Title>Temp</Toast.Title>
        </Toast.Root>
      </Toast.Provider>,
    );
    expect(screen.getByText("Temp")).toBeDefined();
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.queryByText("Temp")).toBeNull();
    vi.useRealTimers();
  });

  it("does not auto-dismiss when duration is Infinity", () => {
    vi.useFakeTimers();
    render(
      <Toast.Provider>
        <Toast.Root duration={Infinity}>
          <Toast.Title>Persistent</Toast.Title>
        </Toast.Root>
      </Toast.Provider>,
    );
    act(() => {
      vi.advanceTimersByTime(60000);
    });
    expect(screen.getByText("Persistent")).toBeDefined();
    vi.useRealTimers();
  });

  it("renders an action button that fires onClick", () => {
    const onClick = vi.fn();
    render(
      <Toast.Provider>
        <Toast.Root open>
          <Toast.Title>Info</Toast.Title>
          <Toast.Action onClick={onClick}>Undo</Toast.Action>
        </Toast.Root>
      </Toast.Provider>,
    );
    const btn = screen.getByRole("button", { name: "Undo" });
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("controlled open={false} hides the toast", () => {
    render(
      <Toast.Provider>
        <Toast.Root open={false}>
          <Toast.Title>Hidden</Toast.Title>
        </Toast.Root>
      </Toast.Provider>,
    );
    expect(screen.queryByText("Hidden")).toBeNull();
  });

  it("controlled open={true} shows the toast", () => {
    render(
      <Toast.Provider>
        <Toast.Root open={true}>
          <Toast.Title>Visible</Toast.Title>
        </Toast.Root>
      </Toast.Provider>,
    );
    expect(screen.getByText("Visible")).toBeDefined();
  });

  describe("accessibility", () => {
    it("has no axe violations when open", async () => {
      const { baseElement } = renderToast({ open: true });
      expect(await axe(baseElement)).toHaveNoViolations();
    });
  });
});
