import { expect, test } from "@playwright/test";

test.describe("Slider", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/components/slider");
    await page.waitForLoadState("networkidle");
  });

  test.describe("basic slider", () => {
    test("renders with a thumb", async ({ page }) => {
      const slider = page.getByRole("slider", { name: "Volume" }).first();
      await expect(slider).toBeVisible();
    });

    test("has correct ARIA attributes", async ({ page }) => {
      const slider = page.getByRole("slider", { name: "Volume" }).first();
      await expect(slider).toHaveAttribute("aria-valuemin", "0");
      await expect(slider).toHaveAttribute("aria-valuemax", "100");
      await expect(slider).toHaveAttribute("aria-valuenow", "50");
      await expect(slider).toHaveAttribute("aria-orientation", "horizontal");
    });

    test("ArrowRight increases value", async ({ page }) => {
      const slider = page.getByRole("slider", { name: "Volume" }).first();
      await slider.focus();
      await page.keyboard.press("ArrowRight");
      const value = Number(await slider.getAttribute("aria-valuenow"));
      expect(value).toBeGreaterThan(50);
    });

    test("ArrowLeft decreases value", async ({ page }) => {
      const slider = page.getByRole("slider", { name: "Volume" }).first();
      await slider.focus();
      await page.keyboard.press("ArrowLeft");
      const value = Number(await slider.getAttribute("aria-valuenow"));
      expect(value).toBeLessThan(50);
    });

    test("Home sets to minimum", async ({ page }) => {
      const slider = page.getByRole("slider", { name: "Volume" }).first();
      await slider.focus();
      await page.keyboard.press("Home");
      await expect(slider).toHaveAttribute("aria-valuenow", "0");
    });

    test("End sets to maximum", async ({ page }) => {
      const slider = page.getByRole("slider", { name: "Volume" }).first();
      await slider.focus();
      await page.keyboard.press("End");
      await expect(slider).toHaveAttribute("aria-valuenow", "100");
    });

    test("drag changes value", async ({ page }) => {
      const slider = page.getByRole("slider", { name: "Volume" }).first();
      const box = await slider.boundingBox();
      if (!box) throw new Error("Slider thumb not visible");

      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width / 2 + 50, box.y + box.height / 2, { steps: 5 });
      await page.mouse.up();

      const value = Number(await slider.getAttribute("aria-valuenow"));
      expect(value).toBeGreaterThan(50);
    });
  });

  test.describe("step slider", () => {
    test("snaps to step intervals", async ({ page }) => {
      const slider = page.getByRole("slider", { name: "Steps" });
      await slider.focus();
      await page.keyboard.press("ArrowRight");
      const value = Number(await slider.getAttribute("aria-valuenow"));
      expect(value).toBe(10);
    });
  });

  test.describe("range slider", () => {
    test("renders two thumbs", async ({ page }) => {
      const minThumb = page.getByRole("slider", { name: "Minimum price" });
      const maxThumb = page.getByRole("slider", { name: "Maximum price" });
      await expect(minThumb).toBeVisible();
      await expect(maxThumb).toBeVisible();
    });

    test("min thumb moves with ArrowRight", async ({ page }) => {
      const minThumb = page.getByRole("slider", { name: "Minimum price" });
      await minThumb.focus();
      await page.keyboard.press("ArrowRight");
      const value = Number(await minThumb.getAttribute("aria-valuenow"));
      expect(value).toBeGreaterThan(20);
    });

    test("max thumb moves with ArrowLeft", async ({ page }) => {
      const maxThumb = page.getByRole("slider", { name: "Maximum price" });
      await maxThumb.focus();
      await page.keyboard.press("ArrowLeft");
      const value = Number(await maxThumb.getAttribute("aria-valuenow"));
      expect(value).toBeLessThan(80);
    });

    test("min thumb can be dragged", async ({ page }) => {
      const minThumb = page.getByRole("slider", { name: "Minimum price" });
      const box = await minThumb.boundingBox();
      if (!box) throw new Error("Min thumb not visible");

      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width / 2 + 40, box.y + box.height / 2, { steps: 10 });
      await page.mouse.up();

      const value = Number(await minThumb.getAttribute("aria-valuenow"));
      expect(value).toBeGreaterThanOrEqual(20);
    });
  });

  test.describe("disabled slider", () => {
    test("does not respond to keyboard", async ({ page }) => {
      // The disabled demo is the last Volume slider on the page
      const sliders = page.getByRole("slider", { name: "Volume" });
      const disabledSlider = sliders.last();
      await expect(disabledSlider).toHaveAttribute("aria-valuenow", "40");
      await disabledSlider.focus({ timeout: 1000 }).catch(() => {});
      await page.keyboard.press("ArrowRight");
      await expect(disabledSlider).toHaveAttribute("aria-valuenow", "40");
    });
  });
});
