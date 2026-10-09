---
"@eekodigital/raster": major
---

**One API across charts.**

### Changed (breaking)

- **`onMarkClick` on every chart**, with `{ index, value, datum }` (`index` as `onSelect` gives it). It replaces `onPointClick`, `onBarClick`, `onSegmentClick`, `onRegionClick` and `onMarkerClick`. On GeoChart it makes both regions and markers clickable.
- **BarChart takes `series: { name, data, color? }[]` with `categories`**, like LineChart, instead of `series` names with `values[category][series]`. `data: { label, value, color? }[]` remains for a single series. `grouped` is removed (it's the default for several series), and so is `colors`: use `color` on each datum or series. Selection is one bar, `{ series, point }` (`BarPointIndex`), not a whole category.
- **Gauge and LinearGauge take `title` and `formatValue`**, instead of `label` and `format`, and a `labels` prop; the default number format follows `labels.locale`.
- LineChart's date axis prop is `xAxis` (was `x`).

### Added

- ScatterChart `xAxis`: a date axis (`timeAxis(points.map((p) => p.x))`) for calendar ticks and dates in names, the summary and the table.
- `xTickFilter` and `formatXTick` also apply to LineChart's date ticks.
- Types: `MarkClick`, `BarSeries`, `BarPointIndex`.
