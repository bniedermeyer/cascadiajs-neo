import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
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

export const collections = { markdown };
