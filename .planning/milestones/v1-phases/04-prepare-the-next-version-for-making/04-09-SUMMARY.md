---
phase: 04-prepare-the-next-version-for-making
plan: 09
subsystem: ui
tags: [drafts, indexeddb, restore, debounce, home-lead, version-band, history-rail, ux1-02]

requires:
  - phase: 04-04
    provides: "The drafts store behind the repository seam: getDraft, saveDraft, deleteDraft, listDrafts, keyed by versionId; drafts never enter the export"
  - phase: 04-05
    provides: "The record pen's final fields (At draw, From freezer), so the record draft's shape is the one that ships"
  - phase: 04-06
    provides: "The Enter Sheet code row on Home that the draft lead sits above"
provides:
  - "domain/draft.js: DRAFT_SHAPE_VERSION, RECORD_DRAFT_KEYS, buildDraftRecord, draftMatchesVersion, newestDraft (pure)"
  - "RecipePage restores a kept draft once per page instance, persists the open pen's ink after a 250 ms debounce, deletes it on Save, Cancel and a clean pen, and flushes on pagehide, a hidden tab and unmount"
  - "DRAFT_KEPT_STATUS ('Draft kept. Cancel discards it.') and blankRecordDraft exported from RecipePage.jsx"
  - "The browser leave warning is gone (D-17)"
  - "Home leads with the recipe holding the newest draft and names it; the version band and the History rail name a Next version draft kept on another version"
  - "04-draft-probe.mjs: real reloads in WebKit and Chrome (plan, record, amend, home, check)"
affects: [04-08, 04-10]

actuals:
  tokens: 25600
  tasks: 3
  commits: 3
plan_head_before: abb81b83051650dd08ec52c93d2bda939526dcf4
plan_head_after: f69b39c855a1429b552aa6ba832ff74978feee5e
commits: 3

tech-stack:
  added: []
  patterns:
    - "A restore that must survive StrictMode's double effect run is guarded by a ref and has no cancelled flag: the first cleanup would otherwise drop the one read the guard let through"
    - "The persist effect does nothing until the restore read settles (research Pitfall 5), and a restore that navigates away never marks itself done, so the instance that is leaving cannot delete the draft the next instance reads"
    - "Save and Cancel go through one discardDraft that also clears the waiting debounce and its record, so a keystroke typed just before Save cannot write the draft back after it was deleted"
    - "draftMatchesVersion rejects before any state is set: a stale or hostile record is deleted quietly and the page opens in reading"

key-files:
  created:
    - app/src/domain/draft.js
    - app/src/domain/draft.test.js
    - app/src/ui/RecipePage.drafts.test.jsx
    - .planning/phases/04-prepare-the-next-version-for-making/04-draft-probe.mjs
  modified:
    - app/src/ui/RecipePage.jsx
    - app/src/ui/RecipeList.jsx
    - app/src/ui/RecipeList.test.jsx
    - app/src/ui/VersionRow.jsx
    - app/src/ui/VersionRow.test.jsx
    - app/src/ui/RecipeHistory.jsx
    - app/src/ui/RecipeHistory.test.jsx
    - app/src/ui/RecipePage.test.jsx
    - app/src/ui/RecipePage.recordTasting.test.jsx
    - app/src/ui/RecipePage.folds.test.jsx
    - app/src/ui/RecipePage.beforeYouStart.test.jsx
    - app/src/ui/RecipePage.perStep.test.jsx
    - app/src/styles/home.css
    - app/src/styles/notebook.css

key-decisions:
  - "A Correct draft reopens only on its own batch's address: opened on any other address of the version, the address is replaced (not pushed) with the batch's and the next page instance, keyed by that batch, restores it (planner's settlement of research Pitfall 6 / Open Question 4; recorded for Mark)"
  - "Home names a draft whose version is in the store without checking the draft still fits it; a stale one is named until the page opens it and deletes it quietly (the plan asks for presence only)"
  - "A failed saveDraft or deleteDraft is swallowed: a draft is a convenience and must never interrupt the maker; the cost is a quiet loss on a storage failure"
  - "RecipeHistory takes the waiting draft as its own prop (waitingDraft) beside the page's own pen draft, so the existing rule that its own draft node shows only with a plan pen open stays true"

patterns-established:
  - "Tests that need a reload mount a fresh page over the same in-memory store; the real reloads are the probe's"
  - "The draft probe runs each engine through plan, record, amend and home against one built app, one fresh context per mode"

requirements-completed: [UX1-02, UX1-01, UX1-03]

coverage:
  - id: D1
    description: "The Next version pen keeps its ink through a reload: it reopens with the draft's version name and grams, and the page notice reads exactly Draft kept. Cancel discards it., once"
    requirement: UX1-02
    verification:
      - kind: unit
        ref: "app/src/ui/RecipePage.drafts.test.jsx#reopens the pen with the draft's version name and grams, says the approved words once, and writes no version"
        status: pass
      - kind: probe
        ref: "04-draft-probe.mjs plan (WebKit and Chrome, 22 checks)"
        status: pass
    human_judgment: false
  - id: D2
    description: "The record pen keeps its draft, the open tasting section and its mark included, on any address of the version"
    requirement: UX1-02
    verification:
      - kind: unit
        ref: "app/src/ui/RecipePage.drafts.test.jsx#reopens the churn date, a measured value, the open tasting and its mark, and says the words once"
        status: pass
      - kind: probe
        ref: "04-draft-probe.mjs record (WebKit and Chrome, 24 checks)"
        status: pass
    human_judgment: false
  - id: D3
    description: "A Correct draft reopens only beside its own batch: on the bare address the address is replaced with the batch's, the baseline comes back so an untouched field is clean, and a draft naming a missing batch is deleted"
    requirement: UX1-02
    verification:
      - kind: unit
        ref: "app/src/ui/RecipePage.drafts.test.jsx#the same draft opened on the version's bare address replaces the address with the batch's and keeps the draft for it"
        status: pass
      - kind: unit
        ref: "app/src/ui/RecipePage.drafts.test.jsx#a Correct draft naming a batch no longer in the store is deleted and the page reads"
        status: pass
      - kind: probe
        ref: "04-draft-probe.mjs amend (WebKit and Chrome, 24 checks, also from the bare address)"
        status: pass
    human_judgment: false
  - id: D4
    description: "Save and Cancel delete the draft and nothing writes it back; Escape on an untouched pen leaves none; restoring asks nothing (no dialog) and writes nothing to versions or batches"
    requirement: UX1-02
    verification:
      - kind: unit
        ref: "app/src/ui/RecipePage.drafts.test.jsx#Cancel deletes the draft and nothing writes it back; Cancel straight after typing leaves nothing behind either; Escape closing an untouched pen leaves no draft (D-16); Save batch writes the batch once and deletes the draft"
        status: pass
    human_judgment: false
  - id: D5
    description: "The browser's leave warning is gone: no beforeunload handler remains in RecipePage"
    requirement: UX1-02
    verification:
      - kind: unit
        ref: "app/src/ui/RecipePage.drafts.test.jsx#registers no beforeunload handler anywhere while a pen holds ink (D-17)"
        status: pass
    human_judgment: false
  - id: D6
    description: "A stored draft that no longer fits its version, or carries a __proto__, constructor or prototype key, is deleted quietly and the page opens in reading; handleStartDeveloping builds rows with Object.fromEntries (closes STATE carry T-03-10)"
    requirement: UX1-02
    verification:
      - kind: unit
        ref: "app/src/domain/draft.test.js#draftMatchesVersion: keys that reach a prototype (T-04-23)"
        status: pass
      - kind: unit
        ref: "app/src/ui/RecipePage.drafts.test.jsx#refuses a restored draft that carries a prototype key and deletes it"
        status: pass
    human_judgment: false
  - id: D7
    description: "Home leads with the recipe holding the newest draft, whose version line names the draft's version, with Draft open on this version · Go to draft beneath it; the list keeps its order; Go to draft is 70 x 44 at 393 coarse"
    requirement: UX1-02
    verification:
      - kind: unit
        ref: "app/src/ui/RecipeList.test.jsx#HomeBody — an open draft takes the lead (D-18, 04-09)"
        status: pass
      - kind: probe
        ref: "04-draft-probe.mjs home (WebKit and Chrome at 1280 and 393 coarse, 94 checks)"
        status: pass
    human_judgment: false
  - id: D8
    description: "On another version of the same recipe, with no pen open, a stored Next version draft is named under the version line as Draft: Version N · name, a link to the version it was opened on, and stands on the History rail as its draft node"
    requirement: UX1-02
    verification:
      - kind: unit
        ref: "app/src/ui/VersionRow.test.jsx#VersionRow — the waiting draft line (04-09)"
        status: pass
      - kind: unit
        ref: "app/src/ui/RecipePage.drafts.test.jsx#the version band names a draft kept on another version (04-09, Task 3)"
        status: pass
      - kind: probe
        ref: "04-draft-probe.mjs home (band line and rail node on Mexican Chocolate v4, draft on v1)"
        status: pass
    human_judgment: false
  - id: D9
    description: "On the iPad (Mobile Safari), a draft survives closing the tab and reopening the app, and Home leads with it"
    requirement: UX1-02
    verification: []
    human_judgment: true
    rationale: "Playwright's WebKit and Chrome prove the reload in two engines; neither is Mobile Safari. Whether IndexedDB writes made just before a tab is closed on the iPad land before the page is gone is only known on the device"

duration: 17min
completed: 2026-10-11
status: complete
---

# Phase 4 Plan 09: Kept drafts Summary

**Every pen keeps its draft in the drafts store from its first keystroke until Save or Cancel, reopens with its ink and the words "Draft kept. Cancel discards it." after a reload, and Home and the version band name a draft that is waiting**

## Performance

- **Duration:** 17 min
- **Started:** 2026-10-11T07:52:00Z
- **Completed:** 2026-10-11T08:10:00Z
- **Tasks:** 3 (one tracer, two auto)
- **Files modified:** 18 (4 created)

## Accomplishments

- The Next version pen, the record pen (tasting section included, since it folded into the record draft in 03.3.1) and the Correct pen each keep their draft through a real reload in WebKit and Chrome. The notice shows once, clears after the router's own five seconds and is not persisted; Cancel discards with no dialog.
- `domain/draft.js` holds the record's shape and `draftMatchesVersion`, which decides before any state is set whether a stored draft still fits its version: row ids and line counts, step numbers, the record draft's fields and their kinds, as-made keys and marks against the version's rows and the six axes, the batch a Correct draft names. A record that fails, or carries an own `__proto__`, `constructor` or `prototype` key at any depth, is deleted quietly.
- A Correct draft reopens only beside its own batch. Opened on any other address of the version, the address is replaced (not pushed) with the batch's, the instance it leaves deletes nothing, and the next one, keyed by that batch, restores it and announces.
- The browser's leave warning is gone. `handleStartDeveloping` builds rows with `Object.fromEntries`, which closes STATE carry T-03-10.
- Home leads with the recipe holding the newest draft (the list below keeps its order), names the draft's version on the lead's version line and links "Go to draft" to the draft's address, or to the batch for a Correct draft. The band names a Next version draft kept on another version, only while no pen is open, and the History rail stands it as its draft node.

## Task Commits

1. **Task 1 (tracer): the Next version pen keeps its ink through a real reload, reopening with the notice** - `ac69dcb` (feat)
2. **Task 2: the record and Correct pens keep their drafts, and a Correct draft reopens only on its own batch's address** - `639c791` (feat)
3. **Task 3: a waiting draft is named where the maker meets it, Home's lead and the version band** - `f69b39c` (feat)

Tracer gate: Task 1's verify (unit files plus `04-draft-probe.mjs plan` in both engines) passed end to end before Task 2 began. The plan has no `gate="blocking-human"` and the tracer carries only automated verify, so under `end-of-phase` mode the gate re-ran and expanded without a checkpoint.

## Files Created/Modified

- `app/src/domain/draft.js` - the draft record, `buildDraftRecord`, `draftMatchesVersion`, `newestDraft`, `RECORD_DRAFT_KEYS`
- `app/src/ui/RecipePage.jsx` - restore, persist, discard, flush; the leave warning removed; `DRAFT_KEPT_STATUS`, `blankRecordDraft` exported; the band's `listDrafts` read
- `app/src/ui/RecipeList.jsx`, `app/src/styles/home.css` - the lead takeover, `.home__lead-draft` (with the 44 px floor under a coarse pointer)
- `app/src/ui/VersionRow.jsx`, `app/src/ui/RecipeHistory.jsx`, `app/src/styles/notebook.css` - the band line `.notebook-version__draft`, the rail's `waitingDraft`
- `app/src/ui/RecipePage.drafts.test.jsx` (new, 26 tests) and the four jsdom RecipePage test files (repository mocks gain `getDraft`, `saveDraft`, `deleteDraft`, `listDrafts`)
- `.planning/phases/04-prepare-the-next-version-for-making/04-draft-probe.mjs` - modes `plan`, `record`, `amend`, `home`, `check`

## Decisions Made

- **Correct-draft address rule (for Mark):** a Correct draft reopens only on its own batch's address, by replacing the address. The pen never edits a batch it is not showing. Settled here, not drawn.
- **Home names a draft by presence, not fit.** A stale draft is named until the page opens it and deletes it quietly. Checking fit on Home needs each version's batches and was not asked for.
- **Storage failures on a draft are silent.** A draft must never interrupt the maker; a failed write loses the ink on the next reload and says nothing.
- **`waitingDraft` is its own prop on RecipeHistory,** so the existing rule (the page's own draft node shows only with a plan pen open) and its test stay true.

## Deviations from Plan

### Auto-fixed Issues

None needed a Rule 1 to 3 fix. Three choices the plan left open, recorded so they are not mistaken for drift:

- **RecipePage.test.jsx's repository mock was left as `{}`.** It renders static markup and runs no effects; only the stale `beforeunload` comment in one test was updated. The four jsdom files carry the four new methods as the plan says.
- **The Pitfall 5 guard gained one case the plan did not name.** A restore that navigates away (a Correct draft met on the wrong address) never sets `draftRestoreDone`, so the persist effect on that instance cannot delete the draft the next instance reads. A test pins that nothing was deleted.
- **The startTasting effect now waits for the restore** (and consumes the route state when a restored draft already opened a pen), which is how "a restored draft consumes any pending startTasting route state without opening a second pen" is made true.

### Probe

- `Go to draft` measures 70 x 44 in WebKit, the engine the plan names, and about 68 x 44 in Chrome (the system face sets 14 px text about 2 px narrower there). The probe holds WebKit to plus or minus 2 and Chrome's width to plus or minus 4; height is held to 44 under a coarse pointer in both.
- Iterations ran on a scratch `--outDir` build through `PROBE_DIST` so Mark's `vite preview --host` on :4173 was not disturbed; each task's own `npm --prefix app run build` ran to `app/dist` at the end, as the plan's verify says.

**Total deviations:** 0 auto-fixed. **Impact:** none on scope; every acceptance criterion held.

## Issues Encountered

None. Baseline 2335 tests (74 files) became 2399 (76 files); `npm --prefix app run build` exits 0.

## Authentication Gates

None.

## Known Stubs

None.

## Threat Flags

None. The only new surface is reading the drafts store (T-04-26, already accepted): drafts stay on the device in the same IndexedDB, never enter the export, and no network call was added. T-04-23, T-04-24 and T-04-25 are mitigated and tested: `draftMatchesVersion` refuses prototype keys and misfitting payloads, a bad draft is deleted rather than thrown on, and the restore tests spy on `saveVersion` and `saveBatch`.

## Deferred Human Verification

human_judgment: true for D9. Mark is away, so this is deferred to end-of-phase UAT. On the iPad, from `npm --prefix app run build && npm --prefix app run preview -- --host` (the build, never the dev server):

1. Start Next version, type a name and a grams change, close Safari's tab, reopen the app. Home leads with that recipe and reads "Draft open on this version · Go to draft".
2. Tap Go to draft. The pen is open with the ink and the notice reads "Draft kept. Cancel discards it." for about five seconds.
3. Tap Cancel. Home no longer names a draft.
4. Repeat 1 for the record pen (type a churn date) and the Correct pen, and for a Correct draft, open the recipe's bare address and check it lands on the batch.

Chrome and Playwright's WebKit passes do not prove Mobile Safari. Also unproven on the device: that a write made inside the 250 ms before the tab is closed lands (writes on pagehide are best effort).

For Mark's List (the orchestrator adds these; this agent has no ArtifactData tool):

- **look** `p4-correct-draft-address`: a Correct draft reopens only beside its own batch (the address is replaced when it is met anywhere else on the version). Settled in 04-09, not drawn. Approve, or say where else it should reopen.
- **look** `p4-home-draft-older-version`: when the draft is on an older version, Home's lead version line names that older version (for example Version 1 · v1) while its name link and actions still open the latest. Settled in 04-09, not drawn.
- **look** `p4-band-draft-link-size`: the band's "Draft: Version N · name" link is a 14 px text link with no 44 px touch floor at 393 (the board draws none). Say if it should meet the floor.
- **hands** `p4-draft-ipad-uat`: the iPad check above (human_judgment D9).

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- 04-08 and 04-10 do not depend on this plan's files. The drafts store now has callers, so a later DB bump must keep the drafts store (the 04-04 reset is closed to profiles below 8).
- A draft record's `shapeVersion` is 1. A later change to the record draft's fields needs a new shape version or the old drafts are deleted quietly on restore, which is the intended outcome.

## Self-Check: PASSED

- FOUND: app/src/domain/draft.js, app/src/domain/draft.test.js, app/src/ui/RecipePage.drafts.test.jsx, 04-draft-probe.mjs; FOUND commits ac69dcb, 639c791 and f69b39c on main (ancestors of HEAD)
- Acceptance: RecipePage.jsx has no `beforeunload`, `window.confirm` or `rows[row.id] =` outside comments; it exports `DRAFT_KEPT_STATUS` ("Draft kept. Cancel discards it.") and `blankRecordDraft`; `repository.(getDraft|saveDraft|deleteDraft)` appears 5 times in RecipePage.jsx, `draftMatchesVersion(` once, `listDrafts(` once in RecipeList.jsx; `grep -rl "from 'idb'" app/src` prints only db.js
- `npm --prefix app test`: 76 files, 2399 tests, 0 failing; `npm --prefix app run build` exits 0
- `04-draft-probe.mjs check` (plan, record, amend, home in WebKit and Chrome): 164 checks passed

---
*Phase: 04-prepare-the-next-version-for-making*
*Completed: 2026-10-11*
