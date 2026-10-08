import { act, render, waitFor } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as geo from "./geo.js";
import * as main from "./index.js";
import * as exporter from "./export.js";
import * as frame from "./frame.js";
import * as labelsEntry from "./labels.js";
import * as theme from "./theme.js";
import * as time from "./time.js";
import { Gauge } from "./components/Gauge/Gauge.js";
import { LineChart } from "./components/LineChart/LineChart.js";
import { Sparkline } from "./components/Sparkline/Sparkline.js";
import { exportSVG } from "./export.js";
import type { ChartExportHandle } from "./utils/use-chart-export.js";

describe("public API", () => {
  it("exports exactly these names from each entry", () => {
    expect({
      ".": Object.keys(main).sort(),
      "./geo": Object.keys(geo).sort(),
      "./export": Object.keys(exporter).sort(),
      "./frame": Object.keys(frame).sort(),
      "./labels": Object.keys(labelsEntry).sort(),
      "./theme": Object.keys(theme).sort(),
      "./time": Object.keys(time).sort(),
    }).toMatchSnapshot();
  });
});

describe("SVG export", () => {
  let blobs: Blob[];

  beforeEach(() => {
    blobs = [];
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    URL.createObjectURL = vi.fn((b: Blob) => {
      blobs.push(b);
      return "blob:x";
    });
    URL.revokeObjectURL = vi.fn();
  });
  afterEach(() => vi.restoreAllMocks());

  it("serialises the chart SVG (structure, marks and accessible names)", async () => {
    const ref = createRef<ChartExportHandle>();
    render(
      <LineChart
        series={[
          { name: "Pass", data: [1, 3] },
          { name: "Fail", data: [2, 1] },
        ]}
        categories={["Jan", "Feb"]}
        title="Results"
        height={120}
        exportRef={ref}
      />,
    );
    act(() => ref.current!.exportSVG());
    await waitFor(() => expect(blobs).toHaveLength(1));
    const svg = await blobs[0].text();
    // useId values vary between runs; normalise them.
    expect(svg.replaceAll(/_r_\w+_/g, "_id_")).toMatchSnapshot();
  });
});

describe("@eekodigital/raster/export with a chart ref", () => {
  let blobs: Blob[];

  beforeEach(() => {
    blobs = [];
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    URL.createObjectURL = vi.fn((b: Blob) => {
      blobs.push(b);
      return "blob:x";
    });
    URL.revokeObjectURL = vi.fn();
  });
  afterEach(() => vi.restoreAllMocks());

  it("exports the chart a ref points at", async () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <LineChart
        ref={ref}
        series={[{ name: "A", data: [1, 2] }]}
        categories={["x", "y"]}
        title="T"
      />,
    );
    expect(ref.current?.getAttribute("role")).toBe("figure");
    exportSVG(ref.current, "t.svg");
    expect(await blobs[0].text()).toMatch(/^<svg[^>]*aria-roledescription="chart"/);
  });

  it("leaves a dense chart's overlay out of the file", async () => {
    const ref = createRef<HTMLDivElement>();
    const data = Array.from({ length: 300 }, (_, i) => i);
    render(
      <LineChart
        ref={ref}
        series={[{ name: "A", data }]}
        categories={data.map(String)}
        title="T"
      />,
    );
    exportSVG(ref.current);
    const svg = await blobs[0].text();
    expect(svg).toContain("raster-line__line");
    expect(svg).not.toContain("raster-line__overlay");
  });

  it("takes refs on Gauge and Sparkline, and ignores a null target", async () => {
    const gauge = createRef<HTMLDivElement>();
    const spark = createRef<HTMLSpanElement>();
    render(
      <>
        <Gauge ref={gauge} value={3} max={10} label="Score" />
        <Sparkline ref={spark} data={[1, 2, 3]} title="Trend" />
      </>,
    );
    exportSVG(gauge.current);
    exportSVG(spark.current);
    exportSVG(null);
    expect(blobs).toHaveLength(2);
  });
});
