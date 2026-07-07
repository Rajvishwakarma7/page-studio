import type { ReactElement } from "react";
import { CTA } from "@/components/sections/CTA";
import { FeatureGrid } from "@/components/sections/FeatureGrid";
import { Hero } from "@/components/sections/Hero";
import { Testimonial } from "@/components/sections/Testimonial";
import { UnsupportedSection } from "@/components/sections/UnsupportedSection";
import type { Section, SectionType } from "@/types/page";

type SectionComponent<TSection extends Section> = (props: {
  section: TSection;
}) => ReactElement;

type KnownSection = Extract<
  Section,
  { type: "hero" | "featureGrid" | "testimonial" | "cta" }
>;

type SectionRegistry = {
  [Type in KnownSection["type"]]: SectionComponent<Extract<Section, { type: Type }>>;
};

export const sectionRegistry = {
  hero: Hero,
  featureGrid: FeatureGrid,
  testimonial: Testimonial,
  cta: CTA,
} satisfies SectionRegistry;

export function renderSection(section: Section) {
  const Component = sectionRegistry[section.type as keyof typeof sectionRegistry] as
    | SectionComponent<Section>
    | undefined;

  if (!Component) {
    return <UnsupportedSection key={section.id} section={section} />;
  }

  return <Component key={section.id} section={section} />;
}

export function isRegisteredSectionType(type: SectionType) {
  return type in sectionRegistry;
}
