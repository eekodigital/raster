---
"@eekodigital/raster": minor
---

`Pagination` gains SSR-friendly anchor mode and an optional item-range caption.

- Pass `getHref: (page: number) => string` instead of `onPageChange` to render prev/next and page-number controls as real `<a href>` links. Works without JavaScript and is crawlable, which makes this the right shape for server-rendered public feeds where the URL is the source of truth. The current page renders as a `<span aria-current="page">` rather than a self-link; disabled prev/next render as `<span aria-disabled="true">`.
- Pass `itemRange={{ from, to, total }}` alongside either mode to render a live-announced `Items X–Y of N` caption below the pager. Handy on admin lists and public feeds where users want to see the full size of the data set.
- `onPageChange` continues to work unchanged for client-driven use. The two modes are mutually exclusive at the type level (discriminated union).
