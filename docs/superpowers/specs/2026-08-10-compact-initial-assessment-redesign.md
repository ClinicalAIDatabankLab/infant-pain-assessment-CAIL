# Compact Initial Assessment Redesign

## Goal

Redesign the first step of the neonatal pain workflow to match the supplied compact RTL reference while preserving the clinical context required by the existing recommendation logic. The page should avoid oversized choice cards, excessive helper copy, and visible “optional” labels.

The intervention-selection step must expose the complete non-medication action catalog. Actions recommended for the current assessment result receive a visible `پیشنهادشده` badge, but every action remains selectable.

## Scope

This change affects the initial infant-context form, the scale recommendation presentation shown after that form is submitted, and the non-medication intervention selector. It does not change assessment scoring, medication guidance, API routes, persistence, or the remaining workflow steps.

## Initial Assessment Layout

The first step uses two compact, shallow sections inspired by the supplied screenshot.

### 1. Infant information

- Keep the existing infant and identifying fields because gestational age and other context participate in downstream clinical decisions.
- Present fields in a dense responsive grid with short labels and concise placeholders.
- Remove field-level helper copy that makes the card unnecessarily tall.
- Do not render the word “optional.” Empty fields remain accepted according to the existing data contract.
- Render sex choices as compact segmented radio controls rather than large tiles.

### 2. Clinical context and assessment purpose

- Place clinical flags and assessment type in the second compact section.
- Use short check and radio rows with a clear selected state, maintaining at least a 44-pixel interaction target.
- Do not include recommendation-specific explanatory text inside each choice tile.
- Keep the existing submit behavior and loading state.

### Scale recommendation

After a successful encounter and recommendation request, show the recommended scale within the second section rather than as a separate oversized card.

- Give the recommended scale the strongest visual emphasis and a `پیشنهادشده` label.
- Keep all other scales available as compact alternatives.
- Selecting any scale continues to assessment step two through the existing workflow state.
- API errors remain visible near the submit and recommendation area with the existing retry behavior.

## Non-medication Intervention Selection

Build one deduplicated catalog from the domain's supported non-medication actions. The selector renders the full catalog for every result.

For each action:

- The checkbox records whether the clinician actually performed the action.
- Membership in `result.recommendation.nonMedication` determines whether the `پیشنهادشده` badge is shown.
- Recommended status does not preselect, disable, hide, reorder unpredictably, or otherwise constrain the checkbox.
- Saving maps selected catalog actions into the existing `RecordedIntervention` payload shape.

Recommended actions appear first, followed by the remaining actions in stable catalog order. The text label accompanies the color treatment so status is not color-only.

## Components and Data Flow

- `InfantContextForm` remains the owner of form rendering and emits the unchanged `InfantContext` value.
- `ClinicalWorkflowPage` continues to create the encounter, request a scale recommendation, and move between workflow steps. It passes recommendation state into the compact initial-assessment presentation.
- `InterventionRecorder` derives the full catalog and recommended-ID set from domain exports and the assessment result.
- The API and clinical-domain scoring interfaces remain unchanged.

The implementation may extract focused presentation components if doing so keeps the existing files readable, but it should not introduce a new route, store, or backend endpoint.

## Responsive and Accessibility Behavior

- Desktop uses compact multi-column rows similar to the supplied reference.
- Tablet reduces column count without creating horizontal overflow.
- Mobile uses a single-column flow while retaining shallow controls and readable grouping.
- All inputs use semantic labels, fieldsets, and legends.
- Selected state is conveyed by native checked state, borders, and text where relevant.
- Keyboard focus remains visible, and all interactive controls preserve at least a 44-pixel target.
- RTL reading and control order remain correct at all breakpoints.

## Error Handling

- Encounter or recommendation failure keeps all entered context intact.
- The existing localized error and retry action remain available.
- Intervention-save failure keeps current selections and displays the existing inline error.
- No recommendation result is fabricated when the API fails.

## Verification

- Add or update component tests for compact initial-section semantics and accessible controls.
- Add an intervention test proving all catalog actions render, only context-recommended actions receive the `پیشنهادشده` badge, and a non-recommended action can be selected and saved.
- Run the web test suite, static checks, and production build.
- Verify the first step visually against the supplied screenshot at desktop width and inspect tablet and mobile breakpoints.
- Exercise the primary path: fill context, receive a recommendation, select either the recommended or an alternate scale, and proceed.
- Exercise intervention selection with both recommended and non-recommended actions.

## Non-goals

- Changing clinical recommendation content or severity mappings.
- Auto-selecting recommended interventions.
- Removing clinically useful context fields from the data model.
- Redesigning assessment, reassessment, documentation, navigation, or medical-guidance sections.
