---
target: "Next version flow at http://localhost:5173/recipe/olive-oil-ice-cream-v1"
total_score: 26
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 2
target_identity: "file:/Users/mark/Documents/projects/sprinkles/app/src/ui/RecipePage.jsx"
target_fingerprint: "sha256:ad15107d9f8d81dc17c0664a98b06be4eca68fae178dbb59218155ed5db11bf0"
target_path: /Users/mark/Documents/projects/sprinkles/app/src/ui/RecipePage.jsx
timestamp: 2026-09-17T13-28-18Z
slug: app-src-ui-recipepage-jsx
---
## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|------:|-----------|
| 1 | Visibility of System Status | 3 | Invalid focus is immediate and saving has busy/success states, but blank-Version feedback has no live announcement. |
| 2 | Match System / Real World | 3 | “Next version,” “Why,” and “From batch” fit the maker’s task; “a version needs a line” leaks obsolete internal terminology. |
| 3 | User Control and Freedom | 3 | Cancel restores the prior state and focus; dirty navigation is guarded. There is no undo after save. |
| 4 | Consistency and Standards | 2 | Version duplicates one error at two save ceremonies while Churn date owns one local error plus a distinct form summary. |
| 5 | Error Prevention | 3 | Required identity, uniqueness checks, and save locking are sound; generic “Save” obscures child-version creation. |
| 6 | Recognition Rather Than Recall | 3 | Parent version, batch citation, examples, and recipe context remain visible, though the full recipe becomes editable at once. |
| 7 | Flexibility and Efficiency | 2 | Two ceremonies help on a long page but add tab stops; no expert save accelerator exists. |
| 8 | Aesthetic and Minimalist Design | 3 | The binder composition is coherent and restrained; duplicated validation adds avoidable noise. |
| 9 | Error Recovery | 2 | Work is preserved and focus moves correctly, but copy and ownership do not clearly explain recovery. |
| 10 | Help and Documentation | 2 | Placeholders help, but the dense editing mode offers little contextual guidance. |
| **Total** | | **26/40** | **Acceptable; meaningful interaction polish remains.** |

## Design Specificity Verdict

The flow is strongly product-authored. “Pen on the plan” turns the existing recipe into a working sheet instead of a generic modal. Ink-blue entries, struck parent values, formulation figures, Why, From batch, and From version all reinforce recipe development and lineage. The experience becomes generic at commitment: Save does not reveal that it creates a child, and “a version needs a line” weakens the otherwise precise language.

The deterministic detector reported zero findings across `app/src/ui` and the five relevant source files. It did not catch the duplicated Version validation or announcement gap, which require interaction and semantic comparison. Browser inspection confirmed two copies of the Version error, one field description, and no filled live region. Mutable browser injection was unavailable, so no reliable visual overlay was produced.

## Overall Impression

The flow opens and cancels confidently, preserves recipe context, and correctly returns focus. Its weakest moment is failed commitment: a terse obsolete phrase appears twice far from the control, while the neighboring Churn date flow already provides a clear field-local model. The single biggest opportunity is to make Version validation and version creation as explicit as the product’s lineage model.

## What’s Working

- The interaction is specific to recipe iteration: the parent remains visible, the new Version receives focus, and From version, Why, and From batch explain the fork.
- Opening, blocked submission, correction, and cancellation have strong focus behavior. Correction clears the invalid state immediately; Cancel returns focus to Next version.
- Churn date supplies an established validation architecture: one actionable field error, semantic invalid/described-by wiring, and a separate form-level reassurance that entries were kept.

## Priority Issues

### [P1] Save conceals that the action creates a historical child

**Why it matters:** Preserving the churned version is a central product promise. A generic Save beside in-place editing can imply overwrite.

**Fix:** Label the child action “Save new version” or “Save as new version” in both ceremonies. Keep the overwrite branch equally explicit.

**Suggested command:** `$impeccable clarify`

### [P1] Blank-Version feedback has split ownership and no reliable announcement channel

**Why it matters:** Sighted users see the same sentence twice, while screen-reader users depend on refocus causing the description to be reread. The form gives no separate reassurance that the draft remains intact.

**Fix:** Put one field-local error immediately beneath Version and remove both ceremony-level copies. Follow Churn date with a distinct polite form summary such as “Check the Version field. Your changes have been kept.”

**Suggested command:** `$impeccable harden`

### [P2] The error contradicts the settled interface vocabulary

**Why it matters:** “Line” describes an old internal concept, not the maker’s task, and the lowercase assertion does not tell the user how to recover.

**Fix:** Use direct field language, such as “Enter a version.” Keep the existing example in the placeholder rather than repeating it in every error.

**Suggested command:** `$impeccable clarify`

### [P2] Successful-save focus emphasizes repetition rather than confirmation

**Why it matters:** After creating a child, focus moves to that child’s Next version action before the user has oriented to what was created.

**Fix:** Move focus to the new version heading or a focusable summary containing the saved Version and From version information. Keep Next version as the next tabbable action.

**Suggested command:** `$impeccable harden`

## Persona Red Flags

**Jordan, first-time recipe developer:** Save does not make clear whether the churned version will be replaced or preserved. “A version needs a line” assumes internal vocabulary. The full recipe becoming editable can obscure that only Version is required.

**Sam, keyboard and screen-reader user:** Opening, correction, and Cancel focus work well. The duplicated blocked error has no live-region ownership, and success focus is planned to land on another action rather than the newly created version’s identity.

**Alex, experienced maker:** Keeping the recipe in context supports direct editing. The two ceremonies are useful on a long sheet, but they add duplicate tab stops, and no documented keyboard accelerator exists for save.

## Minor Observations

- Next version, From version, Why, and From batch are concise and consistent.
- Requiredness is visible before failure on both Version and Churn date.
- Validation does not depend on color alone.
- A duplicate-version name produces the same duplicated, remotely owned error pattern.
- Browser automation could not conclusively verify Churn date error clearing through the native date input; source intends to clear it on edit, so this is not treated as a shipped defect without a physical date-picker check.

## Questions to Consider

- Is saving one word worth the ambiguity when the central promise is that the churned version remains intact?
- Why should Version use a weaker validation pattern than Churn date when both are required identifiers on the same page?
- After creating a child, should the interface help the maker recognize what was created before inviting another fork?
