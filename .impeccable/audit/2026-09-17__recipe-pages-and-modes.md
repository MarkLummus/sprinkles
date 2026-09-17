---
target: "Recipe reading, recipe editing, Next version, and batch-recording modes"
url: "http://localhost:5173/recipe/olive-oil-ice-cream-v1"
date: 2026-09-17
score: 17
max_score: 20
p0_count: 0
p1_count: 0
p2_count: 2
p3_count: 1
---

# Impeccable technical audit

## Audit Health Score

| # | Dimension | Score | Key Finding |
|---|-----------|------:|-------------|
| 1 | Accessibility | 3 | The routed recipe has no `main` landmark; form naming, validation ownership, focus, and heading order are otherwise strong. |
| 2 | Performance | 3 | Four batch prose fields still force a layout read after a style write on each keystroke although native `field-sizing` already grows them. |
| 3 | Responsive Design | 3 | Layout and 44px heights hold at the inspected 735px viewport, but word-width text actions and the running-head link remain narrower or shorter than 44px. |
| 4 | Theming | 4 | All four authored colours and the responsive measurements are tokenized; light-only is an explicit paper-sibling product decision. |
| 5 | Implementation Integrity | 4 | The detector reports no findings; shared field, control, state, and responsive contracts are product-specific and consistently applied. |
| **Total** | | **17/20** | **Good — address the two P2 gaps, then polish.** |

## Implementation Integrity Verdict

**Pass.** The implementation expresses one coherent product system across every inspected mode. Reading and recording use the same ink/pen distinction; Next version and batch recording share field feedback; picked controls use one pen-blue fill; focus uses one ink outline; coarse pointers receive the shared 44px height; and the two save ceremonies reuse one component. The bundled detector returned no findings. No duplicate IDs appeared in either open pen.

## Executive Summary

- Audit Health Score: **17/20 (Good)**
- Issues: **0 P0, 0 P1, 2 P2, 1 P3**
- The strongest area is implementation integrity: modes share tokens and components without erasing their different purposes.
- The most useful next change is to enlarge the clickable area of compact text actions and the running-head link while preserving their visual word-width treatment.
- The recipe route should expose a `main` landmark so assistive-technology users can jump directly to the page content.
- The legacy `autoGrow` handler can be made conditional or removed after the supported-browser decision, avoiding a synchronous layout read on each affected keystroke.

## Detailed Findings

### [P2] Touch treatment grows height but leaves some actions too narrow

- **Location:** `app/src/styles/app.css:68-83`, `app/src/styles/app.css:342-355`; compact actions rendered by `BatchRow.jsx`, `Method.jsx`, and `VersionRow.jsx`.
- **Category:** Responsive Design / Accessibility
- **Impact:** A maker using a thumb receives the correct 44px vertical target, but short actions still require horizontal precision. At the inspected 735px viewport, `Clear` measured **31×44**, `Correct` and ingredient `remove` measured **43×44**, and the running-head link measured **70×14**. The label wrappers around radios and checkboxes correctly measured at least 44px and are not affected.
- **Standard:** Impeccable's 44×44 touch target rule. WCAG 2.2 target-size spacing exceptions may keep some isolated words conformant, but the interaction remains less forgiving than the rest of the form.
- **Recommendation:** Preserve the visible underline at word width, but add an invisible or transparent inline hit-area inset so compact actions reach 44×44. Give the standalone running-head link a minimum 44px block hit area without moving its underline or page alignment.
- **Suggested command:** `$impeccable adapt`

### [P2] The routed recipe exposes no main-content landmark

- **Location:** `app/src/router.jsx:51-63`, `app/src/ui/RecipePage.jsx:1772`.
- **Category:** Accessibility
- **Impact:** Keyboard and screen-reader users cannot use the standard “main” landmark shortcut to bypass the running head and jump to the recipe. The heading hierarchy itself is sound: one H1, sibling H2 regions, Tasting at H3, and its groups at H4.
- **Standard:** WCAG 1.3.1; landmark navigation best practice.
- **Recommendation:** Make the recipe page's existing outer element the single main landmark, or wrap the routed page in `<main>`. Keep the page-owned live status outside if it must survive route replacement.
- **Suggested command:** `$impeccable harden`

### [P3] Legacy textarea growth forces layout after every affected keystroke

- **Location:** `app/src/ui/BatchRow.jsx:97-104` and its four `onInput={autoGrow}` call sites.
- **Category:** Performance
- **Impact:** The handler writes `height = auto`, reads `scrollHeight`, then writes height again. That read forces layout. The cost is small with four fields, but modern browsers already perform the same growth through `field-sizing: content`.
- **Recommendation:** Decide the oldest supported engine. If every supported engine implements `field-sizing`, remove the handler. Otherwise gate the JavaScript fallback with `CSS.supports('field-sizing', 'content')` so modern engines avoid the forced layout.
- **Suggested command:** `$impeccable optimize`

## Patterns and Systemic Issues

- Touch sizing is consistently height-first. That works for fields, segments, radio labels, checkbox labels, and full buttons, but underlined word actions need a shared two-dimensional hit-area rule.
- The page has strong internal semantic structure but lacks one route-level landmark wrapper.
- No systemic theming, colour, focus, validation, or selected-state drift was found.

## Positive Findings

- All inspected pages had zero horizontal overflow at the live 735px viewport.
- Version and Churn date invalid submissions replace `Required` with one field-owned actionable error and return focus to the invalid field.
- There were no duplicate IDs in either open pen.
- Reading mode's heading order is coherent and nested according to the content.
- Native radios and checkboxes retain semantics while their label hit areas reach 44px.
- Save actions lock during persistence, page-level success announcements survive mode changes and navigation, and Cancel restores reading mode.
- Contrast is strong: ink, pen blue, and bookcloth all exceed AA on the paper ground.
- The production build is **122.6 kB gzip** for JavaScript and **6.1 kB gzip** for CSS; there are no images, animations, shadows, broad `will-change`, or filter effects to tax rendering.
- The full suite passes **991 tests**, the production build passes, and the Impeccable detector reports no findings.

## Recommended Actions

1. **[P2] `$impeccable adapt`**: Give compact text actions and the running-head link a shared 44×44 touch hit area while keeping their printed-word appearance.
2. **[P2] `$impeccable harden`**: Add one main-content landmark to the routed recipe page and verify landmark order in reading and both pen modes.
3. **[P3] `$impeccable optimize`**: Gate or remove the batch prose `autoGrow` fallback on engines that support native content sizing.
4. **[Final] `$impeccable polish`**: Recheck the four modes together after the targeted fixes.

## Verification Boundary

The live browser available to this audit measured a 735px viewport and did not expose device emulation. Wide coarse-pointer behavior is supported by explicit CSS and prior project evidence, but this audit did not independently reproduce the current build on a physical iPad or at 393px.
