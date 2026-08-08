# Neonatal Pain Decision Support — Reassessment Timer refinement

## Changes in this version

- Removed orange/yellow filled warning boxes; warnings use a neutral clinical-blue surface.
- Removed orange filled styling from the moderate-pain badge and CRIES quick-assessment icon tile.
- Moved the reassessment-duration control into the same compact timer row as the countdown and actions.
- The duration selected by the user is preserved when the reassessment step is rendered again.
- **Reset** restores the countdown to the last valid user-assigned duration.
- If the user enters an invalid duration, Reset restores the last valid duration instead of accepting the invalid value.
- The countdown remains LTR/tabular while Persian labels and controls remain RTL.
- 30 minutes remains a textual suggestion only.

## Font

`index.html` references the local font file:

`Vazir-Regular(1).ttf`

Keep your own copy of that font next to `index.html` when deploying. The font file is not included in this package.
