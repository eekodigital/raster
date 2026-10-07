---
"@eekodigital/raster": minor
---

**Export is opt-in.** SVG and PNG export moves to `@eekodigital/raster/export`, so charts no longer bundle it. Every SVG chart is about 600–620 B (min+gzip) smaller.

### Added

- `@eekodigital/raster/export`: `exportSVG(target, filename?)` and `exportPNG(target, filename?, scale?)`. `target` is the chart, or any element containing it.
- A `ref` prop on every SVG chart, pointing at its figure (or, for Gauge and Sparkline, its root element).

### Deprecated

- `exportRef` still works, with the same types. Instead of bundling the export code with every chart, a chart given an `exportRef` loads it in the background with `import()`, so exports still happen inside the user's click. It will be removed in 4.0.

  To migrate, swap `exportRef` for `ref` and call `exportSVG(ref.current)` or `exportPNG(ref.current)`. See "Migrating from exportRef" in the Exporting guide.
