# Sponsor Detail URLs Drop the Year Segment

Sponsor detail pages are served at `/sponsors/{id}` rather than the legacy `/2026/sponsors/{id}`. This is a deliberate exception to the URL-preservation policy (see ADR-0001): sponsor detail pages exist only for the current event, and past sponsors have no detail page, so the year segment carries no disambiguating information and is redundant. The tiered `SponsorsGrid` emits internal links to `/sponsors/{id}` for current-event sponsors that have a `description`; all other sponsors link to their external `url`.

## Consequences

Legacy `/2026/sponsors/{id}` URLs are not reproduced. If those inbound links need to keep working, a redirect from `/2026/sponsors/{id}` to `/sponsors/{id}` will be required — it is not provided by this component.
