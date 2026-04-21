---
"@eekodigital/raster": patch
---

LineChart, BarChart, ScatterChart, RadarChart, GeoChart, and DonutChart: the sr-only accessibility fallback `<table>` now uses `display: block` so its intrinsic table-layout size doesn't contribute to the parent container's `scrollHeight` in Chromium. Firefox was unaffected. Also replaces the deprecated `clip: rect(…)` with `clip-path: inset(50%)`. No API change.
