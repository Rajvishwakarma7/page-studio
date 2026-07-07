import { describe, expect, it } from "vitest";
import { samplePage } from "@/lib/fixtures/samplePage";
import { diffPages } from "@/lib/publish/diff";
import { getNextVersion } from "@/lib/publish/semver";
import type { Page } from "@/types/page";

function clonePage(page: Page): Page {
  return JSON.parse(JSON.stringify(page)) as Page;
}

describe("semver diff", () => {
  it("uses patch for text prop changes", () => {
    const nextPage = clonePage(samplePage);
    const hero = nextPage.sections[0];

    if (hero.type === "hero") {
      hero.props.heading = "A better headline";
    }

    const result = diffPages(samplePage, nextPage);

    expect(result.bump).toBe("patch");
    expect(getNextVersion("1.0.0", result.bump)).toBe("1.0.1");
  });

  it("uses minor for added sections", () => {
    const nextPage = clonePage(samplePage);
    nextPage.sections.push({
      id: "new-cta",
      type: "cta",
      props: {
        heading: "New CTA",
        buttonLabel: "Act now",
        buttonUrl: "/",
      },
    });

    const result = diffPages(samplePage, nextPage);

    expect(result.bump).toBe("minor");
  });

  it("uses major for removed sections", () => {
    const nextPage = clonePage(samplePage);
    nextPage.sections = nextPage.sections.slice(1);

    const result = diffPages(samplePage, nextPage);

    expect(result.bump).toBe("major");
  });
});
