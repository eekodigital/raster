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

/**
 * Dashed reference lines with visible labels. Hidden from assistive
 * technology (the summary and table caption carry the same text), not
 * focusable, and transparent to the pointer, so marks underneath still work.
 */
export function ReferenceLines({
  lines,
  plotWidth,
  plotHeight,
}: {
  lines: PlacedReference[];
  plotWidth: number;
  plotHeight: number;
}) {
  if (!lines.length) return null;
  return (
    <g className="raster-chart__reference" aria-hidden="true">
      {lines.map(({ at, text, vertical }, i) => {
        // Labels stay inside the plot: at the right end above a horizontal
        // line (below it near the top), beside the top of a vertical one,
        // on whichever side the label fits.
        const flip = vertical ? at + 4 + width(text) > plotWidth : at < 14;
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
              x={vertical ? at + (flip ? -4 : 4) : plotWidth}
              y={vertical ? 10 : at + (flip ? 12 : -4)}
              textAnchor={vertical && !flip ? "start" : "end"}
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
