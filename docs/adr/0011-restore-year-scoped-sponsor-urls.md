# Restore Year-Scoped Sponsor URLs

Sponsor detail pages are served at `/{year}/sponsors/{slug}`, scoped to the Event Key. This **supersedes ADR-0005** ("Sponsor Detail URLs Drop the Year Segment"), which dropped the segment in favor of `/sponsors/{id}`.

ADR-0005 reasoned that sponsor detail pages exist only for the current Event, so the year carried no disambiguating information. That assumption does not hold: a Sponsor can belong to more than one Event's `events` array — Arcjet, for example, sponsors both 2025 and 2026 — and each Event is entitled to its own detail page for that Sponsor, with its own tier, description, and surrounding context for that year. A single unscoped `/sponsors/{id}` cannot represent that; the Event Key is the disambiguator ADR-0005 assumed away. The reference implementation also serves these pages year-scoped (`/2026/sponsors/{id}`), which this restores as ordinary URL preservation under ADR-0001. The page file already lives at `src/pages/[year]/sponsors/[slug].astro` and generates one page per Event a Sponsor participates in via `getStaticPaths`; no route restructuring is required, only routing sponsor links back through the year segment.

## Consequences

`SponsorsGrid` links to Sponsors with a `description` must point at `/{year}/sponsors/{slug}` for the Event being rendered, not a bare `/sponsors/{id}`.

Legacy `/sponsors/{id}` URLs are not reproduced. If those inbound links were ever deployed and need to keep working, a redirect from `/sponsors/{id}` to `/{year}/sponsors/{id}` will be required — it is not provided by this change and is not implied to exist.
