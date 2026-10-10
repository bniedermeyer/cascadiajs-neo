import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { isLiveSite } from "@shared/live-site";
import { distPath } from "./helpers";

/**
 * Indexing only on the live site (ADR-0014, issue #121). CI builds carry no
 * Netlify variables, so the built output is always the non-live site; the live
 * branch is covered through `isLiveSite` directly.
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

test.describe("isLiveSite", () => {
  test("true only for a production build on cascadiajs.com", () => {
    expect(
      isLiveSite({ CONTEXT: "production", URL: "https://cascadiajs.com" }),
    ).toBe(true);
  });

  const nonLive: [string, Record<string, string>][] = [
    ["unset", {}],
    [
      "deploy preview",
      { CONTEXT: "deploy-preview", URL: "https://cascadiajs.com" },
    ],
    [
      "branch deploy",
      { CONTEXT: "branch-deploy", URL: "https://cascadiajs.com" },
    ],
    [
      "netlify.app production",
      { CONTEXT: "production", URL: "https://cascadiajs.netlify.app" },
    ],
    ["production without URL", { CONTEXT: "production" }],
    [
      "lookalike host",
      { CONTEXT: "production", URL: "https://cascadiajs.com.evil.test" },
    ],
  ];
  for (const [name, env] of nonLive) {
    test(`false for ${name}`, () => {
      expect(isLiveSite(env)).toBe(false);
    });
  }
});
