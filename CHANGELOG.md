# @eekodigital/raster

## 4.0.0

### Major Changes

- a37d935: **One API across charts.**

  ### Changed (breaking)
  - **`onMarkClick` on every chart**, with `{ index, value, datum }` (`index` as `onSelect` gives it). It replaces `onPointClick`, `onBarClick`, `onSegmentClick`, `onRegionClick` and `onMarkerClick`. On GeoChart it makes both regions and markers clickable.
  - **BarChart takes `series: { name, data, color? }[]` with `categories`**, like LineChart, instead of `series` names with `values[category][series]`. `data: { label, value, color? }[]` remains for a single series. `grouped` is removed (it's the default for several series), and so is `colors`: use `color` on each datum or series. Selection is one bar, `{ series, point }` (`BarPointIndex`), not a whole category.
  - **Gauge and LinearGauge take `title` and `formatValue`**, instead of `label` and `format`, and a `labels` prop; the default number format follows `labels.locale`.
  - LineChart's date axis prop is `xAxis` (was `x`).

  ### Added
  - ScatterChart `xAxis`: a date axis (`timeAxis(points.map((p) => p.x))`) for calendar ticks and dates in names, the summary and the table.
  - `xTickFilter` and `formatXTick` also apply to LineChart's date ticks.
  - Types: `MarkClick`, `BarSeries`, `BarPointIndex`.

- 6508a02: **Chart names are worked out once, and translated in one place.**

  ### Changed (breaking)
  - `labels.summary` receives a ready-made `name` ("Line chart", or a wrapped chart's own name such as "Heatmap"), worked out from the new `labels.chartNames`. `type` can now be missing (for charts raster doesn't draw), so a custom summary that looked up `type` should use `name` instead, and its chart names move to `chartNames`. See "Migrating from v3 to v4".
  - The `labels` prop's type is `ChartLabelOverrides`: any `ChartLabels` key, with `chartNames` merged one name at a time.
  - `XAxis.at` and `XAxis.format` are required (`timeAxis` provides them).

  ### Added
  - `labels.chartNames`, and `describeChart({ name: "Heatmap", … })` without a `type`.
  - The `ChartLabelOverrides` and `ResolvedSummaryParts` types.

- ea80100: **Export is opt-in.** SVG and PNG export moves to `@eekodigital/raster/export`, so charts no longer bundle it. Every SVG chart is about 600–620 B (min+gzip) smaller.

  ### Added
  - `@eekodigital/raster/export`: `exportSVG(target, filename?)` and `exportPNG(target, filename?, scale?)`. `target` is the chart, or any element containing it.
  - A `ref` prop on every SVG chart, pointing at its figure (or, for Gauge and Sparkline, its root element).

  ### Removed (breaking)
  - The `exportRef` prop and the `ChartExportHandle` type. Give the chart a `ref` and call `exportSVG(ref.current)` or `exportPNG(ref.current)` from `@eekodigital/raster/export`. See "Migrating from v3 to v4".

- c8294a6: From trying raster in fresh Next.js 16 and React Router 8 apps:

  ### Changed (breaking)
  - **The data table disclosure is a native `<details>`/`<summary>`**, so it opens without JavaScript and the values are reachable from the server-rendered HTML. (It was a `<button>` that needed JavaScript, with the table `hidden`, which also hid it from assistive technology.) With JavaScript, the label still switches between "Show data table" and "Hide data table".

    **If your tests or CSS find the toggle:** it's no longer a `button`. In tests, find it by text (`getByText("Show data table", { selector: "summary" })`) instead of `getByRole("button", …)`, and check `details.open` instead of `aria-expanded`. CSS on `button.raster-chart__table-toggle` should target `.raster-chart__table-toggle`.

  ### Added
  - `@eekodigital/raster/labels`: `describeChart` and `DEFAULT_LABELS` without `"use client"`, so React Server Components can call them.
  - README: server rendering, React Server Components (which props need a client component), every entry point, a BarChart example, the date locale, and an absolute changelog link (the relative one broke on npm). Getting started: a Vite `optimizeDeps` tip. JSDoc on BarChart's `data`/`series` and LineChart's `xAxis`.

### Minor Changes

- 7461379: **Dark themes, your own controls beside the data table, and tighter value axes.**

  - **Dark themes work without setting `color-scheme`.** Charts inside an element with a `dark` class or `data-theme="dark"` (Tailwind's `dark` class, most theme switchers) use the dark palette, surface and tooltip. A `light` class or `data-theme="light"` inside one switches back; the nearest wins. `color-scheme` still works as before, and one set on a chart wins.
  - **`actions`** puts your own controls, such as download buttons, on the same row as the **Show data table** button, inside the chart's figure. The table opens below the whole row.
  - **`dataTable="none"`** leaves raster's data table out, for apps that offer the data their own way.
  - **Value axes fit their labels.** LineChart, ScatterChart and vertical BarChart size their left margin from the widest tick label (and `yLabel`), instead of a fixed 40–50 px, so short labels no longer sit indented from the title.
  - The **Show data table** button has a little more room above it.

- 62bcc05: **Date axes for LineChart.** Pass `xAxis={timeAxis(dates, options)}` from the new `@eekodigital/raster/time` entry instead of `categories`.

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

- c08a7a7: **Dense mode for long LineChart series.** Above 200 points in a series (configurable with `dense`), each series is drawn as one downsampled path with no per-point marks, and a single slider steps through the points.

  At 1,000 points the server HTML drops from about 310 KB to 62 KB, with the SVG going from 261 KB to 13 KB. There is one focusable control instead of 1,000.

  ### Added
  - LineChart `dense?: boolean | number`. A number sets the threshold; `true` or `false` forces dense mode on or off.
  - In dense mode:
    - **Slider:** a visually hidden `<input type="range">` named by the series, with `aria-valuetext` naming the current point ("Views, 3 October 2026: 42, 3 of 1,000").
    - **Keys:** the same as other charts. ← / →, Home / End and PageUp / PageDown move between points, ↑ / ↓ move between series, Enter / Space select (", selected" is added to the value), and Escape clears.
    - **Marker:** a marker with a drawn focus ring shows the current point.
    - **Pointer:** hovering over the plot moves to the nearest point (binary search on x) and shows the tooltip; clicking selects it.
    - **Drawing:** lines are 1.5 px, at most four points per pixel column (first, lowest, highest, last), with coordinates to 0.1 px. Smooth curves are drawn straight. A point left on its own by a gap still gets a dot.
    - **Still in the HTML:** the summary and data table.
  - `labels.selected` ("selected").
  - `ChartFrame` takes an `overlay`. It's internal for now.

- 873886a: **Raster's accessibility frame is public**, so a chart raster doesn't draw (TanStack Charts, Canvas, anything with zoom or brushing) can get the same figure, summary and data table.

  ### Added
  - `ChartFrame`: wraps any chart in a `role="figure"` named by the visible `title` and described by `summary`. The chart is rendered as it is, with an optional `legend` and a "Show data table" disclosure built from `table`. Everything is server-rendered. It takes `hideTitle`, `dataTable`, `labels`, `className` and `ref`.
  - `ChartDataTable`, on its own. Its `labels` are partial, cells are shown as given, and on its own its toggle is described by the caption.
  - `describeChart(parts, labels?)`: writes raster's generated summary ("Line chart, 2 series, 730 points. …") from counts and ranges. `SummaryParts.name` overrides the type's name ("Heatmap") for charts raster doesn't draw.
  - `@eekodigital/raster/frame` (about 1.6 KB), and the same exports from the main entry. Types: `ChartFrameProps`, `ChartDataTableProps`, `ChartDataTableRow`, `ChartTableData`.
  - A "Wrapping other charts" guide with a canvas demo, a TanStack example, and guidance on when to hide the wrapped chart.

  ### Changed
  - `exportSVG` and `exportPNG` only export raster's own (marked) chart SVG, or an SVG passed directly. They no longer fall back to the first SVG inside the target, which could be a legend swatch or a wrapped chart.

- 0549248: **Reference lines** for targets, thresholds and goals on LineChart, BarChart and ScatterChart.

  ### Added
  - `referenceLines: { value, label, axis? }[]`. Each is a dashed line with a visible label ("Target: 90"), and the value scale stretches to include it.
    - **BarChart:** across the value axis, so vertical for `direction="horizontal"`.
    - **ScatterChart:** across y, or vertical with `axis: "x"` (worded with `formatX`).
    - **LineChart:** across y, or vertical at a date with `axis: "x"` on a `timeAxis`. Dates outside the data range are left out.
  - **Accessibility:** not focusable, and hidden from assistive technology in the SVG. The same text ends the summary ("… Target: 90.") and is noted in the data table caption ("Data for Progress, with a reference line (Target: 90)").
  - `labels.referenceLine(label, value)` and `labels.referenceNote(caption, lines)` to reword or translate them (the note returns the whole caption, so punctuation is the translator's), and `SummaryParts.references`.
  - `--raster-reference` theming property (`rasterVars.reference`), falling back to `--raster-text-subtle`. In forced-colours mode lines are `CanvasText` and keep their dash, and labels get a halo so they stay readable over data.
  - Optional `XAxis.at` and `XAxis.format`, so time axes can place and name any date. `timeAxis` provides them.
  - The `ReferenceLine` and `NumericReferenceLine` types.
  - Lines that can't be placed, or fall off the plot (e.g. below zero on BarChart), are left out of the drawing, summary and caption. They don't block the pointer, and exported files keep their label halo.

- c304c14: ### Added

  - Entries that export React components (the main entry, every chart, `/frame`, `/chart-tooltip`, `/geo`) start with `"use client"`, so React Server Components can import them directly. They're still server-rendered. `/time`, `/export` and `/theme` stay unmarked, so server code can call them. CI checks the directive on every built entry.

  ### Fixed
  - The tooltip covered the top of a focused point's focus ring. It now sits 14 px above the mark (was 8 px), clear of the ring even while the focus scale animates.

### Patch Changes

- 6202abb: Docs: the comparison page's raster figures are re-measured for 4.0 (one line chart 8.3 KB, line and bar 9.9 KB, all 8 types 13.6 KB, added to a React page).
- d1dd9c0: Docs: the comparison page adds TanStack Charts 1.0, measured directly (bundle size, runtime dependencies, server-rendered HTML and accessibility), says plainly where it's the better choice, and lists what raster leaves out by design (zoom, brushing, Canvas, combined chart types, animation APIs). The README and docs home page give the current per-chart sizes.
- ba74131: **Axis labels, reference lines and maps fit their charts.** From a visual review of the docs site at desktop and phone widths:

  - **Axis labels never overlap.** Category labels (LineChart) thin to the smallest even step whose labels fit, measured by their estimated width. They no longer use a fixed 30 px, which let "Week 1" and "Week 2" overlap on a phone. `xLabelMinSpacing` no longer has a default; set it to space ticks further apart. BarChart rotates its labels when they're wider than a bar's slot (not by bar count), sizes the room for them from the longest label, and cuts very long labels with an ellipsis. Horizontal bars get a left margin to fit their labels.
  - **Date ticks are evenly spaced.** `timeAxis` picks the finest even step that fits: 1 or 2 days, 1 or 2 weeks, 1, 2, 3 or 6 months, then years. It no longer drops a single tick beside a wide edge label, which left a gap (Jan 2025, Jul, Oct…).
  - **Reference line labels keep clear of the data.** A label tries the right end then the left, above the line then below, and takes the first spot clear of lines, bars and points. With none clear, it takes the spot covering the least.
  - **Value axes end on a tick.** LineChart, BarChart and ScatterChart round their value scale out to whole ticks, so no point or bar is beyond the last gridline. ScatterChart also leaves a little room, so no point sits on an axis.
  - **GeoChart fits the map to the plot** in both directions, centred, instead of fitting the width and spilling over the title and legend. A `filter`ed map zooms to the regions it draws. Mercator latitudes are clamped to ±85°, as web maps do. Custom projection functions are unchanged. The colour legend stays on one row.
  - **RadarChart's axis labels sit beside the web,** anchored away from the centre. The margin fits the longest side label, up to 30% of the chart.

## 3.0.0

### Major Changes

- 44b5022: **Accessible, responsive charts.** Every chart now shares one accessible structure, keyboard model and sizing model. See the Accessibility guide and "Migrating from v2" for details.

  ### Changed (breaking)
  - Charts are `role="figure"`s named by a visible **`title`** (replaces `aria-label`; `hideTitle` keeps it for screen readers only) and described by a generated summary. The SVG is `role="group"` with `aria-roledescription="chart"`; series are groups; marks are labelled "{series}, {x}: {y}, 3 of 12".
  - LineChart's x-axis `labels` prop is renamed **`categories`**. `labels` is now the object of generated strings (English defaults, `locale` for `Intl` number formatting).
  - Values are formatted with `Intl.NumberFormat` by default.
  - Marks are `role="button"` with `aria-pressed` only when a chart is interactive (`onSelect`, `selectedIndex` or a click handler); otherwise they're static images and clicks do nothing.
  - The data table is a visible **Show data table** disclosure by default (`dataTable="visually-hidden"` restores the old behaviour), with a caption, scoped headers and formatted values.
  - Gauge and LinearGauge: `label` is required and names the meter (`aria-labelledby`); `aria-label` is removed; `aria-valuetext` comes from `format`.
  - Sparkline takes `title` and exposes a text summary instead of `role="img"`.
  - GeoChart loses `width` and fills its container (16:9 of its width, was a fixed 800×450 viewBox).
  - **Default sizes changed:** DonutChart (was `size` 160), Gauge (was `size` 120) and Sparkline (was `width` 80) now fill their container when `size`/`width` is omitted. Pass the old value to keep a fixed size.
  - Multi-series line, scatter and radar points use a different marker shape per series.

  ### Added
  - `aspectRatio` as an alternative to `height`; the plot is sized in CSS, so SSR doesn't shift.
  - Keyboard: one tab stop per chart, arrows, Home/End, PageUp/PageDown, Enter/Space; stacked and grouped bars and GeoChart regions and markers are navigable. Escape clears the selection inside the chart only, announced in a polite live region.
  - `min` on Gauge and LinearGauge; `selectedIndex`/`onSelect` on ScatterChart, RadarChart and GeoChart; `value` on GeoChart markers.
  - `formatValue` on DonutChart, RadarChart and Sparkline.
  - LineChart `xTickFilter` and `formatXTick`: thin or shorten x-axis ticks without touching `categories`, which keep naming the points and table rows. Automatic thinning always labels the last category, and only the first and last categories anchor to the plot edges.
  - Horizontal stacked and grouped BarCharts (`direction="horizontal"` with `series`/`values`); ← / → move between series.
  - Data table headers are translatable through `labels` (`categoryColumn`, `valueColumn`, …).
  - `ChartTooltip` `decorative` prop, and it now shifts sideways to stay inside its container.
  - `DEFAULT_LABELS` and the types `ChartLabels`, `ChartType`, `MarkLabelParts`, `SummaryParts`, `DataTableMode`, `LinePointIndex`, `ScatterPointIndex`, `RadarPointIndex` and `GeoSelection`.

  ### Fixed
  - DonutChart's draw-in animation now respects `prefers-reduced-motion`.
  - GeoChart keyboard navigation (focus never moved before) and unreachable markers.
  - Escape no longer listens on `document`, so it doesn't close a surrounding dialog.
  - Tooltips no longer duplicate each mark's name via `aria-describedby`, and Escape dismisses them (WCAG 1.4.13).
  - Selecting a point now visibly dims the others, and line areas keep their 15% opacity after the fade-in.
  - Focused points get a surface-coloured halo inside the focus ring, so focus stays visible when `--raster-focus` matches the series colour.
  - `dist/styles.css` is minified.

- 8ad4143: **Raster 3 is a charts library.** The UI components, design tokens and DataTable have been removed; charts are unchanged in their props but are now themed through a small `--raster-*` contract and styled by one stylesheet.

  The 2.x source and docs remain at the `v2.0.1` git tag, and `2.0.1` stays on npm.

  ### Removed
  - Every non-chart component: Accordion, AlertDialog, Avatar, Badge, Box, Breadcrumbs, Button, Card, Checkbox, Collapsible, DateInput, Details, Dialog, DropdownMenu, ErrorSummary, Fieldset, FileUpload, Flex, Grid, NotificationBanner, OneTimePasswordField, Pagination, PasswordToggleField, Popover, Portal, Progress, Radio, ScrollArea, SegmentedButtons, Select, Separator, Skeleton, SkipLink, Slider, Spinner, SummaryList, Switch, Table, Tabs, Tag, Textarea, TextInput, Toast, Tooltip, Typography.
  - `DataTable` and the `@eekodigital/raster/data-table` entry.
  - `@eekodigital/raster/tokens.css` and `@eekodigital/raster/primitives.css`.

  ### Added
  - `@eekodigital/raster/styles.css`: the single stylesheet. No JS entry imports CSS, so `sideEffects` now lists only CSS (`["*.css"]`): bundlers can drop unused charts but keep the stylesheet import.
  - `@eekodigital/raster/theme`: `rasterVars`, the typed theming contract.
  - Per-chart entry points: `/line-chart`, `/bar-chart`, `/donut-chart`, `/scatter-chart`, `/sparkline`, `/gauge`, `/linear-gauge`, `/radar-chart`, `/chart-tooltip`.
  - `ChartTooltip` and `useChartTooltip` are exported.
  - Props types for every chart (`LineChartProps`, `BarChartProps`, `GaugeProps`, …, `GeoChartProps` from `/geo`), and `ChartExportHandle` from every per-chart entry.
  - Forced-colours styles: system colours, with per-series dash patterns.

  ### Migration guide
  1. **Load the stylesheet once** at your app root and drop the tokens import:

     ```diff
     - import "@eekodigital/raster/tokens.css";
     + import "@eekodigital/raster/styles.css";
     ```

     Chart CSS is no longer injected on import, so remove any bare `import "@eekodigital/raster"` side-effect imports. Class names are now stable (`raster-*`), so remove `[class*="LineChart_…"]`-style overrides.

  2. **Map your theme onto the chart contract.** Charts no longer read `--color-*`, `--font-*` or `--spacing-*`:

     | v2 token                                                                                                   | v3 property                                                                              |
     | ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
     | `--color-text`                                                                                             | `--raster-text` (and `--raster-tooltip-bg`)                                              |
     | `--color-text-subtle`                                                                                      | `--raster-text-subtle`                                                                   |
     | `--color-text-inverse`                                                                                     | `--raster-tooltip-text`                                                                  |
     | `--color-border`                                                                                           | `--raster-grid`, `--raster-axis`                                                         |
     | `--color-focus-ring`                                                                                       | `--raster-focus`                                                                         |
     | `--color-surface`                                                                                          | `--raster-surface`                                                                       |
     | default series (`--color-interactive`, `--color-success`, …)                                               | `--raster-series-1` … `--raster-series-8`                                                |
     | GeoChart scale and markers (`--color-surface-raised`, `--color-interactive-subtle`, `--color-interactive`) | a ramp from `--raster-surface` to `--raster-series-1`; pass `colorScale` to set your own |

     ```css
     :root {
       --raster-text: var(--color-text);
       --raster-grid: var(--color-border);
       --raster-focus: var(--color-focus-ring);
       --raster-series-1: var(--color-interactive);
     }
     ```

     With vanilla-extract: `createGlobalTheme(":root", rasterVars, { … })` or `assignVars(rasterVars, { … })`, with `rasterVars` from `@eekodigital/raster/theme`. Fonts are inherited from the page. Unset properties fall back to `currentColor`-based values.

  3. **Default series colours changed** to an eight-colour palette derived from Okabe–Ito, with separate light and dark values chosen by `light-dark()` (set `color-scheme` on your dark theme). Pass `color` props or set `--raster-series-*` to keep your own colours.

  4. **GeoChart moved** to its own entry, and `topojson-client` is now a declared optional peer dependency:

     ```diff
     - import { GeoChart } from "@eekodigital/raster";
     + import { GeoChart } from "@eekodigital/raster/geo";
     ```

     `topology` is typed structurally (`GeoTopology`), so `@types/topojson-specification` is no longer needed.

  5. **UI components:** move them into your app, on [Base UI](https://base-ui.com) or plain HTML. **DataTable:** copy it from the `v2.0.1` tag and add `@tanstack/react-table` as a direct dependency. **Tokens:** copy the primitive values you use from `src/tokens/primitives.css` at `v2.0.1`.

## 2.0.1

### Patch Changes

- 799eb21: SegmentedButtons: keep the group keyboard-reachable when no option is selected. With an unset `value`, every option had `tabIndex={-1}`, so the radiogroup was skipped entirely when tabbing. The first option now takes the tab stop until a selection is made, per the WAI-ARIA radio group pattern.

## 2.0.0

### Major Changes

- 13c2a49: Per-component bundles — each component's CSS now ships only when its component is imported.

  The previous build produced a single `dist/index.mjs` that hoisted side-effect CSS imports for every component to the top of the entry. Any named import from the package (e.g. `import { Pagination } from "@eekodigital/raster"`) pulled in the chart, gauge, breadcrumb, etc. CSS regardless of whether those components were used. On a consuming app's home page that only used `Pagination`, this added ~70 KB of unused CSS (≈12 KB gzipped) to the critical path.

  `tsdown.config.ts` now emits one bundle per component (`dist/components/Pagination/Pagination.mjs`, etc.) and tsdown auto-creates per-component chunks that each side-effect-load only their own `.vanilla.css`. The barrel `dist/index.mjs` becomes pure re-exports, so a consumer's bundler can tree-shake to exactly the components they actually use.

  `sideEffects` widened from `["*.css"]` to `["**/*.css"]` so the globstar matches the nested `dist/assets/**` paths produced by the new chunked layout — without it, bundlers might tree-shake away the CSS imports.

  ### Breaking change

  The intended public API (named imports from `@eekodigital/raster`) is unchanged. The breaking part is the side-effect behaviour: consumers who relied on the spillover — using a Raster component's CSS class names directly without importing the component — will see broken styles. Anyone using the documented imports is unaffected.

  If you hit missing styles after upgrading, the fix is to import the relevant component explicitly so its CSS comes along.

## 1.0.0

### Major Changes

- 2cd068d: **Breaking — package now ships primitives + components only (no default theme).**

  Themes (mapping primitive scales onto semantic tokens like `--color-surface`) are a brand decision and now live with each consumer rather than baked into the package. `@eekodigital/raster/tokens.css` (and its new alias `@eekodigital/raster/primitives.css`) bundle the primitive scales and composite tokens; the prior `theme-light.css`, `theme-dark.css`, and `theme-high-contrast.css` are no longer in the published package. The raster docs site keeps its own copy of those theme files locally, regenerated by Style Dictionary into `docs/src/styles/` instead of `src/tokens/`.

  The new **Theming** docs page (`/foundations/theming`) walks through how to build a theme that maps semantic tokens onto the primitives.

  **Breaking — primitive scale `gray` renamed to `neutral` with true R = G = B values.**

  The `gray.*` scale had a slight warm tilt at every step (e.g. `gray.11` = `#494748`, R=73 G=71 B=72). The renamed `neutral.*` scale preserves the same lightness curve but zeroes out the chroma so every step is pure achromatic grey. "Neutral" is also the right name for a scale that spans white and black — and it sidesteps the `gray` (US) / `grey` (UK) spelling fork.

  Migration:

  1. **If you imported `@eekodigital/raster/tokens.css`** and depended on the bundled theme: copy raster's prior theme files into your app (or write your own using the new `/foundations/theming` template), then keep importing `tokens.css` (or the new `primitives.css` alias) for the primitives only.
  2. **If you reference `--color-primitive-gray-*`** anywhere in your CSS: rename to `--color-primitive-neutral-*`. Values are subtly different (now exact R = G = B); contrast ratios are equivalent.

  Other changes in this release:

  - Raster docs sidebar: new "Theming" entry under Foundations.
  - Colours docs page: `Gray (neutral)` palette entry renamed to `Neutral`.
  - WCAG verified: light + dark themes hit AA on body text; high-contrast hits AAA. (Verification was on the docs site theme files, which now live in `docs/`.)

  Known follow-up: Starlight expressive-code codeblocks switching themes is currently order-of-cascade dependent; not blocking this release but tracked separately.

## 0.4.2

### Patch Changes

- 6cf6ecf: Dark theme surfaces, borders, and text-grays now reference the cool **slate** primitives instead of the warm-leaning **gray** scale. The previous dark mode read as muted brown/khaki rather than a true neutral; switching to slate gives the surfaces the cool slate cast that "dark mode" usually implies.

  Affected tokens (dark theme only): `--color-bg`, `--color-surface`, `--color-surface-raised`, `--color-surface-overlay`, `--color-border`, `--color-border-strong`, `--color-text`, `--color-text-subtle`, `--color-text-placeholder`, `--color-text-disabled`, `--color-text-inverse`, `--color-interactive-text`, `--color-inactive`, `--color-inactive-bg`, `--color-inactive-border`.

  Light theme and high-contrast theme are unchanged. Interactive (blue), success (green), danger (red), and warning (amber) hues are unchanged in dark mode.

## 0.4.1

### Patch Changes

- 361c76d: `Fieldset` now stacks its legend and child fields as a flex column with a consistent gap. Previously the component only reset `border`/`margin`/`padding`, so stacked `TextInputField` / `PasswordToggleField` children inside a `<Fieldset>` rendered flush against each other and consumers had to add their own layout wrapper to get sensible vertical rhythm.

  The legend's dedicated `marginBottom` has been removed — gap handles that spacing now.

  Visual impact: fieldsets with multiple children now have `var(--spacing-4)` between them (matching what forms already do). Single-child fieldsets are unchanged since there's nothing to space.

- 4c36349: `Pagination` now uses `←` and `→` for the prev/next glyphs instead of `‹` and `›`.

  The single-angle-quotation-mark glyphs (U+2039 / U+203A) were hard to read at the component's default size and visually ambiguous with actual quotation marks — particularly on serif surfaces. Swapped to unambiguous left/right arrows (U+2190 / U+2192). `aria-label` text (`Previous page`, `Next page`) is unchanged, so screen-reader behaviour is identical.

## 0.4.0

### Minor Changes

- 1c55a6d: `Pagination` gains SSR-friendly anchor mode and an optional item-range caption.
  - Pass `getHref: (page: number) => string` instead of `onPageChange` to render prev/next and page-number controls as real `<a href>` links. Works without JavaScript and is crawlable, which makes this the right shape for server-rendered public feeds where the URL is the source of truth. The current page renders as a `<span aria-current="page">` rather than a self-link; disabled prev/next render as `<span aria-disabled="true">`.
  - Pass `itemRange={{ from, to, total }}` alongside either mode to render a live-announced `Items X–Y of N` caption below the pager. Handy on admin lists and public feeds where users want to see the full size of the data set.
  - `onPageChange` continues to work unchanged for client-driven use. The two modes are mutually exclusive at the type level (discriminated union).

## 0.3.3

### Patch Changes

- 9d52e73: A11y fixes surfaced by the Axe E2E suite, plus the suite is now gated in CI.

  - `ChartTooltip` drops `role="tooltip"` and sets `aria-hidden` when not visible
    or when content is empty, avoiding an axe "tooltip must have accessible
    name" violation on every chart page.
  - `OneTimePasswordField` now exposes the cell group via `role="group"`
    (accepts `aria-label`/`aria-labelledby`) and auto-labels each cell via a
    `cellAriaLabel` prop that defaults to "Character N of LENGTH".
  - `Pagination` accepts an `aria-label` override so multiple paginations on
    one page can be distinguished as landmarks.
  - `Switch.Root` now forwards standard button props — including `aria-label`,
    `aria-labelledby`, `aria-describedby` — to the underlying button.
  - `ScrollArea.Viewport` is now keyboard-focusable (`tabIndex={0}`) so
    keyboard users can scroll with arrow keys.
  - `LineChart`, `RadarChart`, `ScatterChart` series groups use `role="group"`
    instead of `role="region"`. Multiple instances on a page no longer trip
    the "landmark must be unique" rule; charts remain programmatically
    traversable.

- 80f5254: Respect `prefers-reduced-motion` in `Spinner`, `Skeleton`, and `Toast`. These
  three components were the only animated components without a reduce-motion
  guard — the spin, shimmer, and slide animations now pause when the user has
  requested reduced motion, matching the behaviour of the chart and gauge
  components.
- 9b3eca1: Add unit-level axe assertions (via vitest-axe) to the compound-component
  test suites: Dialog, AlertDialog, DropdownMenu, Popover, Tooltip, Toast,
  NotificationBanner, and ErrorSummary. Complements the Playwright axe
  suite — catches a11y regressions at the vitest layer where layout-free
  rules are meaningful, while the Playwright run covers layout-dependent
  rules (contrast, scrollable regions, landmark uniqueness) in a real
  browser.

## 0.3.2

### Patch Changes

- e5196a7: LineChart, BarChart, ScatterChart, RadarChart, GeoChart, and DonutChart: the sr-only accessibility fallback `<table>` now uses `display: block` so its intrinsic table-layout size doesn't contribute to the parent container's `scrollHeight` in Chromium. Firefox was unaffected. Also replaces the deprecated `clip: rect(…)` with `clip-path: inset(50%)`. No API change.

## 0.3.1

### Patch Changes

- ee7a6ff: `LineChart`: the leftmost visible x-axis label now anchors to `start` and the
  rightmost to `end`, so wide labels (e.g. full ISO dates) no longer extend
  past the plot area and overlap the chart's container border. Middle labels
  stay centered as before.

## 0.3.0

### Minor Changes

- 4b6b438: Chart components (`LineChart`, `BarChart`, `ScatterChart`, `RadarChart`) now
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

## 0.2.0

### Minor Changes

- 77ccc47: Adopt `asChild` across overlay triggers (Radix-style). Deprecates the render-prop child signature previously used on Dialog, AlertDialog, Tooltip, and DropdownMenu triggers.

  **Breaking:** render-prop form is removed from `Dialog.Trigger`, `Dialog.Close`, `AlertDialog.Trigger`, `Tooltip.Trigger`, and `DropdownMenu.Trigger`. Use `asChild` instead.

  **New:** `asChild` prop added to:

  - `Popover.Trigger`, `Popover.Close` (fixes nested-button bug #20)
  - `DropdownMenu.Trigger`
  - `Dialog.Trigger`, `Dialog.Close`
  - `AlertDialog.Trigger`, `AlertDialog.Action`, `AlertDialog.Cancel`
  - `Tooltip.Trigger`

  ### Migration

  ```tsx
  // Before
  <Dialog.Trigger>
    {(props) => <Button {...props}>Open</Button>}
  </Dialog.Trigger>

  // After
  <Dialog.Trigger asChild>
    <Button>Open</Button>
  </Dialog.Trigger>
  ```

  Popover consumers who were passing a `<button>` as `children` — previously producing an invalid nested-button DOM — should now pass `asChild`:

  ```tsx
  // Before (rendered <button><button>Open</button></button>)
  <Popover.Trigger>
    <button className="my-btn">Open</button>
  </Popover.Trigger>

  // After
  <Popover.Trigger asChild>
    <button className="my-btn">Open</button>
  </Popover.Trigger>
  ```

  ### Scope

  `asChild` is intentionally limited to parts where the consumer owns the interactive element (Trigger / Close / action buttons). Design-owning parts — Content, Item, Label, Arrow, Overlay, Title, Description, Header, and the default Collapsible/Tabs/Accordion triggers — do **not** accept `asChild` and will continue to render raster's built-in design.

## 0.1.1

### Patch Changes

- d90f3ea: Add `renderLink` prop to `Breadcrumbs` for router integration.

  `Breadcrumbs` now accepts an optional `renderLink` prop — a component of type `ComponentType<{ href: string; className: string; children: ReactNode }>` — used to render non-current items with an `href`. This lets consumers plug in a router-aware link (React Router `Link`, Next `Link`, TanStack Router, etc.) for client-side navigation without `Breadcrumbs` depending on any specific router. The current item and items without an `href` remain plain `<span>`s. When `renderLink` is not provided, non-current items fall back to plain `<a>` tags, so existing usage is unaffected.
