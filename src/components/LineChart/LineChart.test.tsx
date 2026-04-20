import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LineChart } from "./LineChart.js";

const SERIES = [{ name: "Assessed", data: [10, 25, 40, 60, 86] }];
const LABELS = ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"];

describe("LineChart", () => {
  it('renders an SVG with role="img"', () => {
    render(<LineChart series={SERIES} labels={LABELS} aria-label="Progress" />);
    const svg = screen.getByRole("img", { name: "Progress" });
    expect(svg.tagName.toLowerCase()).toBe("svg");
  });

  it("renders data points with aria-labels", () => {
    render(<LineChart series={SERIES} labels={LABELS} aria-label="Progress" />);
    expect(screen.getByRole("img", { name: "Assessed, Week 1: 10" })).toBeDefined();
    expect(screen.getByRole("img", { name: "Assessed, Week 5: 86" })).toBeDefined();
  });

  it("renders series as a region", () => {
    render(<LineChart series={SERIES} labels={LABELS} aria-label="Progress" />);
    expect(screen.getByRole("region", { name: "Assessed" })).toBeDefined();
  });

  it("renders a hidden data table", () => {
    render(<LineChart series={SERIES} labels={LABELS} aria-label="Progress" />);
    const table = screen.getByRole("table", { name: "Progress" });
    expect(table).toBeDefined();
  });

  it("renders legend for multi-series", () => {
    const multi = [
      { name: "Series A", data: [5, 10, 15] },
      { name: "Series B", data: [1, 2, 3] },
    ];
    render(<LineChart series={multi} labels={["Jan", "Feb", "Mar"]} aria-label="Trend" />);
    expect(screen.getAllByText("Series A").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Series B").length).toBeGreaterThanOrEqual(1);
  });

  it("does not render legend for single series", () => {
    render(<LineChart series={SERIES} labels={LABELS} aria-label="Progress" />);
    expect(document.querySelector('[class*="legend "]')).toBeNull();
  });

  it("renders area fill when area prop is true", () => {
    const { container } = render(
      <LineChart series={SERIES} labels={LABELS} area aria-label="Area chart" />,
    );
    const paths = container.querySelectorAll("path");
    expect(paths.length).toBeGreaterThan(0);
  });

  it("first data point is focusable", () => {
    render(<LineChart series={SERIES} labels={LABELS} aria-label="Progress" />);
    const first = screen.getByRole("img", { name: "Assessed, Week 1: 10" });
    expect(first.getAttribute("tabindex")).toBe("0");
  });

  it("renders area path elements when area prop is true", () => {
    render(<LineChart series={SERIES} labels={LABELS} area aria-label="Area" />);
    // With area=true, there should be an area path (fill != "none") in addition to the line path
    const region = screen.getByRole("region", { name: "Assessed" });
    const paths = region.querySelectorAll("path");
    // At least 2 paths: one for the area fill, one for the line stroke
    expect(paths.length).toBeGreaterThanOrEqual(2);
  });

  it("hidden data table contains correct values", () => {
    render(<LineChart series={SERIES} labels={LABELS} aria-label="Progress" />);
    const table = screen.getByRole("table", { name: "Progress" });
    expect(table.textContent).toContain("10");
    expect(table.textContent).toContain("86");
    expect(table.textContent).toContain("Week 1");
    expect(table.textContent).toContain("Week 5");
  });

  it('renders grid lines when grid="both"', () => {
    const { container } = render(
      <LineChart series={SERIES} labels={LABELS} grid="both" aria-label="Grid" />,
    );
    // With grid="both", there should be dashed grid lines (strokeDasharray)
    const dashedLines = container.querySelectorAll("line[stroke-dasharray]");
    expect(dashedLines.length).toBeGreaterThan(0);
  });

  it('hides grid lines when grid="none"', () => {
    const { container } = render(
      <LineChart series={SERIES} labels={LABELS} grid="none" aria-label="No grid" />,
    );
    // With grid="none", no dashed lines should appear
    const dashedLines = container.querySelectorAll("line[stroke-dasharray]");
    expect(dashedLines.length).toBe(0);
  });

  it("onPointClick fires with correct arguments", () => {
    const onClick = vi.fn();
    render(<LineChart series={SERIES} labels={LABELS} aria-label="Click" onPointClick={onClick} />);
    const point = screen.getByRole("img", { name: "Assessed, Week 3: 40" });
    fireEvent.click(point);
    expect(onClick).toHaveBeenCalledWith(0, 2, 40);
  });

  it('renders smooth curve path when curve="smooth"', () => {
    render(<LineChart series={SERIES} labels={LABELS} curve="smooth" aria-label="Smooth" />);
    const region = screen.getByRole("region", { name: "Assessed" });
    const paths = region.querySelectorAll("path");
    expect(paths.length).toBeGreaterThan(0);
    // Smooth curves use C (cubic bezier) commands from catmullRomPath
    const d = paths[0].getAttribute("d") ?? "";
    expect(d).toContain("C");
  });

  it("renders stacked area elements when stacked and area are true", () => {
    const multi = [
      { name: "Series A", data: [5, 10, 15] },
      { name: "Series B", data: [3, 6, 9] },
    ];
    render(
      <LineChart series={multi} labels={["Jan", "Feb", "Mar"]} stacked area aria-label="Stacked" />,
    );
    // Each series should have an area path
    const regions = screen.getAllByRole("region");
    expect(regions.length).toBe(2);
    for (const region of regions) {
      const paths = region.querySelectorAll("path");
      // At least 2 paths per series: area + line
      expect(paths.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("renders smooth stacked area path", () => {
    const multi = [
      { name: "Series A", data: [5, 10, 15] },
      { name: "Series B", data: [3, 6, 9] },
    ];
    render(
      <LineChart
        series={multi}
        labels={["Jan", "Feb", "Mar"]}
        stacked
        area
        curve="smooth"
        aria-label="Smooth stacked"
      />,
    );
    const regions = screen.getAllByRole("region");
    expect(regions.length).toBe(2);
  });

  it("renders with a fixed-px width and no viewBox so internals don't scale", () => {
    render(<LineChart series={SERIES} labels={LABELS} aria-label="Progress" />);
    const svg = screen.getByRole("img", { name: "Progress" });
    expect(svg.getAttribute("width")).toBe("720");
    expect(svg.getAttribute("viewBox")).toBeNull();
  });
});
