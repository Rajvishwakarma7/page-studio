import { z } from "zod";

const buttonUrlSchema = z
  .string()
  .min(1)
  .refine((value) => value.startsWith("/") || URL.canParse(value), {
    message: "URL must be absolute or root-relative",
  });
const supportedSectionTypes = ["hero", "featureGrid", "testimonial", "cta"];

export const heroSectionSchema = z.object({
  id: z.string().min(1),
  type: z.literal("hero"),
  props: z.object({
    heading: z.string().min(1),
    subHeading: z.string().optional().default(""),
    buttonText: z.string().optional().default(""),
    buttonUrl: buttonUrlSchema.optional().default("/"),
  }),
});

export const featureGridItemSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional().default(""),
});

export const featureGridSectionSchema = z.object({
  id: z.string().min(1),
  type: z.literal("featureGrid"),
  props: z.object({
    title: z.string().min(1),
    items: z
      .array(z.union([z.string().min(1), featureGridItemSchema]))
      .default([]),
  }),
});

export const testimonialSectionSchema = z.object({
  id: z.string().min(1),
  type: z.literal("testimonial"),
  props: z.object({
    quote: z.string().min(1),
    author: z.string().min(1),
  }),
});

export const ctaSectionSchema = z.object({
  id: z.string().min(1),
  type: z.literal("cta"),
  props: z.object({
    heading: z.string().min(1),
    buttonLabel: z.string().min(1),
    buttonUrl: buttonUrlSchema,
  }),
});

export const unsupportedSectionSchema = z.object({
  id: z.string().min(1),
  type: z
    .string()
    .min(1)
    .refine((type) => !supportedSectionTypes.includes(type), {
      message: "Known section types must match their schema",
    }),
  props: z.record(z.string(), z.unknown()).default({}),
});

export const knownSectionSchema = z.discriminatedUnion("type", [
  heroSectionSchema,
  featureGridSectionSchema,
  testimonialSectionSchema,
  ctaSectionSchema,
]);

export const sectionSchema = z.union([
  knownSectionSchema,
  unsupportedSectionSchema,
]);

export const pageSchema = z.object({
  pageId: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1),
  sections: z.array(sectionSchema).min(1, "Page must include at least one section"),
});

export function validatePage(input: unknown) {
  return pageSchema.safeParse(input);
}
