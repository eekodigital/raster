# @eekodigital/raster

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
