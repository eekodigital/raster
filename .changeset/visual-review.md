---
"@eekodigital/raster": patch
---

**Axis labels, reference lines and maps fit their charts.** From a visual review of the docs site at desktop and phone widths:

- **Axis labels never overlap.** Category labels (LineChart) thin to the smallest even step whose labels fit, measured by their estimated width. They no longer use a fixed 30 px, which let "Week 1" and "Week 2" overlap on a phone. `xLabelMinSpacing` no longer has a default; set it to space ticks further apart. BarChart rotates its labels when they're wider than a bar's slot (not by bar count), sizes the room for them from the longest label, and cuts very long labels with an ellipsis. Horizontal bars get a left margin to fit their labels.
- **Date ticks are evenly spaced.** `timeAxis` picks the finest even step that fits: 1 or 2 days, 1 or 2 weeks, 1, 2, 3 or 6 months, then years. It no longer drops a single tick beside a wide edge label, which left a gap (Jan 2025, Jul, Oct…).
- **Reference line labels keep clear of the data.** A label tries the right end then the left, above the line then below, and takes the first spot clear of lines, bars and points. With none clear, it takes the spot covering the least.
- **Value axes end on a tick.** LineChart, BarChart and ScatterChart round their value scale out to whole ticks, so no point or bar is beyond the last gridline. ScatterChart also leaves a little room, so no point sits on an axis.
- **GeoChart fits the map to the plot** in both directions, centred, instead of fitting the width and spilling over the title and legend. A `filter`ed map zooms to the regions it draws. Mercator latitudes are clamped to ±85°, as web maps do. Custom projection functions are unchanged. The colour legend stays on one row.
- **RadarChart's axis labels sit beside the web,** anchored away from the centre. The margin fits the longest side label, up to 30% of the chart.
