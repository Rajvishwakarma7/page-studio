import type { Page, Section } from "@/types/page";
import { canonicalize } from "./canonicalize";
import type { VersionBump } from "./semver";

type DiffResult = {
  bump: VersionBump;
  changes: string[];
};

const bumpRank: Record<VersionBump, number> = {
  none: 0,
  patch: 1,
  minor: 2,
  major: 3,
};

const requiredPropsByType: Record<string, string[]> = {
  cta: ["heading", "buttonLabel", "buttonUrl"],
  featureGrid: ["title"],
  hero: ["heading"],
  testimonial: ["quote", "author"],
};

export function diffPages(previousPage: Page, nextPage: Page): DiffResult {
  let bump: VersionBump = "none";
  const changes: string[] = [];
  const previousSections = new Map(
    previousPage.sections.map((section) => [section.id, section]),
  );
  const nextSections = new Map(nextPage.sections.map((section) => [section.id, section]));

  if (previousPage.title !== nextPage.title) {
    bump = maxBump(bump, "patch");
    changes.push("Page title changed");
  }

  for (const previousSection of previousPage.sections) {
    const nextSection = nextSections.get(previousSection.id);

    if (!nextSection) {
      bump = maxBump(bump, "major");
      changes.push(`Removed ${previousSection.type} section ${previousSection.id}`);
      continue;
    }

    if (previousSection.type !== nextSection.type) {
      bump = maxBump(bump, "major");
      changes.push(`Changed section type for ${previousSection.id}`);
      continue;
    }

    const propBump = diffSectionProps(previousSection, nextSection);
    bump = maxBump(bump, propBump.bump);
    changes.push(...propBump.changes);
  }

  for (const nextSection of nextPage.sections) {
    if (!previousSections.has(nextSection.id)) {
      bump = maxBump(bump, "minor");
      changes.push(`Added ${nextSection.type} section ${nextSection.id}`);
    }
  }

  if (orderChanged(previousPage.sections, nextPage.sections)) {
    bump = maxBump(bump, "patch");
    changes.push("Section order changed");
  }

  return {
    bump,
    changes,
  };
}

function diffSectionProps(previousSection: Section, nextSection: Section): DiffResult {
  const changes: string[] = [];
  let bump: VersionBump = "none";
  const previousProps = previousSection.props as Record<string, unknown>;
  const nextProps = nextSection.props as Record<string, unknown>;
  const propNames = new Set([
    ...Object.keys(previousProps),
    ...Object.keys(nextProps),
  ]);
  const requiredProps = requiredPropsByType[previousSection.type] ?? [];

  for (const propName of propNames) {
    const hadProp = propName in previousProps;
    const hasProp = propName in nextProps;

    if (hadProp && !hasProp && requiredProps.includes(propName)) {
      bump = maxBump(bump, "major");
      changes.push(`Removed required ${previousSection.type}.${propName}`);
      continue;
    }

    if (!hadProp && hasProp) {
      bump = maxBump(bump, "minor");
      changes.push(`Added ${previousSection.type}.${propName}`);
      continue;
    }

    if (canonicalize(previousProps[propName]) !== canonicalize(nextProps[propName])) {
      bump = maxBump(bump, "patch");
      changes.push(`Changed ${previousSection.type}.${propName}`);
    }
  }

  return {
    bump,
    changes,
  };
}

function orderChanged(previousSections: Section[], nextSections: Section[]) {
  const previousOrder = previousSections.map((section) => section.id).join("|");
  const nextOrder = nextSections.map((section) => section.id).join("|");

  return previousOrder !== nextOrder;
}

function maxBump(current: VersionBump, next: VersionBump) {
  return bumpRank[next] > bumpRank[current] ? next : current;
}
