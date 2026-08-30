import { test, expect } from "@playwright/test";

const legalPages = [
  {
    path: "/privacy",
    title: "Privacy Policy",
    policyId: "b7514956-3e05-45e8-a6fc-5714b3e584d4",
  },
  {
    path: "/tos",
    title: "Terms of Service",
    policyId: "520e6b8e-80c5-4fe8-aca3-46dce7122abe",
  },
  {
    path: "/cookies",
    title: "Cookie Policy",
    policyId: "c908c74a-9cf7-44ac-a425-1891ab411ee8",
  },
] as const;

for (const legalPage of legalPages) {
  test.describe(`${legalPage.title} (${legalPage.path})`, () => {
    test.beforeEach(async ({ page }) => {
      await page.route("https://app.termly.io/**", (route) => route.abort());
      await page.goto(legalPage.path);
    });

    test("document title matches the policy", async ({ page }) => {
      await expect(page).toHaveTitle(legalPage.title);
    });

    test("Termly mount keeps name=termly-embed for the third-party loader", async ({
      page,
    }) => {
      const mount = page.locator("div[name='termly-embed']");
      await expect(mount).toHaveCount(1);
      await expect(mount).toHaveAttribute("data-id", legalPage.policyId);
    });

    test("Termly loader script is present with the expected id and src", async ({
      page,
    }) => {
      const loader = page.locator("script#termly-jssdk");
      await expect(loader).toHaveAttribute(
        "src",
        "https://app.termly.io/embed-policy.min.js",
      );
    });
  });
}
