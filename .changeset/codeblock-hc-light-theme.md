---
"@eekodigital/raster-docs": patch
---

Docs: high-contrast mode now uses `github-light-high-contrast` for codeblocks
so the codeblock no longer inverts against the white HC page background. Adds
a regression test that asserts codeblock backgrounds follow `[data-theme]` and
that light + HC share a light-bg codeblock theme.
