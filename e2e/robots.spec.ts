import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { distPath } from "./helpers";

test.describe("Built robots.txt", () => {
  const robots = () => readFileSync(distPath("robots.txt"), "utf8");

  test("allows everything", () => {
    expect(robots()).toContain("User-agent: *\nAllow: /");
    expect(robots()).not.toContain("Disallow");
  });

  test("points at the sitemap index", () => {
    expect(robots()).toMatch(/^Sitemap: \S+sitemap-index\.xml$/m);
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
