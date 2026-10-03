import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "@playwright/test";

/**
 * Sitewide head parity with legacy (issue #88; docs/seo-audit.md P1, P11,
 * P13). Reads every built page out of `dist/` (the webServer builds before
 * the suite runs).
 */

const DEFAULT_TITLE = "CascadiaJS - a JS conf for the PacNW";
const DEFAULT_DESCRIPTION =
  "CascadiaJS 2026 is coming up on June 1 - 2 in Seattle, WA!";

function builtPages(dir = "dist"): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      return builtPages(path);
    }
    return entry.name.endsWith(".html") ? [path] : [];
  });
}

test.describe("Sitewide head (every built page)", () => {
  const pages = builtPages();

  test("finds built pages", () => {
    expect(pages.length).toBeGreaterThan(50);
  });

  test("every page has the legacy viewport, author meta and no analytics", () => {
    for (const file of pages) {
      const html = readFileSync(file, "utf8");
      expect(html, file).toContain(
        '<meta name="viewport" content="width=device-width, initial-scale=1"',
      );
      expect(html, file).toContain('<meta name="author" content="CascadiaJS"');
      for (const trace of [
        "googletagmanager",
        "gtag",
        "fbevents",
        "G-XBTPEH9RZW",
        "1431763387943877",
        "facebook.com/tr",
      ]) {
        expect(html, `${file} contains ${trace}`).not.toContain(trace);
      }
    }
  });

  test("charset and viewport are the first head children", () => {
    const html = readFileSync("dist/index.html", "utf8");
    const head = html.match(/<head>\s*([\s\S]*?)<\/head>/)![1];
    expect(head.startsWith('<meta charset="utf-8"')).toBe(true);
    expect(head.indexOf("viewport")).toBeLessThan(head.indexOf("<title>"));
  });
});

test.describe("Default title and description", () => {
  for (const path of ["/", "/cookies", "/privacy", "/tos"]) {
    test(`${path} uses the sitewide defaults`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveTitle(DEFAULT_TITLE);
      await expect(page.locator('meta[name="description"]')).toHaveAttribute(
        "content",
        DEFAULT_DESCRIPTION,
      );
    });
  }

  test("/2026 falls back to the event description with 'on'", async ({
    page,
  }) => {
    await page.goto("/2026");
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      DEFAULT_DESCRIPTION,
    );
  });
});
