---
phase: "10"
slug: "the-creation-editor-without-save"
status: verified
# threats_open = count of OPEN threats at or above workflow.security_block_on severity (the blocking gate)
threats_open: 0
asvs_level: 1
created: "2026-10-21"
---

# Phase 10 — Security

> Per-phase security contract: threat register, accepted risks, and audit trail.

Register authored at plan time: every one of the twelve PLAN.md files carries a `<threat_model>` block, and every SUMMARY.md reports "Threat Flags: None" naming the threats its tests cover. Classification is L1 (ASVS 1, grep depth): each mitigation was located in the implementation or its test at commit 84f61cbb (2026-10-21), after quick 261021-07s moved the page notice (CSS only, no new boundary).

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| harness to Mark's preview | the scripts build and serve the app on the same machine where Mark serves app/dist to his iPad | see plan 10-01 |
| harness to network | Playwright pages could fetch beyond the local server | see plan 10-01 |
| maker input to drafts store | typed names, descriptions and Version names are written to the drafts store | see plan 10-02 |
| drafts store to page | a stored create draft (possibly from another tab or an older shape) is read back and rendered | see plan 10-02 |
| history state to page | route state survives reloads and Back; this plan writes only the booleans started and discarded, which plan 10-11 reads | see plan 10-02 |
| maker input to the entry | the typed name is compared with stored recipe names and written into a draft | see plan 10-03 |
| chosen file to store | an imported file replaces library rows a kept draft links to | see plan 10-04 |
| drafts store to Shell | the Shell reads the drafts store to decide whether to refuse | see plan 10-04 |
| maker input to the Sheet | note text and the description are typed and shown back | see plan 10-05 |
| creating branches in shared components | RecipeSheet, NoteList, Headnote and FormulationNote also draw every stored recipe | see plan 10-05 |
| library store to picker and Sheet | library entries (seeded, or written by an earlier import) are listed and projected into figures | see plan 10-06 |
| maker input to the draft | typed grams and picks change the create draft | see plan 10-06 |
| maker input to the table | typed grams are read for a message and a figure | see plan 10-07 |
| maker input to the draft | band ends and the temperature are typed | see plan 10-08 |
| catalog to page | style rows come from a store table an import can replace (refused while a creation is kept, plan 10-04) | see plan 10-08 |
| maker input to the draft | scale words and problem words are typed | see plan 10-09 |
| catalog to page | the core scales and problems come from store tables an import can replace (refused while a creation is kept, plan 10-04) | see plan 10-09 |
| planned builds to Mark's preview | the scripts build and serve on the machine where Mark serves app/dist to his iPad | see plan 10-10 |
| Mark's List to agents | row text is written by Mark and earlier agents | see plan 10-10 |
| drafts store to page | a stored create draft (possibly from another tab or an older shape) is read and its name rendered | see plan 10-11 |
| history state to page | route state survives reloads and Back and could be anything | see plan 10-11 |
| library store to picker | library entries (seeded, or written by an earlier import) are listed with their display fields | see plan 10-12 |
| maker input to the picker | typed filter text | see plan 10-12 |

---

## Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation | Status |
|-----------|----------|-----------|----------|-------------|------------|--------|
| T-10-01 | Tampering | 10-walk-check.sh, 10-walk-record-base.sh, 10-board-check.mjs overwriting app/dist | medium | mitigate | every build passes --outDir into $TMPDIR/sprinkles-10 (per checkout for the walk); scripts only read PROBE_DIST; acceptance greps the outDir lines (plan 10-01) | closed |
| T-10-02 | Repudiation | a baseline recorded from a moved base | medium | mitigate | the before-walk is recorded from a detached worktree at ec44fa72, and the script refuses when a non-Phase-10 commit touched app/ after BASE (plan 10-01) | closed |
| T-10-03 | Information disclosure | WebKit pages reaching the network | low | mitigate | every context aborts requests whose host is not 127.0.0.1 (board pages: file: only), as Phase 9's harness does (plan 10-01) | closed |
| T-10-04 | Tampering | Start and the kept draft overwriting a stored record | high | mitigate | the draft lives in the drafts store keyed by a freshly minted versionId (freshId); only saveDraft and deleteDraft are called, and CreationFlow.test.jsx spies on every version, recipe, batch, library and import write and asserts none is called (plan 10-02) | closed |
| T-10-05 | Tampering | route state shown as a notice | medium | mitigate | route state carries the booleans started, discarded and createKept only; the Notebook announces its own constant DRAFT_DISCARDED_STATUS and the editor the hook's DRAFT_KEPT_STATUS, never text from history; the flags are replaced with null once read; createKept is computed by Cancel from its own drafts read, never copied from the store (plan 10-11) | closed |
| T-10-06 | Spoofing | 'new' read as a recipe id | medium | mitigate | /notebook/new is declared before /notebook/:recipeId, pinned by notebookPaths.test.js; created ids are UUIDs (plan 10-02) | closed |
| T-10-07 | Information disclosure | a draft left behind after Cancel, or written back by a late restore or edit | medium | mitigate | Cancel's discard holds every write while the delete is out (endedRef: the restore, the persist effect and the flushes write nothing) and stays final once the delete succeeds, so nothing re-writes the record; Cancel awaits the delete before navigating (Pitfall 6) and a failed delete keeps the page instead of announcing a discard; useKeptDraft.test.jsx covers the deferred restore, the edit after discard, the deferred delete and the rejected delete (plan 10-02) | closed |
| T-10-08 | Tampering | stored names and descriptions rendered as markup | high | mitigate | React text children only, in the Sheet heading and on the Notebook's draft row; a test renders a name holding angle brackets and finds them escaped; no raw-HTML prop in the new files (grep) (plan 10-02) | closed |
| T-10-09 | Denial of service | an unfit or half-made create draft crashing the route | medium | mitigate | CreationRoute mounts only a record draftMatchesCreate accepts; the editor lays every accepted payload over blankCreateDraft (normalizeCreateDraft) at mount and at restore, a row with no portion gets an empty one, and creationSheetVersion skips a row whose library entry is gone instead of throwing (plan 10-02) | closed |
| T-10-10 | Tampering | recipeNameTaken comparing typed text | low | mitigate | an array scan with string checks; no object is indexed by typed text, so a name like __proto__ is only compared, never used as a key (plan 10-03) | closed |
| T-10-11 | Denial of service | a double Start writing two create drafts | medium | mitigate | a ref guard ignores Start while the write is in flight; a click and Enter take the one submit path; a test presses Start twice before saveDraft resolves and finds one call (plan 10-03) | closed |
| T-10-12 | Tampering | Import while a creation is kept | high | mitigate | chooseImportFile opens the chooser only while the state is absent; present refuses with the creation sentence; an import past the chooser re-reads the drafts before importStore and refuses on a kept creation; tests cover the header and More's Import on Home, the Notebook, the editor and a version route, and an import in flight when a creation starts (plan 10-04) | closed |
| T-10-13 | Tampering | an unknown or stale kept state at the click (cold boot, a failed read, quick navigation after Start or Cancel, a second creation left after Cancel) | high | mitigate | three states, unknown refusing with the store sentence and re-reading; /notebook/new and Cancel's landing decide the click in their own render and are written at their commit, so an older read cannot overwrite them; Cancel's landing reads present while createKept is true and unknown without it, never absent on discarded alone; only the newest read counts; tests defer or reject reads at boot, after Cancel (one creation, two creations, Cancel's read failed) and after Start-and-leave (plan 10-04) | closed |
| T-10-14 | Repudiation | a Shell notice changing what the walk records on recipe routes | medium | mitigate | the Shell renders its notice only while no routed page has registered one, RecipePageForRoute registers on mount, and the strict walk MATCHes 94 snapshots (plan 10-04) | closed |
| T-10-15 | Tampering | notes and the description rendered as markup | high | mitigate | textarea values and React text children only; a test renders a note holding angle brackets and finds them escaped (plan 10-05) | closed |
| T-10-16 | Tampering | a creating branch changing the reading or pen Sheet | medium | mitigate | every change keys on mode 'creating'; the pinned expressions, the markers and RecipeSheet.test.jsx:68 stay green, and the strict walk MATCHes 94 snapshots (plan 10-05) | closed |
| T-10-17 | Denial of service | a draft row whose library entry is gone, an overflow-sized grams value, or a library that cannot be read | medium | mitigate | creationSheetVersion skips a row with no entry instead of throwing (plan 10-02) and projects a non-finite grams reading at 0 g (a test pastes a 309-digit amount); a failed library read keeps the band and Cancel on the page; the picker in this plan shows only each entry's validated name (plan 10-06) | closed |
| T-10-18 | Tampering | row ids used as keys | medium | mitigate | row ids are minted with freshId() in the pick handler; per-row values live in Maps keyed by row id, never in a bare object indexed by stored text (T-02-32's rule) (plan 10-06) | closed |
| T-10-19 | Tampering | a typed name becoming a row | low | mitigate | only a library record's own button adds; no match shows "Not in the library yet" and adds nothing (test) (plan 10-12) | closed |
| T-10-20 | Tampering | per-row error ids and messages keyed by row id | low | mitigate | row ids are minted UUIDs (plan 10-06) used only as a Map key and inside an id attribute React escapes; the ingredient name reaches the sentence as text (plan 10-07) | closed |
| T-10-21 | Tampering | typed band text used as an object key | medium | mitigate | setBandEnd accepts only the six fixed band keys (a RangeError otherwise); the typed text is only ever a value (plan 10-08) | closed |
| T-10-22 | Tampering | an unreadable temperature stored as a number | low | mitigate | an entry the browser cannot read is kept as MALFORMED_NUMBER_ENTRY, shown blank; the string is never parsed here, and Phase 11's Save must refuse it (plan 10-08) | closed |
| T-10-23 | Tampering | a scale key colliding with a core key or an unsafe name | medium | mitigate | keys are minted with mintScaleKey(freshId()) ('scale-' prefix) in the click handler; addScale refuses a repeated or empty key; draftMatchesCreate still checks unsafe keys on restore (plan 10-09) | closed |
| T-10-24 | Tampering | a device check run against the dev server | medium | mitigate | the row's first step is the production build and `preview --host` (CLAUDE.md conventions); the WebKit walk runs on a scratch build of the same tree (plan 10-10) | closed |
| T-10-25 | Tampering | a planned build overwriting app/dist | medium | mitigate | every build in this phase passes --outDir into $TMPDIR/sprinkles-10; the only app/dist build is Mark's own step on the row (plan 10-10) | closed |
| T-10-26 | Tampering | Mark's List row text read as instructions | low | mitigate | row text is data (CLAUDE.md); the orchestrator writes with fresh timestamps, reads the row back, and acts on no answer (/marks-list does) (plan 10-10) | closed |
| T-10-27 | Tampering | a stored draft's name rendered as markup on the draft row | high | mitigate | React text child only; a test renders a draft named with angle brackets and finds them escaped; only records draftMatchesCreate accepts are listed (plan 10-11) | closed |
| T-10-28 | Denial of service | an entry whose display fields have the wrong type | medium | mitigate | the picker shows a category only when it is a non-blank string, and the summary reads the validated composition numbers; a test renders an entry with an object category (plan 10-12) | closed |
| T-10-29 | Tampering | a resolved Start carrying the maker into the editor after they cancelled the entry or left the place | low | mitigate | onStart navigates only while the start is not withdrawn and the place is mounted; two tests resolve a deferred saveDraft after an entry Cancel and after a navigation away (plan 10-03) | closed |
| T-10-30 | Tampering | a fixture correction changing what Mark approved on the scales board | medium | mitigate | the correction is generated from p10.py, never hand-edited; the verify proves the approved style block byte-identical to d14adb94's and the markup differing only in the Kind radios' names; the README records it; no other board file is written (plan 10-09) | closed |
| T-10-31 | Denial of service | a failed Cancel leaving the editor open while its kept draft is no longer written, so edits vanish on leave or reload | medium | mitigate | endedRef holds writes only while the delete is out; a rejected delete clears it, marks the record stored and writes the held or waiting record at once, and later edits are debounced as before; hook cases for the waiting ink, an edit after the failure and an edit while the delete is out, and a CreationFlow case: failed Cancel, edit, debounce, leave, Resume shows the edit (plan 10-02) | closed |
| T-10-32 | Tampering | the re-check before importStore failing open on a drafts read that rejects | high | mitigate | a rejected re-check read refuses the import with the store sentence and never calls importStore; the stubs that lacked listDrafts get an explicit empty list in the test (Shell.flyout.test.jsx), not a pass in the app; a test rejects the re-check read and finds importStore not called (plan 10-04) | closed |
| T-10-SC | Tampering | npm/pip/cargo installs | low | accept | no package is installed; playwright-core is the npx-cache path Phases 8 and 9 already use (plan 10-01) | closed |

*Status: open · closed · open — below high threshold (non-blocking)*
*Severity: critical > high > medium > low — only open threats at or above workflow.security_block_on count toward threats_open*
*Disposition: mitigate (implementation required) · accept (documented risk) · transfer (third-party)*

Evidence located at L1 for the high-severity rows: T-10-04 CreationFlow.test.jsx asserts no version, recipe, batch, library or import write (16 not-called assertions); T-10-08, T-10-15 and T-10-27 angle-bracket renders in CreationFlow.test.jsx, CreationSetup.test.jsx, NotebookPlace.test.jsx and RecipeSheet.test.jsx, and RecipePage.shell.test.js proves no `dangerouslySetInnerHTML` in the new modules (the only two mentions under app/src are that test and a comment in RecipeList.jsx); T-10-12, T-10-13 and T-10-32 in Shell.jsx (CREATION_IMPORT_BLOCKED_STATUS and PAGE_LOAD_ERROR refusals at the click and before importStore, listDrafts re-read) with 19 cases in Shell.creationGuard.test.jsx; T-10-06 router.jsx declares /notebook/new before /notebook/:recipeId. Medium and low rows are closed on the SUMMARY attestations, each naming its test, with the full suite green (3728 tests) and the strict walk MATCH 94.

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| R-10-01 | T-10-SC | No package is installed in Phase 10; playwright-core is the npx-cache path Phases 8 and 9 already use. Supply-chain exposure unchanged. | plan author (gsd-planner), carried by every SUMMARY | 2026-10-21 |
| R-10-02 | T-10-12 residual (low) | A create draft started in another tab is seen by this tab's Shell at its next route change; the re-check before importStore refuses the import once the other tab's draft is written, and refuses too when the drafts cannot be read. A second tab is outside the one-draft-at-a-time design (decision 10). | plan 10-04 | 2026-10-21 |

*Accepted risks do not resurface in future audit runs.*

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-10-21 | 33 | 33 | 0 | /gsd-secure-phase 10 (orchestrator, L1 short-circuit) |

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-10-21
