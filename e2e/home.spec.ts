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

  test("hero shows pre-header, heading, and intro copy", async ({ page }) => {
    await expect(page.getByText("Connecting devs since 2012")).toBeVisible();
    await expect(
      page.getByRole("heading", {
        level: 2,
        name: "We're a community for web + AI developers in the Pacific Northwest.",
      }),
    ).toBeVisible();
    await expect(
      page.getByText(
        "We create events that will help you level up, grow your network, find a job and have fun!",
        { exact: false },
      ),
    ).toBeVisible();
  });

  test("hero CTA links to /2026", async ({ page }) => {
    const cta = page.getByRole("link", { name: "CascadiaJS: June 2026" });
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute("href", "/2026");
  });

  test("hero image is present with its alt text", async ({ page }) => {
    const image = page.getByRole("img", {
      name: "Sasquatch driving a camper van",
    });
    await expect(image).toBeVisible();
  });

  test("trailer shows the 2025 recap heading and video", async ({ page }) => {
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Check-out our 2025 Recap!",
      }),
    ).toBeVisible();
    const video = page.getByTitle("CascadiaJS 2025 Recap Video");
    await expect(video).toBeVisible();
    await expect(video).toHaveAttribute(
      "src",
      /customer-err733fa36e0jnfx\.cloudflarestream\.com/,
    );
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

  test("sponsors grid shows representative logos with alt text", async ({
    page,
  }) => {
    await expect(page.getByRole("img", { name: "AWS logo" })).toBeVisible();
    await expect(page.getByRole("img", { name: "Pulumi logo" })).toBeVisible();
    await expect(
      page.getByRole("img", { name: "Cloudflare logo" }),
    ).toBeVisible();
  });

  test("sponsors grid renders logos unlinked in the flat layout", async ({
    page,
  }) => {
    // The home page passes no event and no tiered flag, so the grid renders
    // the flat, all-sponsors layout: logos are shown but not wrapped in links.
    await expect(page.getByRole("img", { name: "AWS logo" })).toBeVisible();
    await expect(page.getByRole("link", { name: "AWS logo" })).toHaveCount(0);
    await expect(
      page.getByRole("link", { name: "Cloudflare logo" }),
    ).toHaveCount(0);
  });
});
