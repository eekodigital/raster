---
"@eekodigital/raster": major
---

**Chart names are worked out once, and translated in one place.**

### Changed (breaking)

- `labels.summary` receives a ready-made `name` ("Line chart", or a wrapped chart's own name such as "Heatmap"), worked out from the new `labels.chartNames`. `type` can now be missing (for charts raster doesn't draw), so a custom summary that looked up `type` should use `name` instead, and its chart names move to `chartNames`. See "Migrating from v3 to v4".
- The `labels` prop's type is `ChartLabelOverrides`: any `ChartLabels` key, with `chartNames` merged one name at a time.
- `XAxis.at` and `XAxis.format` are required (`timeAxis` provides them).

### Added

- `labels.chartNames`, and `describeChart({ name: "Heatmap", … })` without a `type`.
- The `ChartLabelOverrides` and `ResolvedSummaryParts` types.
