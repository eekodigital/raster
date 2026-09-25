---
"@eekodigital/raster": major
---

**Raster 3 is a charts library.** The UI components, design tokens and DataTable have been removed; charts are unchanged in their props but are now themed through a small `--raster-*` contract and styled by one stylesheet.

The 2.x source and docs remain at the `v2.0.1` git tag, and `2.0.1` stays on npm.

### Removed

- Every non-chart component: Accordion, AlertDialog, Avatar, Badge, Box, Breadcrumbs, Button, Card, Checkbox, Collapsible, DateInput, Details, Dialog, DropdownMenu, ErrorSummary, Fieldset, FileUpload, Flex, Grid, NotificationBanner, OneTimePasswordField, Pagination, PasswordToggleField, Popover, Portal, Progress, Radio, ScrollArea, SegmentedButtons, Select, Separator, Skeleton, SkipLink, Slider, Spinner, SummaryList, Switch, Table, Tabs, Tag, Textarea, TextInput, Toast, Tooltip, Typography.
- `DataTable` and the `@eekodigital/raster/data-table` entry.
- `@eekodigital/raster/tokens.css` and `@eekodigital/raster/primitives.css`.

### Added

- `@eekodigital/raster/styles.css`: the single stylesheet. The package is now `sideEffects: false`; no JS entry imports CSS.
- `@eekodigital/raster/theme`: `rasterVars`, the typed theming contract.
- Per-chart entry points: `/line-chart`, `/bar-chart`, `/donut-chart`, `/scatter-chart`, `/sparkline`, `/gauge`, `/linear-gauge`, `/radar-chart`, `/chart-tooltip`.
- `ChartTooltip` and `useChartTooltip` are exported.
- Forced-colours styles: system colours, with per-series dash patterns.

### Migration guide

1. **Load the stylesheet once** at your app root and drop the tokens import:

   ```diff
   - import "@eekodigital/raster/tokens.css";
   + import "@eekodigital/raster/styles.css";
   ```

   Chart CSS is no longer injected on import, so remove any bare `import "@eekodigital/raster"` side-effect imports. Class names are now stable (`raster-*`), so remove `[class*="LineChart_…"]`-style overrides.

2. **Map your theme onto the chart contract.** Charts no longer read `--color-*`, `--font-*` or `--spacing-*`:

   | v2 token                                                     | v3 property                                 |
   | ------------------------------------------------------------ | ------------------------------------------- |
   | `--color-text`                                               | `--raster-text` (and `--raster-tooltip-bg`) |
   | `--color-text-subtle`                                        | `--raster-text-subtle`                      |
   | `--color-text-inverse`                                       | `--raster-tooltip-text`                     |
   | `--color-border`                                             | `--raster-grid`, `--raster-axis`            |
   | `--color-focus-ring`                                         | `--raster-focus`                            |
   | `--color-surface`                                            | `--raster-surface`                          |
   | default series (`--color-interactive`, `--color-success`, …) | `--raster-series-1` … `--raster-series-8`   |

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
