import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { validatePage } from "@/lib/schema/pageSchema";
import type { Page } from "@/types/page";
import { canonicalize } from "./canonicalize";
import { diffPages } from "./diff";
import { compareVersions, getNextVersion, isValidVersion } from "./semver";

type ReleaseSnapshot = {
  version: string;
  slug: string;
  pageHash: string;
  publishedAt: string;
  changelog: {
    bump: string;
    summary: string[];
  };
  page: Page;
};

type PublishResult = {
  created: boolean;
  version: string;
  path: string;
  changelog: string[];
  bump: string;
};

export async function publishPageSnapshot(page: Page): Promise<PublishResult> {
  const releasesDirectory = getReleaseDirectory(page.slug);
  await mkdir(releasesDirectory, { recursive: true });

  const latestRelease = await readLatestRelease(page.slug);
  const pageHash = hashPage(page);

  if (latestRelease && latestRelease.pageHash === pageHash) {
    return {
      created: false,
      version: latestRelease.version,
      path: getReleasePath(page.slug, latestRelease.version),
      changelog: ["Draft matches the latest release"],
      bump: "none",
    };
  }

  const diff = latestRelease
    ? diffPages(latestRelease.page, page)
    : {
        bump: "major" as const,
        changes: ["Initial release"],
      };
  const nextVersion = getNextVersion(latestRelease?.version ?? null, diff.bump);
  const releasePath = getReleasePath(page.slug, nextVersion);
  const snapshot: ReleaseSnapshot = {
    version: nextVersion,
    slug: page.slug,
    pageHash,
    publishedAt: new Date().toISOString(),
    changelog: {
      bump: diff.bump,
      summary: diff.changes.length ? diff.changes : ["No schema changes detected"],
    },
    page,
  };

  await writeFile(releasePath, `${JSON.stringify(snapshot, null, 2)}\n`, {
    encoding: "utf8",
    flag: "wx",
  });

  return {
    created: true,
    version: nextVersion,
    path: releasePath,
    changelog: snapshot.changelog.summary,
    bump: snapshot.changelog.bump,
  };
}

async function readLatestRelease(slug: string) {
  const releasesDirectory = getReleaseDirectory(slug);

  try {
    const files = await readdir(releasesDirectory);
    const versions = files
      .filter((file) => file.endsWith(".json"))
      .map((file) => file.replace(/\.json$/, ""))
      .filter(isValidVersion)
      .sort(compareVersions);
    const latestVersion = versions.at(-1);

    if (!latestVersion) {
      return null;
    }

    const release = JSON.parse(
      await readFile(getReleasePath(slug, latestVersion), "utf8"),
    ) as ReleaseSnapshot;
    const parsedPage = validatePage(release.page);

    if (!parsedPage.success) {
      return null;
    }

    return {
      ...release,
      page: parsedPage.data,
    };
  } catch {
    return null;
  }
}

function hashPage(page: Page) {
  return createHash("sha256").update(canonicalize(page)).digest("hex");
}

function getReleaseDirectory(slug: string) {
  return path.join(process.env.RELEASES_ROOT || process.cwd(), "releases", slug);
}

function getReleasePath(slug: string, version: string) {
  return path.join(getReleaseDirectory(slug), `${version}.json`);
}
