import { expect, test } from "@playwright/test";
import { existsSync, readFileSync } from "node:fs";
import { distPath } from "./helpers";

test.describe("legacy URL redirects", () => {
  test("/sitemap.xml permanently redirects to /sitemap-index.xml", () => {
    const rules = readFileSync(distPath("_redirects"), "utf8")
      .split("\n")
      .map((line) => line.trim().split(/\s+/));
    expect(rules).toContainEqual(["/sitemap.xml", "/sitemap-index.xml", "301"]);
  });

  test("nothing is built at /sitemap.xml", () => {
    expect(existsSync(distPath("sitemap.xml"))).toBe(false);
  });
});
