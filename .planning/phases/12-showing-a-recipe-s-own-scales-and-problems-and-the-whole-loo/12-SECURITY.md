---
phase: "12"
slug: "showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo"
status: draft
# threats_open = count of OPEN threats at or above workflow.security_block_on severity (the blocking gate)
threats_open: 0
asvs_level: 1
created: "2026-11-16"
---

# Phase 12 — Security

> Per-phase security contract: threat register, accepted risks, and audit trail.

The register was authored at plan time (the `<threat_model>` blocks of plans 12-01 to 12-07). It was verified by gsd-security-auditor on 2026-11-16 at ASVS level 1, block_on high. Evidence paths under `12-*.mjs` are in this phase folder.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| stored definition to screen and paper | a scale's name, end words and problems, typed by the maker or arriving in an imported store file, are drawn on the pen, the reading, the editor and the print route | maker text, untrusted as markup |
| store file to profile | the exported file crosses into a second profile through Import, behind validateStoreFile | the whole store |
| harness to network and disk | the probes, walks, board engine and checks load a scratch build and could fetch beyond 127.0.0.1 or write the build Mark serves | none intended |
| loopback server to Simulator and WKWebView | 12-safari-check.mjs serves the scratch build and a seed page on 127.0.0.1 and takes a report by POST | test fixtures only |
| evidence to decision | PASS lines and SUMMARY wording are what the verifier and Mark read as conformance | claims |
| route to drafts store | an editor address opened below 724 must not reach the drafts store through the editor's effects | kept create and edit drafts |
| window width to editor and restore state | a width crossing unmounts the editor inside the 250 ms debounce, and the restore decides once per page instance while the width can change | typed text; the held Next version draft |
| record pens to the version's draft key | plan, record and amend share one drafts record and one family per version; a write from one pen replaces another's | the version's one draft record |
| route state to the pens | Home and history entries ask the page to open a pen through route state | startTasting and startNextVersion intents |
| editor state to the saved version | the create draft's rows and steps become the saved first version at Save | rows, steps, allocation |
| keyboard to the maker's text | a combination pressed in a field must change structure only, never the text; after a keyed move, React restores focus, not the app | keydown events, field values, selection |
| row text to Mark's List | the iPad rows become the proof's instructions and carry no live recipe data | check-row text |

---

## Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation | Status |
|-----------|----------|-----------|----------|-------------|------------|--------|
| T-12-01 | Tampering | Low to high words drawn as markup in AxisMark, the reading, the stops line | low | mitigate | React text children (AxisMark.jsx:74,114-116; BatchRow.jsx:309-310; CreationSetup.jsx:289); tag-carrying pins in AxisMark.test.jsx:177-183, BatchRow.test.jsx:2932-2942, CreationSetup.test.jsx:416; no dangerouslySetInnerHTML under app/src | closed |
| T-12-02 | Tampering | reading taking its kind from the live version | medium | mitigate | BatchRow.jsx:292 axesForBatch(batch); snapshot-versus-live test BatchRow.test.jsx:2909-2912 | closed |
| T-12-03 | Tampering | unknown kind from a hand-edited store file | low | mitigate | catalog.js:53 refuses it; transfer.js:377, :428 inside validateStoreFile (:686) before any write (:828); axes.js:26-28 reads only 'magnitude' as Low to high; axes.test.js:204-213, 245-253 | closed |
| T-12-17 | Tampering | scratch build overwriting app/dist | low | mitigate | builds go to ${TMPDIR}/sprinkles-12/...; app/dist last changed before the phase | closed |
| T-12-05 | Tampering | Low to high words printed as markup | low | mitigate | PrintLogPages.jsx:153,160,163,200-201 text children; PrintLogPages.test.jsx:209-217 | closed |
| T-12-06 | Repudiation | print check passing a spilled log or a missing drop | medium | mitigate | 12-print-check.mjs:304-328 fit FAILs past 810 or 864; :190-217 drop reads computed padding on both media; 12-safari-check.mjs:302-326 and 12-wkprint.swift:71-95 PDF check. Limit: the failing checks cover case two only; the long-words case (worst) is REPORT-only by decision (Open Question 2), so a GATE1 PASS does not mean every recipe's log fits one sheet | closed |
| T-12-07 | Information disclosure | print check reaching the network or writing app/dist | low | mitigate | 12-print-check.mjs:50-61 PROBE_DIST required; :75-84 127.0.0.1 only; no fs writes | closed |
| T-12-08 | Tampering | store file accepted half-written | low | mitigate | 12-roundtrip.mjs:339 imports through the shell's file input (Shell.jsx:528, transfer.js:828); :586-612 no import-errors panel and field-by-field compare | closed |
| T-12-09 | Information disclosure | walk touching Mark's profile, a non-local host, or --out outside scratch | medium | mitigate | In place: fresh contexts, 127.0.0.1-only requests (12-roundtrip.mjs:140-163), PROBE_DIST required (:69-77), the shipped --out call writes under sprinkles-12 (12-roundtrip-check.sh:20,27). Gap: the --out guard (:86-90) accepts any path under $TMPDIR, not only ${TMPDIR}/sprinkles-12 as the register says. One-line fix: resolve SCRATCH with 'sprinkles-12' | open — below high threshold (non-blocking) |
| T-12-10 | Repudiation | round trip passing while the built loop is broken | medium | mitigate | 12-roundtrip.mjs:329 download event on Export; :339 setInputFiles; :252-317 creation through the editor's controls; no store function called | closed |
| T-12-19 | Repudiation | surface spec passing vacuously | medium | mitigate | 12-board-logs.mjs:91-111 declared foot-words substitution (three pages: Coffee Batch log, Coffee Tasting log, Mint chip Tasting log; the plan said two); :79, :108 declared absences; :64 pageHeight on all four log panels; the 1 px run moved all sixteen panels | closed |
| T-12-12 | Information disclosure | engine reaching the network or writing app/dist | low | mitigate | 12-board-check.mjs:440-442 127.0.0.1 only; :424 boards from file: only; writes only to the evidence folder. Note: PROBE_DIST still defaults to app/dist read-only (:132) and --evidence has no folder check; scratch is kept by how runs are invoked | closed |
| T-12-13 | Repudiation | Simulator, Playwright or WKWebView result read as iPad proof | medium | mitigate | 12-05-SUMMARY.md:47, :95 and the scripts' own labels say device-unverified; no Phase 12 device row was written to Mark's List (orchestrator, 2026-11-16) | closed |
| T-12-14 | Information disclosure | check's server reachable beyond the Mac | low | mitigate | 12-safari-check.mjs:236 binds 127.0.0.1; reports in memory (:98, :209); 204 no body (:213-214); server.close() in finally (:482) | closed |
| T-12-15 | Tampering | seed page or outputs written into app/ or the build | low | mitigate | 12-safari-check.mjs:102-183, :197-198 seed from memory; :50 outputs under evidence-05; :66-69 refuses app/dist | closed |
| T-12-04 | Information disclosure | probe reaching the network or writing app/dist | low | mitigate | 12-stops-probe.mjs:41-52, :62-71, :258; no fs writes | closed |
| T-12-16 | Repudiation | base report built from a tree that already holds 12-01 | medium | mitigate | 12-06-SUMMARY.md:48 names e37db11a; the check FAILs on pen, reading and editor there | closed |
| T-12-11 | Repudiation | board engine passing vacuously | medium | mitigate | 12-board-check.mjs:174-178, :702-710 missing panel is a FAIL; :163-164 one panel reference; :411-432, :714, :753-754 against side on its own Page; :364-381 declared absences; selftest 19 PASS with five refusals | closed |
| T-12-18 | Information disclosure | engine's own proof reading Mark's build | low | mitigate | 12-board-check.mjs:424, :713-716; 12-board-selftest.mjs:21-24 runs with an empty scratch PROBE_DIST | closed |
| T-12-SC | Tampering | npm/pip/cargo installs | low | accept | no package installed: app/package.json and app/package-lock.json unchanged since e37db11a | closed |
| T-12-25 | Tampering | a kept create or edit draft read, rewritten or deleted by a cold visit to /notebook/new or the edit address below 724 | high | mitigate | DeskOnly wraps the route element (router.jsx:149, :160; DeskOnly.jsx:12-16). Its first render reads matchMedia synchronously (useBelowDesktop.js:41-43), so CreationRoute and EditRoute never mount below 724. CreationPage is mounted only from CreationRoute.jsx:54 and EditRoute.jsx:97. CreationFlow.test.jsx:2551-2577: listDrafts, getDraft, saveDraft and deleteDraft are never called, and the drafts map is deep-equal. :2611-2619 pins router.jsx. 12-phone-probe.mjs:214-243: drafts dump identical before and after each 393 visit | closed |
| T-12-26 | Tampering | text typed less than 250 ms before a width crossing lost when the editor unmounts | medium | mitigate | the unmount cleanup calls flushPendingDraft (useKeptDraft.js:421-432, call at :430), which writes the waiting record (:45-54). The persist cleanup at :411-413 clears only the timer. CreationFlow.test.jsx:2588-2609 (create address: saveDraft awaited, field restored). 12-phone-probe.mjs:259-294 (create and edit addresses in WebKit) | closed |
| T-12-27 | Elevation of privilege | left-out controls read as an access rule while the addresses stay typeable | low | accept | accepted risk AR-12-02. Checked: a typed address below 724 renders Placeholder alone, with no control (DeskOnly.jsx:14; Placeholder.jsx:7-14) | closed |
| T-12-28 | Tampering | a recipe or draft name drawn as markup in the Notebook or Home rows | low | mitigate | React text children (NotebookPlace.jsx:280, :331, :335; RecipeList.jsx:165, :287). No dangerouslySetInnerHTML in any non-test file under app/src; the only hit is a comment at RecipeList.jsx:175 | closed |
| T-12-29 | Tampering | a build into app/dist or a Vite server beside Mark's preview (12-09 harness) | low | mitigate | 12-phone-probe.mjs:40-59 refuses a PROBE_DIST that resolves to app/dist (run today: exit 1, "FAIL PROBE_DIST resolves to app/dist"). It serves through 08-walk-server.mjs:67 on 127.0.0.1 and aborts other hosts (:132-135). The probe spawns nothing and starts no Vite. 12-check.sh:59-60 builds to a scratch --outDir. app/dist was last written 2026-11-16 17:21, before round two. Note: 12-board-check.mjs:139 still defaults PROBE_DIST to app/dist, read-only (round one's T-12-12 note) | closed |
| T-12-SC | Tampering | npm/pip/cargo installs (12-09) | low | accept | accepted risk AR-12-03. Checked: app/package.json and app/package-lock.json are unchanged 989f866a..HEAD and the round-two diff holds no manifest. playwright-core comes from the npx cache (12-phone-probe.mjs:65-66) | closed |
| T-12-30 | Tampering | a record, tasting, correct or fresh Next version pen opened below 724 overwriting a held Next version draft, or a saved batch deleting it | high | mitigate | the four openers refuse while planHeld (RecipePage.jsx:267-278); handleStartDeveloping also refuses below 724. useRouteIntents and every child get only the guarded handlers (:284, :458, :469-470, :585, :588). The log's record acts and Correct are out while planHeld (:592-593; BatchRow.jsx:795, :809, :1342). planGuard is true below 724 until the first read settles (useKeptDraft.js:434). RecipePage.drafts.test.jsx:1022-1168: store deep-equal, intents consumed opening nothing, a sibling version's pen leaves the draft alone. 12-band-probe.mjs:263-315: dump byte-identical after load, after 2 s, after the band presses and after Home's Record tasting | closed |
| T-12-31 | Tampering | the persist effect deleting a plan record the restore skipped | high | mitigate | the hold returns at useKeptDraft.js:313-317, before draftStoredRef is set (:318). The persist effect deletes only when draftStoredRef is set (:395-403). useKeptDraft.test.jsx:1187-1200 (no delete, no save, heldPlan returned). RecipePage.drafts.test.jsx:1023-1042 (unchanged after 1 s, saveDraft and deleteDraft uncalled). 12-band-probe.mjs:263-276 (unchanged after 2 s) | closed |
| T-12-32 | Tampering | the widening restore reopening a draft that no longer fits, a second restore path, or a pen opened during the re-read winning the late-read rule | high | mitigate | one restore effect, re-run through restoreRound (useKeptDraft.js:227-336, dependency at :336), with its fit check before the hold (:264-285). The widening effect clears heldPlan and sets planRestoring in one update (:342-348). planRestoring clears on every outcome (:237, :333), and planGuard covers the re-read (:434). The single-call-site markers count 1 each (RecipePage.shell.test.js:264-279). Held-read tests, resolved and rejected: RecipePage.drafts.test.jsx:1212-1265; useKeptDraft.test.jsx:1279-1311 | closed |
| T-12-34 | Repudiation | a WebKit or jsdom result read as phone proof (12-10) | low | mitigate | 12-band-probe.mjs:25-28 header, :90 prints a NOTE device-unverified line, :354 final line. 12-ipad-rows.md holds three PROOF-02 rows and no PHONE-01 row | closed |
| T-12-53 | Tampering | "plan held" read from two places that disagree | medium | mitigate | planHeld = planGuard from useKeptDraft (RecipePage.jsx:222, :250). The plan-kind gate, re-run today: no `kind === 'plan'` outside comments in RecipePage.jsx. The one other plan-kind read (:382, waitingPlanDraft) excludes this version and feeds only the History rail and another version's line | closed |
| T-12-54 | Denial of service | a valid Record tasting from Home dropped because the guard read a list that had not loaded | low | mitigate | the tasting and amend openers read planHeld only, never draftsLoaded (RecipePage.jsx:273-278). The intent waits on draftRestoreDone (useRouteIntents.js:43, unchanged 989f866a..HEAD), which is set in the same callback as heldPlan (useKeptDraft.js:314-315). RecipePage.drafts.test.jsx:1170-1183 holds listDrafts open and the pen still opens | closed |
| T-12-SC | Tampering | npm/pip/cargo installs (12-10) | low | accept | accepted risk AR-12-03; no manifest changed 989f866a..HEAD | closed |
| T-12-35 | Tampering | typed step text rendered as markup in the preview | low | mitigate | the preview is StepReading over the draft step (Method.jsx:321-327), which draws text children only (StepReading.jsx:53, :60, :67-77). No dangerouslySetInnerHTML. 12-board-penpreview.mjs:177-179 reads the preview's text back | closed |
| T-12-36 | Repudiation | a stale preview after Done or Cancel, or a removed step previewed | low | mitigate | previewing resets when isOpen turns false (Method.jsx:147-150). A removed step gets no line and no block (:310). Method.preview.test.jsx:214-243 (Done, Cancel) and :266-275 (removed step) | closed |
| T-12-SC | Tampering | npm/pip/cargo installs (12-11) | low | accept | accepted risk AR-12-03; no manifest changed | closed |
| T-12-37 | Tampering | addRowAfter or a stale anchor breaking the allocation so a wrong version is saved | medium | mitigate | a pure op built from addRow and toggleStepUses (creation.js:175-196). anchorHolds checks liveSteps before calling groupRows (CreationPage.jsx:56-60), and the functional update falls back to addRow (:424-435). The focus line is derived from the committed draft (:597-600). creation.test.js:286-358 (checkAllocation at :304, :318, :335; RangeErrors :348-352). CreationFlow.test.jsx:2757-2801 (anchor row removed, its step removed, row placed; no RangeError) | closed |
| T-12-38 | Repudiation | a harness pressing a row's Add ingredient where it meant the heading's | medium | mitigate | the row control is `text-control` only (IngredientTable.jsx:307-315; mk-head-act appears 0 times in the file), pinned at IngredientTable.creating.test.jsx:419. The heading is found by `.ingredient-table-region .mk-head-act` (CreationFlow.test.jsx:1065-1076, :2628; 12-roundtrip.mjs:257; 11-walk.mjs:985) | closed |
| T-12-39 | Tampering | a row name in an aria-label or the announcement drawn as markup | low | mitigate | the name is an attribute value (IngredientTable.jsx:310). The announcement is a text child of the status region (CreationPage.jsx:748-750). No dangerouslySetInnerHTML | closed |
| T-12-40 | Repudiation | the board engine's note filter hiding a real difference | low | mitigate | the filter removes only `.dl-tab, .dl-flag` inside the panel root, on the board page only (12-board-check.mjs:30-36, :719-723). That is the engine's whole diff 989f866a..HEAD (14+/1-). 12-check.sh:80-85 reruns round one's five specs with --selftest | closed |
| T-12-SC | Tampering | npm/pip/cargo installs (12-12) | low | accept | accepted risk AR-12-03; no manifest changed | closed |
| T-12-41 | Tampering | a recognised combination typing a line break or character into the maker's text | medium | mitigate | editorKeyDown prevents every intent, 'ignore' included (editorKeys.js:27-37, preventDefault at :33). editorKeys.test.js:82-114. 12-keys-probe.mjs:278-291 (field value unchanged after the add keys in six fields) and :302-330 (value and selection kept after the move keys) | closed |
| T-12-42 | Denial of service | a held Cmd+Return adding steps until released | low | mitigate | a repeat returns 'ignore' (editorKeys.js:15). editorKeys.test.js:28-31, :103-108. Dispatched repeats in 12-keys-probe.mjs:293-300 (steps) and :396-399 (picker) | closed |
| T-12-43 | Tampering | a key acting from a field outside a step | low | mitigate | handlers sit on the step fields and the grams only (CreationSteps.jsx:107, :120, :146, :158, :189, :228; IngredientTable.jsx:865-871). Round two added no document keydown listener; the ones at RecipePage.jsx:311 and Shell.jsx:361, :392 predate it and are unchanged. 12-keys-probe.mjs:512-531 tests Recipe name, Recipe description, Version name, Serving temperature and the picker's Name | closed |
| T-12-44 | Repudiation | the WebKit caret result read as iPad proof | medium | mitigate | labelled in the 12-keys-probe.mjs:21 header (the probe prints no NOTE line of its own). 12-ipad-rows.md row 2, steps 7 and 10, carry the caret to the iPad. The fallback is written in 12-13-SUMMARY.md:156 | closed |
| T-12-SC | Tampering | npm/pip/cargo installs (12-13) | low | accept | accepted risk AR-12-03; no manifest changed | closed |
| T-12-45 | Tampering | the walk baseline re-recorded to absorb a round-two change | high | mitigate | 11-walk-before.json was last changed at 37f0a8b9 (12-08, 2026-11-16). No commit touches it 989f866a..HEAD, and `git log --grep='(12-14)' -- app/ 11-walk-before.json` is empty. 12-check.sh:72-77 fails without "MATCH 94 snapshots"; 11-walk.mjs:1469 prints DIFF lines and its compare exits 1 | closed |
| T-12-46 | Information disclosure | a row naming the recipe's words or figures | medium | mitigate | 12-ipad-rows.md names controls only ("type its name", "type its grams"). A grep for vanilla, coffee, olive, mocha, chocolate, mint, strawberry, pineapple, milk and sucrose finds 0. The orchestrator's read before writing rests on 12-14-SUMMARY.md:103 | closed |
| T-12-47 | Repudiation | WebKit, WKWebView or Simulator results reported as the iPad check | medium | mitigate | 12-14-SUMMARY.md keeps automated verification (:87-97) apart from iPad verification (:99-101), with the rationale at :70. PROOF-02 is unchecked and Pending (REQUIREMENTS.md:73, :139) | closed |
| T-12-48 | Tampering | a build into app/dist, a Vite server beside Mark's preview, or a worktree left behind | low | mitigate | In place: 12-check.sh:59-60 builds to a scratch --outDir and exports it as PROBE_DIST; no round-two script starts Vite; `git worktree list` shows main only; 12-phone-probe.mjs:52-59, 12-band-probe.mjs:57-63 and 12-device-steps.mjs:52-58 refuse app/dist (each run today: exit 1). Gap: 12-tab-probe.mjs:49-57 and 12-keys-probe.mjs:42-52 check only that PROBE_DIST is set and holds index.html, although 12-14-PLAN.md:125 says they refuse. `PROBE_DIST=app/dist node 12-tab-probe.mjs` served app/dist read-only and walked it. Fix: copy 12-phone-probe.mjs:44-59 into both | open — below high threshold (non-blocking) |
| T-12-SC | Tampering | npm/pip/cargo installs (12-14) | low | accept | accepted risk AR-12-03; no manifest changed | closed |
| T-12-49 | Tampering | the header's Import or its refusal guards lost with More's copy | medium | mitigate | the header's Import is the only `onClick={chooseImportFile}` (Shell.jsx:594); the hidden input is at :605 and the refusals at :461-480. The Shell.jsx diff 989f866a..HEAD removes only More's two `<li>`s and comment words. Shell.importGuard.test.jsx:179-220 and Shell.creationGuard.test.jsx keep every header case; only More's cases were removed or halved | closed |
| T-12-50 | Denial of service | an Import error panel left open at phone width with nowhere for focus to go | low | mitigate | closeImportErrors falls back to More's summary below 724 (Shell.jsx:374-378). Shell.flyout.test.jsx:337 opens the panel at 1024, narrows to 393, and Close lands on More's summary | closed |
| T-12-SC | Tampering | npm/pip/cargo installs (12-15) | low | accept | accepted risk AR-12-03; no manifest changed | closed |
| T-12-33 | Tampering | a draft's typed version name drawn as markup in the band line | low | mitigate | the name is a template string rendered as a text child (VersionRow.jsx:389; the link line :393-396). VersionRow.test.jsx:842-846 renders `<b>x</b>` escaped | closed |
| T-12-51 | Tampering | the record act drawn on a held version because the head read 'plan held' from a second source | medium | mitigate | the act is gated on `!planHeld` (VersionRow.jsx:477), passed from RecipePage.jsx:475, which takes it from planGuard (:250). VersionRow.test.jsx:789-850 covers planHeld with and without ownDraft | closed |
| T-12-52 | Repudiation | a WebKit or jsdom result read as phone proof (12-16) | low | mitigate | 12-board-band.mjs:32 header; 12-ipad-rows.md holds no PHONE-01 row | closed |
| T-12-SC | Tampering | npm/pip/cargo installs (12-16) | low | accept | accepted risk AR-12-03; no manifest changed | closed |

*Status: open · closed · open — below high threshold (non-blocking)*
*Severity: critical > high > medium > low — only open threats at or above workflow.security_block_on count toward threats_open*
*Disposition: mitigate (implementation required) · accept (documented risk) · transfer (third-party)*

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| AR-12-01 | T-12-SC | No package is installed in this phase (RESEARCH Package Legitimacy Audit: none); verified against the lockfile | plan 12-01 to 12-07 (plan-time disposition) | 2026-11-16 |
| AR-12-02 | T-12-27 | A presentation rule for one person's own device, not a permission; a typed address below 724 shows the desk page and does nothing | plan 12-09 (plan-time disposition) | 2026-11-22 |
| AR-12-03 | T-12-SC (plans 12-09 to 12-16) | No package is installed in round two; app/package.json and app/package-lock.json unchanged 989f866a..HEAD; playwright-core is the npx-cache path the round-one harness names (12-13 research: a hotkeys package was rejected) | plan 12-09 to 12-16 (plan-time disposition) | 2026-11-22 |

*Accepted risks do not resurface in future audit runs.*

---

## Notes for the verifier

- 12-check.sh does not reach GATE1 PASS on merged main: every Phase 12 step passes and the last step, the Phase 11 walk, fails 15 scenarios. This bears on no threat's mitigation (a gate that refuses loudly is not a false pass), but the Phase 11 flows are not re-proven on the Phase 12 build by that walk.
- 12-05-SUMMARY lists requirements-completed beside gate1: FAIL.
- Round two (2026-11-22), T-12-48 open below the blocking threshold: 12-tab-probe.mjs:49-57 and 12-keys-probe.mjs:42-52 check only that PROBE_DIST is set and holds index.html, though 12-14-PLAN.md:125 says they refuse app/dist. `PROBE_DIST=app/dist node 12-tab-probe.mjs` served app/dist read-only and walked it. The fix is to copy 12-phone-probe.mjs:44-59 into both. 12-check.sh itself builds to a scratch --outDir, so the gate run never reads app/dist.
- The tab and keys probes print no device-unverified line of their own; their label is only in the header comment.
- Round two is not device-verified: PROOF-02's three iPad rows are open on Mark's List, and PHONE-01 has no device row by plan design.
- Round one's T-12-09 (--out guard in 12-roundtrip.mjs:86-90) is still open; round two did not touch it.

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-11-16 | 20 | 19 | 1 (medium, non-blocking) | gsd-security-auditor |
| 2026-11-22 | 38 (round two, plans 12-09 to 12-16) | 37 | 1 (low, non-blocking) | gsd-security-auditor |

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [ ] `status: verified` set in frontmatter

**Approval:** pending (T-12-09's --out guard and T-12-48's two probe refusals are open below the blocking threshold)
