import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ChartDataTable } from "./ChartDataTable.js";
import { ChartLegend } from "./ChartLegend.js";

describe("ChartDataTable", () => {
  it("renders headers and rows in a labelled, visually hidden table", () => {
    render(
      <ChartDataTable
        aria-label="Sales"
        headers={["Month", "Total"]}
        rows={[
          { key: "a", cells: ["Jan", 10] },
          { key: "b", cells: ["Feb", 12] },
        ]}
      />,
    );
    const table = screen.getByRole("table", { name: "Sales" });
    expect(screen.getAllByRole("columnheader").map((th) => th.textContent)).toEqual([
      "Month",
      "Total",
    ]);
    expect(screen.getAllByRole("row")).toHaveLength(3);
    // Inline fallback keeps it hidden without the stylesheet.
    expect(table.style.position).toBe("absolute");
    expect(table.style.clipPath).toBe("inset(50%)");
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
  });

  it("renders dot swatches and tags each with its series slot", () => {
    const { container } = render(<ChartLegend items={items} swatch="dot" />);
    const swatches = container.querySelectorAll("svg.raster-legend__swatch");
    expect([...swatches].map((s) => s.getAttribute("data-series"))).toEqual(["1", "2"]);
    expect(container.querySelectorAll("circle")).toHaveLength(2);
  });
});
