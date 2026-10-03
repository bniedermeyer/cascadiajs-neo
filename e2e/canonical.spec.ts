import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
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

  test("no built page has an internal link with a trailing slash", () => {
    // The preview webServer builds first, so dist/ always reflects the site.
    const pages = (
      readdirSync("dist", { recursive: true, encoding: "utf8" }) as string[]
    ).filter((file) => file.endsWith(".html"));
    expect(pages.length).toBeGreaterThan(50);

    const slashed: string[] = [];
    for (const file of pages) {
      const html = readFileSync(join("dist", file), "utf8");
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
