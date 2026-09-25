import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { axe } from "../../test-utils/axe.js";
import { focusedName, openTable, press, tableText, tabStops } from "../../test-utils/chart.js";
import { ScatterChart } from "./ScatterChart.js";

const POINTS = [
  { x: 30, y: 5 },
  { x: 10, y: 1 },
  { x: 20, y: 1500, label: "Peak" },
];
const SERIES = [
  {
    name: "A",
    data: [
      { x: 1, y: 2 },
      { x: 3, y: 4 },
    ],
  },
  { name: "B", data: [{ x: 2, y: 3 }] },
];

describe("ScatterChart structure", () => {
  it("is a figure with a title, summary and chart group", () => {
    const { container } = render(<ScatterChart data={POINTS} title="Load" />);
    const figure = screen.getByRole("figure", { name: "Load" });
    expect(document.getElementById(figure.getAttribute("aria-describedby")!)?.textContent).toBe(
      "Scatter chart, 3 points. 10 to 30. Values from 1 to 1,500.",
    );
    expect(container.querySelector("svg")?.getAttribute("aria-roledescription")).toBe("chart");
  });

  it("labels single-series points {x}: {y}, n of m, ordered by x", () => {
    render(<ScatterChart data={POINTS} title="Load" />);
    expect(screen.getAllByRole("img").map((el) => el.getAttribute("aria-label"))).toEqual([
      "10: 1, 1 of 3",
      "Peak (20): 1,500, 2 of 3",
      "30: 5, 3 of 3",
    ]);
  });

  it("groups named series and draws a marker shape per series", () => {
    const { container } = render(<ScatterChart series={SERIES} title="S" />);
    const a = screen.getByRole("group", { name: "A, 2 points" });
    screen.getByRole("group", { name: "B, 1 point" });
    screen.getByRole("img", { name: "B, 2: 3, 1 of 1" });
    const shapeA = a.querySelector("path")?.getAttribute("d");
    const shapeB = screen.getByRole("img", { name: /^B/ }).getAttribute("d");
    expect(shapeA).toMatch(/a/);
    expect(shapeB).toMatch(/^M[^a]+Z$/);
    expect(container.querySelectorAll(".raster-legend__marker")).toHaveLength(2);
  });

  it("makes points toggle buttons when clickable", () => {
    const onPointClick = vi.fn();
    const onSelect = vi.fn();
    render(
      <ScatterChart data={POINTS} title="L" onPointClick={onPointClick} onSelect={onSelect} />,
    );
    const peak = screen.getByRole("button", { name: /^Peak/ });
    fireEvent.click(peak);
    expect(onPointClick).toHaveBeenCalledWith(POINTS[2], 0, 2);
    expect(onSelect).toHaveBeenCalledWith({ series: 0, point: 2 });
    expect(peak.getAttribute("aria-pressed")).toBe("true");
  });

  it("has a formatted data table with series and label columns", () => {
    render(
      <ScatterChart
        series={[{ name: "A", data: [{ x: 1, y: 2, label: "one" }] }, SERIES[1]]}
        title="S"
        xLabel="Time"
        yLabel="Load"
        formatValue={(v) => `${v}u`}
      />,
    );
    const table = openTable();
    expect(tableText(table)).toEqual([
      ["Series", "Label", "Time", "Load"],
      ["A", "one", "1u", "2u"],
      ["B", "", "2u", "3u"],
    ]);
  });

  it("supports grid variants and aspectRatio", () => {
    const { container, rerender } = render(
      <ScatterChart data={POINTS} title="G" grid="none" aspectRatio={2} />,
    );
    expect(container.querySelectorAll(".raster-chart__grid")).toHaveLength(0);
    expect(container.querySelector("svg")?.getAttribute("viewBox")).toBe("0 0 720 360");
    rerender(<ScatterChart data={POINTS} title="G" grid="horizontal" />);
    expect(container.querySelectorAll(".raster-chart__grid").length).toBeGreaterThan(0);
  });

  it("renders with no data", () => {
    render(<ScatterChart title="Empty" />);
    screen.getByRole("figure", { name: "Empty" });
  });
});

describe("ScatterChart keyboard", () => {
  it("moves by x within a series and between series", () => {
    render(<ScatterChart series={SERIES} title="S" onSelect={() => {}} />);
    expect(tabStops()).toEqual(["A, 1: 2, 1 of 2"]);
    press(screen.getByRole("button", { name: /^A, 1/ }), "ArrowRight");
    expect(focusedName()).toBe("A, 3: 4, 2 of 2");
    press(screen.getByRole("button", { name: /^A, 3/ }), "ArrowDown");
    expect(focusedName()).toBe("B, 2: 3, 1 of 1");
    press(screen.getByRole("button", { name: /^B/ }), "ArrowUp");
    press(screen.getByRole("button", { name: /^A, 1/ }), "End");
    expect(focusedName()).toBe("A, 3: 4, 2 of 2");
    const a3 = screen.getByRole("button", { name: /^A, 3/ });
    press(a3, "Enter");
    expect(a3.getAttribute("aria-pressed")).toBe("true");
    press(a3, "Escape");
    expect(a3.getAttribute("aria-pressed")).toBe("false");
  });
});

describe("ScatterChart axe", () => {
  it("has no violations, static and interactive", async () => {
    const { container, unmount } = render(<ScatterChart series={SERIES} title="S" />);
    openTable();
    expect(await axe(container)).toHaveNoViolations();
    unmount();
    const { container: c2 } = render(
      <ScatterChart data={POINTS} title="S" onPointClick={() => {}} />,
    );
    expect(await axe(c2)).toHaveNoViolations();
  });
});
