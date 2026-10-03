import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import sponsors from "../src/shared/data/sponsors.json" with { type: "json" };
import { pageDescription } from "../src/shared/page-description";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_TITLE,
} from "../src/shared/site-defaults";
import { builtPages, distPath, filesUnder } from "./helpers";

/**
 * Head parity with legacy (issues #88, #89; docs/seo-audit.md P1, P5, P6,
 * P11, P12, P13). Sitewide checks read every built page out of `dist/` (the
 * webServer builds before the suite runs); per-page checks derive their
 * expectations from the markdown frontmatter and sponsors data.
 */

/**
 * Single-line `key: value` frontmatter fields, which is all this repo's
 * content uses. Throws on any line it can't parse (a multi-line or nested
 * value, a block scalar) rather than silently misparsing it.
 */
function frontmatter(file: string): Record<string, string> {
  const block = readFileSync(file, "utf8").match(/^---\n([\s\S]*?)\n---/);
  if (!block) {
    throw new Error(`${file}: no frontmatter block`);
  }
  const fields: Record<string, string> = {};
  for (const line of block[1].split("\n")) {
    const m = line.match(/^(\w+): (\S.*)$/);
    if (!m || /^[|>[{&*!]/.test(m[2])) {
      throw new Error(`${file}: unsupported frontmatter line: ${line}`);
    }
    fields[m[1]] = m[2].replace(/^(["'])(.*)\1$/, "$2");
  }
  return fields;
}

test.describe("Sitewide head (every built page)", () => {
  const pages = builtPages();

  test("finds built pages", () => {
    expect(pages.length).toBeGreaterThan(50);
  });

  // CUTOVER: this test asserts the analytics snippets in Layout.astro are
  // still dormant. Invert or remove it when they are enabled (see the TODO
  // in Layout.astro), or it will fail on every page.
  test("every page has the legacy viewport, author meta and no analytics", () => {
    for (const file of pages) {
      const html = readFileSync(distPath(file), "utf8");
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
    const html = readFileSync(distPath("index.html"), "utf8");
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
  const files = filesUnder("markdown/2026", /\.mdx?$/).filter((f) => {
    const slug = f.replace(/\.mdx?$/, "");
    // /2026/schedule is a dedicated page; /2026/sponsor uses the defaults.
    return !["schedule", "sponsor"].includes(slug);
  });

  test("finds markdown pages", () => {
    expect(files.length).toBeGreaterThan(20);
  });

  for (const file of files) {
    const slug = file.replace(/\.mdx?$/, "");
    const data = frontmatter(`markdown/2026/${file}`);
    const description = pageDescription(data);

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

  test("an explicit description wins over excerpt", () => {
    expect(
      pageDescription({ description: "explicit", excerpt: "fallback" }),
    ).toBe("explicit");
    expect(pageDescription({ excerpt: "fallback" })).toBe("fallback");
    expect(pageDescription({ description: "explicit" })).toBe("explicit");
    expect(pageDescription({})).toBeUndefined();
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
