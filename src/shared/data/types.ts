/**
 * Shared record shapes for per-Event datasets, consumed by multiple
 * Schedule components -- unlike single-consumer shapes declared locally
 * elsewhere (e.g. `SponsorsGrid.astro`).
 */

import z from "astro/zod";
import { talkSchema, personSchema } from "../../content.config";
/**
 * A presentation delivered by a Speaker at an Event.
 *
 * Derived from the `talks` content collection's Zod schema, which is
 * the single source of truth for this shape -- see `content.config.ts`.
 */
export type Talk = z.infer<typeof talkSchema>;
/** A Speaker or Organizer profile, shared across Talks and roster pages.
 * Derived from the `person` content collection's Zod schema, which is
 * the single source of truth for this shape -- see `content.config.ts`.
 */
export type Person = z.infer<typeof personSchema>;

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
