import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import * as Switch from "./Switch.js";

function renderSwitch(props?: React.ComponentPropsWithoutRef<typeof Switch.Root>) {
  return render(
    <Switch.Root {...props}>
      <Switch.Thumb />
    </Switch.Root>,
  );
}

describe("Switch", () => {
  describe("mouse interaction", () => {
    it("is unchecked by default", () => {
      renderSwitch();
      expect(screen.getByRole("switch").getAttribute("aria-checked")).toBe("false");
    });

    it("toggles on click", () => {
      renderSwitch();
      const sw = screen.getByRole("switch");
      fireEvent.click(sw);
      expect(sw.getAttribute("aria-checked")).toBe("true");
      fireEvent.click(sw);
      expect(sw.getAttribute("aria-checked")).toBe("false");
    });

    it("calls onCheckedChange with the new value", () => {
      const onChange = vi.fn();
      renderSwitch({ onCheckedChange: onChange });
      fireEvent.click(screen.getByRole("switch"));
      expect(onChange).toHaveBeenCalledWith(true);
    });

    it("does not toggle when disabled", () => {
      renderSwitch({ disabled: true });
      fireEvent.click(screen.getByRole("switch"));
      expect(screen.getByRole("switch").getAttribute("aria-checked")).toBe("false");
    });

    it("respects defaultChecked", () => {
      renderSwitch({ defaultChecked: true });
      expect(screen.getByRole("switch").getAttribute("aria-checked")).toBe("true");
    });
  });

  describe("keyboard interaction", () => {
    it.each([" ", "{Enter}"])("toggles on %s", async (key) => {
      renderSwitch();
      screen.getByRole("switch").focus();
      await userEvent.keyboard(key);
      expect(screen.getByRole("switch").getAttribute("aria-checked")).toBe("true");
    });

    it("does not toggle on Space when disabled", async () => {
      renderSwitch({ disabled: true });
      screen.getByRole("switch").focus();
      await userEvent.keyboard(" ");
      expect(screen.getByRole("switch").getAttribute("aria-checked")).toBe("false");
    });
  });

  describe("accessibility", () => {
    it("forwards aria-label to the underlying button", () => {
      renderSwitch({ "aria-label": "Enable notifications" });
      expect(screen.getByRole("switch", { name: "Enable notifications" })).toBeDefined();
    });

    it("forwards aria-labelledby", () => {
      render(
        <>
          <span id="switch-label">Dark mode</span>
          <Switch.Root aria-labelledby="switch-label">
            <Switch.Thumb />
          </Switch.Root>
        </>,
      );
      expect(screen.getByRole("switch", { name: "Dark mode" })).toBeDefined();
    });
  });
});
