import { readFileSync } from "node:fs";
import { test, expect } from "@playwright/test";
import { builtPages, distPath } from "./helpers";

/**
 * Ticketing is out of scope for the port, so `/2026/tickets` never exists;
 * CTAs that used to point there send visitors to the 2026 homepage instead
 * (docs/seo-audit.md P7).
 */
test("no built page links to /2026/tickets", () => {
  const offenders = builtPages().filter((file) =>
    /href="\/2026\/tickets\/?"/.test(readFileSync(distPath(file), "utf8")),
  );
  expect(offenders).toEqual([]);
});

/**
 * Content images that previously 404'd (docs/seo-audit.md P9) now resolve
 * through src/assets.
 */
const contentImages = [
  { path: "/2026/next-steps/attendees", alt: "CascadiaJS 2019 family photo" },
  {
    path: "/2026/next-steps/scholarships",
    alt: "CascadiaJS 2019 family photo",
  },
  { path: "/2026/next-steps/sponsorships", alt: "moovweb" },
  { path: "/2026/next-steps/leadcapture", alt: "test QR code" },
  { path: "/2026/workshops/recipe-better-agents", alt: "Michael Daigler" },
];

for (const { path, alt } of contentImages) {
  test(`${path} "${alt}" image and every other image load`, async ({
    page,
  }) => {
    const failures: string[] = [];
    page.on("response", (res) => {
      if (res.request().resourceType() === "image" && res.status() >= 400) {
        failures.push(res.url());
      }
    });
    await page.goto(path, { waitUntil: "networkidle" });

    const image = page.getByRole("img", { name: alt, exact: true });
    await image.scrollIntoViewIfNeeded();
    await expect(async () => {
      const naturalWidth = await image.evaluate(
        (img: HTMLImageElement) => img.naturalWidth,
      );
      expect(naturalWidth).toBeGreaterThan(0);
    }).toPass();
    expect(failures).toEqual([]);
  });
}
