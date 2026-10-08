# @eekodigital/raster

Light, accessible SVG charts for React, by [Eeko Digital](https://eeko.digital). No d3, zero runtime dependencies, themable through a small set of CSS custom properties.

LineChart, BarChart, DonutChart, ScatterChart, Sparkline, Gauge, LinearGauge, RadarChart and GeoChart.

Docs: [raster.eeko.digital](https://raster.eeko.digital)

> **Upgrading from 3.x?** Raster 4 removes `exportRef` (use a `ref` and `@eekodigital/raster/export`), makes the data table a native `<details>` disclosure, and passes custom `labels.summary` functions a ready-made `name`. See [Migrating](https://raster.eeko.digital/guides/migrating/) or the [changelog](https://github.com/eekodigital/raster/blob/main/CHANGELOG.md).

## Design goals

| Goal                                          | Where it stands                                                                                                                                                                                                                                                                                                                                                          |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Light.** No feature bloat.                  | Zero runtime dependencies. Each chart is its own entry point, mostly 5–6.5 KB min+gzip including the shared accessibility layer (LineChart about 8 KB, Sparkline about 2 KB). Date axes, export and the accessibility frame are opt-in entries. GeoChart and its `topojson-client` peer are at `@eekodigital/raster/geo`. CI checks every entry against a size tripwire. |
| **Themable enough for our apps.**             | Charts read a documented `--raster-*` contract, with fallbacks for every property. Per-series and per-datum `color` props override it.                                                                                                                                                                                                                                   |
| **SVG, for accessibility and interactivity.** | Each chart is a labelled figure with a generated summary, a "Show data table" disclosure, and SVG marks with accessible names, reached with one Tab stop and arrow keys. Tooltips show on hover and focus.                                                                                                                                                               |
| **Not based on d3.**                          | Scales, ticks, curves and arcs come from raster's own `chart-math`.                                                                                                                                                                                                                                                                                                      |
| **TypeScript native.**                        | Types ship with the package.                                                                                                                                                                                                                                                                                                                                             |
| **Responsive.**                               | Every chart fills its container unless given a fixed size. Cartesian charts take a `height` or an `aspectRatio`, sized in CSS so server-rendered and hydrated layouts match, and thin or rotate labels to fit.                                                                                                                                                           |

No other library we found is light, SVG and d3-free at once; see the [comparison](https://raster.eeko.digital/guides/comparison/).

## Install

```sh
pnpm add @eekodigital/raster
# Only if you use GeoChart:
pnpm add topojson-client
```

## Usage

Load the stylesheet once at your app root. Charts don't import CSS themselves, so the package is side-effect free.

```tsx
import "@eekodigital/raster/styles.css";
import { BarChart, LineChart } from "@eekodigital/raster";

// LineChart: series of { name, data }, one value per category.
<LineChart
  series={[{ name: "Visitors", data: [120, 180, 150, 240] }]}
  categories={["Mon", "Tue", "Wed", "Thu"]}
  title="Visitors this week"
/>;

// BarChart: one { label, value } per bar.
<BarChart
  data={[
    { label: "Pass", value: 42 },
    { label: "Fail", value: 8 },
  ]}
  title="Results"
/>;
```

Every chart server-renders: the figure, summary, data table and named marks are in the HTML before JavaScript runs, and the data table opens without JavaScript.

### Entry points

The main entry has every chart except GeoChart. Each chart also has its own entry (`/line-chart`, `/bar-chart`, …), plus `/geo`, `/time` (`timeAxis`), `/export` (`exportSVG`, `exportPNG`), `/frame` (`ChartFrame`, `ChartDataTable`, `describeChart`), `/labels` (`describeChart`, `DEFAULT_LABELS`), `/theme` and `/styles.css`. See [Entry points](https://raster.eeko.digital/guides/getting-started/#entry-points) for what each exports.

### React Server Components

Entries with components start with `"use client"`, so a Server Component (e.g. the Next.js App Router) can render charts directly, with plain-data props. They're still server-rendered; the directive marks where hydration starts. Props that are functions can't come from a Server Component, so build those in a client component of your own:

- `x={timeAxis(…)}`, `formatValue`, `formatX`, `formatXTick`, callbacks such as `onSelect`
- `labels` with function overrides

`/time`, `/export`, `/labels` and `/theme` aren't marked, so server code can call `timeAxis`, `describeChart` and the rest. TypeScript won't catch a function prop passed from a Server Component; the framework reports it when the page renders.

### Dates

For dates, pass `x={timeAxis(dates, { interval: "day" })}` from `/time` instead of `categories`. Points are spaced by elapsed time, ticks fall on days, weeks, months or years, and the line breaks where a day is missing. Dates are worded in `labels.locale`, which is `"en"` (US order, "October 3, 2026") by default: pass `labels={{ locale: "en-GB" }}` for "3 October 2026". See [Dates](https://raster.eeko.digital/components/line-chart/#dates).

## Theming

Map your tokens onto the chart contract once, where your theme switches:

```css
:root {
  --raster-text: var(--color-text);
  --raster-grid: var(--color-border);
  --raster-focus: var(--color-focus-ring);
  --raster-series-1: var(--color-interactive);
}
```

The contract is `--raster-text`, `--raster-text-subtle`, `--raster-reference`, `--raster-surface`, `--raster-grid`, `--raster-axis`, `--raster-focus`, `--raster-selected`, `--raster-tooltip-bg`, `--raster-tooltip-text` and `--raster-series-1` to `--raster-series-8`. For vanilla-extract, `@eekodigital/raster/theme` exports it as `rasterVars`. Unset properties fall back to `currentColor` and a validated light/dark palette. See [Theming charts](https://raster.eeko.digital/guides/theming/).

## Exporting

Give a chart a `ref` and pass it to `exportSVG` or `exportPNG` from `@eekodigital/raster/export`. It's a separate entry, so apps that don't export don't bundle it. See [Exporting charts](https://raster.eeko.digital/guides/exporting/).

## Development

```sh
pnpm install
pnpm build   # build dist/ (JS entries + styles.css)
pnpm test    # unit tests
pnpm size    # per-entry bundle-size budget (after build)
pnpm dev     # library watch + docs site
```

### Releasing

Work merges into `develop`, with a changeset (`pnpm changeset`) for anything users will notice. A release is a PR from `develop` into `main`. On `main`, the release workflow opens a "chore: version package" PR. Merging that publishes to npm, tags the commit `vX.Y.Z` and creates a GitHub release from the changelog.

## License

MIT
