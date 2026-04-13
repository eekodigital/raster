import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import * as Tooltip from "./Tooltip.js";

function renderTooltip({ defaultOpen = false }: { defaultOpen?: boolean } = {}) {
  return render(
    <Tooltip.Provider delayDuration={0}>
      <Tooltip.Root defaultOpen={defaultOpen}>
        <Tooltip.Trigger asChild>
          <button type="button">Hover me</button>
        </Tooltip.Trigger>
        <Tooltip.Content>Tooltip text</Tooltip.Content>
      </Tooltip.Root>
    </Tooltip.Provider>,
  );
}

function renderTooltipWithDelay({ delayDuration = 700 }: { delayDuration?: number } = {}) {
  return render(
    <Tooltip.Provider delayDuration={delayDuration}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <button type="button">Hover me</button>
        </Tooltip.Trigger>
        <Tooltip.Content>Tooltip text</Tooltip.Content>
      </Tooltip.Root>
    </Tooltip.Provider>,
  );
}

describe("Tooltip", () => {
  describe("show and hide", () => {
    it("is not visible by default", () => {
      renderTooltip();
      expect(screen.queryByRole("tooltip")).toBeNull();
    });

    it("shows content when defaultOpen is true", () => {
      renderTooltip({ defaultOpen: true });
      expect(screen.getAllByText("Tooltip text").length).toBeGreaterThan(0);
    });

    it("shows on focus", async () => {
      renderTooltip();
      screen.getByRole("button", { name: "Hover me" }).focus();
      await waitFor(() => expect(screen.getByRole("tooltip")).toBeDefined());
    });

    it("shows on mouseEnter (with zero delay)", async () => {
      renderTooltip();
      fireEvent.mouseEnter(screen.getByRole("button", { name: "Hover me" }));
      await waitFor(() => expect(screen.getByRole("tooltip")).toBeDefined());
    });

    it("hides on mouseLeave", async () => {
      renderTooltip();
      const trigger = screen.getByRole("button", { name: "Hover me" });
      fireEvent.mouseEnter(trigger);
      await waitFor(() => expect(screen.getByRole("tooltip")).toBeDefined());
      fireEvent.mouseLeave(trigger);
      await waitFor(() => expect(screen.queryByRole("tooltip")).toBeNull());
    });

    it("hides on blur", async () => {
      renderTooltip();
      const trigger = screen.getByRole("button", { name: "Hover me" });
      trigger.focus();
      await waitFor(() => expect(screen.getByRole("tooltip")).toBeDefined());
      fireEvent.blur(trigger);
      await waitFor(() => expect(screen.queryByRole("tooltip")).toBeNull());
    });

    it("shows on mouseEnter after delay", async () => {
      vi.useFakeTimers();
      renderTooltipWithDelay({ delayDuration: 500 });
      fireEvent.mouseEnter(screen.getByRole("button", { name: "Hover me" }));
      // Not visible yet
      expect(screen.queryByRole("tooltip")).toBeNull();
      // Advance past the delay
      await act(async () => {
        vi.advanceTimersByTime(500);
      });
      expect(screen.getByRole("tooltip")).toBeDefined();
      vi.useRealTimers();
    });

    it("cancels delay timer on mouseLeave before it fires", async () => {
      vi.useFakeTimers();
      renderTooltipWithDelay({ delayDuration: 500 });
      const trigger = screen.getByRole("button", { name: "Hover me" });
      fireEvent.mouseEnter(trigger);
      // Leave before delay fires
      await act(async () => {
        vi.advanceTimersByTime(200);
      });
      fireEvent.mouseLeave(trigger);
      await act(async () => {
        vi.advanceTimersByTime(500);
      });
      expect(screen.queryByRole("tooltip")).toBeNull();
      vi.useRealTimers();
    });
  });

  describe("keyboard interaction", () => {
    it("dismisses on Escape", async () => {
      renderTooltip({ defaultOpen: true });
      expect(screen.getByRole("tooltip")).toBeDefined();
      await userEvent.keyboard("{Escape}");
      await waitFor(() => expect(screen.queryByRole("tooltip")).toBeNull());
    });
  });

  describe("Arrow component", () => {
    it("renders an SVG arrow inside an open tooltip", () => {
      const { container } = render(
        <Tooltip.Provider delayDuration={0}>
          <Tooltip.Root defaultOpen>
            <Tooltip.Trigger>Hover</Tooltip.Trigger>
            <Tooltip.Content>
              Tip
              <Tooltip.Arrow />
            </Tooltip.Content>
          </Tooltip.Root>
        </Tooltip.Provider>,
      );
      const svg = container.querySelector('svg[aria-hidden="true"]');
      expect(svg).not.toBeNull();
    });
  });

  describe("Content className", () => {
    it("applies a custom className to the content", () => {
      render(
        <Tooltip.Provider delayDuration={0}>
          <Tooltip.Root defaultOpen>
            <Tooltip.Trigger>Hover</Tooltip.Trigger>
            <Tooltip.Content className="custom-tip">Tip text</Tooltip.Content>
          </Tooltip.Root>
        </Tooltip.Provider>,
      );
      const tooltip = screen.getByRole("tooltip");
      expect(tooltip.className).toContain("custom-tip");
    });
  });
});
