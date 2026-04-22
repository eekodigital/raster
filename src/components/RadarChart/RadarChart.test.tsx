import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RadarChart } from "./RadarChart.js";

const AXES = ["Perceivable", "Operable", "Understandable", "Robust"];
const SERIES = [{ name: "Current", data: [80, 65, 90, 70] }];

describe("RadarChart", () => {
  it('renders an SVG with role="img"', () => {
    render(<RadarChart axes={AXES} series={SERIES} aria-label="POUR scores" />);
    expect(screen.getByRole("img", { name: "POUR scores" })).toBeDefined();
  });

  it("renders data points with aria-labels", () => {
    render(<RadarChart axes={AXES} series={SERIES} aria-label="POUR scores" />);
    expect(screen.getByRole("img", { name: "Current, Perceivable: 80" })).toBeDefined();
    expect(screen.getByRole("img", { name: "Current, Robust: 70" })).toBeDefined();
  });

  it("renders series as a group", () => {
    render(<RadarChart axes={AXES} series={SERIES} aria-label="POUR scores" />);
    expect(screen.getByRole("group", { name: "Current" })).toBeDefined();
  });

  it("renders axis labels", () => {
    render(<RadarChart axes={AXES} series={SERIES} aria-label="POUR scores" />);
    expect(screen.getAllByText("Perceivable").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Robust").length).toBeGreaterThanOrEqual(1);
  });

  it("renders legend for multi-series", () => {
    const multi = [
      { name: "Current", data: [80, 65, 90, 70] },
      { name: "Target", data: [100, 100, 100, 100] },
    ];
    render(<RadarChart axes={AXES} series={multi} aria-label="Comparison" />);
    expect(screen.getAllByText("Current").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Target").length).toBeGreaterThanOrEqual(1);
  });

  it("renders a hidden data table", () => {
    render(<RadarChart axes={AXES} series={SERIES} aria-label="POUR scores" />);
    const table = screen.getByRole("table", { name: "POUR scores" });
    expect(table).toBeDefined();
    expect(table.textContent).toContain("Perceivable");
    expect(table.textContent).toContain("80");
  });

  it("first data point is focusable", () => {
    render(<RadarChart axes={AXES} series={SERIES} aria-label="POUR scores" />);
    const first = screen.getByRole("img", { name: "Current, Perceivable: 80" });
    expect(first.getAttribute("tabindex")).toBe("0");
  });

  it("renders multiple polygons for multi-series", () => {
    const multi = [
      { name: "Current", data: [80, 65, 90, 70] },
      { name: "Target", data: [100, 100, 100, 100] },
    ];
    render(<RadarChart axes={AXES} series={multi} aria-label="Multi" />);
    const currentRegion = screen.getByRole("group", { name: "Current" });
    const targetRegion = screen.getByRole("group", { name: "Target" });
    // Each region should have 2 polygons (area fill + line stroke)
    expect(currentRegion.querySelectorAll("polygon").length).toBe(2);
    expect(targetRegion.querySelectorAll("polygon").length).toBe(2);
  });

  it("renders legend with series names for multi-series", () => {
    const multi = [
      { name: "Current", data: [80, 65, 90, 70] },
      { name: "Target", data: [100, 100, 100, 100] },
    ];
    render(<RadarChart axes={AXES} series={multi} aria-label="Multi" />);
    // Legend text should include series names
    expect(screen.getAllByText("Current").length).toBeGreaterThanOrEqual(2); // region + legend
    expect(screen.getAllByText("Target").length).toBeGreaterThanOrEqual(2);
  });

  it("hidden data table contains correct values for multi-series", () => {
    const multi = [
      { name: "Current", data: [80, 65, 90, 70] },
      { name: "Target", data: [100, 100, 100, 100] },
    ];
    render(<RadarChart axes={AXES} series={multi} aria-label="Multi" />);
    const table = screen.getByRole("table", { name: "Multi" });
    expect(table.textContent).toContain("Current");
    expect(table.textContent).toContain("Target");
    expect(table.textContent).toContain("80");
    expect(table.textContent).toContain("100");
  });

  it("does not render legend for single series", () => {
    render(<RadarChart axes={AXES} series={SERIES} aria-label="Single" />);
    // Only one mention of "Current" (in the region, table header, and table body)
    // but no legend element for single series
    const regions = screen.getAllByRole("group");
    expect(regions.length).toBe(1);
  });

  it("falls back to the measurement default when size is omitted and no viewBox is set", () => {
    render(<RadarChart axes={AXES} series={SERIES} aria-label="POUR scores" />);
    const svg = screen.getByRole("img", { name: "POUR scores" });
    expect(svg.getAttribute("width")).toBe("300");
    expect(svg.getAttribute("viewBox")).toBeNull();
  });

  it("respects an explicit size prop", () => {
    render(<RadarChart axes={AXES} series={SERIES} size={420} aria-label="POUR scores" />);
    const svg = screen.getByRole("img", { name: "POUR scores" });
    expect(svg.getAttribute("width")).toBe("420");
  });

  it("sr-only data table is marked display:block so its table layout can't leak into parent scrollHeight", () => {
    render(<RadarChart axes={AXES} series={SERIES} aria-label="POUR scores" />);
    const table = screen.getByRole("table", { name: "POUR scores" });
    expect(table.className).toMatch(/srOnly/);
  });
});
