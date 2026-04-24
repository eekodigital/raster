---
"@eekodigital/raster": patch
---

`Pagination` now uses `←` and `→` for the prev/next glyphs instead of `‹` and `›`.

The single-angle-quotation-mark glyphs (U+2039 / U+203A) were hard to read at the component's default size and visually ambiguous with actual quotation marks — particularly on serif surfaces. Swapped to unambiguous left/right arrows (U+2190 / U+2192). `aria-label` text (`Previous page`, `Next page`) is unchanged, so screen-reader behaviour is identical.
