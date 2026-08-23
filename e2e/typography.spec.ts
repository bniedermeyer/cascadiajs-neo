import { test, expect } from "@playwright/test";

test.describe("typography", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/welcome");
  });

  test("markdown h2 uses the scoped MarkdownLayout font-size with heading line-height", async ({
    page,
  }) => {
    const heading = page
      .locator(".page-body")
      .getByRole("heading", { level: 2, name: "CascadiaJS", exact: true });
    const { fontSize, lineHeight } = await heading.evaluate((el) => {
      const style = getComputedStyle(el);
      return { fontSize: style.fontSize, lineHeight: style.lineHeight };
    });
    expect(fontSize).toBe("32px");
    expect(lineHeight).toBe("36px");
  });

  test("page-title h1 uses the scoped MarkdownLayout font-size", async ({
    page,
  }) => {
    const heading = page
      .locator(".page-title")
      .getByRole("heading", { level: 1 });
    const fontSize = await heading.evaluate(
      (el) => getComputedStyle(el).fontSize,
    );
    expect(fontSize).toBe("40px");
  });

  test("sponsor section h1 (text-5xl) gets the proportional heading line-height", async ({
    page,
  }) => {
    const heading = page.getByRole("heading", {
      level: 1,
      name: "Past Sponsors",
    });
    const lineHeight = await heading.evaluate(
      (el) => getComputedStyle(el).lineHeight,
    );
    expect(lineHeight).toBe("54px");
  });

  test("alert banner (text-xl) inherits the body's fixed line-height", async ({
    page,
  }) => {
    const banner = page.getByText("CascadiaJS 2026 is SOLD OUT!", {
      exact: false,
    });
    const lineHeight = await banner.evaluate(
      (el) => getComputedStyle(el).lineHeight,
    );
    expect(lineHeight).toBe("20.25px");
  });

  test("CTA button (text-2xl leading-body) uses the body line-height, not the heading default", async ({
    page,
  }) => {
    const cta = page.getByRole("link", { name: "Sponsor Our Event" });
    const lineHeight = await cta.evaluate(
      (el) => getComputedStyle(el).lineHeight,
    );
    expect(lineHeight).toBe("20.25px");
  });
});
