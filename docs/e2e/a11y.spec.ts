import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/**
 * Accessibility checks for the docs: every guide and chart page. Axe runs after JS hydration so React-rendered demos
 * are included in the scan.
 */
const PAGES = [
  // Site shell and guides
  { label: "Homepage", path: "/" },
  { label: "Getting started", path: "/guides/getting-started" },
  { label: "Accessibility", path: "/guides/accessibility" },
  { label: "Theming charts", path: "/guides/theming" },
  { label: "Exporting charts", path: "/guides/exporting" },
  { label: "Comparison", path: "/guides/comparison" },
  { label: "Migrating from v2", path: "/guides/migrating" },

  // Charts
  { label: "BarChart", path: "/components/bar-chart" },
  { label: "ChartTooltip", path: "/components/chart-tooltip" },
  { label: "DonutChart", path: "/components/donut-chart" },
  { label: "Gauge", path: "/components/gauge" },
  { label: "GeoChart", path: "/components/geo-chart" },
  { label: "LineChart", path: "/components/line-chart" },
  { label: "LinearGauge", path: "/components/linear-gauge" },
  { label: "RadarChart", path: "/components/radar-chart" },
  { label: "ScatterChart", path: "/components/scatter-chart" },
  { label: "Sparkline", path: "/components/sparkline" },
];

for (const { label, path } of PAGES) {
  test(`${label} page is accessible`, async ({ page }) => {
    await page.goto(path);
    // Wait for React hydration so demos are fully rendered before axe scans
    await page.waitForLoadState("networkidle");

    const results = await new AxeBuilder({ page })
      // Exclude the Astro dev toolbar if present
      .exclude("astro-dev-toolbar")
      .analyze();

    expect(results.violations).toEqual([]);
  });
}
