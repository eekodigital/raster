---
"@eekodigital/raster": minor
---

**Export is opt-in.** SVG and PNG export moves to `@eekodigital/raster/export`, so charts no longer bundle it. Every SVG chart is about 650–690 B (min+gzip) smaller.

### Added

- `@eekodigital/raster/export`: `exportSVG(target, filename?)` and `exportPNG(target, filename?, scale?)`. `target` is the chart, or any element containing it.
- A `ref` prop on every SVG chart, pointing at its figure (or, for Gauge and Sparkline, its root element).

### Deprecated

- `exportRef` still works, but now loads the export code with `import()` the first time it's used, instead of bundling it with every chart. Its `exportSVG()` now returns a `Promise`, like `exportPNG()`. It will be removed in 4.0.

  To migrate, swap `exportRef` for `ref` and call `exportSVG(ref.current)` or `exportPNG(ref.current)`. See "Migrating from exportRef" in the Exporting guide.
