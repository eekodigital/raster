// @eekodigital/raster — light, accessible SVG charts for React.
//
// GeoChart lives at `@eekodigital/raster/geo` so the main entry never pulls in
// `topojson-client`. Styles ship separately as `@eekodigital/raster/styles.css`.
export { DEFAULT_LABELS, describeChart } from "./utils/labels.js";
export type {
  ChartLabelOverrides,
  ChartLabels,
  ChartType,
  MarkLabelParts,
  ResolvedSummaryParts,
  SummaryParts,
} from "./utils/labels.js";
export { ChartDataTable } from "./components/shared/ChartDataTable.js";
export type {
  ChartDataTableProps,
  ChartDataTableRow,
  ChartTableData,
  DataTableMode,
} from "./components/shared/ChartDataTable.js";
export { ChartFrame } from "./components/shared/ChartFrame.js";
export type { ChartFrameProps } from "./components/shared/ChartFrame.js";
export type { NumericReferenceLine, ReferenceLine } from "./components/shared/ReferenceLines.js";
export { BarChart } from "./components/BarChart/BarChart.js";
export type { BarChartProps, BarDatum } from "./components/BarChart/BarChart.js";
export { ChartTooltip, useChartTooltip } from "./components/ChartTooltip/ChartTooltip.js";
export type { ChartTooltipProps } from "./components/ChartTooltip/ChartTooltip.js";
export { DonutChart } from "./components/DonutChart/DonutChart.js";
export type { DonutChartProps, DonutDatum } from "./components/DonutChart/DonutChart.js";
export { Gauge } from "./components/Gauge/Gauge.js";
export type { GaugeProps } from "./components/Gauge/Gauge.js";
export { LinearGauge } from "./components/LinearGauge/LinearGauge.js";
export type { LinearGaugeProps } from "./components/LinearGauge/LinearGauge.js";
export { LineChart } from "./components/LineChart/LineChart.js";
export type {
  LineChartProps,
  LinePointIndex,
  LineSeries,
  XAxis,
} from "./components/LineChart/LineChart.js";
export { RadarChart } from "./components/RadarChart/RadarChart.js";
export type {
  RadarChartProps,
  RadarPointIndex,
  RadarSeries,
} from "./components/RadarChart/RadarChart.js";
export { ScatterChart } from "./components/ScatterChart/ScatterChart.js";
export type {
  ScatterChartProps,
  ScatterPoint,
  ScatterPointIndex,
  ScatterSeries,
} from "./components/ScatterChart/ScatterChart.js";
export { Sparkline } from "./components/Sparkline/Sparkline.js";
export type { SparklineProps } from "./components/Sparkline/Sparkline.js";
