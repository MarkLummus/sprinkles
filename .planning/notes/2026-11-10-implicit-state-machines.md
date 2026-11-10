# Implicit state machines in app/src (audit 2026-11-10)

An inventory of state that behaves as a state machine without being written as one. Mark asked for it as an exploratory review to find defects. This file lives in .planning/notes; it began as a session scratchpad. Paths are relative to app/src. Line numbers are as of commit 4e678dfa and drift.

What is verified:
- Part A was read firsthand by the main session.
- "POSSIBLE DEFECT verification" and "Bishop pass" near the end were checked against the code, the second with WebKit probes on the Mac. Nothing here is device-verified.
- Parts B to E are subagent reports. Their defect-shaped claims were checked in the Bishop pass; their descriptions of how state is held are NOT verified.

Outcome: seven bug rows went to Mark’s List; five were fixed in quick batch 261110-abx (see the Bishop pass section for the row ids).

## A. Main session, read firsthand (20)
1. Pen mode: reading / plan / record / amend. `mode` + `amendingBatchId`. ui/RecipePage.jsx:104, domain/penDraft.js:135 (derivePenState). Illegal: recording with draft null; amend target set in reading (T-02-24 bug). setMode called from three hooks.
2. Amend target: draft, amendingBatchId, amendBaseline, amendOpener set by hand in openNew/openAmend/cancel/close/restore. ui/useRecordDraft.js
3. Tasting section: closed / open / removed with undo pending. tastingOpen, pendingUndo. ui/useRecordDraft.js:60, domain/recordDraft.js
4. Batch save: idle / blocked measurement / blocked churn date / saving new|amend / failed. batchSaveLockRef, batchSaveAction, fieldErrors, invalidFieldTarget, blockedDateMessage. ui/useBatchRecording.js handleSaveBatch (lock reset in 8 places)
5. Version save: idle / blocked / saving new / saving over / failed(reason). versionSaveLockRef, versionSaveAction, blockedMessage, blockedTarget. ui/useVersionPen.js:42
6. Creation save: idle / refused / saving / failed / edit closed. savingRef, saving, saveFailed, editRefusal, saveAttempts; precedence in underSave ternary. ui/CreationPage.jsx:173, :573
7. Recipe rename: reading / renaming / saving / error. ui/RecipeBand.jsx:19
8. Edit eligibility: loading / editable / editing / null; refusals gone, not-first, has-batch, has-child, unlinked-row. domain/firstVersion.js:25, :50; derived in RecipePage from four load flags
9. Page load tri-state: undefined / null / record + batchesLoaded, versionsLoaded, draftsLoaded, loadFailed. ui/useRecipeData.js:14. Repeats in PrintSheet.jsx:40, EditRoute.jsx:36, CreationRoute.jsx:24, NotebookPlace.jsx:30, IngredientsPlace.jsx:115, SheetCodeSearch.jsx:50
10. Kept draft writer: none / pending (250ms debounce) / stored / ended / held. Five refs. ui/useKeptDraft.js useDraftWriter
11. Kept draft restore: not started / reading / done; outcomes none, foreign family, misfit deleted, pen already open, redirect to amend batch, restored. ui/useKeptDraft.js:190
12. Route intents in location.state, consumed once by refs: startTasting, startNextVersion, focusBatch, focusVersion, saved 'created'|'edited', started, discarded+createKept. ui/useRouteIntents.js, router.jsx:43, ui/Shell.jsx:65
13. Focus landings as attempt counters (null / n): addTastingAttempt, removeTastingAttempt, restoreAttempt, focusBatchAttempt, invalidFieldTarget.attempt, blockedDateAttempt, blockedTarget.attempt. ui/useBatchRecording.js:91
14. Creation focus request: one ref holding ~12 kinds (strings or tagged objects). ui/CreationPage.jsx ~293-340
15. Import: guard chain (pen open, creation present, edit kept, edit path, unknown) then parse / validate / reload. creationStateRef unknown|present|absent + read counter; importErrors, catalogStale, storeRevision. ui/Shell.jsx:65, ~262, ~470-545
16. Shell menus: More / Places / import errors kept exclusive by hand. ui/Shell.jsx:257-281
17. New recipe Start: idle / starting / withdrawn. startingRef, withdrawnRef, mountedRef. ui/NotebookPlace.jsx:42, :118
18. Boot: opening / blocked by other tab / failed / damaged table / running. main.jsx; latch store/repository.js:72
19. Batch standing: not-yet-churned / awaiting-tasting / tasted. domain/lastEvent.js:51-79
20. Draft kind: plan, record, amend, create, edit; families pen / edit / create. domain/draft.js:58, :557
Also: version lifecycle (save-over until first batch, then fork only; canSaveOver in RecipePage).
Patterns: pen cluster (1,2) riskiest; four save flows (4-7) share one shape; draft writer (10) is all refs.
Caveat: usePenDraft.js header cites D-04 "plain useState, no useReducer"; making pens explicit revisits it.

## B. Subagent: batch and version rows (unverified)
- Opener focus return x4: idle / armed / fired. wasAmendingRef, wasRecordingRef, wasDevelopingRef, wasTastingOpenerRef. BatchRow.jsx:536-567; VersionRow.jsx:95-129. Deps [openPen] only; armed with button unmounted drops focus silently (recordingLocked 799, 1332; editState 'editing' 443). Develop keys on mode, render on openPen (98 vs 201).
- Landing heading: plain / target / landed-visible. landingFocusVisible. BatchRow.jsx:573-580, 752-759; VersionRow.jsx:137-144, 341-343. Class set without checking focus landed; cleared only by blur.
- Attempt-counter landings have no consumed flag. BatchRow.jsx:586-669; VersionRow.jsx:149-152. Re-fire on remount while non-null; absent target is a silent no-op (1201-1203).
- Pen named twice: mode 'recording' vs openPen. BatchRow.jsx:817-818 vs 682-683, 785, 799. recording + openPen null draws pen and Correct; recording without draft throws (849).
- Add/Restore slot: tastingOpen x pendingUndo written three times. BatchRow.jsx:975, 1201-1203; PenFoot.jsx:92.
- Folds reset on foldsOpen change. BatchRow.jsx:681, 335, 816; VersionRow.jsx:91. Tasting fold resets on every pen open.
- Mark-one exclusion: atDraw/fromFreezer word vs marks, both representable. BatchRow.jsx:916-920, 1072-1083.
- Signed entry: '' / number / sentinel. BatchRow.jsx:83-97, 134, 147.
- saveAction: 'over' without canSaveOver locks with no saving label. VersionRow.jsx:222, 300-305; PenFoot.jsx:41-50.
- Live regions x3: empty / persistent / timed; no unmount cleanup; exported setters bypass timers. useAnnouncer.js:11-29, 42-72.
- Page notice: same text twice changes nothing. PageNotice.jsx:19-43.
- Open: is focusVersionOnMount ever cleared?

## C. Subagent: store, import, print, places (unverified)
- Version write guard: gone / has-batch / changed. store/repository.js:19. `expected ?? null` (139) skips checks; createVersion (147) no existing-id check; putAll (254) checks nothing.
- First-version save-over: 7 ordered refusals. repository.js:206. Same reasons thrown by saveVersion and resolved here.
- Draft key ownership by family. repository.js:459, 491. Unknown-kind row overwritten by any family (467); kind=null delete ignores family (493); createRecipeWithVersion deletes key regardless (177).
- Seed-on-empty: versions-empty is the only sentinel. store/seed.js:42; repository.js:90.
- DB open/upgrade: fresh (0), reset (1-9), current (10); blocked, blocking. store/db.js:36, 91, 100. No terminated handler; no branch above 10.
- Import procedure: validate, parent gate, recipe gate, code gate, conflict gate, transaction. store/transfer.js:827; repository.js:397. Storage failure told by string (833); parent and recipe gates not repeated in transaction; batch versionId never resolved (478).
- Problem kinds: unknown kind handled four ways. transfer.js:755, seedTables.js:316, :384, SheetCodeSearch.jsx:30.
- POSSIBLE DEFECT: stale catalog is terminal. Shell.jsx:659, 674, 548-552; CatalogContext.jsx:16. Later good import bumps revision but page stays withheld.
- storeRevision consumers: RecipeList.jsx:50 no catch (39); IngredientsPlace.jsx:132 failed with records held; SheetCodeSearch.jsx:67; NotebookRedirects ignores revision, no catch (29, 58).
- Search result line: rAF never cancelled. SheetCodeSearch.jsx:76, 89.
- Print layout: no blocks / measuring / laid / oversize. PrintSheetPages.jsx:412-431; PrintSheet.jsx:135, 155. laid not cleared when blocks change.
- Print group kinds: step group with null displayNumber takes key 'unallocated'. PrintSheetPages.jsx:57-69.
- POSSIBLE DEFECT: horizontal history rail lacks isDraft guard; waiting draft with no pen open links to version id 'draft'. RecipeHistory.jsx:138-145; domain/historyRail.js:51, 70.
- Version record: child vs save-over; gate order typed three times. domain/lineage.js:145, 180, 292-325.

## D. Subagent: table and method (unverified). IT = ui/IngredientTable.jsx, M = ui/Method.jsx, RS = ui/RecipeSheet.jsx
- Render branch: pen / show-changes / creating / reading-recording. mode, draftVersion, baseline, creationRows, showingChanges, diff. IT:689-697; M:589-590. Guards differ: GramsCell tests mode alone (IT:163), Method also needs baseline, so table-pen beside Method-reading. Recording + ?changes: as-made fields (IT:934), no Skipped controls (M:701). Recording with draft null throws (IT:710).
- Group kind: numbered / removed / unallocated. group.kind, entry.stepRemoved. IT:50, 62, 91. stepRemoved duplicates kind; show-changes rows read diff line.removed (IT:898).
- Line out: in / own flag / step removed / legacy row flag. portion.removed, row.removed, step.removed. domain/rows.js:32; IT:950. Strict === true (rows.js:16) vs truthy (rows.js:87; domain/uses.js:29, 81; IT:953). No Restore under a removed step (IT:1051).
- Step membership: used / orphaned / covered / unplaced. step.uses vs portion.step, two encodings. domain/uses.js:77-86; IT:47, 70.
- Pen step: closed|open x live|removed. openStepN, draftStep.removed. M:599-613. Reset keyed on isDeveloping (M:601); open+removed reachable (M:347) with no Restore.
- Uses checklist: usesOpen survives step close and Cancel. M:122.
- On-demand field: closed / seeded-open / user-open. isOpen, openedByUser. M:54-73. Seed read once; after Cancel restores text the field stays closed and "Add purpose" shows (M:292; domain/penDraft.js:158).
- Number frame: current / baseline / null. M:626-632. Frame discarded at M:642, 786; "Step null" label possible (M:644).
- Chooser: closed / open(row). chooserRowId, chooserFocusRef. IT:642-652. choosing ignores canAddToStep (IT:869); Choose sets no focus request (IT:881).
- Unreadable line: quiet / raised. leftUnreadable. IT:635. Keys never deleted on remove or place (IT:871, 883); blur reads render-time raw (IT:849).
- Focus-once: blockedRowAttempt; creationFocusLine keyed by value so same key never re-fires. IT:611-614, 625-628.
- Balance fold and trace: balanceOpen, focusedFigureKey. RS:61, 67; ui/useBelowDesktop.js:105-112. Nothing clears the key when the fold hides (RS:238) or region unmounts (RS:223).
- Open: does opening a pen strip ?changes; does diff line.removed always match group kind.

## E. Subagent: creation editor (unverified)
- Save sequence: idle / gate-refused / locked / writer ended / saved | not-saved | threw. ui/CreationPage.jsx:582-643. Build (602, 623) precedes endDraft (603, 628). Failure branches all resume and unlock. Success never unlocks (relies on unmount). POSSIBLE DEFECT: navigate (619, 632) is inside try; a throw after commit resumes the deleted draft and shows save-failed.
- Cancel sequence: idle / delete out / failed stays / deleted / navigated. CreationPage.jsx:539-560. POSSIBLE DEFECT: no lock while the delete is out, so Save can start mid-Cancel; a failing save's resumeDraft (635) rewrites the discarded draft. No mountedRef check before navigate (549, 559).
- Draft gate vs side effects: savingRef drops draft changes (349-352) but children get no saving flag (729-793). Mid-save handlePick (385-390) closes the picker and sets focusRowId to a row never added; announceStructure (465-469) speaks dropped changes.
- Step disclosure: previewing, usesOpen, purpose/aside closed / opened empty / holding text. ui/CreationSteps.jsx:54-59; ui/Method.jsx:53-76.
- Setup focus request: second request ref, four strings parsed by startsWith/endsWith. ui/CreationSetup.jsx:71-83.
- Row placement: unplaced / one step / split / folded. step.uses and row.portions must agree. domain/creationSteps.js:6-13, 177-229, 383-452. Unplaced is step 1 stored (28), 0 projected (24). POSSIBLE DEFECT: gate never runs checkAllocation but buildCreation throws on it (domain/creationSave.js:72-73), so the maker sees "Try again" with nothing to fix. No step-to-step move.
- Step lifecycle and keys: live / tombstone. step.removed; highest n + 1. creationSteps.js:240-248; domain/stepKeys.js:24-36. No restore; Save drops tombstones (creationSave.js:83) so keys can be reissued (271-273).
- Scales and problems: kind '' / goldilocks / magnitude; no return to ''. Add past the limit throws inside the updater. domain/creation.js:270-328.
- Style and bands: none / applied / bands edited / cleared with bands left. creation.js:196-254. Bad bands dropped silently at Save (creationSave.js:48-52).
- Saveability: partial / normalized / refused / saveable / built. creationSave.js:163-231. Builder refuses more than the gate (domain/newRecipe.js:86-95). libraryFailed (CreationPage 722) leaves Save enabled; 'no-rows' then has no message or focus target.
- Picker: once-per-entry enforced only in the picker; addRow accepts a repeat. ui/IngredientPicker.jsx:27-28, 107-113; creation.js:158-163.

## Cross-cutting themes (main session's synthesis)
- The pen is read two ways (raw mode vs derived openPen) in RecipePage, BatchRow, VersionRow, IngredientTable and Method, with different guards per component.
- "Removed" has four encodings (portion, row, step, diff line) with strict and truthy tests mixed.
- Step membership has two encodings (step.uses and portion.step) in both the pen and the creation editor.
- Save flows: five copies of lock / in flight / blocked / failed (batch, version, creation, rename, first-version save-over).
- Attempt counters and focus-request refs stand in for events throughout; none has a consumed flag.

## POSSIBLE DEFECT verification (main session, read firsthand 2026-11-10, nothing changed)
- History rail draft link: CONFIRMED. RecipeHistory.jsx:138 tests `entry.inView || openPen` only; upright (104) also tests isDraft. RecipePage.jsx:440 passes waitingDraft with openPen null, so the node is a Link to notebookPath(recipeId, 'draft'). The test at RecipeHistory.test.jsx:168-181 is vacuous: it looks for `40 g oil</a>` but the name closes with `</span>`.
- Stale catalog terminal: TRUE BUT INTENDED. setCatalogStale(true) at Shell.jsx:548 is the only setter; comment 539-546 and IMPORT_RELOAD_LINE ("Reload the page to see it") say withheld until reload. A later good import does not clear it. Not a defect unless Mark wants it to.
- Creation save, navigate inside try: THEORETICAL. Only a synchronous throw from navigate() (CreationPage.jsx:619, 632) reaches the catch after commit; no real path found.
- Cancel without a lock: CONFIRMED, narrow. handleCancel (539) reads savingRef but takes no lock, so Save pressed while the draft delete is out runs; the recipe can be saved while Cancel then navigates to the Notebook with discarded: true. Window is one IndexedDB delete.
- Gate skips checkAllocation: NOT A DEFECT. Every draft entering the editor passes normalizeAllocation (CreationPage.jsx:164, 226; EditRoute.jsx:67) and the ops keep the invariant; the throw is the documented caller-bug path (creationSave.js:6-10).

## Bishop pass over 12 defect-shaped claims from B to E (2026-11-10; WebKit probes on the Mac, no device, suite not re-run)
Rows filed on Mark's List: bug-history-rail-draft-link, bug-creation-cancel-save-race, bug-record-pen-no-skipped-with-show-changes (major), bug-next-version-cancel-focus-after-save, bug-pen-step-aside-hidden-after-cancel, bug-edit-missing-after-cancelled-restored-draft, bug-phone-record-cancel-focus-wrong-opener.
1. Opener focus dropped while unmounted: UNREACHABLE (RecipePage.jsx:188-193 refuses pens while editing). Focus return fails for other reasons: see E1, E4.
2. saveAction 'over' without canSaveOver: UNREACHABLE (useVersionPen.js:233 same expression); PenFoot part WRONG.
3. libraryFailed leaves Save on, no-rows silent: real only when the library read fails; page already says "Couldn't open your recipes". No row.
4. No Restore under removed step / open removed pen step: INTENDED (sketch 011 decision 51; Method.jsx:333-341).
5. "Step null": only via hand-typed ?changes on a parentless version holding a removed step, then Record batch. No row.
6. Add purpose/aside after Cancel: CONFIRMED, cosmetic. Row filed.
7. Import gates outside transaction: UNREACHABLE (nothing deletes a version or recipe). Batch versionId unresolved: CONFIRMED, already WR-01 in 04-REVIEW-DISPOSITION.md / todo-harden-file-import-and-draft-saves. No new row.
8. Draft key ownership: INTENDED (repository.js:453-460, 485-490) / UNREACHABLE (177).
9. Print laid not cleared: UNREACHABLE (PrintSheet.jsx:26-30 keys the page).
10. Mid-save pick/announce: latent; body controls not disabled, save window ~13 ms. No row.
11. Repeated row: UNREACHABLE (one addRow caller, picker blocks it).
12. rAF never cancelled: no effect.
Extras found by Bishop: E1 focus on heading after save-arrival + Cancel (minor); E2 record pen with Show changes on has no Skipped/Done differently, Method.jsx:590 (major; main session read the line and agrees); E3 Edit missing after cancelling a restored draft (cosmetic); E4 393 band opener focus (cosmetic). All four filed.
The probe scripts were throwaway session files and are not kept.
