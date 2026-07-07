"use client";

import { useMemo, useSyncExternalStore } from "react";
import { getDraftStorageKey, readLocalDraft } from "@/lib/draft/draftStorage";
import { renderSection } from "@/lib/renderer/sectionRegistry";
import type { Page } from "@/types/page";

type PreviewRendererProps = {
  publishedPage: Page;
  useLocalDraft: boolean;
};

export function PreviewRenderer({
  publishedPage,
  useLocalDraft,
}: PreviewRendererProps) {
  const rawDraft = useSyncExternalStore(
    subscribeToDraftStorage,
    () => window.localStorage.getItem(getDraftStorageKey(publishedPage.slug)),
    () => null,
  );
  const draftResult = useMemo(() => {
    if (!useLocalDraft || !rawDraft) {
      return {
        page: null,
        error: null,
      };
    }

    return readLocalDraft(publishedPage.slug);
  }, [publishedPage.slug, rawDraft, useLocalDraft]);

  const page = draftResult.page ?? publishedPage;

  return (
    <main className="page-shell" aria-label={page.title}>
      {useLocalDraft ? (
        <div className="preview-mode-banner" role="status">
          {draftResult.page
            ? "Local draft preview"
            : draftResult.error || "No local draft found. Showing published page."}
        </div>
      ) : null}
      {page.sections.length ? (
        page.sections.map(renderSection)
      ) : (
        <section className="section unsupported-section" role="status">
          <div className="section-inner">
            <h1>No sections available</h1>
            <p>This page loaded, but Contentful did not return any sections.</p>
          </div>
        </section>
      )}
    </main>
  );
}

function subscribeToDraftStorage(callback: () => void) {
  window.addEventListener("storage", callback);

  return () => window.removeEventListener("storage", callback);
}
