# Clinical UI Design System

The web UI is intentionally a light, calm clinical workflow rather than a visual clone of either reference site.

## Reference synthesis

- **MOE Aerospace Website:** primary/secondary hierarchy, restrained blue gradient, outlined secondary actions, compact icon+label composition.
- **Amicro:** pill geometry, spring press feedback, slide-arrow/icon morph behavior, reduced-motion branch. Magnetic, glare, sparkle and continuous decorative effects are deliberately excluded from clinical controls.
- **UI/UX Pro Max:** 44px+ targets, visible focus, keyboard navigation, semantic labels, reduced motion, stable state feedback, 4/8px spacing rhythm, responsive/mobile-first layout, and no color-only meaning.

## Tokens

Semantic tokens live in `packages/ui/src/tokens.css`. Clinical components consume tokens rather than embedding new page-specific palettes.

## Buttons

`ClinicalButton` supports `primary`, `secondary`, `danger`, and `ghost` variants plus loading/success/disabled states. Minimum height is 48px. Labels remain stable; only icon position/opacity/scale changes.

## Recommendation hierarchy

The result UI always orders content as:

1. اقدامات غیردارویی پیشنهادی
2. اقدام پزشکی / درمان دارویی
3. اگر درد ادامه یافت یا شدیدتر شد
4. ارزیابی مجدد

Non-medication content is never collapsed.
