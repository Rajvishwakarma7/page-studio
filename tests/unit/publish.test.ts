import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { samplePage } from "@/lib/fixtures/samplePage";
import { publishPageSnapshot } from "@/lib/publish/releases";
import type { Page } from "@/types/page";

function clonePage(page: Page): Page {
  return JSON.parse(JSON.stringify(page)) as Page;
}

describe("publish snapshots", () => {
  const previousReleaseRoot = process.env.RELEASES_ROOT;

  beforeEach(async () => {
    process.env.RELEASES_ROOT = await mkdtemp(
      path.join(tmpdir(), "page-studio-releases-"),
    );
  });

  afterEach(() => {
    process.env.RELEASES_ROOT = previousReleaseRoot;
  });

  it("creates an initial immutable release", async () => {
    const result = await publishPageSnapshot(samplePage);

    expect(result.created).toBe(true);
    expect(result.version).toBe("1.0.0");
    expect(result.path).toContain("releases/home/1.0.0.json");
  });

  it("is idempotent for the same draft", async () => {
    await publishPageSnapshot(samplePage);
    const secondResult = await publishPageSnapshot(samplePage);

    expect(secondResult.created).toBe(false);
    expect(secondResult.version).toBe("1.0.0");
  });

  it("creates a patch release for text changes", async () => {
    await publishPageSnapshot(samplePage);
    const nextPage = clonePage(samplePage);
    const hero = nextPage.sections[0];

    if (hero.type === "hero") {
      hero.props.heading = "Updated heading";
    }

    const result = await publishPageSnapshot(nextPage);

    expect(result.created).toBe(true);
    expect(result.version).toBe("1.0.1");
    expect(result.bump).toBe("patch");
  });
});
