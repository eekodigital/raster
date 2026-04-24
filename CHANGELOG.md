# @eekodigital/raster

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
