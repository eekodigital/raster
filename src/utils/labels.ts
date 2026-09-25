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

export type SummaryParts = {
  type: ChartType;
  series: number;
  /** Total number of marks. */
  points: number;
  /** First and last category, or the x range, formatted. */
  x?: [string, string];
  /** Smallest and largest value, formatted. */
  y?: [string, string];
  first?: string;
  last?: string;
};

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
  axisColumn: string;
  nameColumn: string;
  typeColumn: string;
  seriesColumn: string;
  labelColumn: string;
  /** Scatter x/y columns when `xLabel`/`yLabel` aren't given. */
  xColumn: string;
  yColumn: string;
  series: (name: string, count: number, n: NumberFormat) => string;
  mark: (parts: MarkLabelParts, n: NumberFormat) => string;
  summary: (parts: SummaryParts, n: NumberFormat) => string;
};

const TYPE_NAMES: Record<ChartType, string> = {
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
  axisColumn: "Axis",
  nameColumn: "Name",
  typeColumn: "Type",
  seriesColumn: "Series",
  labelColumn: "Label",
  xColumn: "X",
  yColumn: "Y",
  series: (name, count, n) => `${name}, ${points(count, n)}`,
  mark: ({ series, x, y, index, count }, n) =>
    `${series ? `${series}, ` : ""}${x}${y === undefined ? "" : `: ${y}`}, ${n(index + 1)} of ${n(count)}`,
  summary: ({ type, series, points: count, x, y, first, last }, n) =>
    [
      `${[TYPE_NAMES[type], series > 1 && `${n(series)} series`, points(count, n)]
        .filter(Boolean)
        .join(", ")}.`,
      x && `${x[0]} to ${x[1]}.`,
      y && `Values from ${y[0]} to ${y[1]}.`,
      first !== undefined && `First ${first}, last ${last}.`,
    ]
      .filter(Boolean)
      .join(" "),
};

export function resolveLabels(overrides?: Partial<ChartLabels>): ChartLabels {
  return overrides ? { ...DEFAULT_LABELS, ...overrides } : DEFAULT_LABELS;
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
