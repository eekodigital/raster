---
"@eekodigital/raster": patch
---

Add unit-level axe assertions (via vitest-axe) to the compound-component
test suites: Dialog, AlertDialog, DropdownMenu, Popover, Tooltip, Toast,
NotificationBanner, and ErrorSummary. Complements the Playwright axe
suite — catches a11y regressions at the vitest layer where layout-free
rules are meaningful, while the Playwright run covers layout-dependent
rules (contrast, scrollable regions, landmark uniqueness) in a real
browser.
