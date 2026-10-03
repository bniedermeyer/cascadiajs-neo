import { expect, test, type Page } from "@playwright/test";

const canonical = (page: Page) => page.locator('link[rel="canonical"]');

test.describe("Canonical URLs", () => {
  test("homepage canonical keeps its root slash", async ({ page }) => {
    await page.goto("/");
    await expect(canonical(page)).toHaveAttribute(
      "href",
      "https://cascadiajs.com/",
    );
  });

  test("event root canonical has no trailing slash", async ({ page }) => {
    await page.goto("/2026");
    await expect(canonical(page)).toHaveAttribute(
      "href",
      "https://cascadiajs.com/2026",
    );
  });

  test("nested route canonical has no trailing slash", async ({ page }) => {
    const response = await page.goto("/2026/attend");
    expect(response?.status()).toBe(200);
    await expect(canonical(page)).toHaveAttribute(
      "href",
      "https://cascadiajs.com/2026/attend",
    );
  });

  test("internal links never carry a trailing slash", async ({ page }) => {
    await page.goto("/2026");
    const hrefs = await page
      .locator("a[href^='/']")
      .evaluateAll((els) => els.map((el) => el.getAttribute("href") ?? ""));
    const slashed = hrefs.filter((href) => {
      const path = href.split(/[?#]/)[0];
      return path !== "/" && path.endsWith("/");
    });
    expect(slashed).toEqual([]);
  });
});
