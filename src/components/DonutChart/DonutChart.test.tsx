import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DonutChart } from "./DonutChart.js";

const DATA = [
  { label: "Pass", value: 12, color: "var(--color-success)" },
  { label: "Fail", value: 3, color: "var(--color-danger)" },
  { label: "N/A", value: 5, color: "var(--color-inactive)" },
];

describe("DonutChart", () => {
  it('renders an SVG with role="img"', () => {
    render(<DonutChart data={DATA} aria-label="Test donut" />);
    const svg = screen.getByRole("img", { name: "Test donut" });
    expect(svg.tagName.toLowerCase()).toBe("svg");
  });

  it("renders a segment for each data point", () => {
    render(<DonutChart data={DATA} aria-label="Test donut" />);
    expect(screen.getByRole("img", { name: /Pass: 12/ })).toBeDefined();
    expect(screen.getByRole("img", { name: /Fail: 3/ })).toBeDefined();
    expect(screen.getByRole("img", { name: /N\/A: 5/ })).toBeDefined();
  });

  it("includes percentage in segment labels", () => {
    render(<DonutChart data={DATA} aria-label="Test donut" />);
    // 12/20 = 60%
    expect(screen.getByRole("img", { name: /60%/ })).toBeDefined();
  });

  it("renders centre content", () => {
    render(
      <DonutChart data={DATA} aria-label="Test donut">
        <span>20 total</span>
      </DonutChart>,
    );
    expect(screen.getByText("20 total")).toBeDefined();
  });

  it("renders a hidden data table", () => {
    render(<DonutChart data={DATA} aria-label="Test donut" />);
    const table = screen.getByRole("table", { name: "Test donut" });
    expect(table).toBeDefined();
  });

  it("first segment is focusable", () => {
    render(<DonutChart data={DATA} aria-label="Test donut" />);
    const first = screen.getByRole("img", { name: /Pass: 12/ });
    expect(first.getAttribute("tabindex")).toBe("0");
  });

  it("skips zero-value segments", () => {
    const dataWithZero = [
      { label: "A", value: 10, color: "red" },
      { label: "B", value: 0, color: "blue" },
    ];
    render(<DonutChart data={dataWithZero} aria-label="Test" />);
    expect(screen.queryByRole("img", { name: /B: 0/ })).toBeNull();
  });

  it("renders legend when showLegend is true", () => {
    render(<DonutChart data={DATA} showLegend aria-label="Test donut" />);
    // Each label appears in both the hidden data table and the legend
    expect(screen.getAllByText("Pass").length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText("Fail").length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText("N/A").length).toBeGreaterThanOrEqual(2);
  });

  it("hidden data table contains all data values", () => {
    render(<DonutChart data={DATA} aria-label="Test donut" />);
    const table = screen.getByRole("table", { name: "Test donut" });
    expect(table.textContent).toContain("12");
    expect(table.textContent).toContain("3");
    expect(table.textContent).toContain("5");
    expect(table.textContent).toContain("60%");
    expect(table.textContent).toContain("15%");
    expect(table.textContent).toContain("25%");
  });

  it("ArrowRight navigates to the next segment", () => {
    render(<DonutChart data={DATA} aria-label="Test donut" />);
    const first = screen.getByRole("img", { name: /Pass: 12/ });
    first.focus();
    fireEvent.keyDown(first, { key: "ArrowRight" });
    // The second segment should now have focus
    const second = screen.getByRole("img", { name: /Fail: 3/ });
    expect(document.activeElement).toBe(second);
  });

  it("segment click fires onSegmentClick with correct datum", () => {
    const onClick = vi.fn();
    render(<DonutChart data={DATA} aria-label="Test donut" onSegmentClick={onClick} />);
    const segment = screen.getByRole("img", { name: /Fail: 3/ });
    fireEvent.click(segment);
    expect(onClick).toHaveBeenCalledWith(DATA[1], 1);
  });

  it("sr-only data table is marked display:block so its table layout can't leak into parent scrollHeight", () => {
    render(<DonutChart data={DATA} aria-label="Test donut" />);
    const table = screen.getByRole("table", { name: "Test donut" });
    expect(table.classList.contains("raster-sr-only")).toBe(true);
    expect(table.style.display).toBe("block");
  });

  it("arrow keys wrap around the ring", () => {
    render(<DonutChart data={DATA} aria-label="Wrap" />);
    const segs = screen.getAllByRole("img").filter((el) => el.tagName === "path");
    segs[0].focus();
    fireEvent.keyDown(segs[0], { key: "ArrowLeft" });
    expect(document.activeElement).toBe(segs[segs.length - 1]);
    fireEvent.keyDown(document.activeElement!, { key: "ArrowDown" });
    expect(document.activeElement).toBe(segs[0]);
  });

  it("selection toggles on click and clears on Escape", () => {
    const onSelect = vi.fn();
    render(<DonutChart data={DATA} onSelect={onSelect} aria-label="Sel" />);
    const seg = screen.getAllByRole("img").filter((el) => el.tagName === "path")[1];
    fireEvent.click(seg);
    expect(onSelect).toHaveBeenLastCalledWith(1);
    expect(seg.hasAttribute("data-selected")).toBe(true);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onSelect).toHaveBeenLastCalledWith(null);
  });
});
