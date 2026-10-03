// @ts-check
import process from "node:process";
import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";

// Netlify sets these at build time: URL is the site's main address,
// DEPLOY_PRIME_URL the stable URL for a deploy preview or branch deploy, and
// CONTEXT which of those this build is. Outside Netlify (local builds, tests)
// fall back to the live site.
const productionSite = process.env.URL ?? "https://cascadiajs.com";
const site =
  process.env.CONTEXT === "production"
    ? productionSite
    : (process.env.DEPLOY_PRIME_URL ?? productionSite);

// https://astro.build/config
export default defineConfig({
  // Canonical/OG URLs resolve against `site`, so previews share their own
  // images and production consolidates on its main address.
  site,
  // Astro 7 defaults to JSX-style whitespace stripping ("jsx"), which drops
  // spaces between inline elements and breaks legacy fidelity. Keep v6 behavior.
  compressHTML: true,
  image: {
    layout: "constrained",
  },
  integrations: [mdx()],
  vite: {
    plugins: [tailwindcss()],
  },
});
