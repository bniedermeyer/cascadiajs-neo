import type { EventConfig, EventYear } from "./types";

const configs = import.meta.glob<{ default: EventConfig }>(
  "@shared/data/events/*.config.ts",
  { eager: true },
);

/**
 * Events whose pages use the shared Event chrome (ADR-0010). Previous
 * years' content is deferred, so today this is just 2026. The dynamic
 * Event routes build their static paths from this list.
 *
 * Must not be imported by the Event configs (they are globbed here).
 */
export const EVENTS_WITH_PAGES: readonly EventConfig[] = Object.values(
  configs,
).map((mod) => mod.default);

/**
 * Find the Event with pages for an arbitrary Event Key (e.g. a route param or
 * a Sponsor's Event Key), or undefined when it has none.
 */
export function findEventWithPages(key: string): EventConfig | undefined {
  return EVENTS_WITH_PAGES.find((event) => event.year === key);
}

/**
 * Look up an Event's config by Event Key. Throws when the Event has no
 * config so a typo on a hand-written Event page fails the build.
 */
export function getEventConfig(year: EventYear): EventConfig {
  const config = findEventWithPages(year);
  if (!config) {
    throw new Error(`getEventConfig: no event config found for year "${year}"`);
  }
  return config;
}
