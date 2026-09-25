import { fireEvent, render, screen } from "@testing-library/react";
import { useRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { axe } from "../../test-utils/axe.js";
import { DEFAULT_LABELS } from "../../utils/labels.js";
import { useSelection } from "../../utils/use-selection.js";
import { ChartDataTable } from "./ChartDataTable.js";
import { ChartFrame, type ChartFrameProps } from "./ChartFrame.js";
import { ChartLegend } from "./ChartLegend.js";

const TABLE = {
  caption: "Data for Sales",
  headers: ["Month", "Total"],
  rows: [
    { key: "a", cells: ["Jan", "10"] },
    { key: "b", cells: ["Feb", "12"] },
  ],
};

describe("ChartDataTable", () => {
  it("is a collapsed disclosure by default", () => {
    render(<ChartDataTable {...TABLE} labels={DEFAULT_LABELS} />);
    const button = screen.getByRole("button", { name: "Show data table" });
    expect(button.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByRole("table")).toBeNull();
    const table = document.getElementById(button.getAttribute("aria-controls")!)!;
    expect(table.hidden).toBe(true);
  });

  it("expands to a captioned table with scoped headers", () => {
    render(<ChartDataTable {...TABLE} labels={DEFAULT_LABELS} />);
    fireEvent.click(screen.getByRole("button", { name: "Show data table" }));
    const button = screen.getByRole("button", { name: "Hide data table" });
    expect(button.getAttribute("aria-expanded")).toBe("true");
    screen.getByRole("table", { name: "Data for Sales" });
    expect(document.querySelector("caption")?.textContent).toBe("Data for Sales");
    expect(
      screen.getAllByRole("columnheader").map((th) => [th.textContent, th.getAttribute("scope")]),
    ).toEqual([
      ["Month", "col"],
      ["Total", "col"],
    ]);
    expect(
      screen.getAllByRole("rowheader").map((th) => [th.textContent, th.getAttribute("scope")]),
    ).toEqual([
      ["Jan", "row"],
      ["Feb", "row"],
    ]);
    expect(screen.getAllByRole("cell").map((td) => td.textContent)).toEqual(["10", "12"]);
    fireEvent.click(button);
    expect(screen.queryByRole("table")).toBeNull();
  });

  it("end-aligns data column headers to match their cells", () => {
    const { rerender } = render(
      <ChartDataTable {...TABLE} labels={DEFAULT_LABELS} mode="visually-hidden" />,
    );
    const cls = () => screen.getAllByRole("columnheader").map((th) => th.className);
    // The row-header column stays start-aligned; data columns (end-aligned cells) match.
    expect(cls()).toEqual(["", "raster-chart__col-end"]);
    rerender(
      <ChartDataTable
        {...TABLE}
        rowHeaders={false}
        labels={DEFAULT_LABELS}
        mode="visually-hidden"
      />,
    );
    expect(cls()).toEqual(["raster-chart__col-end", "raster-chart__col-end"]);
  });

  it("can render rows without row headers", () => {
    render(
      <ChartDataTable
        {...TABLE}
        rowHeaders={false}
        labels={DEFAULT_LABELS}
        mode="visually-hidden"
      />,
    );
    expect(screen.queryAllByRole("rowheader")).toHaveLength(0);
    expect(screen.getAllByRole("cell")).toHaveLength(4);
  });

  it("can instead be always present but visually hidden", () => {
    render(<ChartDataTable {...TABLE} labels={DEFAULT_LABELS} mode="visually-hidden" />);
    expect(screen.queryByRole("button")).toBeNull();
    const table = screen.getByRole("table", { name: "Data for Sales" });
    // Inline fallback keeps it hidden without the stylesheet.
    expect(table.style.position).toBe("absolute");
    expect(table.style.clipPath).toBe("inset(50%)");
  });

  it("describes the toggle by the chart title when given", () => {
    render(
      <>
        <span id="t">Sales</span>
        <ChartDataTable {...TABLE} labels={DEFAULT_LABELS} describedBy="t" />
      </>,
    );
    expect(screen.getByRole("button").getAttribute("aria-describedby")).toBe("t");
  });
});

describe("ChartLegend", () => {
  const items = [
    { label: "A", color: "red" },
    { label: "B", color: "blue" },
  ];

  it("renders a line swatch per item as inline SVG", () => {
    const { container } = render(<ChartLegend items={items} />);
    expect(screen.getByText("A")).toBeTruthy();
    const lines = container.querySelectorAll("svg.raster-legend__swatch line");
    expect([...lines].map((l) => l.getAttribute("stroke"))).toEqual(["red", "blue"]);
    expect(container.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
    expect(container.querySelectorAll("path")).toHaveLength(0);
  });

  it("adds the series marker shape when asked", () => {
    const { container } = render(<ChartLegend items={items} marker />);
    const markers = [...container.querySelectorAll("path.raster-legend__marker")];
    expect(markers).toHaveLength(2);
    expect(markers[0].getAttribute("d")).not.toBe(markers[1].getAttribute("d"));
    expect(markers[1].getAttribute("fill")).toBe("blue");
  });

  it("renders marker-only swatches", () => {
    const { container } = render(<ChartLegend items={items} swatch="dot" marker />);
    expect(container.querySelectorAll("line")).toHaveLength(0);
    expect(container.querySelectorAll("path.raster-legend__marker")).toHaveLength(2);
  });

  it("renders dot swatches and tags each with its series slot", () => {
    const { container } = render(<ChartLegend items={items} swatch="dot" />);
    const swatches = container.querySelectorAll("svg.raster-legend__swatch");
    expect([...swatches].map((s) => s.getAttribute("data-series"))).toEqual(["1", "2"]);
    expect(container.querySelectorAll("circle")).toHaveLength(2);
  });
});

function Frame(props: Partial<ChartFrameProps> & { onSelect?: (v: number | null) => void }) {
  const plotRef = useRef<HTMLDivElement>(null);
  const selection = useSelection<number>(undefined, props.onSelect, DEFAULT_LABELS);
  return (
    <ChartFrame
      title="Sales"
      summary="Bar chart, 2 points."
      labels={DEFAULT_LABELS}
      plotRef={plotRef}
      width={300}
      height={150}
      table={TABLE}
      selection={selection}
      {...props}
    >
      <rect
        role="button"
        aria-label="Jan: 10, 1 of 2"
        aria-pressed={selection.selected === 0}
        tabIndex={0}
        onClick={() => selection.toggle(0)}
      />
    </ChartFrame>
  );
}

describe("ChartFrame", () => {
  it("is a figure labelled by its visible title and described by a summary", () => {
    render(<Frame />);
    const figure = screen.getByRole("figure", { name: "Sales" });
    const summary = document.getElementById(figure.getAttribute("aria-describedby")!)!;
    expect(summary.textContent).toBe("Bar chart, 2 points.");
    expect(screen.getByText("Sales").className).toBe("raster-chart__title");
  });

  it("can visually hide the title", () => {
    render(<Frame hideTitle />);
    screen.getByRole("figure", { name: "Sales" });
    expect(screen.getByText("Sales").className).toContain("raster-sr-only");
  });

  it("renders the SVG as a group described as a chart, without graphics roles", () => {
    const { container } = render(<Frame />);
    const svg = container.querySelector("svg")!;
    expect(svg.getAttribute("role")).toBe("group");
    expect(svg.getAttribute("aria-roledescription")).toBe("chart");
    expect(svg.getAttribute("viewBox")).toBe("0 0 300 150");
    expect(container.innerHTML).not.toMatch(/graphics-/);
  });

  it("sizes the plot with CSS so server and client layouts match", () => {
    const { container, rerender } = render(<Frame plotStyle={{ height: 150 }} />);
    const plot = container.querySelector<HTMLElement>(".raster-chart__plot")!;
    expect(plot.style.height).toBe("150px");
    rerender(<Frame plotStyle={{ aspectRatio: "2" }} />);
    expect(plot.style.aspectRatio).toMatch(/^2/);
  });

  it("clears the selection on Escape inside the chart and announces it", () => {
    const onSelect = vi.fn();
    const outer = vi.fn();
    render(
      <div onKeyDown={outer}>
        <Frame onSelect={onSelect} />
      </div>,
    );
    const mark = screen.getByRole("button", { name: "Jan: 10, 1 of 2" });
    const status = screen.getByRole("status");
    expect(status.textContent).toBe("");
    fireEvent.click(mark);
    expect(mark.getAttribute("aria-pressed")).toBe("true");
    fireEvent.keyDown(mark, { key: "Escape" });
    expect(mark.getAttribute("aria-pressed")).toBe("false");
    expect(onSelect).toHaveBeenLastCalledWith(null);
    expect(status.textContent).toBe("Selection cleared");
    // Handled, so it doesn't also close a surrounding dialog.
    expect(outer).not.toHaveBeenCalled();
    // With nothing selected, Escape passes through.
    fireEvent.keyDown(mark, { key: "Escape" });
    expect(outer).toHaveBeenCalledTimes(1);
    // A new selection clears the stale announcement.
    fireEvent.click(mark);
    expect(status.textContent).toBe("");
  });

  it("ignores Escape pressed outside the chart", () => {
    render(<Frame />);
    const mark = screen.getByRole("button", { name: "Jan: 10, 1 of 2" });
    fireEvent.click(mark);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(mark.getAttribute("aria-pressed")).toBe("true");
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <Frame legend={<ChartLegend items={[{ label: "A", color: "red" }]} />} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Show data table" }));
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("useSelection", () => {
  function Controlled({
    value,
    onSelect,
  }: {
    value: number | null;
    onSelect: (v: number | null) => void;
  }) {
    const s = useSelection<number>(value, onSelect, DEFAULT_LABELS);
    return (
      <button type="button" onClick={() => s.toggle(1)}>
        {String(s.selected)}
      </button>
    );
  }

  it("follows the controlled value and reports changes", () => {
    const onSelect = vi.fn();
    const { rerender } = render(<Controlled value={null} onSelect={onSelect} />);
    fireEvent.click(screen.getByRole("button"));
    expect(onSelect).toHaveBeenCalledWith(1);
    expect(screen.getByRole("button").textContent).toBe("null");
    rerender(<Controlled value={1} onSelect={onSelect} />);
    fireEvent.click(screen.getByRole("button"));
    expect(onSelect).toHaveBeenLastCalledWith(null);
  });
});
