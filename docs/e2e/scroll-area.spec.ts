import { expect, test, type Page } from "@playwright/test";

test.describe("ScrollArea", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/components/scroll-area");
    await page.waitForLoadState("networkidle");
  });

  // Starlight wraps each <h2> in `.sl-heading-wrapper`, so the Example block is a
  // sibling of that wrapper rather than of the heading itself. Navigate up once.
  const sectionFor = (page: Page, headingId: string) =>
    page
      .locator(`#${headingId}`)
      .locator('xpath=../following-sibling::div[contains(@class, "example")][1]');

  test.describe("vertical scroll", () => {
    test("renders content inside viewport", async ({ page }) => {
      const section = sectionFor(page, "vertical-scroll");
      await expect(section.getByText("Audit workstream tags")).toBeVisible();
    });

    test("content is scrollable via keyboard", async ({ page }) => {
      const section = sectionFor(page, "vertical-scroll");
      await expect(section.getByText("Control objectives")).toBeVisible();
      await expect(section.getByText("Third-party risk")).toBeAttached();
    });

    test("scroll via mouse wheel changes scroll position", async ({ page }) => {
      const section = sectionFor(page, "vertical-scroll");
      const preview = section.locator(".example-preview");
      const box = await preview.boundingBox();
      if (!box) throw new Error("Preview not visible");

      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.wheel(0, 400);
      await page.waitForTimeout(200);

      await expect(section.getByText("Third-party risk")).toBeVisible();
    });
  });

  test.describe("horizontal scroll", () => {
    test("renders horizontal content", async ({ page }) => {
      const section = sectionFor(page, "horizontal-scroll");
      await expect(section.getByText("Control objectives")).toBeVisible();
    });

    test("horizontal items overflow the container", async ({ page }) => {
      const section = sectionFor(page, "horizontal-scroll");
      await expect(section.getByText("Third-party risk")).toBeAttached();
    });
  });
});
