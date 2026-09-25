import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { axe } from "../../test-utils/axe.js";
import { focusedName, openTable, press, tableText, tabStops } from "../../test-utils/chart.js";
import { GeoChart } from "./GeoChart.js";

const square = (x0: number, y0: number, x1: number, y1: number) => [
  [x0, y0],
  [x1, y0],
  [x1, y1],
  [x0, y1],
  [x0, y0],
];

const TOPOLOGY = {
  type: "Topology" as const,
  objects: {
    countries: {
      type: "GeometryCollection" as const,
      geometries: [
        {
          type: "Polygon" as const,
          id: "GBR",
          properties: { name: "United Kingdom" },
          arcs: [[0]],
        },
        { type: "Polygon" as const, id: "FRA", properties: { name: "France" }, arcs: [[1]] },
        {
          type: "MultiPolygon" as const,
          id: "FJI",
          properties: { name: "Fiji" },
          arcs: [[[2]], [[3]]],
        },
      ],
    },
  },
  arcs: [
    square(-5, 50, 2, 58),
    square(-5, 42, 8, 51),
    // Crosses the antimeridian.
    [
      [177, -18],
      [-179, -18],
      [-179, -16],
      [177, -16],
      [177, -18],
    ],
    square(178, -20, 179, -19),
  ],
};

const DATA = [
  { id: "GBR", value: 92, label: "UK" },
  { id: "FRA", value: 1500 },
];
const MARKERS = [
  { lat: 51.5, lon: -0.1, label: "London" },
  { lat: 48.9, lon: 2.35, label: "Paris", value: 2100 },
];

describe("GeoChart structure", () => {
  it("is a figure with a title, summary and chart group", () => {
    const { container } = render(<GeoChart topology={TOPOLOGY} data={DATA} title="Scores" />);
    const figure = screen.getByRole("figure", { name: "Scores" });
    expect(document.getElementById(figure.getAttribute("aria-describedby")!)?.textContent).toBe(
      "Map, 3 points. Values from 92 to 1,500.",
    );
    expect(container.querySelector("svg")?.getAttribute("aria-roledescription")).toBe("chart");
  });

  it("labels every region, including those without data", () => {
    render(<GeoChart topology={TOPOLOGY} data={DATA} title="Scores" />);
    const regions = screen.getByRole("group", { name: "Regions, 3 points" });
    expect(
      [...regions.querySelectorAll("[role=img]")].map((el) => el.getAttribute("aria-label")),
    ).toEqual(["UK: 92, 1 of 3", "France: 1,500, 2 of 3", "Fiji: No data, 3 of 3"]);
  });

  it("labels markers as their own group", () => {
    render(<GeoChart topology={TOPOLOGY} markers={MARKERS} title="Cities" />);
    screen.getByRole("group", { name: "Markers, 2 points" });
    screen.getByRole("img", { name: "Markers, London, 1 of 2" });
    screen.getByRole("img", { name: "Markers, Paris: 2,100, 2 of 2" });
  });

  it("lists regions without data and markers in the data table", () => {
    render(
      <GeoChart
        topology={TOPOLOGY}
        data={DATA}
        markers={MARKERS}
        title="Scores"
        formatValue={(v) => `${v} pts`}
      />,
    );
    const table = openTable();
    expect(screen.getByRole("table", { name: "Data for Scores" })).toBe(table);
    expect(tableText(table)).toEqual([
      ["Name", "Type", "Value"],
      ["UK", "Region", "92 pts"],
      ["France", "Region", "1500 pts"],
      ["Fiji", "Region", "No data"],
      ["London", "Marker", ""],
      ["Paris", "Marker", "2100 pts"],
    ]);
  });

  it("renders a colour-scale legend with formatted ends", () => {
    const { container } = render(
      <GeoChart topology={TOPOLOGY} data={DATA} title="S" legendLabel="Score" />,
    );
    const legend = container.querySelector(".raster-geo__legend")!;
    expect(legend.textContent).toBe("Score921,500");
  });

  it("filters regions and supports other projections", () => {
    const { container, rerender } = render(
      <GeoChart topology={TOPOLOGY} filter={["GBR"]} title="F" />,
    );
    expect(container.querySelectorAll(".raster-geo__region")).toHaveLength(1);
    rerender(<GeoChart topology={TOPOLOGY} projection="equirectangular" title="F" />);
    expect(container.querySelectorAll(".raster-geo__region")).toHaveLength(3);
    const custom = vi.fn((lon: number, lat: number): [number, number] => [lon / 360, lat / 180]);
    rerender(<GeoChart topology={TOPOLOGY} projection={custom} title="F" />);
    expect(custom).toHaveBeenCalled();
  });

  it("fills its container: height from aspectRatio (16:9 by default) or height", () => {
    const { container, rerender } = render(<GeoChart topology={TOPOLOGY} title="M" />);
    const plot = container.querySelector<HTMLElement>(".raster-chart__plot")!;
    expect(plot.style.aspectRatio).toMatch(/^1\.77/);
    expect(container.querySelector("svg")?.getAttribute("viewBox")).toBe("0 0 720 405");
    rerender(<GeoChart topology={TOPOLOGY} title="M" height={300} />);
    expect(plot.style.height).toBe("300px");
  });
});

describe("GeoChart keyboard and selection", () => {
  it("moves across regions with arrows and down to markers", () => {
    render(<GeoChart topology={TOPOLOGY} data={DATA} markers={MARKERS} title="M" />);
    expect(tabStops()).toEqual(["UK: 92, 1 of 3"]);
    press(screen.getByRole("img", { name: /^UK/ }), "ArrowRight");
    expect(focusedName()).toBe("France: 1,500, 2 of 3");
    expect(tabStops()).toEqual(["France: 1,500, 2 of 3"]);
    press(screen.getByRole("img", { name: /^France/ }), "End");
    expect(focusedName()).toBe("Fiji: No data, 3 of 3");
    press(screen.getByRole("img", { name: /^Fiji/ }), "ArrowDown");
    expect(focusedName()).toBe("Markers, Paris: 2,100, 2 of 2");
    press(screen.getByRole("img", { name: /Paris/ }), "ArrowLeft");
    expect(focusedName()).toBe("Markers, London, 1 of 2");
    press(screen.getByRole("img", { name: /London/ }), "ArrowUp");
    expect(focusedName()).toBe("UK: 92, 1 of 3");
  });

  it("regions and markers become toggle buttons when clickable", () => {
    const onRegionClick = vi.fn();
    const onMarkerClick = vi.fn();
    const onSelect = vi.fn();
    render(
      <GeoChart
        topology={TOPOLOGY}
        data={DATA}
        markers={MARKERS}
        title="M"
        onRegionClick={onRegionClick}
        onMarkerClick={onMarkerClick}
        onSelect={onSelect}
      />,
    );
    const fiji = screen.getByRole("button", { name: /^Fiji/ });
    fireEvent.click(fiji);
    expect(onRegionClick).toHaveBeenCalledWith(undefined, "FJI");
    expect(onSelect).toHaveBeenCalledWith({ region: "FJI" });
    expect(fiji.getAttribute("aria-pressed")).toBe("true");
    const paris = screen.getByRole("button", { name: /Paris/ });
    press(paris, "Enter");
    expect(onMarkerClick).toHaveBeenCalledWith(MARKERS[1], 1);
    expect(onSelect).toHaveBeenLastCalledWith({ marker: 1 });
    expect(fiji.getAttribute("aria-pressed")).toBe("false");
    press(paris, "Escape");
    expect(paris.getAttribute("aria-pressed")).toBe("false");
    expect(screen.getByRole("status").textContent).toBe("Selection cleared");
  });

  it("only regions are buttons when only regions are clickable", () => {
    render(<GeoChart topology={TOPOLOGY} markers={MARKERS} title="M" onRegionClick={() => {}} />);
    expect(screen.getAllByRole("button", { pressed: false }).length).toBe(3);
    screen.getByRole("img", { name: /London/ });
  });
});

describe("GeoChart axe", () => {
  it("has no violations", async () => {
    const { container } = render(
      <GeoChart
        topology={TOPOLOGY}
        data={DATA}
        markers={MARKERS}
        title="M"
        onRegionClick={() => {}}
      />,
    );
    openTable();
    expect(await axe(container)).toHaveNoViolations();
  });
});
