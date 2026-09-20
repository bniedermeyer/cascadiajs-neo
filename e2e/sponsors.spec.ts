import { test, expect, type Locator } from "@playwright/test";

/**
 * True when the element's generated ::after content shows the external-link
 * glyph. Mirrors e2e/schedule.spec.ts's helper of the same name -- the
 * production build (this suite always runs against `astro build` +
 * `preview`, per playwright.config.ts) collapses the `content: "\f35d"`
 * declaration's value, so `!== "none"` (pseudo-element generated at all)
 * is the meaningful signal, not an exact glyph match.
 */
async function hasExternalIndicator(locator: Locator): Promise<boolean> {
  const content = await locator.evaluate(
    (el) => getComputedStyle(el, "::after").content,
  );
  return content !== "none";
}

/**
 * Sponsor detail page (issue #65): a per-Sponsor page rendered from the
 * `sponsors` content collection, wrapped in EventLayout and using
 * SimplePage > MarkdownContent for the description section (issue #63).
 * Fixture below (Arcjet, gold tier) is transcribed from the authoritative
 * source: src/shared/data/sponsors.json
 */

const SPONSOR_URL = "/2026/sponsors/arcjet";

test.describe("Sponsor detail page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(SPONSOR_URL);
  });

  test("renders", async ({ page }) => {
    await expect(page.locator("body")).toBeVisible();
  });

  test("page-title bar shows uppercase sponsor name", async ({ page }) => {
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "2026 GOLD SPONSOR - ARCJET",
      }),
    ).toBeVisible();
  });

  test("sponsor logo is visible", async ({ page }) => {
    // The sponsor's own logo, in the page-body (as opposed to the "Our
    // Sponsors" grid further down the page, which also renders an Arcjet
    // logo among the other tiers).
    const logo = page.locator(".page-body").getByRole("img", {
      name: "Arcjet logo",
    });
    await expect(logo).toBeVisible();
  });

  test("description text is visible", async ({ page }) => {
    await expect(
      page.getByText("AI features are shipping fast", { exact: false }),
    ).toBeVisible();
  });

  test('"Learn More" CTA links to sponsor URL with target="_blank"', async ({
    page,
  }) => {
    const cta = page.getByRole("link", { name: "Learn More" });
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute("href", "https://www.arcjet.com");
    await expect(cta).toHaveAttribute("target", "_blank");
  });

  test('"Learn More" CTA shows the external-link icon', async ({ page }) => {
    // .mark-external-links (global.css) appends a ::after glyph to any
    // target="_blank" link inside it -- verify the wrapper reaches the CTA.
    const cta = page.getByRole("link", { name: "Learn More", exact: false });
    expect(await hasExternalIndicator(cta)).toBe(true);
  });

  test("the external-link icon does not leak onto the after-body Sponsors grid", async ({
    page,
  }) => {
    // The grid's own target="_blank" logo links (e.g. Pulumi, gold tier)
    // live in SimplePage's after-body slot, outside the CTA's
    // .mark-external-links wrapper -- they must not gain the glyph.
    const gridLogo = page
      .locator("#sponsors")
      .getByRole("link", { name: "Pulumi logo" });
    await expect(gridLogo).toBeVisible();
    expect(await hasExternalIndicator(gridLogo)).toBe(false);
  });

  test("EventLayout nav is present", async ({ page }) => {
    const nav = page.locator("#nav").getByRole("navigation");
    await expect(nav).toBeVisible();
    await expect(
      nav.getByRole("link", { name: "CascadiaJS logo" }),
    ).toHaveAttribute("href", "/2026/");
  });
});

test.describe("Sponsor detail page: missing slugs", () => {
  test("a non-existent slug returns a 404", async ({ page }) => {
    const response = await page.goto("/2026/sponsors/nonexistent");
    expect(response?.status()).toBe(404);
  });
});
