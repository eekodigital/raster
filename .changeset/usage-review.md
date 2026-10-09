---
"@eekodigital/raster": major
---

From trying raster in fresh Next.js 16 and React Router 8 apps:

### Changed (breaking)

- **The data table disclosure is a native `<details>`/`<summary>`**, so it opens without JavaScript and the values are reachable from the server-rendered HTML. (It was a `<button>` that needed JavaScript, with the table `hidden`, which also hid it from assistive technology.) With JavaScript, the label still switches between "Show data table" and "Hide data table".

  **If your tests or CSS find the toggle:** it's no longer a `button`. In tests, find it by text (`getByText("Show data table", { selector: "summary" })`) instead of `getByRole("button", …)`, and check `details.open` instead of `aria-expanded`. CSS on `button.raster-chart__table-toggle` should target `.raster-chart__table-toggle`.

### Added

- `@eekodigital/raster/labels`: `describeChart` and `DEFAULT_LABELS` without `"use client"`, so React Server Components can call them.
- README: server rendering, React Server Components (which props need a client component), every entry point, a BarChart example, the date locale, and an absolute changelog link (the relative one broke on npm). Getting started: a Vite `optimizeDeps` tip. JSDoc on BarChart's `data`/`series` and LineChart's `xAxis`.
