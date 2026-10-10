# CascadiaJS

The annual Pacific Northwest JavaScript conference website. This site serves as the public home for all past and current editions of the conference.

## Language

**Event**:
One annual instance of the CascadiaJS conference (e.g., CascadiaJS 2024), identified by a slug like `cascadiajs-2024`.
_Avoid_: Edition, Year, Conference (when referring to a specific annual instance)

**Event Key**:
The short identifier used to associate data with an Event in local datasets — a bare year (`2026`, `2025`) or the catch-all bucket `previous` for pre-2025 sponsors. Distinct from the Event slug (`cascadiajs-2024`). Sponsors record their Event membership as an `events` array of Event Keys.
A single Event Key that is always a four-digit year may be named `year` in code; anything that can hold `previous` is an Event Key, never a year.
_Avoid_: Year (in prose, for the Event itself — say "the 2026 Event", not "the 2026 year")

**Featured Event**:
The one Event the site-wide pages — the homepage, legal pages, header, footer and non-Event markdown pages — promote and link to. It changes deliberately when a new Event launches, not by date, and not when a new Event's pages start being built. An Event's own pages refer to that Event, never to the Featured Event.
_Avoid_: Current Event, Upcoming Event, highlighted event

**Event Dataset**:
The records that belong to one Event and that its pages share: its Talks (each with its Speaker), Organizers, Tickets and Activities. Only an Event that is not a Frozen Snapshot has an Event Dataset. Sponsors and Testimonials are not part of it, because they span Events.
_Avoid_: Roster (for the whole set; a roster is only the people), Event data

**Talk**:
A presentation delivered by a Speaker at an Event.
_Avoid_: Session, Presentation

**Speaker**:
A person who delivers a Talk at an Event.
_Avoid_: Presenter

**Workshop**:
A hands-on, usually sponsor-led Talk at an Event. Like any Talk it has a Speaker and its own talk page, and it also has a separate registration/detail page of its own. Distinct from a Training, which is a paid post-conference Activity.
_Avoid_: Session, Tutorial

**Activity**:
A non-Talk happening at an Event, occurring at a stated time. It has its own identity, a description, and usually a registration or detail page — the Cascadia AI Hackathon, the Hacker Trains, the Welcome Reception, Karaoke, the post-conference Trainings.
_Avoid_: Session, Event (for a single happening — an Event is the whole conference)

**Incidental Activity**:
An Activity that needs no formalising: named by what it is rather than by a title, carrying no description or registration. Lunch, Breaks, Doors Open, Dinner, the Closing Ceremony, Day One Close. It still occupies a real time slot on the schedule.
_Avoid_: Filler, Placeholder

**Sponsor**:
A company or organization that financially supports an Event.
_Avoid_: Partner

**Testimonial**:
A public endorsement of CascadiaJS by an attendee or Speaker, displayed on the site. Each Testimonial currently originates as an X post and carries that post's identifier and permalink, but the concept is independent of where it was published.
_Avoid_: Tweet, Twitter Love

**Organizer**:
A person who runs an Event, credited with a role (Lead Organizer, Sponsorships, Co-Emcee, Volunteer). Distinct from a Speaker, though one person may be both across different Events.
_Avoid_: Staff, Team member

**Frozen Snapshot**:
The page for an Event that has already happened, captured once as a single self-contained Astro page: content inlined in the page's own frontmatter rather than loaded from a Collection or a shared dataset, assets copied to `public/images/events/<Event Key>/`, and links to unported routes collapsed to the Event root. It is never re-derived, and its inlined content is deliberately not extracted into components. See ADR-0008.
_Avoid_: Archive page, Snapshot page, Past event page

**MarkdownLayout**:
The Astro layout (`src/layouts/MarkdownLayout.astro`) that wraps `Layout.astro` and adds the page chrome ported from the legacy `simple-page` element. It is invoked with direct props (`title`, `description`, `width`) by the `markdown` Collection's dynamic route, not opted into via frontmatter. Its meta description is frontmatter `description`; if that is unset, root pages fall back to the meta title and year-scoped pages to the Event's default description. See ADR-0007.
_Avoid_: simple-page, page-layout (legacy Enhance names)

**Collection**:
An Astro content collection — a schema-validated set of content entries loaded from disk. The `markdown` collection holds standalone markdown pages (e.g. `welcome`), loaded by `glob` from the root-level `/markdown/` directory (a sibling of `src/`) and defined in `src/content.config.ts`.

**Entry / id (slug)**:
A single item in a Collection — for the `markdown` collection, one `.md` file. Its `id` (e.g. `welcome` for `/markdown/welcome.md`) becomes the route slug that `[...slug].astro` serves it at.

**Page-title bar**:
The overcast-gray banner at the top of a MarkdownLayout page holding the page's `<h1>` (rendered from frontmatter `title`), in sound-navy. Ported from `simple-page`'s `.page-title`.

**Width (narrow/wide)**:
A MarkdownLayout frontmatter value controlling the desktop body column width — `narrow` (50%, the default and the only value legacy markdown pages ever used) or `wide` (70%).
_Avoid_: Column, Size
