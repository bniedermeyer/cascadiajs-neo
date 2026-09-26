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
 * Workshop pages (markdown/2026/workshops/*.mdx, ticket #77) are the second
 * batch converted to MDX so they can render Callout and CtaButton directly
 * instead of the legacy `<div class="highlight info">` / `<div class="cta">`
 * markup.
 */
test.describe("MDX workshop page (/2026/workshops/deploying-ai-agents)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/2026/workshops/deploying-ai-agents");
  });

  test("renders", async ({ page }) => {
    await expect(page.locator("body")).toBeVisible();
  });

  test("Callout block is visible with the info variant text", async ({
    page,
  }) => {
    // Scoped to Callout's own utility classes: the page-title bar also uses
    // bg-overcast-gray, so a bare `.bg-overcast-gray` selector would match
    // both elements.
    const callout = page.locator(".rounded.font-medium.p-4.bg-overcast-gray");
    await expect(callout).toBeVisible();
    await expect(callout).toContainText("This workshop is FREE");
  });

  test("Callout renders the info variant background color", async ({
    page,
  }) => {
    const callout = page.locator(".rounded.font-medium.p-4.bg-overcast-gray");
    const backgroundColor = await callout.evaluate(
      (el) => getComputedStyle(el).backgroundColor,
    );
    expect(backgroundColor).toBe("rgb(207, 211, 228)");
  });

  test("CTA button is visible with the correct href", async ({ page }) => {
    const cta = page.getByRole("link", {
      name: "Get Your Conference Ticket Today!",
    });
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute("href", "/2026/tickets");
  });
});
