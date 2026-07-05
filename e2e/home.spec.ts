import { test, expect } from "@playwright/test";

test.describe("home page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("renders", async ({ page }) => {
    await expect(page.locator("body")).toBeVisible();
  });

  test("site header shows the alert banner", async ({ page }) => {
    const header = page.getByRole("banner");
    await expect(header).toBeVisible();
    await expect(
      header.getByText("CascadiaJS 2026 is SOLD OUT! See you in 2027!"),
    ).toBeVisible();
  });

  test("site header shows the logo linking home", async ({ page }) => {
    const header = page.getByRole("banner");
    const logoLink = header.getByRole("link", { name: "CascadiaJS logo" });
    await expect(logoLink).toBeVisible();
    await expect(logoLink).toHaveAttribute("href", "/");
  });

  test("site header nav links point to their pages", async ({ page }) => {
    const nav = page.getByRole("banner").getByRole("navigation");
    await expect(nav).toBeVisible();

    const links: [string, string][] = [
      ["CascadiaJS 2026", "/2026"],
      ["Newsletter", "/mailing-list"],
      ["Code of Conduct", "/code-of-conduct"],
    ];

    for (const [name, href] of links) {
      const link = nav.getByRole("link", { name });
      await expect(link).toBeVisible();
      await expect(link).toHaveAttribute("href", href);
    }
  });

  test("site footer is present with its sections", async ({ page }) => {
    const footer = page.getByRole("contentinfo");
    await expect(footer).toBeVisible();
    await expect(
      footer.getByRole("heading", {
        name: "CascadiaJS - a Web + AI conf for the PNW",
      }),
    ).toBeVisible();
    await expect(
      footer.getByRole("heading", { name: "Stay Connected" }),
    ).toBeVisible();
    await expect(
      footer.getByRole("heading", { name: "Past Events" }),
    ).toBeVisible();
    await expect(
      footer.getByRole("link", { name: "Privacy Policy" }),
    ).toBeVisible();
  });
});
