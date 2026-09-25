# @eekodigital/raster

Light, accessible SVG charts for React, by [Eeko Digital](https://eeko.digital). No d3, zero runtime dependencies, themable through a small set of CSS custom properties.

LineChart, BarChart, DonutChart, ScatterChart, Sparkline, Gauge, LinearGauge, RadarChart and GeoChart.

Docs: [raster.eeko.digital](https://raster.eeko.digital)

> **Upgrading from 2.x?** Raster 3 is charts only: the UI components, design tokens and DataTable have been removed. See the [migration guide](https://raster.eeko.digital/guides/migrating/) or the [3.0.0 changelog entry](./CHANGELOG.md).

## Design goals

| Goal                                          | Where it stands                                                                                                                                                                                                                                                       |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Light.** No feature bloat.                  | Zero runtime dependencies. Each chart is its own entry point, about 5–6 KB min+gzip including the shared accessibility layer (Sparkline about 2.3 KB). GeoChart and its `topojson-client` peer are at `@eekodigital/raster/geo`. CI enforces a size budget per entry. |
| **Themable enough for our apps.**             | Charts read a documented `--raster-*` contract, with fallbacks for every property. Per-series and per-datum `color` props override it.                                                                                                                                |
| **SVG, for accessibility and interactivity.** | Each chart is a labelled figure with a generated summary, a "Show data table" disclosure, and SVG marks with accessible names, reached with one Tab stop and arrow keys. Tooltips show on hover and focus.                                                            |
| **Not based on d3.**                          | Scales, ticks, curves and arcs come from raster's own `chart-math`.                                                                                                                                                                                                   |
| **TypeScript native.**                        | Types ship with the package.                                                                                                                                                                                                                                          |
| **Responsive.**                               | Every chart fills its container unless given a fixed size. Cartesian charts take a `height` or an `aspectRatio`, sized in CSS so server-rendered and hydrated layouts match, and thin or rotate labels to fit.                                                        |

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
import { LineChart } from "@eekodigital/raster";

<LineChart
  series={[{ name: "Visitors", data: [120, 180, 150, 240] }]}
  categories={["Mon", "Tue", "Wed", "Thu"]}
  title="Visitors this week"
/>;
```

Each chart also has its own entry (`@eekodigital/raster/line-chart`, `/bar-chart`, `/donut-chart`, `/scatter-chart`, `/sparkline`, `/gauge`, `/linear-gauge`, `/radar-chart`, `/chart-tooltip`), and GeoChart is only at `@eekodigital/raster/geo`.

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

The contract is `--raster-text`, `--raster-text-subtle`, `--raster-surface`, `--raster-grid`, `--raster-axis`, `--raster-focus`, `--raster-selected`, `--raster-tooltip-bg`, `--raster-tooltip-text` and `--raster-series-1` to `--raster-series-8`. For vanilla-extract, `@eekodigital/raster/theme` exports it as `rasterVars`. Unset properties fall back to `currentColor` and a validated light/dark palette. See [Theming charts](https://raster.eeko.digital/guides/theming/).

## Exporting

Every SVG chart takes an `exportRef` with `exportSVG(filename?)` and `exportPNG(filename?, scale?)`. See [Exporting charts](https://raster.eeko.digital/guides/exporting/).

## Development

```sh
pnpm install
pnpm build   # build dist/ (JS entries + styles.css)
pnpm test    # unit tests
pnpm size    # per-entry bundle-size budget (after build)
pnpm dev     # library watch + docs site
```

## License

MIT
