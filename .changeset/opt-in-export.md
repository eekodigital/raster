---
"@eekodigital/raster": major
---

**Export is opt-in.** SVG and PNG export moves to `@eekodigital/raster/export`, so charts no longer bundle it. Every SVG chart is about 600–620 B (min+gzip) smaller.

### Added

- `@eekodigital/raster/export`: `exportSVG(target, filename?)` and `exportPNG(target, filename?, scale?)`. `target` is the chart, or any element containing it.
- A `ref` prop on every SVG chart, pointing at its figure (or, for Gauge and Sparkline, its root element).

### Removed (breaking)

- The `exportRef` prop and the `ChartExportHandle` type. Give the chart a `ref` and call `exportSVG(ref.current)` or `exportPNG(ref.current)` from `@eekodigital/raster/export`. See "Migrating from v3 to v4".
