# Neonatal Pain Management UI — PIPP Baseline Update

This package contains the redesigned neonatal pain-management decision-support interface.

## Files

- `index.html` — main application
- `README.md` — setup and usage notes
- `README.txt` — plain-text copy of the setup notes

## Font setup

The interface expects the local Vazir font file to be placed in the same folder as `index.html` with this exact filename:

`Vazir-Regular.ttf`

The font file is intentionally not bundled in this ZIP. Place your provided font beside the HTML file before opening the page.

Recommended folder structure:

```text
project/
├── index.html
├── README.md
├── README.txt
└── Vazir-Regular(1).ttf
```

## Updated PIPP workflow

The PIPP assessment now follows a staged workflow:

1. **15-second baseline observation before the painful procedure**
   - Record baseline heart rate (HR).
   - Record baseline oxygen saturation (SpO₂).
   - Record behavioral state.
   - The workflow cannot continue until the required baseline information is entered.

2. **Painful procedure confirmation**
   - Confirm that the procedure has been performed before moving to the post-procedure observation.

3. **30-second post-procedure observation**
   - Record the maximum observed HR.
   - Record the minimum observed SpO₂.
   - Complete the facial-expression indicators.

4. **Automatic PIPP calculations**
   - HR increase = maximum post-procedure HR − baseline HR.
   - SpO₂ decrease = baseline SpO₂ − minimum post-procedure SpO₂.
   - The interface automatically converts these changes into the appropriate PIPP item scores.

## Important clinical note

This interface is a clinical decision-support prototype based on the supplied neonatal pain-management guideline. It does not replace bedside assessment, clinician judgment, patient monitoring, or physician orders. Pharmacologic interventions shown in the interface must only be performed according to a physician's prescription and the applicable institutional protocol.

## Opening the application

No server is required for basic use. Put the files in one folder and open `index.html` in a modern browser such as Chrome, Edge, or Firefox.
