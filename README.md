# Page Studio

Page Studio is a Next.js App Router CMS-style assignment implementation. It loads landing pages from Contentful, validates the data with Zod, renders sections through a typed registry, supports role-based Studio editing with Redux, previews local drafts, and publishes immutable versioned snapshots.

## Run Locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Required Contentful variables:

```env
CONTENTFUL_SPACE_ID=
CONTENTFUL_ENVIRONMENT=master
CONTENTFUL_DELIVERY_TOKEN=
CONTENTFUL_PREVIEW_TOKEN=
SESSION_SECRET=
```

For local fixture mode without Contentful credentials:

```bash
CONTENTFUL_USE_FIXTURE=true SESSION_SECRET=dev-secret npm run dev
```

## Demo Users

- `viewer@test.com` / `password`: preview only
- `editor@test.com` / `password`: Studio editing
- `publisher@test.com` / `password`: Studio editing and publish

## Architecture

- `src/lib/contentful`: Contentful client and adapter. UI components never call Contentful directly.
- `src/lib/schema`: Zod page and section validation.
- `src/lib/renderer`: single section registry for schema-driven rendering.
- `src/store`: Redux Toolkit slices for `draftPage`, `ui`, and `publish`.
- `src/lib/publish`: deterministic diff, SemVer bump, hashing, and immutable release snapshot writing.
- `src/proxy.ts`: route-level RBAC for preview, studio, and publish API.

## Contentful Model

The app expects these content types:

- `page`: `pageId`, `slug`, `title`, `sections`
- `hero`: `heading`, `subHeading`, `buttonText`, `buttonUrl`
- `featureGrid`: `title`, `items`
- `testimonial`: `quote`, `author`
- `cta`: `heading`, `buttonLabel`, `buttonUrl`

The adapter normalizes linked Contentful entries into the internal `Page` schema and validates the result before rendering.

## Publish and SemVer

Publishing posts the current draft to `/api/publish`. The API validates the user role and page schema, computes a stable hash, and writes immutable snapshots to:

```text
releases/<slug>/<version>.json
```

Rules:

- Patch: text, prop, or order change
- Minor: added section or optional prop
- Major: removed section, changed section type, or removed required prop
- Same draft as latest release: idempotent, no new file

## Accessibility

The UI includes keyboard-operable controls, visible focus states, labelled forms, semantic headings, reduced-motion handling, and Playwright axe checks. CI uploads `test-results/a11y-report.json`.

## Quality Commands

```bash
npm run typecheck
npm run lint
npm run test
npm run build
npm run test:e2e
```

Run everything:

```bash
npm run test:all
```

## CI and Deployment

GitHub Actions:

- `.github/workflows/ci.yml`: typecheck, lint, unit tests, build, Playwright, axe, and report upload.
- `.github/workflows/vercel.yml`: production Vercel deployment workflow.

Required Vercel repository secrets:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

## Incomplete

A live Vercel URL and screen recording are submission-time artifacts. The deployment workflow and app code are present.
