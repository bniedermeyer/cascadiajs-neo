/**
 * Sitewide defaults, changed together when an Event launches (FEATURED_EVENT and
 * DEFAULT_DESCRIPTION are the launch edits). Head defaults are ported from
 * legacy `app/head.mjs`. Must stay import-free: Event configs import
 * DEFAULT_DESCRIPTION, so any import here risks a cycle. Pages with no
 * title/description of their own (homepage, legal pages, /2026/sponsor, ...)
 * fall through to these -- one source of truth, consumed by Layout.astro and
 * the Event config's fallback description.
 */
export const DEFAULT_TITLE = "CascadiaJS - a JS conf for the PacNW";
export const DEFAULT_DESCRIPTION =
  "CascadiaJS 2026 is coming up on June 1 - 2 in Seattle, WA!";

/** Event Key of the Featured Event (see CONTEXT.md). */
export const FEATURED_EVENT = "2026" as const;
