---
"@eekodigital/raster": minor
---

**Dense mode for long LineChart series.** Above 200 points in a series (configurable with `dense`), each series is drawn as one downsampled path with no per-point marks, and a single slider steps through the points.

At 1,000 points the server HTML drops from about 310 KB to 62 KB, with the SVG going from 261 KB to 13 KB. There is one focusable control instead of 1,000.

### Added

- LineChart `dense?: boolean | number`. A number sets the threshold; `true` or `false` forces dense mode on or off.
- In dense mode:
  - **Slider:** a visually hidden `<input type="range">` named by the series, with `aria-valuetext` naming the current point ("Views, 3 October 2026: 42, 3 of 1,000").
  - **Keys:** the same as other charts. ← / →, Home / End and PageUp / PageDown move between points, ↑ / ↓ move between series, Enter / Space select (", selected" is added to the value), and Escape clears.
  - **Marker:** a marker with a drawn focus ring shows the current point.
  - **Pointer:** hovering over the plot moves to the nearest point (binary search on x) and shows the tooltip; clicking selects it.
  - **Drawing:** lines are 1.5 px, at most four points per pixel column (first, lowest, highest, last), with coordinates to 0.1 px. Smooth curves are drawn straight. A point left on its own by a gap still gets a dot.
  - **Still in the HTML:** the summary and data table.
- `labels.selected` ("selected").
- `ChartFrame` takes an `overlay`. It's internal for now.
