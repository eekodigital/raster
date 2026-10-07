import type { ChartLabels } from "../../utils/labels.js";

/** A target, threshold or goal drawn across the plot. */
export type ReferenceLine = {
  /**
   * Where the line sits: a value on the value (y) axis, or with `axis: "x"`,
   * on a continuous x axis (ScatterChart, or LineChart with `timeAxis`, where
   * it can be a `Date` or ISO string).
   */
  value: number | Date | string;
  /** Names the line, e.g. "Target". */
  label: string;
  /** `"y"` (default): across the value axis. `"x"`: a vertical line. */
  axis?: "x" | "y";
};

/** A line placed on the plot: its position in px and its text ("Target: 90"). */
export type PlacedReference = { at: number; text: string; vertical: boolean };

/** The table caption, with a note of the chart's reference lines. */
export function referenceCaption(caption: string, texts: string[], labels: ChartLabels) {
  return texts.length ? `${caption}. ${labels.referenceNote(texts)}` : caption;
}

/**
 * Dashed reference lines with visible labels. Hidden from assistive
 * technology: the summary and the table caption carry the same text. Not
 * focusable.
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
        // Labels sit inside the plot: at the right end above a horizontal
        // line (below it near the top), beside the top of a vertical one.
        const flip = vertical ? at > plotWidth - 80 : at < 14;
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
