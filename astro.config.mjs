// @ts-check
import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";

// https://astro.build/config
export default defineConfig({
  // Canonical/OG URLs resolve against the live legacy site during the port,
  // so search engines consolidate on cascadiajs.com while we migrate.
  site: "https://cascadiajs.com",
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
