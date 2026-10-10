# Indexing and Analytics Switch On Only for the Live Site

Search indexing (the robots meta tag and robots.txt) and analytics (GA4 and Meta Pixel) are on only when a build is _live_: a Netlify production build (`CONTEXT=production`) whose main address (`URL`) is cascadiajs.com. Every other build is non-live, hidden from crawlers and untracked: local, CI, Deploy Previews, branch deploys, and the netlify.app production deploy before cutover. Going live is then "add the domain in Netlify, redeploy, flip DNS", with no code change and no list of manual edits to forget.

**Two conditions, not one.** `CONTEXT=production` alone is not enough. Migration Phase 4 ships a production deploy on netlify.app before the DNS change; `CONTEXT` would call that live and the duplicate of the legacy site would be indexed and tracked. Netlify already marks Deploy Previews and unpublished deploys with `X-Robots-Tag: noindex`, but not that production deploy, so the `URL` check is what protects it.

**Build time only.** The check is evaluated while building and never reaches client code. Its result is baked into the emitted HTML and robots.txt, so no `PUBLIC_` variable or runtime hostname test is involved.

**Frozen Snapshots.** The 2024 and 2025 Event pages are raw captured pages (ADR-0008) and cannot branch on the check. Their analytics stay inside `<!-- ANALYTICS DORMANT until cutover … -->` comments in source. A build step uncomments them when the build is live. It also verifies in every build, live or not, that the markers are present and fails if they are missing, so CI catches drift. The snapshot sources are never edited, consistent with ADR-0008: a snapshot changes only as a correction of the capture.

## Consequences

**Redeploy after adding the domain.** The `URL` Netlify provides reflects the main address at build time. After adding cascadiajs.com in Netlify, a fresh production deploy is required before the DNS change. Skipping it launches the site with `noindex` and no analytics, because the last build still saw the netlify.app address.

**Live behaviour is checked by hand.** CI and local builds carry no Netlify variables, so the automated suite only ever sees the non-live site (noindex everywhere, `Disallow: /`, no analytics traces). Live output is deliberately not built or tested in CI; after launch, confirm by hand that robots.txt allows crawling and lists the sitemap, and that a Layout page and a Frozen Snapshot page have no `noindex` and do have both analytics snippets.

## Considered Options

- **`CONTEXT=production` alone.** Rejected: indexes and tracks the pre-cutover netlify.app deploy.
- **Manual edits at cutover.** The previous approach. Rejected: several files must change at once and any miss launches the site de-indexed or untracked.
- **A client-side hostname check.** Rejected: robots meta and robots.txt are read without running script, and it would put the check in client code.
