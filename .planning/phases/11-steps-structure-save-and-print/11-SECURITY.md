---
phase: "11"
slug: "steps-structure-save-and-print"
status: verified
# threats_open = count of OPEN threats at or above workflow.security_block_on severity (the blocking gate)
threats_open: 0
asvs_level: 1
created: "2026-10-27"
---

# Phase 11 — Security

> Per-phase security contract: threat register, accepted risks, and audit trail.

Register authored at plan time: every one of the fourteen PLAN.md files carries a `<threat_model>` block, and every SUMMARY.md reports "Threat Flags: None" naming the threats its tests cover. Classification is L1 (ASVS 1, grep depth): each mitigation was located in the merged implementation or its test at commit 1041723c (2026-10-27) by the orchestrator, after all nine waves merged with the build and the full suite (4228 tests) green. `DB_VERSION` stays 10 and `app/src/store/db.js` has no Phase 11 commit, so the reset window closed as the roadmap says. The one `dangerouslySetInnerHTML` string under app/src is a comment in RecipeList.jsx from 2026-09.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| harness to Mark's preview | the scripts build and serve the app on the machine where Mark serves app/dist to his iPad | see plan 11-01 |
| harness to network | WebKit pages could fetch beyond the local server | see plan 11-01 |
| kept draft to ops | a create or edit draft read back from the drafts store passes through these ops | see plan 11-02 |
| editor to store | a draft the maker typed becomes stored records | see plan 11-03 |
| other tab to store | a second tab can record a batch or a child between Edit and Save-over | see plan 11-03 |
| stored ids to address | a stored id becomes a URL segment | see plan 11-03 |
| stored version to screen | step words, targets, purposes and asides from the store (or an imported file) are drawn | see plan 11-04 |
| stored version to paper | the print route draws the saved version's words | see plan 11-05 |
| harness to network | the WebKit check could fetch beyond the local server | see plan 11-05 |
| maker input to draft | typed step text, targets, purposes and asides are kept in the drafts store and drawn | see plan 11-06 |
| maker input to draft | ticks and typed grams per line reach the kept draft and the Balance | see plan 11-07 |
| maker input to draft | presses reorder and delete parts of the kept draft | see plan 11-08 |
| editor to store | the kept draft becomes a recipe and a version | see plan 11-09 |
| route state to page | the landing carries a word the page turns into a notice | see plan 11-09 |
| Mark's List to agents | row text is written by Mark and earlier agents | see plan 11-09 |
| stored version to editor | a stored (possibly imported) version becomes a create-shaped draft | see plan 11-10 |
| other tab to store | a batch or a child can appear between Edit and Save-over | see plan 11-10 |
| address to editor | any id can be typed into the edit address | see plan 11-10 |
| maker input to gate | everything typed meets the Save gate before anything is stored | see plan 11-11 |
| kept edit draft to other surfaces | an edit draft's existence changes what the page, the Notebook, Home and the Shell offer | see plan 11-12 |
| import to store | an import replaces the library a kept edit's rows link to | see plan 11-12 |
| planned builds to Mark's preview | the scripts build and serve on the machine where Mark serves app/dist to his iPad | see plan 11-13 |
| Mark's List to agents | row text is written by Mark and earlier agents | see plan 11-13 |
| BASE recording to every later walk compare | the recorded baseline decides what every later build's walk counts as unchanged | see plan 11-14 |

---

## Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation | Status |
|-----------|----------|-----------|----------|-------------|------------|--------|
| T-11-01 | Tampering | 11-walk-check.sh, 11-walk-record-base.sh, 11-board-check.mjs overwriting app/dist | medium | mitigate | every build passes --outDir into $TMPDIR/sprinkles-11 (per checkout for the walk); the engine only reads PROBE_DIST; acceptance greps the outDir lines (plan 11-01) | closed |
| T-11-02 | Repudiation | a baseline recorded from a moved base | medium | mitigate | recorded from a detached worktree at cf64aa70; the script refuses when a non-Phase-11 commit touched app/ after BASE (plan 11-01) | closed |
| T-11-03 | Information disclosure | WebKit pages reaching the network | low | mitigate | every context aborts requests whose host is not 127.0.0.1; board pages load from file: only (plan 11-01) | closed |
| T-11-04 | Tampering | an allow-list wide enough to hide a regression | high | mitigate | the allow-list names five whole new scenarios; selftest refuses a changed leaf, a changed methodHash or textHash, a missing scenario and an unnamed new one; normtest proves the method hash still moves on a changed lead-in (plan 11-01) | closed |
| T-11-05 | Tampering | row ids and step keys read from a kept draft used as object keys | medium | mitigate | lookups by array scan or Map only; draftMatchesCreate already refuses reserved ids and unsafe keys before any op sees a draft (plan 11-02) | closed |
| T-11-06 | Tampering | uses and portions drifting apart, leaving a dangling reference a saved version would carry | medium | mitigate | every op keeps the invariant; checkAllocation is asserted after every op in the tests and over 500 random ops; normalizeAllocation repairs a restored draft without dropping an amount (plan 11-02) | closed |
| T-11-07 | Tampering | a partial Save leaving a recipe without its version | high | mitigate | createRecipeWithVersion is one transaction with a hand abort; forced-failure, collision and existing-id tests leave every store as before (plan 11-03) | closed |
| T-11-08 | Tampering | Save-over writing over a version that gained a batch or a child in another tab | high | mitigate | firstVersionRefusal runs inside saveFirstVersionOver's own transaction read; the business refusal writes nothing and keeps the edit draft (plan 11-03) | closed |
| T-11-09 | Tampering | Save-over changing a printed Sheet code | high | mitigate | a different sheetCode or createdAt is a TypeError; sheetCodeProblems runs inside the transaction; the test asserts the same code after save-over (plan 11-03) | closed |
| T-11-10 | Denial of service | a saved recipe whose export cannot be imported | medium | mitigate | creation-roundtrip.test.js proves a created version with steps, split and unplaced rows, scales, problems and targets passes validateStoreFile (plan 11-03) | closed |
| T-11-11 | Tampering | an edit draft taken for a create draft or a pen draft (deleted or restored into the wrong editor) | medium | mitigate | kind 'edit' with its own draftMatchesEdit; draftMatchesCreate and draftMatchesVersion refuse it by kind (plan 11-03) | closed |
| T-11-12 | Tampering | a stored id with '/' or '..' in the edit address | low | mitigate | editPath is built on notebookPath, which URI-encodes each segment (plan 11-03) | closed |
| T-11-13 | Tampering | stored step text drawn as markup | medium | mitigate | every string is a React text child; StepReading.test.jsx renders '<b>&amp;' in a target, purpose and aside and asserts escaped text with no element (plan 11-04) | closed |
| T-11-14 | Tampering | the restyle stripping the table's estimate flag or the open step's field chips of their box | low | mitigate | rules are scoped to `.method-step__targets--tags` and `.method-step__body >` children; the board check measures the reading steps; the open pen step carries no modifier (plan 11-04) | closed |
| T-11-15 | Tampering | a created recipe's text printed as markup | low | mitigate | the sheet already renders text children (PrintSheetPages.test.jsx 'renders every stored string as text'); the created-version cases reuse it (plan 11-05) | closed |
| T-11-16 | Spoofing | a printed code finding another version, or none, after an edit | high | mitigate | the stored code is printed and searched, never recomputed; sheet-code-created.test.js asserts the same id and code after a Save-over (plan 11-05) | closed |
| T-11-17 | Information disclosure | the print check reaching the network or writing app/dist | low | mitigate | 127.0.0.1-only requests, PROBE_DIST read only, scratch --outDir in the verify command (plan 11-05) | closed |
| T-11-18 | Tampering | typed step text drawn as markup in the preview or the table head | medium | mitigate | React text children only; CreationSteps.test.jsx renders '<b>&amp;' through the preview as text (plan 11-06) | closed |
| T-11-19 | Tampering | a kept draft's step data reaching the editor unchecked | low | mitigate | the restore runs draftMatchesCreate (fitsCreateStep) before any step renders; step keys are numbers looked up by array scan (plan 11-06) | closed |
| T-11-20 | Tampering | line keys built from stored row ids colliding or reaching a prototype | low | mitigate | line state lives in Maps and Sets keyed by `${rowId}:${step}`; row ids are checked by draftMatchesCreate before any render (plan 11-07) | closed |
| T-11-21 | Tampering | an unreadable line moving the Balance | low | mitigate | the projection reads unreadable or non-finite grams as 0 (finiteGrams); the line shows its message on blur and Save refuses it (plan 11-09) (plan 11-07) | closed |
| T-11-22 | Tampering | an off Move button acting, or an op called at an end, corrupting order | low | mitigate | off buttons carry aria-disabled and call nothing; the ops throw RangeError at the ends and the tests press every off button (plan 11-08) | closed |
| T-11-23 | Tampering | a removal leaving a dangling uses reference a saved version would carry | medium | mitigate | removeRow and removeStep prune (plan 11-02, checkAllocation); CreationStructure.test.jsx asserts the kept draft after each removal (plan 11-08) | closed |
| T-11-24 | Tampering | the create draft written back after Save, offering Resume for a saved recipe | medium | mitigate | writer.endDraft() before the transaction (no timer, no flush, no unmount write); the transaction deletes the draft; CreationFlow.test.jsx asserts the Notebook draws no draft row after Save (plan 11-09) | closed |
| T-11-25 | Tampering | a double press writing twice or navigating twice | low | mitigate | a lock ref and a disabled Save while the transaction is out; the test presses twice and sees one call (plan 11-09) | closed |
| T-11-26 | Spoofing | route state shown as text | low | mitigate | state carries the enum word 'created'; the page announces its own constant RECIPE_SAVED_STATUS (plan 11-09) | closed |
| T-11-27 | Denial of service | a saved recipe whose export will not re-import (duplicate problems, a half target, a removed step, a missing uses array, a whitespace-only field, a non-finite amount) | high | mitigate | creationSaveBlock mirrors transfer.js's rules and reads every field trimmed; buildCreation trims and refuses an inconsistent draft; buildCreation's version passes validateStoreFile in creation-roundtrip.test.js (plan 11-09) | closed |
| T-11-28 | Tampering | the recipe page's restore deleting a kept edit draft, or a pen draft overwritten by the edit route | high | mitigate | the restore leaves kind 'edit' alone when not creating; the edit route redirects without touching a non-edit draft; tests cover both (plan 11-10) | closed |
| T-11-29 | Tampering | a stale Save-over overwriting a version that gained a batch or a child | high | mitigate | the refusal is read inside saveFirstVersionOver's transaction; the page shows D-06's line, writes nothing and keeps the draft; the edit-stale walk proves it in WebKit (plan 11-10) | closed |
| T-11-30 | Denial of service | an untouched Edit locking the version (hiding Next version and Record a batch, refusing import) | medium | mitigate | cleanPayload: no draft is written until the content differs from the saved version (D-23) (plan 11-10) | closed |
| T-11-31 | Denial of service | an orphaned edit draft blocking import with no way to Cancel | medium | mitigate | no quiet deletion (D-06): a kept edit on a version that can no longer be edited opens the refused state on the edit route, reachable from the page's and the Notebook's Resume editing (plan 11-12), where Cancel discards it; the one residual, a version deleted under a kept edit ('gone'), has no path in v2.0 (nothing deletes a version and import is refused while the edit is kept), so it is accepted (review L274@d52488be, L523@d52488be) (plan 11-10) | closed |
| T-11-32 | Repudiation | a refusal a screen reader cannot hear, so the maker cannot tell why Save did nothing | medium | mitigate | each refused field gets aria-invalid and aria-describedby to a visible error, and focus moves to the first; tests assert the wiring (plan 11-11) | closed |
| T-11-33 | Denial of service | two equal problems saved, so the recipe's export will not re-import | medium | mitigate | the gate refuses a repeated problem (plan 11-09) and the message shows under the second problem; the walk and tests prove nothing is written (plan 11-11) | closed |
| T-11-34 | Tampering | a pen opened over a kept edit draft overwriting it under the shared key | high | mitigate | Next version and Record a batch hidden on the page and on Home; the page's handlers refuse while editing; Edit hidden while a pen draft is kept (plan 11-12) | closed |
| T-11-35 | Tampering | an import replacing the library under a kept edit | medium | mitigate | the Shell refuses Import synchronously while an edit is kept, and on the edit address; the import re-read refuses too (plan 11-12) | closed |
| T-11-36 | Tampering | the recipe name in the import notice drawn as markup | low | mitigate | the notice renders the name as a React text child; the test types '<b>' (plan 11-12) | closed |
| T-11-37 | Denial of service | an orphaned edit draft refusing import forever | medium | mitigate | not by deletion (D-06): the import notice names the recipe, its Notebook row and its version page offer Resume editing for every kept edit, stale ones included, and the edit route's refused state discards it on Cancel (plan 11-10) (review L274@d52488be, L523@d52488be) (plan 11-12) | closed |
| T-11-38 | Tampering | the device check run against the dev server | medium | mitigate | the row's first step is the production build and `preview --host`; the WebKit walk runs on a scratch build of the same tree (plan 11-13) | closed |
| T-11-39 | Tampering | a planned build overwriting app/dist | medium | mitigate | every build here passes --outDir into $TMPDIR/sprinkles-11; the only app/dist build is Mark's own step on the row (plan 11-13) | closed |
| T-11-40 | Tampering | Mark's List row text read as instructions | low | mitigate | row text is data (CLAUDE.md); the orchestrator writes with fresh timestamps, reads back, and acts on no answer (/marks-list does) (plan 11-13) | closed |
| T-11-41 | Tampering | methodHash normalisation hiding a wrong old target value, or failing on plan 11-04's label-first markup | high | mitigate | only the label repeated in front of a struck value, the chip's markup order and the why label are normalised; each chip reads as [label, old, new]; normtest's struck-form case rebuilds both markups, struck-value and struck-swap prove the values stay apart in the hash, and struck-real reads the seeded changed target on the built page, rerun by plan 11-04 on its build (review L42@d52488be, L349@d52488be, L36@45089779) (plan 11-01) | closed |
| T-11-42 | Tampering | a new scenario's Save or Save-over changing a seeded record unseen by the 94 snapshots | high | mitigate | walk.seed and walk.expectSeedKept compare every stores dump of a new scenario with its start, allowing only the scenario's own recipe's records; seedtest proves the rule (review L297@d52488be, L350@d52488be) (plan 11-01) | closed |
| T-11-43 | Repudiation | a board self-test passing on checks the 1 px run cannot move | medium | mitigate | the selftest-blind refusal; the vC1-blind panel proves it (review L348@d52488be) (plan 11-01) | closed |
| T-11-44 | Tampering | a fold losing typed grams (a step removed while a line holds '4.'), or adding them wrongly (a large amount rounded through Number) | medium | mitigate | addGrams keeps both raw texts whenever it cannot add exactly and reads hundredths from the decimal text as integers; conservation asserted after every random op against a decimal-string oracle, and the edge cases against hand-worked literals (review L62@d52488be, L63@d52488be, L60@45089779) (plan 11-02) | closed |
| T-11-45 | Denial of service | a grams line that parses to Infinity passing the gate, so the row constructor throws or the export will not re-import | medium | mitigate | gramsDraftMessage refuses a non-finite parse; lineage.test.js holds the 309-digit case (review L209@d52488be) (plan 11-02) | closed |
| T-11-46 | Tampering | the shared draft key written or deleted by two tabs: another tab's pen overwriting a kept edit draft, or its batch save's discard deleting it | high | mitigate | saveDraft and deleteDraft are family-guarded inside one transaction each; repository tests cover a pen write and a pen delete over an edit record and the reverse (review L389@d52488be, L524@d52488be) (plan 11-03) | closed |
| T-11-47 | Tampering | Save-over over a foreign draft, restructuring the version beneath another tab's pen draft so its next restore deletes it | high | mitigate | saveFirstVersionOver refuses 'draft-held' inside its transaction and leaves the draft as it is (review L83@d52488be, L388@d52488be) (plan 11-03) | closed |
| T-11-48 | Tampering | two edit tabs, or an edit and a rename, the later Save-over silently overwriting the earlier one's saved content | medium | mitigate | saveFirstVersionOver compares the stored version and recipe with expected (sameRecord) and refuses 'changed' (review L89@d52488be) (plan 11-03) | closed |
| T-11-49 | Tampering | authored targets omitted from the screen: repeated labels collapsing in the diff, or a step's only removed target hidden by a length check | medium | mitigate | buildTargetDiff pairs by occurrence; StepTargets decides on its own list; diff, StepReading and Method tests cover repeated labels and the sole removed target (review L104@d52488be, L407@d52488be, L693@d52488be) (plan 11-04) | closed |
| T-11-50 | Repudiation | the print check certifying the hidden measuring copy, or a sheet with a blank band, as a pass | medium | mitigate | waits for data-print-ready, scopes to `.print-route__pages .print-page--sheet`, refuses an element under `.ps-measure`, and measures the gaps against the full recipe's (review L125@d52488be, L426@d52488be, L714@d52488be) (plan 11-05) | closed |
| T-11-51 | Repudiation | a refused Kind or a refused no-rows Save that a screen reader cannot hear (the radiogroup undescribed; focus on a control the picker replaced) | medium | mitigate | Segmented's error props describe the radiogroup; the picker's Name field takes focus and the description while the picker is open (review L252@d52488be, L253@d52488be, L859@d52488be) (plan 11-11) | closed |
| T-11-52 | Tampering | edits, Cancel or navigation racing the in-flight save: typed text accepted then lost, or a navigation after Cancel | high | mitigate | Save, Cancel and the band and ceremony fields disabled while saving; every other draft update dropped at the setCreateDraft choke point; navigate only while mounted; deferred-promise tests (review L210@d52488be, L502@d52488be, L504@d52488be) (plan 11-09) | closed |
| T-11-53 | Denial of service | a row whose lines overflow to a non-finite total passing the gate, or refused with no message where focus lands | medium | mitigate | the grams-total block, targeted at the row's last line like any grams block, and lineSaveMessages, the one projection the table reads (plan 11-11 shows it); tested with two huge lines in the gate and in the flow (review L209@d52488be, L212@45089779) (plan 11-09) | closed |
| T-11-54 | Tampering | Edit then Save-over bringing back a row, line or step the pen struck, or losing an unplaced line's grams | high | mitigate | draftFromVersion reads activeRows and activeSteps, folds unresolved and duplicate lines with addGrams, keeps struck steps' keys as tombstones; the no-op round-trip test compares active rows, links, grams and step order, and the Balance where every embedded entry equals the library's (review L231@d52488be, L522@d52488be, L233@45089779) (plan 11-10) | closed |
| T-11-55 | Tampering | another tab's batch save deleting the kept edit draft through its record pen's discard | high | mitigate | every useKeptDraft delete names its family and plan 11-03's store refuses a cross-family delete; edit-stale walks the real record pen in a second page (review L524@d52488be, L607@d52488be) (plan 11-10) | closed |
| T-11-56 | Tampering | Edit offered, or a pen opener live, before the reads that disqualify it have arrived | medium | mitigate | editState is 'loading' until the version, its batches, the versions and the drafts are read, and draws neither Edit nor Resume editing; a pen opened in that moment cannot write over or delete a kept edit (plan 11-03's family guard); delayed-read tests (review L275@d52488be, L561@d52488be, L562@d52488be) (plan 11-12) | closed |
| T-11-57 | Tampering | the import guard taking an open edit route for a kept creation, or a stale route word letting an import through | medium | mitigate | separate creation, kept-edit and edit-address states with a tested order; route words settle at the commit; handleImportChange re-reads and refuses (review L563@d52488be, L890@d52488be, L904@d52488be) (plan 11-12) | closed |
| T-11-58 | Repudiation | a re-recorded walk baseline hiding a regression on the walked routes | high | mitigate | recorded from a worktree of BASE cf64aa70 with only 11-walk-order.patch, which the record script (plan 11-14) refuses unless it touches the two files, leaves them as BASE outside the two regions and equals the checkout's code inside them; the verify shows the real patch plus one unrelated line refused before the re-record; ordercheck proves BASE and BASE plus the patch differ in order only, every store, method hash and other leaf equal; ordertest proves ordercheck refuses a changed line, store leaf, method hash and field value (D-19; review L173@45089779, L319@45089779) (plan 11-07) | closed |
| T-11-59 | Tampering | Edit then Save-over reordering a step's rows, because draftFromVersion rebuilt a step's uses in row order | low | mitigate | each live step's uses keeps the stored step's order (the ids its stored uses names, in that order, then any other placed row in row order); the round trip asserts a step whose uses reads ['row-b', 'row-a'] comes back and is stored in that order (decide-p11-row-order-across-steps) (plan 11-10) | closed |
| T-11-60 | Tampering | orderProblems' order-only rule letting a change through as a reorder | high | mitigate | text lines, fields, buttons and invalid compare as multisets, and every other leaf, methodHash and stores included, by diffLeaves; ordertest refuses a changed line, a stores leaf, a methodHash and a field value, and accepts only a swap (plan 11-14) | closed |
| T-11-61 | Repudiation | the record script recording BASE with more than the order in its patch | high | mitigate | the patch must change exactly IngredientTable.jsx and Method.jsx, leave both files identical to BASE outside groupPortionsByStep and the usesNames line, and leave those two regions identical to the checkout's, checked before the build; the verify shows a patch to another file, a changed groupPortionsByStep, and an unrelated edit outside each region refused, and plan 11-07 repeats the last with the real patch (review L319@45089779) (plan 11-14) | closed |
| T-11-62 | Tampering | a scratch recording overwriting the committed baseline | medium | mitigate | every recording here passes WALK_OUT into $TMPDIR/sprinkles-11; each verify ends with git diff --quiet on 11-walk-before.json (plan 11-14) | closed |
| T-11-63 | Tampering | a stale version pen in another tab (a clean Next version pen writes no draft) pressing Save over this version after the edit route saved over the root, or after a batch was recorded, writing its old copy over the newer record | high | mitigate | saveVersion with expected checks, inside its own transaction over versions and batches, that the stored version is still the one the pen's page read and has no batch, and throws VersionChangedError ('changed', 'has-batch', 'gone') writing nothing; the pen passes expected and names the refusal under itself; a repository test of the editor-first interleaving, perStep page cases, and plan 11-12's two-tab flow over the real store (review L82@45089779, L275@45089779) (plan 11-03) | closed |
| T-11-64 | Tampering | a stale pen in another tab adding a record from the copy its page read, after the edit route saved over the version: Save as a new version building its child from it, or a record pen's batch taking its snapshot of it (createBatch copies version.rows) | low | accept | nothing stored is overwritten (createVersion and saveBatch add a record); the child names its parent and Show changes on it reads every difference from the parent as saved; a batch's snapshot is by design the sheet the maker had in front of them and is never retaken (BATCH2-01), and the batch closes the edit window; a live cross-tab refresh stays deferred (plan 11-12's ledger), as review round 2 accepts (L373@45089779) (plan 11-03) | closed |
| T-11-65 | Repudiation | a row whose lines are each finite but overflow together refusing Save with focus on its last line and no message there, so neither the maker nor a screen reader learns why | medium | mitigate | the table reads every line-targeted block through lineSaveMessages (plan 11-09), the total block included; CreationFlow and EditFlow assert the message, outline, aria-invalid, aria-describedby and focus for two 308-digit lines; IngredientTable.creating.test.jsx the split row's last line alone (review L212@45089779, L255@45089779) (plan 11-11) | closed |
| T-11-66 | Tampering | a no-op Edit then Save-over moving the Balance of a version whose embedded coefficients differ from today's library (an imported record, or one written before a library entry changed) | low | accept | D-03 decides the fresh copy (LIB-08); the editor shows the refreshed Balance from the moment Edit opens, so nothing changes unseen at Save; the imported-record test states it (review L233@45089779) (plan 11-10) | closed |
| T-11-SC | Tampering | npm/pip/cargo installs | low | accept | no package is installed; playwright-core is the npx-cache path Phases 8 to 10 use (every plan) | closed |

*Status: open · closed · open — below high threshold (non-blocking)*
*Severity: critical > high > medium > low — only open threats at or above workflow.security_block_on count toward threats_open*
*Disposition: mitigate (implementation required) · accept (documented risk) · transfer (third-party)*

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| R-11-01 | T-11-SC | No package is installed in Phase 11; playwright-core is the npx-cache path Phases 8 to 10 already use. Supply-chain exposure unchanged. | plan author (gsd-planner), carried by every SUMMARY | 2026-10-27 |
| R-11-02 | T-11-64 (low) | A stale pen in another tab adds a record from the copy its page read after the edit route saved over the version: nothing stored is overwritten, the child names its parent, a batch's snapshot is by design the sheet the maker saw (BATCH2-01), and the batch closes the edit window. A live cross-tab refresh stays deferred. | plan 11-03, review round 2 (L373@45089779) | 2026-10-27 |
| R-11-03 | T-11-66 (low) | A no-op Edit then Save-over refreshes embedded coefficients from today's library (D-03, LIB-08); the editor shows the refreshed Balance from the moment Edit opens, so nothing changes unseen. | plan 11-10, review round 2 (L233@45089779) | 2026-10-27 |
| R-11-04 | T-11-31 / T-11-37 residual | A version deleted under a kept edit draft ('gone') has no path in v2.0: nothing deletes a version and import is refused while the edit is kept. A stale edit is never cleaned away quietly (D-06); it stays reachable through Resume editing and Cancel discards it. | plans 11-10 and 11-12 (review L274@d52488be, L523@d52488be) | 2026-10-27 |

*Accepted risks do not resurface in future audit runs.*

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-10-27 | 67 | 67 | 0 | /gsd-secure-phase 11 (orchestrator, L1 short-circuit) |

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-10-27
