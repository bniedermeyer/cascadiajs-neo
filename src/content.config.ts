import { defineCollection } from "astro:content";
import { file, glob } from "astro/loaders";
import { z } from "astro/zod";

const markdown = defineCollection({
  loader: glob({ base: "./markdown", pattern: "**/*.md" }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    width: z.enum(["narrow", "wide"]).default("narrow"),
    image: z.string().optional(),
    showSponsors: z.boolean().default(true),
    showTestimonials: z.boolean().default(true),
    published: z.boolean().default(true),
  }),
});

/** A Speaker or Organizer profile, shared across Talks and roster pages. */
export const personSchema = z.object({
  name: z.string(),
  image: z.string(),
  roles: z.array(z.enum(["speaker", "organizer"])),
  /** Descriptive position, e.g. "Lead Organizer", "Co-Emcee". */
  title: z.string().optional(),
  company: z.string().optional(),
  location: z.string().optional(),
  url: z.string().optional(),
  pronouns: z.string().optional(),
  social: z
    .array(
      z.object({
        type: z.enum(["linkedin", "x-twitter", "bluesky", "github"]),
        url: z.string(),
      }),
    )
    .optional(),
});

export const talkSchema = z.object({
  id: z.string(),
  /** Absent renders the title as plain text, not a link. */
  slug: z.string().optional(),
  title: z.string(),
  type: z.enum(["keynote", "main", "lightning", "workshop"]),
  abstract: z.string().optional(),
  tags: z.array(z.string()).optional(),
  yt: z.string().optional(),
  /** No separate slug -- lookups key on the Talk's id instead. */
  speaker: personSchema,
});

export const sponsorSchema = z.object({
  id: z.string(),
  tier: z
    .enum([
      "platinum",
      "diamond",
      "gold",
      "silver",
      "bronze",
      "community",
      "media",
    ])
    .optional(),
  logo: z.string(),
  name: z.string(),
  url: z.string().optional(),
  video: z.string().optional(),
  description: z.string().optional(),
  events: z.array(z.enum(["previous", "2025", "2026"])),
});

const talks = defineCollection({
  loader: file("./src/shared/data/2026/talks.json"),
  schema: talkSchema,
});
const sponsors = defineCollection({
  loader: file("./src/shared/data/sponsors.json"),
  schema: sponsorSchema,
});

export const collections = { markdown, talks, sponsors };
