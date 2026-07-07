import type { Entry, EntrySkeletonType } from "contentful";
import { createContentfulClient } from "./contentfulClient";
import { getFixturePageBySlug } from "@/lib/fixtures/samplePage";
import { validatePage } from "@/lib/schema/pageSchema";
import type { Page } from "@/types/page";

type ContentfulEntry = Entry<EntrySkeletonType, undefined, string>;

type FetchPageOptions = {
  preview?: boolean;
};

const SECTION_TYPE_BY_CONTENT_TYPE: Record<string, string> = {
  Hero: "hero",
  CTA: "cta",
  Cta: "cta",
  FeatureGrid: "featureGrid",
  Featuregrid: "featureGrid",
  Feature_Grid: "featureGrid",
  Testimonial: "testimonial",
  hero: "hero",
  featureGrid: "featureGrid",
  featuregrid: "featureGrid",
  feature_grid: "featureGrid",
  featureGridSection: "featureGrid",
  testimonial: "testimonial",
  cta: "cta",
};

function isContentfulEntry(value: unknown): value is ContentfulEntry {
  return (
    typeof value === "object" &&
    value !== null &&
    "sys" in value &&
    "fields" in value
  );
}

function readStringField(
  fields: Record<string, unknown>,
  fieldNames: string | string[],
  fallback = "",
) {
  const names = Array.isArray(fieldNames) ? fieldNames : [fieldNames];

  for (const fieldName of names) {
    const value = fields[fieldName];
    const normalizedValue = normalizeText(value);

    if (normalizedValue) {
      return normalizedValue;
    }
  }

  return fallback;
}

function normalizeFeatureItems(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (typeof item === "string") {
        return item;
      }

      if (typeof item !== "object" || item === null) {
        return null;
      }

      const record = item as Record<string, unknown>;
      const fields = isContentfulEntry(item)
        ? (item.fields as Record<string, unknown>)
        : record;
      const title = readStringField(fields, ["title", "heading", "label"]);

      if (!title) {
        return null;
      }

      return {
        title,
        description: readStringField(fields, [
          "description",
          "body",
          "copy",
          "text",
        ]),
      };
    })
    .filter((item): item is string | { title: string; description: string } =>
      Boolean(item),
    );
}

function normalizeSection(entry: ContentfulEntry) {
  const contentType = entry.sys.contentType.sys.id;
  const type = SECTION_TYPE_BY_CONTENT_TYPE[contentType] ?? contentType;
  const fields = entry.fields as Record<string, unknown>;

  if (type === "hero") {
    return {
      id: entry.sys.id,
      type,
      props: {
        heading: readStringField(fields, ["heading", "title", "headline"]),
        subHeading: readStringField(fields, [
          "subHeading",
          "subheading",
          "subtitle",
          "description",
          "body",
        ]),
        buttonText: readStringField(fields, [
          "buttonText",
          "buttonLabel",
          "ctaText",
          "label",
        ]),
        buttonUrl: readStringField(
          fields,
          ["buttonUrl", "buttonURL", "url", "href"],
          "/",
        ),
      },
    };
  }

  if (type === "featureGrid") {
    return {
      id: entry.sys.id,
      type,
      props: {
        title: readStringField(fields, ["title", "heading"]),
        items: normalizeFeatureItems(fields.items),
      },
    };
  }

  if (type === "testimonial") {
    return {
      id: entry.sys.id,
      type,
      props: {
        quote: readStringField(fields, ["quote", "body", "text"]),
        author: readStringField(fields, ["author", "name", "person"]),
      },
    };
  }

  if (type === "cta") {
    return {
      id: entry.sys.id,
      type,
      props: {
        heading: readStringField(fields, ["heading", "title"]),
        buttonLabel: readStringField(fields, ["buttonLabel", "buttonText", "label"]),
        buttonUrl: readStringField(
          fields,
          ["buttonUrl", "buttonURL", "url", "href"],
          "/",
        ),
      },
    };
  }

  return {
    id: entry.sys.id,
    type,
    props: fields,
  };
}

function normalizePage(entry: ContentfulEntry) {
  const fields = entry.fields as Record<string, unknown>;
  const rawSections =
    fields.sections ?? fields.section ?? fields.blocks ?? fields.contentSections;
  const sections = Array.isArray(rawSections)
    ? rawSections.filter(isContentfulEntry).map(normalizeSection)
    : [];

  if (Array.isArray(rawSections) && rawSections.length > 0 && sections.length === 0) {
    const unresolvedIds = rawSections
      .map((section) =>
        typeof section === "object" && section !== null && "sys" in section
          ? (section as { sys?: { id?: string } }).sys?.id
          : null,
      )
      .filter(Boolean)
      .join(", ");

    throw new Error(
      `Contentful returned ${rawSections.length} unresolved section links${
        unresolvedIds ? ` (${unresolvedIds})` : ""
      }. Publish the referenced section entries or provide a valid CONTENTFUL_PREVIEW_TOKEN.`,
    );
  }

  return {
    pageId: readStringField(fields, ["pageId", "pageID", "internalName"], entry.sys.id),
    slug: readStringField(fields, "slug"),
    title: readStringField(fields, ["title", "pageTitle", "heading"]),
    sections,
  };
}

export async function getPageBySlug(
  slug: string,
  options: FetchPageOptions = {},
): Promise<Page> {
  if (process.env.CONTENTFUL_USE_FIXTURE === "true") {
    return getFixturePageBySlug(slug);
  }

  const response = await findPageEntry(slug, options.preview);
  const entry = response.items[0];

  if (!entry) {
    throw new Error(`Page not found for slug: ${slug}`);
  }

  const result = validatePage(normalizePage(entry));

  if (!result.success) {
    throw new Error(`Invalid Contentful page data: ${result.error.message}`);
  }

  return result.data;
}

async function findPageEntry(slug: string, preview?: boolean) {
  const client = createContentfulClient(preview ? "preview" : "delivery");
  const configuredPageType = process.env.CONTENTFUL_PAGE_CONTENT_TYPE;
  const pageContentTypes = [
    configuredPageType,
    "page",
    "Page",
    "landingPage",
    "landing_page",
  ].filter(Boolean) as string[];

  for (const contentType of pageContentTypes) {
    const response = await client.getEntries({
      content_type: contentType,
      "fields.slug": slug,
      include: 3,
      limit: 1,
    });

    if (response.items.length > 0) {
      return response;
    }
  }

  return {
    items: [],
  };
}

function normalizeText(value: unknown): string {
  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "number") {
    return String(value);
  }

  if (typeof value !== "object" || value === null) {
    return "";
  }

  if (isContentfulEntry(value)) {
    return readStringField(value.fields as Record<string, unknown>, [
      "title",
      "heading",
      "label",
      "name",
    ]);
  }

  const record = value as Record<string, unknown>;

  if (record.nodeType === "document" && Array.isArray(record.content)) {
    return record.content.map(normalizeText).filter(Boolean).join(" ").trim();
  }

  if (Array.isArray(record.content)) {
    return record.content.map(normalizeText).filter(Boolean).join(" ").trim();
  }

  if (typeof record.value === "string") {
    return record.value.trim();
  }

  if (typeof record.url === "string") {
    return record.url.trim();
  }

  return "";
}
