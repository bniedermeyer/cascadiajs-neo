import { test, expect } from "@playwright/test";

/**
 * Talk detail page (issue #53): a per-Talk page rendered from the `talks`
 * content collection, wrapped in EventLayout and following the same
 * simple-page visual pattern as MarkdownLayout (page-title bar + narrow
 * page-body). Fixture below (Joe Duffy / "The Last Mile Is Code") is
 * transcribed from the authoritative source:
 *   src/shared/data/2026/talks.json
 */

const TALK_URL = "/2026/talks/the-last-mile-is-code";

test.describe("Talk detail page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(TALK_URL);
  });

  test("renders", async ({ page }) => {
    await expect(page.locator("body")).toBeVisible();
  });

  test("page-title bar shows the talk title", async ({ page }) => {
    const titleBar = page.locator(".page-title");
    await expect(
      titleBar.getByRole("heading", {
        level: 1,
        name: "The Last Mile Is Code",
      }),
    ).toBeVisible();
  });

  test("abstract text is visible", async ({ page }) => {
    await expect(
      page.getByText("Agents have crossed a threshold on writing code", {
        exact: false,
      }),
    ).toBeVisible();
  });

  test('"About {speaker}" heading is present', async ({ page }) => {
    await expect(
      page.getByRole("heading", { level: 2, name: "About Joe Duffy" }),
    ).toBeVisible();
  });

  test("speaker photo is visible as a 300x300 box", async ({ page }) => {
    const photo = page.getByRole("img", { name: "photo of Joe Duffy" });
    await expect(photo).toBeVisible();
    const box = await photo.boundingBox();
    expect(box?.width).toBe(300);
    expect(box?.height).toBe(300);
  });

  test("speaker details show company and location", async ({ page }) => {
    await expect(page.getByText("Pulumi", { exact: true })).toBeVisible();
    await expect(
      page.getByText("Seattle, WA USA", { exact: true }),
    ).toBeVisible();
  });

  test("social links are present", async ({ page }) => {
    const link = page.locator(
      'a[href="https://www.linkedin.com/in/joejduffy/"]',
    );
    await expect(link).toBeVisible();
    await expect(link.locator("xpath=preceding-sibling::i[1]")).toHaveClass(
      /fa-linkedin/,
    );
  });

  test("Buy Tickets CTA links to /2026/tickets", async ({ page }) => {
    const cta = page.locator(".cta a");
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute("href", "/2026/tickets");
    await expect(cta).toContainText("Tickets to CascadiaJS 2026 on sale now");
  });

  test("EventLayout nav is present", async ({ page }) => {
    const nav = page.locator("#nav").getByRole("navigation");
    await expect(nav).toBeVisible();
    await expect(
      nav.getByRole("link", { name: "CascadiaJS logo" }),
    ).toHaveAttribute("href", "/2026/");
  });
});

test.describe("Talk detail page: missing slugs", () => {
  test("a non-existent slug returns a 404", async ({ page }) => {
    const response = await page.goto("/2026/talks/nonexistent");
    expect(response?.status()).toBe(404);
  });
});
