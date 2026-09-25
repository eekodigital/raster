// @eekodigital/raster — light, accessible SVG charts for React.
//
// GeoChart lives at `@eekodigital/raster/geo` so the main entry never pulls in
// `topojson-client`. Styles ship separately as `@eekodigital/raster/styles.css`.
export type { ChartExportHandle } from "./utils/use-chart-export.js";
export { DEFAULT_LABELS } from "./utils/labels.js";
export type { ChartLabels, ChartType, MarkLabelParts, SummaryParts } from "./utils/labels.js";
export type { DataTableMode } from "./components/shared/ChartDataTable.js";
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
