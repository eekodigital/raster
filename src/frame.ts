// @eekodigital/raster/frame — raster's accessible frame around a chart it
// doesn't draw (zoom, brushing, Canvas): a named figure, a text summary and
// a data table, all server-rendered. Also exported from the main entry.
export { ChartFrame } from "./components/shared/ChartFrame.js";
export type { ChartFrameProps } from "./components/shared/ChartFrame.js";
export { ChartDataTable } from "./components/shared/ChartDataTable.js";
export type {
  ChartDataTableProps,
  ChartDataTableRow,
  ChartTableData,
  DataTableMode,
} from "./components/shared/ChartDataTable.js";
export { describeChart } from "./utils/labels.js";
export type { ChartLabels, DescribeParts, SummaryParts } from "./utils/labels.js";
