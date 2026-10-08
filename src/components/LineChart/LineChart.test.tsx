import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { axe } from "../../test-utils/axe.js";
import { focusedName, openTable, press, tableText, tabStops } from "../../test-utils/chart.js";
import { renderToString } from "react-dom/server";
import { timeAxis } from "../../utils/time.js";
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

  it("fires onMarkClick and makes marks buttons", () => {
    const onClick = vi.fn();
    render(
      <LineChart series={SERIES} categories={CATEGORIES} title="Click" onMarkClick={onClick} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Assessed, Week 3: 40, 3 of 5" }));
    expect(onClick).toHaveBeenCalledWith({
      index: { series: 0, point: 2 },
      value: 40,
      datum: undefined,
    });
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
    fireEvent.click(screen.getByText("Tabelle anzeigen", { selector: "summary" }));
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
    expect(document.querySelector("details")).toBeNull();
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

  it("dismisses the tooltip with Escape, including a pinned one, without leaving the chart", () => {
    const outer = vi.fn();
    const { container } = render(
      <div onKeyDown={outer}>
        <LineChart series={SERIES} categories={CATEGORIES} title="P" onSelect={() => {}} />
      </div>,
    );
    const tip = () => container.querySelector(".raster-tooltip")!.hasAttribute("data-visible");
    const m = screen.getByRole("button", { name: /Week 2/ });
    // Hover/focus tooltip (WCAG 1.4.13: dismissible without moving focus).
    fireEvent.mouseEnter(m);
    expect(tip()).toBe(true);
    press(m, "Escape");
    expect(tip()).toBe(false);
    expect(outer).not.toHaveBeenCalled();
    // Pinned by a selection: Escape clears both.
    fireEvent.focus(m);
    fireEvent.click(m);
    fireEvent.blur(m);
    expect(tip()).toBe(true);
    press(m, "Escape");
    expect(tip()).toBe(false);
    expect(m.getAttribute("aria-pressed")).toBe("false");
    // Nothing left to dismiss: Escape passes through.
    press(m, "Escape");
    expect(outer).toHaveBeenCalledTimes(1);
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

  it("closes stacked smooth areas along the series below, right to left", () => {
    const { container } = render(
      <LineChart series={MULTI} categories={MONTHS} stacked area curve="smooth" title="S" />,
    );
    // Fail (stacked on Pass, drawn first) runs out left to right, then back from the right.
    const d = container.querySelector(".raster-line__area")!.getAttribute("d")!;
    const back = /\sL ([\d.]+) /.exec(d)!;
    expect(Number(back[1])).toBe(662);
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

  describe("x-axis ticks", () => {
    const DAYS = Array.from({ length: 30 }, (_, i) => `2026-09-${String(i + 1).padStart(2, "0")}`);
    const DATA = [{ name: "Visitors", data: DAYS.map((_, i) => i * 10) }];
    const ticksOf = (root: Element) =>
      [...root.querySelectorAll("text.raster-chart__tick")]
        .filter((t) => t.getAttribute("y") !== null && !t.hasAttribute("dy"))
        .map((t) => [t.textContent, t.getAttribute("text-anchor")]);

    it("thins ticks with xTickFilter but keeps full categories in point names and the table", () => {
      const { container } = render(
        <LineChart
          series={DATA}
          categories={DAYS}
          title="Visits"
          xTickFilter={(i) => i % 7 === 0}
        />,
      );
      expect(ticksOf(container).map(([t]) => t)).toEqual([
        "2026-09-01",
        "2026-09-08",
        "2026-09-15",
        "2026-09-22",
        "2026-09-29",
      ]);
      // A point whose tick is hidden still has its x value.
      screen.getByRole("img", { name: "Visitors, 2026-09-02: 10, 2 of 30" });
      const rows = tableText(openTable());
      expect(rows[2]).toEqual(["2026-09-02", "10"]);
    });

    it("formats tick text with formatXTick, and hides ticks it returns '' for", () => {
      const { container } = render(
        <LineChart
          series={DATA}
          categories={DAYS}
          title="Visits"
          xTickFilter={() => true}
          formatXTick={(c, i) => (i % 10 === 0 ? c.slice(8) : "")}
        />,
      );
      expect(ticksOf(container).map(([t]) => t)).toEqual(["01", "11", "21"]);
      screen.getByRole("img", { name: "Visitors, 2026-09-11: 100, 11 of 30" });
    });

    it("anchors only the true first and last categories to the plot edges", () => {
      const { container } = render(
        <LineChart
          series={DATA}
          categories={DAYS}
          title="Visits"
          xTickFilter={(i) => i % 7 === 0}
        />,
      );
      // 2026-09-29 is the last *visible* tick but not the last category: it centres.
      expect(ticksOf(container)).toEqual([
        ["2026-09-01", "start"],
        ["2026-09-08", "middle"],
        ["2026-09-15", "middle"],
        ["2026-09-22", "middle"],
        ["2026-09-29", "middle"],
      ]);
    });

    it("always labels the last category when thinning automatically", () => {
      const { container } = render(
        <LineChart series={DATA} categories={DAYS} title="Visits" xLabelMinSpacing={100} />,
      );
      const ticks = ticksOf(container);
      expect(ticks[0]).toEqual(["2026-09-01", "start"]);
      expect(ticks.at(-1)).toEqual(["2026-09-30", "end"]);
      expect(ticks.slice(1, -1).every(([, a]) => a === "middle")).toBe(true);
      expect(ticks.length).toBeLessThan(10);
    });

    it("centres a lone category", () => {
      const { container } = render(
        <LineChart series={[{ name: "One", data: [3] }]} categories={["Only"]} title="One" />,
      );
      expect(ticksOf(container)).toEqual([["Only", "middle"]]);
    });
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

describe("LineChart with a time axis", () => {
  const VIEWS = [{ name: "Views", data: [10, 20, 30] }];
  const DATES = ["2026-10-01", "2026-10-02", "2026-10-04"];
  const GB = { locale: "en-GB" };
  /** x of each point, from its marker path (a circle starts 3.5 left of centre). */
  const pointXs = (root: Element) =>
    [...root.querySelectorAll(".raster-line__point")].map(
      (p) => Number(/^M([\d.-]+)/.exec(p.getAttribute("d")!)![1]) + 3.5,
    );

  it("spaces points by elapsed time, not index", () => {
    const { container } = render(
      <LineChart series={VIEWS} xAxis={timeAxis(DATES)} title="Views" labels={GB} />,
    );
    // Plot is 720 - 58 = 662 wide over 3 days.
    expect(pointXs(container).map(Math.round)).toEqual([0, 221, 662]);
  });

  it("names points, the summary and the table with formatted dates", () => {
    render(<LineChart series={VIEWS} xAxis={timeAxis(DATES)} title="Views" labels={GB} />);
    screen.getByRole("img", { name: "Views, 2 October 2026: 20, 2 of 3" });
    const figure = screen.getByRole("figure", { name: "Views" });
    expect(document.getElementById(figure.getAttribute("aria-describedby")!)?.textContent).toBe(
      "Line chart, 3 points. 1 October 2026 to 4 October 2026. Values from 10 to 30.",
    );
    expect(tableText(openTable())).toEqual([
      ["Date", "Views"],
      ["1 October 2026", "10"],
      ["2 October 2026", "20"],
      ["4 October 2026", "30"],
    ]);
  });

  it("draws calendar ticks, anchoring labels at the plot edges, with grid lines at ticks", () => {
    const { container } = render(
      <LineChart
        series={VIEWS}
        xAxis={timeAxis(DATES)}
        title="Views"
        labels={GB}
        grid="vertical"
      />,
    );
    const ticks = [...container.querySelectorAll("text.raster-chart__tick")]
      .filter((t) => !t.hasAttribute("dy"))
      .map((t) => [t.textContent, t.getAttribute("text-anchor")]);
    expect(ticks).toEqual([
      ["1 Oct", "start"],
      ["2 Oct", "middle"],
      ["3 Oct", "middle"],
      ["4 Oct", "end"],
    ]);
    expect(container.querySelectorAll("line.raster-chart__grid")).toHaveLength(4);
  });

  it("filters and formats date ticks with xTickFilter and formatXTick", () => {
    const { container } = render(
      <LineChart
        series={VIEWS}
        xAxis={timeAxis(DATES)}
        labels={GB}
        title="Views"
        xTickFilter={(i) => i % 2 === 0}
        formatXTick={(text) => text.toUpperCase()}
      />,
    );
    const ticks = [...container.querySelectorAll("text.raster-chart__tick")]
      .filter((t) => !t.hasAttribute("dy"))
      .map((t) => t.textContent);
    // Daily ticks 1–4 Oct, every other one kept, then formatted.
    expect(ticks).toEqual(["1 OCT", "3 OCT"]);
  });

  it("breaks the line and area where a point is missing at the interval", () => {
    const x = timeAxis(["2026-10-01", "2026-10-02", "2026-10-04", "2026-10-05"], {
      interval: "day",
    });
    for (const curve of ["linear", "smooth"] as const) {
      const { container, unmount } = render(
        <LineChart
          series={[
            { name: "A", data: [1, 2, 3, 4] },
            { name: "B", data: [1, 1, 1, 1] },
          ]}
          xAxis={x}
          area
          stacked
          curve={curve}
          title="Gaps"
        />,
      );
      for (const line of container.querySelectorAll(".raster-line__line"))
        expect(line.getAttribute("d")!.match(/M/g)).toHaveLength(2);
      for (const area of container.querySelectorAll(".raster-line__area"))
        expect(area.getAttribute("d")!.match(/Z/g)).toHaveLength(2);
      unmount();
    }
    // Without an interval, the same data joins up.
    const { container } = render(
      <LineChart series={VIEWS} xAxis={timeAxis(DATES)} title="Joined" />,
    );
    expect(
      container.querySelector(".raster-line__line")!.getAttribute("d")!.match(/M/g),
    ).toHaveLength(1);
  });

  it("keeps one tab stop and moves point by point across gaps", () => {
    const { container } = render(
      <LineChart
        series={VIEWS}
        xAxis={timeAxis(DATES, { interval: "day" })}
        title="Views"
        labels={GB}
      />,
    );
    expect(tabStops(container)).toEqual(["Views, 1 October 2026: 10, 1 of 3"]);
    press(screen.getByRole("img", { name: /1 of 3/ }), "ArrowRight");
    expect(focusedName()).toBe("Views, 2 October 2026: 20, 2 of 3");
    press(document.activeElement!, "ArrowRight");
    expect(focusedName()).toBe("Views, 4 October 2026: 30, 3 of 3");
    press(document.activeElement!, "Home");
    expect(focusedName()).toBe("Views, 1 October 2026: 10, 1 of 3");
  });

  it("server-renders the summary, table, names and one tab stop", () => {
    const html = renderToString(
      <LineChart
        series={VIEWS}
        xAxis={timeAxis(DATES, { interval: "day" })}
        title="Views"
        labels={GB}
      />,
    );
    expect(html).toContain("1 October 2026 to 4 October 2026. Values from 10 to 30.");
    expect(html).toContain('aria-label="Views, 4 October 2026: 30, 3 of 3"');
    expect(html).toContain('<th scope="row">2 October 2026</th>');
    expect(html.match(/tabindex="0"/g)).toHaveLength(1);
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <LineChart
        series={VIEWS}
        xAxis={timeAxis(DATES, { interval: "day" })}
        title="Views"
        onSelect={() => {}}
      />,
    );
    openTable();
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("LineChart dense mode", () => {
  const big = (n: number, name = "Views") => ({
    name,
    data: Array.from({ length: n }, (_, i) => 100 + (i % 10)),
  });
  const days = (n: number) => Array.from({ length: n }, (_, i) => `Day ${i + 1}`);
  const slider = () => screen.getByRole("slider") as HTMLInputElement;
  const valueText = () => slider().getAttribute("aria-valuetext");

  it("switches on above 200 points, or as set by `dense`", () => {
    const { unmount } = render(<LineChart series={[big(201)]} categories={days(201)} title="V" />);
    expect(slider().getAttribute("aria-label")).toBe("Views");
    expect(screen.queryAllByRole("img", { name: /Views, Day/ })).toHaveLength(0);
    unmount();
    const cases: [number, boolean | number | undefined, boolean][] = [
      [200, undefined, false],
      [300, false, false],
      [10, true, true],
      [60, 50, true],
      [40, 50, false],
    ];
    for (const [count, dense, expected] of cases) {
      const r = render(
        <LineChart series={[big(count)]} categories={days(count)} dense={dense} title="V" />,
      );
      expect(screen.queryAllByRole("slider")).toHaveLength(expected ? 1 : 0);
      r.unmount();
    }
  });

  it("is one focusable control that names the current point", () => {
    const { container } = render(
      <LineChart series={[big(300)]} categories={days(300)} title="V" />,
    );
    const plot = container.querySelector(".raster-chart__plot")!;
    expect(plot.querySelectorAll("input, [tabindex]")).toHaveLength(1);
    expect(slider().value).toBe("0");
    expect(slider().max).toBe("299");
    expect(valueText()).toBe("Views, Day 1: 100, 1 of 300");
  });

  it("moves with the keyboard: arrows, Home/End, PageUp/PageDown, and ↑/↓ between series", () => {
    render(<LineChart series={[big(300), big(250, "Visits")]} categories={days(300)} title="V" />);
    const key = (k: string) => fireEvent.keyDown(slider(), { key: k });
    slider().focus();
    key("ArrowRight");
    expect(valueText()).toBe("Views, Day 2: 101, 2 of 300");
    key("PageDown");
    expect(valueText()).toBe("Views, Day 12: 101, 12 of 300");
    key("PageUp");
    key("ArrowLeft");
    expect(valueText()).toBe("Views, Day 1: 100, 1 of 300");
    key("End");
    expect(valueText()).toBe("Views, Day 300: 109, 300 of 300");
    key("ArrowDown");
    expect(slider().getAttribute("aria-label")).toBe("Visits");
    expect(valueText()).toBe("Visits, Day 250: 109, 250 of 250");
    key("ArrowUp");
    key("Home");
    expect(valueText()).toBe("Views, Day 1: 100, 1 of 300");
  });

  it("follows value changes from assistive technology (e.g. iOS swipes)", () => {
    render(<LineChart series={[big(300)]} categories={days(300)} title="V" />);
    fireEvent.change(slider(), { target: { value: "4" } });
    expect(valueText()).toBe("Views, Day 5: 104, 5 of 300");
  });

  it("shows a marker and tooltip on focus, and hides them on blur", () => {
    const { container } = render(
      <LineChart series={[big(300)]} categories={days(300)} title="V" />,
    );
    const marker = () => container.querySelector(".raster-line__marker");
    expect(marker()).toBeNull();
    fireEvent.focus(slider());
    expect(marker()?.closest(".raster-line__overlay")?.getAttribute("aria-hidden")).toBe("true");
    expect(marker()?.hasAttribute("data-focused")).toBe(true);
    expect(container.querySelectorAll(".raster-tooltip")).toHaveLength(1);
    expect(
      container
        .querySelector(".raster-line__overlay + .raster-tooltip")
        ?.hasAttribute("data-visible"),
    ).toBe(true);
    fireEvent.blur(slider());
    expect(marker()).toBeNull();
  });

  it("selects with Enter or Space when interactive, and says so in the value", () => {
    const onSelect = vi.fn();
    const onMarkClick = vi.fn();
    const { container } = render(
      <LineChart
        series={[big(300)]}
        categories={days(300)}
        title="V"
        onSelect={onSelect}
        onMarkClick={onMarkClick}
      />,
    );
    fireEvent.keyDown(slider(), { key: "ArrowRight" });
    fireEvent.keyDown(slider(), { key: "Enter" });
    expect(onSelect).toHaveBeenCalledWith({ series: 0, point: 1 });
    expect(onMarkClick).toHaveBeenCalledWith({
      index: { series: 0, point: 1 },
      value: 101,
      datum: undefined,
    });
    expect(valueText()).toBe("Views, Day 2: 101, 2 of 300, selected");
    expect(container.querySelector(".raster-line__marker[data-selected]")).toBeTruthy();
    fireEvent.keyDown(slider(), { key: "Escape" });
    expect(valueText()).toBe("Views, Day 2: 101, 2 of 300");
    expect(screen.getByRole("status").textContent).toBe("Selection cleared");
  });

  it("ignores Enter when static", () => {
    render(<LineChart series={[big(300)]} categories={days(300)} title="V" />);
    fireEvent.keyDown(slider(), { key: "Enter" });
    expect(valueText()).toBe("Views, Day 1: 100, 1 of 300");
  });

  it("tracks the nearest point under the pointer, and selects it on click", () => {
    const onSelect = vi.fn();
    const { container } = render(
      <LineChart
        series={[big(300), { name: "Low", data: Array(300).fill(0) }]}
        categories={days(300)}
        title="V"
        onSelect={onSelect}
      />,
    );
    const hit = container.querySelector(".raster-line__hit")!;
    expect(hit.closest(".raster-line__overlay")?.getAttribute("aria-hidden")).toBe("true");
    // happy-dom rects are at 0,0: the plot starts at the 50 px left margin.
    // Point 150 of 300 sits at 150 / 299 × 662 ≈ 332 px; y near the top is the Views line.
    fireEvent.pointerMove(hit, { clientX: 50 + 332, clientY: 20 });
    expect(container.querySelector(".raster-line__marker")).toBeTruthy();
    fireEvent.click(hit, { clientX: 50 + 332, clientY: 20 });
    expect(onSelect).toHaveBeenCalledWith({ series: 0, point: 150 });
    // Near the bottom, the Low series is nearer.
    fireEvent.click(hit, { clientX: 50 + 332, clientY: 150 });
    expect(onSelect).toHaveBeenLastCalledWith({ series: 1, point: 150 });
    fireEvent.pointerLeave(hit);
    expect(container.querySelector(".raster-line__marker:not([data-selected])")).toBeNull();
  });

  it("keeps pointer and keyboard apart: hovering doesn't move the slider, blur keeps the hover", () => {
    const { container } = render(
      <LineChart series={[big(300)]} categories={days(300)} title="V" />,
    );
    const hit = container.querySelector(".raster-line__hit")!;
    fireEvent.focus(slider());
    fireEvent.pointerMove(hit, { clientX: 50 + 332, clientY: 20 });
    expect(valueText()).toBe("Views, Day 1: 100, 1 of 300");
    // The focused point and the hovered point both show.
    expect(container.querySelectorAll(".raster-line__marker")).toHaveLength(2);
    fireEvent.blur(slider());
    expect(container.querySelectorAll(".raster-line__marker")).toHaveLength(1);
  });

  it("skips an empty first series, so there's always a slider", () => {
    render(
      <LineChart
        series={[{ name: "Empty", data: [] }, big(300, "Visits")]}
        categories={days(300)}
        title="V"
      />,
    );
    expect(slider().getAttribute("aria-label")).toBe("Visits");
  });

  it("announces selection changes in the live region", () => {
    render(<LineChart series={[big(300)]} categories={days(300)} title="V" onSelect={() => {}} />);
    fireEvent.keyDown(slider(), { key: "Enter" });
    expect(screen.getByRole("status").textContent).toBe("Views, Day 1: 100, 1 of 300, selected");
    fireEvent.keyDown(slider(), { key: " " });
    expect(screen.getByRole("status").textContent).toBe("Selection cleared");
  });

  it("doesn't re-render the chart while hovering", () => {
    // A full render formats every table row; hovering should only name the hovered point.
    const format = vi.fn((v: number) => String(v));
    const { container } = render(
      <LineChart series={[big(300)]} categories={days(300)} title="V" formatValue={format} />,
    );
    const hit = container.querySelector(".raster-line__hit")!;
    format.mockClear();
    for (const clientX of [100, 200, 300, 400])
      fireEvent.pointerMove(hit, { clientX, clientY: 20 });
    expect(format.mock.calls.length).toBeLessThan(20);
  });

  it("draws straight, compact, downsampled lines with no per-point marks", () => {
    const { container } = render(
      <LineChart series={[big(5000)]} categories={days(5000)} curve="smooth" area title="V" />,
    );
    const d = container.querySelector(".raster-line__line")!.getAttribute("d")!;
    expect(d).not.toMatch(/[CL]/);
    expect(d).not.toMatch(/\.\d\d/);
    // At most four points (first, lowest, highest, last) per pixel column of the 662 px plot.
    expect(d.split(" ").length / 2).toBeLessThanOrEqual(4 * 663);
    expect(container.querySelectorAll(".raster-line__point")).toHaveLength(0);
    expect(container.querySelector(".raster-line__area")).toBeTruthy();
  });

  it("dots points a gap leaves on their own", () => {
    const dates = Array.from({ length: 300 }, (_, i) =>
      Date.UTC(2026, 0, 1 + i + (i >= 150 ? 1 : 0) + (i >= 151 ? 1 : 0)),
    );
    const { container } = render(
      <LineChart series={[big(300)]} xAxis={timeAxis(dates, { interval: "day" })} title="V" />,
    );
    expect(
      container.querySelector(".raster-line__line")!.getAttribute("d")!.match(/M/g),
    ).toHaveLength(3);
    expect(container.querySelector(".raster-line__dots")?.getAttribute("d")).toMatch(/^M/);
  });

  it("server-renders small HTML: one control, the summary and the table", () => {
    const html = renderToString(
      <LineChart series={[big(1000)]} categories={days(1000)} title="V" />,
    );
    const svg = html.slice(html.indexOf("<svg"), html.indexOf("</svg>") + 6);
    expect(svg.length).toBeLessThan(20_000);
    expect(html.match(/<input/g)).toHaveLength(1);
    expect(html).not.toMatch(/tabindex="0"/);
    expect(html).toContain('aria-valuetext="Views, Day 1: 100, 1 of 1,000"');
    expect(html).toContain("Line chart, 1,000 points.");
    expect(html.match(/<tr>/g)).toHaveLength(1001);
  });

  it("has no axe violations, static and interactive", async () => {
    // `dense` forces the same markup on a short series, keeping axe quick.
    const { container, unmount } = render(
      <LineChart series={[big(20)]} categories={days(20)} dense title="V" />,
    );
    openTable();
    expect(await axe(container)).toHaveNoViolations();
    unmount();
    const r = render(
      <LineChart series={[big(20)]} categories={days(20)} dense title="V" onSelect={() => {}} />,
    );
    fireEvent.keyDown(slider(), { key: "Enter" });
    expect(await axe(r.container)).toHaveNoViolations();
  });
});
