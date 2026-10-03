import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";
import { builtPages, distPath } from "./helpers";

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

  test("no built page has an internal link with a trailing slash", () => {
    const pages = builtPages();
    expect(pages.length).toBeGreaterThan(50);

    const slashed: string[] = [];
    for (const file of pages) {
      const html = readFileSync(distPath(file), "utf8");
      for (const [, href] of html.matchAll(/\shref="(\/[^"]*)"/g)) {
        const path = href.split(/[?#]/)[0];
        if (path !== "/" && path.endsWith("/")) {
          slashed.push(`${file}: ${href}`);
        }
      }
    }
    expect(slashed).toEqual([]);
  });
});
