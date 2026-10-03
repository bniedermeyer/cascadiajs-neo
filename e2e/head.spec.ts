import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "@playwright/test";
import sponsors from "../src/shared/data/sponsors.json" with { type: "json" };

/**
 * Head parity with legacy (issues #88, #89; docs/seo-audit.md P1, P5, P6,
 * P11, P12, P13). Sitewide checks read every built page out of `dist/` (the
 * webServer builds before the suite runs); per-page checks derive their
 * expectations from the markdown frontmatter and sponsors data.
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

/** Single-line `key: value` frontmatter fields (all this repo's content uses). */
function frontmatter(file: string): Record<string, string> {
  const block = readFileSync(file, "utf8").match(/^---\n([\s\S]*?)\n---/);
  const fields: Record<string, string> = {};
  for (const line of block?.[1].split("\n") ?? []) {
    const m = line.match(/^(\w+):\s*(.*)$/);
    if (m) {
      fields[m[1]] = m[2].replace(/^(["'])(.*)\1$/, "$2");
    }
  }
  return fields;
}

function markdownFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      return markdownFiles(path);
    }
    return /\.mdx?$/.test(entry.name) ? [path] : [];
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
  for (const path of [
    "/",
    "/cookies",
    "/privacy",
    "/tos",
    "/2026/sponsorships",
  ]) {
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

test.describe("Year-scoped markdown pages", () => {
  const files = markdownFiles("markdown/2026").filter((f) => {
    const slug = f.replace(/^markdown\/2026\//, "").replace(/\.mdx?$/, "");
    // /2026/schedule is a dedicated page; /2026/sponsor uses the defaults.
    return !["schedule", "sponsor"].includes(slug);
  });

  test("finds markdown pages", () => {
    expect(files.length).toBeGreaterThan(20);
  });

  for (const file of files) {
    const slug = file.replace(/^markdown\/2026\//, "").replace(/\.mdx?$/, "");
    const data = frontmatter(file);
    const description = data.description ?? data.excerpt;

    test(`/2026/${slug} title has no year${description ? " and uses its description" : ""}`, async ({
      page,
    }) => {
      await page.goto(`/2026/${slug}`);
      await expect(page).toHaveTitle(`CascadiaJS | ${data.title}`);
      await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
        "content",
        `CascadiaJS | ${data.title}`,
      );
      await expect(page.locator('meta[name="description"]')).toHaveAttribute(
        "content",
        description ?? DEFAULT_DESCRIPTION,
      );
    });
  }

  test("excerpt text is rendered unchanged as the description", async ({
    page,
  }) => {
    await page.goto("/2026/trainings/coding-with-claude");
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      "Eve Porcello",
    );
  });

  test("/2026/sponsor uses the sitewide defaults", async ({ page }) => {
    await page.goto("/2026/sponsor");
    await expect(page).toHaveTitle(DEFAULT_TITLE);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      DEFAULT_DESCRIPTION,
    );
  });
});

test.describe("/2026/schedule", () => {
  test("uses legacy's title and description (no 'on')", async ({ page }) => {
    await page.goto("/2026/schedule");
    await expect(page).toHaveTitle(
      "CascadiaJS 2026 | June 1 - 2 | Seattle, WA",
    );
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      "CascadiaJS 2026 is coming up June 1 - 2 in Seattle, WA!",
    );
  });
});

test.describe("Sponsor detail pages", () => {
  const pages = sponsors.filter(
    (s) => s.description && s.events.includes("2026"),
  );

  test("finds 2026 sponsor pages", () => {
    expect(pages.length).toBeGreaterThan(5);
  });

  for (const sponsor of pages) {
    test(`/2026/sponsors/${sponsor.id} thanks the sponsor`, async ({
      page,
    }) => {
      await page.goto(`/2026/sponsors/${sponsor.id}`);
      await expect(page.locator('meta[name="description"]')).toHaveAttribute(
        "content",
        "Thanks for sponsoring CascadiaJS 2026!",
      );
    });
  }
});
