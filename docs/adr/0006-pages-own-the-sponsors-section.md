# Pages Own the Sponsors Section

Each page renders the sponsors section itself by placing a `SponsorsGrid` in its own markup and passing the props it wants (`event` to filter by Event Key, `tiered` to choose the layout). The Layout does not render, own, or gate the sponsors section. This **supersedes ADR-0002** ("Layout Owns the Sponsors Section").

ADR-0002 centralized sponsors in the Layout on the assumption that the band is a uniform, cross-cutting concern driven by the current event year. In practice which sponsors show, in which layout, and with what surrounding chrome is page-specific, and deriving it from the request path inside the Layout added hidden, hard-to-follow coupling. Making it an explicit per-page decision keeps the behavior local and prop-driven, with no URL sniffing. The home page renders `<SponsorsGrid />` with no props — the flat, all-sponsors A–Z layout.

## Consequences

The `showSponsors` Layout prop is removed; a page shows sponsors by rendering the component and omits them by not rendering it. There is no longer a single place that guarantees the band is consistent across pages — that consistency is now each page's responsibility.
