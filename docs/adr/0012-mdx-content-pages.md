# MDX Is Opt-In, Per Page, via File Extension

The `markdown` content collection's loader glob now matches `**/*.{md,mdx}` instead of `**/*.md` (`src/content.config.ts`), and `@astrojs/mdx` is registered as an Astro integration (`astro.config.mjs`). This makes MDX available to the collection, but it is opt-in per page: a page adopts MDX only by being authored with the `.mdx` extension. Every existing `.md` file is untouched by this change — the `@astrojs/mdx` integration only processes files it owns by extension, so plain Markdown continues to be parsed exactly as before, with no new parser, no new syntax rules, and no risk of an existing page silently breaking because MDX's stricter grammar rejected something in it.

The only page converted so far is `markdown/2026/childcare.mdx`, because it needs to render `CtaButton` — an actual Astro component — where the legacy markup used a bare `<div class="cta secondary">` wrapper. MDX supports importing and rendering components directly in content; plain Markdown does not.

**When to use `.mdx` vs `.md`.** Use `.mdx` only when a page needs to import and render an Astro component inline in its content — `CtaButton`, a future `Callout`, or similar. Keep `.md` for every page that only needs standard Markdown plus inline HTML (headings, lists, links, `<div>`/`<h2>` wrappers, etc.) as the existing pages already do; converting those to `.mdx` would buy nothing and would only expose them to MDX's stricter parsing for no benefit.

**MDX strictness rules to follow when authoring or converting a page:**

- Void HTML elements must be self-closing: `<br>` becomes `<br />`. MDX parses content as JSX-like, and a bare `<br>` is a parse error there even though it's valid HTML.
- Literal `{` and `}` in body text must be escaped (`\{`, `\}`), since MDX treats unescaped curly braces as the start of a JavaScript expression.
- HTML comments (`<!-- -->`) are not valid MDX and must be replaced with the JSX comment form, `{/* ... */}`.

These rules apply only inside `.mdx` files. `.md` files are unaffected and keep writing plain HTML comments and non-self-closed void tags exactly as before.

## Consequences

Converting an existing `.md` page to `.mdx` is a one-way strictness upgrade for that file: it must pass MDX's parser going forward, and any future edit to it needs to respect the escaping rules above. Reviewers should treat a `.md` → `.mdx` rename as a signal that the page now embeds real components, not just a syntax change.

**Alternatives considered.** Rendering `CtaButton`-equivalent markup as raw HTML (`set:html`) inside a `.md` file would avoid the MDX dependency entirely, but it reintroduces the class-name-driven styling (`div.cta.secondary`) this port is moving away from, and it can't type-check the component's props. Converting every markdown page to `.mdx` up front, rather than only as needed, would apply the stricter parser to pages that gain nothing from it.
