// Charts
export type { ChartExportHandle } from './utils/use-chart-export.js';
export { BarChart } from './components/BarChart/BarChart.js';
export type { BarDatum } from './components/BarChart/BarChart.js';
export { DonutChart } from './components/DonutChart/DonutChart.js';
export type { DonutDatum } from './components/DonutChart/DonutChart.js';
export { Gauge } from './components/Gauge/Gauge.js';
export { GeoChart } from './components/GeoChart/GeoChart.js';
export type { GeoRegionDatum, GeoMarker } from './components/GeoChart/GeoChart.js';
export { LinearGauge } from './components/LinearGauge/LinearGauge.js';
export { LineChart } from './components/LineChart/LineChart.js';
export type { LineSeries } from './components/LineChart/LineChart.js';
export { RadarChart } from './components/RadarChart/RadarChart.js';
export type { RadarSeries } from './components/RadarChart/RadarChart.js';
export { ScatterChart } from './components/ScatterChart/ScatterChart.js';
export type { ScatterPoint, ScatterSeries } from './components/ScatterChart/ScatterChart.js';
export { Sparkline } from './components/Sparkline/Sparkline.js';

// Simple components
export { Badge } from './components/Badge/Badge.js';
export type { BadgeVariant } from './components/Badge/Badge.js';
export { Breadcrumbs } from './components/Breadcrumbs/Breadcrumbs.js';
export type { BreadcrumbItem } from './components/Breadcrumbs/Breadcrumbs.js';
export { Button } from './components/Button/Button.js';
export { Card } from './components/Card/Card.js';
export { Checkbox, CheckboxGroup } from './components/Checkbox/Checkbox.js';
export { DateInput } from './components/DateInput/DateInput.js';
export type { DateValue } from './components/DateInput/DateInput.js';
export { Details } from './components/Details/Details.js';
export { ErrorSummary } from './components/ErrorSummary/ErrorSummary.js';
export { Fieldset } from './components/Fieldset/Fieldset.js';
export { FileInput, FileUploadField } from './components/FileUpload/FileUpload.js';
export { NotificationBanner } from './components/NotificationBanner/NotificationBanner.js';
export type { NotificationBannerVariant } from './components/NotificationBanner/NotificationBanner.js';
export { OneTimePasswordField } from './components/OneTimePasswordField/OneTimePasswordField.js';
export { Pagination } from './components/Pagination/Pagination.js';
export { PasswordToggleField } from './components/PasswordToggleField/PasswordToggleField.js';
export { Radio, RadioGroup } from './components/Radio/Radio.js';
export { Select } from './components/Select/Select.js';
export type { SelectOption } from './components/Select/Select.js';
export { SelectField } from './components/Select/SelectField.js';
export { Box } from './components/Box/Box.js';
export { Flex } from './components/Flex/Flex.js';
export { Grid } from './components/Grid/Grid.js';
export { Progress } from './components/Progress/Progress.js';
export { SegmentedButtons } from './components/SegmentedButtons/SegmentedButtons.js';
export type { SegmentedOption } from './components/SegmentedButtons/SegmentedButtons.js';
export { Separator } from './components/Separator/Separator.js';
export { SkipLink } from './components/SkipLink/SkipLink.js';
export { Skeleton } from './components/Skeleton/Skeleton.js';
export { Spinner } from './components/Spinner/Spinner.js';
export {
  SummaryList,
  SummaryListRow,
  SummaryListKey,
  SummaryListValue,
  SummaryListActions,
} from './components/SummaryList/SummaryList.js';
// DataTable is exported from '@eekodigital/raster/data-table' to avoid
// bundling @tanstack/react-table (~80KB) for consumers who don't need it.
export { Table } from './components/Table/Table.js';
export type { Column } from './components/Table/Table.js';
export { Tag } from './components/Tag/Tag.js';
export type { TagVariant } from './components/Tag/Tag.js';
export { Heading, Text } from './components/Typography/Typography.js';
export { Textarea } from './components/Textarea/Textarea.js';
export { TextareaField } from './components/Textarea/TextareaField.js';
export { TextInput } from './components/TextInput/TextInput.js';
export { TextInputField } from './components/TextInput/TextInputField.js';

// Compound components (namespace exports)
export * as Accordion from './components/Accordion/Accordion.js';
export * as AlertDialog from './components/AlertDialog/AlertDialog.js';
export * as Avatar from './components/Avatar/Avatar.js';
export * as Collapsible from './components/Collapsible/Collapsible.js';
export * as ScrollArea from './components/ScrollArea/ScrollArea.js';
export * as Slider from './components/Slider/Slider.js';
export * as Dialog from './components/Dialog/Dialog.js';
export * as DropdownMenu from './components/DropdownMenu/DropdownMenu.js';
export * as Popover from './components/Popover/Popover.js';
export * as Switch from './components/Switch/Switch.js';
export * as Tabs from './components/Tabs/Tabs.js';
export * as Toast from './components/Toast/Toast.js';
export * as Tooltip from './components/Tooltip/Tooltip.js';
