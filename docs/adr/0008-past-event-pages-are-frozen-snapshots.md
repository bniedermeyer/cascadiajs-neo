# Past Event Pages Are Frozen Snapshots

The page for an Event that has already happened is captured once, in full, as a single self-contained Astro page. Its content is written into the page's own frontmatter and mapped over — not loaded from a Collection, not stored in `src/shared/data/`, not rendered through components extracted for the purpose. Its assets are copied into `public/images/events/<Event Key>/` so the page depends on nothing outside this repo. Links to routes that were never ported collapse to the Event root (`/2026/`), while in-page anchors keep their fragments, so the page is a closed loop a visitor cannot fall out of.

The abstractions used elsewhere on this site earn their keep by serving content that appears on many pages or changes over time. Sponsors and Testimonials are shared datasets behind shared components because both are true of them. Neither is true of a past Event's roster: it appears on exactly one page and will never change again. Extracting it buys no reuse and falsely advertises the content as live.

The non-obvious part is what this rules out during review. A snapshot page holds dozens of near-identical inlined records, which reads like duplication waiting to be factored out. It is not debt — it is the decision. Do not lift it into a Collection, a dataset, or a grid component, and do not couple two snapshots to a shared component so that changing one Event's page can change another's. Reproducing the same visual grid twice across two Events is the cheaper mistake.

The legacy implementation is a visual specification only (ADR-0001), and its data files are a content source, not a structure to mirror. A snapshot still renders its own Sponsor band, consistent with ADR-0006.

## Consequences

Snapshot pages are long, and their content is edited by editing the page. There is no schema validating the roster and no type safety across entries, so a malformed record surfaces in the rendered page rather than at build time — which is what the page's Playwright spec is for.

A snapshot is finished. Changes to it should be corrections of the capture, not updates to the content: if the rendered page no longer matches the Event as it was, that is a bug; if the Event's facts have moved on, they belong on a live page instead.
