---
"@eekodigital/raster": minor
---

**Reference lines** for targets, thresholds and goals on LineChart, BarChart and ScatterChart.

### Added

- `referenceLines: { value, label, axis? }[]`. Each is a dashed line with a visible label ("Target: 90"), and the value scale stretches to include it.
  - **BarChart:** across the value axis, so vertical for `direction="horizontal"`.
  - **ScatterChart:** across y, or vertical with `axis: "x"` (worded with `formatX`).
  - **LineChart:** across y, or vertical at a date with `axis: "x"` on a `timeAxis`. Dates outside the data range are left out.
- **Accessibility:** not focusable, and hidden from assistive technology in the SVG. The same text ends the summary ("… Target: 90.") and is noted in the data table caption ("Data for Progress. Reference line: Target: 90.").
- `labels.referenceLine(label, value)` and `labels.referenceNote(lines)` to reword or translate them, and `SummaryParts.references`.
- `--raster-reference` theming property (`rasterVars.reference`), falling back to `--raster-text-subtle`. In forced-colours mode lines are `CanvasText` and keep their dash, and labels get a halo so they stay readable over data.
- `XAxis.at` and `XAxis.format`, so time axes can place and name any date. `timeAxis` provides them.
- The `ReferenceLine` type.
