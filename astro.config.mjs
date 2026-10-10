// @ts-check
import process from "node:process";
import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";

import sitemap from "@astrojs/sitemap";

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath, URL } from "node:url";
import { isLiveSite } from "./src/shared/live-site.ts";

// Netlify sets these at build time: URL is the site's main address,
// DEPLOY_PRIME_URL the stable URL for a deploy preview or branch deploy, and
// CONTEXT which of those this build is. Outside Netlify (local builds, tests)
// fall back to the live site.
const productionSite = process.env.URL ?? "https://cascadiajs.com";
// Deliberately not `isLiveSite`: a netlify.app production build is not the live
// site (non-live for indexing/analytics) but still needs its own `site` URL.
const site =
  process.env.CONTEXT === "production"
    ? productionSite
    : (process.env.DEPLOY_PRIME_URL ?? productionSite);

// The Frozen Snapshots (ADR-0008) are raw HTML and cannot branch on the live
// check, so their analytics sit in dormant comments in source (ADR-0014). After
// the build, verify the markers survived (every build, so CI catches drift) and,
// when live, replace each dormant comment with its contents.
const SNAPSHOT_FILES = ["2024.html", "2025.html"];
const DORMANT = /<!-- ANALYTICS DORMANT until cutover[^:]*: ([\s\S]*?) -->/g;
// GA4 loader, GA4 config, Pixel script, Pixel noscript.
const EXPECTED_DORMANT_MARKERS = 4;

/** @type {import("astro").AstroIntegration} */
const snapshotAnalytics = {
  name: "snapshot-analytics",
  hooks: {
    "astro:build:done": async ({ dir }) => {
      const live = isLiveSite();
      for (const file of SNAPSHOT_FILES) {
        const path = fileURLToPath(new URL(file, dir));
        const html = await readFile(path, "utf8");
        const found = html.match(DORMANT)?.length ?? 0;
        if (found !== EXPECTED_DORMANT_MARKERS) {
          throw new Error(
            `[snapshot-analytics] ${file} has ${found} "ANALYTICS DORMANT" markers, expected ${EXPECTED_DORMANT_MARKERS}. ` +
              `The Frozen Snapshot's dormant analytics comments drifted; see ADR-0014.`,
          );
        }
        if (live) {
          await writeFile(path, html.replace(DORMANT, "$1"));
        }
      }
    },
  },
};

// https://astro.build/config
export default defineConfig({
  // Canonical/OG URLs resolve against `site`, so previews share their own
  // images and production consolidates on its main address.
  site,
  // Legacy URLs never end in a slash (the slashed form 404s), so routes and
  // canonical URLs must match. The root stays "/".
  trailingSlash: "never",
  // Build `2026/attend.html`, not `2026/attend/index.html`. Netlify's Pretty
  // URLs 301-redirects a directory index to its slashed form, which legacy
  // never served. Layouts read the route path via `routePath`, since
  // `Astro.url.pathname` carries `.html` in this format.
  build: { format: "file" },
  // Astro 7 defaults to JSX-style whitespace stripping ("jsx"), which drops
  // spaces between inline elements and breaks legacy fidelity. Keep v6 behavior.
  compressHTML: true,
  image: {
    layout: "constrained",
  },
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => !page.includes("/admin"),
    }),
    snapshotAnalytics,
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
