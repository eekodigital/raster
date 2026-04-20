---
"@eekodigital/raster": minor
---

Chart components (`LineChart`, `BarChart`, `ScatterChart`, `RadarChart`) now
size to their container in display pixels via a new `ResizeObserver`-backed
hook, instead of relying on a fixed `viewBox` that scaled every stroke,
point, and tick label with container width.

Previously a 2-unit stroke rendered as 8px on a 1600px-wide desktop and 12px
tick labels rendered as 48px. After this change strokes stay at 2px, points
at their configured radius, and labels at their CSS-specified font-size
regardless of container width.

- `LineChart`, `BarChart`, `ScatterChart`: `viewBox` removed; the SVG now
  has explicit `width` / `height` attributes driven by a measured container
  width (720px fallback until measured).
- `RadarChart`: when `size` is omitted, falls back to the measured container
  width (300px fallback). Explicit `size` still wins — this keeps existing
  controlled-mode callers working.

Public APIs are unchanged.
