---
"@eekodigital/raster": patch
---

Add `renderLink` prop to `Breadcrumbs` for router integration.

`Breadcrumbs` now accepts an optional `renderLink` prop — a component of type `ComponentType<{ href: string; className: string; children: ReactNode }>` — used to render non-current items with an `href`. This lets consumers plug in a router-aware link (React Router `Link`, Next `Link`, TanStack Router, etc.) for client-side navigation without `Breadcrumbs` depending on any specific router. The current item and items without an `href` remain plain `<span>`s. When `renderLink` is not provided, non-current items fall back to plain `<a>` tags, so existing usage is unaffected.
