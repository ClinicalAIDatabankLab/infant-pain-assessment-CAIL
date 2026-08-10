# Neonatal Pain React + NestJS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the approved neonatal pain CDSS as a runnable React + NestJS workspace with exact scale×severity recommendation coverage, in-memory persistence, accessible RTL clinical UI, and explicit non-medication recommendations for every valid result.

**Architecture:** Use an npm-workspaces monorepo with `apps/web`, `apps/api`, `packages/clinical-domain`, and `packages/ui`. NestJS is authoritative for scoring, classification, recommendation lookup, warnings, and encounter persistence; React owns temporary form state and renders API results without deriving clinical recommendations locally. Recommendation data is an explicit typed matrix keyed by `ScaleKey` and `SeverityKey`, with no severity-only fallback.

**Tech Stack:** TypeScript, React, Vite, React Router, Motion, Tailwind CSS, NestJS, class-validator/class-transformer, Vitest, Testing Library, Supertest, Playwright, npm workspaces.

## Global Constraints

- Frontend: React + TypeScript + Vite.
- Backend: NestJS + TypeScript.
- First runnable persistence: in-memory repository; PostgreSQL-ready repository contract only.
- No authentication or roles in version 1.
- UI language/direction: Persian RTL.
- NestJS is authoritative for final scoring, severity classification, warnings, and recommendation lookup.
- Recommendation lookup is exact `scale + severity`; no generic fallback or cross-scale fallback.
- Every valid scale/severity matrix entry must include at least one non-medication action and at least one source reference.
- Do not invent clinical differences or recommendations unsupported by the current supplied source material.
- PIPP gestational-age criterion is independent from initial infant gestational age; mismatch is non-blocking.
- PIPP facial-expression controls are accessible 0–100 sliders and untouched sliders are incomplete.
- Non-medication recommendations are visible immediately after a completed assessment and are never hidden in `<details>`/collapsed UI.
- Clinical buttons use restrained MOE-style primary/secondary hierarchy plus Amicro-style spring/icon micro-interactions, with minimum 44×44px targets, visible focus, stable labels, and reduced-motion fallbacks.
- No magnetic/glare/sparkle motion on clinical workflow controls.
- Mother national ID must not be emitted to browser console or API logs.

---

## File Structure

```text
/mnt/data/neonatal-pain-cdss/
├─ package.json                     # npm workspace scripts
├─ tsconfig.base.json               # shared TS configuration
├─ apps/
│  ├─ api/
│  │  ├─ src/
│  │  │  ├─ main.ts
│  │  │  ├─ app.module.ts
│  │  │  ├─ clinical/
│  │  │  │  ├─ scoring.service.ts
│  │  │  │  ├─ recommendation.matrix.ts
│  │  │  │  ├─ recommendation.service.ts
│  │  │  │  └─ clinical.module.ts
│  │  │  ├─ assessments/
│  │  │  │  ├─ assessments.controller.ts
│  │  │  │  ├─ assessments.service.ts
│  │  │  │  └─ dto/evaluate-assessment.dto.ts
│  │  │  ├─ encounters/
│  │  │  │  ├─ encounters.controller.ts
│  │  │  │  ├─ encounters.service.ts
│  │  │  │  └─ dto/create-encounter.dto.ts
│  │  │  ├─ interventions/
│  │  │  │  ├─ interventions.controller.ts
│  │  │  │  └─ dto/record-interventions.dto.ts
│  │  │  └─ persistence/
│  │  │     ├─ assessment.repository.ts
│  │  │     └─ in-memory-assessment.repository.ts
│  │  └─ test/
│  │     ├─ scoring.spec.ts
│  │     ├─ recommendation-coverage.spec.ts
│  │     └─ assessments.e2e-spec.ts
│  └─ web/
│     ├─ src/
│     │  ├─ main.tsx
│     │  ├─ App.tsx
│     │  ├─ api/client.ts
│     │  ├─ app/routes.tsx
│     │  ├─ components/
│     │  │  ├─ ClinicalButton.tsx
│     │  │  ├─ WorkflowStepper.tsx
│     │  │  ├─ RecommendationPanel.tsx
│     │  │  └─ PrototypeBanner.tsx
│     │  ├─ features/
│     │  │  ├─ infant-context/InfantContextForm.tsx
│     │  │  ├─ assessment/AssessmentRenderer.tsx
│     │  │  ├─ assessment/PippAssessment.tsx
│     │  │  ├─ assessment/GenericScaleAssessment.tsx
│     │  │  ├─ intervention/InterventionRecorder.tsx
│     │  │  ├─ reassessment/ReassessmentPanel.tsx
│     │  │  └─ documentation/DocumentationSummary.tsx
│     │  ├─ pages/
│     │  │  ├─ ClinicalWorkflowPage.tsx
│     │  │  ├─ QuickAssessmentPage.tsx
│     │  │  ├─ ProceduresPage.tsx
│     │  │  └─ GuidePage.tsx
│     │  └─ styles/index.css
│     └─ test/
│        ├─ RecommendationPanel.spec.tsx
│        ├─ WorkflowStepper.spec.tsx
│        └─ PippAssessment.spec.tsx
├─ packages/
│  ├─ clinical-domain/src/
│  │  ├─ index.ts
│  │  ├─ types.ts
│  │  ├─ scales.ts
│  │  └─ recommendations.ts
│  └─ ui/src/
│     ├─ index.ts
│     └─ tokens.css
└─ tests/e2e/clinical-workflow.spec.ts
```

---

### Task 1: Scaffold the Workspace and Shared Domain Contracts

**Files:**
- Create: `package.json`, `tsconfig.base.json`
- Create: `packages/clinical-domain/package.json`, `packages/clinical-domain/src/{index.ts,types.ts,scales.ts,recommendations.ts}`
- Create: `packages/ui/package.json`, `packages/ui/src/{index.ts,tokens.css}`
- Create: basic `apps/api` and `apps/web` package/config files
- Test: workspace TypeScript compilation smoke checks

**Interfaces:**
- Produces `ScaleKey`, `SeverityKey`, `InfantContext`, `AssessmentResult`, `RecommendationPackage`, `ClinicalWarning`, scale definitions and maximum scores.
- Later tasks import all shared clinical contracts from `@neonatal/clinical-domain`.

- [ ] **Step 1: Write a failing domain import smoke test** that imports every public type and scale definition from `@neonatal/clinical-domain` and asserts the four scale keys exist.
- [ ] **Step 2: Run the smoke test and confirm failure** because workspace packages do not yet exist.
- [ ] **Step 3: Create npm workspace files and exact shared contracts** from the approved design, including valid severity lists per scale.
- [ ] **Step 4: Add minimal React/Vite and NestJS package/config scaffolding** without clinical implementation.
- [ ] **Step 5: Install workspace dependencies and run the domain smoke test + TypeScript compilation.**

### Task 2: Implement Pure Scale Scoring and Severity Classification

**Files:**
- Create: `apps/api/src/clinical/scoring.service.ts`
- Create: `apps/api/test/scoring.spec.ts`
- Read behavioral source: latest `index_uiux_recommendations_complete.html` scale definitions and scoring functions.

**Interfaces:**
- Produces `scoreAssessment(scale, answers): ScoreResult` and pure helpers for PIPP percentage, HR delta, SpO₂ drop, gestational-age-category mapping, and mismatch detection.
- Consumes shared `ScaleKey`, `SeverityKey` and scale maxima.

- [ ] **Step 1: Write failing tests for every score/severity boundary** of PIPP, NIPS, CRIES, MPAT plus PIPP percentage thresholds 9/10/39/40/69/70.
- [ ] **Step 2: Write failing tests for PIPP HR/SpO₂ derived scores and gestational mismatch.**
- [ ] **Step 3: Run tests and verify red state.**
- [ ] **Step 4: Implement the minimal pure scoring/classification functions matching the existing prototype behavior.**
- [ ] **Step 5: Run scoring tests and verify all pass.**

### Task 3: Build the Explicit Scale × Severity Recommendation Matrix

**Files:**
- Create: `apps/api/src/clinical/recommendation.matrix.ts`
- Create: `apps/api/src/clinical/recommendation.service.ts`
- Create: `apps/api/test/recommendation-coverage.spec.ts`
- Source: recommendation content in the latest HTML prototype; preserve wording/source status rather than inventing new clinical guidance.

**Interfaces:**
- Produces `RecommendationService.getRecommendation(scale, severity)`.
- Throws `RecommendationCoverageError` for unsupported/missing combinations.

- [ ] **Step 1: Write a failing coverage test** enumerating score `0..max` for all four scales, classifying each score and asserting an exact matrix entry exists.
- [ ] **Step 2: Assert every valid entry has `nonMedication.length > 0`, `medicalActionFa`, `escalationFa`, `reassessment.labelFa`, and `sourceRefs.length > 0`.**
- [ ] **Step 3: Write a failing missing-entry test** that expects `RecommendationCoverageError` and verifies no fallback occurs.
- [ ] **Step 4: Implement all explicit valid matrix entries** using source-supported content; entries may intentionally share identical content when the supplied source does not distinguish scales.
- [ ] **Step 5: Run coverage tests and verify pass.**

### Task 4: Implement In-Memory Persistence and NestJS Clinical API

**Files:**
- Create: persistence repository interface/adapter files
- Create: assessment/encounter/intervention DTOs, services, controllers, modules
- Create: `apps/api/test/assessments.e2e-spec.ts`

**Interfaces:**
- `POST /api/assessments/evaluate`
- `POST /api/encounters`
- `GET /api/encounters/:id`
- `POST /api/encounters/:id/assessments`
- `POST /api/encounters/:id/interventions`
- `GET /api/encounters/:id/summary`
- `GET /api/scales`
- `POST /api/recommend-scale`

- [ ] **Step 1: Write failing Supertest tests** for quick evaluation, encounter create/read, persisted assessment, interventions, summary, and validation errors.
- [ ] **Step 2: Add a logger-capture test** proving `motherNationalId` does not appear in API log output.
- [ ] **Step 3: Run E2E tests and verify red state.**
- [ ] **Step 4: Implement repository abstraction and process-local in-memory adapter.**
- [ ] **Step 5: Implement DTO validation, services, controllers, and global validation pipe.**
- [ ] **Step 6: Run API unit/E2E tests and verify pass.**

### Task 5: Create the React Design System and Accessible Clinical Buttons

**Files:**
- Create: `packages/ui/src/tokens.css`
- Create: `apps/web/src/components/ClinicalButton.tsx`
- Create: `apps/web/src/styles/index.css`
- Test: button component tests

**Interfaces:**
- `ClinicalButton` variants: `primary | secondary | danger | ghost` and states `loading | success | disabled`.
- Motion respects `prefers-reduced-motion`.

- [ ] **Step 1: Write failing component tests** for 44px minimum target class/style, keyboard focus, disabled/loading semantics, stable label, and reduced-motion branch.
- [ ] **Step 2: Implement semantic design tokens**: light clinical surfaces, navy/teal text hierarchy, primary blue-family gradient, outlined secondary controls, 8px spacing rhythm.
- [ ] **Step 3: Implement MOE-inspired primary/secondary hierarchy** with Amicro-inspired slide-arrow/icon-morph spring feedback using Motion, without magnetic/glare/sparkle behavior.
- [ ] **Step 4: Run component tests and accessibility assertions.**

### Task 6: Build the RTL Clinical Shell and Infant Context Workflow

**Files:**
- Create: `App.tsx`, routes, `ClinicalWorkflowPage.tsx`, `WorkflowStepper.tsx`, `InfantContextForm.tsx`, `PrototypeBanner.tsx`, API client.
- Test: `WorkflowStepper.spec.tsx` and form tests.

**Interfaces:**
- Five-stage wizard state: context → assessment → intervention → reassessment → documentation.
- Reached steps revisitable; future steps disabled.
- Context DTO includes mother national ID and gestational weeks.

- [ ] **Step 1: Write failing tests for RTL document direction, contextual Back behavior, reached-step navigation, and unreached-step disabling.**
- [ ] **Step 2: Write failing form tests** for visible labels, new infant fields, no console logging of mother national ID, and API-unavailable state preserving local form values.
- [ ] **Step 3: Implement shell, stepper, forms, prototype persistence warning, and API client.**
- [ ] **Step 4: Run shell/form tests.**

### Task 7: Rebuild NIPS, CRIES, and MPAT Assessment Components

**Files:**
- Create: `GenericScaleAssessment.tsx`, `AssessmentRenderer.tsx`
- Add assessment component tests.

**Interfaces:**
- Sends raw answers to `POST /api/assessments/evaluate`.
- Displays local completion count only; final score/recommendation comes from API.

- [ ] **Step 1: Write failing tests** for all criteria rendering and no local final recommendation derivation.
- [ ] **Step 2: Implement reusable criterion cards/radio controls** with accessible labels and 44px targets.
- [ ] **Step 3: Wire evaluation to API and render returned `AssessmentResult`.**
- [ ] **Step 4: Run component tests for all three scales.**

### Task 8: Rebuild PIPP with Independent Gestational Criterion and Sliders

**Files:**
- Create: `PippAssessment.tsx`
- Test: `PippAssessment.spec.tsx`

**Interfaces:**
- PIPP staged baseline → procedure → post assessment.
- Three 0–100% sliders expose raw percentages; backend performs final scoring.

- [ ] **Step 1: Write failing tests** for independent PIPP gestational category, mismatch warning non-blocking behavior, stage gating, untouched-slider incompleteness, and threshold aria-valuetext.
- [ ] **Step 2: Implement baseline HR/SpO₂ fields, gestational/behavior choices, procedure gate, post HR/SpO₂ fields, and three sliders.**
- [ ] **Step 3: Implement slider visual fill/value bubble/threshold markers and keyboard operation.**
- [ ] **Step 4: Submit to API and render backend result/warnings.**
- [ ] **Step 5: Run PIPP tests.**

### Task 9: Make Non-Medication Recommendations a First-Class Result and Intervention UI

**Files:**
- Create: `RecommendationPanel.tsx`, `InterventionRecorder.tsx`
- Test: `RecommendationPanel.spec.tsx`

**Interfaces:**
- `RecommendationPanel` accepts only the backend `RecommendationPackage`.
- `NonMedicationActions` renders first and fully expanded.
- Intervention recorder saves performed non-medication action IDs and physician-ordered medication flag where applicable.

- [ ] **Step 1: Write a failing test** asserting the first recommendation section is `اقدامات غیردارویی پیشنهادی`, with at least one visible action and no collapsed disclosure ancestor.
- [ ] **Step 2: Write failing tests** that scale and severity are visible, medical guidance is separate, and coverage-error responses show a blocking configuration alert with no substitute recommendation.
- [ ] **Step 3: Implement scan-friendly action cards/checks and separate medical/escalation/reassessment sections.**
- [ ] **Step 4: Implement intervention persistence endpoint wiring.**
- [ ] **Step 5: Run recommendation/intervention tests.**

### Task 10: Reassessment, Documentation, Quick Assessment, Guide and Procedures Pages

**Files:**
- Create remaining pages/components and tests.

**Interfaces:**
- Reassessment uses the same scale and exact backend recommendation logic.
- Quick assessment works without encounter ID.
- Documentation summary displays infant context, initial/reassessment results, warnings and performed interventions.

- [ ] **Step 1: Write failing tests** for reassessment comparison, quick mode, documentation summary, and procedure/guide routes.
- [ ] **Step 2: Implement reassessment and final documentation flow.**
- [ ] **Step 3: Implement quick/procedures/guide pages using migrated current content.**
- [ ] **Step 4: Run page tests.**

### Task 11: End-to-End Coverage and Regression Verification

**Files:**
- Create: `tests/e2e/clinical-workflow.spec.ts`
- Add root scripts for `test`, `test:api`, `test:web`, `test:e2e`, `build`.

**Interfaces:**
- Full workspace verification commands become the release gate.

- [ ] **Step 1: Write Playwright scenarios** for at least one score in every valid severity band for each scale.
- [ ] **Step 2: Assert exact response scale/severity, immediately visible non-medication action, separate medical guidance, reassessment guidance, and no generic fallback copy.**
- [ ] **Step 3: Add PIPP mismatch and slider keyboard E2E scenarios.**
- [ ] **Step 4: Run all unit, API integration, React component, E2E, TypeScript, and production-build commands.**
- [ ] **Step 5: Inspect browser console and API test logs for errors and sensitive-data leakage.**
- [ ] **Step 6: Package the complete `neonatal-pain-cdss` project as a zip artifact plus README run instructions.**

## Self-Review

- Spec coverage: all approved architecture, UI, recommendation, persistence, PIPP, accessibility, and test requirements map to Tasks 1–11.
- Placeholder scan: no TBD/TODO/future-placeholder steps are required for version 1; PostgreSQL implementation is intentionally excluded per approved non-goals.
- Type consistency: all frontend/backend recommendation paths use `RecommendationPackage`; all score paths use `ScaleKey` + `SeverityKey`; persistence uses the single `AssessmentRepository` contract.
- Clinical-content constraint: Task 3 explicitly migrates only source-supported content and forbids fabricated differences.
