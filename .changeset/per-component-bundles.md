---
"@eekodigital/raster": major
---

Per-component bundles — each component's CSS now ships only when its component is imported.

The previous build produced a single `dist/index.mjs` that hoisted side-effect CSS imports for every component to the top of the entry. Any named import from the package (e.g. `import { Pagination } from "@eekodigital/raster"`) pulled in the chart, gauge, breadcrumb, etc. CSS regardless of whether those components were used. On a consuming app's home page that only used `Pagination`, this added ~70 KB of unused CSS (≈12 KB gzipped) to the critical path.

`tsdown.config.ts` now emits one bundle per component (`dist/components/Pagination/Pagination.mjs`, etc.) and tsdown auto-creates per-component chunks that each side-effect-load only their own `.vanilla.css`. The barrel `dist/index.mjs` becomes pure re-exports, so a consumer's bundler can tree-shake to exactly the components they actually use.

`sideEffects` widened from `["*.css"]` to `["**/*.css"]` so the globstar matches the nested `dist/assets/**` paths produced by the new chunked layout — without it, bundlers might tree-shake away the CSS imports.

### Breaking change

The intended public API (named imports from `@eekodigital/raster`) is unchanged. The breaking part is the side-effect behaviour: consumers who relied on the spillover — using a Raster component's CSS class names directly without importing the component — will see broken styles. Anyone using the documented imports is unaffected.

If you hit missing styles after upgrading, the fix is to import the relevant component explicitly so its CSS comes along.
