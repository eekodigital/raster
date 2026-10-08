import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { axe } from "../../test-utils/axe.js";
import { focusedName, openTable, press, tableText, tabStops } from "../../test-utils/chart.js";
import { timeAxis } from "../../utils/time.js";
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
    const onMarkClick = vi.fn();
    const onSelect = vi.fn();
    render(<ScatterChart data={POINTS} title="L" onMarkClick={onMarkClick} onSelect={onSelect} />);
    const peak = screen.getByRole("button", { name: /^Peak/ });
    fireEvent.click(peak);
    expect(onMarkClick).toHaveBeenCalledWith({
      index: { series: 0, point: 2 },
      value: POINTS[2].y,
      datum: POINTS[2],
    });
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

  it("formats x with formatX and y with formatValue, in ticks, names, table and summary", () => {
    const day = (d: number) => Date.UTC(2026, 9, d);
    const formatX = (v: number) =>
      new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" }).format(
        v,
      );
    const { container } = render(
      <ScatterChart
        data={[
          { x: day(1), y: 0.5 },
          { x: day(3), y: 0.25 },
        ]}
        formatX={formatX}
        formatValue={(v) => `${v * 100}%`}
        title="Rate"
      />,
    );
    screen.getByRole("img", { name: "3 Oct: 25%, 2 of 2" });
    const figure = screen.getByRole("figure", { name: "Rate" });
    expect(document.getElementById(figure.getAttribute("aria-describedby")!)?.textContent).toBe(
      "Scatter chart, 2 points. 1 Oct to 3 Oct. Values from 25% to 50%.",
    );
    const ticks = [...container.querySelectorAll("text.raster-chart__tick")].map(
      (t) => t.textContent,
    );
    expect(ticks.some((t) => t?.endsWith(" Oct"))).toBe(true);
    expect(ticks).toContain("50%");
    expect(tableText(openTable())[1]).toEqual(["1 Oct", "50%"]);
  });

  it("thins x ticks to fit formatX's labels", () => {
    const { container } = render(
      <ScatterChart
        data={Array.from({ length: 10 }, (_, i) => ({ x: i, y: i }))}
        formatX={(v) => `Long x-axis label for point ${v}`}
        title="Wide"
      />,
    );
    const xs = [...container.querySelectorAll("text.raster-chart__tick")]
      .filter((t) => t.textContent?.startsWith("Long"))
      .map((t) => Number(t.getAttribute("x")));
    expect(xs.length).toBeGreaterThan(1);
    // Labels are 30 characters: about 210 px plus a gap; numeric ticks are 165 px apart.
    for (let i = 1; i < xs.length; i++) expect(xs[i] - xs[i - 1]).toBeGreaterThanOrEqual(222);
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
      <ScatterChart data={POINTS} title="S" onMarkClick={() => {}} />,
    );
    expect(await axe(c2)).toHaveNoViolations();
  });
});

describe("ScatterChart with a date axis", () => {
  const day = (d: number) => Date.UTC(2026, 9, d);
  const points = [
    { x: day(1), y: 3 },
    { x: day(4), y: 5 },
    { x: day(2), y: 4 },
  ];

  it("places points by date, ticks on days and words x as dates", () => {
    const { container } = render(
      <ScatterChart
        data={points}
        xAxis={timeAxis(points.map((p) => p.x))}
        labels={{ locale: "en-GB" }}
        title="Dated"
      />,
    );
    screen.getByRole("img", { name: "2 October 2026: 4, 2 of 3" });
    const ticks = [...container.querySelectorAll("text.raster-chart__tick")]
      .filter((t) => !t.hasAttribute("dy"))
      .map((t) => t.textContent);
    expect(ticks).toEqual(["1 Oct", "2 Oct", "3 Oct", "4 Oct"]);
    const figure = screen.getByRole("figure", { name: "Dated" });
    expect(document.getElementById(figure.getAttribute("aria-describedby")!)?.textContent).toMatch(
      /^Scatter chart, 3 points\. 1 October 2026 to 4 October 2026\./,
    );
    expect(tableText(openTable())[1]).toEqual(["1 October 2026", "3"]);
  });
});
