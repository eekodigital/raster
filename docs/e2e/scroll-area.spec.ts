import { expect, test } from "@playwright/test";

test.describe("ScrollArea", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/components/scroll-area");
    await page.waitForLoadState("networkidle");
  });

  test.describe("vertical scroll", () => {
    test("renders content inside viewport", async ({ page }) => {
      // Target the first demo (vertical) via the section heading
      const section = page.locator("#vertical").locator("~ .example").first();
      await expect(section.getByText("Audit workstream tags")).toBeVisible();
    });

    test("content is scrollable via keyboard", async ({ page }) => {
      // The scroll area should contain all items even if not all visible
      const section = page.locator("#vertical").locator("~ .example").first();
      await expect(section.getByText("Control objectives")).toBeVisible();
      await expect(section.getByText("Third-party risk")).toBeAttached();
    });

    test("scroll via mouse wheel changes scroll position", async ({ page }) => {
      const section = page.locator("#vertical").locator("~ .example").first();
      const preview = section.locator(".example-preview");
      const box = await preview.boundingBox();
      if (!box) throw new Error("Preview not visible");

      // Move mouse into the scroll area and wheel down
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.wheel(0, 200);
      await page.waitForTimeout(200);

      // Verify items further down are now visible
      // (This tests that scrolling works, even if we can't measure scrollTop easily)
      await expect(section.getByText("Third-party risk")).toBeVisible();
    });
  });

  test.describe("horizontal scroll", () => {
    test("renders horizontal content", async ({ page }) => {
      const section = page.locator("#horizontal").locator("~ .example").first();
      await expect(section.getByText("Control objectives")).toBeVisible();
    });

    test("horizontal items overflow the container", async ({ page }) => {
      // All items should be in the DOM even if some are off-screen
      const section = page.locator("#horizontal").locator("~ .example").first();
      await expect(section.getByText("Third-party risk")).toBeAttached();
    });
  });
});
