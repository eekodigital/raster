---
"@eekodigital/raster": patch
---

Respect `prefers-reduced-motion` in `Spinner`, `Skeleton`, and `Toast`. These
three components were the only animated components without a reduce-motion
guard — the spin, shimmer, and slide animations now pause when the user has
requested reduced motion, matching the behaviour of the chart and gauge
components.
