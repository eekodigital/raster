import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ChartTooltip } from "./ChartTooltip.js";

describe("ChartTooltip", () => {
  it('renders with role="tooltip" and content', () => {
    render(<ChartTooltip id="tip-1" visible={true} x={100} y={50} content="Hello" />);
    const tooltip = screen.getByRole("tooltip");
    expect(tooltip.textContent).toBe("Hello");
  });

  it("sets data-visible when visible is true", () => {
    render(<ChartTooltip id="tip-1" visible={true} x={100} y={50} content="Visible" />);
    const tooltip = screen.getByRole("tooltip");
    expect(tooltip.getAttribute("data-visible")).toBeDefined();
  });

  it("drops role=tooltip and sets aria-hidden when not visible", () => {
    const { container } = render(
      <ChartTooltip id="tip-1" visible={false} x={0} y={0} content="Hidden" />,
    );
    const el = container.querySelector("#tip-1") as HTMLElement;
    expect(el.getAttribute("role")).toBeNull();
    expect(el.getAttribute("aria-hidden")).toBe("true");
    expect(el.getAttribute("data-visible")).toBeNull();
  });

  it("drops role=tooltip when visible but content is empty", () => {
    const { container } = render(<ChartTooltip id="tip-1" visible={true} x={0} y={0} content="" />);
    const el = container.querySelector("#tip-1") as HTMLElement;
    expect(el.getAttribute("role")).toBeNull();
    expect(el.getAttribute("aria-hidden")).toBe("true");
  });

  it("positions with left and top styles", () => {
    render(<ChartTooltip id="tip-2" visible={true} x={120} y={80} content="Positioned" />);
    const tooltip = screen.getByRole("tooltip");
    expect(tooltip.style.left).toBe("120px");
    expect(tooltip.style.top).toBe("80px");
  });

  it("stays aria-hidden when decorative", () => {
    const { container } = render(
      <ChartTooltip id="tip-3" visible x={0} y={0} content="Shown" decorative />,
    );
    const el = container.querySelector("#tip-3") as HTMLElement;
    expect(el.getAttribute("role")).toBeNull();
    expect(el.getAttribute("aria-hidden")).toBe("true");
    expect(el.hasAttribute("data-visible")).toBe(true);
  });

  describe("stays inside its container", () => {
    afterEach(() => vi.restoreAllMocks());

    // Tooltip 80px wide in a 300px-wide container.
    function sized(x: number, tipWidth = 80) {
      vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockReturnValue(tipWidth);
      vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(300);
      render(
        <div>
          <ChartTooltip id="t" visible x={x} y={10} content="Visitors, 30 Sep: 1,234" />
        </div>,
      );
      return screen.getByRole("tooltip").style.transform;
    }

    it("centres on the point when it fits", () => {
      expect(sized(150)).toBe("translate(calc(-50% + 0px), -100%)");
    });

    it("shifts left at the right edge instead of overflowing", () => {
      // Centred at 290 it would span 250–330; clamped to 220–300.
      expect(sized(290)).toBe("translate(calc(-50% + -30px), -100%)");
    });

    it("shifts right at the left edge", () => {
      expect(sized(10)).toBe("translate(calc(-50% + 30px), -100%)");
    });

    it("pins to the left edge when wider than the container", () => {
      expect(sized(100, 400)).toBe("translate(calc(-50% + 100px), -100%)");
    });
  });
});
