/** Formats a number for display. */
export type NumberFormat = (value: number) => string;

export type ChartType = "line" | "bar" | "donut" | "scatter" | "radar" | "map" | "sparkline";

export type MarkLabelParts = {
  /** Series name; omitted for single-series charts. */
  series?: string;
  /** Category, axis or position, already formatted. */
  x: string;
  /** Value, already formatted; omitted for marks with no value (e.g. map markers). */
  y?: string;
  /** Zero-based position within the series. */
  index: number;
  /** Number of marks in the series. */
  count: number;
};

/**
 * What a summary describes. A raster `type` (worded by `labels.chartNames`),
 * a `name` for any other chart ("Heatmap"), or both: `name` wins.
 */
export type SummaryParts = (
  | { type: ChartType; name?: string }
  | { type?: undefined; name: string }
) & {
  series: number;
  /** Total number of marks. */
  points: number;
  /** First and last category, or the x range, formatted. */
  x?: [string, string];
  /** Smallest and largest value, formatted. */
  y?: [string, string];
  first?: string;
  last?: string;
  /** Reference lines, each already worded by `referenceLine` ("Target: 90"). */
  references?: string[];
};

/** What `labels.summary` receives: the parts, with the chart's `name` worked out. */
export type ResolvedSummaryParts = SummaryParts & { name: string };

/**
 * Every string a chart generates. Pass a partial object as the `labels` prop to
 * translate or reword; anything omitted keeps its English default. Functions
 * receive `n`, an `Intl.NumberFormat` for `locale`, for counts.
 */
export type ChartLabels = {
  /** BCP 47 locale for the default `formatValue` and for counts. */
  locale: string;
  /** `aria-roledescription` of the SVG. */
  chart: string;
  showTable: string;
  hideTable: string;
  tableCaption: (title: string) => string;
  /** Appended to a dense chart's current point when it's selected. */
  selected: string;
  /** Announced (off focus) when Escape clears a selection. */
  selectionCleared: string;
  /** Map regions without a value, in marks and the data table. */
  noData: string;
  /** Map: names of the region and marker groups, and the table's Type column. */
  regions: string;
  markers: string;
  region: string;
  marker: string;
  /** Data table column headers. Series columns use the series names. */
  categoryColumn: string;
  valueColumn: string;
  percentageColumn: string;
  periodColumn: string;
  /** First column of a LineChart with a time axis. */
  dateColumn: string;
  axisColumn: string;
  nameColumn: string;
  typeColumn: string;
  seriesColumn: string;
  labelColumn: string;
  /** Scatter x/y columns when `xLabel`/`yLabel` aren't given. */
  xColumn: string;
  yColumn: string;
  /** A reference line's text, in the SVG and the summary: "Target: 90". */
  referenceLine: (label: string, value: string) => string;
  /** The data table caption when a chart has reference lines: `caption` plus a note of them. */
  referenceNote: (caption: string, lines: string[]) => string;
  series: (name: string, count: number, n: NumberFormat) => string;
  mark: (parts: MarkLabelParts, n: NumberFormat) => string;
  /** Names of raster's chart types, for summaries ("Line chart"). */
  chartNames: Record<ChartType, string>;
  /**
   * The text summary. `name` is already worked out (from `chartNames`, or the
   * name a wrapped chart gives), so translations word it once, in `chartNames`.
   */
  summary: (parts: ResolvedSummaryParts, n: NumberFormat) => string;
};

const CHART_NAMES: Record<ChartType, string> = {
  line: "Line chart",
  bar: "Bar chart",
  donut: "Donut chart",
  scatter: "Scatter chart",
  radar: "Radar chart",
  map: "Map",
  sparkline: "Sparkline",
};

const points = (count: number, n: NumberFormat) =>
  `${n(count)} ${count === 1 ? "point" : "points"}`;

export const DEFAULT_LABELS: ChartLabels = {
  locale: "en",
  chart: "chart",
  showTable: "Show data table",
  hideTable: "Hide data table",
  tableCaption: (title) => `Data for ${title}`,
  selected: "selected",
  selectionCleared: "Selection cleared",
  noData: "No data",
  regions: "Regions",
  markers: "Markers",
  region: "Region",
  marker: "Marker",
  categoryColumn: "Category",
  valueColumn: "Value",
  percentageColumn: "Percentage",
  periodColumn: "Period",
  dateColumn: "Date",
  axisColumn: "Axis",
  nameColumn: "Name",
  typeColumn: "Type",
  seriesColumn: "Series",
  labelColumn: "Label",
  xColumn: "X",
  yColumn: "Y",
  referenceLine: (label, value) => `${label}: ${value}`,
  referenceNote: (caption, lines) =>
    `${caption}, with ${lines.length === 1 ? "a reference line" : "reference lines"} (${lines.join("; ")})`,
  series: (name, count, n) => `${name}, ${points(count, n)}`,
  mark: ({ series, x, y, index, count }, n) =>
    `${series ? `${series}, ` : ""}${x}${y === undefined ? "" : `: ${y}`}, ${n(index + 1)} of ${n(count)}`,
  chartNames: CHART_NAMES,
  summary: ({ name, series, points: count, x, y, first, last, references = [] }, n) =>
    [
      `${[name, series > 1 && `${n(series)} series`, points(count, n)]
        .filter(Boolean)
        .join(", ")}.`,
      x && `${x[0]} to ${x[1]}.`,
      y && `Values from ${y[0]} to ${y[1]}.`,
      first !== undefined && `First ${first}, last ${last}.`,
      ...references.map((r) => `${r}.`),
    ]
      .filter(Boolean)
      .join(" "),
};

/**
 * The `labels` prop: any of `ChartLabels`, with `chartNames` merged (so one
 * name can be overridden on its own).
 */
export type ChartLabelOverrides = Partial<Omit<ChartLabels, "chartNames">> & {
  chartNames?: Partial<Record<ChartType, string>>;
};

export function resolveLabels(overrides?: ChartLabelOverrides): ChartLabels {
  return overrides
    ? {
        ...DEFAULT_LABELS,
        ...overrides,
        // A name left undefined (say, a missing translation) keeps its default.
        chartNames: {
          ...DEFAULT_LABELS.chartNames,
          ...Object.fromEntries(
            Object.entries(overrides.chartNames ?? {}).filter(([, name]) => name !== undefined),
          ),
        },
      }
    : DEFAULT_LABELS;
}

/** A chart's summary in `labels`' words, with its name worked out. */
export function summarize(parts: SummaryParts, labels: ChartLabels, n: NumberFormat): string {
  const name = parts.name ?? (parts.type && labels.chartNames[parts.type]) ?? labels.chart;
  return labels.summary({ ...parts, name }, n);
}

/**
 * Raster's generated summary ("Line chart, 2 series, 730 points. 1 Jan to 31
 * Dec. Values from 3 to 412."), for a chart raster doesn't draw, so it reads
 * like raster's own. Uses `labels.summary`, with counts in `labels.locale`.
 */
export function describeChart(parts: SummaryParts, labels?: ChartLabelOverrides): string {
  const resolved = resolveLabels(labels);
  return summarize(parts, resolved, numberFormatter(resolved.locale));
}

const formatters = new Map<string, NumberFormat>();

/** Cached `Intl.NumberFormat(locale).format`. */
export function numberFormatter(locale: string): NumberFormat {
  let f = formatters.get(locale);
  if (!f) {
    f = new Intl.NumberFormat(locale).format;
    formatters.set(locale, f);
  }
  return f;
}
