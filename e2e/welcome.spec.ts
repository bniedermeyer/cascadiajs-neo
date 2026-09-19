import { test, expect } from "@playwright/test";

test.describe("welcome page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/welcome");
  });

  test("renders", async ({ page }) => {
    await expect(page.locator("body")).toBeVisible();
  });

  test("page-title bar shows the frontmatter title", async ({ page }) => {
    const heading = page.getByRole("heading", {
      level: 1,
      name: "Welcome to our Community!",
    });
    await expect(heading).toBeVisible();
  });

  test("markdown body renders its headings", async ({ page }) => {
    const body = page.locator(".page-body");
    await expect(
      body.getByRole("heading", { level: 2, name: "CascadiaJS", exact: true }),
    ).toBeVisible();
    await expect(
      body.getByRole("heading", { level: 2, name: "SeattleJS" }),
    ).toBeVisible();
    await expect(
      body.getByRole("heading", { level: 2, name: "VanJS" }),
    ).toBeVisible();
  });

  test("markdown body renders list links with correct hrefs", async ({
    page,
  }) => {
    const links: [string, string][] = [
      ["CascadiaJS Discord Community", "https://discord.gg/kkYR86GM29"],
      ["@CascadiaJS on BlueSky", "https://bsky.app/profile/cascadiajs.com"],
      [
        "CascadiaJS on LinkedIn",
        "https://www.linkedin.com/showcase/cascadiajs/",
      ],
      ["SeattleJS Discord Community", "https://discord.gg/DtmRZn3G4V"],
      ["@VanJS on Luma", "https://lu.ma/vanjs"],
    ];

    for (const [name, href] of links) {
      const link = page.getByRole("link", { name });
      await expect(link).toBeVisible();
      await expect(link).toHaveAttribute("href", href);
    }
  });

  test("markdown body renders the image", async ({ page }) => {
    const image = page.getByRole("img", {
      name: "CascadiaJS 2019 family photo",
    });
    await expect(image).toBeVisible();
  });

  test("markdown links are cascade-blue", async ({ page }) => {
    const link = page.getByRole("link", {
      name: "CascadiaJS Discord Community",
    });
    const color = await link.evaluate((el) => getComputedStyle(el).color);
    expect(color).toBe("rgb(0, 51, 255)");
  });

  test("page-title bar uses the overcast-gray background and sound-navy heading", async ({
    page,
  }) => {
    const titleBar = page.locator(".page-title");
    const backgroundColor = await titleBar.evaluate(
      (el) => getComputedStyle(el).backgroundColor,
    );
    expect(backgroundColor).toBe("rgb(207, 211, 228)");

    const heading = titleBar.getByRole("heading", { level: 1 });
    const color = await heading.evaluate((el) => getComputedStyle(el).color);
    expect(color).toBe("rgb(17, 35, 120)");
  });

  test("desktop body column is width-constrained (narrow)", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    const body = page.locator(".page-body");
    const box = await body.boundingBox();
    expect(box).not.toBeNull();
    // Narrow width is 50% of the viewport, centered.
    expect(box!.width).toBeLessThan(1280 * 0.6);
    expect(box!.width).toBeGreaterThan(1280 * 0.4);
  });
});
