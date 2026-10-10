import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { distPath } from "./helpers";

/**
 * Indexing only on the live site (ADR-0014, issue #121). CI builds carry no
 * Netlify variables, so the built output is always the non-live site; these
 * assertions cover that output only.
 */

test.describe("Built robots.txt (non-live)", () => {
  const robots = () => readFileSync(distPath("robots.txt"), "utf8");

  test("disallows everything", () => {
    expect(robots()).toContain("User-agent: *\nDisallow: /");
    expect(robots()).not.toContain("Allow: /");
  });

  test("has no Sitemap line", () => {
    expect(robots()).not.toContain("Sitemap:");
  });
});

test.describe("Sitemap", () => {
  test("index is built and /admin pages are filtered out", () => {
    const index = readFileSync(distPath("sitemap-index.xml"), "utf8");
    expect(index).toContain("sitemap-0.xml");
    const urls = readFileSync(distPath("sitemap-0.xml"), "utf8");
    expect(urls).toContain("<loc>");
    expect(urls).not.toContain("/admin");
  });
});
