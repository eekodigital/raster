import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { axe } from "./test-utils/axe.js";
import { openTable, tableText } from "./test-utils/chart.js";
import { exportSVG } from "./export.js";
import { ChartDataTable, ChartFrame, describeChart } from "./frame.js";

const TABLE = {
  headers: ["Date", "Views"],
  rows: [
    { key: 1, cells: ["1 Oct", "40"] },
    { key: 2, cells: ["2 Oct", "52"] },
  ],
};

// Stands in for a third-party chart: its own SVG, hidden because the figure carries the text.
const Other = () => (
  <svg aria-hidden="true" className="other-chart" viewBox="0 0 10 10">
    <path d="M0 10 L10 0" />
  </svg>
);

describe("ChartFrame (public)", () => {
  it("names and describes a figure around any chart, with a data table", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <ChartFrame ref={ref} title="Views" summary="Line chart, 2 points." table={TABLE}>
        <Other />
      </ChartFrame>,
    );
    const figure = screen.getByRole("figure", { name: "Views" });
    expect(ref.current).toBe(figure);
    expect(document.getElementById(figure.getAttribute("aria-describedby")!)?.textContent).toBe(
      "Line chart, 2 points.",
    );
    expect(figure.querySelector(".raster-chart__plot > svg.other-chart")).toBeTruthy();
    // No raster SVG, no live region: just the figure around the child.
    expect(figure.querySelector("[data-raster-chart], [role=status]")).toBeNull();
    const table = openTable();
    expect(table.querySelector("caption")?.textContent).toBe("Data for Views");
    expect(tableText(table)).toEqual([
      ["Date", "Views"],
      ["1 Oct", "40"],
      ["2 Oct", "52"],
    ]);
  });

  it("server-renders everything before JavaScript", () => {
    const html = renderToString(
      <ChartFrame title="Views" summary="Line chart, 2 points." table={TABLE} legend={<p>Key</p>}>
        <Other />
      </ChartFrame>,
    );
    expect(html).toContain('role="figure"');
    expect(html).toContain("Line chart, 2 points.");
    expect(html).toContain('class="other-chart"');
    expect(html).toContain("<p>Key</p>");
    expect(html).toContain("Show data table");
    expect(html).toContain("<td>52</td>");
  });

  it("takes labels, a custom caption, hideTitle and a visually hidden table", () => {
    render(
      <ChartFrame
        title="Aufrufe"
        hideTitle
        summary="Liniendiagramm."
        labels={{ showTable: "Tabelle zeigen", tableCaption: (t) => `Daten: ${t}` }}
        table={{ ...TABLE, caption: "Tägliche Aufrufe" }}
      >
        <Other />
      </ChartFrame>,
    );
    fireEvent.click(screen.getByText("Tabelle zeigen", { selector: "summary" }));
    expect(screen.getByRole("table").querySelector("caption")?.textContent).toBe(
      "Tägliche Aufrufe",
    );
    expect(screen.getByText("Aufrufe").className).toContain("raster-sr-only");

    const { container } = render(
      <ChartFrame title="V" summary="S" table={TABLE} dataTable="visually-hidden">
        <Other />
      </ChartFrame>,
    );
    expect(container.querySelector("table.raster-sr-only")).toBeTruthy();
  });

  it("works without a table", () => {
    const { container } = render(
      <ChartFrame title="V" summary="S">
        <Other />
      </ChartFrame>,
    );
    expect(container.querySelector("table, details")).toBeNull();
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <ChartFrame title="Views" summary="Line chart, 2 points." table={TABLE}>
        <Other />
      </ChartFrame>,
    );
    openTable();
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("ChartDataTable (public)", () => {
  it("renders a disclosure table on its own, with partial labels", () => {
    render(<ChartDataTable caption="Views" {...TABLE} labels={{ showTable: "Show the data" }} />);
    fireEvent.click(screen.getByText("Show the data", { selector: "summary" }));
    expect(screen.getByRole("table").querySelector("caption")?.textContent).toBe("Views");
  });

  it("describes its toggle by the caption, so several on a page are distinguishable", () => {
    render(
      <>
        <ChartDataTable caption="Views" {...TABLE} />
        <ChartDataTable caption="Visitors" {...TABLE} />
      </>,
    );
    const [a, b] = screen.getAllByText("Show data table", { selector: "summary" });
    expect(document.getElementById(a.getAttribute("aria-describedby")!)?.textContent).toBe("Views");
    expect(document.getElementById(b.getAttribute("aria-describedby")!)?.textContent).toBe(
      "Visitors",
    );
  });
});

describe("describeChart", () => {
  it("writes raster's summary from counts and ranges", () => {
    expect(
      describeChart({
        type: "line",
        series: 2,
        points: 730,
        x: ["1 Jan", "31 Dec"],
        y: ["3", "412"],
      }),
    ).toBe("Line chart, 2 series, 730 points. 1 Jan to 31 Dec. Values from 3 to 412.");
  });

  it("formats counts in the locale, and takes a name for other chart types", () => {
    expect(
      describeChart(
        { type: "scatter", name: "Heatmap", series: 1, points: 1200 },
        { locale: "de" },
      ),
    ).toBe("Heatmap, 1.200 points.");
  });
});

describe("exporting a wrapped chart", () => {
  it("exports nothing: export is for raster's own charts, not the first SVG it finds", () => {
    const create = vi.fn(() => "blob:x");
    URL.createObjectURL = create as typeof URL.createObjectURL;
    const ref = createRef<HTMLDivElement>();
    render(
      <ChartFrame ref={ref} title="V" summary="S" legend={<svg className="swatch" />}>
        <Other />
      </ChartFrame>,
    );
    exportSVG(ref.current);
    expect(create).not.toHaveBeenCalled();
  });
});

describe("describeChart without a raster type", () => {
  it("names any chart by `name` alone", () => {
    expect(describeChart({ name: "Heatmap", series: 1, points: 3 })).toBe("Heatmap, 3 points.");
  });
});
