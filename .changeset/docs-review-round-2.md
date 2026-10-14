---
"@eekodigital/raster": minor
---

**Dark themes, your own controls beside the data table, and tighter value axes.**

- **Dark themes work without setting `color-scheme`.** Charts inside an element with a `dark` class or `data-theme="dark"` (Tailwind's `dark` class, most theme switchers) use the dark palette, surface and tooltip. A `light` class or `data-theme="light"` inside one switches back; the nearest wins. `color-scheme` still works as before, and one set on a chart wins.
- **`actions`** puts your own controls, such as download buttons, on the same row as the **Show data table** button, inside the chart's figure. The table opens below the whole row.
- **`dataTable="none"`** leaves raster's data table out, for apps that offer the data their own way.
- **Value axes fit their labels.** LineChart, ScatterChart and vertical BarChart size their left margin from the widest tick label (and `yLabel`), instead of a fixed 40–50 px, so short labels no longer sit indented from the title.
- The **Show data table** button has a little more room above it.
