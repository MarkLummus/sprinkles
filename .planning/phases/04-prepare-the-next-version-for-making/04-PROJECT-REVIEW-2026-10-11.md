---
reviewed: 2026-10-11
reviewer: Codex
head: 82e43ae
scope: Project review with emphasis on the new recipe print workflow
status: issues_found
findings:
  p1: 1
  p2: 2
validation:
  test_files_passed: 77
  tests_passed: 2443
  production_build: passed_with_chunk_size_warning
---

# Project review after recipe print support

The print workflow is a substantial improvement: it reads saved versions only,
separates blank logs from recipe content, measures formula pages, supplies a
deterministic match-back code, and supports kept drafts. Import now commits all
three record stores in one transaction. The earlier import atomicity finding
is resolved. Database reset logic is now explicitly bounded to pre-version-8
profiles, rather than automatically applying to every future database bump.

Three concrete defects remain. The first two concern ordinary saved data and
imports; the third concerns long, unconstrained authored text. Passing the
current suite does not cover these behaviors.

## Findings

### P1 — Printed balance includes removed ingredient lines

**Location:** `app/src/ui/PrintSheetPages.jsx:74`.

`sheetBlocks` computes its table total from `activeRows(version)`, and the
ingredient grouping excludes removed lines. Its figures are nevertheless built
with `buildFigures(version)`, which sums the unfiltered stored rows and portions.
`buildFigures` deliberately delegates filtering to its caller. The ordinary
recipe reading view supplies filtered rows; the new print view does not.

**Reproduction:** In an isolated Chrome profile seeded with Olive Oil v1, mark
the Graza Drizzle row's portions `removed: true`, reload the print route, and
wait for `data-print-ready=true`. This is the portion-removal representation
used by the current editor, not just the older whole-row flag.

**Observed:** Graza Drizzle is absent from the print table and the total is
759.7 g. The printed gauges still show PAC 24.1, POD 13.0, fat 18.0%, MSNF
8.5%, sugar 13.5%, solids 40.8%. Computing those same figures from the active
recipe gives PAC 25.3, POD 13.7, fat 13.7%, MSNF 8.9%, sugar 14.2%, solids
37.7%. Removed steps and individually removed portions can cause the same
disagreement. Paper can therefore report figures for a different formula than
the one it instructs the maker to weigh.

**Recommendation:** Build the print figures and their basis note from one
consistent active reading version, while preserving the original version for
identity and code derivation. Add regression coverage for whole-row removal,
single-portion removal, and removal through a method step. Assert that printed
figures agree with the active formula, rather than only testing table content.

### P2 — Successful import leaves the open print view on old saved data

**Location:** `app/src/ui/PrintSheet.jsx:38` (load effects through line 70);
`app/src/ui/Shell.jsx:312` (successful import).

The shell increments `storeRevision` after import, but `PrintSheet` does not
consume that context. Its reads depend on the route's version id or the already
loaded version object. Importing changed records under the same ids leaves the
old version, identity, code, and measured pages in memory, with Print enabled.

**Reproduction:** Open Olive Oil v1's print route, then use the shell's import
input to import a valid current-schema store file whose same version id has
`sheetTitle: 'IMPORTED REVIEW TITLE'`. Wait until IndexedDB contains that title.

**Observed:** The route still displays `Olive Oil Ice Cream`. Reloading displays
`IMPORTED REVIEW TITLE`. Changes to quantities or instructions follow the same
unrefreshed path. Printing before reload uses the old content and its old code;
code search against the updated store can then fail to match that paper.

**Recommendation:** Refresh or remount the print route after a successful
import and gate Print until the replacement version is measured. Treat the
recipe editor separately so refreshing does not silently discard open ink.
Add a browser regression for import while the print route is mounted.

**Prior review:** This independently reproduces the print portion of WR-03 in
`04-REVIEW.md`; it is not a newly introduced finding since that review.

### P2 — Long front matter exceeds a fixed page without a continuation plan

**Location:** `app/src/domain/sheetPages.js:69`;
`app/src/ui/PrintSheetPages.jsx:49` (single notes block);
`app/src/styles/print.css:92` (preview clipping).

The paginator treats the title band and the entire Before you start section
as indivisible first-page content. Their height is added to the first-page
offset without checking whether that front matter alone exceeds the usable
page height. The editor and import validator impose no text-length bound.
Moving table rows to later pages cannot solve an already oversized first page.

**Reproduction:** Give the saved version a Before you start note containing
`Before starting, check the ingredients and equipment. ` repeated 150 times.
Reload the print route and wait for its layout. Inspect the measured and
rendered boxes in Chrome with print media enabled.

**Observed:** The content box is 960 px tall; the notes alone are 2736.89 px,
and the first formula page's content is 2882.89 px. Print remains enabled.
The screen preview's fixed-height page clips this content. Under print media,
overflow becomes visible, so the actual printer must deal with content outside
the supposedly pre-paginated page. The screen preview and page plan are no
longer reliable representations of the paper output.

**Recommendation:** Paginate front matter into explicit continuation blocks,
or detect oversized content and provide a visible recovery path before
enabling Print. Apply the same oversized-block policy to a single very long
instruction, ingredient line, or closing title. Add browser layout checks for
long authored content, since numeric paginator tests alone cannot detect text
wrapping and preview clipping.

## Validation performed

- `npm --prefix app test`: 77 files, 2443 tests passed.
- `npm --prefix app run build`: passed. The single JavaScript chunk is
  518.21 kB minified / 147.39 kB gzip; Vite emits its default size warning.
- Isolated headless Chrome against the production build, served on temporary
  localhost ports with a fresh browser context. Requests to other hosts were
  blocked. No user browser profile or saved data was accessed.
- Baseline Olive Oil v1 print route became ready and rendered five page
  previews. No uncaught page errors were observed during the reproductions.
- Reproduced the three findings above. Numeric expectations for the first
  finding came from the existing domain calculation over active rows.
- Reviewed the current print, code lookup, draft, persistence and import
  implementation, the prior phase review and its follow-up fixes.

This review did not generate a new PDF, print on paper, or exercise Mobile
Safari or VoiceOver. The prior phase verification's real-device checks remain
applicable. It does not claim a fresh all-recipes cross-engine print sweep.

## Broader assessment

The framework-free domain layer and repository boundary continue to serve the
project well. Printed figures should reuse the same reading projection as the
screen, which would prevent the most important defect found here. Atomic import
and draft persistence improve data safety, although the existing review still
records unresolved import validation, import conflict, and storage-error paths.

`RecipePage.jsx` is now 2576 lines and `BatchRow.jsx` is 1308 lines. Further
work on these flows would benefit from extracting coherent draft persistence,
loading, and recording responsibilities while retaining regression coverage.
This is a maintenance priority after the correctness issues, not a reason for
a broad rewrite or a stack change.

Recommended order: correct the printed calculations; make import refresh safe
for readers and editors; handle oversized authored content; complete the
documented device and paper checks; then simplify the largest workflow modules
as they change. The bundle warning is a secondary performance task.

No application source files or existing review artifacts were changed.
