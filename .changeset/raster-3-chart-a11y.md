---
"@eekodigital/raster": major
---

**Accessible, responsive charts.** Every chart now shares one accessible structure, keyboard model and sizing model. See the Accessibility guide and "Migrating from v2" for details.

### Changed (breaking)

- Charts are `role="figure"`s named by a visible **`title`** (replaces `aria-label`; `hideTitle` keeps it for screen readers only) and described by a generated summary. The SVG is `role="group"` with `aria-roledescription="chart"`; series are groups; marks are labelled "{series}, {x}: {y}, 3 of 12".
- LineChart's x-axis `labels` prop is renamed **`categories`**. `labels` is now the object of generated strings (English defaults, `locale` for `Intl` number formatting).
- Values are formatted with `Intl.NumberFormat` by default.
- Marks are `role="button"` with `aria-pressed` only when a chart is interactive (`onSelect`, `selectedIndex` or a click handler); otherwise they're static images and clicks do nothing.
- The data table is a visible **Show data table** disclosure by default (`dataTable="visually-hidden"` restores the old behaviour), with a caption, scoped headers and formatted values.
- Gauge and LinearGauge: `label` is required and names the meter (`aria-labelledby`); `aria-label` is removed; `aria-valuetext` comes from `format`.
- Sparkline takes `title` and exposes a text summary instead of `role="img"`.
- GeoChart loses `width` and fills its container.
- Multi-series line, scatter and radar points use a different marker shape per series.

### Added

- `aspectRatio` as an alternative to `height`; the plot is sized in CSS, so SSR doesn't shift. DonutChart, Gauge, RadarChart and Sparkline fill their container when `size`/`width` is omitted.
- Keyboard: one tab stop per chart, arrows, Home/End, PageUp/PageDown, Enter/Space; stacked and grouped bars and GeoChart regions and markers are navigable. Escape clears the selection inside the chart only, announced in a polite live region.
- `min` on Gauge and LinearGauge; `selectedIndex`/`onSelect` on ScatterChart, RadarChart and GeoChart; `value` on GeoChart markers.
- `DEFAULT_LABELS` and the `ChartLabels` type.

### Fixed

- DonutChart's draw-in animation now respects `prefers-reduced-motion`.
- GeoChart keyboard navigation (focus never moved before) and unreachable markers.
- Escape no longer listens on `document`, so it doesn't close a surrounding dialog.
- Tooltips no longer duplicate each mark's name via `aria-describedby`.
