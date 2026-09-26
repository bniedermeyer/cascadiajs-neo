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

/**
 * attend.mdx (markdown/2026/attend.mdx) converted from .md to .mdx so the
 * "Travel Guide" CTA can use the CtaButton component directly (ADR-0012).
 * See e2e/event-markdown.spec.ts for other /2026/attend coverage (nav,
 * page-title bar, etc.) -- these tests cover only what's new from the MDX
 * conversion.
 */
test.describe("MDX page (/2026/attend)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/2026/attend");
  });

  test("map links are visible with the correct hrefs", async ({ page }) => {
    const maps: [string, string][] = [
      ["Forum (Floor 1)", "/images/2026/venue/cjs26-map-forum.png"],
      ["Main Lobby (Floor 2)", "/images/2026/venue/cjs26-map-lobby.png"],
      ["Great Hall (Floor 3)", "/images/2026/venue/cjs26-map-great-hall.png"],
    ];
    for (const [name, href] of maps) {
      const link = page.getByRole("link", { name, exact: true });
      await expect(link).toBeVisible();
      await expect(link).toHaveAttribute("href", href);
    }
  });

  test("Travel Guide CTA button is visible with the correct href", async ({
    page,
  }) => {
    const cta = page.getByRole("link", { name: "Travel Guide", exact: true });
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute("href", "/2026/travel");
  });

  test("Travel Guide CTA button renders the secondary variant styling", async ({
    page,
  }) => {
    const cta = page.getByRole("link", { name: "Travel Guide", exact: true });
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
