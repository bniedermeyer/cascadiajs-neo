## Project

**Stack:** Astro. All new work is Astro only.

**Reference repo:** `reference/cascadiajs/` is a read-only, fixed-commit git submodule of the legacy Enhance implementation. Use it ONLY for visual fidelity, CSS, and design tokens.
- Never copy Enhance routing patterns, `$`/`$$` catch-all routes, or component patterns into Astro.
- Exclude it from all tooling: TypeScript, ESLint, Prettier, and Astro config.

**Acceptance bar:** The new app must be indistinguishable from the legacy site — visually, by URL, and behaviorally. URL preservation is in scope.

**Out of scope:**
- Luma ticketing integration
- Supabase backend
- Astra DB
- Storyblok
- Admin UI (a separate global admin experience exists; it is not ported here)
- Previous years' content (deferred)

**Assets and data** are stored locally in the repo.

## Agent skills

### Issue tracker

Issues live in GitHub Issues on bniedermeyer/cascadiajs-neo. See `docs/agents/issue-tracker.md`.

### Triage labels

Default five-role vocabulary (needs-triage, needs-info, ready-for-agent, ready-for-human, wontfix). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context — one `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.
