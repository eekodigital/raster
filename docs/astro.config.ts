import react from "@astrojs/react";
import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://raster.eeko.digital",
  integrations: [
    starlight({
      title: "Raster",
      expressiveCode: {
        themes: ["github-light-default", "github-dark-default", "github-light-high-contrast"],
        useStarlightDarkModeSwitch: false,
        themeCssRoot: "html",
        themeCssSelector: (theme) => {
          const map: Record<string, string> = {
            "github-light-default": '[data-theme="light"]',
            "github-dark-default": '[data-theme="dark"]',
            "github-light-high-contrast": '[data-theme="high-contrast"]',
          };
          return map[theme.name] ?? `[data-theme="${theme.type}"]`;
        },
      },
      customCss: [
        // The one stylesheet raster ships.
        "@eekodigital/raster/styles.css",
        // Docs-owned mapping of Starlight tokens onto the --raster-* contract.
        "./src/styles/chart-theme.css",
        "./src/styles/custom.css",
      ],
      components: {
        ThemeProvider: "./src/components/ThemeProvider.astro",
        ThemeSelect: "./src/components/ThemeSelect.astro",
      },
      sidebar: [
        {
          label: "Guides",
          items: [
            { label: "Getting started", slug: "guides/getting-started" },
            { label: "Theming charts", slug: "guides/theming" },
            { label: "Exporting charts", slug: "guides/exporting" },
            { label: "Compared with alternatives", slug: "guides/comparison" },
            { label: "Migrating from v2", slug: "guides/migrating" },
          ],
        },
        {
          label: "Charts",
          items: [
            { label: "BarChart", slug: "components/bar-chart" },
            { label: "DonutChart", slug: "components/donut-chart" },
            { label: "Gauge", slug: "components/gauge" },
            { label: "GeoChart", slug: "components/geo-chart" },
            { label: "LineChart", slug: "components/line-chart" },
            { label: "LinearGauge", slug: "components/linear-gauge" },
            { label: "RadarChart", slug: "components/radar-chart" },
            { label: "ScatterChart", slug: "components/scatter-chart" },
            { label: "Sparkline", slug: "components/sparkline" },
            { label: "ChartTooltip", slug: "components/chart-tooltip" },
          ],
        },
      ],
    }),
    react(),
  ],
});
