import { test, expect } from "@playwright/test";

/**
 * Codeblock theming switches with [data-theme] on <html>, and the high-contrast
 * variant uses a light-bg theme so it doesn't invert against the white HC page.
 */
test("codeblocks follow [data-theme] without inverting against page bg", async ({ page }) => {
  await page.goto("/foundations/theming/");

  async function snapshot(theme: "light" | "dark" | "high-contrast") {
    await page.evaluate((t) => {
      document.documentElement.dataset["theme"] = t;
    }, theme);
    return page.evaluate(() => {
      const pre = document.querySelector(".expressive-code pre")!;
      const code = pre.querySelector("code")!;
      const tokenSpan = pre.querySelector(
        '.ec-line .code span[style*="--"]:not([class])',
      ) as HTMLElement | null;
      const body = document.body;
      return {
        bodyBg: getComputedStyle(body).backgroundColor,
        preBg: getComputedStyle(pre).backgroundColor,
        codeFg: getComputedStyle(code).color,
        tokenColor: tokenSpan ? getComputedStyle(tokenSpan).color : null,
      };
    });
  }

  const light = await snapshot("light");
  const dark = await snapshot("dark");
  const hc = await snapshot("high-contrast");

  // Codeblock bg actually changes with theme.
  expect(light.preBg).not.toBe(dark.preBg);
  expect(dark.preBg).not.toBe(hc.preBg);
  // Syntax tokens follow the theme.
  expect(light.tokenColor).not.toBe(dark.tokenColor);
  // Light + HC both use a light-bg codeblock theme (no inversion vs white page).
  expect(hc.preBg).toBe(light.preBg);
  // Dark page → dark codeblock; light page → light codeblock.
  expect(dark.bodyBg).not.toBe(dark.preBg.replace("rgb", "rgba").replace(")", ", 1)"));
});
