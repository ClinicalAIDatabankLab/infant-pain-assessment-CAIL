# Neonatal Pain CDSS — React + NestJS

RTL Persian redesign of the neonatal pain decision-support prototype using React/Vite for the frontend and NestJS for authoritative scoring/recommendations.

## What changed

- Separate React frontend and NestJS API.
- In-memory encounter repository behind a PostgreSQL-ready repository interface.
- No authentication in version 1; a visible prototype warning is shown in the UI.
- PIPP, NIPS, CRIES and MPAT scoring moved to backend domain logic.
- Recommendation lookup is exact **scale × severity**. There is no cross-scale or severity-only fallback at lookup time.
- Every reachable result has at least one immediately visible non-medication recommendation.
- PIPP gestational-age selection is independent from initial gestational weeks; mismatch is a non-blocking warning.
- PIPP face-duration criteria remain 0–100% sliders with keyboard/touch/mouse interaction.
- Button hierarchy is inspired by MOE Aerospace while micro-interactions are adapted from Amicro and constrained by clinical accessibility rules.

## Important clinical-content note

This repository preserves treatment/recommendation wording available in the current supplied prototype. Where the source did not distinguish recommendations between scales, the same supported content is placed in each explicit matrix entry instead of inventing differences. Matrix entries carry `reviewStatus: requires-clinical-review` until the project team maps them to the final approved guideline references.

This application is a software prototype and does not issue medication orders.

## Structure

```text
apps/web                 React + Vite RTL interface
apps/api                 NestJS API
packages/clinical-domain shared scale/types contracts
packages/ui              shared semantic design tokens
tests/e2e                Playwright scenarios
verification             dependency-light domain/static checks
```

## Run locally

Requires Node.js 20+ and npm.

```bash
npm install
npm run dev:api
```

In a second terminal:

```bash
npm run dev:web
```

Open `http://localhost:5173`. The API runs at `http://localhost:3000/api`.

No PostgreSQL is needed for version 1. Data is lost whenever the API process restarts.

## Verification

Dependency-light checks:

```bash
npm run verify
```

After `npm install`, run the framework test suites and build:

```bash
npm test
npm run build
npm run test:e2e
```

## Core API

```text
GET  /api/scales
POST /api/recommend-scale
POST /api/assessments/evaluate
POST /api/encounters
GET  /api/encounters/:id
POST /api/encounters/:id/assessments
POST /api/encounters/:id/interventions
GET  /api/encounters/:id/summary
```

## Recommendation coverage invariant

`apps/api/test/recommendation-coverage.spec.ts` enumerates every score from zero through the maximum for each scale. Every reachable `scale + severity` must resolve to a package containing non-medication guidance, medical action text, escalation guidance, reassessment guidance and source metadata. Missing coverage raises `RecommendationCoverageError`; it never silently substitutes guidance from another scale.
