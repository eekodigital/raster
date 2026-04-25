---
"@eekodigital/raster": patch
---

Dark theme surfaces, borders, and text-grays now reference the cool **slate** primitives instead of the warm-leaning **gray** scale. The previous dark mode read as muted brown/khaki rather than a true neutral; switching to slate gives the surfaces the cool slate cast that "dark mode" usually implies.

Affected tokens (dark theme only): `--color-bg`, `--color-surface`, `--color-surface-raised`, `--color-surface-overlay`, `--color-border`, `--color-border-strong`, `--color-text`, `--color-text-subtle`, `--color-text-placeholder`, `--color-text-disabled`, `--color-text-inverse`, `--color-interactive-text`, `--color-inactive`, `--color-inactive-bg`, `--color-inactive-border`.

Light theme and high-contrast theme are unchanged. Interactive (blue), success (green), danger (red), and warning (amber) hues are unchanged in dark mode.
