import { test, expect } from "@playwright/test";

/**
 * Year-scoped markdown pages (markdown/<year>/*.md) render through
 * EventLayout + MarkdownContent instead of the normal MarkdownLayout, so
 * they get the event's own nav (EventNav) instead of the global SiteHeader
 * nav. This is a deliberate departure from legacy behavior (see #59).
 */

test.describe("year-scoped markdown page (/2026/attend)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/2026/attend");
  });

  test("renders", async ({ page }) => {
    await expect(page.locator("body")).toBeVisible();
  });

  test("shows EventNav with the 2026 config's links", async ({ page }) => {
    const nav = page.locator("#nav").getByRole("navigation");
    await expect(nav).toBeVisible();

    const links: [string, string][] = [
      ["Networking", "/2026/#networking"],
      ["Pricing", "/2026/#pricing"],
      ["Speakers", "/2026/#speakers"],
      ["Schedule", "/2026/schedule"],
      ["Attend", "/2026/attend"],
      ["Sponsor", "/2026/sponsor"],
      ["Trainings", "/2026/trainings"],
      ["Tickets", "/2026/"],
    ];
    for (const [name, href] of links) {
      const link = nav.getByRole("link", { name });
      await expect(link).toBeVisible();
      await expect(link).toHaveAttribute("href", href);
    }
  });

  test("EventNav logo links to the event root", async ({ page }) => {
    const nav = page.locator("#nav").getByRole("navigation");
    const logoLink = nav.getByRole("link", { name: "CascadiaJS logo" });
    await expect(logoLink).toBeVisible();
    await expect(logoLink).toHaveAttribute("href", "/2026/");
  });

  test("does not render the global SiteHeader nav", async ({ page }) => {
    // SiteHeader's nav is only rendered when displayNav is true; EventLayout
    // always passes displayNav={false}. Its logo link (id="logo") and its
    // "Newsletter" link are unique to that nav (this page's markdown body
    // has its own "Code of Conduct" link, so that text isn't a safe check).
    await expect(page.locator("#logo")).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Newsletter" })).toHaveCount(0);
  });

  test("page-title bar shows the frontmatter title with overcast-gray background and sound-navy heading", async ({
    page,
  }) => {
    const titleBar = page.locator(".page-title");
    const heading = titleBar.getByRole("heading", {
      level: 1,
      name: "Attending the Conference",
    });
    await expect(heading).toBeVisible();

    const backgroundColor = await titleBar.evaluate(
      (el) => getComputedStyle(el).backgroundColor,
    );
    expect(backgroundColor).toBe("rgb(207, 211, 228)");

    const color = await heading.evaluate((el) => getComputedStyle(el).color);
    expect(color).toBe("rgb(17, 35, 120)");
  });

  test("markdown body renders", async ({ page }) => {
    const body = page.locator(".page-body");
    await expect(
      body.getByRole("heading", { level: 2, name: "Code of Conduct" }),
    ).toBeVisible();
  });

  test("EventNav is sticky at desktop width and static at mobile width", async ({
    page,
  }) => {
    const navSection = page.locator("#nav");

    await page.setViewportSize({ width: 1280, height: 900 });
    expect(
      await navSection.evaluate((el) => getComputedStyle(el).position),
    ).toBe("sticky");

    await page.setViewportSize({ width: 390, height: 844 });
    expect(
      await navSection.evaluate((el) => getComputedStyle(el).position),
    ).toBe("static");
  });
});

test.describe("year-scoped next-steps sub-page (/2026/next-steps/attendees)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/2026/next-steps/attendees");
  });

  test("renders", async ({ page }) => {
    await expect(page.locator("body")).toBeVisible();
  });

  test("shows EventNav", async ({ page }) => {
    const nav = page.locator("#nav").getByRole("navigation");
    await expect(nav).toBeVisible();
    await expect(nav.getByRole("link", { name: "Attend" })).toHaveAttribute(
      "href",
      "/2026/attend",
    );
  });

  test("does not render the global SiteHeader nav", async ({ page }) => {
    await expect(page.locator("#logo")).toHaveCount(0);
  });

  test("page-title bar shows the frontmatter title", async ({ page }) => {
    await expect(
      page.locator(".page-title").getByRole("heading", {
        level: 1,
        name: "Attendee Next Steps",
      }),
    ).toBeVisible();
  });
});

test.describe("root-level markdown pages keep the normal SiteHeader nav", () => {
  test("/welcome still renders SiteHeader, not EventNav", async ({ page }) => {
    await page.goto("/welcome");
    await expect(page.locator("#logo")).toBeVisible();
    await expect(page.locator("#nav")).toHaveCount(0);
  });

  test("/code-of-conduct still renders SiteHeader, not EventNav", async ({
    page,
  }) => {
    await page.goto("/code-of-conduct");
    await expect(page.locator("#logo")).toBeVisible();
    await expect(page.locator("#nav")).toHaveCount(0);
  });
});
