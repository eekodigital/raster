---
"@eekodigital/raster": minor
---

From trying raster in fresh Next.js 16 and React Router 8 apps:

### Changed

- The data table disclosure is a native `<details>`/`<summary>`, so it opens without JavaScript and the values are reachable from the server-rendered HTML. (It was a button that needed JavaScript, with the table `hidden` until then.) With JavaScript, the label still switches between "Show data table" and "Hide data table".
- The table caption's reference line note reads "Data for Progress, with a reference line (Target: 90)", without the doubled colon.

### Added

- `@eekodigital/raster/labels`: `describeChart` and `DEFAULT_LABELS` without `"use client"`, so React Server Components can call them.
- `describeChart` takes a `name` without a `type`, for charts that aren't one of raster's types. The `DescribeParts` type.
- README: server rendering, React Server Components (which props need a client component), every entry point, a BarChart example, the date locale, and an absolute changelog link (the relative one broke on npm). Getting started: a Vite `optimizeDeps` tip. JSDoc on BarChart's `data`/`series` and LineChart's `x`.
