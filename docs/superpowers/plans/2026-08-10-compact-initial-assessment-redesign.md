# Compact Initial Assessment Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a compact two-section initial assessment matching the supplied RTL reference and expose every non-medication intervention with badges on context-recommended actions.

**Architecture:** Keep the existing workflow and API contracts intact. Add a single deduplicated non-medication catalog to the clinical-domain package, let `InfantContextForm` render the two compact initial sections plus the returned scale recommendation, and derive recommendation badges inside `InterventionRecorder` from the result's recommended action IDs.

**Tech Stack:** React 19, TypeScript 5.8, Vite 7, Vitest 3, Testing Library, workspace clinical-domain package, CSS design tokens.

## Global Constraints

- Preserve the existing `InfantContext`, scoring, recommendation, persistence, and API contracts.
- Do not render the word `اختیاری` in the initial assessment.
- Keep every supported non-medication action selectable; do not auto-select recommendations.
- Mark recommended non-medication actions with visible `پیشنهادشده` text, not color alone.
- Preserve semantic fieldsets, labels, keyboard focus, RTL ordering, and interaction targets of at least 44 pixels.
- Do not modify the unrelated existing change in `apps/web/vite.config.ts`.

---

## File Structure

- `packages/clinical-domain/src/recommendations.ts`: owns the deduplicated complete non-medication action catalog.
- `verification/domain-smoke.ts`: verifies catalog uniqueness and coverage of all recommendation actions.
- `apps/web/src/features/infant-context/InfantContextForm.tsx`: owns both compact initial-assessment sections, API error placement, and the scale-choice presentation.
- `apps/web/test/InfantContextForm.spec.tsx`: verifies initial-form semantics, concise copy, recommendation labels, and interaction callbacks.
- `apps/web/src/pages/ClinicalWorkflowPage.tsx`: passes recommendation, error, retry, and scale-choice state into the form.
- `apps/web/src/features/intervention/InterventionRecorder.tsx`: renders and saves selections from the complete action catalog.
- `apps/web/test/InterventionRecorder.spec.tsx`: verifies all actions render and non-recommended actions remain selectable.
- `apps/web/src/styles/index.css`: implements compact desktop, tablet, mobile, selected, focus, and badge styling.
- `design-qa.md`: records the screenshot comparison and final design-QA result.

---

### Task 1: Complete Non-medication Action Catalog

**Files:**
- Modify: `packages/clinical-domain/src/recommendations.ts`
- Modify: `verification/domain-smoke.ts`

**Interfaces:**
- Consumes: existing `ENVIRONMENT_ACTIONS` and `SUPPORTIVE_ACTIONS` arrays.
- Produces: `NON_MEDICATION_ACTION_CATALOG: NonMedicationAction[]`, exported through the existing `packages/clinical-domain/src/index.ts` wildcard export.

- [ ] **Step 1: Write the failing catalog coverage checks**

Add the import and assertions to `verification/domain-smoke.ts`:

```ts
import { NON_MEDICATION_ACTION_CATALOG } from '../packages/clinical-domain/src/recommendations';

const catalogIds = NON_MEDICATION_ACTION_CATALOG.map(action => action.id);
assert.equal(new Set(catalogIds).size, catalogIds.length, 'non-medication catalog IDs must be unique');
for (const recommendation of Object.values(RECOMMENDATION_MATRIX).flatMap(bySeverity => Object.values(bySeverity))) {
  for (const action of recommendation?.nonMedication ?? []) {
    assert.ok(catalogIds.includes(action.id), `catalog is missing ${action.id}`);
  }
}
```

Import `RECOMMENDATION_MATRIX` from `apps/api/src/clinical/recommendation.matrix` in the same file.

- [ ] **Step 2: Run the domain smoke test and confirm failure**

Run: `npm run test:domain`

Expected: TypeScript fails because `NON_MEDICATION_ACTION_CATALOG` is not exported.

- [ ] **Step 3: Add a stable deduplicated catalog**

Append to `packages/clinical-domain/src/recommendations.ts`:

```ts
export const NON_MEDICATION_ACTION_CATALOG: NonMedicationAction[] = [
  ...SUPPORTIVE_ACTIONS,
  ...ENVIRONMENT_ACTIONS,
].filter((action, index, actions) => actions.findIndex(candidate => candidate.id === action.id) === index);
```

Starting with `SUPPORTIVE_ACTIONS` keeps its concise action labels when duplicate IDs exist.

- [ ] **Step 4: Run domain verification**

Run: `npm run test:domain`

Expected: PASS with `domain smoke checks passed`.

- [ ] **Step 5: Commit the catalog slice**

```bash
git add packages/clinical-domain/src/recommendations.ts verification/domain-smoke.ts
git commit -m "feat: expose non-medication action catalog"
```

---

### Task 2: Compact Initial Assessment Component

**Files:**
- Create: `apps/web/test/InfantContextForm.spec.tsx`
- Modify: `apps/web/src/features/infant-context/InfantContextForm.tsx`
- Modify: `apps/web/src/pages/ClinicalWorkflowPage.tsx`

**Interfaces:**
- Consumes: `InfantContext`, `ScaleKey`, the existing `ClinicalButton`, and the page's current recommendation/error state.
- Produces: `InfantContextForm` props `recommended?: ScaleKey`, `onChooseScale?: (scale: ScaleKey) => void`, `error?: string`, and `onRetry?: () => void` in addition to existing props.

- [ ] **Step 1: Write failing initial-form tests**

Create `apps/web/test/InfantContextForm.spec.tsx` with these behavioral checks:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { EMPTY_CONTEXT, InfantContextForm } from '../src/features/infant-context/InfantContextForm';

describe('InfantContextForm', () => {
  it('renders two compact semantic sections without optional copy', () => {
    render(<InfantContextForm value={EMPTY_CONTEXT} onChange={vi.fn()} onSubmit={vi.fn()} />);
    expect(screen.getByRole('heading', {name:'اطلاعات نوزاد'})).toBeVisible();
    expect(screen.getByRole('heading', {name:'وضعیت و هدف ارزیابی'})).toBeVisible();
    expect(screen.queryByText(/اختیاری/)).toBeNull();
    expect(screen.getByRole('group', {name:'جنسیت'})).toBeVisible();
    expect(screen.getByRole('group', {name:'وضعیت بالینی'})).toBeVisible();
    expect(screen.getByRole('group', {name:'نوع ارزیابی'})).toBeVisible();
  });

  it('labels the recommended scale and keeps every scale selectable', async () => {
    const onChooseScale = vi.fn();
    render(<InfantContextForm value={EMPTY_CONTEXT} onChange={vi.fn()} onSubmit={vi.fn()} recommended="NIPS" onChooseScale={onChooseScale} />);
    expect(screen.getByText('پیشنهادشده')).toBeVisible();
    for (const scale of ['PIPP','NIPS','CRIES','MPAT']) expect(screen.getByRole('button', {name:new RegExp(scale)})).toBeVisible();
    await userEvent.click(screen.getByRole('button', {name:/NIPS/}));
    expect(onChooseScale).toHaveBeenCalledWith('NIPS');
  });
});
```

- [ ] **Step 2: Run the focused test and confirm failure**

Run: `npm run test -w @neonatal/web -- InfantContextForm.spec.tsx`

Expected: FAIL because the current component has one card, old headings, and no recommendation props.

- [ ] **Step 3: Refactor the form into two shallow sections**

In `InfantContextForm.tsx`:

- Import `ScaleKey` and define the four scale descriptions locally or in a focused constant.
- Change the root to `<form className="context-form">`.
- Render `<section className="clinical-card context-section context-section--infant">` for record ID, maternal national ID, gestational weeks, age, weight, and sex.
- Render `<section className="clinical-card context-section context-section--clinical">` for clinical flags, assessment type, error/retry, submit, and scale choices.
- Use headings `اطلاعات نوزاد` and `وضعیت و هدف ارزیابی`.
- Remove the maternal-ID logging helper and each recommendation explanation nested under clinical flags.
- Give number fields concise examples through `placeholder`, such as `مثلاً ۵`, `مثلاً ۲۸۵۰`, and `مثلاً ۳۶`.
- Keep existing controlled values, limits, input modes, submit prevention, and update behavior unchanged.
- When `recommended` exists, render all four scale buttons in stable `PIPP`, `NIPS`, `CRIES`, `MPAT` order; apply `is-recommended`, show `پیشنهادشده` only for the matching button, and call `onChooseScale?.(key)` from a `type="button"` control.
- Render the localized API error within the clinical section and connect its retry button to `onRetry`.

Use this prop type:

```ts
interface InfantContextFormProps {
  value: InfantContext;
  onChange: (value: InfantContext) => void;
  onSubmit: () => void;
  loading?: boolean;
  recommended?: ScaleKey;
  onChooseScale?: (scale: ScaleKey) => void;
  error?: string;
  onRetry?: () => void;
}
```

- [ ] **Step 4: Connect workflow state and remove the oversized recommendation card**

In `ClinicalWorkflowPage.tsx`, replace the step-one fragment with:

```tsx
{step === 1 ? (
  <InfantContextForm
    value={context}
    onChange={setContext}
    onSubmit={prepare}
    loading={loadingContext}
    recommended={encounterId ? recommended : undefined}
    onChooseScale={chooseScale}
    error={contextError}
    onRetry={prepare}
  />
) : null}
```

Delete page-local scale-description and scale-key constants when they are no longer referenced.

- [ ] **Step 5: Run the focused component test**

Run: `npm run test -w @neonatal/web -- InfantContextForm.spec.tsx`

Expected: PASS for both tests.

- [ ] **Step 6: Commit the initial-assessment behavior**

```bash
git add apps/web/src/features/infant-context/InfantContextForm.tsx apps/web/src/pages/ClinicalWorkflowPage.tsx apps/web/test/InfantContextForm.spec.tsx
git commit -m "feat: compact initial assessment workflow"
```

---

### Task 3: Full Intervention Catalog with Recommendation Badges

**Files:**
- Create: `apps/web/test/InterventionRecorder.spec.tsx`
- Modify: `apps/web/src/features/intervention/InterventionRecorder.tsx`

**Interfaces:**
- Consumes: `NON_MEDICATION_ACTION_CATALOG`, `AssessmentResult.recommendation.nonMedication`, and existing `saveInterventions`.
- Produces: unchanged `onSaved(items: RecordedIntervention[])` behavior with selected catalog actions.

- [ ] **Step 1: Write the failing intervention behavior test**

Create `apps/web/test/InterventionRecorder.spec.tsx`. Mock `saveInterventions`, render a `none`-severity result whose recommendation contains only `reduce-stimulation` and `positioning`, then assert:

```tsx
expect(screen.getAllByRole('checkbox')).toHaveLength(NON_MEDICATION_ACTION_CATALOG.length);
expect(screen.getAllByText('پیشنهادشده')).toHaveLength(2);
const sucrose = screen.getByRole('checkbox', {name:/سوکروز/});
await userEvent.click(sucrose);
await userEvent.click(screen.getByRole('button', {name:/ثبت مداخلات و ادامه/}));
expect(saveInterventions).toHaveBeenCalledWith('encounter-1', [
  expect.objectContaining({actionId:'sucrose', kind:'non-medication'}),
]);
```

Resolve the mocked request with `{saved:1, interventions:[recordedSucrose]}` and assert `onSaved` receives that recorded item.

- [ ] **Step 2: Run the focused test and confirm failure**

Run: `npm run test -w @neonatal/web -- InterventionRecorder.spec.tsx`

Expected: FAIL because the current selector renders only two recommended actions.

- [ ] **Step 3: Derive a recommended-first full catalog**

In `InterventionRecorder.tsx`:

```ts
const recommendedIds = new Set(result.recommendation.nonMedication.map(action => action.id));
const actions = [...NON_MEDICATION_ACTION_CATALOG].sort((left, right) =>
  Number(recommendedIds.has(right.id)) - Number(recommendedIds.has(left.id))
);
```

Render `actions` rather than `result.recommendation.nonMedication`. Add `is-recommended` to recommended labels and render `<small className="recommendation-badge">پیشنهادشده</small>` beside their action names. Non-recommended actions receive only the neutral `مداخله غیردارویی` support text.

Change the save mapping to filter `actions`, ensuring a selected non-recommended catalog item is included in the unchanged API payload.

- [ ] **Step 4: Run intervention and recommendation tests**

Run: `npm run test -w @neonatal/web -- InterventionRecorder.spec.tsx RecommendationPanel.spec.tsx`

Expected: PASS with the complete selector and the existing recommendation hierarchy intact.

- [ ] **Step 5: Commit the intervention behavior**

```bash
git add apps/web/src/features/intervention/InterventionRecorder.tsx apps/web/test/InterventionRecorder.spec.tsx
git commit -m "feat: show complete intervention catalog"
```

---

### Task 4: Compact Responsive Styling

**Files:**
- Modify: `apps/web/src/styles/index.css`
- Modify: `apps/web/test/InfantContextForm.spec.tsx`

**Interfaces:**
- Consumes: semantic class names introduced by Tasks 2 and 3 and existing UI tokens.
- Produces: compact desktop, tablet, and mobile presentation without altering component behavior.

- [ ] **Step 1: Add structure assertions before styling**

In `InfantContextForm.spec.tsx`, retain the render result and assert the stable hooks used by CSS:

```tsx
const {container} = render(...);
expect(container.querySelectorAll('.context-section')).toHaveLength(2);
expect(container.querySelector('.infant-details-grid')).toBeInTheDocument();
expect(container.querySelector('.clinical-choice-grid')).toBeInTheDocument();
expect(container.querySelector('.scale-choice-grid')).toBeInTheDocument();
```

- [ ] **Step 2: Run the focused test**

Run: `npm run test -w @neonatal/web -- InfantContextForm.spec.tsx`

Expected: PASS because Task 2 introduced the intended hooks; if a hook is missing, add only the missing semantic class before styling.

- [ ] **Step 3: Replace oversized initial-assessment rules**

In `apps/web/src/styles/index.css`:

- Make `.context-form` a grid with a 16-pixel gap and remove card styling from the form root.
- Use 20–24 pixel section padding, 14–18 pixel internal gaps, subtle border/shadow, and the existing radius tokens.
- Use `.infant-details-grid` with six compact columns at wide desktop, three columns below 1180 pixels, two below 900 pixels, and one below 600 pixels.
- Keep text/number inputs at 48 pixels and segmented radios at 48 pixels.
- Use `.clinical-layout` and `.clinical-choice-grid` to place clinical flags and assessment type in dense rows without support-copy blocks.
- Use `.scale-choice-panel` with the existing pale teal surface and `.scale-choice-grid` with four compact buttons.
- Give `.scale-choice.is-recommended` a teal border and surface plus a readable `.recommendation-badge`.
- Give `.performed-card.is-recommended` the same semantic treatment without changing checkbox behavior.
- Keep hover, native checked, and `:focus-visible` treatments visibly distinct.
- Update the existing 900-pixel and 600-pixel media queries so all new grids collapse without overflow and buttons stay at least 44 pixels tall.

- [ ] **Step 4: Run web tests and static verification**

Run: `npm run test -w @neonatal/web`

Expected: all Vitest tests pass.

Run: `npm run test:static && npm run test:web-contract`

Expected: both smoke checks pass.

- [ ] **Step 5: Commit the visual implementation**

```bash
git add apps/web/src/styles/index.css apps/web/test/InfantContextForm.spec.tsx
git commit -m "style: tighten assessment and intervention controls"
```

---

### Task 5: End-to-End and Visual Verification

**Files:**
- Modify: `tests/e2e/clinical-workflow.spec.ts`
- Create: `design-qa.md`

**Interfaces:**
- Consumes: the completed compact initial workflow and intervention catalog.
- Produces: repeatable regression coverage and a Product Design QA record with `final result: passed`.

- [ ] **Step 1: Add a browser regression for the initial workflow**

Add a Playwright test that mocks or starts the existing API, visits the clinical workflow route, verifies both headings, fills age and weight, chooses clinical context, submits, and confirms four scale buttons appear with exactly one `پیشنهادشده` label. Continue with a scale button and assert assessment step two is visible.

Use role-based locators mirroring the component tests:

```ts
await expect(page.getByRole('heading', {name:'اطلاعات نوزاد'})).toBeVisible();
await expect(page.getByRole('heading', {name:'وضعیت و هدف ارزیابی'})).toBeVisible();
await expect(page.getByText('پیشنهادشده')).toHaveCount(1);
await expect(page.locator('.scale-choice')).toHaveCount(4);
```

- [ ] **Step 2: Run the production build and full automated suite**

Run: `npm run build`

Expected: all workspace builds complete successfully.

Run: `npm test`

Expected: domain, API core, web contract, static, API, and web test suites all pass.

- [ ] **Step 3: Run the app for visual verification**

Start the API with `npm run dev:api` and the web app with `npm run dev:web -- --host 0.0.0.0`. Open the clinical workflow in the Codex in-app Browser at the active Vite URL.

- [ ] **Step 4: Compare against the supplied reference**

Capture the implementation at the reference's desktop width and compare it side-by-side with `C:/Users/alajv/AppData/Local/Temp/codex-clipboard-0a92fa29-53a1-4725-b1a4-4faf4938e8d9.png`. Also inspect 768-pixel and 320-pixel widths.

Record observed layout, spacing, typography, overflow, focus, selected-state, and badge issues in `design-qa.md`. Fix all P0, P1, and P2 findings, recapture, and repeat until the report ends with:

```md
final result: passed
```

- [ ] **Step 5: Exercise the complete interaction path**

Verify context data survives API errors, retry works, all four scales are selectable, every non-medication action is shown, recommended actions are labeled, and a non-recommended action can be saved.

- [ ] **Step 6: Commit the verification artifacts**

```bash
git add tests/e2e/clinical-workflow.spec.ts design-qa.md
git commit -m "test: verify compact assessment redesign"
```

