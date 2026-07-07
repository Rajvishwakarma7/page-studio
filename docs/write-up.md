# Page Studio Write-Up

## Problem Framing

The assignment asks for a lightweight Page Studio where authorized users can load Contentful pages, edit structured sections, preview drafts, and publish immutable versioned releases. The implementation prioritizes correctness and architecture over heavy visual polish.

## Key Decisions

- Next.js App Router acts as both frontend and backend.
- Contentful access is isolated to `src/lib/contentful`.
- Zod validates every normalized page before render or publish.
- Rendering uses one typed section registry with an unsupported-section fallback.
- Redux Toolkit owns editor state through `draftPage`, `ui`, and `publish` slices.
- Local draft preview uses `localStorage` and validates the draft before rendering.
- Publish writes immutable JSON snapshots with deterministic hashes and SemVer diffing.

## Trade-Offs

- Demo users are hardcoded as requested by the brief.
- Draft persistence is browser-local rather than database-backed.
- The Studio supports limited Hero and CTA prop editing, matching the brief scope.
- Fixture mode exists only for automated tests and CI where private Contentful credentials are unavailable.

## Accessibility Approach

Forms are labelled, focus states are visible, buttons and links are keyboard reachable, headings are ordered semantically, and reduced-motion preferences are respected. Playwright runs axe against preview and fails on critical violations.

## Not Included

- Registration, OAuth, forgot password, or database users
- Rich WYSIWYG editing beyond the specified lightweight controls
- Live Vercel deployment URL and screen recording, which are final submission artifacts
