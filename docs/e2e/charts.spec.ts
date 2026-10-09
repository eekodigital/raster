import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

/**
 * Chart behaviour in a real browser: keyboard, table disclosure, SSR sizing,
 * forced colours and reduced motion. Unit tests cover roles and names per
 * chart; these cover what happy-dom can't (focus, CSS, media emulation).
 */

const figure = (page: Page, name: string) => page.getByRole("figure", { name });

test.describe("keyboard", () => {
  test("LineChart: one tab stop, arrows, selection and Escape", async ({ page }) => {
    await page.goto("/components/line-chart");
    const chart = figure(page, "Results trend (select a point)");
    const first = chart.getByRole("button", { name: "Pass, Jan: 0, 1 of 6" });
    await first.focus();
    await page.keyboard.press("ArrowRight");
    const feb = chart.getByRole("button", { name: "Pass, Feb: 5, 2 of 6" });
    await expect(feb).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await expect(chart.getByRole("button", { name: "Fail, Feb: 1, 2 of 6" })).toBeFocused();
    await page.keyboard.press("End");
    await expect(chart.getByRole("button", { name: "Fail, Jun: 8, 6 of 6" })).toBeFocused();

    await page.keyboard.press("Enter");
    const jun = chart.getByRole("button", { name: "Fail, Jun: 8, 6 of 6" });
    await expect(jun).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByText("Selected: Fail, Jun")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(jun).toHaveAttribute("aria-pressed", "false");
    await expect(chart.getByRole("status")).toHaveText("Selection cleared");

    // Only the last-visited mark is in the tab order.
    await expect(chart.locator('[tabindex="0"]')).toHaveCount(1);
    await expect(jun).toHaveAttribute("tabindex", "0");
  });

  test("LineChart dense mode: one slider, arrows, pointer, selection", async ({ page }) => {
    await page.goto("/components/line-chart");
    const chart = figure(page, "Daily traffic, 2025–2026");
    const slider = chart.getByRole("slider", { name: "Views" });
    await expect(chart.locator('input, [tabindex="0"]')).toHaveCount(1);

    await slider.focus();
    await expect(slider).toHaveAttribute(
      "aria-valuetext",
      /^Views, 1 January 2025: \d+, 1 of 730$/,
    );
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("PageDown");
    await expect(slider).toHaveAttribute(
      "aria-valuetext",
      /^Views, 12 January 2025: \d+, 12 of 730$/,
    );
    await expect(chart.locator(".raster-line__marker[data-focused]")).toBeVisible();
    // The focus ring is drawn centred on the marker.
    const ring = (await chart.locator(".raster-line__ring").boundingBox())!;
    const dot = (await chart.locator(".raster-line__marker").boundingBox())!;
    expect(Math.abs(ring.x + ring.width / 2 - (dot.x + dot.width / 2))).toBeLessThan(1);
    expect(Math.abs(ring.y + ring.height / 2 - (dot.y + dot.height / 2))).toBeLessThan(1);
    await page.keyboard.press("ArrowDown");
    await expect(chart.getByRole("slider", { name: "Visitors" })).toBeFocused();

    await page.keyboard.press("Enter");
    await expect(page.getByText(/^Selected: Visitors, \d+$/)).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByText("Nothing selected").last()).toBeVisible();

    // Pointer: hovering the middle of the plot shows the tooltip for a mid-range point.
    const hit = chart.locator(".raster-line__hit");
    await hit.hover();
    const tip = chart.locator(".raster-tooltip");
    await expect(tip).toHaveAttribute("data-visible", "true");
    await expect(tip).toHaveText(/^(Views|Visitors), \d+ \w+ 202[56]: \d+, \d+ of 730$/);
  });

  test("reference lines don't block the pointer on marks underneath", async ({ page }) => {
    // Bars grow in; with reduced motion they're drawn at full height at once.
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/components/bar-chart");
    const chart = figure(page, "Issues fixed this week");
    await chart.scrollIntoViewIfNeeded();
    // The dashed line crosses Thursday's bar (45, over the goal of 40). The
    // line ignores the pointer, so point at the crossing rather than hover it.
    const bar = (await chart.getByRole("img", { name: /^Thu/ }).boundingBox())!;
    const line = (await chart.locator(".raster-chart__reference-line").boundingBox())!;
    await page.mouse.move(bar.x + bar.width / 2, line.y + line.height / 2);
    await expect(chart.locator(".raster-tooltip")).toHaveAttribute("data-visible", "true");
    await expect(chart.locator(".raster-tooltip")).toHaveText(/^Thu/);
  });

  test("BarChart: stacked bars are navigable and select a category", async ({ page }) => {
    await page.goto("/components/bar-chart");
    const chart = figure(page, "Sales by region (select a bar)");
    await chart.getByRole("button", { name: "North, Q1: 12, 1 of 3" }).focus();
    await page.keyboard.press("ArrowUp");
    const southQ1 = chart.getByRole("button", { name: "South, Q1: 8, 1 of 3" });
    await expect(southQ1).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press(" ");
    await expect(chart.getByRole("button", { name: "South, Q2: 11, 2 of 3" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(page.getByText("Selected: South, Q2")).toBeVisible();
  });

  test("GeoChart: regions are reachable by arrow keys, markers by ArrowDown", async ({ page }) => {
    await page.goto("/components/geo-chart");
    const map = figure(page, "Office locations");
    await map.locator('.raster-geo__region[tabindex="0"]').focus();
    const start = await page.evaluate(() => document.activeElement?.getAttribute("aria-label"));
    await page.keyboard.press("ArrowRight");
    const next = await page.evaluate(() => document.activeElement?.getAttribute("aria-label"));
    expect(next).not.toBe(start);
    expect(next).toMatch(/, 2 of \d+$/);
    await page.keyboard.press("ArrowDown");
    await expect(map.getByRole("img", { name: /^Markers, / }).nth(1)).toBeFocused();
  });
});

test("data table disclosure shows a captioned table", async ({ page }) => {
  await page.goto("/components/line-chart");
  await page.waitForLoadState("networkidle"); // hydrated, so the label follows the state
  const chart = figure(page, "Assessment progress over time");
  const toggle = chart.locator("summary", { hasText: "Show data table" });
  await expect(chart.getByRole("table")).toBeHidden();
  await toggle.click();
  await expect(chart.locator("summary")).toHaveText("Hide data table");
  const table = chart.getByRole("table", { name: "Data for Assessment progress over time" });
  await expect(table).toBeVisible();
  await expect(table.getByRole("rowheader", { name: "Week 6" })).toBeVisible();
});

test("the data table opens without JavaScript", async ({ browser }) => {
  const page = await browser.newPage({ javaScriptEnabled: false });
  await page.goto("/components/line-chart");
  const chart = figure(page, "Assessment progress over time");
  await chart.locator("summary", { hasText: "Show data table" }).click();
  const table = chart.getByRole("table", { name: "Data for Assessment progress over time" });
  await expect(table).toBeVisible();
  await expect(table.getByRole("rowheader", { name: "Week 6" })).toBeVisible();
  await page.close();
});

test.describe("server rendering", () => {
  test("the plot box is the same size before and after hydration", async ({ browser }) => {
    const box = async (javaScriptEnabled: boolean) => {
      const context = await browser.newContext({ javaScriptEnabled });
      const page = await context.newPage();
      await page.goto("/components/line-chart");
      if (javaScriptEnabled) await page.waitForLoadState("networkidle");
      const plot = figure(page, "Assessment progress over time").locator(".raster-chart__plot");
      const b = await plot.boundingBox();
      await context.close();
      return b;
    };
    const ssr = await box(false);
    const hydrated = await box(true);
    expect(ssr?.height).toBeGreaterThan(0);
    expect(hydrated).toEqual(ssr);
  });
});

test.describe("marks in a real browser", () => {
  test.use({ colorScheme: "light" });

  const opacity = (page: Page, selector: string) =>
    page
      .locator(selector)
      .first()
      .evaluate((el) => getComputedStyle(el).opacity);

  test("areas keep their opacity after fading in, and selection dims other points", async ({
    page,
  }) => {
    await page.goto("/components/line-chart");
    await page.waitForLoadState("networkidle");
    const area = figure(page, "Assessment progress (area)").locator(".raster-line__area");
    await expect.poll(() => area.evaluate((el) => getComputedStyle(el).opacity)).toBe("0.15");

    const chart = figure(page, "Results trend (select a point)");
    await chart.getByRole("button", { name: "Pass, Jan: 0, 1 of 6" }).focus();
    await page.keyboard.press("Enter");
    const other = chart.getByRole("button", { name: "Pass, Feb: 5, 2 of 6" });
    await expect.poll(() => other.evaluate((el) => getComputedStyle(el).opacity)).toBe("0.3");
    expect(await opacity(page, ".raster-line__point[data-selected]")).toBe("1");
  });

  test("the tooltip stays inside the chart at the rightmost point", async ({ page }) => {
    await page.goto("/components/line-chart");
    await page.waitForLoadState("networkidle");
    const chart = figure(page, "Results trend by status");
    await chart.getByRole("img", { name: "N/A, Jun: 12, 6 of 6" }).hover();
    const tip = chart.locator(".raster-tooltip[data-visible]");
    await expect(tip).toHaveCount(1);
    const plot = await chart.locator(".raster-chart__plot").boundingBox();
    await expect
      .poll(async () => {
        const b = await tip.boundingBox();
        return b!.x + b!.width;
      })
      .toBeLessThanOrEqual(plot!.x + plot!.width + 0.5);
    // Escape dismisses it without moving focus or the pointer (WCAG 1.4.13).
    await chart.getByRole("img", { name: "N/A, Jun: 12, 6 of 6" }).focus();
    await page.keyboard.press("Escape");
    await expect(tip).toHaveCount(0);
  });

  test("a focused point has a surface halo inside a focus-coloured ring", async ({ page }) => {
    await page.goto("/components/line-chart");
    await page.waitForLoadState("networkidle");
    const chart = figure(page, "Results trend (select a point)");
    const first = chart.getByRole("button", { name: "Pass, Jan: 0, 1 of 6" });
    await first.focus();
    await page.keyboard.press("ArrowRight");
    const feb = chart.getByRole("button", { name: "Pass, Feb: 5, 2 of 6" });
    await expect(feb).toBeFocused();
    const { outline, stroke, fill } = await feb.evaluate((el) => {
      const cs = getComputedStyle(el);
      return { outline: cs.outlineStyle, stroke: cs.stroke, fill: cs.fill };
    });
    expect(outline).toBe("solid");
    expect(stroke).not.toBe(fill);
  });
});

test.describe("wrapping other charts", () => {
  test("ChartFrame names, describes and tables a canvas chart", async ({ page }) => {
    await page.goto("/guides/wrapping");
    const chart = figure(page, "Views this week (canvas)");
    await expect(chart).toHaveAccessibleDescription(
      "Line chart, 7 points. Mon to Sun. Values from 340 to 610.",
    );
    await expect(chart.locator("canvas")).toBeVisible();
    await chart.locator("summary", { hasText: "Show data table" }).click();
    await expect(chart.getByRole("table")).toContainText("Data for Views this week (canvas)");
  });
});

test.describe("export", () => {
  test("/export downloads the chart a ref points at", async ({ page }) => {
    await page.goto("/guides/exporting");
    const download = page.waitForEvent("download");
    await page.getByRole("button", { name: "Download SVG", exact: true }).click();
    const file = await download;
    expect(file.suggestedFilename()).toBe("visitors.svg");
    const svg = await (await file.createReadStream()).toArray();
    expect(Buffer.concat(svg).toString()).toMatch(/^<svg[^>]*aria-roledescription="chart"/);
  });
});

test.describe("focus ring", () => {
  for (const reducedMotion of ["reduce", "no-preference"] as const) {
    test(`the tooltip clears a focused point's ring (motion: ${reducedMotion})`, async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion });
      await page.goto("/components/line-chart");
      const chart = figure(page, "Results trend by status");
      const point = chart.locator(".raster-line__point").nth(2);
      await point.scrollIntoViewIfNeeded();
      await page.waitForTimeout(1200); // let the draw-in finish
      await point.focus();
      await page.waitForTimeout(300); // and the focus scale
      const box = (await point.boundingBox())!;
      const tip = (await chart.locator(".raster-tooltip").boundingBox())!;
      // The ring is a 2 px outline 1 px outside the point.
      expect(tip.y + tip.height).toBeLessThanOrEqual(box.y - 3);
    });
  }
});

test.describe("forced colours", () => {
  test.use({ colorScheme: "light" });

  test("reference lines stay dashed in system colours", async ({ page }) => {
    await page.emulateMedia({ forcedColors: "active" });
    await page.goto("/components/line-chart");
    const line = figure(page, "Assessment progress against target").locator(
      ".raster-chart__reference-line",
    );
    // A horizontal line has no height, so check it's there and styled, not "visible".
    await expect(line).toHaveCount(1);
    const style = await line.evaluate((el) => {
      const cs = getComputedStyle(el);
      const probe = document.createElement("span");
      probe.style.color = "CanvasText";
      document.body.append(probe);
      const canvasText = getComputedStyle(probe).color;
      probe.remove();
      return { dash: cs.strokeDasharray, stroke: cs.stroke, canvasText };
    });
    expect(style.dash).not.toBe("none");
    expect(style.stroke).toBe(style.canvasText);
  });

  test("series use system colours, dash patterns and marker shapes", async ({ page }) => {
    await page.emulateMedia({ forcedColors: "active" });
    await page.goto("/components/line-chart");
    await page.waitForLoadState("networkidle");
    const chart = figure(page, "Results trend by status");
    const style = (selector: string, prop: string) =>
      chart
        .locator(selector)
        .first()
        .evaluate((el, p) => getComputedStyle(el).getPropertyValue(p), prop);

    const canvasText = await page.evaluate(() => {
      const probe = document.createElement("span");
      probe.style.color = "CanvasText";
      document.body.append(probe);
      const c = getComputedStyle(probe).color;
      probe.remove();
      return c;
    });

    expect(await style('[data-series="1"] > .raster-line__line', "stroke")).toBe(canvasText);
    expect(await style('[data-series="1"] > .raster-line__line', "stroke-dasharray")).toBe("none");
    expect(await style('[data-series="2"] > .raster-line__line', "stroke-dasharray")).toBe(
      "6px, 3px",
    );
    expect(await style('[data-series="3"] > .raster-line__line', "stroke-dasharray")).toBe(
      "2px, 2px",
    );

    const shape = (series: number) =>
      chart.locator(`[data-series="${series}"] > .raster-line__point`).first().getAttribute("d");
    const shapes = await Promise.all([shape(1), shape(2), shape(3)]);
    expect(new Set(shapes).size).toBe(3);

    const results = await new AxeBuilder({ page }).include(".raster-chart").analyze();
    expect(results.violations).toEqual([]);
  });
});

test.describe("forced colours: bars", () => {
  test.use({ colorScheme: "light" });

  test("stacked bar series after the first are outlined with their legend dash", async ({
    page,
  }) => {
    await page.emulateMedia({ forcedColors: "active" });
    await page.goto("/components/bar-chart");
    await page.waitForLoadState("networkidle");
    const chart = figure(page, "Sales by region (select a bar)");
    const style = (selector: string, prop: string) =>
      chart
        .locator(selector)
        .first()
        .evaluate((el, p) => getComputedStyle(el).getPropertyValue(p), prop);
    expect(await style('[data-series="1"] > .raster-bar__bar', "stroke-dasharray")).toBe("none");
    const bar2 = await style('[data-series="2"] > .raster-bar__bar', "stroke-dasharray");
    expect(bar2).toBe("6px, 3px");
    expect(await style('.raster-legend__swatch[data-series="2"] line', "stroke-dasharray")).toBe(
      bar2,
    );
  });
});

test.describe("reduced motion", () => {
  test("donut segments are drawn without animation", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/components/donut-chart");
    const segment = page.locator(".raster-donut__segment").first();
    await expect(segment).toBeVisible();
    const { animation, offset } = await segment.evaluate((el) => {
      const cs = getComputedStyle(el);
      return { animation: cs.animationName, offset: cs.strokeDashoffset };
    });
    expect(animation).toBe("none");
    expect(offset).toBe("0px");
  });

  test("line draw-in and bar growth are off", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/components/line-chart");
    const name = (sel: string) =>
      page
        .locator(sel)
        .first()
        .evaluate((el) => getComputedStyle(el).animationName);
    expect(await name(".raster-line__line")).toBe("none");
    expect(await name(".raster-line__point")).toBe("none");
    await page.goto("/components/bar-chart");
    expect(await name(".raster-bar__bar")).toBe("none");
  });

  test("with motion allowed, the donut animates", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/components/donut-chart");
    const animation = await page
      .locator(".raster-donut__segment")
      .first()
      .evaluate((el) => getComputedStyle(el).animationName);
    expect(animation).toBe("raster-donut-draw");
  });
});
