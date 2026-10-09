---
"@eekodigital/raster": minor
---

**Raster's accessibility frame is public**, so a chart raster doesn't draw (TanStack Charts, Canvas, anything with zoom or brushing) can get the same figure, summary and data table.

### Added

- `ChartFrame`: wraps any chart in a `role="figure"` named by the visible `title` and described by `summary`. The chart is rendered as it is, with an optional `legend` and a "Show data table" disclosure built from `table`. Everything is server-rendered. It takes `hideTitle`, `dataTable`, `labels`, `className` and `ref`.
- `ChartDataTable`, on its own. Its `labels` are partial, cells are shown as given, and on its own its toggle is described by the caption.
- `describeChart(parts, labels?)`: writes raster's generated summary ("Line chart, 2 series, 730 points. …") from counts and ranges. `SummaryParts.name` overrides the type's name ("Heatmap") for charts raster doesn't draw.
- `@eekodigital/raster/frame` (about 1.6 KB), and the same exports from the main entry. Types: `ChartFrameProps`, `ChartDataTableProps`, `ChartDataTableRow`, `ChartTableData`.
- A "Wrapping other charts" guide with a canvas demo, a TanStack example, and guidance on when to hide the wrapped chart.

### Changed

- `exportSVG` and `exportPNG` only export raster's own (marked) chart SVG, or an SVG passed directly. They no longer fall back to the first SVG inside the target, which could be a legend swatch or a wrapped chart.
