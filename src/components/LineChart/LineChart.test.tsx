import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { axe } from "../../test-utils/axe.js";
import { focusedName, openTable, press, tableText, tabStops } from "../../test-utils/chart.js";
import { LineChart } from "./LineChart.js";

const SERIES = [{ name: "Assessed", data: [10, 25, 40, 60, 86] }];
const CATEGORIES = ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"];
const MULTI = [
  { name: "Pass", data: [5, 10, 15] },
  { name: "Fail", data: [1, 2, 3] },
];
const MONTHS = ["Jan", "Feb", "Mar"];

describe("LineChart structure", () => {
  it("is a figure named by its visible title and described by a summary", () => {
    render(<LineChart series={MULTI} categories={MONTHS} title="Results" />);
    const figure = screen.getByRole("figure", { name: "Results" });
    const summary = document.getElementById(figure.getAttribute("aria-describedby")!);
    expect(summary?.textContent).toBe(
      "Line chart, 2 series, 6 points. Jan to Mar. Values from 1 to 15.",
    );
    expect(screen.getByText("Results")).toBeTruthy();
  });

  it("renders the SVG as a chart group and each series as a group", () => {
    const { container } = render(<LineChart series={MULTI} categories={MONTHS} title="Results" />);
    const svg = container.querySelector("svg")!;
    expect(svg.getAttribute("role")).toBe("group");
    expect(svg.getAttribute("aria-roledescription")).toBe("chart");
    screen.getByRole("group", { name: "Pass, 3 points" });
    screen.getByRole("group", { name: "Fail, 3 points" });
    expect(container.innerHTML).not.toMatch(/graphics-/);
  });

  it("labels static marks as images: {series}, {x}: {y}, n of m", () => {
    render(<LineChart series={SERIES} categories={CATEGORIES} title="Progress" />);
    screen.getByRole("img", { name: "Assessed, Week 1: 10, 1 of 5" });
    screen.getByRole("img", { name: "Assessed, Week 5: 86, 5 of 5" });
    expect(screen.queryAllByRole("button", { name: /Assessed/ })).toHaveLength(0);
  });

  it("makes marks toggle buttons when selectable", () => {
    const onSelect = vi.fn();
    render(
      <LineChart series={SERIES} categories={CATEGORIES} title="Progress" onSelect={onSelect} />,
    );
    const mark = screen.getByRole("button", { name: "Assessed, Week 3: 40, 3 of 5" });
    expect(mark.getAttribute("aria-pressed")).toBe("false");
    fireEvent.click(mark);
    expect(mark.getAttribute("aria-pressed")).toBe("true");
    expect(onSelect).toHaveBeenCalledWith({ series: 0, point: 2 });
    fireEvent.click(mark);
    expect(mark.getAttribute("aria-pressed")).toBe("false");
    expect(onSelect).toHaveBeenLastCalledWith(null);
  });

  it("fires onPointClick and makes marks buttons", () => {
    const onClick = vi.fn();
    render(
      <LineChart series={SERIES} categories={CATEGORIES} title="Click" onPointClick={onClick} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Assessed, Week 3: 40, 3 of 5" }));
    expect(onClick).toHaveBeenCalledWith(0, 2, 40);
  });

  it("follows a controlled selection", () => {
    const { rerender } = render(
      <LineChart
        series={SERIES}
        categories={CATEGORIES}
        title="P"
        selectedIndex={null}
        onSelect={() => {}}
      />,
    );
    const mark = () => screen.getByRole("button", { name: /Week 2/ });
    expect(mark().getAttribute("aria-pressed")).toBe("false");
    rerender(
      <LineChart
        series={SERIES}
        categories={CATEGORIES}
        title="P"
        selectedIndex={{ series: 0, point: 1 }}
        onSelect={() => {}}
      />,
    );
    expect(mark().getAttribute("aria-pressed")).toBe("true");
    expect(mark().hasAttribute("data-selected")).toBe(true);
    expect(screen.getByRole("button", { name: /Week 1/ }).hasAttribute("data-dimmed")).toBe(true);
  });

  it("doesn't point marks at the tooltip with aria-describedby", () => {
    const { container } = render(<LineChart series={SERIES} categories={CATEGORIES} title="P" />);
    expect(container.querySelector("[aria-describedby^='chart-tooltip']")).toBeNull();
    const mark = screen.getByRole("img", { name: /Week 2/ });
    fireEvent.mouseEnter(mark);
    const tip = container.querySelector(".raster-tooltip")!;
    expect(tip.textContent).toBe("Assessed, Week 2: 25, 2 of 5");
    expect(tip.getAttribute("aria-hidden")).toBe("true");
    fireEvent.mouseLeave(mark);
  });

  it("draws a different marker shape per series", () => {
    render(<LineChart series={MULTI} categories={MONTHS} title="Results" />);
    const a = screen.getByRole("img", { name: /^Pass, Jan/ }).getAttribute("d");
    const b = screen.getByRole("img", { name: /^Fail, Jan/ }).getAttribute("d");
    expect(a).toMatch(/a/); // circle arcs
    expect(b).toMatch(/^M[^a]+Z$/); // square
  });

  it("renders a legend with marker shapes for multi-series only", () => {
    const { container, rerender } = render(
      <LineChart series={MULTI} categories={MONTHS} title="Results" />,
    );
    expect(container.querySelectorAll(".raster-legend__marker")).toHaveLength(2);
    rerender(<LineChart series={SERIES} categories={CATEGORIES} title="P" />);
    expect(container.querySelector(".raster-legend")).toBeNull();
  });

  it("formats numbers with Intl by default", () => {
    render(
      <LineChart
        series={[{ name: "Views", data: [1200, 3400] }]}
        categories={["A", "B"]}
        title="V"
      />,
    );
    screen.getByRole("img", { name: "Views, A: 1,200, 1 of 2" });
  });

  it("takes generated strings and the locale from labels", () => {
    render(
      <LineChart
        series={[{ name: "Aufrufe", data: [1200, 3400] }]}
        categories={["A", "B"]}
        title="V"
        labels={{
          locale: "de",
          chart: "Diagramm",
          showTable: "Tabelle anzeigen",
          tableCaption: (t) => `Daten für ${t}`,
          mark: ({ series, x, y, index, count }) =>
            `${series}, ${x}: ${y}, ${index + 1} von ${count}`,
        }}
      />,
    );
    screen.getByRole("img", { name: "Aufrufe, A: 1.200, 1 von 2" });
    fireEvent.click(screen.getByRole("button", { name: "Tabelle anzeigen" }));
    screen.getByRole("table", { name: "Daten für V" });
  });
});

describe("LineChart data table", () => {
  it("is a disclosure with a caption, scoped headers and formatted values", () => {
    render(
      <LineChart series={MULTI} categories={MONTHS} title="Results" formatValue={(v) => `${v}%`} />,
    );
    const table = openTable();
    expect(screen.getByRole("table", { name: "Data for Results" })).toBe(table);
    expect(tableText(table)).toEqual([
      ["Period", "Pass", "Fail"],
      ["Jan", "5%", "1%"],
      ["Feb", "10%", "2%"],
      ["Mar", "15%", "3%"],
    ]);
    expect(table.querySelector("th[scope=row]")?.textContent).toBe("Jan");
  });

  it("can be visually hidden instead", () => {
    render(
      <LineChart series={SERIES} categories={CATEGORIES} title="P" dataTable="visually-hidden" />,
    );
    expect(screen.queryByRole("button", { name: "Show data table" })).toBeNull();
    expect(screen.getByRole("table", { name: "Data for P" }).classList).toContain("raster-sr-only");
  });
});

describe("LineChart keyboard", () => {
  const mark = (name: RegExp) => screen.getByRole("img", { name });

  it("has one tab stop that follows arrow keys", () => {
    render(<LineChart series={MULTI} categories={MONTHS} title="R" />);
    expect(tabStops()).toEqual(["Pass, Jan: 5, 1 of 3"]);
    press(mark(/^Pass, Jan/), "ArrowRight");
    expect(focusedName()).toBe("Pass, Feb: 10, 2 of 3");
    expect(tabStops()).toEqual(["Pass, Feb: 10, 2 of 3"]);
    press(mark(/^Pass, Feb/), "ArrowDown");
    expect(focusedName()).toBe("Fail, Feb: 2, 2 of 3");
    press(mark(/^Fail, Feb/), "ArrowUp");
    expect(focusedName()).toBe("Pass, Feb: 10, 2 of 3");
    press(mark(/^Pass, Feb/), "End");
    expect(focusedName()).toBe("Pass, Mar: 15, 3 of 3");
    press(mark(/^Pass, Mar/), "Home");
    expect(focusedName()).toBe("Pass, Jan: 5, 1 of 3");
    press(mark(/^Pass, Jan/), "PageDown");
    expect(focusedName()).toBe("Pass, Mar: 15, 3 of 3");
    press(mark(/^Pass, Mar/), "PageUp");
    expect(focusedName()).toBe("Pass, Jan: 5, 1 of 3");
  });

  it("toggles selection with Enter and Space, and Escape clears it within the chart", () => {
    const onSelect = vi.fn();
    const outer = vi.fn();
    render(
      <div onKeyDown={outer}>
        <LineChart series={MULTI} categories={MONTHS} title="R" onSelect={onSelect} />
      </div>,
    );
    const feb = screen.getByRole("button", { name: /^Pass, Feb/ });
    press(feb, "Enter");
    expect(feb.getAttribute("aria-pressed")).toBe("true");
    press(feb, " ");
    expect(feb.getAttribute("aria-pressed")).toBe("false");
    press(feb, "Enter");
    outer.mockClear();
    press(feb, "Escape");
    expect(feb.getAttribute("aria-pressed")).toBe("false");
    expect(outer).not.toHaveBeenCalled();
    expect(screen.getByRole("status").textContent).toBe("Selection cleared");
    // Escape elsewhere on the page doesn't touch the chart.
    press(feb, "Enter");
    fireEvent.keyDown(document.body, { key: "Escape" });
    expect(feb.getAttribute("aria-pressed")).toBe("true");
  });

  it("keeps the tooltip for the selected mark on blur", () => {
    const { container } = render(
      <LineChart series={SERIES} categories={CATEGORIES} title="P" onSelect={() => {}} />,
    );
    const m = screen.getByRole("button", { name: /Week 2/ });
    fireEvent.focus(m);
    fireEvent.click(m);
    fireEvent.blur(m);
    fireEvent.mouseLeave(m);
    expect(container.querySelector(".raster-tooltip")?.hasAttribute("data-visible")).toBe(true);
  });
});

describe("LineChart sizing", () => {
  it("sizes the plot box in CSS from height", () => {
    const { container } = render(
      <LineChart series={SERIES} categories={CATEGORIES} title="P" height={180} />,
    );
    const plot = container.querySelector<HTMLElement>(".raster-chart__plot")!;
    expect(plot.style.height).toBe("180px");
    expect(container.querySelector("svg")?.getAttribute("viewBox")).toBe("0 0 720 180");
  });

  it("accepts aspectRatio instead of height", () => {
    const { container } = render(
      <LineChart series={SERIES} categories={CATEGORIES} title="P" aspectRatio={4} />,
    );
    const plot = container.querySelector<HTMLElement>(".raster-chart__plot")!;
    expect(plot.style.aspectRatio).toMatch(/^4/);
    expect(container.querySelector("svg")?.getAttribute("viewBox")).toBe("0 0 720 180");
  });
});

describe("LineChart drawing", () => {
  it("renders grid lines per the grid prop", () => {
    const { container, rerender } = render(
      <LineChart series={SERIES} categories={CATEGORIES} grid="both" title="G" />,
    );
    const count = () => container.querySelectorAll("line.raster-chart__grid").length;
    expect(count()).toBeGreaterThan(5);
    rerender(<LineChart series={SERIES} categories={CATEGORIES} grid="vertical" title="G" />);
    expect(count()).toBe(5);
    rerender(<LineChart series={SERIES} categories={CATEGORIES} grid="none" title="G" />);
    expect(count()).toBe(0);
  });

  it("renders an area path under the line", () => {
    const { container } = render(
      <LineChart series={SERIES} categories={CATEGORIES} area title="A" />,
    );
    expect(container.querySelectorAll(".raster-line__area")).toHaveLength(1);
  });

  it('renders a smooth curve when curve="smooth"', () => {
    const { container } = render(
      <LineChart series={SERIES} categories={CATEGORIES} curve="smooth" area title="S" />,
    );
    expect(container.querySelector(".raster-line__line")?.getAttribute("d")).toContain("C");
  });

  it("stacks areas, linear and smooth", () => {
    for (const curve of ["linear", "smooth"] as const) {
      const { container, unmount } = render(
        <LineChart series={MULTI} categories={MONTHS} stacked area curve={curve} title="S" />,
      );
      expect(container.querySelectorAll(".raster-line__area")).toHaveLength(2);
      // Stacked marks keep the original (unstacked) values in their labels.
      screen.getByRole("img", { name: "Fail, Mar: 3, 3 of 3" });
      unmount();
    }
  });

  it("renders axis titles", () => {
    render(
      <LineChart series={SERIES} categories={CATEGORIES} title="P" xLabel="Week" yLabel="Count" />,
    );
    expect(screen.getByText("Week")).toBeTruthy();
    expect(screen.getByText("Count")).toBeTruthy();
  });

  it("anchors the first and last visible labels so they don't extend past the plot", () => {
    const { container } = render(<LineChart series={SERIES} categories={CATEGORIES} title="E" />);
    const texts = Array.from(container.querySelectorAll("svg text"));
    expect(texts.find((t) => t.textContent === "Week 1")?.getAttribute("text-anchor")).toBe(
      "start",
    );
    expect(texts.find((t) => t.textContent === "Week 5")?.getAttribute("text-anchor")).toBe("end");
  });

  it("omits empty-string categories from the axis so consumers can decimate", () => {
    const data = Array.from({ length: 10 }, (_, i) => i);
    const decimated = data.map((_, i) => (i % 5 === 0 ? `D${i}` : ""));
    const { container } = render(
      <LineChart series={[{ name: "Series", data }]} categories={decimated} title="Sparse" />,
    );
    const texts = Array.from(container.querySelectorAll("svg text")).map((el) => el.textContent);
    expect(texts).toContain("D0");
    expect(texts).toContain("D5");
    expect(texts.some((t) => /^D[1-46-9]$/.test(t ?? ""))).toBe(false);
  });

  it("handles a single point and no data", () => {
    const { container } = render(
      <LineChart series={[{ name: "One", data: [3] }]} categories={["Only"]} title="One" />,
    );
    screen.getByRole("img", { name: "One, Only: 3, 1 of 1" });
    const { container: empty } = render(<LineChart series={[]} categories={[]} title="Empty" />);
    expect(empty.querySelector("svg")).toBeTruthy();
    expect(container).toBeTruthy();
  });
});

describe("LineChart axe", () => {
  it("has no violations when static", async () => {
    const { container } = render(<LineChart series={MULTI} categories={MONTHS} title="R" />);
    openTable();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no violations when interactive and selected", async () => {
    const { container } = render(
      <LineChart series={MULTI} categories={MONTHS} title="R" onSelect={() => {}} />,
    );
    fireEvent.click(screen.getByRole("button", { name: /^Pass, Feb/ }));
    expect(await axe(container)).toHaveNoViolations();
  });
});
