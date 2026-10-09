import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { axe } from "../../test-utils/axe.js";
import { focusedName, openTable, press, tableText, tabStops } from "../../test-utils/chart.js";
import { RadarChart } from "./RadarChart.js";

const AXES = ["Speed", "Power", "Range"];
const SERIES = [
  { name: "Alpha", data: [3, 4, 5] },
  { name: "Beta", data: [5, 2, 1] },
];

describe("RadarChart structure", () => {
  it("is a figure with a title, summary, chart group and series groups", () => {
    const { container } = render(<RadarChart axes={AXES} series={SERIES} title="Specs" />);
    const figure = screen.getByRole("figure", { name: "Specs" });
    expect(document.getElementById(figure.getAttribute("aria-describedby")!)?.textContent).toBe(
      "Radar chart, 2 series, 6 points. Speed to Range. Values from 1 to 5.",
    );
    expect(container.querySelector("svg")?.getAttribute("role")).toBe("group");
    screen.getByRole("group", { name: "Alpha, 3 points" });
  });

  it("labels points {series}, {axis}: {value}, n of m with marker shapes", () => {
    render(<RadarChart axes={AXES} series={SERIES} title="Specs" />);
    const a = screen.getByRole("img", { name: "Alpha, Power: 4, 2 of 3" });
    const b = screen.getByRole("img", { name: "Beta, Power: 2, 2 of 3" });
    expect(a.getAttribute("d")).not.toBe(b.getAttribute("d"));
  });

  it("makes points toggle buttons when clickable", () => {
    const onMarkClick = vi.fn();
    render(<RadarChart axes={AXES} series={SERIES} title="Specs" onMarkClick={onMarkClick} />);
    const p = screen.getByRole("button", { name: /^Beta, Range/ });
    fireEvent.click(p);
    expect(onMarkClick).toHaveBeenCalledWith({
      index: { series: 1, point: 2 },
      value: 1,
      datum: undefined,
    });
    expect(p.getAttribute("aria-pressed")).toBe("true");
  });

  it("has a formatted data table", () => {
    render(<RadarChart axes={AXES} series={SERIES} title="Specs" formatValue={(v) => `${v}/5`} />);
    expect(tableText(openTable())).toEqual([
      ["Axis", "Alpha", "Beta"],
      ["Speed", "3/5", "5/5"],
      ["Power", "4/5", "2/5"],
      ["Range", "5/5", "1/5"],
    ]);
  });

  it("uses a fixed size when given, otherwise a square that fills the container", () => {
    const { container, rerender } = render(
      <RadarChart axes={AXES} series={SERIES} title="S" size={240} max={10} levels={2} />,
    );
    const plot = container.querySelector<HTMLElement>(".raster-chart__plot")!;
    expect(plot.style.width).toBe("240px");
    expect(container.querySelectorAll(".raster-radar__grid")).toHaveLength(2);
    rerender(<RadarChart axes={AXES} series={SERIES} title="S" />);
    expect(plot.style.aspectRatio).toMatch(/^1/);
  });
});

describe("RadarChart axis labels", () => {
  it("anchor away from the centre, and fit beside the web", () => {
    const axes = ["Perceivable", "Operable", "Understandable", "Robust"];
    const { container } = render(
      <RadarChart axes={axes} series={[{ name: "A", data: [1, 2, 3, 4] }]} size={300} title="R" />,
    );
    const labels = [...container.querySelectorAll(".raster-radar__label")];
    // Top, right, bottom, left.
    expect(labels.map((l) => l.getAttribute("text-anchor"))).toEqual([
      "middle",
      "start",
      "middle",
      "end",
    ]);
    // "Operable" (56 px) starts beside the web and ends inside the 300 px chart.
    const right = labels[1];
    expect(Number(right.getAttribute("x")) + 8 * 7).toBeLessThanOrEqual(300);
    expect(labels.map((l) => l.textContent)).toEqual(axes);
  });

  it("cut side labels too long for the margin", () => {
    const { container } = render(
      <RadarChart
        axes={["Top", "A very long axis name indeed", "Bottom", "Left"]}
        series={[{ name: "A", data: [1, 2, 3, 4] }]}
        size={200}
        title="R"
      />,
    );
    // 30% of 200 px, less 14, leaves 46 px: 6 characters.
    expect(container.querySelectorAll(".raster-radar__label")[1].textContent).toBe("A ver…");
  });
});

describe("RadarChart keyboard", () => {
  it("wraps round the axes and moves between series", () => {
    render(<RadarChart axes={AXES} series={SERIES} title="S" onSelect={() => {}} />);
    expect(tabStops()).toEqual(["Alpha, Speed: 3, 1 of 3"]);
    press(screen.getByRole("button", { name: /^Alpha, Speed/ }), "ArrowLeft");
    expect(focusedName()).toBe("Alpha, Range: 5, 3 of 3");
    press(screen.getByRole("button", { name: /^Alpha, Range/ }), "ArrowDown");
    expect(focusedName()).toBe("Beta, Range: 1, 3 of 3");
    press(screen.getByRole("button", { name: /^Beta, Range/ }), "Home");
    expect(focusedName()).toBe("Beta, Speed: 5, 1 of 3");
    const p = screen.getByRole("button", { name: /^Beta, Speed/ });
    press(p, " ");
    expect(p.getAttribute("aria-pressed")).toBe("true");
    press(p, "Escape");
    expect(p.getAttribute("aria-pressed")).toBe("false");
  });

  it("keeps keyboard focus on drawn points when a series is shorter than the axes", () => {
    const axes = ["A", "B", "C", "D", "E"];
    render(
      <RadarChart
        axes={axes}
        series={[
          { name: "Short", data: [1, 2, 3] },
          { name: "Long", data: [1, 2, 3, 4, 5, 6] },
        ]}
        title="Partial"
      />,
    );
    screen.getByRole("group", { name: "Short, 3 points" });
    // Extra values past the last axis are ignored.
    screen.getByRole("group", { name: "Long, 5 points" });
    press(screen.getByRole("img", { name: "Short, A: 1, 1 of 3" }), "End");
    expect(focusedName()).toBe("Short, C: 3, 3 of 3");
    press(screen.getByRole("img", { name: /^Short, C/ }), "ArrowRight");
    expect(focusedName()).toBe("Short, A: 1, 1 of 3");
    expect(tabStops()).toHaveLength(1);
    expect(tableText(openTable())[4]).toEqual(["D", "", "4"]);
  });
});

describe("RadarChart axe", () => {
  it("has no violations", async () => {
    const { container } = render(<RadarChart axes={AXES} series={SERIES} title="S" />);
    openTable();
    expect(await axe(container)).toHaveNoViolations();
  });
});
