import { render } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { exportPNG, exportSVG } from "./export-chart.js";
import { useRootRef } from "./use-merged-ref.js";

function Chart({ target, empty = false }: { target: React.Ref<HTMLDivElement>; empty?: boolean }) {
  return (
    <div ref={target} data-chart-container>
      {!empty && (
        <svg data-raster-chart="" width={100} height={50}>
          <line className="raster-chart__axis" x1={0} x2={100} style={{ stroke: "red" }} />
        </svg>
      )}
    </div>
  );
}

describe("exportSVG and exportPNG", () => {
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
    const target = createRef<HTMLDivElement>();
    render(<Chart target={target} />);
    exportSVG(target.current, "my-chart.svg");

    expect(clicked).toHaveLength(1);
    expect(clicked[0].download).toBe("my-chart.svg");
    expect(blobs[0].type).toBe("image/svg+xml");
    const svg = await blobs[0].text();
    expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
    expect(svg).toMatch(/<line[^>]*stroke="red"/);
  });

  it("exportSVG uses a default filename", async () => {
    const target = createRef<HTMLDivElement>();
    render(<Chart target={target} />);
    exportSVG(target.current);
    expect(clicked[0].download).toBe("chart.svg");
  });

  it("does nothing when the container has no SVG", async () => {
    const target = createRef<HTMLDivElement>();
    render(<Chart target={target} empty />);
    exportSVG(target.current);
    await exportPNG(target.current);
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

    const target = createRef<HTMLDivElement>();
    render(<Chart target={target} />);
    await exportPNG(target.current, "out.png", 3);

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

    const target = createRef<HTMLDivElement>();
    render(<Chart target={target} />);
    await expect(exportPNG(target.current)).rejects.toThrow("Failed to load SVG into image");
    vi.unstubAllGlobals();
  });

  it("exportPNG rejects without a 2D canvas context", async () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
    const target = createRef<HTMLDivElement>();
    render(<Chart target={target} />);
    await expect(exportPNG(target.current)).rejects.toThrow("Canvas 2D context unavailable");
  });
});

describe("useRootRef", () => {
  function Root({ outer }: { outer: React.Ref<HTMLDivElement> }) {
    const { rootRef } = useRootRef<HTMLDivElement>(outer);
    return <div ref={rootRef} />;
  }

  it("keeps a callback ref's cleanup, and calls a plain callback with null on unmount", () => {
    const cleanup = vi.fn();
    const withCleanup = vi.fn(() => cleanup);
    const { unmount } = render(<Root outer={withCleanup} />);
    expect(withCleanup).toHaveBeenCalledWith(expect.any(HTMLDivElement));
    unmount();
    expect(cleanup).toHaveBeenCalledOnce();
    expect(withCleanup).toHaveBeenCalledTimes(1);

    const plain = vi.fn();
    const r = render(<Root outer={plain} />);
    r.unmount();
    expect(plain).toHaveBeenLastCalledWith(null);
  });

  it("sets and clears an object ref", () => {
    const ref = createRef<HTMLDivElement>();
    const { unmount } = render(<Root outer={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    unmount();
    expect(ref.current).toBeNull();
  });
});

describe("exportSVG target", () => {
  it("takes the chart's SVG itself, and prefers the marked chart SVG", async () => {
    const blobs: Blob[] = [];
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    URL.createObjectURL = vi.fn(
      (b: Blob) => (blobs.push(b), "blob:x"),
    ) as typeof URL.createObjectURL;
    URL.revokeObjectURL = vi.fn();
    const { container } = render(
      <div>
        <svg aria-hidden="true" className="decoy" />
        <svg data-raster-chart="" className="chart" />
      </div>,
    );
    exportSVG(container.firstElementChild);
    exportSVG(container.querySelector("svg.chart"));
    expect(await blobs[0].text()).toContain('class="chart"');
    expect(await blobs[1].text()).toContain('class="chart"');
    vi.restoreAllMocks();
  });
});
