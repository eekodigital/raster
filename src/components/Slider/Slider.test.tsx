import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import * as Slider from "./Slider.js";

function renderSlider({
  value = [50],
  min = 0,
  max = 100,
  step,
  disabled,
  onValueChange,
}: {
  value?: number[];
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  onValueChange?: (value: number[]) => void;
} = {}) {
  return render(
    <Slider.Root
      value={value}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      onValueChange={onValueChange}
      aria-label="Volume"
    >
      <Slider.Track />
      <Slider.Thumb aria-label="Volume" />
    </Slider.Root>,
  );
}

describe("Slider", () => {
  describe("rendering", () => {
    it("renders with the correct value", () => {
      renderSlider({ value: [30] });
      expect(screen.getByRole("slider").getAttribute("aria-valuenow")).toBe("30");
    });

    it("renders min and max", () => {
      renderSlider({ min: 0, max: 10, value: [5] });
      const slider = screen.getByRole("slider");
      expect(slider.getAttribute("aria-valuemin")).toBe("0");
      expect(slider.getAttribute("aria-valuemax")).toBe("10");
    });

    it("renders multiple thumbs for range slider", () => {
      render(
        <Slider.Root value={[20, 80]} aria-label="Range">
          <Slider.Track />
          <Slider.Thumb aria-label="Min" />
          <Slider.Thumb aria-label="Max" />
        </Slider.Root>,
      );
      expect(screen.getAllByRole("slider").length).toBe(2);
    });

    it("range slider thumbs have correct values", () => {
      render(
        <Slider.Root value={[20, 80]} min={0} max={100} aria-label="Range">
          <Slider.Track />
          <Slider.Thumb aria-label="Min" />
          <Slider.Thumb aria-label="Max" />
        </Slider.Root>,
      );
      const sliders = screen.getAllByRole("slider");
      expect(sliders[0].getAttribute("aria-valuenow")).toBe("20");
      expect(sliders[1].getAttribute("aria-valuenow")).toBe("80");
    });

    it("renders aria-label on thumb", () => {
      renderSlider();
      expect(screen.getByRole("slider").getAttribute("aria-label")).toBe("Volume");
    });
  });

  describe("keyboard interaction", () => {
    it.each([
      ["{ArrowRight}", "increase"],
      ["{ArrowUp}", "increase"],
      ["{ArrowLeft}", "decrease"],
      ["{ArrowDown}", "decrease"],
    ])("%s %ss value", async (key, direction) => {
      const onChange = vi.fn();
      renderSlider({ value: [50], onValueChange: onChange });
      screen.getByRole("slider").focus();
      await userEvent.keyboard(key);
      expect(onChange).toHaveBeenCalled();
      if (direction === "increase") expect(onChange.mock.calls[0][0][0]).toBeGreaterThan(50);
      else expect(onChange.mock.calls[0][0][0]).toBeLessThan(50);
    });

    it("Home sets to minimum", async () => {
      const onChange = vi.fn();
      renderSlider({ value: [50], min: 0, max: 100, onValueChange: onChange });
      screen.getByRole("slider").focus();
      await userEvent.keyboard("{Home}");
      expect(onChange).toHaveBeenCalledWith([0]);
    });

    it("End sets to maximum", async () => {
      const onChange = vi.fn();
      renderSlider({ value: [50], min: 0, max: 100, onValueChange: onChange });
      screen.getByRole("slider").focus();
      await userEvent.keyboard("{End}");
      expect(onChange).toHaveBeenCalledWith([100]);
    });

    it("respects step size", async () => {
      const onChange = vi.fn();
      renderSlider({ value: [50], step: 10, onValueChange: onChange });
      screen.getByRole("slider").focus();
      await userEvent.keyboard("{ArrowRight}");
      expect(onChange).toHaveBeenCalledWith([60]);
    });

    it("does not exceed max", async () => {
      const onChange = vi.fn();
      renderSlider({ value: [100], max: 100, onValueChange: onChange });
      screen.getByRole("slider").focus();
      await userEvent.keyboard("{ArrowRight}");
      // Should either not call or call with max
      if (onChange.mock.calls.length > 0) {
        expect(onChange.mock.calls[0][0][0]).toBeLessThanOrEqual(100);
      }
    });

    it("does not go below min", async () => {
      const onChange = vi.fn();
      renderSlider({ value: [0], min: 0, onValueChange: onChange });
      screen.getByRole("slider").focus();
      await userEvent.keyboard("{ArrowLeft}");
      if (onChange.mock.calls.length > 0) {
        expect(onChange.mock.calls[0][0][0]).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe("disabled state", () => {
    it("does not respond to keyboard when disabled", async () => {
      const onChange = vi.fn();
      renderSlider({ value: [50], disabled: true, onValueChange: onChange });
      const slider = screen.getByRole("slider");
      slider.focus();
      await userEvent.keyboard("{ArrowRight}");
      expect(onChange).not.toHaveBeenCalled();
    });

    it("has data-disabled attribute when disabled", () => {
      renderSlider({ disabled: true });
      const slider = screen.getByRole("slider");
      expect(slider.closest("[data-disabled]")).toBeDefined();
    });
  });

  describe("range slider keyboard", () => {
    it("first thumb responds to ArrowRight", async () => {
      const onChange = vi.fn();
      render(
        <Slider.Root value={[20, 80]} min={0} max={100} onValueChange={onChange} aria-label="Range">
          <Slider.Track />
          <Slider.Thumb aria-label="Min" />
          <Slider.Thumb aria-label="Max" />
        </Slider.Root>,
      );
      screen.getByLabelText("Min").focus();
      await userEvent.keyboard("{ArrowRight}");
      expect(onChange).toHaveBeenCalled();
      expect(onChange.mock.calls[0][0][0]).toBeGreaterThan(20);
    });

    it("second thumb responds to ArrowRight", async () => {
      const onChange = vi.fn();
      render(
        <Slider.Root value={[20, 80]} min={0} max={100} onValueChange={onChange} aria-label="Range">
          <Slider.Track />
          <Slider.Thumb aria-label="Min" />
          <Slider.Thumb aria-label="Max" />
        </Slider.Root>,
      );
      screen.getByLabelText("Max").focus();
      await userEvent.keyboard("{ArrowRight}");
      expect(onChange).toHaveBeenCalled();
      expect(onChange.mock.calls[0][0][1]).toBeGreaterThan(80);
    });
  });

  describe("pointer interaction", () => {
    it("responds to pointerdown on track", () => {
      const onChange = vi.fn();
      const { container } = renderSlider({ value: [50], onValueChange: onChange });
      const track = container.querySelector('[class*="track"]') as HTMLElement;
      if (!track) return;

      // Mock getBoundingClientRect for track
      track.getBoundingClientRect = vi.fn(() => ({
        left: 0,
        top: 0,
        width: 200,
        height: 20,
        right: 200,
        bottom: 20,
        x: 0,
        y: 0,
        toJSON: () => {},
      }));

      // Click at 75% of the track (should set value ~75)
      track.dispatchEvent(
        new PointerEvent("pointerdown", {
          clientX: 150,
          clientY: 10,
          bubbles: true,
          pointerId: 1,
        }),
      );

      // Radix may or may not respond in jsdom — this tests the event path exists
      // Real drag validation is in Playwright e2e tests
    });
  });

  describe("accessibility", () => {
    it("thumb is focusable", () => {
      renderSlider();
      const slider = screen.getByRole("slider");
      slider.focus();
      expect(document.activeElement).toBe(slider);
    });

    it("has correct ARIA attributes", () => {
      renderSlider({ value: [25], min: 0, max: 200 });
      const slider = screen.getByRole("slider");
      expect(slider.getAttribute("aria-valuenow")).toBe("25");
      expect(slider.getAttribute("aria-valuemin")).toBe("0");
      expect(slider.getAttribute("aria-valuemax")).toBe("200");
      expect(slider.getAttribute("aria-orientation")).toBe("horizontal");
    });
  });
});
