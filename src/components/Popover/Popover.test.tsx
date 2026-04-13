import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import * as Popover from "./Popover.js";

function renderPopover() {
  return render(
    <Popover.Root>
      <Popover.Trigger>Open</Popover.Trigger>
      <Popover.Content>
        <input placeholder="Name" />
        <Popover.Close>Close</Popover.Close>
      </Popover.Content>
    </Popover.Root>,
  );
}

describe("Popover", () => {
  describe("opening and closing", () => {
    it("is not visible before trigger click", () => {
      renderPopover();
      expect(screen.queryByPlaceholderText("Name")).toBeNull();
    });

    it("opens on trigger click", () => {
      renderPopover();
      fireEvent.click(screen.getByRole("button", { name: "Open" }));
      expect(screen.getByPlaceholderText("Name")).toBeDefined();
    });

    it("closes via the Close button", () => {
      renderPopover();
      fireEvent.click(screen.getByRole("button", { name: "Open" }));
      expect(screen.getByPlaceholderText("Name")).toBeDefined();
      fireEvent.click(screen.getByRole("button", { name: "Close" }));
      expect(screen.queryByPlaceholderText("Name")).toBeNull();
    });
  });

  describe("keyboard interaction", () => {
    it("closes on Escape", async () => {
      renderPopover();
      fireEvent.click(screen.getByRole("button", { name: "Open" }));
      expect(screen.getByPlaceholderText("Name")).toBeDefined();

      await userEvent.keyboard("{Escape}");
      await waitFor(() => expect(screen.queryByPlaceholderText("Name")).toBeNull());
    });

    it("returns focus to trigger when closed", async () => {
      renderPopover();
      const trigger = screen.getByRole("button", { name: "Open" });
      fireEvent.click(trigger);

      await userEvent.keyboard("{Escape}");
      await waitFor(() => expect(document.activeElement).toBe(trigger));
    });
  });

  describe("asChild", () => {
    it("Trigger renders consumer's element without a wrapper button", () => {
      const { container } = render(
        <Popover.Root>
          <Popover.Trigger asChild>
            <button type="button" data-testid="custom-trigger" className="mine">
              Open
            </button>
          </Popover.Trigger>
          <Popover.Content>hi</Popover.Content>
        </Popover.Root>,
      );
      const buttons = container.querySelectorAll("button");
      expect(buttons).toHaveLength(1);
      expect(buttons[0].dataset.testid).toBe("custom-trigger");
      expect(buttons[0].className).toContain("mine");
      expect(buttons[0].getAttribute("aria-expanded")).toBe("false");
    });

    it("Trigger asChild: consumer onClick fires and popover opens", () => {
      const onClick = vi.fn();
      render(
        <Popover.Root>
          <Popover.Trigger asChild>
            <button type="button" onClick={onClick}>
              Open
            </button>
          </Popover.Trigger>
          <Popover.Content>
            <span>content</span>
          </Popover.Content>
        </Popover.Root>,
      );
      fireEvent.click(screen.getByRole("button", { name: "Open" }));
      expect(onClick).toHaveBeenCalled();
      expect(screen.getByText("content")).toBeDefined();
    });

    it("Close asChild renders consumer's element", () => {
      const { container } = render(
        <Popover.Root defaultOpen>
          <Popover.Trigger>Open</Popover.Trigger>
          <Popover.Content>
            <Popover.Close asChild>
              <a href="#close" data-testid="close-link">
                Close
              </a>
            </Popover.Close>
          </Popover.Content>
        </Popover.Root>,
      );
      expect(container.querySelector('[data-testid="close-link"]')).toBeTruthy();
    });
  });
});
