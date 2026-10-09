import type { ChartLabels } from "../../utils/labels.js";

/**
 * A target, threshold or goal drawn across the plot: across the value (y)
 * axis by default, or with `axis: "x"`, vertically on a continuous x axis
 * (ScatterChart, or LineChart with `timeAxis`, where it can be a `Date` or
 * ISO string).
 */
export type ReferenceLine =
  | { value: number; label: string; axis?: "y" }
  | { value: number | Date | string; label: string; axis: "x" };

/** A reference line on numeric axes (BarChart: y only; ScatterChart: x or y). */
export type NumericReferenceLine = { value: number; label: string; axis?: "x" | "y" };

/** A line placed on the plot: its position in px and its text ("Target: 90"). */
export type PlacedReference = { at: number; text: string; vertical: boolean };

/** Finite values of the lines on `axis`, for stretching that axis's scale. */
export function referenceValues(
  lines: { value: unknown; axis?: "x" | "y" }[],
  axis: "x" | "y",
): number[] {
  return lines
    .filter((r) => (r.axis ?? "y") === axis && typeof r.value === "number")
    .map((r) => r.value as number)
    .filter(Number.isFinite);
}

/**
 * Places each line with `place` (its px position and formatted value, or
 * null), leaving out any that can't be placed or fall off the plot.
 */
export function placeReferences<R extends { label: string; axis?: "x" | "y" }>(
  lines: R[],
  place: (line: R) => [at: number, value: string] | null,
  plotWidth: number,
  plotHeight: number,
  labels: ChartLabels,
): PlacedReference[] {
  return lines.flatMap((r) => {
    const placed = place(r);
    const vertical = r.axis === "x";
    if (!placed) return [];
    const [at, value] = placed;
    return at >= 0 && at <= (vertical ? plotWidth : plotHeight)
      ? [{ at, vertical, text: labels.referenceLine(r.label, value) }]
      : [];
  });
}

/** The table caption, with a note of the chart's reference lines. */
export function referenceCaption(caption: string, texts: string[], labels: ChartLabels) {
  return texts.length ? labels.referenceNote(caption, texts) : caption;
}

/** Estimated label width: 7 px a character of the 0.75rem label font. */
const width = (text: string) => text.length * 7;

/** A rectangle in plot px: [x0, y0, x1, y1]. */
export type Box = [x0: number, y0: number, x1: number, y1: number];

/** What labels keep clear of: lines through points (runs) and boxes (bars, markers). */
export type ReferenceAvoid = { runs?: { x: number; y: number }[][]; boxes?: Box[] };

const overlaps = (a: Box, b: Box) => a[0] < b[2] && b[0] < a[2] && a[1] < b[3] && b[1] < a[3];

/** Whether the segment from `a` to `b` passes through `box` (Liang–Barsky clipping). */
function crosses(box: Box, a: { x: number; y: number }, b: { x: number; y: number }) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  let t0 = 0;
  let t1 = 1;
  for (const [p, q] of [
    [-dx, a.x - box[0]],
    [dx, box[2] - a.x],
    [-dy, a.y - box[1]],
    [dy, box[3] - a.y],
  ]) {
    if (p === 0) {
      if (q < 0) return false;
    } else if (p < 0) {
      t0 = Math.max(t0, q / p);
    } else {
      t1 = Math.min(t1, q / p);
    }
    if (t0 > t1) return false;
  }
  return true;
}

/** How much data a label at `box` would cover: px² of boxes, plus 100 a line segment. */
function covered(box: Box, { runs = [], boxes = [] }: ReferenceAvoid) {
  // A little room around marks (point markers are about 3 px in radius).
  const pad: Box = [box[0] - 3, box[1] - 3, box[2] + 3, box[3] + 3];
  const area = (b: Box) =>
    overlaps(pad, b)
      ? (Math.min(pad[2], b[2]) - Math.max(pad[0], b[0])) *
        (Math.min(pad[3], b[3]) - Math.max(pad[1], b[1]))
      : 0;
  let sum = boxes.reduce((n, b) => n + area(b), 0);
  for (const run of runs) {
    run.forEach((p, i) => {
      if (!Number.isFinite(p.y)) return;
      // A segment from the previous point, or the point alone after a gap.
      const prev = i && Number.isFinite(run[i - 1].y) ? run[i - 1] : p;
      if (crosses(pad, prev, p)) sum += 100;
    });
  }
  return sum;
}

type Spot = { x: number; y: number; anchor: "start" | "end" };

/**
 * Where a line's label goes: the first spot inside the plot that keeps clear
 * of the data, trying the right end then the left, above the line then below
 * (beside the top of a vertical line, then its bottom). With nowhere clear,
 * the spot that covers the least.
 */
function labelSpot(
  { at, text, vertical }: PlacedReference,
  plotWidth: number,
  plotHeight: number,
  avoid: ReferenceAvoid,
): Spot {
  const w = width(text);
  const spots: Spot[] = vertical
    ? [10, plotHeight - 4].flatMap((y) => [
        { x: at + 4, y, anchor: "start" as const },
        { x: at - 4, y, anchor: "end" as const },
      ])
    : [at - 4, at + 12].flatMap((y) => [
        { x: plotWidth, y, anchor: "end" as const },
        { x: 0, y, anchor: "start" as const },
      ]);
  const box = ({ x, y, anchor }: Spot): Box =>
    anchor === "start" ? [x, y - 10, x + w, y + 2] : [x - w, y - 10, x, y + 2];
  const inside = (s: Spot) => {
    const [x0, y0, x1, y1] = box(s);
    return x0 >= 0 && x1 <= plotWidth && y0 >= 0 && y1 <= plotHeight;
  };
  // The first clear spot, or with none clear, the one covering least.
  let best = spots.find(inside) ?? spots[0];
  let least = Infinity;
  for (const spot of spots.filter(inside)) {
    const c = covered(box(spot), avoid);
    if (c < least) [best, least] = [spot, c];
    if (!c) break;
  }
  return best;
}

/**
 * Dashed reference lines with visible labels. Hidden from assistive
 * technology (the summary and table caption carry the same text), not
 * focusable, and transparent to the pointer, so marks underneath still work.
 * Labels keep clear of the data in `avoid` where they can.
 */
export function ReferenceLines({
  lines,
  plotWidth,
  plotHeight,
  avoid = {},
}: {
  lines: PlacedReference[];
  plotWidth: number;
  plotHeight: number;
  avoid?: ReferenceAvoid;
}) {
  if (!lines.length) return null;
  return (
    <g className="raster-chart__reference" aria-hidden="true">
      {lines.map((line, i) => {
        const { at, text, vertical } = line;
        const spot = labelSpot(line, plotWidth, plotHeight, avoid);
        return (
          <g key={i}>
            <line
              x1={vertical ? at : 0}
              x2={vertical ? at : plotWidth}
              y1={vertical ? 0 : at}
              y2={vertical ? plotHeight : at}
              className="raster-chart__reference-line"
            />
            <text
              x={spot.x}
              y={spot.y}
              textAnchor={spot.anchor}
              className="raster-chart__reference-label"
            >
              {text}
            </text>
          </g>
        );
      })}
    </g>
  );
}
