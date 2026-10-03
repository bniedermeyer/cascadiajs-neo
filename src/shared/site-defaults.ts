/**
 * Sitewide head defaults, ported from legacy `app/head.mjs`. Pages with no
 * title/description of their own (homepage, legal pages, /2026/sponsor, ...)
 * fall through to these -- one source of truth, consumed by Layout.astro and
 * the Event config's fallback description.
 */
export const DEFAULT_TITLE = "CascadiaJS - a JS conf for the PacNW";
export const DEFAULT_DESCRIPTION =
  "CascadiaJS 2026 is coming up on June 1 - 2 in Seattle, WA!";
