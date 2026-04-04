import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Gauge } from "./Gauge.js";

describe("Gauge", () => {
  it('renders with role="meter"', () => {
    render(<Gauge value={72} max={86} aria-label="Progress" />);
    const meter = screen.getByRole("meter", { name: "Progress" });
    expect(meter).toBeDefined();
  });

  it("sets aria-valuenow and aria-valuemax", () => {
    render(<Gauge value={42} max={100} aria-label="Score" />);
    const meter = screen.getByRole("meter", { name: "Score" });
    expect(meter.getAttribute("aria-valuenow")).toBe("42");
    expect(meter.getAttribute("aria-valuemax")).toBe("100");
  });

  it("displays the formatted value", () => {
    render(<Gauge value={42} max={100} aria-label="Score" />);
    expect(screen.getByText("42")).toBeDefined();
  });

  it("displays a label", () => {
    render(<Gauge value={42} max={100} label="Assessed" aria-label="Score" />);
    expect(screen.getByText("Assessed")).toBeDefined();
  });

  it("uses custom format function", () => {
    render(<Gauge value={3.5} max={4} format={(v) => v.toFixed(1)} aria-label="Score" />);
    expect(screen.getByText("3.5")).toBeDefined();
  });

  it("clamps at 100%", () => {
    render(<Gauge value={150} max={100} aria-label="Over" />);
    const meter = screen.getByRole("meter", { name: "Over" });
    expect(meter.getAttribute("aria-valuenow")).toBe("150");
  });
});
