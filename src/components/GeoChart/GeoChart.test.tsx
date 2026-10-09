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

describe("GeoChart fit", () => {
  /** Every x, y in the regions' paths and the markers. */
  const coords = (root: Element) => {
    const nums = [...root.querySelectorAll(".raster-geo__region")].flatMap((p) =>
      (p.getAttribute("d")!.match(/-?[\d.]+(e-?\d+)?/g) ?? []).map(Number),
    );
    const xs = nums.filter((_, i) => i % 2 === 0);
    const ys = nums.filter((_, i) => i % 2 === 1);
    return { xs, ys };
  };

  it("keeps the map inside the plot, centred, in both directions", () => {
    // 16:9 at 720 px: 720 × 405. Antarctica reaches the pole, where Mercator
    // is infinite; it's clamped like a web map.
    const world = {
      ...TOPOLOGY,
      objects: {
        countries: {
          ...TOPOLOGY.objects.countries,
          geometries: [
            ...TOPOLOGY.objects.countries.geometries,
            {
              type: "Polygon" as const,
              id: "ATA",
              properties: { name: "Antarctica" },
              arcs: [[4]],
            },
          ],
        },
      },
      arcs: [...TOPOLOGY.arcs, square(-180, -90, 180, -60)],
    };
    for (const projection of ["mercator", "equirectangular"] as const) {
      const { container, unmount } = render(
        <GeoChart topology={world} projection={projection} title="W" />,
      );
      const { xs, ys } = coords(container);
      expect(xs.every((x) => x >= -0.01 && x <= 720.01)).toBe(true);
      expect(ys.every((y) => Number.isFinite(y) && y >= -0.01 && y <= 405.01)).toBe(true);
      // It fills the width or the height (Mercator's clamped world is
      // taller than 16:9, equirectangular's wider), centred both ways.
      const [w, h] = [Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)];
      // Inset 1 px for the outline.
      expect(Math.abs(w - 718) < 0.5 || Math.abs(h - 403) < 0.5).toBe(true);
      expect(Math.min(...xs) + Math.max(...xs)).toBeCloseTo(720, 0);
      expect(Math.min(...ys) + Math.max(...ys)).toBeCloseTo(405, 0);
      unmount();
    }
  });

  it("zooms to the regions it draws", () => {
    const { container } = render(<GeoChart topology={TOPOLOGY} filter={["GBR"]} title="F" />);
    const { xs, ys } = coords(container);
    // The UK alone fills the plot's height (it's taller than 16:9), inset 1 px.
    expect(Math.max(...ys) - Math.min(...ys)).toBeCloseTo(403, 0);
    expect(Math.max(...xs) - Math.min(...xs)).toBeLessThan(720);
  });

  it("keeps edge markers inside the plot", () => {
    const { container } = render(
      <GeoChart topology={TOPOLOGY} filter={[]} markers={MARKERS} title="M" />,
    );
    for (const c of container.querySelectorAll("circle")) {
      const [x, y, r] = ["cx", "cy", "r"].map((a) => Number(c.getAttribute(a)));
      expect(x - r).toBeGreaterThanOrEqual(0);
      expect(x + r).toBeLessThanOrEqual(720);
      expect(y - r).toBeGreaterThanOrEqual(0);
      expect(y + r).toBeLessThanOrEqual(405);
    }
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
    const onMarkClick = vi.fn();
    const onSelect = vi.fn();
    render(
      <GeoChart
        topology={TOPOLOGY}
        data={DATA}
        markers={MARKERS}
        title="M"
        onMarkClick={onMarkClick}
        onSelect={onSelect}
      />,
    );
    const fiji = screen.getByRole("button", { name: /^Fiji/ });
    fireEvent.click(fiji);
    expect(onMarkClick).toHaveBeenCalledWith({
      index: { region: "FJI" },
      value: undefined,
      datum: undefined,
    });
    expect(onSelect).toHaveBeenCalledWith({ region: "FJI" });
    expect(fiji.getAttribute("aria-pressed")).toBe("true");
    const paris = screen.getByRole("button", { name: /Paris/ });
    press(paris, "Enter");
    expect(onMarkClick).toHaveBeenLastCalledWith({
      index: { marker: 1 },
      value: MARKERS[1].value,
      datum: MARKERS[1],
    });
    expect(onSelect).toHaveBeenLastCalledWith({ marker: 1 });
    expect(fiji.getAttribute("aria-pressed")).toBe("false");
    press(paris, "Escape");
    expect(paris.getAttribute("aria-pressed")).toBe("false");
    expect(screen.getByRole("status").textContent).toBe("Selection cleared");
  });

  it("onMarkClick makes regions and markers buttons", () => {
    render(<GeoChart topology={TOPOLOGY} markers={MARKERS} title="M" onMarkClick={() => {}} />);
    screen.getByRole("button", { name: /London/ });
    expect(screen.queryAllByRole("img")).toHaveLength(0);
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
        onMarkClick={() => {}}
      />,
    );
    openTable();
    expect(await axe(container)).toHaveNoViolations();
  });
});
