import { validatePage } from "@/lib/schema/pageSchema";
import type { Page } from "@/types/page";

export function getDraftStorageKey(slug: string) {
  return `page-studio:draft:${slug}`;
}

export function readLocalDraft(slug: string) {
  const rawDraft = window.localStorage.getItem(getDraftStorageKey(slug));

  if (!rawDraft) {
    return {
      page: null,
      error: null,
    };
  }

  try {
    const parsedDraft = validatePage(JSON.parse(rawDraft));

    if (!parsedDraft.success) {
      return {
        page: null,
        error: "Saved draft is invalid and cannot be previewed.",
      };
    }

    return {
      page: parsedDraft.data,
      error: null,
    };
  } catch {
    return {
      page: null,
      error: "Saved draft could not be read.",
    };
  }
}

export function writeLocalDraft(page: Page) {
  window.localStorage.setItem(getDraftStorageKey(page.slug), JSON.stringify(page));
}

export function clearLocalDraft(slug: string) {
  window.localStorage.removeItem(getDraftStorageKey(slug));
}
