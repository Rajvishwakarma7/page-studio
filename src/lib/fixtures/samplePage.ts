import type { Page } from "@/types/page";

export const samplePage: Page = {
  pageId: "fixture-home",
  slug: "home",
  title: "Homepage",
  sections: [
    {
      id: "fixture-hero",
      type: "hero",
      props: {
        heading: "Build pages with confidence",
        subHeading: "A schema-driven page studio for controlled landing pages.",
        buttonText: "Start editing",
        buttonUrl: "/studio/home",
      },
    },
    {
      id: "fixture-features",
      type: "featureGrid",
      props: {
        title: "Why teams use Page Studio",
        items: [
          {
            title: "Typed renderer",
            description: "Every section is validated before it reaches React.",
          },
          {
            title: "Draft workflow",
            description: "Editors can change and preview drafts safely.",
          },
          {
            title: "Immutable releases",
            description: "Publish creates versioned snapshots with changelogs.",
          },
        ],
      },
    },
    {
      id: "fixture-testimonial",
      type: "testimonial",
      props: {
        quote: "The workflow keeps our landing pages predictable.",
        author: "Demo Publisher",
      },
    },
    {
      id: "fixture-cta",
      type: "cta",
      props: {
        heading: "Ready to publish?",
        buttonLabel: "Open studio",
        buttonUrl: "/studio/home",
      },
    },
  ],
};

export function getFixturePageBySlug(slug: string) {
  if (slug !== samplePage.slug) {
    throw new Error(`Fixture page not found for slug: ${slug}`);
  }

  return samplePage;
}
