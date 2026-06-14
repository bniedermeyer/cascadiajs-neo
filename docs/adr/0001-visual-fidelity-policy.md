# Visual Fidelity Policy for Reference Port

When porting any component from the Enhance reference implementation to Astro, the rendered output must be visually identical to the original — same layout, colors, typography, and spacing. The implementation approach may differ: Tailwind utility classes are the right tool (see ADR-0003).

The reference codebase is a visual specification only. Look at what it renders, not how it's written. Reference CSS class names, property values lifted verbatim, and structural patterns from the Enhance codebase should not appear in the Astro implementation. The reference has accumulated inconsistencies and non-standard patterns over time; copying from it propagates those decisions without scrutiny. Reproduce the visual result using Tailwind utilities and brand tokens defined in `@theme`.

The acceptance bar is: a visitor cannot tell the difference between the legacy site and the new one. How that result is achieved is entirely up to the Astro implementation.
