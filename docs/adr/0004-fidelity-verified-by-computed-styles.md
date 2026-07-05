# Fidelity Verified by Computed-Style Comparison, Not Pixel Snapshots

The visual fidelity bar in ADR-0001 is verified by comparing computed styles and element geometry (via `getComputedStyle` and bounding boxes) between the local site and the live legacy site at cascadiajs.com — not by screenshot pixel-diffing. A pixel diff only says _that_ something differs; a computed-style diff says _which property on which element_, which is what an agent needs to resolve drift. It is also the right abstraction for this port: Tailwind utilities and the legacy CSS should resolve to identical computed values even though class names and DOM structure differ.

The comparison is an on-demand tool run while porting or verifying a page, not part of the default test suite — it depends on the network and on the live site, which changes over time. The committed Playwright suite asserts only structure and behavior (routes render, URLs preserved, nav works). Because the two DOMs do not match one-to-one (Enhance custom elements vs. Astro output), each compared page needs an explicit map of corresponding selector pairs.

Do not add `toHaveScreenshot` baselines: screenshot regression testing was considered and rejected as non-diagnostic and brittle across rendering environments. Screenshots remain useful as side-by-side artifacts for human review, never as assertions.

The porting workflow this supports: base the styling on the reference repo (the visual spec, per ADR-0001), then compare the result against the live page and resolve differences.

Never use scripting (i.e. python, bash or node) to verify the live page. Use utilities that are present in Playwright or stop and explain the blocking problem and ask for how to proceed.
