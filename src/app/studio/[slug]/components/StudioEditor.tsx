"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import type { UserRole } from "@/lib/auth/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { CtaSection, HeroSection, Page, Section } from "@/types/page";
import {
  clearLocalDraft,
  readLocalDraft,
  writeLocalDraft,
} from "@/lib/draft/draftStorage";
import { renderSection } from "@/lib/renderer/sectionRegistry";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  addSection,
  deleteSection,
  hydratePersistedDraft,
  loadDraftPage,
  moveSection,
  resetDraft,
  updateSectionProps,
} from "@/store/draftPageSlice";
import {
  publishFailed,
  publishStarted,
  publishSucceeded,
} from "@/store/publishSlice";
import { selectSection } from "@/store/uiSlice";

type StudioEditorProps = {
  initialPage: Page;
  userRole: UserRole;
};

const editableSectionTypes = ["hero", "featureGrid", "testimonial", "cta"] as const;

type PublishResponse = {
  created: boolean;
  version: string;
  changelog: string[];
  bump: string;
  error?: string;
};

export function StudioEditor({ initialPage, userRole }: StudioEditorProps) {
  const dispatch = useAppDispatch();
  const draftPage = useAppSelector((state) => state.draftPage.page);
  const dirty = useAppSelector((state) => state.draftPage.dirty);
  const publishState = useAppSelector((state) => state.publish);
  const selectedSectionId = useAppSelector(
    (state) => state.ui.selectedSectionId,
  );
  const selectedSection = useMemo(
    () =>
      draftPage?.sections.find((section) => section.id === selectedSectionId) ??
      draftPage?.sections[0] ??
      null,
    [draftPage, selectedSectionId],
  );

  useEffect(() => {
    const persistedDraft = readLocalDraft(initialPage.slug);

    if (persistedDraft.page) {
      dispatch(
        hydratePersistedDraft({
          page: persistedDraft.page,
          sourceSlug: initialPage.slug,
        }),
      );
      return;
    }

    if (persistedDraft.error) {
      clearLocalDraft(initialPage.slug);
    }

    dispatch(loadDraftPage({ page: initialPage, sourceSlug: initialPage.slug }));
  }, [dispatch, initialPage]);

  useEffect(() => {
    if (!draftPage || !dirty) {
      return;
    }

    writeLocalDraft(draftPage);
  }, [dirty, draftPage]);

  if (!draftPage) {
    return (
      <main className="studio-shell">
        <p className="studio-loading">Loading studio...</p>
      </main>
    );
  }

  return (
    <main className="studio-shell">
      <header className="studio-header">
        <div>
          <p className="eyebrow">Studio</p>
          <h1>{draftPage.title}</h1>
          <p className="studio-meta">
            Slug: {draftPage.slug} {dirty ? "• Unsaved draft" : "• Clean draft"}
          </p>
        </div>
        <nav aria-label="Studio actions" className="studio-actions">
          <Link className="button-link secondary-link" href={`/preview/${draftPage.slug}`}>
            Preview published
          </Link>
          <Link
            className="button-link"
            href={`/preview/${draftPage.slug}?draft=local`}
          >
            Preview draft
          </Link>
          <Button
            variant="secondary"
            type="button"
            onClick={() => {
              clearLocalDraft(initialPage.slug);
              dispatch(resetDraft(initialPage));
              dispatch(selectSection(initialPage.sections[0]?.id ?? null));
            }}
          >
            Reset draft
          </Button>
          {userRole === "publisher" ? (
            <Button
              className="publish-button"
              disabled={publishState.status === "publishing"}
              type="button"
              onClick={() => publishDraft(draftPage, dispatch)}
            >
              {publishState.status === "publishing" ? "Publishing..." : "Publish"}
            </Button>
          ) : null}
        </nav>
      </header>

      {publishState.message ? (
        <div
          className={
            publishState.status === "failed"
              ? "publish-message error"
              : "publish-message"
          }
          role="status"
        >
          {publishState.message}
        </div>
      ) : null}

      <div className="studio-grid">
        <aside className="studio-panel" aria-labelledby="sections-heading">
          <h2 id="sections-heading">Sections</h2>
          <div className="section-list">
            {draftPage.sections.map((section, index) => (
              <button
                className={
                  section.id === selectedSection?.id
                    ? "section-row active"
                    : "section-row"
                }
                key={section.id}
                type="button"
                onClick={() => dispatch(selectSection(section.id))}
              >
                <span>
                  {index + 1}. {section.type}
                </span>
                <span className="section-id">{section.id}</span>
              </button>
            ))}
          </div>

          <div className="add-section-group" aria-label="Add section">
            {editableSectionTypes.map((type) => (
              <Button
                className="compact-button"
                key={type}
                size="sm"
                variant="secondary"
                type="button"
                onClick={() => dispatch(addSection(type))}
              >
                Add {type}
              </Button>
            ))}
          </div>
        </aside>

        <section className="studio-panel" aria-labelledby="editor-heading">
          <h2 id="editor-heading">Editor</h2>
          {selectedSection ? (
            <SectionEditor section={selectedSection} />
          ) : (
            <p>No section selected.</p>
          )}
        </section>

        <section className="studio-preview" aria-labelledby="canvas-heading">
          <div className="canvas-header">
            <h2 id="canvas-heading">Canvas</h2>
            <p>Draft state renders here inside the Studio.</p>
          </div>
          <div className="canvas-frame">
            {draftPage.sections.map((section) => (
              <div className="canvas-section" key={section.id}>
                {renderSection(section)}
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

async function publishDraft(
  page: Page,
  dispatch: ReturnType<typeof useAppDispatch>,
) {
  dispatch(publishStarted());

  try {
    const response = await fetch("/api/publish", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(page),
    });
    const result = (await response.json()) as PublishResponse;

    if (!response.ok) {
      dispatch(publishFailed(result.error || "Publish failed."));
      return;
    }

    const summary = result.created
      ? `Published ${result.version} (${result.bump}): ${result.changelog.join(", ")}`
      : `No new release. Latest remains ${result.version}.`;

    dispatch(
      publishSucceeded({
        message: summary,
        version: result.version,
      }),
    );
  } catch {
    dispatch(publishFailed("Publish request failed."));
  }
}

function SectionEditor({ section }: { section: Section }) {
  const dispatch = useAppDispatch();
  const draftPage = useAppSelector((state) => state.draftPage.page);
  const sectionIndex =
    draftPage?.sections.findIndex((item) => item.id === section.id) ?? -1;
  const canMoveUp = sectionIndex > 0;
  const canMoveDown = draftPage
    ? sectionIndex >= 0 && sectionIndex < draftPage.sections.length - 1
    : false;

  return (
    <div className="editor-stack">
      <div className="move-actions">
        <Button
          disabled={!canMoveUp}
          size="sm"
          type="button"
          variant="secondary"
          onClick={() =>
            dispatch(moveSection({ sectionId: section.id, direction: "up" }))
          }
        >
          <ArrowUp aria-hidden="true" size={16} />
          Move up
        </Button>
        <Button
          disabled={!canMoveDown}
          size="sm"
          type="button"
          variant="secondary"
          onClick={() =>
            dispatch(moveSection({ sectionId: section.id, direction: "down" }))
          }
        >
          <ArrowDown aria-hidden="true" size={16} />
          Move down
        </Button>
      </div>

      {isHeroSection(section) ? <HeroFields section={section} /> : null}

      {isCtaSection(section) ? <CtaFields section={section} /> : null}

      {section.type !== "hero" && section.type !== "cta" ? (
        <p>
          Editing for {section.type} is intentionally locked in this module.
          Reordering still works.
        </p>
      ) : null}

      <Button
        variant="destructive"
        type="button"
        onClick={() => {
          dispatch(deleteSection(section.id));
          dispatch(selectSection(null));
        }}
      >
        <Trash2 aria-hidden="true" size={16} />
        Delete section
      </Button>
    </div>
  );
}

function HeroFields({ section }: { section: HeroSection }) {
  return (
    <>
      <TextField
        label="Heading"
        sectionId={section.id}
        propName="heading"
        value={section.props.heading}
      />
      <TextAreaField
        label="Sub heading"
        sectionId={section.id}
        propName="subHeading"
        value={section.props.subHeading}
      />
      <TextField
        label="Button text"
        sectionId={section.id}
        propName="buttonText"
        value={section.props.buttonText}
      />
      <TextField
        label="Button URL"
        sectionId={section.id}
        propName="buttonUrl"
        value={section.props.buttonUrl}
      />
    </>
  );
}

function CtaFields({ section }: { section: CtaSection }) {
  return (
    <>
      <TextField
        label="Heading"
        sectionId={section.id}
        propName="heading"
        value={section.props.heading}
      />
      <TextField
        label="Button label"
        sectionId={section.id}
        propName="buttonLabel"
        value={section.props.buttonLabel}
      />
      <TextField
        label="Button URL"
        sectionId={section.id}
        propName="buttonUrl"
        value={section.props.buttonUrl}
      />
    </>
  );
}

function isHeroSection(section: Section): section is HeroSection {
  return section.type === "hero";
}

function isCtaSection(section: Section): section is CtaSection {
  return section.type === "cta";
}

function TextField({
  label,
  propName,
  sectionId,
  value,
}: {
  label: string;
  propName: string;
  sectionId: string;
  value: string;
}) {
  const dispatch = useAppDispatch();
  const inputId = `${sectionId}-${propName}`;

  return (
    <div className="field-group">
      <label htmlFor={inputId}>{label}</label>
      <Input
        id={inputId}
        type="text"
        value={value}
        onChange={(event) =>
          dispatch(
            updateSectionProps({
              sectionId,
              props: {
                [propName]: event.target.value,
              },
            }),
          )
        }
      />
    </div>
  );
}

function TextAreaField({
  label,
  propName,
  sectionId,
  value,
}: {
  label: string;
  propName: string;
  sectionId: string;
  value: string;
}) {
  const dispatch = useAppDispatch();
  const inputId = `${sectionId}-${propName}`;

  return (
    <div className="field-group">
      <label htmlFor={inputId}>{label}</label>
      <Textarea
        id={inputId}
        rows={4}
        value={value}
        onChange={(event) =>
          dispatch(
            updateSectionProps({
              sectionId,
              props: {
                [propName]: event.target.value,
              },
            }),
          )
        }
      />
    </div>
  );
}
