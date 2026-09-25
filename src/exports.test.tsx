import { act, render } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as geo from "./geo.js";
import * as main from "./index.js";
import * as theme from "./theme.js";
import { LineChart } from "./components/LineChart/LineChart.js";
import type { ChartExportHandle } from "./utils/use-chart-export.js";

describe("public API", () => {
  it("exports exactly these names from each entry", () => {
    expect({
      ".": Object.keys(main).sort(),
      "./geo": Object.keys(geo).sort(),
      "./theme": Object.keys(theme).sort(),
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
    const svg = await blobs[0].text();
    // useId values vary between runs; normalise them.
    expect(svg.replaceAll(/_r_\w+_/g, "_id_")).toMatchSnapshot();
  });
});
