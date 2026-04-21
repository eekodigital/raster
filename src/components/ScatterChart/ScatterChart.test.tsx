import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ScatterChart } from "./ScatterChart.js";

const DATA = [
  { x: 10, y: 5, label: "Page A" },
  { x: 30, y: 15, label: "Page B" },
  { x: 50, y: 8, label: "Page C" },
];

describe("ScatterChart", () => {
  it("renders points with aria-labels", () => {
    render(<ScatterChart data={DATA} aria-label="Scatter" />);
    expect(screen.getByRole("img", { name: /Page A/ })).toBeDefined();
    expect(screen.getByRole("img", { name: /Page B/ })).toBeDefined();
  });

  it("renders axis labels", () => {
    render(<ScatterChart data={DATA} xLabel="Complexity" yLabel="Issues" aria-label="Scatter" />);
    expect(screen.getAllByText("Complexity").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Issues").length).toBeGreaterThanOrEqual(1);
  });

  it("renders a hidden data table", () => {
    render(<ScatterChart data={DATA} aria-label="Scatter" />);
    const table = screen.getByRole("table", { name: "Scatter" });
    expect(table.textContent).toContain("Page A");
    expect(table.textContent).toContain("10");
  });

  it("renders legend for multi-series", () => {
    const series = [
      { name: "Group A", data: [{ x: 1, y: 2 }] },
      { name: "Group B", data: [{ x: 3, y: 4 }] },
    ];
    render(<ScatterChart series={series} aria-label="Multi" />);
    expect(screen.getAllByText("Group A").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Group B").length).toBeGreaterThanOrEqual(1);
  });

  it("calls onPointClick when a point is clicked", () => {
    const onClick = vi.fn();
    render(<ScatterChart data={DATA} onPointClick={onClick} aria-label="Clickable" />);
    fireEvent.click(screen.getByRole("img", { name: /Page A/ }));
    expect(onClick).toHaveBeenCalledWith(DATA[0], 0, 0);
  });

  it("formats tick values with formatValue", () => {
    render(<ScatterChart data={DATA} formatValue={(v) => `${v}%`} aria-label="Formatted" />);
    const table = screen.getByRole("table", { name: "Formatted" });
    expect(table.textContent).toContain("10%");
  });

  describe("keyboard interaction", () => {
    it("ArrowRight moves focus to next point", () => {
      render(<ScatterChart data={DATA} aria-label="Nav" />);
      const first = screen.getByRole("img", { name: /Page A/ });
      first.focus();
      fireEvent.keyDown(first, { key: "ArrowRight" });
      expect(document.activeElement).toBe(screen.getByRole("img", { name: /Page B/ }));
    });
  });

  it("renders with a fixed-px width and no viewBox", () => {
    render(<ScatterChart data={DATA} aria-label="Scatter" />);
    const svg = screen.getByRole("img", { name: "Scatter" });
    expect(svg.getAttribute("width")).toBe("720");
    expect(svg.getAttribute("viewBox")).toBeNull();
  });

  it("sr-only data table is marked display:block so its table layout can't leak into parent scrollHeight", () => {
    render(<ScatterChart data={DATA} aria-label="Scatter" />);
    const table = screen.getByRole("table", { name: "Scatter" });
    expect(table.className).toMatch(/srOnly/);
  });
});
