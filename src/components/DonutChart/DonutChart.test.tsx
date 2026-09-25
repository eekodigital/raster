import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { axe } from "../../test-utils/axe.js";
import { focusedName, openTable, press, tableText, tabStops } from "../../test-utils/chart.js";
import { DonutChart } from "./DonutChart.js";

const DATA = [
  { label: "Pass", value: 60, color: "green" },
  { label: "Fail", value: 30, color: "red" },
  { label: "N/A", value: 10, color: "grey" },
];

describe("DonutChart structure", () => {
  it("is a figure with a title, summary and chart group", () => {
    const { container } = render(<DonutChart data={DATA} title="Results" />);
    const figure = screen.getByRole("figure", { name: "Results" });
    expect(document.getElementById(figure.getAttribute("aria-describedby")!)?.textContent).toBe(
      "Donut chart, 3 points. Values from 10 to 60.",
    );
    expect(container.querySelector("svg")?.getAttribute("role")).toBe("group");
  });

  it("labels static segments with value, percentage and position", () => {
    render(<DonutChart data={DATA} title="R" />);
    expect(screen.getAllByRole("img").map((el) => el.getAttribute("aria-label"))).toEqual([
      "Pass: 60 (60%), 1 of 3",
      "Fail: 30 (30%), 2 of 3",
      "N/A: 10 (10%), 3 of 3",
    ]);
  });

  it("skips zero-value segments in the drawing and the count, but keeps them in the table", () => {
    const data = [...DATA, { label: "Empty", value: 0, color: "blue" }];
    render(<DonutChart data={data} title="R" />);
    expect(screen.getAllByRole("img")).toHaveLength(3);
    screen.getByRole("img", { name: "N/A: 10 (10%), 3 of 3" });
    expect(tableText(openTable()).at(-1)).toEqual(["Empty", "0", "0%"]);
  });

  it("renders centre content and a legend", () => {
    const { container } = render(
      <DonutChart data={DATA} title="R" showLegend>
        <strong>100</strong>
      </DonutChart>,
    );
    expect(container.querySelector(".raster-donut__centre")?.textContent).toBe("100");
    expect(container.querySelectorAll(".raster-legend__swatch")).toHaveLength(3);
  });

  it("puts the draw-in animation in CSS, driven by custom properties", () => {
    render(<DonutChart data={DATA} title="R" />);
    const seg = screen.getByRole("img", { name: /^Fail/ }) as unknown as SVGElement;
    expect(seg.style.animation).toBe("");
    expect(seg.style.getPropertyValue("--donut-delay")).toMatch(/ms$/);
    expect(seg.style.getPropertyValue("--donut-duration")).toMatch(/ms$/);
  });

  it("has a data table with formatted values and percentages", () => {
    render(<DonutChart data={DATA} title="Results" formatValue={(v) => `${v} items`} />);
    const table = openTable();
    expect(screen.getByRole("table", { name: "Data for Results" })).toBe(table);
    expect(tableText(table)).toEqual([
      ["Category", "Value", "Percentage"],
      ["Pass", "60 items", "60%"],
      ["Fail", "30 items", "30%"],
      ["N/A", "10 items", "10%"],
    ]);
  });
});

describe("DonutChart sizing", () => {
  it("has a fixed size when given one", () => {
    const { container } = render(<DonutChart data={DATA} title="R" size={200} />);
    const plot = container.querySelector<HTMLElement>(".raster-chart__plot")!;
    expect(plot.style.width).toBe("200px");
    expect(plot.style.height).toBe("200px");
    expect(container.querySelector("svg")?.getAttribute("viewBox")).toBe("0 0 200 200");
  });

  it("otherwise fills its container as a square", () => {
    const { container } = render(<DonutChart data={DATA} title="R" />);
    const plot = container.querySelector<HTMLElement>(".raster-chart__plot")!;
    expect(plot.style.aspectRatio).toMatch(/^1/);
    expect(plot.style.width).toBe("");
  });
});

describe("DonutChart keyboard and selection", () => {
  it("moves round the ring with any arrow, wrapping, and Home/End", () => {
    render(<DonutChart data={DATA} title="R" />);
    expect(tabStops()).toEqual(["Pass: 60 (60%), 1 of 3"]);
    const seg = (n: RegExp) => screen.getByRole("img", { name: n });
    press(seg(/^Pass/), "ArrowRight");
    expect(focusedName()).toMatch(/^Fail/);
    press(seg(/^Fail/), "ArrowDown");
    expect(focusedName()).toMatch(/^N\/A/);
    press(seg(/^N\/A/), "ArrowRight");
    expect(focusedName()).toMatch(/^Pass/);
    press(seg(/^Pass/), "ArrowUp");
    expect(focusedName()).toMatch(/^N\/A/);
    press(seg(/^N\/A/), "Home");
    expect(focusedName()).toMatch(/^Pass/);
    press(seg(/^Pass/), "End");
    expect(focusedName()).toMatch(/^N\/A/);
  });

  it("toggles with click, Enter and Space; Escape clears within the chart", () => {
    const onSegmentClick = vi.fn();
    const onSelect = vi.fn();
    render(
      <DonutChart data={DATA} title="R" onSegmentClick={onSegmentClick} onSelect={onSelect} />,
    );
    const fail = screen.getByRole("button", { name: /^Fail/ });
    fireEvent.click(fail);
    expect(onSegmentClick).toHaveBeenCalledWith(DATA[1], 1);
    expect(onSelect).toHaveBeenCalledWith(1);
    expect(fail.getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("button", { name: /^Pass/ }).hasAttribute("data-dimmed")).toBe(true);
    press(fail, "Enter");
    expect(fail.getAttribute("aria-pressed")).toBe("false");
    press(fail, " ");
    press(fail, "Escape");
    expect(fail.getAttribute("aria-pressed")).toBe("false");
    expect(screen.getByRole("status").textContent).toBe("Selection cleared");
  });
});

describe("DonutChart axe", () => {
  it("has no violations, static and interactive", async () => {
    const { container, unmount } = render(<DonutChart data={DATA} title="R" showLegend />);
    openTable();
    expect(await axe(container)).toHaveNoViolations();
    unmount();
    const { container: c2 } = render(<DonutChart data={DATA} title="R" onSelect={() => {}} />);
    expect(await axe(c2)).toHaveNoViolations();
  });
});
