import { test, expect } from "@playwright/test";
import type { Talk } from "@shared/data/types";
import talks from "@shared/data/2026/talks.json" with { type: "json" };

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

  test("title and og:title match legacy", async ({ page }) => {
    const expected = "CascadiaJS 2026 | Speakers | Joe Duffy";
    await expect(page).toHaveTitle(expected);
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
      "content",
      expected,
    );
  });

  test("renders Our Sponsors and Testimonials after the body", async ({
    page,
  }) => {
    await expect(
      page.getByRole("heading", { level: 1, name: "Our Sponsors" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Sponsor Our Event" }),
    ).toHaveAttribute("href", "/2026/sponsor");
    await expect(page.locator("#testimonials")).toBeVisible();
  });

  test("renders", async ({ page }) => {
    await expect(page.locator("body")).toBeVisible();
  });

  test("page-title bar shows the talk title", async ({ page }) => {
    await expect(
      page.getByRole("heading", {
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

  test("Buy Tickets CTA links to the 2026 homepage", async ({ page }) => {
    const cta = page.getByRole("link", {
      name: /Tickets to CascadiaJS 2026 on sale now/,
    });
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute("href", "/2026");
  });

  test("EventLayout nav is present", async ({ page }) => {
    const nav = page.locator("#nav").getByRole("navigation");
    await expect(nav).toBeVisible();
    await expect(
      nav.getByRole("link", { name: "CascadiaJS logo" }),
    ).toHaveAttribute("href", "/2026");
  });
});

test.describe("Talk detail page: missing slugs", () => {
  test("a non-existent slug returns a 404", async ({ page }) => {
    const response = await page.goto("/2026/talks/nonexistent");
    expect(response?.status()).toBe(404);
  });
});

const workshopTalks = (talks as Talk[]).filter(
  (t) => t.type === "workshop" && t.slug,
);

test.describe("Workshop talk pages", () => {
  test("there are four Workshop Talks", () => {
    expect(workshopTalks).toHaveLength(4);
  });

  for (const { slug, speaker, registrationUrl } of workshopTalks) {
    test.describe(`/2026/talks/${slug}`, () => {
      test.beforeEach(async ({ page }) => {
        const response = await page.goto(`/2026/talks/${slug}`);
        expect(response?.status()).toBe(200);
      });

      test("title and og:title match the regular Talk format", async ({
        page,
      }) => {
        const expected = `CascadiaJS 2026 | Speakers | ${speaker.name}`;
        await expect(page).toHaveTitle(expected);
        await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
          "content",
          expected,
        );
      });

      test("renders Our Sponsors and Testimonials after the body", async ({
        page,
      }) => {
        await expect(
          page.getByRole("heading", { level: 1, name: "Our Sponsors" }),
        ).toBeVisible();
        await expect(page.locator("#testimonials")).toBeVisible();
      });

      test("renders the registrationUrl link after the abstract", async ({
        page,
      }) => {
        expect(registrationUrl).toBeTruthy();
        const anchor = page.locator(
          ".prose-content a[href^='/2026/workshops/']",
        );
        await expect(anchor).toHaveCount(1);
        await expect(anchor).toHaveAttribute("href", registrationUrl!);
        await expect(anchor).toHaveText("[More info and how to register]");
        // The link follows the abstract, as the last paragraph.
        await expect(page.locator(".prose-content p").last()).toContainText(
          "[More info and how to register]",
        );
      });
    });
  }
});

test.describe("Talk abstract markdown", () => {
  test("multi-paragraph abstract renders as separate paragraphs", async ({
    page,
  }) => {
    await page.goto(
      "/2026/talks/how-to-use-spec-driven-development-for-production-workflows",
    );
    const body = page.locator(".prose-content");
    expect(await body.locator("p").count()).toBeGreaterThan(1);
  });
});
