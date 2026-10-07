/**
 * SVG and PNG export for raster charts. Kept out of the chart entries: import
 * it from `@eekodigital/raster/export`, and only apps that export pay for it.
 * (A chart's `exportRef` loads it on first use.)
 */

/** CSS properties to inline on SVG elements for standalone export. */
const SVG_STYLE_PROPS = [
  "fill",
  "stroke",
  "stroke-width",
  "stroke-linecap",
  "stroke-linejoin",
  "stroke-dasharray",
  "stroke-dashoffset",
  "paint-order",
  "opacity",
  "font-family",
  "font-size",
  "font-weight",
  "text-anchor",
  "dominant-baseline",
  "color",
] as const;

/**
 * Walks all elements in an SVG clone and inlines computed styles as attributes.
 * This resolves CSS custom properties (var(--raster-*)) so the SVG renders
 * correctly when opened outside the browser.
 */
function inlineComputedStyles(svgClone: SVGElement, sourceRoot: SVGElement) {
  const cloneEls = svgClone.querySelectorAll("*");
  const sourceEls = sourceRoot.querySelectorAll("*");

  // Inline styles on root
  inlineElement(svgClone, sourceRoot);

  // Inline styles on all children
  for (let i = 0; i < cloneEls.length; i++) {
    const cloneEl = cloneEls[i] as SVGElement;
    const sourceEl = sourceEls[i] as SVGElement;
    if (sourceEl) inlineElement(cloneEl, sourceEl);
  }
}

function inlineElement(cloneEl: SVGElement, sourceEl: SVGElement) {
  const computed = getComputedStyle(sourceEl);
  for (const prop of SVG_STYLE_PROPS) {
    const value = computed.getPropertyValue(prop);
    if (value && value !== "none" && value !== "normal" && value !== "0px") {
      cloneEl.setAttribute(prop, value);
    }
  }
}

/** Converts an SVG string to a PNG blob via canvas. */
function svgToPng(svgString: string, width: number, height: number, scale: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext("2d");
    if (!ctx) return reject(new Error("Canvas 2D context unavailable"));

    const img = new Image();
    const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      canvas.toBlob((pngBlob) => {
        if (pngBlob) resolve(pngBlob);
        else reject(new Error("Canvas toBlob failed"));
      }, "image/png");
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load SVG into image"));
    };
    img.src = url;
  });
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function prepareExportSvg(
  target: Element,
): { clone: SVGElement; width: number; height: number } | null {
  // The chart's SVG is marked, so overlays and other SVGs around it are left
  // out; `target` can also be that SVG itself.
  const source = (
    target.matches("svg")
      ? target
      : (target.querySelector("svg[data-raster-chart]") ?? target.querySelector("svg"))
  ) as SVGSVGElement | null;
  if (!source) return null;
  const clone = source.cloneNode(true) as SVGElement;

  // Set explicit dimensions for standalone rendering
  const { width, height } = source.getBoundingClientRect();
  clone.setAttribute("width", String(width));
  clone.setAttribute("height", String(height));
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");

  inlineComputedStyles(clone, source);
  return { clone, width, height };
}

/**
 * Downloads the chart in `target` (the chart, via its `ref`, or any element
 * containing it) as a standalone SVG, with its computed styles inlined so it
 * looks the same outside your app.
 */
export function exportSVG(target: Element | null, filename = "chart.svg"): void {
  const result = target && prepareExportSvg(target);
  if (!result) return;
  const svgString = new XMLSerializer().serializeToString(result.clone);
  downloadBlob(new Blob([svgString], { type: "image/svg+xml" }), filename);
}

/** Downloads the chart in `target` as a PNG at `scale` times its on-screen size. */
export async function exportPNG(
  target: Element | null,
  filename = "chart.png",
  scale = 2,
): Promise<void> {
  const result = target && prepareExportSvg(target);
  if (!result) return;
  const svgString = new XMLSerializer().serializeToString(result.clone);
  downloadBlob(await svgToPng(svgString, result.width, result.height, scale), filename);
}
