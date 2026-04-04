import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/**
 * Accessibility checks for the design system docs.
 * One page per section + the pages most likely to have issues (interactive demos,
 * overlays, form controls). Axe runs after JS hydration so React-rendered demos
 * are included in the scan.
 */
const PAGES = [
  // Site shell
  { label: "Homepage", path: "/" },

  // Foundations
  { label: "Colours", path: "/foundations/colours" },
  { label: "Typography (foundations)", path: "/foundations/typography" },

  // Layout
  { label: "Box", path: "/components/box" },

  // Actions
  { label: "Button", path: "/components/buttons" },

  // Form — base controls
  { label: "TextInput", path: "/components/text-input" },
  { label: "Textarea", path: "/components/textarea" },
  { label: "Select", path: "/components/select" },

  // Form — field wrappers
  { label: "DateInput", path: "/components/date-input" },
  { label: "Checkbox", path: "/components/checkboxes" },
  { label: "Radio", path: "/components/radios" },
  { label: "Switch", path: "/components/switch" },

  // Overlays — these have the most complex a11y requirements
  { label: "AlertDialog", path: "/components/alert-dialog" },
  { label: "Dialog", path: "/components/dialog" },
  { label: "DropdownMenu", path: "/components/dropdown-menu" },
  { label: "Popover", path: "/components/popover" },
  { label: "Tooltip", path: "/components/tooltip" },

  // Navigation
  { label: "Breadcrumbs", path: "/components/breadcrumbs" },
  { label: "Tabs", path: "/components/tabs" },

  // Feedback
  { label: "Badge", path: "/components/badge" },
  { label: "NotificationBanner", path: "/components/notification-banner" },
  { label: "Progress", path: "/components/progress" },
  { label: "Toast", path: "/components/toast" },

  // Range inputs
  { label: "Slider", path: "/components/slider" },
  { label: "ScrollArea", path: "/components/scroll-area" },

  // Display
  { label: "Accordion", path: "/components/accordion" },
  { label: "Avatar", path: "/components/avatar" },
  { label: "Collapsible", path: "/components/collapsible" },
  { label: "Details", path: "/components/details" },
  { label: "Separator", path: "/components/separator" },
  { label: "Skeleton", path: "/components/skeleton" },
  { label: "SummaryList", path: "/components/summary-list" },
  { label: "Table", path: "/components/tables" },
  { label: "DataTable", path: "/components/data-table" },
  { label: "Heading & Text", path: "/components/typography" },

  // Charts
  { label: "BarChart", path: "/components/bar-chart" },
  { label: "DonutChart", path: "/components/donut-chart" },
  { label: "Gauge", path: "/components/gauge" },
  { label: "GeoChart", path: "/components/geo-chart" },
  { label: "LineChart", path: "/components/line-chart" },
  { label: "LinearGauge", path: "/components/linear-gauge" },
  { label: "RadarChart", path: "/components/radar-chart" },
  { label: "Sparkline", path: "/components/sparkline" },

  // Layout
  { label: "Flex", path: "/components/flex" },
  { label: "Grid", path: "/components/grid" },

  // Forms — additional
  { label: "FileUpload", path: "/components/file-upload" },
  { label: "Fieldset", path: "/components/fieldset" },
  { label: "OTPField", path: "/components/otp-field" },
  { label: "PasswordToggleField", path: "/components/password-toggle-field" },
  { label: "Pagination", path: "/components/pagination" },
  { label: "SkipLink", path: "/components/skip-link" },
  { label: "Spinner", path: "/components/spinner" },
  { label: "Tag", path: "/components/tags" },
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
