import react from "@astrojs/react";
import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://raster.eeko.digital",
  integrations: [
    starlight({
      title: "Raster",
      expressiveCode: {
        themes: ["github-light-default", "github-dark-default", "github-dark-high-contrast"],
        useStarlightDarkModeSwitch: false,
        themeCssRoot: "html",
        themeCssSelector: (theme) => {
          const map: Record<string, string> = {
            "github-light-default": '[data-theme="light"]',
            "github-dark-default": '[data-theme="dark"]',
            "github-dark-high-contrast": '[data-theme="high-contrast"]',
          };
          return map[theme.name] ?? `[data-theme="${theme.type}"]`;
        },
      },
      customCss: ["@eekodigital/raster/tokens.css", "./src/styles/custom.css"],
      components: {
        ThemeProvider: "./src/components/ThemeProvider.astro",
        ThemeSelect: "./src/components/ThemeSelect.astro",
      },
      sidebar: [
        {
          label: "Foundations",
          items: [
            { label: "Design principles", slug: "foundations/principles" },
            { label: "Colours", slug: "foundations/colours" },
            { label: "Typography", slug: "foundations/typography" },
          ],
        },
        {
          label: "Layout",
          items: [
            { label: "Box", slug: "components/box" },
            { label: "Flex", slug: "components/flex" },
            { label: "Grid", slug: "components/grid" },
            { label: "ScrollArea", slug: "components/scroll-area" },
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
          ],
        },
        {
          label: "Actions",
          items: [{ label: "Button", slug: "components/buttons" }],
        },
        {
          label: "Forms",
          items: [
            { label: "TextInput", slug: "components/text-input" },
            { label: "Textarea", slug: "components/textarea" },
            { label: "Select", slug: "components/select" },
            { label: "Checkbox", slug: "components/checkboxes" },
            { label: "Radio", slug: "components/radios" },
            { label: "Switch", slug: "components/switch" },
            { label: "Slider", slug: "components/slider" },
            { label: "DateInput", slug: "components/date-input" },
            { label: "FileUpload", slug: "components/file-upload" },
            { label: "OneTimePasswordField", slug: "components/otp-field" },
            { label: "PasswordToggleField", slug: "components/password-toggle-field" },
            { label: "Fieldset", slug: "components/fieldset" },
          ],
        },
        {
          label: "Overlays",
          items: [
            { label: "AlertDialog", slug: "components/alert-dialog" },
            { label: "Dialog", slug: "components/dialog" },
            { label: "DropdownMenu", slug: "components/dropdown-menu" },
            { label: "Popover", slug: "components/popover" },
            { label: "Tooltip", slug: "components/tooltip" },
          ],
        },
        {
          label: "Navigation",
          items: [
            { label: "Breadcrumbs", slug: "components/breadcrumbs" },
            { label: "Pagination", slug: "components/pagination" },
            { label: "SkipLink", slug: "components/skip-link" },
            { label: "Tabs", slug: "components/tabs" },
          ],
        },
        {
          label: "Feedback",
          items: [
            { label: "Badge", slug: "components/badge" },
            { label: "NotificationBanner", slug: "components/notification-banner" },
            { label: "Progress", slug: "components/progress" },
            { label: "Spinner", slug: "components/spinner" },
            { label: "Tag", slug: "components/tags" },
            { label: "Toast", slug: "components/toast" },
          ],
        },
        {
          label: "Display",
          items: [
            { label: "Accordion", slug: "components/accordion" },
            { label: "Avatar", slug: "components/avatar" },
            { label: "Collapsible", slug: "components/collapsible" },
            { label: "Details", slug: "components/details" },
            { label: "Separator", slug: "components/separator" },
            { label: "Skeleton", slug: "components/skeleton" },
            { label: "SummaryList", slug: "components/summary-list" },
            { label: "Table", slug: "components/tables" },
            { label: "DataTable", slug: "components/data-table" },
            { label: "Heading & Text", slug: "components/typography" },
          ],
        },
      ],
    }),
    react(),
  ],
});
