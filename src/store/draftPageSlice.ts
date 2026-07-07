import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { CtaSection, HeroSection, Page, Section } from "@/types/page";

type DraftPageState = {
  page: Page | null;
  sourceSlug: string | null;
  dirty: boolean;
};

type UpdateSectionPropsPayload = {
  sectionId: string;
  props: Record<string, unknown>;
};

type MoveSectionPayload = {
  sectionId: string;
  direction: "up" | "down";
};

const initialState: DraftPageState = {
  page: null,
  sourceSlug: null,
  dirty: false,
};

function makeSectionId(type: Section["type"]) {
  return `${type}-${Date.now()}`;
}

function createBlankSection(type: "hero" | "featureGrid" | "testimonial" | "cta") {
  if (type === "hero") {
    return {
      id: makeSectionId(type),
      type,
      props: {
        heading: "New hero heading",
        subHeading: "Add supporting copy for this hero.",
        buttonText: "Get started",
        buttonUrl: "/",
      },
    } satisfies HeroSection;
  }

  if (type === "featureGrid") {
    return {
      id: makeSectionId(type),
      type,
      props: {
        title: "New feature grid",
        items: ["Feature one", "Feature two", "Feature three"],
      },
    } satisfies Section;
  }

  if (type === "testimonial") {
    return {
      id: makeSectionId(type),
      type,
      props: {
        quote: "Add a customer quote here.",
        author: "Customer name",
      },
    } satisfies Section;
  }

  return {
    id: makeSectionId(type),
    type,
    props: {
      heading: "Ready to begin?",
      buttonLabel: "Contact us",
      buttonUrl: "/",
    },
  } satisfies CtaSection;
}

export const draftPageSlice = createSlice({
  name: "draftPage",
  initialState,
  reducers: {
    loadDraftPage(
      state,
      action: PayloadAction<{
        page: Page;
        sourceSlug: string;
      }>,
    ) {
      state.page = action.payload.page;
      state.sourceSlug = action.payload.sourceSlug;
      state.dirty = false;
    },
    hydratePersistedDraft(
      state,
      action: PayloadAction<{
        page: Page;
        sourceSlug: string;
      }>,
    ) {
      state.page = action.payload.page;
      state.sourceSlug = action.payload.sourceSlug;
      state.dirty = true;
    },
    updateSectionProps(state, action: PayloadAction<UpdateSectionPropsPayload>) {
      const section = state.page?.sections.find(
        (item) => item.id === action.payload.sectionId,
      );

      if (!section) {
        return;
      }

      section.props = {
        ...section.props,
        ...action.payload.props,
      };
      state.dirty = true;
    },
    addSection(
      state,
      action: PayloadAction<"hero" | "featureGrid" | "testimonial" | "cta">,
    ) {
      if (!state.page) {
        return;
      }

      state.page.sections.push(createBlankSection(action.payload));
      state.dirty = true;
    },
    moveSection(state, action: PayloadAction<MoveSectionPayload>) {
      if (!state.page) {
        return;
      }

      const currentIndex = state.page.sections.findIndex(
        (section) => section.id === action.payload.sectionId,
      );
      const nextIndex =
        action.payload.direction === "up" ? currentIndex - 1 : currentIndex + 1;

      if (
        currentIndex < 0 ||
        nextIndex < 0 ||
        nextIndex >= state.page.sections.length
      ) {
        return;
      }

      const [section] = state.page.sections.splice(currentIndex, 1);
      state.page.sections.splice(nextIndex, 0, section);
      state.dirty = true;
    },
    deleteSection(state, action: PayloadAction<string>) {
      if (!state.page) {
        return;
      }

      state.page.sections = state.page.sections.filter(
        (section) => section.id !== action.payload,
      );
      state.dirty = true;
    },
    resetDraft(state, action: PayloadAction<Page>) {
      state.page = action.payload;
      state.sourceSlug = action.payload.slug;
      state.dirty = false;
    },
  },
});

export const {
  addSection,
  deleteSection,
  hydratePersistedDraft,
  loadDraftPage,
  moveSection,
  resetDraft,
  updateSectionProps,
} = draftPageSlice.actions;

export const draftPageReducer = draftPageSlice.reducer;
