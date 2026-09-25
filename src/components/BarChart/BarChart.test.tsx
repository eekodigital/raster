import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { axe } from "../../test-utils/axe.js";
import { focusedName, openTable, press, tableText, tabStops } from "../../test-utils/chart.js";
import { BarChart } from "./BarChart.js";

const DATA = [
  { label: "Pass", value: 42 },
  { label: "Fail", value: 8 },
  { label: "N/A", value: 12 },
];
const QUARTERS = [
  { label: "Q1", value: 0 },
  { label: "Q2", value: 0 },
];
const SERIES = ["North", "South"];
const VALUES = [
  [10, 20],
  [30, 1500],
];

describe("BarChart structure", () => {
  it("is a figure with a title, summary and chart group", () => {
    const { container } = render(<BarChart data={DATA} title="Results" />);
    const figure = screen.getByRole("figure", { name: "Results" });
    expect(document.getElementById(figure.getAttribute("aria-describedby")!)?.textContent).toBe(
      "Bar chart, 3 points. Pass to N/A. Values from 8 to 42.",
    );
    expect(container.querySelector("svg")?.getAttribute("aria-roledescription")).toBe("chart");
  });

  it("labels static bars as images: {x}: {y}, n of m", () => {
    render(<BarChart data={DATA} title="Results" />);
    expect(screen.getAllByRole("img").map((el) => el.getAttribute("aria-label"))).toEqual([
      "Pass: 42, 1 of 3",
      "Fail: 8, 2 of 3",
      "N/A: 12, 3 of 3",
    ]);
  });

  it("makes bars toggle buttons when selectable, dimming the rest", () => {
    const onSelect = vi.fn();
    const onBarClick = vi.fn();
    render(<BarChart data={DATA} title="R" onSelect={onSelect} onBarClick={onBarClick} />);
    const fail = screen.getByRole("button", { name: "Fail: 8, 2 of 3" });
    fireEvent.click(fail);
    expect(fail.getAttribute("aria-pressed")).toBe("true");
    expect(onSelect).toHaveBeenCalledWith(1);
    expect(onBarClick).toHaveBeenCalledWith(DATA[1], 1, undefined);
    expect(screen.getByRole("button", { name: /^Pass/ }).hasAttribute("data-dimmed")).toBe(true);
    fireEvent.click(fail);
    expect(onSelect).toHaveBeenLastCalledWith(null);
  });

  it("follows a controlled selectedIndex", () => {
    render(<BarChart data={DATA} title="R" selectedIndex={2} />);
    expect(screen.getByRole("button", { name: /^N\/A/ }).getAttribute("aria-pressed")).toBe("true");
  });

  it("renders horizontal bars with category labels", () => {
    const { container } = render(<BarChart data={DATA} direction="horizontal" title="H" />);
    expect(container.querySelectorAll(".raster-bar__bar--horizontal")).toHaveLength(3);
    expect(container.querySelector("svg")?.textContent).toContain("Fail");
    // Horizontal bars grow with the data by default.
    expect(container.querySelector<HTMLElement>(".raster-chart__plot")?.style.height).toBe("120px");
  });

  it("rotates crowded category labels", () => {
    const many = Array.from({ length: 40 }, (_, i) => ({ label: `Category ${i}`, value: i }));
    const { container } = render(<BarChart data={many} title="Many" />);
    expect(container.querySelector("text[transform^='rotate']")).toBeTruthy();
  });

  it("handles empty, zero and single-bar data", () => {
    render(<BarChart data={[]} title="Empty" />);
    render(<BarChart data={[{ label: "Zero", value: 0 }]} title="Zero" />);
    screen.getByRole("img", { name: "Zero: 0, 1 of 1" });
    expect(screen.getAllByRole("figure")).toHaveLength(2);
  });

  it("renders axis titles and grid variants", () => {
    const { container, rerender } = render(
      <BarChart data={DATA} title="G" xLabel="Status" yLabel="Count" grid="both" />,
    );
    expect(screen.getByText("Status")).toBeTruthy();
    expect(screen.getByText("Count")).toBeTruthy();
    expect(container.querySelectorAll(".raster-chart__grid").length).toBeGreaterThan(0);
    rerender(<BarChart data={DATA} title="G" direction="horizontal" grid="vertical" />);
    expect(container.querySelectorAll(".raster-chart__grid").length).toBeGreaterThan(0);
    rerender(<BarChart data={DATA} title="G" grid="none" />);
    expect(container.querySelectorAll(".raster-chart__grid")).toHaveLength(0);
  });

  it("shows a decorative tooltip on hover and focus", () => {
    const { container } = render(<BarChart data={DATA} title="T" />);
    const bar = screen.getByRole("img", { name: /^Pass/ });
    fireEvent.mouseEnter(bar);
    const tip = container.querySelector(".raster-tooltip")!;
    expect(tip.textContent).toBe("Pass: 42, 1 of 3");
    expect(tip.getAttribute("aria-hidden")).toBe("true");
    fireEvent.mouseLeave(bar);
    fireEvent.focus(bar);
    expect(tip.hasAttribute("data-visible")).toBe(true);
    fireEvent.blur(bar);
    expect(tip.hasAttribute("data-visible")).toBe(false);
    expect(bar.hasAttribute("aria-describedby")).toBe(false);
  });

  it("supports aspectRatio", () => {
    const { container } = render(<BarChart data={DATA} title="A" aspectRatio={3} />);
    expect(container.querySelector("svg")?.getAttribute("viewBox")).toBe("0 0 720 240");
  });
});

describe("BarChart multi-series", () => {
  for (const mode of ["stacked", "grouped"] as const) {
    it(`${mode}: series are groups of labelled bars`, () => {
      render(
        <BarChart
          data={QUARTERS}
          series={SERIES}
          values={VALUES}
          {...{ [mode]: true }}
          title="Sales"
        />,
      );
      const north = screen.getByRole("group", { name: "North, 2 points" });
      expect(
        [...north.querySelectorAll("[role=img]")].map((el) => el.getAttribute("aria-label")),
      ).toEqual(["North, Q1: 10, 1 of 2", "North, Q2: 30, 2 of 2"]);
      screen.getByRole("img", { name: "South, Q2: 1,500, 2 of 2" });
      expect(screen.getByRole("figure").textContent).toContain("Q1");
    });
  }

  it("stacked: arrows move along categories and up/down the stack", () => {
    render(<BarChart data={QUARTERS} series={SERIES} values={VALUES} stacked title="S" />);
    expect(tabStops()).toEqual(["North, Q1: 10, 1 of 2"]);
    press(screen.getByRole("img", { name: /^North, Q1/ }), "ArrowRight");
    expect(focusedName()).toBe("North, Q2: 30, 2 of 2");
    press(screen.getByRole("img", { name: /^North, Q2/ }), "ArrowUp");
    expect(focusedName()).toBe("South, Q2: 1,500, 2 of 2");
    press(screen.getByRole("img", { name: /^South, Q2/ }), "ArrowDown");
    expect(focusedName()).toBe("North, Q2: 30, 2 of 2");
    press(screen.getByRole("img", { name: /^North, Q2/ }), "Home");
    expect(focusedName()).toBe("North, Q1: 10, 1 of 2");
  });

  it("grouped: arrows move along categories and between series", () => {
    render(<BarChart data={QUARTERS} series={SERIES} values={VALUES} grouped title="G" />);
    press(screen.getByRole("img", { name: /^North, Q1/ }), "ArrowDown");
    expect(focusedName()).toBe("South, Q1: 20, 1 of 2");
    press(screen.getByRole("img", { name: /^South, Q1/ }), "End");
    expect(focusedName()).toBe("South, Q2: 1,500, 2 of 2");
  });

  for (const mode of ["stacked", "grouped"] as const) {
    it(`horizontal ${mode}: bars lie along x, Up/Down move categories, Left/Right move series`, () => {
      const { container } = render(
        <BarChart
          data={QUARTERS}
          series={SERIES}
          values={VALUES}
          direction="horizontal"
          {...{ [mode]: true }}
          title="H"
        />,
      );
      const rects = [...container.querySelectorAll<SVGRectElement>("rect.raster-bar__bar")];
      expect(rects.every((r) => r.classList.contains("raster-bar__bar--horizontal"))).toBe(true);
      const at = (name: RegExp) => screen.getByRole("img", { name });
      const n1 = at(/^North, Q1/);
      const s1 = at(/^South, Q1/);
      // Same category: stacked bars share a row and sit end to end; grouped bars share x = 0.
      if (mode === "stacked") {
        expect(s1.getAttribute("y")).toBe(n1.getAttribute("y"));
        expect(Number(s1.getAttribute("x"))).toBeCloseTo(
          Number(n1.getAttribute("x")) + Number(n1.getAttribute("width")),
        );
      } else {
        expect(s1.getAttribute("x")).toBe("0");
        expect(Number(s1.getAttribute("y"))).toBeGreaterThan(Number(n1.getAttribute("y")));
      }
      press(n1, "ArrowDown");
      expect(focusedName()).toBe("North, Q2: 30, 2 of 2");
      press(at(/^North, Q2/), "ArrowRight");
      expect(focusedName()).toBe("South, Q2: 1,500, 2 of 2");
      press(at(/^South, Q2/), "ArrowLeft");
      expect(focusedName()).toBe("North, Q2: 30, 2 of 2");
    });
  }

  it("selecting a bar selects its category and reports the series", () => {
    const onBarClick = vi.fn();
    const onSelect = vi.fn();
    render(
      <BarChart
        data={QUARTERS}
        series={SERIES}
        values={VALUES}
        grouped
        title="G"
        onBarClick={onBarClick}
        onSelect={onSelect}
      />,
    );
    const southQ2 = screen.getByRole("button", { name: /^South, Q2/ });
    press(southQ2, "Enter");
    expect(onBarClick).toHaveBeenCalledWith(QUARTERS[1], 1, 1);
    expect(onSelect).toHaveBeenCalledWith(1);
    expect(southQ2.getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("button", { name: /^North, Q2/ }).getAttribute("aria-pressed")).toBe(
      "true",
    );
  });

  it("renders a legend and a table of formatted values", () => {
    const { container } = render(
      <BarChart
        data={QUARTERS}
        series={SERIES}
        values={VALUES}
        stacked
        title="Sales"
        formatValue={(v) => `£${v}`}
      />,
    );
    expect(container.querySelectorAll(".raster-legend__swatch")).toHaveLength(2);
    const table = openTable();
    expect(screen.getByRole("table", { name: "Data for Sales" })).toBe(table);
    expect(tableText(table)).toEqual([
      ["Category", "North", "South"],
      ["Q1", "£10", "£20"],
      ["Q2", "£30", "£1500"],
    ]);
  });
});

describe("BarChart keyboard", () => {
  it("vertical bars move with Left/Right, Home/End and PageUp/PageDown", () => {
    render(<BarChart data={DATA} title="K" />);
    const bar = (n: RegExp) => screen.getByRole("img", { name: n });
    press(bar(/^Pass/), "ArrowRight");
    expect(focusedName()).toBe("Fail: 8, 2 of 3");
    press(bar(/^Fail/), "ArrowLeft");
    expect(focusedName()).toBe("Pass: 42, 1 of 3");
    press(bar(/^Pass/), "End");
    expect(focusedName()).toBe("N/A: 12, 3 of 3");
    press(bar(/^N\/A/), "PageUp");
    expect(focusedName()).toBe("Pass: 42, 1 of 3");
    press(bar(/^Pass/), "PageDown");
    expect(focusedName()).toBe("N/A: 12, 3 of 3");
  });

  it("horizontal bars move with Up/Down and ignore Left/Right", () => {
    render(<BarChart data={DATA} direction="horizontal" title="K" />);
    const pass = screen.getByRole("img", { name: /^Pass/ });
    expect(press(pass, "ArrowRight")).toBe(true);
    press(pass, "ArrowDown");
    expect(focusedName()).toBe("Fail: 8, 2 of 3");
  });

  it("Escape clears the selection inside the chart only", () => {
    const outer = vi.fn();
    render(
      <div onKeyDown={outer}>
        <BarChart data={DATA} direction="horizontal" title="K" onSelect={() => {}} />
      </div>,
    );
    const pass = screen.getByRole("button", { name: /^Pass/ });
    press(pass, " ");
    expect(pass.getAttribute("aria-pressed")).toBe("true");
    outer.mockClear();
    press(pass, "Escape");
    expect(pass.getAttribute("aria-pressed")).toBe("false");
    expect(outer).not.toHaveBeenCalled();
    expect(screen.getByRole("status").textContent).toBe("Selection cleared");
  });
});

describe("BarChart axe", () => {
  it("has no violations: simple, static, table open", async () => {
    const { container } = render(<BarChart data={DATA} title="R" />);
    openTable();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no violations: stacked, interactive", async () => {
    const { container } = render(
      <BarChart
        data={QUARTERS}
        series={SERIES}
        values={VALUES}
        stacked
        title="S"
        onBarClick={() => {}}
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
