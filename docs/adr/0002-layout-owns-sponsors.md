# Layout Owns the Sponsors Section

The sponsors section appears on most pages and its content varies by event year. The layout component is responsible for rendering this section — pages do not manage sponsor content directly. When `showSponsors` is `false`, the section is omitted. When `true`, the layout pulls from a shared sponsors dataset for the current event year.

The alternative — a named slot that each page fills — would require every page to import and wire up sponsor data, creating duplication and making it easy to forget or misconfigure. Since sponsors are a cross-cutting concern that should be consistent across all pages for a given event year, centralizing it in the layout is the right boundary.
