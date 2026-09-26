import { test, expect } from "@playwright/test";

/**
 * childcare.mdx (markdown/2026/childcare.mdx) is the first page converted to
 * MDX (ADR-0012) so it can import and render CtaButton directly instead of
 * the legacy `<div class="cta secondary">` markup.
 */

test.describe("MDX page (/2026/childcare)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/2026/childcare");
  });

  test("renders", async ({ page }) => {
    await expect(page.locator("body")).toBeVisible();
  });

  test("page-title bar shows the frontmatter title", async ({ page }) => {
    const heading = page.getByRole("heading", { level: 1, name: "Childcare" });
    await expect(heading).toBeVisible();
  });

  test("CTA button is visible with the correct href", async ({ page }) => {
    const cta = page.getByRole("link", { name: "Sign up", exact: true });
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute("href", "/2026/tickets");
  });

  test("CTA button renders the secondary variant styling", async ({ page }) => {
    const cta = page.getByRole("link", { name: "Sign up", exact: true });
    const wrapper = cta.locator("..");
    const styles = await wrapper.evaluate((el) => {
      const cs = getComputedStyle(el);
      return {
        backgroundColor: cs.backgroundColor,
        borderColor: cs.borderColor,
      };
    });
    expect(styles.backgroundColor).toBe("rgba(0, 0, 0, 0)");
    expect(styles.borderColor).toBe("rgb(0, 51, 255)");
  });
});

/**
 * The three 2026 trainings (markdown/2026/trainings/*.mdx) were converted to
 * MDX so their "Buy Ticket" CTA renders through CtaButton instead of the
 * legacy `<div class="cta">` markup, and their speaker photo renders as a
 * markdown image resolved through src/assets (ticket #78).
 */

test.describe("MDX page (/2026/trainings/ai-for-typescript-developers)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/2026/trainings/ai-for-typescript-developers");
  });

  test("renders", async ({ page }) => {
    await expect(page.locator("body")).toBeVisible();
  });

  test("speaker image is visible and loaded", async ({ page }) => {
    const image = page.getByRole("img", { name: "Eve Porcello" });
    await expect(image).toBeVisible();

    // The optimized <img> renders loading="lazy", so it only decodes once
    // it's within (or near) the viewport -- scroll it there first.
    await image.scrollIntoViewIfNeeded();
    await expect(async () => {
      const naturalWidth = await image.evaluate(
        (img: HTMLImageElement) => img.naturalWidth,
      );
      expect(naturalWidth).toBeGreaterThan(0);
    }).toPass();
  });

  test("CTA button is visible with the correct href", async ({ page }) => {
    const cta = page.getByRole("link", { name: "Buy Ticket", exact: true });
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute("href", "/2026/tickets");
  });
});
