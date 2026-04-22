---
"@eekodigital/raster": patch
---

A11y fixes surfaced by the Axe E2E suite, plus the suite is now gated in CI.

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
