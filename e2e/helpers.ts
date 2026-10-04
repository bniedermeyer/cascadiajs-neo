import { expect, type Page } from "@playwright/test";
import { readdirSync } from "node:fs";
import { join } from "node:path";
import sponsors from "@shared/data/sponsors.json" with { type: "json" };
import { FEATURED_EVENT } from "@shared/site-defaults";

/** Every file under `dir` (recursively) matching `pattern`, as `dir`-relative paths. */
export function filesUnder(dir: string, pattern: RegExp): string[] {
  return (readdirSync(dir, { recursive: true, encoding: "utf8" }) as string[])
    .filter((file) => pattern.test(file))
    .sort();
}

/**
 * Every built page's `dist/`-relative path. The preview webServer builds
 * first, so `dist/` always reflects the site.
 */
export function builtPages(): string[] {
  return filesUnder("dist", /\.html$/);
}

export const distPath = (file: string) => join("dist", file);

/**
 * Names of the Sponsors the Past Sponsors grid shows: a Sponsor is hidden only
 * when every one of its Events is the Featured Event.
 */
export function pastSponsorNames(): string[] {
  return sponsors
    .filter((s) => s.events.some((e) => e !== FEATURED_EVENT))
    .map((s) => s.name)
    .sort();
}

/**
 * Assert the Past Sponsors section of the current page shows exactly the
 * past-sponsor set and that its CTA targets the Featured Event's sponsor page.
 */
export async function expectPastSponsorsMatchFeaturedEvent(page: Page) {
  const section = page.locator("#sponsors");
  const alts = await section
    .getByRole("img")
    .evaluateAll((imgs) => imgs.map((img) => img.getAttribute("alt") ?? ""));
  expect(alts.map((a) => a.replace(/ logo$/, "")).sort()).toEqual(
    pastSponsorNames(),
  );
  await expect(
    section.getByRole("link", { name: "Sponsor Our Event" }),
  ).toHaveAttribute("href", `/${FEATURED_EVENT}/sponsor`);
}

/** Assert the site header's Event link points at the Featured Event. */
export async function expectHeaderEventLinkIsFeaturedEvent(page: Page) {
  await expect(
    page.getByRole("link", { name: `CascadiaJS ${FEATURED_EVENT}` }),
  ).toHaveAttribute("href", `/${FEATURED_EVENT}`);
}

/** Assert the page renders the Event nav (#nav) with the logo linking to the Event home. */
export async function expectEventNav(page: Page, eventHref = "/2026") {
  const nav = page.locator("#nav").getByRole("navigation");
  await expect(nav).toBeVisible();
  await expect(
    nav.getByRole("link", { name: "CascadiaJS logo" }),
  ).toHaveAttribute("href", eventHref);
}
