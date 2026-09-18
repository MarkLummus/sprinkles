---
phase: quick-260918-mpy
plan: 01
type: execute
wave: 1
depends_on: []
autonomous: true
requirements:
  - VROW-01
  - VROW-02
  - VROW-03
files_modified:
  - app/src/ui/VersionRow.jsx
  - app/src/ui/VersionRow.test.jsx
  - app/src/styles/app.css

estimate:
  tokens: 22000
  raw_tokens: 22000
  tasks: 2
  confidence: low

must_haves:
  truths:
    - "A child version's row prints its OWN written date under its own `Written` term — the same date the History register prints for that version (VROW-01)."
    - "The `From version` value carries the parent's name and nothing else: no date, no separator, no second record's fact (VROW-02)."
    - "A root version's rendered markup is byte-identical to HEAD's — `Written`, then `Why` — because the `Written` pair it already had is the pair the child now shares (VROW-01)."
    - "The middot separator in this row joins parts of ONE record only; it never joins the parent's name to the child's date (VROW-02)."
    - "`npm --prefix app test -- --run` passes at 38 files / 1047 tests — HEAD's 1046 plus the one new case (VROW-03)."
    - "No CSS declaration changes: the child's `Written` dd reuses the root's existing `.versions__lineage version-row__written` pair, so no literal and no new token enters app/src/styles (VROW-01)."
  artifacts:
    - app/src/ui/VersionRow.jsx
    - app/src/ui/VersionRow.test.jsx
  key_links:
    - "The `Written` dt/dd pair the child needs already exists for a root version at VersionRow.jsx:216-219. Hoist that pair out of the ternary so both branches share ONE definition — do not author a second Written pair for the child, or the two can drift."
    - "`childVersion` in VersionRow.test.jsx:56 spreads `oliveOilVersion`, so it inherits `SEED_CREATED_AT` (1 Jul 2026). Until the fixture carries a createdAt of its own, NO assertion can tell the child's date from the parent's — the fixture change is what makes this bug testable."
    - "The reading branch (VersionRow.jsx:182-311) is the only branch that changes. The plan pen's branch (VersionRow.jsx:111-180) renders its own `From version` dd and never carried a date; VersionRow.test.jsx:~324 pins that branch rendering no `Written` dt at all. Leave it alone."
    - "`{version.parentVersionId && (…)}` is the house idiom for a conditional dt/dd pair in this same dl (see the `From batch` pair at VersionRow.jsx:244). `parentVersionId` is `null` on a root version, so the guard renders nothing."
    - "`.version-row__written` and `.version-row__batch-provenance` share one CSS rule (app.css:674). The child's Written dd takes that rule unchanged; only the rule's comment above `.version-row__parent-name` states something that stops being true."
---

<objective>
A child version's row prints the child's own written date INSIDE the value of `From version`, which
names the parent. On `/recipe/ov-v2` the row reads `FROM VERSION 50 g oil · 800 g · written 5 Aug
2026` — `50 g oil · 800 g` is Version 1's name and `5 Aug 2026` is Version 2's creation date, so one
value states two records' facts and the middot, which everywhere else in this app joins parts of one
record, switches records mid-value. The History register below the row already prints it correctly:
Version 1 written 1 Jul 2026, Version 2 written 5 Aug 2026.

Purpose: a maker reading a version's provenance must be able to trust that a line's value belongs to
the record its label names. `Written, From version, From batch, In view and Latest are compact facts`
(`.impeccable/surfaces/route-recipe-version.md:136`) — `Written` is a term of this row's own
vocabulary, and the root version already gets it (VersionRow.jsx:216-219). The child gets the same
term, and `From version` is left carrying the parent alone.

Output: three files changed — one JSX ternary split into a shared pair plus a guarded pair, the
assertions that pinned the folded suffix retargeted, and one stale CSS comment clause corrected.
No new class, no new token, no CSS declaration.
</objective>

## Contract diff — current behaviour against the target

Measured against the working tree on 2026-09-18 (HEAD `06fae6e`). The executor implements this
table; it does not re-derive it. Line numbers are HEAD's and shift by a line or two as edits land.

<!-- planner-discipline-allow: · written -->

| # | Contract item | Site | Current (HEAD) | Target |
|---|---|---|---|---|
| VROW-01 | Every version prints its own `Written` term | `VersionRow.jsx:214-219` | the `Written` dt/dd pair renders only in the root arm of a ternary | the pair renders unconditionally, first in the dl, for root and child alike |
| VROW-02 | `From version` carries the parent alone | `VersionRow.jsx:232` | the dd appends a second span holding the version-IN-VIEW's `createdAt` after the parent's name | that span is deleted; the dd holds the `.version-row__parent-name` span alone |
| VROW-02 | …and its render guard | `VersionRow.jsx:214,219-220,235` | `{!version.parentVersionId ? (…root…) : (…child…)}` | `{version.parentVersionId && (…From version pair…)}`, the ternary retired |
| VROW-01 | The dl's reading order | `VersionRow.jsx:213-258` | `[Written \| From version+date]`, `Why`, `From batch` | `Written`, `From version` (where a parent exists), `Why`, `From batch` — Why and From batch untouched |
| VROW-03 | The tests move with it | `VersionRow.test.jsx:56-65,417-438` | `childVersion` inherits the seed's createdAt; one case asserts the folded suffix | the fixture carries its own createdAt; the suffix assertion is replaced by the two facts it hid |
| — | The plan pen's own `From version` | `VersionRow.jsx:111-180` | names the parent, no date, its own ceremony | **out of scope** — do not touch |
| — | The History register's written line | `RecipeHistory.jsx:128` | `written {recordDateWords(version.createdAt)}` per version | **already correct** — it is the reference this row must now agree with. Do not touch |
| — | `.version-row__written` / `.version-row__parent-name` declarations | `app.css:669-678` | correct for both sites | **unchanged** — only the comment above them names a fold that no longer exists |

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@/Users/mark/Documents/projects/sprinkles/CLAUDE.md
@/Users/mark/Documents/projects/sprinkles/.claude/CLAUDE.md
@/Users/mark/Documents/projects/sprinkles/app/src/ui/VersionRow.jsx
@/Users/mark/Documents/projects/sprinkles/app/src/ui/VersionRow.test.jsx

House rules that bind this task: simplicity first; surgical changes (every changed line traces to
the table above); plain words and short sentence-case labels; every visual value through a token
(this change adds none). Test command: `npm --prefix app test -- --run`. HEAD baseline: 38 files,
1046 tests, all passing.

Facts the executor needs and must not re-derive:
- `recordDateWords(iso)` (`app/src/domain/batch.js:39`) returns `D Mon YYYY`, or `date unknown` for
  a null/absent date. It is already imported at the top of VersionRow.jsx.
- `SEED_CREATED_AT` is `'2026-07-01T00:00:00.000Z'` → `1 Jul 2026`. Both `oliveOilVersion` and
  today's `childVersion` test fixture carry it.
- Component tests here are `renderToStaticMarkup` string assertions in the node environment — no
  jsdom, no testing-library. The rendered string carries no comments and no newlines, so a JSX
  comment can never satisfy or break a markup assertion.
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Pin the two facts the folded value hid — the child's own date, and a parent's name with nothing appended</name>
  <files>app/src/ui/VersionRow.test.jsx</files>
  <read_first>
app/src/ui/VersionRow.test.jsx lines 50-70 (the `childVersion` fixture) and lines 400-440 (the
`VersionRow — the lineage, as labelled lines (D-08)` describe block, where both the root's Written
case and the child's folded case live).
  </read_first>
  <behavior>
    - The `childVersion` fixture carries a createdAt of its own, distinct from the seed's, so an assertion can tell the child's date from the parent's at all.
    - A child version's rendered dl contains a `Written` term whose value is the CHILD's date words (5 Aug 2026), not the parent's (1 Jul 2026).
    - The value of the child's `From version` term contains the parent's version label and no date words of any kind, and no date-naming word.
    - The root version's existing cases (the `Written` term, the undated `date unknown` case, `no reason recorded`) are untouched and still pass.
  </behavior>
  <action>
Three edits in `app/src/ui/VersionRow.test.jsx`, nothing else in the file.

(a) The `childVersion` fixture (around line 56) spreads `oliveOilVersion` and so inherits the seed's
creation date. Add its own creation date to the object literal, after the `parentVersionLabel`
property and before `reason`: the property `createdAt` set to the ISO string for 5 August 2026,
`'2026-08-05T00:00:00.000Z'`. Add one short comment line above it in the file's own voice, saying
that the child needs a creation date of its own or no assertion can tell it from the parent's.
Do not change any other property of the fixture — `reason`, `citedBatchId` and `versionLabel` are
relied on by six other cases in this file.

(b) The case titled with `folded with the written date` (around line 417): retitle and retarget it.
The title becomes: renders From version (never bare "From"), a Written line of the child's own date,
From batch, Why, and the History control for a child version. Delete the assertion that the markup
contains the middot-and-date suffix — that string is the defect, and it must not survive anywhere in
this file. Keep every other assertion in the case exactly as it is.

(c) Add ONE new case to the same describe block, immediately after (b)'s case, titled: prints the
child's own written date under its own term, and leaves From version carrying the parent alone.
Render with `version: childVersion`, `versions: [oliveOilVersion, childVersion]`,
`citedBatch: augustSecondBatch`, `parentVersion: oliveOilVersion`. Assert, in this order:
  - the markup contains the exact string for the Written term: a `dt` with class
    `versions__lineage-label` whose text is `Written`;
  - the markup contains the exact string for its value: a `dd` with class
    `versions__lineage version-row__written` whose text is `5 Aug 2026`;
  - capture the value that follows the From version term with a match on
    `/<dt[^>]*>From version<\/dt><dd[^>]*>(.*?)<\/dd>/` and assert that captured group contains
    `oliveOilVersion.versionLabel`, and does NOT contain `5 Aug 2026`, does NOT contain
    `1 Jul 2026`, and does NOT contain the lowercase word for a written date.
Use the file's existing `renderVersionRow` helper and its existing imports; add no import.

This task is RED on purpose: (b) and (c) describe markup the component does not yet produce.
  </action>
  <verify>
    <automated>npm --prefix app test -- --run src/ui/VersionRow.test.jsx</automated>
  </verify>
  <done>
The filtered run exits non-zero, and the ONLY failures are in the new case from (c): the two missing
Written strings and the captured From-version value still carrying the child's date. Every other case
in the file passes, including both root-version cases. No file outside VersionRow.test.jsx is edited.
  </done>
</task>

<task type="auto">
  <name>Task 2: Give the child the root's own Written term and leave From version carrying the parent</name>
  <files>app/src/ui/VersionRow.jsx, app/src/styles/app.css</files>
  <read_first>
app/src/ui/VersionRow.jsx lines 202-258 (the right-hand stack's comment, the dl, the root/child
ternary, and the Why and From batch pairs that follow it); app/src/styles/app.css lines 665-680
(the `.version-row__parent-name` and `.version-row__written` rules and the comment above them).
  </read_first>
  <action>
One structural edit in `app/src/ui/VersionRow.jsx`, in the reading branch's dl only (the branch
under `) : (` at line 181 — NOT the `openPen === 'plan'` branch above it).

Replace the whole ternary that opens the dl, which today reads:

```
        <dl className="version-row__meta-list">
          {!version.parentVersionId ? (
            <>
              <dt className="versions__lineage-label">Written</dt>
              <dd className="versions__lineage version-row__written">{recordDateWords(version.createdAt)}</dd>
            </>
          ) : (
            <>
              <dt className="versions__lineage-label">From version</dt>
              <dd className="versions__lineage">
                <span className="version-row__parent-name">
                  {openPen ? (
                    version.parentVersionLabel
                  ) : (
                    <Link to={`/recipe/${version.parentVersionId}`} state={{ focusVersion: true }}>
                      {version.parentVersionLabel}
                    </Link>
                  )}
                </span>
                <span className="version-row__written">{` · written ${recordDateWords(version.createdAt)}`}</span>
              </dd>
            </>
          )}
```

with the shared pair followed by the guarded pair:

```
        <dl className="version-row__meta-list">
          <dt className="versions__lineage-label">Written</dt>
          <dd className="versions__lineage version-row__written">{recordDateWords(version.createdAt)}</dd>
          {version.parentVersionId && (
            <>
              <dt className="versions__lineage-label">From version</dt>
              <dd className="versions__lineage">
                <span className="version-row__parent-name">
                  {openPen ? (
                    version.parentVersionLabel
                  ) : (
                    <Link to={`/recipe/${version.parentVersionId}`} state={{ focusVersion: true }}>
                      {version.parentVersionLabel}
                    </Link>
                  )}
                </span>
              </dd>
            </>
          )}
```

Everything after that point in the dl — the `Why` dt/dd and the `From batch` pair — is untouched, as
is the closing `</dl>`. The `.version-row__parent-name` span stays: it is what keeps the parent's
name in the text face, and retiring it would orphan a live CSS rule for no gain.

Then correct the two comments this edit makes untrue, and nothing else:

1. `VersionRow.jsx`, the block comment that opens the right-hand stack (around line 203). Its second
   clause today names one folded line. Replace that clause so the comment reads: a Written line
   carrying this version's own date, a From-version line where a parent exists, a Why line always
   present, and a From-batch line where cited. Leave the rest of that comment (the link-suppression
   discipline, the sketch citation, the History-disclosure note) exactly as it is. Do NOT quote the
   retired suffix in any comment — name the change, do not reproduce the defect's string.
2. `app/src/styles/app.css`, the comment above `.version-row__parent-name` (around line 667). Its
   closing clause claims the name and the date share one provenance line. Replace that clause so the
   sentence ends: are compact metadata on their own labelled lines. Change no declaration, no
   selector, and no value in this file.
  </action>
  <verify>
    <automated>npm --prefix app test -- --run</automated>
  </verify>
  <done>
`npm --prefix app test -- --run` passes: 38 files, 1047 tests, zero failures — HEAD's 1046 plus
Task 1's new case. A child version's row prints `Written` with the child's own date and a
`From version` value holding the parent's name alone; a root version's markup is unchanged from
HEAD. `app/src/styles/app.css` shows a comment-only diff.
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| stored version record → rendered row | `createdAt` and `parentVersionLabel` come from IndexedDB (seeded locally or imported through the transfer validator) and are rendered as React children |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-mpy-01 | Tampering | `VersionRow.jsx` dl values | low | mitigate | Both values stay plain React children; `dangerouslySetInnerHTML` is not introduced, so an imported label or date renders as text, per the project's markup convention |
| T-mpy-02 | Information disclosure | the child's `createdAt` | low | accept | The same field is already rendered on this row and in the History register; this plan moves where it prints, and exposes no field the row did not already show |
| T-mpy-SC | Tampering | dependencies | low | accept | No package-manager install: no dependency is added, removed or upgraded by either task |
</threat_model>

<verification>
- `npm --prefix app test -- --run` → 38 files, 1047 tests, all passing.
- `git diff --stat` names exactly three files: `app/src/ui/VersionRow.jsx`,
  `app/src/ui/VersionRow.test.jsx`, `app/src/styles/app.css`.
- `git diff app/src/styles/app.css` contains no line beginning with a property declaration — the
  CSS change is a comment clause only.
- Live check (record it in the SUMMARY, do not block on it): on a two-version store, the version
  row's `Written` value for the version in view equals the date the History register prints on that
  version's own line, and the `From version` value reads as the parent's name alone.
</verification>

<success_criteria>
- A child version states one fact per labelled line: `Written` is its own creation date, `From
  version` is its parent's name, and neither line carries the other's record.
- A root version's rendering is unchanged, from one shared `Written` pair rather than two copies.
- The retired middot-and-date suffix appears nowhere in `app/src` — not in markup, not in a test
  assertion, not in a comment.
- The full suite is green at 1047 tests, one more than HEAD.
</success_criteria>

<output>
Create `.planning/quick/260918-mpy-task-1-child-version-s-own-written-date-is-printed-inside-it/260918-mpy-SUMMARY.md` when done
</output>
