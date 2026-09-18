---
quick_id: 260917-wrd
slug: apply-impeccable-fix-2026-09-18-one-vers
status: complete
date: 2026-09-17
commits:
  - 2da6322
  - 25c232c
  - 8ce66d9
files_modified:
  - app/src/domain/lineage.js
  - app/src/domain/lineage.test.js
  - app/src/ui/VersionStrip.jsx
  - app/src/ui/VersionStrip.test.jsx
  - app/src/ui/VersionRow.jsx
  - app/src/ui/VersionRow.test.jsx
  - app/src/ui/Headnote.jsx
  - app/src/ui/Headnote.test.jsx
  - app/src/ui/RecipePage.jsx
  - app/src/styles/app.css
actuals:
  tokens: 8939
  tasks: 3
  commits: 3
plan_head_before: 3e19b02
---

# One version identity, wherever a version is named — Summary

A version is now named the same way wherever it is named: `Version {n} · {authored name}`,
then the state words. One exported domain function, `versionIdentity(ordered, version)`,
produces the string; the version row's own heading and the history register's row both
render its return value verbatim, so the two sites cannot drift apart. The ordinal is flat
creation order — `ordered.length - index` off `sortedVersions`'s own array, reversed — so two
siblings of one parent take consecutive numbers and neither claims the other as its parent.
The bare `Version` region-name heading is retired; the authored name leaves the headnote
along with D-27's landing focus, which now lands on the version row's own identity heading
with no `aria-label` override, since the visible line now says what the override said.

## Baseline, measured

`npm --prefix app test` before any edit: **35 files, 1010 tests, all passing** — matches the
plan's own measured baseline exactly, no drift.

## Task 1 — `lineage.js` states a version's identity (`2da6322`)

`versionIdentity(ordered, version)` added between `versionsForRecipe` (`:29-31`) and
`descendantVersions` (`:41`), exactly where the plan and the fix both place it, beside
`sortedVersions`. Pure: `ordered.findIndex` locates the version's position in the caller's
own already-sorted array; `index < 0` (the pre-load paint) returns the authored line alone,
no guessed number; otherwise the ordinal is `ordered.length - index`, that array's own index
reversed. `latestVersionPerRecipe` is not called, and the JSDoc says why (its own null
coercion and tie rule are a second opinion about order).

Eight tests added to `lineage.test.js`, inserted after the `versionsForRecipe` block and
before `latestVersionPerRecipe`, `versionIdentity` added to the import list: the ordinal off
`sortedVersions`'s own array (oldest = 1, newest = 3), a one-version recipe, the authored name
passed through exactly (mixed case, punctuation, no title-casing/truncation/fallback), two
siblings taking consecutive ordinals, a `createdAt` tie resolving by array position (not the
date), a `createdAt: null` version taking the lowest ordinal, the pre-load paint (absent from
the array, named by its authored line alone, no `Version` word, no digit), and
`saveOverVersion` leaving the ordinal unchanged.

**Verify:** `npm --prefix app test -- src/domain/lineage.test.js` → 1 file, 66 tests, green.
Full suite: **35 files, 1018 tests, all passing** (1010 baseline + 8 new — no new test file,
so 35 stays 35, exactly as the plan predicted).

## Task 2 — the register names each version by its ordinal (`25c232c`)

**`VersionStrip.jsx`.** `versionIdentity` added to the `../domain/lineage.js` import. Inside
the `ordered.map`, `identity = versionIdentity(ordered, version)` hoisted beside
`versionBatches`/`citedBatch`, then substituted into both reads of `version.versionLabel`
(the text branch at what was `:78` and the `Link`'s child at what was `:79`) — the whole
identity string is the link text, never split. Nothing else in the row moved: provenance, the
record block, the markers array, `is-current`, the one-link rule and the pen's
link-suppression all survive unchanged. The header comment was extended, not rewritten, to
name the row's identity as `versionIdentity`'s shared output.

**`VersionStrip.test.jsx`** updated case by case, following the plan's own table: every
identity assertion now carries its ordinal prefix; the three-version block's own indexOf
assertions kept and extended with explicit `Version 3/2/1 ·` presence checks; the tied-
`createdAt` case now asserts the ordinal is 2 (not 1) for the input-first entry and 1 for its
tied sibling, naming in the test's own words that position, not the date, decides. One new
case proves no anti-goal form survives (`v3`, `#3`, `3rd`, `Version 03`, no element wrapping
the ordinal alone).

**Verify:** `npm --prefix app test -- src/ui/VersionStrip.test.jsx` → 1 file, 23 tests, green.
Full suite: **35 files, 1019 tests, all passing**. `npm --prefix app run build` → succeeds.

## Task 3 — the identity becomes the version row's heading, and the name leaves the headnote (`8ce66d9`)

One commit, as the plan required — the name leaving the headnote, the name arriving on the
version row, the focus prop rewiring between them, and the CSS delete-and-add are one state
change.

**`VersionRow.jsx`.** `focusVersionOnMount = false` added to the destructured props.
`versionIdentityRef`, `landingFocusVisible` state and the landing-focus effect relocated
verbatim from `Headnote.jsx`, placed above the conditional render with the row's two existing
ref/effect pairs — the `mode === 'reading'` gate kept exactly as Headnote had it, so the
heading exists while a batch pen is open but the landing focus does not fire there.
`sortedVersions` and `versionIdentity` joined the `../domain/lineage.js` import. `ordered =
sortedVersions(recipeVersions)` and `isLatest = ordered.length > 0 && ordered[0].id ===
version.id` computed beside the existing `recipeVersions`/`versionCount`, `isLatest`
positional exactly as `Latest` is in `VersionStrip.jsx`. The bare `<h2 className="region-name">
Version</h2>` and its three-line comment were replaced by the identity heading: the ref, the
conditional `is-landing-focus` class, `tabIndex={focusVersionOnMount ? -1 : undefined}`, the
blur clear, `versionIdentity(ordered, version)` as its text, and a `· Latest` span (reusing
`.history-register__marker`) when `isLatest`. No `aria-label` — everything else below the
heading (`<dl className="version-row__meta-list">`, the history control, the acts group, the
`openPen === 'plan'` branch) is untouched.

**`Headnote.jsx`.** The reading-mode `<p className="headnote__version">` (opened at `:70`,
closed at `:78` — one line off the fix description's own `:69-78` citation, confirmed at
planning) deleted whole, with `versionIdentityRef`, `landingFocusVisible`/
`setLandingFocusVisible`, the landing-focus effect and its comment, and the
`focusVersionOnMount` prop. `useState` dropped from the `react` import (checked first:
`useEffect`/`useRef` are both still used for `versionLineBlockedAttempt`/
`versionLineFieldRef`). The ternary at the recipe-name paragraph became a `&&`. The
developing-mode `.headnote__version-field` — caption, input, `autoFocus`, `aria-label`,
`FieldFeedback` — is completely untouched, as the fix requires. The header comment's
"current/draft version line" clause was corrected to say the recipe name and prose only.

**`RecipePage.jsx`.** `focusVersionOnMount={focusVersionOnMount}` removed from the
`<Headnote>` element and added to the `<VersionRow>` element. `:579`'s derivation from
`location.state?.focusVersion` and `:1725`'s `navigate(…, { state: { focusVersion: true } })`
are unchanged.

**`app.css`.** `.headnote__version` (`:485-489`) deleted — an orphan this change creates;
`.headnote__version-field` and its two sibling rules left alone. One new rule,
`.version-row__identity`, placed after `.version-row__meta-list dd` so the row's own rules
stay together: `--face-text`, `--size-version-line`, an explicit `font-weight: 400` (no
global `h2` reset exists in this file; every other `h2` wears `.region-name`'s own `600`),
and `margin: 0 0 var(--gap-xs)` (the same bottom gap `.region-name` itself gives the `dl`
beneath it). `.history-register__name` / `.history-register__marker` untouched. No new
`@media` block, no new token.

**`VersionRow.test.jsx`.** The `Version region-name heading` describe rewritten as the
identity-heading describe: the default render produces the exact identity-plus-`Latest`
markup and the section still carries `aria-label="Version"`; no bare `region-name">Version<`
heading survives; `Version` appears exactly once in the extracted `<h2>`; a middle version of
a four-version, two-branch set (root/child/sibling/grandchild, distinct `createdAt`) wears its
own ordinal with no `Latest`; the two siblings (child and sibling, same parent) take
consecutive ordinals; `In view` never appears on the row; the pre-load paint (`versions: []`)
renders the authored line alone with the `<h2>` still present (D-27's focus target must exist
on mount); the landing focus case (moved in from `Headnote.test.jsx`) asserts `tabindex="-1"`
and the explicit absence of `aria-label`, with the test's own comment naming that the focus
CALL cannot be driven here (no jsdom) and is covered by the browser checkpoint; a final case
proves no anti-goal form (`v1`, `#1`, `1st`, `Version 01`). `renderVersionRow`'s default
`versions={[oliveOilVersion]}` was left untouched, as the plan required — cases rendering a
`childVersion`/root/sibling with an explicit `versions` array were built inline in the new
tests rather than changing the shared default.

**`Headnote.test.jsx`.** The reading-mode test inverted to assert no version line renders; the
exact-markup case drops the retired `<p class="headnote__version">` segment; the orphaned
`not.toContain('headnote__version')` assertion (naming a class that no longer exists) was
deleted from the developing-mode test, its other three assertions kept; the landing-focus `it`
block was deleted whole (moved to `VersionRow.test.jsx`). The header comment's clause on the
component's scope was corrected.

**Verify, every number real:**
- `npm --prefix app test -- src/ui/VersionRow.test.jsx src/ui/Headnote.test.jsx` → 2 files,
  65 tests, green.
- Full suite: **35 files, 1026 tests, all passing** (1019 + 8 new VersionRow cases − 1
  Headnote case moved out, net +7 = 1026).
- `npm --prefix app run build` → succeeds.
- `grep -rn 'headnote__version[^-]' app/src` → exit 1, no matches.
- `grep -rn 'focusVersionOnMount' app/src/ui/Headnote.jsx` → exit 1, no matches.
- `grep -rn 'region-name">Version<' app/src` → **one match, surfaced below, not silent.**

## Live reading vs. the plan: one self-contradiction, surfaced not silently chosen

The plan's own Task 3 Verify block and Success Criteria both state
`grep -rn 'region-name">Version<' app/src` must exit 1. It does not — it finds exactly one
line:

```
app/src/ui/VersionRow.test.jsx:84:    expect(markup).not.toMatch(/<h2 class="region-name">Version<\/h2>/);
```

This is not the bare heading surviving anywhere in real markup — `VersionRow.jsx` no longer
contains that string at all, confirmed by the full suite passing and the build succeeding.
It is the regression-guard test line the plan's own section 3e, case 2 explicitly requires
verbatim: `not.toMatch(/<h2 class="region-name">Version<\/h2>/)`. `grep` is textual and cannot
distinguish `.toMatch` from `.not.toMatch` — the literal substring `region-name">Version<`
appears inside the regex source either way. The plan's own "Measured at planning" section
had already surfaced this same collision before any edit: the **original**, unedited test
file's positive assertion (`.toMatch(...)`, same string) was the second of the two hits the
planning-time sweep found (`VersionRow.jsx:167` and `VersionRow.test.jsx:76`). The grep
verify step and the section 3e test requirement cannot both be satisfied to the letter in the
same file; I kept the test (it directly encodes and proves the real invariant — no bare
heading in rendered output) and report the grep's residual hit here rather than weakening the
test to dodge a textual grep.

## Two things the fix did not answer, decided as the plan recorded

**1. The pre-load paint.** `RecipePage.jsx:838` returns `null` only while
`version === undefined`; `versions` is `[]` until its own effect resolves. `versionIdentity`
reads the authored line alone in that window — never a guessed `Version 1` that would jump,
never a blank heading (the focus target must exist on mount). Proved in the domain (Task 1,
case 7) and at the component (Task 3, `VersionRow.test.jsx`'s pre-load-paint case).

**2. The `Latest` span's type rule.** The row's `Latest` span reuses `.history-register__marker`
rather than getting a rule of its own, following the in-repo precedent `.version-row__meta-list`
already set by reusing `.versions__lineage`/`-label`. app.css gets exactly one new rule
(`.version-row__identity`), and the identity pattern now has one CSS definition shared by both
sites that print it.

## Orphans and residual naming, named not fixed

- **`app.css:605-613`**, the comment above `.is-landing-focus:focus`, still says
  "VersionRow.jsx adds this class only for that one landing" and names "the child's own Next
  version button" — written for an earlier design, already stale before this change. This
  change makes `VersionRow.jsx` an adder for the first time (the identity heading), so the
  sentence gets *less* wrong, not more. Not edited — not this change's mess.
- **`VersionRow.jsx`**'s `aria-label={openPen === 'plan' ? 'Next version' : 'Version'}` on the
  `<section>` — untouched, still asserted at `VersionRow.test.jsx`.
- **`descendantVersions`** and **`latestVersionPerRecipe`** in `lineage.js` — still orphans,
  still not deleted, explicitly out per the fix.
- **`DESIGN.md` § Typography, Headline** ("the version line under the name",
  `DESIGN.md:242`) is falsified as to *position* — the line now lives on the version row's own
  heading, not under the recipe name in the headnote. Not edited here; DESIGN.md is
  Impeccable's file. Follow-up: `/impeccable document`.

## Checkpoint — deferred to the orchestrator, per this run's own instruction

The executor did not run the live browser confirmation (explicitly out of scope for this run
— the orchestrator runs it; a dev server was already up on port 5174 holding a four-version,
two-branch fixture and was left untouched). All thirteen items from the plan's checkpoint are
carried here verbatim so nothing drops between hand-off and confirmation.

1. **The register reads `Version 4`, `Version 3`, `Version 2`, `Version 1`** top to bottom,
   matching its own newest-first order — no gaps, no repeats.
2. **The two siblings take consecutive ordinals**, and neither one's provenance line claims
   the other as its parent.
3. **Character-for-character.** With the Versions panel open on the page for v3, read the
   version row's `<h2>` `textContent` and the register's own row for v3, and assert in JS that
   the row's text equals the register's text with `· In view ` removed. Not by eye.
4. **The root reads `Version 1 · <name>`** with no provenance line beneath it, and its
   register row is still two lines tall.
5. **`Version` appears exactly once per identity line** — no heading above it repeats it.
   Confirm the page's heading outline (`document.querySelectorAll('h1, h2')` text) now names
   which version rather than merely that a version is there.
6. **Resolved type.** `getComputedStyle` on the identity `<h2>`: `fontFamily` resolves to the
   text face (Georgia stack), `fontSize` to `18px` (1.125rem), `fontWeight` to `400`. On the
   `Latest` span: the grotesk stack at `12px` (0.75rem). If the weight reads `700`, the
   `font-weight: 400` reset is missing.
7. **The headnote** prints the recipe name and the prose and no version line. Then open the
   pen: the `Version` field still opens, accepts a name and saves it.
8. **The fork lands.** Open a version, `Next version`, save as a new version. Focus lands on
   the CHILD's identity heading (`document.activeElement` is the `<h2>`), the
   `is-landing-focus` outline paints, blur clears it, and the element's accessible name equals
   its visible text — read `getAttribute('aria-label')` and confirm it is `null`. This is D-27
   and it is the one thing no test can prove.
9. **Save over** any version: every ordinal on the page is unchanged afterwards.
10. **At 1920.** The version row's identity and the register's longest identity (`Version 4 ·
    60 g oil · 900 g · In view · Latest`) both wrap within their own column;
    `document.documentElement.scrollWidth` equals the viewport width.
11. **At 393** — device emulation via `gsd-browser emulate_device`; Chrome's `resize_window`
    reports success without moving the viewport. No horizontal overflow:
    `document.documentElement.scrollWidth === 393`. The identity wraps rather than crushing
    the dl beneath it.
12. **Forced colours emulated.** The ordinal and `Latest` survive — they are words in ink,
    with nothing carrying meaning by colour or weight.
13. **Nothing out of scope moved:** `Versions (n)`, `Batches (n)`, the batch panel and its
    rows (no ordinal anywhere on a batch), `is-current`'s bold-plus-1px-outline, `Next
    version`, `Record another`, `Correct`, `Show changes`.

## Known Stubs

None — every rendered value (`versionIdentity`'s ordinal and name, the `Latest` marker) is
wired to real data through the domain function; no placeholder path exists.

## Threat Flags

None — no new network endpoint, auth path, file access pattern, or schema change. This is a
pure presentation/markup-shape change and a focus-target relocation over data the app already
reads.

## Self-Check: PASSED

- FOUND: app/src/domain/lineage.js
- FOUND: app/src/domain/lineage.test.js
- FOUND: app/src/ui/VersionStrip.jsx
- FOUND: app/src/ui/VersionStrip.test.jsx
- FOUND: app/src/ui/VersionRow.jsx
- FOUND: app/src/ui/VersionRow.test.jsx
- FOUND: app/src/ui/Headnote.jsx
- FOUND: app/src/ui/Headnote.test.jsx
- FOUND: app/src/ui/RecipePage.jsx
- FOUND: app/src/styles/app.css
- FOUND: commit 2da6322 in `git log --oneline`
- FOUND: commit 25c232c in `git log --oneline`
- FOUND: commit 8ce66d9 in `git log --oneline`
- CONFIRMED: `npm --prefix app test` green at 35 files / 1026 tests (measured, not rounded)
- CONFIRMED: `npm --prefix app run build` succeeds
- CONFIRMED: zero hits for `headnote__version[^-]`, `focusVersionOnMount` in Headnote.jsx
- CONFIRMED: `git status --short` clean after all three commits, no untracked or deleted
  files beyond this quick task's own `.planning/` directory
