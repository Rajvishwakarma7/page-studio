import type { z } from "zod";
import type {
  ctaSectionSchema,
  featureGridSectionSchema,
  heroSectionSchema,
  pageSchema,
  sectionSchema,
  testimonialSectionSchema,
} from "@/lib/schema/pageSchema";

export type Page = z.infer<typeof pageSchema>;
export type Section = z.infer<typeof sectionSchema>;
export type HeroSection = z.infer<typeof heroSectionSchema>;
export type FeatureGridSection = z.infer<typeof featureGridSectionSchema>;
export type TestimonialSection = z.infer<typeof testimonialSectionSchema>;
export type CtaSection = z.infer<typeof ctaSectionSchema>;
export type SectionType = Section["type"];
