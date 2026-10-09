---
"@eekodigital/raster": minor
---

**Date axes for LineChart.** Pass `xAxis={timeAxis(dates, options)}` from the new `@eekodigital/raster/time` entry instead of `categories`.

### Added

- `timeAxis(values, { interval?, timeZone?, format? })` at `@eekodigital/raster/time`, about 1 KB, so charts with categories don't carry date code. Values are `Date`s, ISO strings (date-only = UTC midnight) or epoch ms.
  - Points are spaced by elapsed time.
  - Ticks fall on days, Monday weeks, months, quarters or years, chosen and thinned to fit the width.
  - `interval` breaks the line and area where data at that cadence is missing.
  - `timeZone` (IANA, default UTC) places ticks on local boundaries, with the same output on server and client.
  - Point names, the summary and the data table use formatted dates ("Views, 3 October 2026: 42, 3 of 12" in `en-GB`).
- LineChart `xAxis` prop, and the `XAxis` type.
- ScatterChart `formatX`: formats x values separately from `formatValue`, e.g. epoch ms as dates.
- `labels.dateColumn` ("Date"), which heads the data table's first column for date axes.

### Fixed

- Stacked smooth areas drew each upper series' lower edge left to right, so the area crossed itself. They now close along the series below, right to left.
