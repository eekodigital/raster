---
"@eekodigital/raster": minor
---

### Added

- Entries that export React components (the main entry, every chart, `/frame`, `/chart-tooltip`, `/geo`) start with `"use client"`, so React Server Components can import them directly. They're still server-rendered. `/time`, `/export` and `/theme` stay unmarked, so server code can call them. CI checks the directive on every built entry.

### Fixed

- The tooltip covered the top of a focused point's focus ring. It now sits 14 px above the mark (was 8 px), clear of the ring even while the focus scale animates.
