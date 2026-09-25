import { act, render } from "@testing-library/react";
import { createRef, useImperativeHandle, useRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useChartExport, type ChartExportHandle } from "./use-chart-export.js";

function Chart({
  handle,
  empty = false,
}: {
  handle: React.Ref<ChartExportHandle>;
  empty?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const exporter = useChartExport(ref);
  useImperativeHandle(handle, () => exporter, [exporter]);
  return (
    <div ref={ref} data-chart-container>
      {!empty && (
        <svg width={100} height={50}>
          <line className="raster-chart__axis" x1={0} x2={100} style={{ stroke: "red" }} />
        </svg>
      )}
    </div>
  );
}

describe("useChartExport", () => {
  let clicked: HTMLAnchorElement[];
  let blobs: Blob[];

  beforeEach(() => {
    clicked = [];
    blobs = [];
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      clicked.push(this);
    });
    URL.createObjectURL = vi.fn((b: Blob) => {
      blobs.push(b);
      return `blob:${blobs.length}`;
    }) as typeof URL.createObjectURL;
    URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => vi.restoreAllMocks());

  it("exportSVG downloads a standalone SVG with computed styles inlined", async () => {
    const handle = createRef<ChartExportHandle>();
    render(<Chart handle={handle} />);
    act(() => handle.current!.exportSVG("my-chart.svg"));

    expect(clicked).toHaveLength(1);
    expect(clicked[0].download).toBe("my-chart.svg");
    expect(blobs[0].type).toBe("image/svg+xml");
    const svg = await blobs[0].text();
    expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
    expect(svg).toMatch(/<line[^>]*stroke="red"/);
  });

  it("exportSVG uses a default filename", () => {
    const handle = createRef<ChartExportHandle>();
    render(<Chart handle={handle} />);
    act(() => handle.current!.exportSVG());
    expect(clicked[0].download).toBe("chart.svg");
  });

  it("does nothing when the container has no SVG", async () => {
    const handle = createRef<ChartExportHandle>();
    render(<Chart handle={handle} empty />);
    act(() => handle.current!.exportSVG());
    await handle.current!.exportPNG();
    expect(clicked).toHaveLength(0);
  });

  it("exportPNG rasterises the SVG through a canvas at the given scale", async () => {
    const drawImage = vi.fn();
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
      drawImage,
    } as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation(function (cb) {
      cb(new Blob(["png"], { type: "image/png" }));
    });
    class FakeImage {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      set src(_: string) {
        queueMicrotask(() => this.onload?.());
      }
    }
    vi.stubGlobal("Image", FakeImage);

    const handle = createRef<ChartExportHandle>();
    render(<Chart handle={handle} />);
    await act(() => handle.current!.exportPNG("out.png", 3));

    expect(drawImage).toHaveBeenCalledOnce();
    expect(clicked[0].download).toBe("out.png");
    expect(blobs.at(-1)!.type).toBe("image/png");
    vi.unstubAllGlobals();
  });

  it("exportPNG rejects when the image fails to load", async () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
      drawImage: vi.fn(),
    } as unknown as CanvasRenderingContext2D);
    class BrokenImage {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      set src(_: string) {
        queueMicrotask(() => this.onerror?.());
      }
    }
    vi.stubGlobal("Image", BrokenImage);

    const handle = createRef<ChartExportHandle>();
    render(<Chart handle={handle} />);
    await expect(handle.current!.exportPNG()).rejects.toThrow("Failed to load SVG into image");
    vi.unstubAllGlobals();
  });

  it("exportPNG rejects without a 2D canvas context", async () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
    const handle = createRef<ChartExportHandle>();
    render(<Chart handle={handle} />);
    await expect(handle.current!.exportPNG()).rejects.toThrow("Canvas 2D context unavailable");
  });
});
