# Tailwind-First Styling

Tailwind utility classes are the default styling approach for all components. Scoped `<style>` blocks in Astro components are permitted only when a CSS construct would be meaningfully harder to read as utility classes than as plain CSS — complex pseudo-selectors, `::before`/`::after` with `content`, or chained attribute selectors are the typical cases. The bar is readability, not preference or familiarity with CSS.

This rules out scoped styles for layout, spacing, color, and typography — anything Tailwind handles cleanly. It permits them for things like `a[target="_blank"]:after { content: "\f35d" }`, where the Tailwind equivalent would require awkward arbitrary values.

"We use Tailwind" is visible from the dependencies. The non-obvious part is the exception clause: developers porting components from the reference (which uses Web Component scoped styles throughout) should default to Tailwind and only reach for `<style>` when readability genuinely suffers.
