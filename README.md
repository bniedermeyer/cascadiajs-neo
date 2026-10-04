# CascadiaJS

The website for [CascadiaJS](https://cascadiajs.com), the Pacific Northwest's web + AI developer conference. It's a static [Astro](https://docs.astro.build) site styled with [Tailwind CSS v4](https://tailwindcss.com/docs), with all content and data stored in this repo. It deploys to Netlify.

This README is the onboarding guide. Read it top to bottom once, then come back to the section you need.

- [Getting started](#getting-started)
- [How we work](#how-we-work)
- [Project map](#project-map)
- [Key terms](#key-terms)
- [Pages and routing](#pages-and-routing)
- [Layouts: which one to use](#layouts-which-one-to-use)
- [Content and data](#content-and-data)
- [Styling](#styling)
- [Recipes](#recipes)
- [Testing and CI](#testing-and-ci)
- [Working with an agent](#working-with-an-agent)
- [Gotchas](#gotchas)

New to Astro or Tailwind? Skim the Astro docs on [project structure](https://docs.astro.build/en/basics/project-structure/), [components](https://docs.astro.build/en/basics/astro-components/), [layouts](https://docs.astro.build/en/basics/layouts/) and [content collections](https://docs.astro.build/en/guides/content-collections/), and Tailwind's [core concepts](https://tailwindcss.com/docs/styling-with-utility-classes). This guide assumes you know that much.

## Getting started

**Prerequisites:** Node 22.12 or newer and [pnpm](https://pnpm.io/installation) 12.7 (pinned in `package.json` under `packageManager`). Use `pnpm`, never `npm` or `npx`. For one-off binaries, use `pnpm exec`.

```sh
pnpm install
pnpm dev          # http://localhost:4321
```

| Command        | What it does                                            |
| :------------- | :------------------------------------------------------ |
| `pnpm dev`     | Dev server with hot reload at `localhost:4321`          |
| `pnpm build`   | Production build to `dist/`                             |
| `pnpm preview` | Serve the built `dist/` locally                         |
| `pnpm check`   | Type-check `.astro` and `.ts` files (`astro check`)     |
| `pnpm lint`    | ESLint (`pnpm lint:fix` to auto-fix)                    |
| `pnpm test`    | Build, preview, and run the Playwright end-to-end suite |

A pre-commit hook (Husky + lint-staged) runs ESLint `--fix` and Prettier on staged files. Type checks and tests run in CI.

## How we work

### Issues and triage labels

We track work in [GitHub Issues](https://github.com/bniedermeyer/cascadiajs-neo/issues). Each issue carries one triage label:

| Label             | Meaning                                                                |
| :---------------- | :--------------------------------------------------------------------- |
| `needs-triage`    | New; a maintainer hasn't evaluated it yet                              |
| `needs-info`      | Waiting on the reporter for more detail                                |
| `ready-for-agent` | Fully specified. An agent can implement it unattended                  |
| `ready-for-human` | Needs a person: judgment calls, design taste, or access an agent lacks |
| `wontfix`         | Won't be actioned                                                      |

The `ready-for-agent` and `ready-for-human` labels decide who builds a ticket: an agent or you. An agent-ready issue has acceptance criteria an agent can verify without asking questions. If you pick up a `ready-for-agent` issue that falls short, relabel it instead of guessing.

### Branches, commits and PRs

- Branch off `main`, open a PR back into `main`.
- Commit messages use [Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`, `ci:`. Look at `git log` for the house style.
- CI must be green before merge. It runs lint, a Prettier check, `astro check`, a production build, and the Playwright suite. See [Testing and CI](#testing-and-ci).
- If your change alters something this README documents (layouts, routing, content shape, commands, workflow, recipes), update the matching section in the same PR.

### Decisions and vocabulary

- [`CONTEXT.md`](CONTEXT.md) is the glossary. Use its terms in code, issues and PRs.
- [`docs/adr/`](docs/adr/) holds the architecture decision records. Read the ADRs that touch an area before changing it. To reverse a decision, write a new ADR that supersedes the old one, and leave the old one in place.

## Project map

```text
src/
  pages/            Routes. File path = URL (see Pages and routing)
  layouts/          Page shells: Layout, EventLayout, MarkdownLayout, SimplePage
  components/       Presentational Astro components
    schedule/       Building blocks for the Event schedule page
    table/          Table primitives (used by the sponsorship brochure)
  shared/
    data/           JSON datasets, Event configs, shared types, data helpers
    site-defaults.ts  Site-wide title/description and the Featured Event
    route-path.ts   Normalized route path for canonical URLs
  assets/           Images processed by Astro (people, sponsor logos, page images)
  styles/global.css Tailwind entry point and design tokens
  content.config.ts Content collections and their Zod schemas
markdown/           Content pages (.md / .mdx), one file per page
public/             Files served as-is: share images, video, downloads, favicon
e2e/                Playwright tests
docs/
  adr/              Architecture decision records
  agents/           Config that agent skills read (issue tracker, labels, domain docs)
.agents/skills/     Agent skills (symlinked into .claude/skills/)
CONTEXT.md          Domain glossary
CLAUDE.md           Rules for coding agents (AGENTS.md is a symlink to it)
reference/          The previous site. Read-only; ignore it unless a task tells you otherwise
```

### Imports

Imports that cross top-level `src/` directories use path aliases, never `../`:

```ts
import EventLayout from "@layouts/EventLayout.astro";
import CtaButton from "@components/CtaButton.astro";
import { getTickets } from "@shared/data/events";
import hero from "@assets/images/hero-camper.png";
```

The aliases are `@components`, `@layouts`, `@shared` and `@assets`. Stylesheets stay relative (`../styles/global.css`). **ESLint fails on a relative import into an aliased directory**, including from `markdown/` and `e2e/`, so the pre-commit hook and CI will catch it.

## Key terms

The full glossary is in [`CONTEXT.md`](CONTEXT.md). You'll meet these four throughout the code:

- **Event**: one annual CascadiaJS conference, such as CascadiaJS 2026.
- **Event Key**: the short id that ties data to an Event: a year (`"2026"`) or the bucket `"previous"` for older sponsors. In code, a value that can only be a real year is typed `EventYear` and may be called `year`. Anything that can hold `previous` is an Event Key.
- **Featured Event**: the one Event the site-wide pages (homepage, header, footer, legal and general content pages) promote. `FEATURED_EVENT` in `src/shared/site-defaults.ts` sets it, and you change it when a new Event launches. An Event's own pages always refer to _that_ Event, never to the Featured Event.
- **Event Dataset**: an Event's Talks (each with its Speaker), Organizers, Tickets and Activities, stored under `src/shared/data/<year>/`. Sponsors and Testimonials span Events, so they aren't part of it.

## Pages and routing

There are two kinds of page.

**Hand-written pages** are `.astro` files in `src/pages/`. The file path is the URL: `src/pages/2026/schedule.astro` serves `/2026/schedule`. Use these for anything with custom structure: the homepage, the Event landing page, the schedule, Talk pages, and the legal pages.

**Content pages** are Markdown files in `markdown/`, served by two catch-all routes:

| File                                   | URL                         | Route                              |
| :------------------------------------- | :-------------------------- | :--------------------------------- |
| `markdown/code-of-conduct.md`          | `/code-of-conduct`          | `src/pages/[...slug].astro`        |
| `markdown/2026/attend.mdx`             | `/2026/attend`              | `src/pages/[year]/[...slug].astro` |
| `markdown/2026/next-steps/speakers.md` | `/2026/next-steps/speakers` | `src/pages/[year]/[...slug].astro` |

A file under a year folder only gets a page if that Event has a config in `src/shared/data/events/` (see [Launching a new Event](#launching-a-new-event)). Set `published: false` in frontmatter to keep a page out of the build.

A few more dynamic routes generate pages from data: `src/pages/2026/talks/[slug].astro` (one page per Talk with a `slug`) and `src/pages/[year]/sponsors/[slug].astro` (one page per Sponsor with a `description`, for each Event they sponsored). See Astro's [routing guide](https://docs.astro.build/en/guides/routing/) for how `[param]` and `[...rest]` routes and `getStaticPaths` work.

**URLs never end in a slash.** `/2026/attend` works; `/2026/attend/` doesn't. Write every internal link without a trailing slash. The root `/` is the only exception. An e2e test scans every built page and fails on a slashed internal link. `Layout` builds canonical URLs from `routePath()` in `src/shared/route-path.ts`. If a page needs its own path, call `routePath()` instead of reading `Astro.url.pathname`.

## Layouts: which one to use

| Layout           | Use it for                                                                           | What it adds                                                                                                                  |
| :--------------- | :----------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------- |
| `Layout`         | Site-wide pages that don't belong to an Event: homepage, legal pages, 404            | The whole document: `<head>` (title, description, canonical, Open Graph), site header and footer, global CSS                  |
| `EventLayout`    | Every page that belongs to an Event                                                  | Wraps `Layout`, adds the Event nav bar, and defaults the description and share image from the Event's config. Requires `year` |
| `MarkdownLayout` | Non-Event content pages. **Don't import it yourself.** The `[...slug]` route uses it | Wraps `Layout` and `SimplePage`, styles the Markdown, and appends Past Sponsors and Testimonials (toggled by frontmatter)     |
| `SimplePage`     | Any page that's mostly a column of text under a title bar                            | Not a full page: the grey title bar and a narrow (50%) or wide (70%) content column. Nest it inside `Layout` or `EventLayout` |

Rules of thumb:

- Start from the page's owner. If it belongs to an Event, use `EventLayout`; otherwise use `Layout`.
- Then decide the body. For a text-heavy page, nest `SimplePage` inside the layout. Look at `src/pages/2026/talks/[slug].astro` or `src/pages/[year]/sponsors/[slug].astro` for the pattern.
- `EventLayout` has a `hero` slot that renders above the Event nav (the 2026 landing page puts its video there). `SimplePage` has an `after-body` slot that renders outside the text column, which is where sponsor grids and testimonials go.
- **Pages own their sponsors section.** Only `MarkdownLayout` renders sponsors for you. On a hand-written page, place `SponsorsGrid` yourself and pass `year` (and `tiered`) or `exclude` as needed.

Wrap Markdown-derived HTML (an abstract, a description) in `MarkdownContent` to get prose styling for headings, lists and links.

## Content and data

### Content pages (`markdown/`)

The `markdown` collection schema in `src/content.config.ts` validates each file's frontmatter:

| Field              | Default    | Notes                                                 |
| :----------------- | :--------- | :---------------------------------------------------- |
| `title`            | (required) | Title bar text; the page's `<title>` is built from it |
| `description`      |            | Meta and Open Graph description                       |
| `width`            | `narrow`   | `narrow` or `wide` content column                     |
| `ogImage`          |            | Share image path under `public/`                      |
| `showSponsors`     | `true`     | Append the sponsors section                           |
| `showTestimonials` | `true`     | Append testimonials                                   |
| `published`        | `true`     | `false` leaves the page out of the build              |

Reference images in `src/assets/` by alias: `![alt](@assets/images/example.jpg)`.

**Use `.md` unless you need a component.** Plain Markdown plus inline HTML covers most pages. Rename to `.mdx` only when the page imports and renders an Astro component (such as `CtaButton` or `Callout`). MDX is stricter:

- Void tags must self-close: `<br />`, not `<br>`.
- Literal `{` and `}` in text must be escaped as `\{` and `\}`.
- HTML comments aren't allowed. Use `{/* ... */}`.

See [ADR-0012](docs/adr/0012-mdx-content-pages.md) and Astro's [MDX guide](https://docs.astro.build/en/guides/integrations-guide/mdx/).

### Data (`src/shared/data/`)

```text
src/shared/data/
  events/2026.config.ts   Event config: name, dates, venue, logo, nav, share defaults
  events.ts               Helpers: getEventConfig, getOrganizers, getTickets, getActivities, getActivity
  2026/                   The 2026 Event Dataset
    talks.json            Talks, each with an embedded speaker
    organizers.json
    tickets.json
    activities.json       Schedule items that aren't Talks (parties, hackathon, meals)
  sponsors.json           Every Sponsor, across all Events
  testimonials.json
  types.ts                Shared TypeScript types
```

You read data two ways:

- **Talks and Sponsors are content collections** (`talks2026`, `sponsors`), so read them with `getCollection("talks2026")` / `getEntry(...)` from `astro:content`. Their Zod schemas in `src/content.config.ts` are the single source of truth. The types in `types.ts` (`Talk`, `Person`, `Sponsor`) are inferred from them, so change the schema, not the type. Astro sorts collection entries by id, so each loader stamps an `order` field with the entry's position in the JSON file. Sort by `order` when a listing should follow file order.
- **Organizers, Tickets and Activities** are read through the helpers in `events.ts`, keyed by year: `getTickets("2026")`. The helpers **throw on an unknown year or Activity id**, so a typo fails the build instead of rendering an empty section.

A Speaker isn't a separate record: it lives inside its Talk as `speaker`. Organizers use the same `Person` shape. Person images are paths under `src/assets/` (for example `/events/2026/images/jane-doe.jpg` means `src/assets/events/2026/images/jane-doe.jpg`), and the build fails if the file is missing.

For the reasoning behind this split, see [ADR-0013](docs/adr/0013-event-pages-read-shared-datasets.md).

## Styling

Styling is Tailwind-first: use utility classes in markup, and reach for a `<style>` block only when Tailwind can't express the rule ([ADR-0003](docs/adr/0003-tailwind-first-styling.md)).

Design tokens live in the `@theme` block of `src/styles/global.css`:

- **Colors:** `sound-navy`, `cascade-blue`, `emerald-city-green`, `madrona-yellow`, `seafoam-cream`, `ink`, `cedar-cream`, `overcast-gray`, `mint`, used as `bg-sound-navy`, `text-madrona-yellow`, and so on.
- **Fonts:** `font-sans`, `font-display`, `font-serif` (served by Adobe Typekit).
- **Extra font sizes:** named sizes like `text-21`, `text-40` for values outside Tailwind's scale.

Use a token before an arbitrary value. If you need a new color or size, add a token rather than sprinkling `text-[23px]` around. Tailwind v4 is configured in CSS, not in a `tailwind.config.js`; see the [theme docs](https://tailwindcss.com/docs/theme).

Font Awesome icons are available site-wide (`<i class="fa-solid fa-...">`).

## Recipes

Checklists for the common changes. Run `pnpm dev` and look at the page, then `pnpm check` and `pnpm lint`, before you push.

### Add or edit a content page

1. Create `markdown/<name>.md` for a site-wide page, or `markdown/<year>/<name>.md` for an Event page.
2. Add frontmatter: at least `title`, and usually `description`. See the [field table](#content-pages-markdown).
3. Only if it needs a component: use `.mdx` and import the component with an alias.
4. Link to it without a trailing slash.

### Add a Talk and Speaker

1. Add an object to `src/shared/data/<year>/talks.json` in the position it should appear: `id`, `slug` (or `null` for no Talk page), `title`, `type` (`keynote`, `main`, `lightning`, `workshop`), optional `abstract` (Markdown), `tags`, `yt`, and a `speaker` object.
2. Put the speaker photo in `src/assets/events/<year>/images/` and reference it in `speaker.image`.
3. Optional: add a share card at `public/images/<year>/share/speaker-<name-slug>.png`. The Talk page uses it when the file exists.
4. For a Workshop with a registration page, set `registrationUrl` to a site-relative path and add the page under `markdown/<year>/workshops/`.
5. Place it on the schedule: add a `<TalkItem talk="<id>" />` in `src/pages/<year>/schedule.astro` (Workshops use `ShowItem`; follow the existing ones). The schedule shows only the Talks you place on it.

### Add a Sponsor

1. If they're new, add an object to `src/shared/data/sponsors.json`: `id`, `name`, `logo` (filename), optional `tier`, `url`, `description` (Markdown), `video`. Existing sponsors only need the year added to `events`.
2. Put the logo in `src/assets/images/sponsors/`.
3. Set `events` to every Event Key they sponsored, oldest first (e.g. `["2025", "2026"]`).
4. A `description` gives them a detail page at `/<year>/sponsors/<id>` for each year in `events` that has Event pages.

### Add an Organizer, Ticket or Activity

1. Edit the matching file in `src/shared/data/<year>/` (`organizers.json`, `tickets.json`, `activities.json`). The shapes are in `src/shared/data/types.ts`.
2. Organizer photos go in `src/assets/events/<year>/images/`.
3. A new Activity also needs placing on the schedule: reference it by `id` from `src/pages/<year>/schedule.astro` with `getActivity(year, id)`.

### Add a component

1. Create `src/components/<Name>.astro` (or a subfolder for a family, like `schedule/`).
2. Type its props with an `interface Props`, and use the shared types from `@shared/data/types` where they fit.
3. Style with Tailwind utilities and tokens.
4. If Markdown pages should use it, import it from an `.mdx` page.

### Launching a new Event

This happens once a year and touches several places. The steps below use 2027 as the example.

Start with config and data. Create `src/shared/data/events/2027.config.ts` modelled on `2026.config.ts` (name, dates, venue, logo, nav, share defaults). `events.ts` globs these configs, so the new file alone turns on the `markdown/2027/` and `/2027/sponsors/*` pages. Add `"2027"` to the `events` enum in `sponsorSchema` in `src/content.config.ts`: `EventYear` derives from it, so nothing type-checks with `"2027"` until you do. Then create `src/shared/data/2027/` with `talks.json`, `organizers.json`, `tickets.json` and `activities.json`, and register a `talks2027` collection in `src/content.config.ts` next to `talks2026`.

Next, the pages. The Event landing page, schedule and Talk pages are hand-written per Event, so create `src/pages/2027/` using the 2026 pages as a starting point and swap the year and collection name. Content pages go in `markdown/2027/`. Images go in `src/assets/events/2027/images/`, share images in `public/images/2027/share/`, and sponsors get `"2027"` added to their `events`.

Flip the launch switch on launch day, once the 2027 pages are ready: set `FEATURED_EVENT` to `"2027"` and update `DEFAULT_DESCRIPTION` in `src/shared/site-defaults.ts`. The homepage, header, footer and site-wide pages follow from that. Run the full test suite: several tests read `FEATURED_EVENT` and the data files, so they follow the switch too.

## Testing and CI

End-to-end tests live in `e2e/` and use [Playwright](https://playwright.dev/docs/intro). They run against a production build (`pnpm build && pnpm preview`), the same output Netlify deploys.

```sh
pnpm exec playwright install chromium   # once, to download the browser
pnpm test                               # whole suite
pnpm test e2e/talks.spec.ts             # one file
pnpm test --ui                          # Playwright's interactive runner
```

Many tests derive their cases from the data files (every Talk with a slug gets a page, every Sponsor with a description gets a detail page, and so on), so new data needs no new tests in most cases. Add or update a spec when you add a page, a route or a behavior.

If a dev server is already running on port 4321, Playwright reuses it instead of building. Stop `pnpm dev` before `pnpm test` if you want to test the real build.

CI (`.github/workflows/tests.yml`) runs on every PR and push to `main`:

1. **checks:** `pnpm lint`, `prettier --check .`, `pnpm check`
2. **build:** `pnpm build`
3. **playwright:** the e2e suite, after both pass. On failure, download the `playwright-report` artifact from the run to see what failed.

## Working with an agent

You can work on this repo by hand. If you use a coding agent such as Claude Code or Codex, it relies on the files below.

### What the agent reads

- **[`CLAUDE.md`](CLAUDE.md)**: Claude Code loads it at the start of every session, and `AGENTS.md` symlinks to it for other tools. It's the agent's rulebook and source of truth: stack, package manager, import rules, what's out of scope, and what it must never touch. This README explains the same project to people, so keep the two consistent. If you change a rule, change `CLAUDE.md`.
- **[`CONTEXT.md`](CONTEXT.md)** and **[`docs/adr/`](docs/adr/)** give the agent the domain vocabulary and past decisions. Skills read them before exploring code, and flag it when a change would contradict an ADR.
- **[`docs/agents/`](docs/agents/)** tells skills where issues live and which labels mean what.

### Repo hooks (Claude Code)

`.claude/settings.json` wires two hooks:

- **Dependency install on session start.** In cloud sessions (Claude Code on the web), it runs `pnpm install` so `node_modules` matches the lockfile. It does nothing locally.
- **Git guardrails.** It blocks the agent from running destructive git commands: `git push`, `reset --hard`, `clean -f`, `branch -D`, force pushes. You decide what leaves your machine.

### Skills

The skills come from [Matt Pocock's skills collection](https://github.com/mattpocock/skills), installed in `.agents/skills/` and pinned in `skills-lock.json`. Skim that repo's README to learn the philosophy. In Claude Code, invoke a skill with `/<name>`.

The repo installs more skills than we use. We use these:

| Skill                           | Reach for it when                                                                                                           | Example                                                         |
| :------------------------------ | :-------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------- |
| `grill-with-docs`               | You have an idea or plan and want it stress-tested before building. It also updates `CONTEXT.md` and ADRs as decisions land | `/grill-with-docs I want speaker pages to show past talks`      |
| `to-spec`                       | The conversation has settled what to build; turn it into an issue                                                           | `/to-spec`                                                      |
| `to-tickets`                    | A spec is too big for one PR; split it into issues with blocking order                                                      | `/to-tickets #42`                                               |
| `triage`                        | Issues need evaluating, labelling, and agent-ready briefs                                                                   | `/triage`                                                       |
| `implement`                     | Build an issue or spec end to end                                                                                           | `/implement #57`                                                |
| `tdd`                           | Build or fix something test-first (red, green, refactor)                                                                    | `/tdd the schedule should hide unpublished activities`          |
| `diagnosing-bugs`               | Something is broken, flaky or slow and the cause isn't obvious                                                              | `/diagnosing-bugs sponsor logos 404 on /2026/sponsors/temporal` |
| `code-review`                   | Review a branch against the repo's standards and its originating issue                                                      | `/code-review since main`                                       |
| `improve-codebase-architecture` | Periodically, to find modules worth deepening or simplifying                                                                | `/improve-codebase-architecture`                                |
| `handoff`                       | A session is getting long; hand the context to a fresh agent                                                                | `/handoff`                                                      |

### A typical flow

1. **Shape it.** `/grill-with-docs` on the idea until the open questions are gone.
2. **Write it down.** `/to-spec` creates the issue; `/to-tickets` splits it if it's large.
3. **Triage.** `/triage` labels each ticket `ready-for-agent` or `ready-for-human`.
4. **Build.** `/implement` (or `/tdd`) on an agent-ready ticket; pick up human-ready ones yourself.
5. **Review.** `/code-review` before opening the PR, then human review on the PR.
6. If the session runs long, `/handoff` and continue in a fresh one.

Agents do well here when the issue is specific. "Add the 2027 tickets from this table" works; "make the tickets section better" doesn't.

## Gotchas

- **No trailing slashes** in URLs or links. See [Pages and routing](#pages-and-routing).
- **`.md` vs `.mdx`:** use `.mdx` only for pages that render components, and follow its stricter syntax. See [Content pages](#content-pages-markdown).
- **Alias imports** across `src/` directories, never `../components/...`. ESLint enforces it. See [Imports](#imports).
