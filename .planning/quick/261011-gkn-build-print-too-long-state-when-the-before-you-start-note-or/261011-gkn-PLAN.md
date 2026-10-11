---
phase: quick-261011-gkn
plan: 01
type: execute
wave: 1
depends_on: []
files_modified: []
autonomous: true

must_haves:
  truths:
    - "For a version whose Before you start note is the review's sentence repeated 150 times, the print route shows 'This is too long to print on one page.' once, in .print-route__id beside the route line. Print is disabled, data-print-ready is absent and no Sheet page picture is drawn, in Chrome and in Playwright WebKit on the built app."
    - "A single step, ingredient line or closing foot (the foot carries the Sheet title) taller than the usable page makes pagesOverflow true, so Print stays off for each of them as for the note."
    - "Every seed version's print route is still ready, with Print on and no line."
    - "This plan changes nothing under app/. The behavior shipped with quick 261011-dz2 (commit ee4987d)."
  artifacts:
    - path: "app/src/domain/sheetPages.js"
      provides: "pagesOverflow(pages, box), line 317"
    - path: "app/src/ui/PrintSheetPages.jsx"
      provides: "useSheetPages lays no pages when oversize, lines 423-425"
    - path: "app/src/ui/PrintSheet.jsx"
      provides: "PRINT_TOO_LONG_LINE (line 15) rendered beside the route line (line 148); Print disabled={!sheet.pages} (line 152)"
    - path: ".planning/phases/04-prepare-the-next-version-for-making/04-print-oversize-probe.mjs"
      provides: "browser layout check: the review's 150-sentence reproduction in Chrome and WebKit, plus a sweep of every seed version"
  key_links:
    - from: "app/src/ui/PrintSheetPages.jsx"
      to: "app/src/domain/sheetPages.js"
      via: "const oversize = height > 0 && pagesOverflow(pages, { height });"
    - from: "app/src/ui/PrintSheet.jsx"
      to: "app/src/ui/PrintSheetPages.jsx"
      via: "sheet.oversize renders the line; sheet.pages stays null, so Print stays disabled"
---

<objective>
Confirm that the print route's too-long state, as this item describes it, already stands at the batch base, and record that. Do not build it again.

The item asks for four things. Print stays off and the print route reads exactly 'This is too long to print on one page.' when the Before you start note, or any single block (a step, an ingredient line, the closing title), is taller than the printed page. The line sits with the route's existing line. A browser layout check runs the 150-sentence reproduction from the third finding of .planning/phases/04-prepare-the-next-version-for-making/04-PROJECT-REVIEW-2026-10-11.md.

Quick 261011-dz2 built all four (Task B, commit ee4987d on main). See .planning/quick/261011-dz2-block-import-while-a-pen-is-open-print-o/261011-dz2-SUMMARY.md. Since ee4987d the only change under app/ is commit 480f198 (app/src/ui/SheetCodeSearch.jsx and its test), which is off the print path. At planning time, on db4457b, the two unit files passed (67 tests) and every grep gate below matched.

Purpose: close the item with evidence from this base, without a duplicate implementation (CLAUDE.md §2, §3).
Output: no app change, and a SUMMARY that maps each clause to its file, line and commit, with the probe's output.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@CLAUDE.md
@.claude/CLAUDE.md
@.planning/quick/261011-dz2-block-import-while-a-pen-is-open-print-o/261011-dz2-SUMMARY.md
@.planning/phases/04-prepare-the-next-version-for-making/04-PROJECT-REVIEW-2026-10-11.md

Where each clause lives (current line numbers at db4457b):
- app/src/ui/PrintSheet.jsx: line 15 is the constant, line 148 is the line under the h1 inside div.print-route__id, line 152 is Print with disabled={!sheet.pages}. Lines 13-14 hold the comment "Proposed copy awaiting Mark's approval".
- app/src/ui/PrintSheetPages.jsx: lines 418-425 in useSheetPages compute oversize from pagesOverflow and set pages to null when oversize.
- app/src/domain/sheetPages.js: lines 308-320 hold pagesOverflow. The header comment at lines 35-37 names it.
- app/src/domain/sheetPages.test.js: lines 643-683 cover front matter, a step, an ingredient line and the closing foot, each with an exact edge.
- app/src/ui/PrintSheet.test.jsx: lines 383-440 cover the route in the oversize state with the 150-sentence note, and Olive Oil v1 ready.
- .planning/phases/04-prepare-the-next-version-for-making/04-print-oversize-probe.mjs: the browser layout check, with its usage in the header.
</context>

<tasks>

<task type="auto">
  <name>Task 1: Confirm the too-long state at this base and record it (no app change)</name>
  <files>(none under app/; the SUMMARY only)</files>
  <precondition>app/node_modules is present in the checkout running this task, so npm --prefix app test runs. If it is missing, stop and report. Do not install anything.</precondition>
  <action>
No tracer. This plan changes no layer, and the shipped probe is the end-to-end check.

Do not edit any file under app/. Do not edit the probe or the 03.5 harness. If a check below fails, stop and report the failing clause with its output. Do not fix it under this plan: the item described behavior that had already shipped, so a regression needs its own plan.

1. Read each clause off the code with fixed-string greps. Each grep -cF must count exactly 1:
   a. One home for the sentence. app/src/ui/PrintSheet.jsx carries the export of PRINT_TOO_LONG_LINE set to 'This is too long to print on one page.'. A recursive fixed-string list of app/src for that sentence, with test files filtered out, names app/src/ui/PrintSheet.jsx alone.
   b. Placement with the route's existing line. PrintSheet.jsx renders sheet.oversize followed by a p of class print-route__line holding PRINT_TOO_LONG_LINE, inside div.print-route__id, directly after h1.print-route__line.
   c. Print stays off. PrintSheet.jsx keeps disabled={!sheet.pages} on Print. PrintSheetPages.jsx computes oversize as height above 0 and pagesOverflow(pages, { height }), and stores pages as null when oversize.
   d. Every block named in the item. sheetPages.js exports pagesOverflow(pages, box), which compares every laid page's bottom with box.height less PAGE_GUARD_PX. layPages forces a block onto a page only when no page can hold it: the front matter (band and Before you start) on page 1, a lone ingredient line under the repeated header, one step with its heading, and the closing foot (sheetTitle · version line · code). So one check covers the note, a step, an ingredient line and the closing title. The domain describe at sheetPages.test.js line 647 pins each of the four.

2. Run the two unit files listed in verify.

3. Run the browser layout check: the review's 150-sentence reproduction. Build into a scratch directory outside app/ (mktemp -d), never into app/dist, which Mark's vite preview on :4173 serves. Then run the probe with PROBE_DIST pointing at that build, from the repo root. The probe serves the build itself on an ephemeral 127.0.0.1 port and aborts every other host. Do not start, stop or contact any Vite server. It drives system Chrome and Playwright WebKit. At dz2 it printed "print-oversize-probe: 130 checks passed", "chrome: oversize before=2736.890625 box height=960" (the review's own 2736.89 px on a 960 box) and "webkit: oversize before=2424.890625 box height=900". Gate on the probe's exit status 0. The pixel values may move by a fraction with fonts. A check count other than 130 is acceptable only when the seed version count changed; say which. Copy the probe's output verbatim into the SUMMARY. Chrome and Playwright WebKit do not prove Safari print or the iPad. The device checks for this item are already on Mark's List, so add none.

4. Leave the comment at PrintSheet.jsx lines 13-14 ("Proposed copy awaiting Mark's approval") unchanged. This repo does not record whether Mark approved the wording. Name it in the SUMMARY as an open note for the orchestrator.

5. Write the SUMMARY. Its first sentence reads: Already delivered by quick 261011-dz2, commit ee4987d; this plan changed nothing under app/. Add a table that maps clauses a to d and the browser check to file:line and the commit (ee4987d). Then give the unit counts and the verbatim probe output. Name Mark's List row build-print-too-long-state as finished, for the orchestrator to close. The executor writes nothing to Mark's List. Leave out any Deferred Human Verification section.
  </action>
  <verify>
    <automated>test "$(grep -cF "export const PRINT_TOO_LONG_LINE = 'This is too long to print on one page.';" app/src/ui/PrintSheet.jsx)" = 1 && test "$(grep -cF '{sheet.oversize && <p className="print-route__line">{PRINT_TOO_LONG_LINE}</p>}' app/src/ui/PrintSheet.jsx)" = 1 && test "$(grep -cF 'disabled={!sheet.pages}' app/src/ui/PrintSheet.jsx)" = 1 && test "$(grep -cF 'export function pagesOverflow(pages, box)' app/src/domain/sheetPages.js)" = 1 && test "$(grep -cF 'const oversize = height > 0 && pagesOverflow(pages, { height });' app/src/ui/PrintSheetPages.jsx)" = 1 && test "$(grep -cF 'pages: oversize ? null : pages' app/src/ui/PrintSheetPages.jsx)" = 1 && test "$(grep -rlF 'This is too long to print on one page.' app/src | grep -v '\.test\.')" = "app/src/ui/PrintSheet.jsx" && npm --prefix app test -- --run src/domain/sheetPages.test.js src/ui/PrintSheet.test.jsx && SCRATCH="$(mktemp -d)" && npm --prefix app run build -- --outDir "$SCRATCH/gkn-dist" --emptyOutDir && PROBE_DIST="$SCRATCH/gkn-dist" node .planning/phases/04-prepare-the-next-version-for-making/04-print-oversize-probe.mjs && test -z "$(git status --porcelain -- app)"</automated>
  </verify>
  <done>Every grep gate counts 1. Both unit files pass. The probe exits 0 in Chrome and WebKit, with the oversize route showing the line once, Print disabled and no Sheet page picture, and every seed version ready. git status shows nothing under app/. The SUMMARY's first sentence names 261011-dz2 and ee4987d, maps every clause to file:line, carries the probe output verbatim, names the build-print-too-long-state row for the orchestrator to close, and names the unapproved-copy comment as an open note.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| probe -> network | A headless browser run against a scratch build of the app |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-261011-gkn-01 | Information disclosure | 04-print-oversize-probe.mjs through the 03.5 harness | low | accept | The harness serves the scratch build on an ephemeral 127.0.0.1 port, aborts every other host and opens a fresh browser context. No user profile and no :4173 or :8077 server is touched. |
| T-261011-gkn-02 | Tampering (a duplicate implementation drifting from the shipped one) | app/src print path | medium | mitigate | No edit under app/. The last gate fails if git status shows any change there. A failing clause stops the task rather than being patched here. |
| T-261011-gkn-SC | Tampering | npm installs | low | accept | Nothing is installed or changed. Playwright and Chrome are already at the paths the probe imports. |
</threat_model>

<verification>
- The grep gates, the two unit files and the browser probe in Task 1's automated verify all pass from the repo root.
- git status --porcelain -- app is empty after the task.
</verification>

<success_criteria>
- The item's four clauses (the line's exact words, Print off, placement with the route line, every named block) and its browser layout check are each shown to hold at the batch base, with file:line and commit ee4987d.
- No file under app/ changes. The SUMMARY gives the orchestrator what it needs to close Mark's List row build-print-too-long-state.
</success_criteria>

<output>
Create `.planning/quick/261011-gkn-build-print-too-long-state-when-the-before-you-start-note-or/261011-gkn-SUMMARY.md` when done.
</output>
