---
quick_id: 260917-wrd
slug: apply-impeccable-fix-2026-09-18-one-vers
date: 2026-09-17
mode: quick
authority:
  - .impeccable/fix/2026-09-18__one-version-identity-everywhere.md — THE ASSIGNMENT. Mark decided 2026-09-18, including the two choices he was asked and answered that day (the ordinal is flat creation order, not depth in lineage; the identity line lives in the Version block, not the headnote). Impeccable decided; GSD executes. Its "In" list (1-6) is the work, its "Out, and named" list is a boundary, its "Anti-goals" are refusals. Every line citation in it was re-read live against the current tree (HEAD `3e19b02`, clean — the very commit it was written against) and the findings are recorded under "Measured at planning" below (#3786 — a citation is a guide, never edit authority).
  - .impeccable/surfaces/route-recipe.md § 6, bullet "One version identity, wherever a version is named" (added 2026-09-18) — the reasoning, and it must be read before the fix description. It carries why the ordinal is flat ("two children of one parent both become `Version 2`, and a number that names two records cannot sit in an identity line"), why the bare `Version` head retires (§ 3 has said since 2026-09-09 that the front-matter rows wear no running head), and why the authored name leaves the headnote (the same stutter, on one screen). Also § 6's bullet immediately above it, "The two history panels read as one register, not as cards" (2026-09-17), whose row grammar this extends and whose `is-current` treatment is untouched; and § 6 line ~117, "Region names are headings, so the outline reads …" — the heading outline keeps an entry for the row and now names WHICH version.
  - DESIGN.md § Typography — the **Headline** role (400, 1.125rem, "the version line under the name") and the **Small print** role (400, 0.75rem, tabular where numeric, naming "version-strip meta"). Both already exist and NEITHER changes. § Layout describes the front-matter band this row sits in. DESIGN.md is Impeccable's file and is NOT edited here; the one line this change falsifies as to *position* is named below as an `/impeccable document` follow-up.
  - CLAUDE.md § 2 (Simplicity First) and § 3 (Surgical Changes) — every changed line traces to the fix description. No adjacent rule is reformatted, no adjacent comment is "improved". Comments THIS change makes false are rewritten (cleaning up my own mess); orphans THIS change creates are removed; pre-existing orphans and pre-existing stale comments are named, not deleted.
  - .claude/CLAUDE.md conventions — every visual value reads a custom property from tokens.css; domain math is framework-free under app/src/domain/ and tested under the node environment; the repository seam is untouched; agent prose, commit messages and browser-test input values are English.
  - .claude/skills/sketch-findings-sprinkles/SKILL.md — auto-loaded during this work. Its standing instruction, **measure the real DOM, never reason from CSS source**, is the whole reason the browser checkpoint below reads computed values rather than eyeballing, and why 393 is checked by device emulation rather than by reading a media query.
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
autonomous: true
must_haves:
  truths:
    - "A version is named the SAME way on its own row and in the history register: `Version {n} · {authored name}`, then the state words. The two strings are identical by construction, not by coincidence — one exported domain function produces the string and both sites render its return value verbatim."
    - "The ordinal is flat creation order: `Version 1` is the recipe's oldest version, the newest wears the highest number. It is `ordered.length - index` off `sortedVersions(versionsForRecipe(versions, recipeId))` — createdAt DESCENDING, the array the register already orders — reversed. NO second traversal, NO second sort, NO ascending re-sort, NO second orderable key anywhere in the codebase. `latestVersionPerRecipe` is deliberately NOT called: it walks the store again with its own null coercion and its own tie rule, which is a second opinion about order — the very thing 260917-odu's positional `Latest` refused."
    - "Two siblings of one parent take CONSECUTIVE ordinals, and neither one's provenance claims the other as its parent. `Version 3` makes no claim to descend from `Version 2`; the provenance line one row below answers that and keeps answering it."
    - "`saveOverVersion` never retakes `createdAt` (lineage.js:125-136, MEASURED), so a correction does not renumber the book — every ordinal on the page is unchanged by Save over."
    - "The version row's reading-mode `<h2 className=\"region-name\">Version</h2>` is GONE, replaced by the identity line as the row's own `h2` in the text face at `--size-version-line`, carrying `· Latest` in small-print grotesk when this version is the newest of its recipe. `In view` never appears there — the maker is on it."
    - "The `<dl className=\"version-row__meta-list\">` beneath it is UNCHANGED: Written / From version, Why and From batch keep their captions, their order, their links and their link-suppression exactly as they are. The developing-mode branch (`<h2>Next version</h2>` and its own dl) is NOT touched."
    - "The headnote's reading-mode `<p className=\"headnote__version\">` is GONE. `<h1>{version.recipeName}</h1>` and the authored prose beneath it stay. The developing-mode `.headnote__version-field` — the `Version` input the pen writes into — is UNTOUCHED: it is where the name is authored, not where it is read."
    - "D-27's fork landing focus moved WHOLE and still works: `focusVersionOnMount` now flows RecipePage → VersionRow, and `versionIdentityRef`, `tabIndex={-1}`, `is-landing-focus` and the `onBlur` clear all sit on the new identity heading. The `aria-label` override is DROPPED — the visible line now says what the accessible name said, and visible text agreeing with the accessible name is the stronger state."
    - "`.headnote__version` is deleted from app.css and appears NOWHERE under `app/src` — not in a stylesheet, not in a component, not in a test, not in a comment."
    - "Every visual value reads a custom property from tokens.css. No literal colour, face, size, spacing or rule weight; NO new token; NO new `@media` block (app.css stays at exactly 7, asserted twice — binder.test.js:295 and cross-cutting.test.js:251)."
    - "Anti-goals absent: no `v3`, no `#3`, no `3rd`, no zero-padding, no separate element or badge for the ordinal, no colour or weight carrying it, no ordinal on a batch, no second ordering key."
    - "`npm --prefix app test` green and `npm --prefix app run build` succeeds at every commit. Baseline MEASURED at planning time by an actual run on 2026-09-17: **35 files, 1010 tests, all passing**. No new test FILE, so 35 stays 35. Report the real number after each task; NEVER adjust an assertion to reach a number."
    - "Three commits, in order, suite green at each. Nothing left red in between."
  artifacts:
    - "app/src/domain/lineage.js: ONE new exported function, `versionIdentity(ordered, version) -> string`, placed between `versionsForRecipe` (:29-31, MEASURED) and `descendantVersions` (:41) — beside `sortedVersions` as the fix requires. Pure, framework-free, no store, no DOM."
    - "app/src/domain/lineage.test.js: a `describe('versionIdentity')` block inserted after the `versionsForRecipe` block (:87-92, MEASURED) and before `describe('latestVersionPerRecipe')` (:94), with `versionIdentity` added to the import list at :5-17."
    - "app/src/ui/VersionStrip.jsx: the identity string replaces the two bare `version.versionLabel` reads inside `.history-register__name` — one in the text branch, one as the Link's child. Nothing else in the row moves."
    - "app/src/ui/VersionStrip.test.jsx: seven assertions follow the new identity string; the tie-break case additionally proves the ordinal, not just `Latest`, reads off array position."
    - "app/src/ui/VersionRow.jsx: `focusVersionOnMount` prop added; a ref/state/effect trio relocated verbatim from Headnote.jsx above the conditional render; `<h2 class=\"region-name\">Version</h2>` (:167, MEASURED) replaced by the identity heading; `sortedVersions` and `versionIdentity` added to the lineage import."
    - "app/src/ui/VersionRow.test.jsx: the `Version region-name heading` describe (:72-78, MEASURED) rewritten as the identity-heading describe, plus the landing-focus case moved in from Headnote.test.jsx."
    - "app/src/ui/Headnote.jsx: the reading-mode `<p>` (:70-78, MEASURED) removed with its ref, its state, its effect and the now-unused `useState` import; the ternary becomes a `&&`."
    - "app/src/ui/Headnote.test.jsx: three assertions retired or inverted, and the landing-focus `it` block removed whole (it moves to VersionRow.test.jsx)."
    - "app/src/ui/RecipePage.jsx: `focusVersionOnMount={focusVersionOnMount}` moves from the `<Headnote>` element (:1788, MEASURED) to the `<VersionRow>` element (:1791-1814). `:579`'s derivation is untouched."
    - "app/src/styles/app.css: `.headnote__version` (:485-489, MEASURED) deleted — an orphan THIS change creates. ONE new rule, `.version-row__identity`. `.history-register__name` and `.history-register__marker` unchanged."
  key_links:
    - "THE PRE-LOAD PAINT IS A REAL STATE THE FIX DOES NOT ANSWER. RecipePage.jsx:838 returns null only while `version === undefined`; `versions` is filled by its OWN effect (:719-727, MEASURED) and is `[]` until that resolves. So a render genuinely exists where the version in view has no position yet. The identity must read the AUTHORED LINE ALONE there — never a guessed `Version 1` that would jump to `Version 3` when the list arrives. VersionRow.test.jsx:355-358 already names this state by that exact phrase."
    - "THE FOCUS MOVE IS THE RISKIEST PART OF THIS CHANGE and it crosses a component boundary. `focusVersionOnMount` is set at RecipePage.jsx:579 from `location.state?.focusVersion`, which RecipePage.jsx:1725 sets on the post-fork `navigate`. If the prop is added to VersionRow but not removed from Headnote, D-27 half-works silently; if it is removed from Headnote but not added to VersionRow, a fork lands on nothing and NO TEST CATCHES IT — there is no jsdom, so the effect cannot be driven from a test. Only the render-level `tabindex=\"-1\"` on the heading is testable; the focus call itself is browser-only. Both edits are in Task 3's single commit for exactly this reason."
    - "THE STATE WORDS NEED A GROTESK SMALL-PRINT RULE THE FIX'S ONE-RULE app.css ITEM DOES NOT PROVIDE. Resolution, with in-repo precedent: the row's `Latest` span reuses the existing `.history-register__marker` class, exactly as `.version-row__meta-list` already reuses `.versions__lineage-label` / `.versions__lineage` on its own dt/dd pairs \"so the rules above keep working unchanged\" (app.css:678-681, MEASURED comment). One new rule in app.css and `.history-register__marker` untouched — both halves of the fix's item 6 satisfied literally, and the identity pattern has ONE CSS definition so the two sites cannot drift."
    - "THE NEW HEADING IS AN `h2` AND THERE IS NO GLOBAL HEADING RESET. `grep -n 'h2' app/src/styles/app.css` returns NOTHING (MEASURED); every existing h2 wears `.region-name`, which sets its own `font-weight: 600`. Without an explicit `font-weight: 400` the identity prints at the UA's bold and at the UA's `1.5em`, which is not DESIGN.md's Headline role. The rule must also set `margin` explicitly for the same reason."
    - "`VersionRow.test.jsx`'s helper default is `versions={[oliveOilVersion]}` while several cases render `version: childVersion` — the file's OWN comment at :293-296 documents this. Those renders therefore hit the pre-load branch (index -1) and must keep passing unchanged. Do NOT rewrite the helper's default to silence it: that comment is true and the branch is real."
    - "`cross-cutting.test.js`'s `--gap-xs` census (:511-527) and its four-section-heading census (:330-339) are FIXED SELECTOR LISTS, not scans over the stylesheet (MEASURED). Adding `.version-row__identity` moves neither count, and `.version-row__identity` must NOT be added to either list — it is an identity line, not a caption and not a region name."
    - "`binder.test.js:43-58` asserts exactly THREE rules declare `outline: var(--focus-outline-width)`, one of them `.is-landing-focus:focus` (app.css:614, MEASURED). This change REUSES that class rather than renaming it, so the census is untouched — do not introduce a fourth focus rule for the heading."
---

# One version identity, wherever a version is named

Apply `.impeccable/fix/2026-09-18__one-version-identity-everywhere.md`. Mark decided
2026-09-18: a version is identified the same way on its own row and in the history
register — a derived ordinal, the authored name, then the state words. The identity line
becomes the version row's heading and the bare `Version` head retires. The authored name
leaves the headnote, and D-27's landing focus goes with it.

## How to read this plan

**The fix description is the assignment; this plan is the transcription.** Read the fix
description in full first, then `route-recipe.md` § 6's bullet for the reasoning. Mark was
asked two questions on 2026-09-18 and answered both: the ordinal is **flat creation order,
not depth in lineage**, and the identity line lives in **the Version block, not the
headnote**. Neither is re-openable here.

Its "Out, and named" list is a boundary, not a suggestion: the batch panel, the batch row
and `Batches (n)`; `Versions (n)`, its placement, its id and `.version-row__history`; the
register's geometry, its rule, its right column, its provenance rule and `is-current`'s
treatment; `Next version`, `Record another`, `Correct`, `Show changes`, the ingredient
table, the method, the tasting battery; `descendantVersions` and `latestVersionPerRecipe`
in `lineage.js` (both still orphans, both still not deleted); and `DESIGN.md` itself.

**Anti-goals, repeated because they are the easiest thing to drift into:** no `v3`, no
`#3`, no ordinal suffix words (`3rd`), no zero-padding, no separate element or badge for
the ordinal, no colour or weight carrying it, no ordinal on a batch, no second ordering key
anywhere in the codebase, no new token, no new `@media` block.

**The separator is ` · ` — U+00B7 MIDDLE DOT with a space either side**, the same character
the page already uses in `· In view`, `· Latest` and `· written `. Not a hyphen, not an
en dash, not a bullet.

## Measured at planning — HEAD `3e19b02`, tree clean

The fix description was written against this very commit and every citation in it was
re-read live. The findings are below: two citations are a line off, the file list is
exactly right, and two real things the fix does not answer are decided here.

**Test baseline, by an actual run** (`npm --prefix app test`, 2026-09-17):
**35 files, 1010 tests, all passing** — exactly the last measured baseline. No drift.

### Citations confirmed

| Fix says | Live | Verdict |
|---|---|---|
| `VersionRow.jsx:167` — `<h2 className="region-name">Version</h2>` | :167 exactly | ✓ |
| `Headnote.jsx:77` — the version line | `{version.versionLabel}` at :77 | ✓ |
| `Headnote.jsx:74` — the `aria-label` | `aria-label={focusVersionOnMount ? …}` at :74 | ✓ |
| `RecipePage.jsx:1788` — `focusVersionOnMount` | :1788 exactly, on the `<Headnote>` element | ✓ |
| `app.css:485` — `.headnote__version` | `.headnote__version {` at :485, block :485-489 | ✓ |
| `app.css:614` — `.is-landing-focus:focus` | :614 exactly | ✓ |
| `lineage.js:125-136` — `saveOverVersion` never retakes `createdAt` | :125-136 exactly; no `createdAt` in the returned object | ✓ |
| `Headnote.jsx:69-78` — the `<p>` block | the `<p>` opens at **:70** and closes at **:78**; :69 is the ternary's own `) : (` | one line off at the start |
| `VersionStrip.jsx` — `.history-register__name` gains the prefix | the `<p>` opens at :69; the label is read TWICE inside it, at **:78** (text branch) and **:79** (Link child) | both reads change, not one |

### The file list is exactly right — there is no eleventh file

The previous task in this series (260917-vev) found `binder.test.js` by sweeping for an
exact-selector assertion the fix description had missed. The same sweep was run here and
**found nothing**. Stated with its evidence, because an absence is only useful if it was
looked for:

- `grep -rn 'headnote__version' app/src` → `app.css:485`; `Headnote.test.jsx:49, :64,
  :161`. Every other hit is `headnote__version-field`, a **different class** (the pen's
  input, explicitly untouched by the fix) — including `cross-cutting.test.js:349` and
  `:513`, which therefore need no change.
- `grep -rn 'region-name">Version<' app/src` → `VersionRow.jsx:167` and
  `VersionRow.test.jsx:76`. Nothing else asserts that heading.
- `grep -rn 'is-landing-focus\|versionIdentityRef\|focusVersionOnMount' app/src` →
  Headnote.jsx/.test.jsx, RecipePage.jsx, and **BatchRow.jsx:391/472**, which carries the
  same pattern on its own `Batch` heading and is out of scope. `binder.test.js:44/54`
  names `.is-landing-focus:focus` as a documented exception — the class is REUSED here,
  not renamed, so that test is untouched.
- `RecipePage.test.jsx:116-135` renders a `<VersionRow>` and already passes
  `versions={[oliveOilVersion]}` alongside `version={oliveOilVersion}`; its assertions are
  about the `Next version` button only. **No change needed** — this is why it is not an
  eleventh file.
- `columns.test.js` references none of these selectors.

If execution nevertheless turns a test red in a file not on the list, STOP and report it
with the failing assertion rather than widening silently.

### Two real things the fix does not answer, decided here

**1. The pre-load paint.** `RecipePage.jsx:838` returns `null` only while
`version === undefined`. `versions` is filled by a **separate** effect (:719-727) and is
`[]` until it resolves, so the page genuinely renders the version row before the recipe's
version list exists. The fix assumes the ordinal is always available.

**Decision: the identity reads the authored line alone until the list arrives.** No
guessed `Version 1`, which would visibly jump to `Version 3` a frame later, and no blank
heading — the heading must exist on mount because D-27's focus lands on it.
`VersionRow.test.jsx:355-358` already names this state ("the pre-load paint before
Versions (0) could ever show"), so the vocabulary is the file's own. This is NOT error
handling for an impossible scenario (CLAUDE.md § 2): it is a reachable loading state with
one honest answer.

**2. The state words on the version row need a type rule the fix's one-rule app.css item
does not provide.** The fix says the state words read in `--size-small-print` grotesk, and
separately that app.css gets "one rule for the version row's identity heading" reading
`--face-text`, `--size-version-line` and a gap. Those two statements cannot both hold with
a second rule for the marker.

**Decision: the row's `Latest` span reuses `.history-register__marker`.** In-repo
precedent, measured: `.version-row__meta-list`'s own comment (app.css:678-681) says it
reuses `.versions__lineage` / `.versions__lineage-label` on its dt/dd pairs "so the rules
above keep working unchanged". The same move here gives app.css exactly one new rule,
leaves `.history-register__marker` unchanged as the fix requires, and — the real reason —
means the identity pattern has ONE CSS definition across its two sites, so they cannot
drift apart any more than the markup can.

### Named, not fixed (pre-existing; do NOT touch)

- **`app.css:605-613`**, the comment above `.is-landing-focus:focus`, says "VersionRow.jsx
  adds this class only for that one landing" and names "the child's own Next version
  button". It was written for an earlier design and is stale today — Headnote.jsx and
  BatchRow.jsx are the adders. This change makes `VersionRow.jsx` an adder for the first
  time, so the sentence gets *less* wrong. Leave it alone; it is not this change's mess.
- **`VersionRow.jsx:88`**, `aria-label={openPen === 'plan' ? 'Next version' : 'Version'}`
  on the `<section>`. The fix does not name it and it is the region's accessible name, not
  a heading, so the Verify line "no heading above it repeats it" is satisfied.
  `VersionRow.test.jsx:75` asserts it; both stay.
- **`descendantVersions`** and **`latestVersionPerRecipe`** in `lineage.js` — still
  orphans, still not deleted, explicitly out per the fix.
- **`DESIGN.md` § Typography's Headline entry**, "the version line under the name", becomes
  inaccurate as to *position* once the line moves out of the headnote. It is Impeccable's
  file; record it in the SUMMARY as an `/impeccable document` follow-up and do not edit it.

## The identity, written once

```
Version 3 · 50 g oil · 800 g · Latest            ← the version row, on its own page
Version 3 · 50 g oil · 800 g · In view · Latest  ← the same version, in the register
```

The first two segments are ONE string from ONE function. The state words are a sibling
span in small-print grotesk, in the register's existing order (`In view` first, then
`Latest`); on the version row's own identity only `Latest` can ever appear.

---

## Task 1 — `lineage.js` states a version's identity

**Files:** `app/src/domain/lineage.js`, `app/src/domain/lineage.test.js`
**Commit:** `feat(version-identity): a version's identity is derived once, in the domain`

The fix's item 1. Built and committed FIRST so both call sites have one answer to read, and
so the domain change is revertible on its own.

### The function

Add ONE exported function between `versionsForRecipe` (`:29-31`) and `descendantVersions`
(`:41`) — beside `sortedVersions`, as the fix requires:

```js
export function versionIdentity(ordered, version) {
  const index = ordered.findIndex((candidate) => candidate.id === version.id);
  if (index < 0) return version.versionLabel;
  return `Version ${ordered.length - index} · ${version.versionLabel}`;
}
```

**Why the function returns the STRING and not the bare number.** The fix says "One exported
function is enough; it is called from two places and **must return the same answer in
both**", and its Verify demands the two identities be "character-for-character" the same.
A function returning `3` would leave the word `Version` and the ` · ` join duplicated in two
components — two copies of the one thing this fix exists to unify. One function returning
the whole string makes the two sites identical by construction.

**Why `ordered` is passed in rather than derived inside.** `ordered` is
`sortedVersions(versionsForRecipe(versions, recipeId))` — createdAt DESCENDING — computed by
the caller, exactly as `versionLineUnique` takes a list the caller has already scoped to one
recipe. Deriving it inside would sort once per row in the register's own map: a second sort
beside the first, which the fix forbids outright. The ordinal is `ordered.length - index`,
that array's own index reversed, so `ordered[0]` is highest and the ordinal and the
register's order cannot disagree.

**Why `findIndex` is not "a second traversal".** It is a LOOKUP INTO the ordered array, not
an opinion about order: it reads the position that array already decided. What the fix
forbids is a second *ordering* — a second sort, an ascending re-sort, or a second orderable
key. This is what lets one function serve both sites with no index plumbing and no
duplicated fallback.

**Why `latestVersionPerRecipe` is NOT used, stated plainly** — the shortcut is right there
and it is wrong. It walks the whole store a second time with its own null coercion
(`(version.createdAt ?? '')`) and its own tie rule ("on a tie keeps the first version
encountered"), neither of which is `sortedVersions`'s. That is a second opinion about order
living beside the first — exactly what 260917-odu's positional `Latest` refused. Say so in
the JSDoc; `VersionStrip.jsx:29-32` already carries the same sentence for `Latest` and this
is its twin.

**The absent version.** `index < 0` is the pre-load paint (see "Measured at planning"): the
page has resolved one version but not yet the recipe's list. It has no position yet, so it
is named by its authored line alone rather than by a number that would jump. No word is
invented for it.

**JSDoc** in the file's existing style, naming `route-recipe.md` § 6 "One version identity,
wherever a version is named" (2026-09-18) as the authority, stating that the ordinal is flat
creation order and not depth in lineage, that `createdAt` is the only orderable key a
version carries (the authored name is free text by D-01/D-04 and `saveOverVersion` never
retakes the date, so a correction does not renumber the book), and that a version with no
`createdAt` sorts where `sortedVersions` already puts it (last, descending) and therefore
takes the lowest ordinals.

### The tests

A `describe('versionIdentity')` block in `app/src/domain/lineage.test.js`, inserted after
the `versionsForRecipe` block (`:87-92`) and before `describe('latestVersionPerRecipe')`
(`:94`); add `versionIdentity` to the import list at `:5-17`. Build fixtures with the file's
existing `makeVersion` helper. Eight cases:

1. **The oldest of three is `Version 1`, the newest `Version 3`** — sort three versions with
   `sortedVersions`, then assert each identity, so the test reads the ordinal off the same
   array the app does.
2. **A one-version recipe reads `Version 1 · {label}`.**
3. **The authored name is passed through exactly** — a label with mixed case and punctuation
   comes back untouched: not title-cased, not truncated, not trimmed, no fallback word.
4. **Two siblings of one parent take CONSECUTIVE ordinals** — four versions, two of them
   sharing a `parentVersionId`, assert the two siblings' numbers differ by one. This is the
   case Mark specifically asked to see read correctly.
5. **A tie on `createdAt` resolves by array position** — two versions with the same
   `createdAt`; `sortedVersions` returns them in input order, so the first wears the HIGHER
   number. Assert both, and name in the test's own words that position, not the date, is
   what decides.
6. **A version with `createdAt: null` takes the lowest ordinal** — `sortedVersions` puts it
   last in a descending sort, so `ordered.length - index` gives it `Version 1`. No special
   word.
7. **A version absent from the array is named by its authored line alone** — the pre-load
   paint. Assert the return contains neither the word `Version` nor a digit from the
   ordinal.
8. **`saveOverVersion` leaves the identity unchanged** — build three versions, run
   `saveOverVersion` on the middle one with a new label, re-sort, and assert its ordinal is
   the same number it was. This is the fix's own Verify line, proved in the domain.

**Verify:**
```
npm --prefix app test -- src/domain/lineage.test.js
npm --prefix app test
```
Both green. Report the real file/test counts from the second run; the baseline is
**35 files / 1010 tests** and this task adds tests to an existing file, so 35 stays 35.

**Done:** `versionIdentity` is exported from `app/src/domain/lineage.js`, imports no
framework/DOM/store, and is covered by eight node-environment tests. Nothing under
`app/src/ui` or `app/src/styles` has moved.

---

## Task 2 — the register names each version by its ordinal

**Files:** `app/src/ui/VersionStrip.jsx`, `app/src/ui/VersionStrip.test.jsx`
**Commit:** `feat(version-identity): the register names each version by its ordinal`

The fix's item 3. Committed second so the register and the version row can be compared
side by side at the end, and so the string is proved in the site that already renders a
list of four before it is asked to name a single one.

### 2a — `VersionStrip.jsx`

Inside the `ordered.map` (`:37`), the version's label is read **twice** — MEASURED at
`:78` as plain text and `:79` as the `Link`'s child. Both become the identity:

```jsx
const identity = versionIdentity(ordered, version);
```

hoisted beside `versionBatches` and `citedBatch`, then substituted into both branches:

```jsx
{isCurrent || openPen
  ? identity
  : <Link to={`/recipe/${version.id}`}>{identity}</Link>}
```

**The whole identity is the link text, not just the authored name.** § 6's register rule is
"the identity is the only link", and the fix's "one string, one line, never two elements
the CSS could separate" forbids splitting the ordinal out of the anchor.

Add `versionIdentity` to the existing `../domain/lineage.js` import at `:3`. **Nothing else
in the row moves:** provenance, the record block, the markers array, `is-current`, the
one-link rule, the in-view dead-control rule and the pen's link-suppression all survive
unchanged. `.history-register__name` and `.history-register__marker` get no new rule and no
new class — the ordinal is part of the name string.

Extend the component's header comment to say the row's identity is now
`versionIdentity`'s output, one string shared with the version row's own heading — do not
rewrite the comment's existing paragraphs.

### 2b — `VersionStrip.test.jsx`

The fixtures' ordinals, computed from `makeVersion`'s own `createdAt` values so the
executor does not have to re-derive them. `versions` is `[a: Jan, b: Feb, c: Mar]` in the
three-version blocks, so `ordered` is `[c, b, a]` and the ordinals are **third = 3,
second = 2, first = 1**.

| Line (MEASURED) | Becomes |
|---|---|
| `:57` `toContain('line')` | `toContain('Version 1 · line')` |
| `:72-74` `indexOf('third'/'second'/'first')` | unchanged — still substrings, order assertions still hold. ADD: assert `Version 3 · third`, `Version 2 · second`, `Version 1 · first` all present |
| `:93-95` the `is-current` exact regex | `…__name">Version 2 · second <span class="history-register__marker">· In view</span></p>` |
| `:105-106` the batch-history counts | unchanged |
| `:117-119` the link exact regex (single version `v2`) | `<a href="/recipe/v2"…>Version 1 · 48 g oil · 800 g</a> <span…>· Latest</span>` |
| root / citation / provenance cases (`:127-193`) | unchanged — they assert the provenance and record blocks, and `not.toContain('null')` still holds |
| `:277-282` both markers on one entry (string at `:280`) | `…__name">Version 3 · third <span…>· In view · Latest</span></p>` |
| `:284-287` no marker on a middle entry (regex at `:286`) | `<a href="/recipe/a"…>Version 1 · first</a>` |
| `:289-299` the tied-`createdAt` case | `<a href="/recipe/a"…>Version 2 · first</a> <span…>· Latest</span>` — **note the ordinal is 2, not 1**: two versions tie, `sortedVersions` keeps input order, so `ordered[0]` (`first`) wears the higher number. Add a sentence to the test naming that, and assert `second` reads `Version 1` |
| the D-UAT-2 block (`:224-257`) | unchanged — `toContain('first')` etc. still hold as substrings |

Also add ONE new case to the marker describe: **the identity carries no anti-goal form** —
assert the markup contains none of `v3`, `#3`, `3rd`, `Version 03`, and that no element
wraps the ordinal on its own (no `<span>Version 3</span>`).

**Verify:**
```
npm --prefix app test -- src/ui/VersionStrip.test.jsx
npm --prefix app test
npm --prefix app run build
```
All green. Report the real counts.

**Done:** every register row reads `Version {n} · {authored name}` with the whole string
inside the row's one link; the ordinals run 4, 3, 2, 1 down a four-version list with no gaps
and no repeats; nothing else in the row changed.

---

## Task 3 — the identity becomes the version row's heading, and the name leaves the headnote

**Files:** `app/src/ui/VersionRow.jsx`, `app/src/ui/VersionRow.test.jsx`,
`app/src/ui/Headnote.jsx`, `app/src/ui/Headnote.test.jsx`, `app/src/ui/RecipePage.jsx`,
`app/src/styles/app.css`
**Commit:** `feat(version-identity): the identity is the version row's heading, and leaves the headnote`

The fix's items 2, 4, 5 and 6. **These land in ONE commit and cannot be split:** the name
leaving the headnote, the name arriving on the version row, the focus prop rewiring between
them, and the CSS delete-and-add are one state change. Any partial commit leaves the page
either naming the version twice or not at all, and leaves D-27 half-wired.

### 3a — `VersionRow.jsx`, the identity heading

**The prop.** Add `focusVersionOnMount = false` to the destructured props, in the same
default-false style Headnote used.

**The relocated focus trio**, moved verbatim from `Headnote.jsx:24-25, :36-41`, placed with
the two existing ref/effect pairs ABOVE the conditional render — the file's own comments at
`:41-43` and `:57-60` say why hooks cannot sit inside a branch here:

```js
const versionIdentityRef = useRef(null);
const [landingFocusVisible, setLandingFocusVisible] = useState(false);
useEffect(() => {
  if (focusVersionOnMount && mode === 'reading') {
    versionIdentityRef.current?.focus();
    setLandingFocusVisible(true);
  }
}, [focusVersionOnMount, mode]);
```

`useState` joins the existing `react` import at `:1`. **Keep the `mode === 'reading'` gate
exactly as Headnote had it** — `mode` is already a prop here (`:17`). The reading branch
renders when `openPen !== 'plan'`, which is `mode` of `'reading'` OR `'recording'`
(`derivePenState`, RecipePage.jsx:307-318, MEASURED), so the heading exists while a batch
pen is open but the landing focus does not fire there. That is the behaviour Headnote had;
do not "simplify" it to `openPen === null`.

**The ordinal's inputs.** `recipeVersions` already exists at `:81`. Beside it:

```js
const ordered = sortedVersions(recipeVersions);
const isLatest = ordered.length > 0 && ordered[0].id === version.id;
```

`sortedVersions` and `versionIdentity` join the `../domain/lineage.js` import at `:4`.
`isLatest` is `ordered[0]` positionally — the same discipline `Latest` took in
VersionStrip.jsx:33 and for the same reason; carry a one-line comment saying so.

**The heading**, replacing `<h2 className="region-name">Version</h2>` at `:167` and its
three-line comment above it (`:163-166`, which describes the retired word and is an orphan
THIS change creates — rewrite it, do not leave it):

```jsx
<h2
  ref={versionIdentityRef}
  className={`version-row__identity${landingFocusVisible ? ' is-landing-focus' : ''}`}
  tabIndex={focusVersionOnMount ? -1 : undefined}
  onBlur={() => setLandingFocusVisible(false)}
>
  {versionIdentity(ordered, version)}
  {isLatest && (
    <>
      {' '}
      <span className="history-register__marker">· Latest</span>
    </>
  )}
</h2>
```

**No `aria-label`.** The visible line now says what the override said, so the accessible
name and the visible text agree — the fix's own words, and the stronger state.

**`In view` never appears here** — the maker is on this version.

**Everything below the heading is untouched:** the `<dl className="version-row__meta-list">`
(`:180-222`) keeps Written / From version, Why and From batch with their captions, order,
links and link-suppression; `.version-row__history` and its `Versions (n)` button
(`:230-242`) are untouched; the acts group (`:248-273`) is untouched; the
`openPen === 'plan'` branch (`:91-160`), including `<h2 className="region-name">Next
version</h2>`, is **not touched**.

### 3b — `Headnote.jsx`, the authored name leaves

Delete the reading-mode `<p>` at `:70-78` whole. The ternary at `:46-79` becomes:

```jsx
{mode === 'developing' && (
  <label className="headnote__version-field"> … </label>
)}
```

Then remove the orphans THIS change creates and nothing else:

- `versionIdentityRef` (`:24`)
- `landingFocusVisible` / `setLandingFocusVisible` (`:25`)
- the landing-focus effect (`:35-41`) **and its three-line comment above it** (`:33-35`)
- `focusVersionOnMount` from the props (`:21`)
- `useState` from the `react` import (`:1`) — **check before removing: `useEffect` is still
  used at `:29-31` for `versionLineBlockedAttempt`, and `useRef` at `:23` for
  `versionLineFieldRef`. Only `useState` goes.**

The component's header comment (`:3-13`) names "current/draft version line" as part of the
block; correct that clause to say the recipe name and prose only, the authored name now
being the version row's own heading. Do not rewrite the rest of it — D-02 and D-03's
sentences still hold.

**The developing-mode `.headnote__version-field` is UNTOUCHED** — caption, input,
`autoFocus`, `aria-label`, `FieldFeedback` and all. It is where the name is authored, not
where it is read.

### 3c — `RecipePage.jsx`, the prop moves

Remove `focusVersionOnMount={focusVersionOnMount}` from the `<Headnote>` element
(`:1788`) and add it to the `<VersionRow>` element (`:1791-1814`, MEASURED — it closes with
`/>` at `:1814`). `:579`'s derivation from `location.state?.focusVersion` and `:1725`'s
`navigate(…, { state: { focusVersion: true } })` are **unchanged**. The comment at
`:576-577` ("read once here so the saved child can identify itself") stays true.

### 3d — `app.css`

**Delete** `.headnote__version` (`:485-489`) — an orphan THIS change creates. Leave
`.headnote__version-field` (`:501`), `.headnote__version-field > .pen-caption` (`:508`) and
`.headnote__version-field .ink-field` (`:520`) alone: different class, different job.

**Add ONE rule**, placed beside the other version-row rules (after
`.version-row__meta-list dd`, `:689-691`) so the row's own rules stay together:

```css
/* The version row's identity heading (route-recipe.md § 6 "One version
   identity, wherever a version is named", 2026-09-18): the same line the
   register prints for this version, minus "In view" — one string, in the
   text face at the version-line size (DESIGN.md's Headline role). It
   replaces the bare "Version" region name, so it takes .region-name's own
   bottom gap to the dl beneath it, and resets the h2's user-agent weight
   and size, which no other rule in this file does. The "Latest" span
   inside it reuses .history-register__marker, the way this row's own dl
   reuses .versions__lineage — one rule for the identity, and one type
   definition shared by both sites that print it. */
.version-row__identity {
  font-family: var(--face-text);
  font-size: var(--size-version-line);
  font-weight: 400;
  margin: 0 0 var(--gap-xs);
}
```

MEASURED: `--face-text` (tokens.css:12), `--size-version-line` (:17), `--gap-xs` (:47) and
`--size-small-print` (:22) all exist. `--gap-xs` is "whatever gap the existing caption rule
already gives the `dl` beneath it" — `.region-name { margin: 0 0 var(--gap-xs); }`
(app.css:1074-1083). `font-weight: 400` is a numeral, not a visual literal: the file already
declares 500/600/700 the same way, and `binder.test.js:285/289`'s no-hex and no-bare-px
censuses do not read it.

**No new `@media` block** (app.css stays at exactly 7), **no new token**, and
`.history-register__name` / `.history-register__marker` are unchanged.

### 3e — `VersionRow.test.jsx`

Rewrite the `Version region-name heading` describe (`:67-78` — comment and block) as the
identity-heading describe. Its cases:

1. **The default render** (`version: oliveOilVersion`, `versions: [oliveOilVersion]`)
   produces `<h2 class="version-row__identity">Version 1 · 50 g oil · 800 g <span
   class="history-register__marker">· Latest</span></h2>`, and the section still carries
   `aria-label="Version"`.
2. **No bare `Version` heading survives** — `not.toMatch(/<h2 class="region-name">Version<\/h2>/)`.
3. **The word `Version` appears exactly once in the identity line** — extract the `<h2>` and
   assert one occurrence.
4. **A middle version of a four-version set wears its own ordinal and NO `Latest`** — build
   root + child + sibling + grandchild with distinct `createdAt` values, render the middle
   one, assert its number and `not.toContain('Latest')`.
5. **Two siblings take consecutive ordinals** — render each of the two siblings in turn from
   the same four-version array and assert the two numbers differ by one. Mark's case.
6. **`In view` never appears on the version row**, in any of the above.
7. **The pre-load paint** — `renderVersionRow({ version: oliveOilVersion, versions: [] })`
   renders the authored line alone: `toContain('50 g oil · 800 g')`,
   `not.toContain('Version 1')`, and the `<h2>` still exists (D-27's focus target must exist
   on mount).
8. **The landing focus**, moved in from `Headnote.test.jsx:159-163`:
   `renderVersionRow({ focusVersionOnMount: true })` matches
   `/<h2[^>]*class="version-row__identity[^"]*"[^>]*tabindex="-1"/`, and the heading carries
   **no `aria-label`** — assert its absence explicitly, since dropping it is a deliberate
   decision, not an omission. Say in the test's own words that the focus CALL cannot be
   driven here (no jsdom) and is covered by the browser checkpoint.
9. **No anti-goal form** — `v1`, `#1`, `1st`, `Version 01` absent from the markup.

**Do NOT change `renderVersionRow`'s default `versions={[oliveOilVersion]}`.** The file's own
comment at `:293-296` documents that a `childVersion` render without an explicit `versions`
array does not contain itself; those cases now exercise the pre-load branch and must keep
passing untouched. Every other describe in this file — the Develop opener, the placeholders,
the ceremony, Why, the citation, the save actions, the lineage dl, the Versions disclosure,
the form-status region — is **unchanged**, including `:89` and `:499`'s
`region-name">Next version<` assertions.

### 3f — `Headnote.test.jsx`

Four edits, no more:

| Line (MEASURED) | Edit |
|---|---|
| `:30-35` | the `it` name and `:33`'s `toContain(oliveOilVersion.versionLabel)` invert: the headnote renders the recipe name and **no** version line. `:32` and `:34` stay |
| `:47-50` | the exact-markup assertion drops the `<p class="headnote__version">…</p>` segment, leaving `<header class="headnote"><h1>…</h1><p class="headnote__prose">…</p></header>` |
| `:64` | deleted — it names a class that no longer exists, an orphan THIS change creates. The test's other three assertions stay |
| `:159-163` | the whole `it` deleted — it moves to `VersionRow.test.jsx`. Its `not.toContain('autofocus')` guard is **not lost**: the exact-markup test at `:47-50` already asserts the FULL reading-mode markup, which contains no input at all |

The file's header comment (`:1-9`) names "version line" as part of what this component
renders; correct that clause. Everything else is unchanged.

**Verify:**
```
npm --prefix app test -- src/ui/VersionRow.test.jsx src/ui/Headnote.test.jsx
npm --prefix app test
npm --prefix app run build
grep -rn 'headnote__version[^-]' app/src        # must exit 1 — comments included
grep -rn 'region-name">Version<' app/src         # must exit 1
grep -rn 'focusVersionOnMount' app/src/ui/Headnote.jsx   # must exit 1
```

**Done:** the version row's heading is the identity line with `· Latest` where it applies;
the headnote prints the recipe name and the prose and no version line; the pen's `Version`
field still opens, accepts and saves a name; `focusVersionOnMount` reaches VersionRow and
nothing else; `.headnote__version` is gone from the whole tree; the suite and the build are
green.

---

## Checkpoint — the live browser confirmation

`human_verify_mode` is `end-of-phase`, so the executor does **not** run this; it hands back
and the orchestrator runs it. Every component test in this suite renders through
`renderToStaticMarkup` under Vitest's `node` environment — there is no jsdom and no
testing-library, so **a focus behaviour cannot be driven from a test at all**, and a
resolved font, weight or width cannot be read from CSS source. The sketch-findings skill's
standing rule — measure the real DOM, never reason from CSS source — is why this list reads
computed values.

**Which assertions are which, stated plainly:**
- **Render-level (covered by the suite):** the identity string and its ordinal, `Latest`'s
  presence and absence, the `tabindex="-1"` attribute, the absent `aria-label`, the absent
  `region-name` heading, the pre-load paint, every anti-goal form.
- **Browser-only (covered here):** the focus actually landing, the resolved face/size/weight,
  wrapping and overflow at 1920 and 393, forced colours, the character-for-character
  comparison between the two live sites, and Save over leaving the ordinals still.

**The store.** A dev server is already running on **port 5174** holding a four-version,
two-branch store: root `olive-oil-ice-cream-v1` → v2 and v3 as siblings, v4 below v2, six
batches. That is the right fixture — v2 and v3 taking consecutive ordinals while being
siblings is the case Mark specifically wants to see read correctly. If the server is down,
write the same store straight into IndexedDB (both object stores use `keyPath: 'id'`).

Then, **reading computed values, not eyeballing**:

1. **The register reads `Version 4`, `Version 3`, `Version 2`, `Version 1`** top to bottom,
   matching its own newest-first order — no gaps, no repeats.
2. **The two siblings take consecutive ordinals**, and neither one's provenance line claims
   the other as its parent.
3. **Character-for-character.** With the Versions panel open on the page for v3, read the
   version row's `<h2>` `textContent` and the register's own row for v3, and assert in JS
   that the row's text equals the register's text with `· In view ` removed. Not by eye.
4. **The root reads `Version 1 · <name>`** with no provenance line beneath it, and its
   register row is still two lines tall.
5. **`Version` appears exactly once per identity line** — no heading above it repeats it.
   Confirm the page's heading outline (`document.querySelectorAll('h1, h2')` text) now names
   which version rather than merely that a version is there.
6. **Resolved type.** `getComputedStyle` on the identity `<h2>`: `fontFamily` resolves to
   the text face (Georgia stack), `fontSize` to `18px` (1.125rem), `fontWeight` to `400`.
   On the `Latest` span: the grotesk stack at `12px` (0.75rem). If the weight reads `700`,
   the `font-weight: 400` reset is missing.
7. **The headnote** prints the recipe name and the prose and **no version line**. Then open
   the pen: the `Version` field still opens, accepts a name and saves it.
8. **The fork lands.** Open a version, `Next version`, save as a new version. Focus lands on
   the CHILD's identity heading (`document.activeElement` is the `<h2>`), the
   `is-landing-focus` outline paints, blur clears it, and the element's **accessible name
   equals its visible text** — read `getAttribute('aria-label')` and confirm it is `null`.
   This is D-27 and it is the one thing no test can prove.
9. **Save over** any version: every ordinal on the page is unchanged afterwards.
10. **At 1920.** The version row's identity and the register's longest identity
    (`Version 4 · 60 g oil · 900 g · In view · Latest`) both wrap within their own column;
    `document.documentElement.scrollWidth` equals the viewport width.
11. **At 393** — device emulation via `gsd-browser emulate_device`; Chrome's
    `resize_window` reports success without moving the viewport. No horizontal overflow:
    `document.documentElement.scrollWidth === 393`. The identity wraps rather than crushing
    the dl beneath it.
12. **Forced colours emulated.** The ordinal and `Latest` survive — they are words in ink,
    with nothing carrying meaning by colour or weight.
13. **Nothing out of scope moved:** `Versions (n)`, `Batches (n)`, the batch panel and its
    rows (no ordinal anywhere on a batch), `is-current`'s bold-plus-1px-outline,
    `Next version`, `Record another`, `Correct`, `Show changes`.

Note Chrome's first click after a navigate on a fresh Sprinkles route often misses: wait,
re-find the element, and probe state by JS rather than trusting the click.

If Mark is away, defer this checkpoint to end-of-phase UAT and carry all thirteen items
verbatim into the SUMMARY rather than dropping them; keep the automated verification run
and green.

## Success criteria

- [ ] Every item in the fix description's "In" list (1-6) is applied; nothing beyond its ten
      files.
- [ ] Nothing in its "Out, and named" list moved; no anti-goal appeared.
- [ ] ONE exported domain function produces the identity string, and both sites render its
      return value verbatim — no second copy of the word `Version` or the ` · ` join in a
      component.
- [ ] The ordinal is `ordered.length - index` off `sortedVersions`'s own array. No second
      traversal, no second sort, no ascending re-sort, no second orderable key.
      `latestVersionPerRecipe` is not called, and the JSDoc says why.
- [ ] D-27's landing focus reaches `VersionRow`'s identity heading with `tabIndex={-1}`,
      `is-landing-focus` and the blur clear, and with **no** `aria-label`.
- [ ] `grep -rn 'headnote__version[^-]' app/src` and `grep -rn 'region-name">Version<'
      app/src` both exit 1, comments included.
- [ ] The pre-load paint renders the authored line alone and still renders the `<h2>`.
- [ ] One new CSS rule, reading `--face-text`, `--size-version-line`, `--gap-xs`; no new
      token, no literal, no new `@media` block (app.css stays at 7); `binder.test.js`'s
      three-focus-rule, no-hex and no-bare-px censuses pass untouched.
- [ ] `npm --prefix app test` green and `npm --prefix app run build` succeeds at each of the
      three commits, with the real measured numbers reported (baseline 35 files /
      1010 tests).
- [ ] The thirteen browser items are run, or deferred verbatim into the SUMMARY.

## Output

Write `260917-wrd-SUMMARY.md` in this directory when done. Record: the measured test count
after each commit; that the fix description's ten-file list held with **no eleventh file**,
and the sweep that proved it; the two citations that were a line off (`Headnote.jsx:69-78`
is really `:70-78`); the two things the fix did not answer and how each was decided (the
pre-load paint reading the authored line alone; the `Latest` span reusing
`.history-register__marker` rather than getting a rule of its own); the `font-weight: 400`
reset the h2 needed because no global heading reset exists; that
`Headnote.test.jsx:159-163`'s `not.toContain('autofocus')` guard was retired into the
exact-markup test rather than lost; the browser readings, or the deferral with all thirteen
items carried; and `DESIGN.md` § Typography's Headline entry ("the version line under the
name") as an `/impeccable document` follow-up this change falsified as to position but did
not edit.
