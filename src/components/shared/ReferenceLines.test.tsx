import { render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { axe } from "../../test-utils/axe.js";
import { openTable } from "../../test-utils/chart.js";
import { timeAxis } from "../../utils/time.js";
import { BarChart } from "../BarChart/BarChart.js";
import { LineChart } from "../LineChart/LineChart.js";
import { ScatterChart } from "../ScatterChart/ScatterChart.js";

const summaryOf = (name: string) => {
  const figure = screen.getByRole("figure", { name });
  return document.getElementById(figure.getAttribute("aria-describedby")!)?.textContent;
};
const refs = (root: Element) =>
  [...root.querySelectorAll(".raster-chart__reference-line")].map((l) => ({
    x1: Number(l.getAttribute("x1")),
    x2: Number(l.getAttribute("x2")),
    y1: Number(l.getAttribute("y1")),
    y2: Number(l.getAttribute("y2")),
  }));
const refLabels = (root: Element) =>
  [...root.querySelectorAll(".raster-chart__reference-label")].map((t) => t.textContent);

describe("reference lines", () => {
  const SERIES = [{ name: "Assessed", data: [10, 25, 40, 60, 86] }];
  const WEEKS = ["W1", "W2", "W3", "W4", "W5"];

  it("LineChart: a labelled horizontal line, hidden in the SVG, in the summary and caption", () => {
    const { container } = render(
      <LineChart
        series={SERIES}
        categories={WEEKS}
        title="Progress"
        referenceLines={[{ value: 90, label: "Target" }]}
      />,
    );
    const group = container.querySelector(".raster-chart__reference")!;
    expect(group.getAttribute("aria-hidden")).toBe("true");
    expect(refLabels(container)).toEqual(["Target: 90"]);
    const [line] = refs(container);
    expect(line.y1).toBe(line.y2);
    expect(line.x1).toBe(0);
    // The scale reaches 90 (above the data's 86), so the line is on the plot.
    expect(line.y1).toBeGreaterThanOrEqual(0);
    expect(summaryOf("Progress")).toBe(
      "Line chart, 5 points. W1 to W5. Values from 10 to 86. Target: 90.",
    );
    expect(openTable().querySelector("caption")?.textContent).toBe(
      "Data for Progress, with a reference line (Target: 90)",
    );
    // Not focusable: still one tab stop.
    expect(container.querySelectorAll('[tabindex="0"]')).toHaveLength(1);
  });

  it("LineChart with a time axis: a vertical line at a date", () => {
    const { container } = render(
      <LineChart
        series={[{ name: "Views", data: [10, 20, 30] }]}
        x={timeAxis(["2026-10-01", "2026-10-02", "2026-10-04"])}
        labels={{ locale: "en-GB" }}
        title="Views"
        referenceLines={[
          { value: "2026-10-02", label: "Launch", axis: "x" },
          { value: "2027-01-01", label: "Off the plot", axis: "x" },
        ]}
      />,
    );
    const [line] = refs(container);
    expect(refs(container)).toHaveLength(1);
    expect(line.x1).toBe(line.x2);
    expect(Math.round(line.x1)).toBe(221);
    expect(refLabels(container)).toEqual(["Launch: 2 October 2026"]);
    expect(summaryOf("Views")).toMatch(/Launch: 2 October 2026\.$/);
  });

  it("LineChart: ignores x lines on a category axis", () => {
    const { container } = render(
      <LineChart
        series={SERIES}
        categories={WEEKS}
        title="P"
        referenceLines={[{ value: 2, label: "Mid", axis: "x" }]}
      />,
    );
    expect(refs(container)).toHaveLength(0);
  });

  it("BarChart: across the value axis, vertical for horizontal bars", () => {
    const data = [
      { label: "A", value: 4 },
      { label: "B", value: 7 },
    ];
    const { container, unmount } = render(
      <BarChart data={data} title="Bars" referenceLines={[{ value: 10, label: "Goal" }]} />,
    );
    let [line] = refs(container);
    expect(line.y1).toBe(line.y2);
    expect(line.y1).toBeGreaterThanOrEqual(0);
    expect(summaryOf("Bars")).toMatch(/Goal: 10\.$/);
    unmount();
    const h = render(
      <BarChart
        data={data}
        direction="horizontal"
        title="Bars"
        referenceLines={[{ value: 5, label: "Goal" }]}
      />,
    );
    [line] = refs(h.container);
    expect(line.x1).toBe(line.x2);
  });

  it("ScatterChart: y and x lines, x formatted with formatX", () => {
    const { container } = render(
      <ScatterChart
        data={[
          { x: 1, y: 2 },
          { x: 3, y: 4 },
        ]}
        formatX={(v) => `x${v}`}
        title="S"
        referenceLines={[
          { value: 5, label: "Ceiling" },
          { value: 2, label: "Split", axis: "x" },
        ]}
      />,
    );
    expect(refLabels(container)).toEqual(["Ceiling: 5", "Split: x2"]);
    const [h, v] = refs(container);
    expect(h.y1).toBe(h.y2);
    expect(h.y1).toBeGreaterThanOrEqual(0);
    expect(v.x1).toBe(v.x2);
    expect(openTable().querySelector("caption")?.textContent).toBe(
      "Data for S, with reference lines (Ceiling: 5; Split: x2)",
    );
  });

  it("is translatable", () => {
    render(
      <LineChart
        series={SERIES}
        categories={WEEKS}
        title="P"
        labels={{
          referenceLine: (label, value) => `${label} = ${value}`,
          tableCaption: (title) => `Daten für ${title}.`,
          referenceNote: (caption, lines) => `${caption} Linien: ${lines.join(", ")}.`,
        }}
        referenceLines={[{ value: 90, label: "Ziel" }]}
      />,
    );
    expect(summaryOf("P")).toMatch(/Ziel = 90\.$/);
    // referenceNote gets the whole caption, so punctuation is the translator's.
    expect(openTable().querySelector("caption")?.textContent).toBe(
      "Daten für P. Linien: Ziel = 90.",
    );
  });

  it("leaves out lines it can't place, and keeps the scale finite", () => {
    const { container, unmount } = render(
      <LineChart
        series={SERIES}
        categories={WEEKS}
        title="P"
        // A date without axis "x" isn't a y value: the type rejects it, and it's left out.
        referenceLines={[{ value: "2026-10-02", label: "Launch" } as never]}
      />,
    );
    expect(refs(container)).toHaveLength(0);
    expect(container.innerHTML).not.toContain("NaN");
    expect(summaryOf("P")).toBe("Line chart, 5 points. W1 to W5. Values from 10 to 86.");
    unmount();

    // A one-date time axis can't place other dates.
    const one = render(
      <LineChart
        series={[{ name: "V", data: [1] }]}
        x={timeAxis(["2026-10-01"])}
        title="One"
        referenceLines={[{ value: "2030-01-01", label: "Later", axis: "x" }]}
      />,
    );
    expect(refs(one.container)).toHaveLength(0);
    one.unmount();

    // Bars start at zero: a negative line would sit below the axis.
    const bars = render(
      <BarChart
        data={[{ label: "A", value: 4 }]}
        title="Bars"
        referenceLines={[{ value: -5, label: "Floor" }]}
      />,
    );
    expect(refs(bars.container)).toHaveLength(0);
    expect(summaryOf("Bars")).not.toMatch(/Floor/);
  });

  it("flips a vertical label that wouldn't fit to the right", () => {
    const { container } = render(
      <ScatterChart
        data={[
          { x: 0, y: 1 },
          { x: 100, y: 2 },
        ]}
        title="S"
        referenceLines={[{ value: 80, label: "A long reference label", axis: "x" }]}
      />,
    );
    const text = container.querySelector(".raster-chart__reference-label")!;
    expect(text.getAttribute("text-anchor")).toBe("end");
  });

  it("server-renders the line, summary and caption", () => {
    const html = renderToString(
      <LineChart
        series={SERIES}
        categories={WEEKS}
        title="P"
        referenceLines={[{ value: 90, label: "Target" }]}
      />,
    );
    expect(html).toContain('class="raster-chart__reference" aria-hidden="true"');
    expect(html).toContain("Values from 10 to 86. Target: 90.");
    expect(html).toContain("Data for P, with a reference line (Target: 90)");
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <LineChart
        series={SERIES}
        categories={WEEKS}
        title="P"
        referenceLines={[{ value: 90, label: "Target" }]}
      />,
    );
    openTable();
    expect(await axe(container)).toHaveNoViolations();
  });
});
