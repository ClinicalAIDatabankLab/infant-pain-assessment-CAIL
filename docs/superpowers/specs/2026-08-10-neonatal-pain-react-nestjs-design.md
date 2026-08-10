# Neonatal Pain CDSS — React + NestJS Redesign Specification

**Date:** 2026-08-10
**Status:** Design approved in conversation; awaiting written-spec review before implementation planning.

## 1. Goal

Rebuild the existing single-file RTL neonatal pain decision-support prototype as a maintainable React + NestJS application while preserving its clinical workflow and improving the recommendation architecture so every valid **assessment scale × pain-severity** result resolves to an explicit recommendation package.

The redesign must preserve the existing PIPP, NIPS, CRIES, and MPAT assessment workflows, the initial infant information fields, PIPP percentage sliders, gestational-age mismatch warning, intervention capture, reassessment, and final documentation.

## 2. Approved Product Decisions

- Frontend: **React + TypeScript + Vite**.
- Backend: **NestJS + TypeScript**.
- Persistence strategy: **hybrid architecture**.
  - First runnable version uses an in-memory repository.
  - Repository contracts and data models are PostgreSQL-ready.
  - No database is required to launch the first version.
- Authentication/roles: **out of scope for version 1**.
- Recommendation lookup: **assessment scale + severity**, never severity alone.
- UI language and direction: **Persian, RTL**.
- Button inspiration:
  - visual hierarchy from `Mohammad-Aali/MOE-Aerospace-Website`;
  - micro-interactions from Amicro (`amicro.vercel.app` / `Subhan-code/Amicro--Micro-transitions-`);
  - React UI rules from `nextlevelbuilder/ui-ux-pro-max-skill`.

## 3. Source-of-Truth / Clinical-Safety Rule

This redesign changes software architecture and UI behavior; it does **not** invent new clinical guidance.

The recommendation engine will be keyed by `scale + severity`, but each matrix entry must be populated only from the supplied/current clinical source material or from separately verified clinical references. If the source does not distinguish two tools for a particular recommendation, the same source-supported recommendation may deliberately appear in both explicit matrix entries. The software must never fabricate a difference merely because the keys are different.

Each recommendation entry therefore carries provenance metadata:

```ts
interface RecommendationSource {
  id: string;
  label: string;
  section?: string;
  reviewStatus: 'source-transcribed' | 'clinician-reviewed' | 'requires-clinical-review';
}
```

No unsupported recommendation is silently substituted with a generic fallback.

## 4. Current Prototype Problem to Solve

The existing HTML correctly classifies scores by scale, but recommendation generation is still conceptually severity-only. A single `recommendationFor(levelKey)` function supplies the non-medication, medication, escalation, and reassessment text, while `scaleKey` is mainly rendered as a label in the recommendation UI.

That architecture makes it impossible to guarantee tool-specific recommendation coverage and makes missing entries easy to mask with a generic fallback.

The React/NestJS redesign must remove that failure mode entirely.

## 5. Monorepo Structure

```text
neonatal-pain-cdss/
├─ apps/
│  ├─ web/                         # React/Vite application
│  │  └─ src/
│  │     ├─ app/
│  │     ├─ pages/
│  │     ├─ features/
│  │     │  ├─ infant-context/
│  │     │  ├─ assessment/
│  │     │  ├─ intervention/
│  │     │  ├─ reassessment/
│  │     │  └─ documentation/
│  │     ├─ components/
│  │     ├─ hooks/
│  │     └─ styles/
│  └─ api/                         # NestJS application
│     └─ src/
│        ├─ clinical/
│        │  ├─ scales/
│        │  ├─ scoring/
│        │  └─ recommendations/
│        ├─ encounters/
│        ├─ assessments/
│        ├─ interventions/
│        └─ persistence/
├─ packages/
│  ├─ clinical-domain/             # Shared contracts and enums
│  └─ ui/                          # Shared React primitives/design tokens
└─ docs/
```

No premature microservices. One web app, one API, one domain package, and one reusable UI package are sufficient.

## 6. Clinical Domain Model

### 6.1 Scales

```ts
type ScaleKey = 'PIPP' | 'NIPS' | 'CRIES' | 'MPAT';

type SeverityKey =
  | 'none'
  | 'observe'
  | 'mild'
  | 'moderate'
  | 'severe';
```

Valid severity coverage follows the current scale classification behavior:

- PIPP: `none`, `moderate`, `severe` (`moderate` retains the current UI label «خفیف تا متوسط»).
- NIPS: `none`, `mild`, `moderate`, `severe`.
- CRIES: `none`, `mild`, `moderate`, `severe`.
- MPAT: `none`, `observe`, `mild`, `moderate`, `severe`.

Unsupported scale/severity combinations are invalid domain states rather than fallbacks.

### 6.2 Infant Context

```ts
interface InfantContext {
  recordId?: string;
  motherNationalId?: string;
  gestationalWeeks?: number;
  ageDays?: number;
  weightGrams?: number;
  sex?: 'male' | 'female';
  preterm: boolean;
  ventilated: boolean;
  chronicPain: boolean;
  postoperative: boolean;
  assessmentType: 'acute' | 'other';
}
```

`motherNationalId` is sensitive clinical data. In the no-auth/in-memory prototype it must not be logged to the browser console or API logs. The UI must visibly identify this build as a non-production prototype when no authentication/persistent security layer is present.

### 6.3 Assessment Result

```ts
interface AssessmentResult {
  id: string;
  encounterId?: string;
  scale: ScaleKey;
  score: number;
  severity: SeverityKey;
  severityLabelFa: string;
  completedCriteria: number;
  totalCriteria: number;
  measurements: Record<string, unknown>;
  recommendation: RecommendationPackage;
  warnings: ClinicalWarning[];
  createdAt: string;
}
```

## 7. Recommendation Matrix

### 7.1 Contract

```ts
interface NonMedicationAction {
  id: string;
  labelFa: string;
  rationaleFa?: string;
  applicability?: string[];
  contraindicationNoteFa?: string;
}

interface MedicationGuidance {
  summaryFa: string;
  physicianOrderRequired: true;
}

interface ReassessmentGuidance {
  labelFa: string;
  minMinutes?: number;
  maxMinutes?: number;
}

interface RecommendationPackage {
  scale: ScaleKey;
  severity: SeverityKey;
  titleFa: string;
  nonMedication: NonMedicationAction[];
  medication?: MedicationGuidance;
  medicalActionFa: string;
  escalationFa: string;
  reassessment: ReassessmentGuidance;
  sourceRefs: RecommendationSource[];
}
```

### 7.2 Storage

The version-1 matrix is a typed backend configuration:

```ts
const RECOMMENDATION_MATRIX: Record<ScaleKey, Partial<Record<SeverityKey, RecommendationPackage>>> = {
  PIPP: { /* explicit valid entries */ },
  NIPS: { /* explicit valid entries */ },
  CRIES: { /* explicit valid entries */ },
  MPAT: { /* explicit valid entries */ },
};
```

There is **no `default`, no `recommendationFor(severity)`, and no fallback to another scale**.

Lookup signature:

```ts
getRecommendation(scale: ScaleKey, severity: SeverityKey): RecommendationPackage
```

If an entry is missing, NestJS throws a typed `RecommendationCoverageError`. In the UI this becomes an explicit blocking configuration warning rather than displaying unrelated clinical guidance.

### 7.3 Coverage Test

A mandatory test enumerates every score from zero through each scale maximum, classifies it, and asserts that its exact `scale + severity` recommendation exists and includes:

- at least one `nonMedication` item;
- `medicalActionFa`;
- `escalationFa`;
- `reassessment`;
- at least one `sourceRefs` entry.

This test directly prevents recurrence of the current missing/generic non-medication-recommendation problem.

## 8. Scoring Architecture

Scoring is authoritative in NestJS and implemented as pure domain services.

```text
raw assessment answers
      ↓
DTO validation
      ↓
Scale scorer (PIPP/NIPS/CRIES/MPAT)
      ↓
Scale-specific severity classifier
      ↓
RecommendationMatrix.get(scale, severity)
      ↓
AssessmentResult
```

The React client may calculate local completion progress for UX, but it must not be the authoritative source for the final clinical score or recommendation.

PIPP-specific derived calculations remain explicit backend functions:

- gestational-age category score;
- heart-rate delta score;
- SpO₂ drop score;
- three 0–100% facial-expression percentage scores.

## 9. PIPP Gestational-Age Behavior

Initial infant gestational age and the PIPP gestational-age criterion remain independent inputs.

- The clinician can select any PIPP gestational-age category.
- Initial information never overwrites the PIPP selection.
- PIPP never writes back into initial information.
- If both are available and map to different PIPP scores, API/UI produce a non-blocking mismatch warning.
- The mismatch warning is preserved in the assessment result for documentation/audit purposes.

## 10. PIPP Percentage Controls

The three percentage-of-observation criteria remain range sliders, not button groups:

- range: `0–100`;
- step: `1`;
- live value bubble;
- visible thresholds at `0`, `10`, `40`, `70`, `100`;
- automatic score conversion;
- mouse, touch, and keyboard support;
- `aria-valuetext` announces both percentage and PIPP category;
- untouched slider is not treated as a completed criterion.

## 11. NestJS Modules and APIs

### 11.1 Modules

- `ClinicalScalesModule`: scale definitions and scale recommendation selection logic.
- `ScoringModule`: PIPP/NIPS/CRIES/MPAT scorers and classifiers.
- `RecommendationsModule`: matrix and coverage validation.
- `EncountersModule`: infant context and encounter lifecycle.
- `AssessmentsModule`: initial/quick/reassessment evaluation and storage.
- `InterventionsModule`: records performed non-medication/physician-ordered interventions.
- `PersistenceModule`: repository interfaces + in-memory adapters.

### 11.2 Core Endpoints

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

`POST /api/assessments/evaluate` works without an encounter so Quick Assessment remains available.

Example response:

```json
{
  "scale": "NIPS",
  "score": 4,
  "severity": "moderate",
  "severityLabelFa": "درد متوسط",
  "recommendation": {
    "scale": "NIPS",
    "severity": "moderate",
    "nonMedication": [],
    "medicalActionFa": "...",
    "escalationFa": "...",
    "reassessment": { "labelFa": "..." },
    "sourceRefs": []
  },
  "warnings": []
}
```

The implementation must reject the example above if `nonMedication` or `sourceRefs` is empty; those arrays are shown only to illustrate response shape.

## 12. Persistence Abstraction

```ts
interface AssessmentRepository {
  createEncounter(context: InfantContext): Promise<Encounter>;
  getEncounter(id: string): Promise<Encounter | null>;
  saveAssessment(encounterId: string, result: AssessmentResult): Promise<void>;
  saveInterventions(encounterId: string, interventions: RecordedIntervention[]): Promise<void>;
  getEncounterSummary(encounterId: string): Promise<EncounterSummary>;
}
```

Version 1 ships with `InMemoryAssessmentRepository`.

A later `PostgresAssessmentRepository` must be addable without changing controllers, scoring services, recommendation services, or React API contracts.

In-memory data is process-local and lost on restart; the UI must disclose that behavior in prototype mode.

## 13. React Application Architecture

### 13.1 Routes

```text
/                    → Clinical workflow
/quick               → Quick assessment
/procedures          → Procedure guidance
/guide               → Scale/reference guidance
/encounters/:id      → Existing in-memory encounter summary
```

### 13.2 Clinical Wizard

The main flow remains five stages:

1. **زمینه بالینی**
2. **ارزیابی درد**
3. **مداخله**
4. **ارزیابی مجدد**
5. **ثبت و گزارش**

Reached steps are revisitable. Unreached future steps remain unavailable. Back behavior is contextual and predictable.

### 13.3 Core React Components

```text
ClinicalShell
├─ ClinicalHeader
├─ WorkflowStepper
├─ InfantContextForm
├─ ScaleRecommendationCard
├─ AssessmentRenderer
│  ├─ PippAssessment
│  ├─ NipsAssessment
│  ├─ CriesAssessment
│  └─ MpatAssessment
├─ AssessmentResultCard
├─ RecommendationPanel
│  ├─ NonMedicationActions
│  ├─ MedicalGuidance
│  ├─ EscalationGuidance
│  └─ ReassessmentGuidance
├─ InterventionRecorder
├─ ReassessmentPanel
└─ DocumentationSummary
```

`RecommendationPanel` receives the exact `RecommendationPackage` from NestJS. It never derives clinical guidance from severity locally.

## 14. Non-Medication Recommendation UX

This is a primary requirement, not progressive-disclosure content.

After any completed valid assessment:

- The first visible recommendation section is **«اقدامات غیردارویی پیشنهادی»**.
- Actions are rendered as individual, scan-friendly items, not one long paragraph.
- In the intervention stage, each applicable action can be marked as performed.
- `scale` and `severity` are visible in the recommendation header.
- Medication/medical guidance is visually separate from non-medication actions.
- Escalation and reassessment appear after them.
- No `<details>` or collapsed container hides the non-medication list.

If a scale/severity matrix entry is missing, the UI displays a configuration error and cannot present a substitute recommendation.

## 15. Visual Design Direction

### 15.1 Overall UI

The application remains a calm, light clinical interface. The aerospace and Amicro references influence interaction design and button language, **not** the entire page aesthetic.

Principles:

- light neutral clinical canvas;
- strong navy/teal semantic hierarchy;
- restrained surfaces and borders;
- no decorative background animation behind clinical forms;
- consistent 8px spacing rhythm;
- minimum 16px body text;
- no color-only severity communication.

### 15.2 Button System

Buttons combine three sources of inspiration:

1. **MOE Aerospace**
   - clear primary vs secondary hierarchy;
   - restrained blue-family gradient for primary actions;
   - outlined secondary controls;
   - compact icon + label composition.

2. **Amicro**
   - pill/rounded geometry;
   - slide-arrow or icon-morph feedback;
   - spring press/hover response;
   - small positional changes instead of flashy transitions.

3. **UI/UX Pro Max rules**
   - minimum `44×44px` touch target;
   - visible focus state;
   - keyboard activation;
   - motion duration typically `150–300ms`;
   - reduced-motion alternative;
   - no reliance on hover.

Clinical adaptation rules:

- Primary workflow buttons: subtle gradient + slide-arrow icon movement.
- Confirm/save buttons: icon morph to check only after successful action.
- Secondary/back buttons: neutral outline/pill with gentle background change.
- Destructive/reset buttons: restrained neutral/red semantic treatment, no playful animation.
- **No magnetic button motion for clinical workflow controls.** Pointer-attraction motion can impair predictability and is reserved out of scope.
- **No continuous glare/sparkle effects on clinical actions.**

Example interaction states:

```text
default → hover/focus → pressed → loading → success/disabled
```

The label position must remain stable enough that clinicians do not have to chase moving targets.

## 16. Accessibility and Motion

- WCAG-oriented contrast target: 4.5:1 for normal text.
- Touch target: 44px minimum.
- Every input has a visible label.
- Every icon-only control has an accessible name.
- Strong `:focus-visible` treatment.
- `prefers-reduced-motion` disables spring translations/morph travel and uses opacity/color state changes instead.
- Severity is communicated by text + icon + color.
- Alerts use `role="status"` or `role="alert"` according to urgency.
- RTL keyboard/order behavior is tested explicitly.

## 17. State and Data Flow

React owns temporary form state; NestJS owns final evaluation logic.

```text
Infant form state ─────────────┐
                              ├─> API evaluate → AssessmentResult
Assessment answer state ──────┘                    │
                                                   ├─> Result UI
                                                   ├─> RecommendationPanel
                                                   └─> optional repository save
```

For Quick Assessment, the `encounterId` is absent.

For Clinical Workflow, the encounter is created at the end of stage 1 or immediately before the first persisted assessment.

## 18. Error Handling

### Validation errors
Shown inline beside the related field/criterion.

### PIPP gestational mismatch
Non-blocking warning with both initial-information value and selected PIPP category.

### Recommendation coverage error
Blocking configuration alert:

> «برای این ترکیب ابزار و سطح درد، توصیه معتبر در سامانه تعریف نشده است. نتیجه امتیاز نمایش داده می‌شود اما پیشنهاد درمانی جایگزین تولید نمی‌شود.»

### API unavailable
The UI must not silently fall back to local clinical scoring. It displays an API-unavailable state and preserves unsent form data in memory.

## 19. Testing Strategy

### Domain unit tests
- every scale score boundary;
- every PIPP percentage threshold;
- HR/SpO₂ derived scores;
- gestational-age mismatch logic;
- every valid `scale + severity` matrix entry;
- missing matrix entry throws `RecommendationCoverageError`.

### NestJS integration tests
- evaluate endpoint for all scales;
- quick mode without encounter;
- encounter persistence in memory;
- assessment + intervention + reassessment round trip;
- no mother-national-ID logging in tested logger output.

### React component tests
- wizard/back behavior;
- range slider keyboard operation;
- recommendation panel renders non-medication actions first;
- non-medication actions never render inside collapsed disclosure;
- loading, disabled, focus, success button states;
- mismatch warning non-blocking.

### End-to-end tests
For every scale, drive at least one score in every valid severity band and assert:

1. score and severity are correct;
2. recommendation response keys match the exact scale and severity;
3. at least one non-medication action is visible without additional click;
4. medical guidance is visible separately;
5. reassessment guidance is visible;
6. no generic fallback copy is used.

## 20. Non-Goals for Version 1

- authentication;
- nurse/physician/admin role authorization;
- production PostgreSQL deployment;
- edit-recommendation admin panel;
- EHR/HIS integration;
- prescribing or autonomous medication ordering;
- medical-content expansion beyond supplied/verified sources;
- animated marketing-page effects in clinical workflow.

## 21. Migration Strategy from Current HTML

The old HTML is treated as a behavioral reference, not copied wholesale.

Migration order:

1. extract scale definitions and scoring behavior into typed domain tests;
2. build recommendation matrix with explicit coverage;
3. implement NestJS evaluation endpoint;
4. build shared React design tokens/button primitives;
5. rebuild infant context and workflow shell;
6. rebuild each assessment tool independently;
7. implement recommendation/intervention stage;
8. implement reassessment and documentation;
9. run parity/regression tests against the existing prototype behavior.

## 22. Acceptance Criteria

The redesign is accepted when all of the following are true:

- React and NestJS run as separate applications in one workspace.
- The app runs without PostgreSQL using an in-memory repository.
- No authentication is required in version 1.
- PIPP, NIPS, CRIES, and MPAT can all be completed.
- PIPP percentage criteria use accessible 0–100 sliders.
- PIPP gestational-age input remains independent from initial information and produces a non-blocking mismatch warning when applicable.
- NestJS is authoritative for scoring/classification/recommendation.
- Recommendation lookup is exact `scale + severity`.
- Every valid scale/severity result has an explicit recommendation entry.
- Every recommendation entry has at least one source-supported non-medication action.
- Non-medication recommendations are immediately visible and not hidden in disclosure UI.
- Missing recommendation coverage produces an explicit configuration error, never a fallback recommendation.
- The button system combines restrained MOE hierarchy with Amicro-style micro-interactions while meeting clinical accessibility constraints.
- Reduced-motion mode is supported.
- All domain, API, component, and end-to-end coverage tests pass.
