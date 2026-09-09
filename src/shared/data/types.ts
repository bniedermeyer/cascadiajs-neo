/**
 * Shared record shapes for per-Event datasets, consumed by multiple
 * Schedule components -- unlike single-consumer shapes declared locally
 * elsewhere (e.g. `SponsorsGrid.astro`).
 */

/** A Speaker or Organizer profile, shared across Talks and roster pages. */
export interface Person {
  name: string;
  image: string;
  roles: ("speaker" | "organizer")[];
  /** Descriptive position, e.g. "Lead Organizer", "Co-Emcee". */
  title?: string;
  company?: string;
  location?: string;
  url?: string;
  social?: {
    type: "linkedin" | "x-twitter" | "bluesky" | "github";
    url: string;
  }[];
}

/** A presentation delivered by a Speaker at an Event. */
export type Talk = {
  id: string;
  /** Absent renders the title as plain text, not a link. */
  slug?: string;
  title: string;
  type: "keynote" | "main" | "lightning" | "workshop";
  abstract?: string;
  /** No separate slug -- lookups key on the Talk's id instead. */
  speaker: Person;
};

/**
 * A non-Talk happening at an Event, occurring at a stated time -- see
 * CONTEXT.md's Activity glossary entry. Renders in fixed order: icon ->
 * title (linked if `url`) -> titleSuffix -> image -> body -> slot -> cta.
 */
export type Activity = {
  id: string;
  /** Free text, never parsed (e.g. "5:30pm - 8:30pm"). */
  when: string;
  icon?: string;
  title: string;
  /** Renders as a link when present. */
  url?: string;
  target?: "_blank";
  titleSuffix?: string;
  image?: { src: string; alt: string };
  /** One string per paragraph. */
  body?: string[];
  cta?: {
    label: string;
    href: string;
    target?: "_blank" | "_discord";
    display: "inline" | "block";
    variant?: "secondary";
  };
};

/** A purchasable Ticket tier for an Event. */
export interface Ticket {
  name: string;
  subLabel?: string;
  price: string;
  includes: string[];
  footnotes: string[];
}

/** One entry in an Event's primary navigation. */
export interface EventNavItem {
  label: string;
  href: string;
  isCta?: boolean;
}

/** Per-Event site configuration (branding, dates, nav). */
export interface EventConfig {
  name: string;
  year: string;
  dates: string;
  venue: string;
  location: string;
  logo: string;
  ogImage: string;
  ogDescription: string;
  nav: EventNavItem[];
  cta?: { label: string; href: string };
}
