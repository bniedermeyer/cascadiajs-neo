/**
 * Shared record shapes for per-Event datasets, consumed by multiple
 * Schedule components -- unlike single-consumer shapes declared locally
 * elsewhere (e.g. `SponsorsGrid.astro`).
 */

/** A presentation delivered by a Speaker at an Event. */
export type Talk = {
  id: string;
  /** Absent renders the title as plain text, not a link. */
  slug?: string;
  title: string;
  type: "keynote" | "main" | "lightning" | "workshop";
  abstract?: string;
  speaker: {
    /** No separate slug -- lookups key on the Talk's id instead. */
    name: string;
    image: string;
    company: string;
    location: string;
    url?: string;
    social?: {
      type: "linkedin" | "x-twitter" | "bluesky" | "github";
      url: string;
    }[];
  };
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
