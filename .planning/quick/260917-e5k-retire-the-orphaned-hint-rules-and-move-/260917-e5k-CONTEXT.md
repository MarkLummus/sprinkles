# 260917-e5k — Context (locked decisions)

Two follow-ups raised by the Impeccable review of commit `1333a7e` and approved by Mark in session
on 2026-09-17. Both are small and surgical. Nothing here is open; do not redesign, do not widen.

## Item 1 — retire three orphaned hint rules, and the tests pinning them

`.pen-hint`, `.batch-margin__hint` and `.versions__hint` are dead CSS. Verified before planning:
`grep -rn "pen-hint\|batch-margin__hint\|versions__hint" app/src` returns hits **only** in
`app/src/styles/app.css` and `app/src/styles/cross-cutting.test.js`. No JSX renders any of them. The
last renderer — VersionRow's "Links return after you save or cancel." paragraph — was removed in
`1333a7e`.

**The trap to avoid:** `.pen-hint` (dead) is not `.save-ceremony__hint` (**live** — `PenFoot.jsx:35`
renders it from the `hint` prop, fed by `penHint` at `PenFoot.jsx:113`). Leave `.save-ceremony__hint`
and the `hint` prop completely alone.

- Remove the `.versions__hint` rule (app.css ~628), the `.pen-hint` rule, and **both**
  `.batch-margin__hint` occurrences (one is likely a media-query copy — check).
- `cross-cutting.test.js` has two blocks that iterate
  `['.pen-hint', '.batch-margin__hint', '.versions__hint']` and assert each rule **exists** (~363,
  "the three remaining helper and status sentences read the control role (13px)"; ~371, "helper and
  status text keeps one grotesk face, sentence case"). Both fail once the rules go.
- Retarget each block at the helper/status selectors that **are** rendered. Find them by grepping the
  JSX; do not guess. The guarantee those tests encode — control size, grotesk face, no
  `text-transform`, no `font-style` — must keep covering live rules, because it is what stops a
  state change from flipping a face. If the live set turns out to be one selector, update the titles
  too; do not leave a title saying "three".
- Removing a rule nothing renders must not change a single rendered pixel. Say so in the SUMMARY.

## Item 2 — the version pen's refusal drops from page scope to form scope

Mark's three feedback scopes (`.planning/todos/pending/2026-09-16-page-owned-feedback-scope-and-the-save-announcement.md`)
say save **failures** stay field- or form-scoped beside the controls, and the **page** scope is for a
save that ends the form session. The batch pen obeys this: a blank churn date announces
`CHURN_DATE_BLOCKED_STATUS` into `.form-status`. The version pen does not — `RecipePage.jsx:1591`
announces `VERSION_BLOCKED_STATUS` through `onPageStatus`, and both `.catch()` handlers announce
`VERSION_SAVE_ERROR` the same way. The two pens currently disagree; the version pen is the one that
moves.

- **`VERSION_BLOCKED_STATUS`** ("Check the version. Your changes have been kept.") moves to a
  form-scoped live region owned by the version pen. `PenFoot` already carries the extension point: an
  optional `status` prop rendering `.save-ceremony__status` (`PenFoot.jsx:22, 30-32`), which the
  batch pen's ceremony A already uses and the version pen's mount passes nothing to — its header
  comment documents exactly this. Use it, or an equivalent region belonging to the version pen.
  Either way the region lives **inside the pen**, never above the keyed `RecipePage`.
- **`VERSION_SAVE_ERROR`** ("Couldn't save the version. Try again.", both `.catch()` handlers) moves
  the same way and for the same reason: the save failed, the draft is kept, the pen is still open.
  Keep `persist: true` — a failure must not self-clear after 5 s.
- **`VERSION_SAVED_STATUS`** ("Version saved.") **stays** at page scope through `onPageStatus`. It is
  the session-ending success that survives the navigation, and it is why the page region exists. Do
  not touch it, and do not touch `PageStatus` in `router.jsx`.
- The field-owned errors ("Enter a version." / "This version already exists. Enter a different
  version.") are already correct — one occurrence, owned by the input, focused. Leave them.

**Net effect to verify:** the page region speaks only on a successful version save. Every version
refusal and storage failure speaks inside the pen, as the churn date already does.

## Constraints

- Every visual value reads a custom property from `app/src/styles/tokens.css`. No literal.
- No colour change, no motion, nothing moves on focus, hover or selection.
- Notes and prose render as text, never markup.
- Do not touch `router.jsx`, the batch pen's churn-date wiring (`CHURN_DATE_BLOCKED_STATUS`,
  `CHURN_DATE_ERROR_ID`), or the version field errors.
- Repository-seam and domain-purity rules in `.claude/CLAUDE.md` are untouched by this task.

## Verification

1. `npm --prefix app test` — baseline **958 passing across 33 files**. Report the real number. Never
   adjust an assertion to hit a target.
2. Add coverage for the refusal and the storage failure landing in the pen's own region rather than
   the page's.
3. Browser at `/recipe/olive-oil-ice-cream-v1`: open Next version, press **Save as a new version**
   with a blank Version, and confirm the page region is **empty** while the pen's own region carries
   "Check the version. Your changes have been kept."; then save a valid version and confirm the page
   region carries "Version saved." across the navigation.
4. The dev IndexedDB already holds throwaway records from earlier checks (a version "52 g oil · 800 g"
   and batches churned 2 and 9 Aug 2026). A store reset clears them; they are not a regression.
