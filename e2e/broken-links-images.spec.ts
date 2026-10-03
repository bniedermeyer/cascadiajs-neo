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
    await page.goto(path);
    await expect(
      page.getByRole("img", { name: alt, exact: true }),
    ).toBeAttached();

    // Force lazy images to load, then list every same-origin image that
    // fails to decode (a 404 leaves naturalWidth at 0).
    const broken = await page.evaluate(async () => {
      const images = [...document.images].filter(
        (img) => new URL(img.currentSrc || img.src).origin === location.origin,
      );
      await Promise.all(
        images.map((img) => {
          img.loading = "eager";
          return img.decode().catch(() => {});
        }),
      );
      return images
        .filter((img) => img.naturalWidth === 0)
        .map((img) => img.getAttribute("src"));
    });
    expect(broken).toEqual([]);
  });
}
