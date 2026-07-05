// @ts-check
import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  // Canonical/OG URLs resolve against the live legacy site during the port,
  // so search engines consolidate on cascadiajs.com while we migrate.
  site: "https://cascadiajs.com",
  vite: {
    plugins: [tailwindcss()],
  },
});
