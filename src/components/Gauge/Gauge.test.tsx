import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "../../test-utils/axe.js";
import { Gauge } from "./Gauge.js";

describe("Gauge", () => {
  it("is a meter named by its visible label", () => {
    render(<Gauge value={72} max={86} label="Assessed" />);
    const meter = screen.getByRole("meter", { name: "Assessed" });
    const label = document.getElementById(meter.getAttribute("aria-labelledby")!);
    expect(label?.textContent).toBe("Assessed");
    expect(meter.hasAttribute("aria-label")).toBe(false);
  });

  it("exposes min, max, value and a formatted valuetext", () => {
    render(<Gauge value={0.42} min={0} max={1} label="Score" format={(v) => `${v * 100}%`} />);
    const meter = screen.getByRole("meter", { name: "Score" });
    expect(meter.getAttribute("aria-valuenow")).toBe("0.42");
    expect(meter.getAttribute("aria-valuemin")).toBe("0");
    expect(meter.getAttribute("aria-valuemax")).toBe("1");
    expect(meter.getAttribute("aria-valuetext")).toBe("42%");
    expect(screen.getByText("42%")).toBeTruthy();
  });

  it("fills relative to min", () => {
    const { container } = render(<Gauge value={15} min={10} max={20} label="Half" size={100} />);
    const fill = container.querySelector(".raster-gauge__fill")!;
    const circumference = Number(fill.getAttribute("stroke-dasharray"));
    expect(Number(fill.getAttribute("stroke-dashoffset"))).toBeCloseTo(circumference / 2);
  });

  it("clamps outside the range", () => {
    const { container, rerender } = render(<Gauge value={150} max={100} label="Over" size={100} />);
    const fill = () => container.querySelector(".raster-gauge__fill")!;
    expect(Number(fill().getAttribute("stroke-dashoffset"))).toBe(0);
    rerender(<Gauge value={-5} max={100} label="Under" size={100} />);
    expect(Number(fill().getAttribute("stroke-dashoffset"))).toBeCloseTo(
      Number(fill().getAttribute("stroke-dasharray")),
    );
    rerender(<Gauge value={1} min={5} max={5} label="Empty range" size={100} />);
    expect(screen.getByRole("meter").getAttribute("aria-valuetext")).toBe("1");
  });

  it("formats with Intl by default", () => {
    render(<Gauge value={1234} max={2000} label="Views" />);
    expect(screen.getByRole("meter").getAttribute("aria-valuetext")).toBe("1,234");
  });

  it("has a fixed size when given, otherwise fills its container as a square", () => {
    const { container, rerender } = render(<Gauge value={1} max={2} label="G" size={90} />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.width).toBe("90px");
    expect(container.querySelector("svg")?.getAttribute("viewBox")).toBe("0 0 90 90");
    rerender(<Gauge value={1} max={2} label="G" />);
    expect(root.style.width).toBe("");
    expect(root.className).toContain("raster-gauge");
  });

  it("has no axe violations", async () => {
    const { container } = render(<Gauge value={1} max={2} label="G" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
