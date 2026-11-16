# Phase 12: Showing a recipe's own scales and problems, and the whole loop - Research

**Researched:** 2026-11-15
**Domain:** Kind-aware scale presentation (pure domain readers + React pen/reading + print CSS), printed-log clipboard margin, scripted WebKit round trip
**Confidence:** HIGH for what the code does now and what the approved boards require; MEDIUM for print fit on the iPad (device-unverified by design, D-14)
**Scope of this round:** Gate 1 only (12-CONTEXT D-06, D-07). Gate 2 (entry points below 724, Preview step in the version pen, row-control order, Add ingredient per row, PROOF-02) is a later planning round and is NOT researched here; "What Gate 1 must not foreclose" below lists the few touch points.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
Copied from `12-CONTEXT.md` `## Implementation Decisions`. Gate 1 round plans D-01 to D-03, D-04/D-05 (LOG-01 only), D-06, D-07, D-10, D-14, D-15 to D-17 and the "Carried forward" rules. D-08, D-09, D-11, D-12, D-13 belong to the Gate 2 round (kept here so the planner sees the whole list).

- **D-01:** A Low to high scale's five stops read ends only: stop 1 carries the low label, stop 5 the high label, and stops 2, 3 and 4 are their numbers alone. No "leaning", no "right", no middle word. This holds wherever the stops are shown: the record pen, the creation editor's Scales (where the bug was seen) and the printed log. A Right in the middle scale keeps its five words. (Mark, 2026-11-15) Amended by Mark (look-p12-printed-logs, 2026-11-15): on the printed log the 2 3 4 under the ticks are not required; the printed Low to high row carries its low word, 1, the rule, 5 and its high word. The pen and the creation editor keep the numbered stops.
- **D-02:** What a marked Low to high scale says back on the reading ("Soft (2)" is the other kind's rule) is Sid's to draw on the reading board; Mark approves it there. The plan takes the read-back from the approved board, not from this file. (Mark, 2026-11-15) Answered by Mark (decide-p12-low-to-high-read-back, 2026-11-15): candidate A, the end word at 1 and 5 and the number between: faint (1), 2 of 5, 3 of 5, 4 of 5, strong (5). Pen and reading boards approved (look-p12-pen-and-reading).
- **D-03:** Kind-aware presentation lands in the domain readers (`stopWordsFor`, `readMarkWord` in `app/src/domain/axes.js`, which today treat every scale as Right in the middle) and reads `kind` from the definition it is given: a batch's snapshot for a recorded batch, the version's declared scales for a blank log and a new batch. Stored marks stay stops 1 to 5; no stored shape changes. The plan that draws the Low to high scale closes `bug-p11-low-to-high-scale-centre-mark`. (roadmap Notes; confirmed in discussion)
- **D-04:** REQUIREMENTS.md gains three IDs, one per new behaviour: hiding the entry points below 724 with the one-line page; the creation editor's row controls (their order, and Add ingredient on each row); the clipboard top margin on the printed logs. The two bug fixes (Preview step in the version pen, Low to high stops) get no ID: their Mark's List rows trace them, and Low to high sits under TASTE-04. The first plan that touches each behaviour writes its ID into REQUIREMENTS.md (text, traceability row, coverage count) and ROADMAP's Phase 12 Requirements line. (Mark, 2026-11-15)
- **D-05:** Suggested IDs, the planner may rename within the file's categories: `PHONE-01` (entry points below 724), `STRUCT-05` (row controls), `LOG-01` (clipboard margin). (Claude's proposal, not Mark's words)
- **D-06:** Two design gates, scales first. **Gate 1**: the boards for the record pen, the reading and the printed log showing a recipe's own scales and problems (a scale of each kind, and none; the tasting pen and reading also at 393). Once approved and snapshotted, `/gsd-plan-phase 12` plans and builds TASTE-04, D-01 to D-03, and the scripted round trip (D-10). **Gate 2**: the boards for the entry points below 724, Preview step in the version pen, and the row controls. Once approved, a second planning round plans them, and the iPad proof (D-11) runs after they land. ROADMAP's single Design gate paragraph is restated as these two gates by the first planning round. (Mark, 2026-11-15)
- **D-07:** The clipboard margin rides Gate 1, because ROADMAP puts it on the printed-log board that Gate 1 already needs; its paper check waits for the iPad rows (D-13). (Claude's reading of the roadmap; Mark chose "scales first" without naming the margin's gate)
- **D-08:** (Gate 2) The order of a step's and an ingredient row's controls is Sid's to draw; Mark's brief is only that adding the next row is quick to reach by keyboard. (Mark, 2026-11-15)
- **D-09:** (Gate 2) Add ingredient on an ingredient row opens the picker, and the picked ingredient lands right after that row in the same step group, ticked in that step's Uses; on a row under "Not in a step yet" it lands after it, unplaced. The heading's Add ingredient stays and still adds an unplaced row. (Mark, 2026-11-15, confirming the todo's reading)
- **D-10:** PROOF-01 is proven by a scripted WebKit walk and nothing else: it creates a recipe with a scale of each kind and a problem, saves, prints, records a batch that marks a custom scale, exports, imports into an empty profile, and compares the records field by field (figures, Sheet code, marks). Mark does not run the batch, export or import by hand. (Mark, 2026-11-15)
- **D-11:** (Gate 2) PROOF-02's iPad check covers creation only, as written in success criterion 3: create end to end with scales, problems and targets, Tab reaches every creation control, each Move button included, focus stays with the moved step or row, then print. It runs from the production build (`npm --prefix app run build && npm --prefix app run preview -- --host`) after the Gate 2 work lands, so the Tab walk runs once on the final control order. (Mark, 2026-11-15)
- **D-12:** (Gate 2) The recipe Mark creates for the iPad check is a real one he will keep, with a scale of each kind and a problem. It is live data from then on. The check's steps therefore name controls and expected behaviour, never the recipe's words or figures. (Mark, 2026-11-15)
- **D-13:** (Gate 2) The iPad check is handed over as `check` rows on Mark's List, in order: two or three rows of about ten numbered steps each (set-up, scales and targets; steps, Move and Tab; Save and print), each citing the others in `source`, walked in WebKit first. The last row carries the paper step: print the batch log and the tasting log from the iPad, put them on the clipboard, expect every printed line clear of the clip. The orchestrator writes the rows (executors have no `ArtifactData`). (Mark, 2026-11-15)
- **D-14:** The Gate 1 build gets no device row. Its checks are board against build in WebKit at 1366 and 393, mobile Safari in the iOS Simulator, and the log printed to PDF. The roadmap adds no iPhone check to this phase. (Mark, 2026-11-15)
- **D-15:** The printed batch log and tasting log pages start their print about 1.5 in from the top edge of the paper (today every page has a 0.5 in top margin). (Mark, 2026-11-15)
- **D-16:** Only the two log pages get the margin. The bench sheet pages keep 0.5 in and their room. (Mark, 2026-11-15)
- **D-17:** The room comes out of the ruled notes lines: fields, scales and problems keep their size, the notes lose a line or two, and each log stays one page, a recipe with two own scales and two own problems included. (Mark, 2026-11-15) Answered by Mark (decide-p12-tasting-log-lines, 2026-11-15): the Tasting log keeps 4 notes lines; the Batch log 13.

**Carried forward (do not re-decide)**
- Scales and problems are authored at creation only, 0 to 2 of each, a later version inherits them, and a batch snapshots the definitions with their kind (TASTE-01 to TASTE-03; sketch 010 D25, D26). The pen, the reading and the log read the snapshot for a recorded batch (`axesForBatch`), never the live version.
- "This recipe only" shows only for a recipe that has any; the code already does this on the pen and in the creation editor (`BatchRow.jsx`, `CreationSetup.jsx`). The plan starts with a code read and restates what is built.
- Phone brief (PRODUCT.md, "On the phone", Mark 2026-11-15): phone width is below 724; New recipe, Edit, Resume editing, Next version (band and Home row), Import and Export are left out there, Print sheet stays (Gate 2). The tasting pen and the reading get 393 boards; the printed log does not.
- No `DB_VERSION` change and no store-file-version change.
- Boards and their inlined CSS are the authority; conformance is board and build side by side in WebKit, never prose or a test count. Print is checked in Safari's engine, not only Chrome. Every new button, checkbox and radio renders through `ui/Button.jsx`, `Checkbox.jsx` or `Radio.jsx`; every link carries `tabIndex={0}`; every visual value reads a token (the `@page` descriptors are the one literal `print.css` allows).
- Sid draws creation boards at 1366 only; 393 only where the phone brief names the job.

### Claude's Discretion
- How `axes.js` branches on `kind` and what the readers return for a Low to high stop (within D-01 and the approved reading board).
- How the log pages take a taller top margin than the sheet pages (WebKit ignores named pages and `@page` margin boxes, so this is likely in-flow space inside the log page, not a second `@page` rule); how many notes lines remain.
- The walk's shape: how it extends the Phase 10 and 11 harnesses, how it reaches an empty profile for the import, and what "field by field" compares.
- The three IDs' names and wording (D-05), and how the two planning rounds are numbered.
- How the hidden entry points are left out below 724 (render or CSS) and how the one-line page is routed, within Sid's board. (Gate 2)

### Deferred Ideas (OUT OF SCOPE)
- Reordering steps in the version pen (`bug-p11-pen-steps-no-reorder`): deferred by Mark on 2026-11-01.
- An iPhone device check of the tasting pen with a recipe's own scales: not added to this phase (roadmap; D-14).
- Reviewed, not folded: Build the Recipe book print format; Consider a "Mise en Place" auto-generator; Add a Delete recipe feature.
- Not in this phase: authoring scales or problems after creation, more than 2 of either, an iPhone device check, any `DB_VERSION` or store-file-version change.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| TASTE-04 | The record pen, the reading and the printed log show a recipe's own scales, each in its kind, and its problems, and "This recipe only" shows only when it has any. | The "only when it has any" half is already built (see "What the code does now"). The "each in its kind" half is the work: `axes.js` readers, `AxisMark`, `BatchRow` reading, `PrintLogPages` scale row, the creation editor's stops line, plus the `.lf-sc` row-height rule. Sketch 015 `record-pen.html`, `reading.html`, `printed-logs.html` are the acceptance target. |
| PROOF-01 | A recipe created in the app round-trips: print, record a batch with a custom scale, export, import. | A standalone scripted WebKit round trip (D-10). Export is a `download` event on the Shell's Export button; import is `setInputFiles` on `.shell__file-input`. Reuse Phase 11's `makeVanilla` creation steps, `dumpStores`, `clickUntil`, `newScenarioContext` by copying (the walk is a script, not importable). Section "The D-10 round trip". |
| PROOF-02 | Creation is checked on the iPad from the production build, including Move focus and keyboard reach. | **Built in the Gate 2 round, after the row controls and entry points land (D-11).** Not researched here. This round only keeps the PROOF-01 script from depending on control order (see "What Gate 1 must not foreclose"). |
| LOG-01 (proposed, D-04/D-05) | The printed batch log and tasting log start about 1.5 in from the top of the paper so the clipboard clip does not cover them; the bench sheet pages keep 0.5 in. | `print.css` + `tokens.css` + `PrintLogPages.jsx` (13 and 4 notes lines). The Gate 1 round writes this ID into REQUIREMENTS.md (text, traceability row, coverage count 30 to 31 for Phase 12: 3 to 4) and ROADMAP's Requirements line. PHONE-01 and STRUCT-05 are written by the Gate 2 round. |
</phase_requirements>

## Summary

The phase's visible work for Gate 1 is small and well bounded because Sid's sketch 015 is built from the app's own markup: everything the boards keep "as built" already measures equal to the build (Sid's `p12-measure.mjs` output, README "Measured"). What changes is a handful of places that today treat every scale as Right in the middle. The pure readers `stopWordsFor` and `readMarkWord` in `app/src/domain/axes.js` ignore `kind`; four consumers inherit that: `AxisMark.jsx` (aria-labels and a hard-coded `<span>right</span>` in the anchors line), `BatchRow.jsx`'s `TastingReading` (`"{word} ({n})"` for every stop), `PrintLogPages.jsx`'s `LogScaleRow` (always prints the middle word `right`), and `domain/creation.js`'s `scaleStopsLine` (already prints `faint to strong` for magnitude, which D-01 may want changed: see Open Question 1). The "This recipe only" empty state that SEED-261001-iq4 reported is already fixed in the pen, the reading and the creation editor; the printed log never printed the cue (sketch 010 D23). So TASTE-04 is a kind-aware presentation change plus tests, not an empty-state change.

The printed log needs three CSS/markup changes and two count changes: drop `span.lf-anchor.lf-mid` for a Low to high row; add one rule `.lf-sc { grid-template-rows: auto calc(var(--sheet-size-small-print) * var(--sheet-print-leading-solid)); }` so every scale row stays 36 px (the bare row measures 25 px without it); give both log pages a 1 in drop (96 px on the screen picture and in Chrome's print, 90 px in WebKit's print, because WebKit prints one CSS px as 0.8 pt); and cut the notes lines from 14 to 13 (Batch log) and 5 to 4 (Tasting log). The Batch log fits with only 20 px spare in Safari's print model (790 of 810), so the one-page fit must be checked in an actual WebKit PDF, not argued.

The D-10 round trip does not exist in any harness. Phase 11's `11-walk.mjs` is a strict before/after compare script (not importable) and its creation driver `makeVanilla` has no scale or problem steps. Recommend a standalone `12-roundtrip.mjs` that copies the small helpers, drives creation with one scale of each kind and a problem, saves, loads the print route, records a batch that marks the Low to high scale, exports through the real Export button, imports into a second fresh context through the real hidden file input, and compares stored records and recomputed figures. Keep `11-walk-check.sh` as the regression gate: no existing scenario creates a Low to high scale or reads the printed log, so it should still print `MATCH 94 snapshots`.

**Primary recommendation:** Put the kind branch in `axes.js` as four small pure functions (`stopWordsFor`, a stop-label helper, a read-back-text helper, a middle-word helper), call them from the four consumers, add the one `.lf-sc` rule and the two drop tokens to `print.css` / `tokens.css`, change the two notes-line counts, update the five pinned tests, and prove the result with board-against-build in WebKit, a WKWebView PDF of both log pages, the iOS Simulator, and the standalone round-trip script.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Kind-aware stop words, aria names, read-back text, middle word | Domain (`app/src/domain/axes.js`, pure) | UI consumers | Domain is framework-free by convention; D-03 puts the branch in the readers. UI only calls them. |
| Low to high stops on the pen (anchors line, aria-labels) | Browser / React (`AxisMark.jsx`) | Domain readers | Markup only; no new control, no new state. |
| Low to high read-back on the reading | Browser / React (`BatchRow.jsx` `TastingReading`) | Domain readers | Reads the batch snapshot via `axesForBatch`, never the live version. |
| Printed scale row without a middle word, 36 px row | Print CSS + React (`PrintLogPages.jsx`, `print.css`) | Domain readers | Row markup drops `span.lf-mid`; height held by one CSS rule. |
| Clipboard top margin on the two log pages | Print CSS + tokens | `PrintLogPages` notes-line counts | Engine-specific drop: 96 px (screen, Chrome print) and 90 px (WebKit print), chosen by the route's `print-pages--webkit` / `print-pages--other` class. |
| Creation editor stops preview | Domain (`scaleStopsLine` in `creation.js`) | `CreationSetup.jsx` | Pure string; UI renders it. |
| Stored marks and definitions | Database / Storage (IndexedDB via repository seam) | — | Unchanged. No `DB_VERSION`, no store-file-version change. |
| Round-trip proof (create, print, batch, export, import) | Scripted WebKit harness (planning dir) | App's real Export button and hidden file input | Proves the built app, not the domain in isolation. |

## Standard Stack

No new packages. Everything below is already in `app/package.json` (read this session).

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react / react-dom | 19.2.8 | pen, reading, print pages | Ratified stack (CLAUDE.md). [VERIFIED: app/package.json] |
| vite | 8.2.2 | build into a scratch `--outDir` | Ratified. Mark's own `vite preview --host` (PID seen running) serves `app/dist`; never rebuild into it. [VERIFIED: app/package.json; pgrep] |
| vitest | 5.0.0 | domain tests under `node`, UI tests by `renderToStaticMarkup` | Ratified. [VERIFIED: app/package.json] |
| fake-indexeddb | 6.2.5 | store round-trip tests | Already used by `store/definition-roundtrip.test.js`. [VERIFIED: app/package.json] |

### Supporting (harness, outside `app/`)
| Tool | Version | Purpose | When to Use |
|------|---------|---------|-------------|
| playwright-core (WebKit) | 1.63.0 via the npx cache | board checks, walk, round trip | Path `/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs` exists. [VERIFIED: ls this session; version string from the harness headers] |
| `wkprint.swift` (WKWebView to PDF) | Swift 6.4.2 present | print the real print route through WebKit to a letter-page PDF | The D-14 "log printed to PDF" check. `.planning/canvas-generators/wkprint.swift` with `pdf-pages.swift` to read the result. Playwright WebKit cannot print to PDF. [VERIFIED: file header read; swift --version] |
| `xcrun simctl` | Xcode 27.2 | mobile Safari in the iOS Simulator | D-14. An iPad Pro 13-inch (M5) is Booted; iPhone devices are available. [VERIFIED: simctl list] |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Standalone `12-roundtrip.mjs` | Add a scenario to a copy of `11-walk.mjs` | The Phase 11 compare is strict (no changed leaf, a new scenario must be in `ALLOWED_NEW_SCENARIOS`, baseline `11-walk-before.json`); a cross-context export/import scenario does not fit its one-context-per-scenario model. A copy would also fork 2079 lines. Standalone keeps the 94-snapshot baseline untouched as a regression gate. |

**Installation:** none.

## Package Legitimacy Audit

No external packages are installed or added by this phase. The legitimacy gate is not applicable.

**Packages removed due to [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none

## What the code does now (restated, as ROADMAP Notes require)

Every row below was opened with Read this session; values are quoted verbatim.

### Where each reader ignores `kind`

| Site | Verbatim today | Effect on a magnitude scale |
|------|----------------|-----------------------------|
| `domain/axes.js:29-31` `stopWordsFor` | `return [axis.low, \`leaning ${axis.low}\`, 'right', \`leaning ${axis.high}\`, axis.high];` | Five goldilocks words: the pen's aria-labels read "2: leaning faint", "3: right", "4: leaning strong". |
| `domain/axes.js:74-78` `readMarkWord` | `if (stop <= 2) return axis.low; if (stop >= 4) return axis.high; return 'right';` | Reading says "faint (2)", "right (3)", "strong (4)". |
| `ui/AxisMark.jsx:40,105,113-117` | `const words = stopWordsFor(axis);` ... `aria-label={\`${stop}: ${words[index]}\`}` ... `<span>{axis.low}</span><span>right</span><span>{axis.high}</span>` | The literal `right` is hard-coded in the anchors line regardless of kind. |
| `ui/BatchRow.jsx:310` | `` {`${readMarkWord(axis, marks[axis.key])} (${marks[axis.key]})`} `` | Every mark reads `word (n)`. |
| `ui/PrintLogPages.jsx:148,162` | `const [, , middleWord] = stopWordsFor(axis);` ... `<span className="lf-anchor lf-mid">{middleWord}</span>` | Every printed row has "right" under the middle tick. |
| `domain/creation.js:305-310` `scaleStopsLine` | `if (scale.kind === 'goldilocks') return stopWordsFor(scale).join(' · ');` `if (scale.kind === 'magnitude') return \`${scale.low} to ${scale.high}\`;` | **Already kind-aware**: a Low to high scale previews `faint to strong`, never "right". The CONTEXT line "where a Low to high scale shows 'right' today" is not true of this line. See Open Question 1. |

Complete consumer list (grep across `app/src`, non-test): `AxisMark.jsx`, `BatchRow.jsx` (`axesForBatch`, `axesForVersion`, `readMarkWord`), `PrintLogPages.jsx` (`axesForVersion`, `stopWordsFor`), `creation.js` (`stopWordsFor`). `AxisMark` is mounted only by `BatchRow.jsx`'s `AxesGrid` (BatchRow.jsx:220). No other module renders a mark or a stop word. [VERIFIED: grep across app/src this session]

### "This recipe only" is already conditional (SEED-261001-iq4 is already fixed)

- Pen: `AxesGrid` (`BatchRow.jsx:211-215`) `const hasDeclared = declared.length > 0;` renders the `This recipe only` h3 and the hairline only `{hasDeclared && ...}`; the problems block is `{declaredProblems.length > 0 && (` (`BatchRow.jsx:1152`). Pinned by `BatchRow.test.jsx:2126` "a recipe that declares nothing draws no This recipe only cue, no hairline and no declared chip, stacked or not".
- Reading: `markGroup` returns `groupAxes.length > 0 && (...)` and `problemBlock` returns `words.length > 0 && (...)` (`BatchRow.jsx:302-322`), so a recipe with nothing of its own marked shows only "Every recipe".
- Creation editor: `{createDraft.scales.length > 0 && <h3 className="pen-caption mk-cue">This recipe only</h3>}` (`CreationSetup.jsx:243`).
- Printed log: no cue is printed at all (sketch 010 D23; `PrintLogPages.test.jsx:102-103` `expect(markup).not.toContain('Every recipe'); expect(markup).not.toContain('This recipe only');`).

The plan should add or confirm tests that pin this for a *created* recipe with a magnitude scale (the existing pin uses the seeded Olive Oil), not rebuild it.

### The snapshot rule is intact

`axesForBatch(batch)` is `return [...batch.snapshot.coreScales, ...batch.snapshot.declaredAxes];` (axes.js:42-44) and `axesForVersion(version, catalog)` is `return [...coreScaleDefinitions(catalog.scales), ...(version.declaredAxes ?? [])];` (axes.js:56-58). `BatchRow.jsx:1102-1103` picks `axesForBatch(openBatch)` for a recorded batch and `axesForVersion(version, catalog)` for a new one. D-03 needs no change to either; the kind rides on the definition they return. Import validates `kind`: `isScaleDefinition` ends `return SCALE_KINDS.includes(value.kind) && SCALE_GROUPS.includes(value.group);` (catalog.js:53) with `export const SCALE_KINDS = ['goldilocks', 'magnitude'];` (catalog.js:18), and `store/transfer.js:377` applies it to every declared scale in versions and snapshots.

## Architecture Patterns

### System architecture (the one data path this phase touches)

```
creation draft (scale {low, high, kind})                      -- Phase 10/11, unchanged
   │ Save (creationSave.buildCreation → version.declaredAxes, declaredFlaws)
   ▼
IndexedDB versions ──────────────┐
   │ new batch: axesForVersion   │ blank Tasting log: axesForVersion(version, catalog)
   ▼                             ▼
record pen (BatchRow AxesGrid)  PrintLogPages TastingLogPage ── LogScaleRow
   │ AxisMark ← axes.js readers        ▲ kind branch: drop lf-mid, 36 px row
   │ Save batch → snapshot.declaredAxes (definition incl. kind), marks keyed by scale key
   ▼
IndexedDB batches
   │ recorded batch: axesForBatch(batch) (snapshot only)
   ▼
reading (BatchRow TastingReading) ── readMarkText(axis, stop)  ← kind branch
   │
   ▼ Export (Shell handleExport → anchor download) ──► sprinkles-store.json ──► Import (hidden file input)
```

### Recommended change set (files)

```
app/src/domain/axes.js          # kind branch: four small pure functions (below)
app/src/domain/axes.test.js     # add magnitude cases; goldilocks cases unchanged
app/src/domain/creation.js      # scaleStopsLine magnitude line (only if Open Question 1 says so)
app/src/ui/AxisMark.jsx         # use stop-label + middle-word helpers
app/src/ui/BatchRow.jsx         # TastingReading uses readMarkText
app/src/ui/PrintLogPages.jsx    # LogScaleRow without lf-mid for magnitude; lines 14→13, 5→4
app/src/styles/print.css        # .lf-sc grid-template-rows; log-page drop (screen + two engines)
app/src/styles/tokens.css       # --sheet-print-clipboard-drop, -webkit variant
.planning/REQUIREMENTS.md       # LOG-01 (text, traceability row, coverage 30→31, Phase 12: 3→4)
.planning/ROADMAP.md            # Design gate paragraph restated as two gates; Requirements line gains LOG-01
.planning/phases/12-…/12-roundtrip.mjs   # PROOF-01 script (+ 12-board-*.mjs specs, 12-print-check)
```

### Pattern 1: kind branch in the pure readers (recommended shape)

Discretion area (D-03); this is the smallest shape that satisfies the approved boards and keeps every goldilocks assertion in the existing tests green. Default every kind other than `'magnitude'` to goldilocks, so a definition with no or an unknown kind reads exactly as today.

```js
// app/src/domain/axes.js  (additions; goldilocks behaviour unchanged)
const isMagnitude = (axis) => axis.kind === 'magnitude';

// null where no word stands: a Low to high scale names only its two ends (D-01).
export function stopWordsFor(axis) {
  if (isMagnitude(axis)) return [axis.low, null, null, null, axis.high];
  return [axis.low, `leaning ${axis.low}`, 'right', `leaning ${axis.high}`, axis.high];
}

// The radio's screen-reader name: "1: faint", "2", "3", "4", "5: strong" (CONTRACT §1).
export function stopLabelFor(axis, stop) {
  const word = stopWordsFor(axis)[stop - 1];
  return word === null ? `${stop}` : `${stop}: ${word}`;
}

// The fixed middle word under a goldilocks scale's centre; none for Low to high.
export function middleWordFor(axis) {
  return isMagnitude(axis) ? null : 'right';
}

// The reading's whole cell text. Goldilocks keeps "word (n)"; Low to high is candidate A
// (decide-p12-low-to-high-read-back): faint (1), 2 of 5, 3 of 5, 4 of 5, strong (5).
export function readMarkText(axis, stop) {
  if (!isMagnitude(axis)) return `${readMarkWord(axis, stop)} (${stop})`;
  if (stop === 1) return `${axis.low} (1)`;
  if (stop === 5) return `${axis.high} (5)`;
  return `${stop} of 5`;
}
```
Source for the target strings: sketch 015 `CONTRACT.md` §1 ("1: faint", "2", "3", "4", "5: strong") and §2 ("faint (1)", "strong (5)", "2 of 5", "3 of 5", "4 of 5") [VERIFIED: read CONTRACT.md this session; record-pen.html markup shows `aria-label="1: faint"`, `aria-label="2"`, `aria-label="5: strong"` and `<div class="axis-mark__anchors" aria-hidden="true"><span>faint</span><span>strong</span></div>`].

Consumers:
- `AxisMark.jsx`: replace `aria-label={\`${stop}: ${words[index]}\`}` with `aria-label={stopLabelFor(axis, stop)}`; render the middle anchor `<span>` only when `middleWordFor(axis) !== null`. The anchors row is `display:flex; justify-content:space-between` (app.css:2070-2078), so two spans land at the two ends with no CSS change; "faint" spans 0 to 26.9 and "strong" 177.1 to 216 of the 216 track (CONTRACT §1). No CSS selector uses `nth-child` on the anchors (checked: app.css, notebook.css).
- `BatchRow.jsx:310`: `{readMarkText(axis, marks[axis.key])}` (the cell box is the build's; only the text changes, CONTRACT §2).
- `PrintLogPages.jsx` `LogScaleRow`: `const middleWord = middleWordFor(axis);` and `{middleWord !== null && <span className="lf-anchor lf-mid">{middleWord}</span>}`. Markup of a Low to high row = the built row without `span.lf-anchor.lf-mid` (CONTRACT §3).
- `readMarkWord` stays exported (goldilocks word source) so `axes.test.js:137-158` stays valid.

### Pattern 2: the printed row height (one CSS rule)

CONTRACT §3 states the board holds every scale row at 36 px "with one rule": `.lf-sc{grid-template-rows:auto calc(var(--sheet-size-small-print) * var(--sheet-print-leading-solid))}` (12 px for the second line whether or not a word stands in it); without it the bare row measures 25 px. Measured: every scale row 36 on every drawn page (`p12-measure.json`: `Coffee flavour 36 ['lf-lo:faint','lf-n1:1','lf-n5:5','lf-hi:strong']`, Body 36). Put the rule in `print.css` next to `.lf-sc` (print.css:326-333). Both tokens exist: `--sheet-size-small-print: 0.75rem;` (tokens.css:21) and `--sheet-print-leading-solid: 1; /* a unit or a number set solid on its line */` (tokens.css:551). `print.test.js` rejects a unit literal outside `@page`; this declaration has none after `var()` is stripped.

### Pattern 3: the clipboard drop (verbatim board CSS, then how to land it)

The board adds exactly this (printed-logs.html inlined CSS): `:root{--sheet-print-clipboard-drop:96px} .p12-clip .print-page--log{padding-top:calc(var(--sheet-print-margin-y) + var(--sheet-print-clipboard-drop))}`. The README states: "it is 96 px on the page picture and needs 90 px in WebKit print for the same inch (1 CSS px is 0.8 pt there)".

How it maps onto print.css as it is today (all quoted from the file read this session):
- Screen picture: `.print-page--log { padding: var(--sheet-print-margin-y) calc(var(--sheet-print-margin-x) + var(--sheet-print-guard)) var(--sheet-print-margin-y) var(--sheet-print-margin-x); }` (print.css:106-109). Change the top value to `calc(var(--sheet-print-margin-y) + var(--sheet-print-clipboard-drop))`. The picture is a fixed 816 x 1056 box (`--sheet-print-page-h: 1056px`) with `overflow: hidden`; `.lf` is `height: 100%`, so the content area shrinks by the drop and the foot (`margin-top: auto`) stays at the bottom.
- Paper: the existing print rule is `.print-page--log { padding: 0 var(--sheet-print-guard) 0 0; }` (print.css:899-901) because the `@page` margin (`0.5in 0.75in`, print.css:837-840) supplies the paper margins. Add, after it, `.print-pages--webkit .print-page--log { padding-top: var(--sheet-print-clipboard-drop-webkit); }` and `.print-pages--other .print-page--log { padding-top: var(--sheet-print-clipboard-drop); }`. The route already carries `print-pages--webkit` or `print-pages--other` (`PrintSheet.jsx:134`), chosen by `printEngine()` (`PrintSheetPages.jsx:29-32`, `CSS.supports('font: -apple-system-body')`). The two-class selector outranks the one-class print rule. This is exactly how the file already picks the content-box pair (`--sheet-print-content-w-webkit: 630px` / `--sheet-print-content-w: 672px`, tokens.css:565-568), so name the new tokens the same way: `--sheet-print-clipboard-drop: 96px` and `--sheet-print-clipboard-drop-webkit: 90px`. The Sheet pages are `.print-page--sheet` and are untouched (D-16).
- `tokens.test.js` fails a declared token that nothing reads ("nothing is declared and never read"), so both must be read (they are, by the rules above).

### Pattern 4: notes lines

`LogNotes lines={14}` in `BatchLogPage` becomes `13`; `lines={5}` in `TastingLogPage` becomes `4` (PrintLogPages.jsx:133, 203). Mark's answers: Tasting 4, Batch 13 (D-17). The Phase-12 fits (README "Measured", Safari print model, 90 px drop): Batch log needs 790 of 810 (20 spare); Coffee Tasting log (six scales, six problems) 767.9 of 810 (42.1 spare); Mint chip 731.9; none 695.9. The 5-line Tasting page would have only 9.1 spare and was not chosen.

### Anti-patterns to avoid
- **A kind check inside each component.** Four consumers each testing `axis.kind` re-creates the drift this module exists to prevent. Keep the branch in `axes.js`.
- **Reading kind from the live version or the catalog for a recorded batch.** `axesForBatch` reads only the snapshot (axes.js:34-44 comment); keep it so.
- **A second `@page` rule or named page for the log pages.** WebKit ignores named pages and margin boxes (print.css header lines 21-26). Use in-flow padding, as above.
- **Rebuilding `app/dist`.** A `vite preview --host` of Mark's is serving it (PID 22153 at research time). Always `--outDir` a scratch directory.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Board-against-build in WebKit | A new comparison harness | A copy of `11-board-check.mjs` with the panel finder pointed at 015's panels | The engine already does box/size/font/type/color/border/text checks, anchors, `--selftest` (refuses vacuous passes), `extraWidths`, evidence images, and blocks non-127.0.0.1 requests. See "Board harness reuse" for the one thing that must change. |
| Seeding a recipe with an own Low to high scale for a board or a check | A new fixture format | Sid's `p12-capture.mjs` `inject()` pattern (rewrite `versions` and `batches` in the context's own throwaway IndexedDB) and its `CASES` (`two`, `one`, `none`) | Produces exactly the state the boards were captured from. [VERIFIED: file header read] |
| A one-page PDF of the print route through WebKit | Playwright print (cannot make a PDF) or Chrome's PDF | `wkprint.swift` (`WKP_READY` env var polls the route's own ready mark; `.print-route[data-print-ready="true"]` per 11-print-check.mjs) then `pdf-pages.swift` / `pdf-extents.swift` | Chrome PDF does not prove Safari print (memory note `safari-print-differs-from-chrome-print`: Safari cuts grid rows, never repeats `thead`, ignores `tbody` break-inside). |
| Export/import in the proof | Calling `exportStore` / `importStore` in node | The real Export button (`download` event) and the real hidden file input (`input.shell__file-input`, `type="file"`, `accept="application/json"`) | The success criterion is the built app's loop, and the Import path has guards (refused while a pen or an unsaved creation is open: `Shell.jsx:459-475`). |
| Seeded static server | Starting Vite | `startServers({ appRoot })` from `08-walk-server.mjs` | Ephemeral 127.0.0.1 port, third-party requests aborted, no second Vite process (project convention). |

**Key insight:** every "new" mechanism here already exists in the repo as Sid's capture/measure scripts or Phase 10/11's harnesses. The risky part is not writing code; it is proving one-page fit and WebKit behaviour in the right engine.

## The D-10 round trip (PROOF-01), concretely

Recommended file: `.planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-roundtrip.mjs` (name is the planner's). It copies, rather than imports, these helpers from `11-walk.mjs` (a script with top-level mode dispatch; nothing is exported): `newScenarioContext` (fixed clock `FIXED_ISO`, counted `crypto.randomUUID`, third-party requests aborted), `clickUntil` (a first click after navigation can miss, per memory note `chrome-first-click-after-navigate`), `dumpStores`, and the creation driver `makeVanilla` (11-walk.mjs:969-1050 area; picks ingredients through `.pick__row`, steps through `Add step`, placement through `Add {name} to a step`).

Additions to the driver: on `/notebook/new`, `Add scale` twice (CreationFlow.test.jsx:1498 shows the flow: `Add scale` draws "This recipe only" and Scale 1 with focus in its Name), fill Name / Low end / High end, pick Kind through the Segmented radio labelled "Right in the middle" or "Low to high" (`KIND_WORDS` in `CreationSetup.jsx:35`: `{ goldilocks: 'Right in the middle', magnitude: 'Low to high' }`), `Add problem` once and type it. Save lands on the new version (`.notebook-version__identity`, "Recipe saved." notice).

Steps and what each asserts (all against stores read with `dumpStores`, never against screenshots):
1. **Create + Save** in context A at 1366. Assert `version.declaredAxes` holds both definitions with `kind` `goldilocks` and `magnitude` and `group: 'declared'`; `declaredFlaws` holds the problem; `version.sheetCode` is a non-empty string (`typeof version?.sheetCode === 'string'` is the Phase 11 assertion).
2. **Print**: open `…/print` under `page.emulateMedia({ media: 'print' })`. Assert two `.print-page--log` pictures; the Tasting log has `CORE_SCALE_COUNT + 2` `.lf-srow`, the magnitude row has no `.lf-mid`, the goldilocks row has `.lf-mid` "right", the problem appears in `.lf-mrow--plain .lf-opt`, each `.lf-line` count is 13 and 4, and `.lf-foot` ends with `sheetCode`. Wait on `.print-route[data-print-ready="true"]`. A page-fit assertion (`body + foot-gap + foot` ≤ content height less drop) is cheap here and catches overflow; `p12-measure.mjs` shows the formulas (`total = body + 16 + foot`, limit 900 less 90 in Safari).
3. **Batch**: open the version's pen (Record batch), tick and mark the Low to high scale at stop 2 (radio named exactly `2` inside the scale's group; Phase 11 walk and `BatchRow.test` use `getByRole('radio', …)` / `aria-label`), tick the problem chip, save. Assert the stored `batch.tasting.marks[<scale key>] === 2`, `batch.tasting.declaredDefects` holds the problem, and `batch.snapshot.declaredAxes[i].kind === 'magnitude'`. Then open the reading and assert the cell reads `2 of 5`.
4. **Export** from `/notebook` (a quiet page: Import and Export are refused or blocked with a pen or creation open): click the Export button and capture `page.waitForEvent('download')`; read the file; `JSON.parse`. `exportStore` writes `app: 'sprinkles'`, `schemaVersion`, `versions`, `batches`, `recipes`, `library`, `machines`, `styles`, `scales`, `problems` (transfer.js:793-807).
5. **Import** into a **second fresh Playwright context** (fresh context = empty IndexedDB; the app seeds the seed tables and recipes on first boot, then the import brings the created recipe, its version and its batch): `page.setInputFiles('.shell__file-input', { name, mimeType: 'application/json', buffer })`, wait for the import to finish. `definition-roundtrip.test.js:136` already proves "imports into a fresh profile" at repository level; this proves it in the built app. Assert no `.shell__import-errors` panel.
6. **Compare field by field**: `dumpStores` in A and B, then for the made recipe: `recipes` by id deep-equal; `versions` by id deep-equal (this carries `sheetCode`, `declaredAxes` with kind, rows, method); `batches` by id deep-equal (marks, snapshot). Then recompute the six figures in node from each side's version (the board harness already imports `app/src/domain/*` modules directly: `11-board-check.mjs` imports `blankCreateDraft`, `buildDraftRecord`; do the same with `buildFigures` / `computeBalance` as `store/creation-roundtrip.test.js` does) and compare, and re-open B's recipe page to assert the page's visible Sheet code and the reading's `2 of 5` equal A's. Phase 11's "seed kept" rule (`walk.expectSeedKept`) is worth copying so the import is shown to leave every seeded record untouched.

Determinism notes: use the fixed clock and the counted UUID init script so a rerun compares equal; everything typed is English (CLAUDE.md). The script prints `PASS`/`FAIL` lines and exits non-zero on any FAIL, like the other harnesses.

**Gate 2 compatibility:** drive creation with the heading controls only (Add ingredient on the heading, Add step, "Add … to a step") and never press a Move or a per-row control, so Gate 2's reordered row controls and Add ingredient per row cannot break the script. It is then rerun unchanged after Gate 2 as a regression check (cheap).

## Board harness reuse (D-14 board against build)

`11-board-check.mjs` (765 lines, header read) takes spec modules `{ board, panels:[{ id, width, route, library, seed, anchor, scope, elements:[{selector, checks}], absent, frame, pageHeight, extraWidths }] }` and compares board against build element by element in Playwright WebKit with a coarse pointer, 1 px tolerance, with `--selftest` (a panel with no box/size/font check is a FAIL, never a vacuous pass) and `--evidence <dir>`.

**One thing must change.** Its board reader hard-codes `document.querySelector(\`.p4-win.${cfg.panel}\`)` (GATHER, `panelEl`). Sketch 015's panels are not `.p4-win`: the pen and reading boards use `.fp-win.p12w-1366` and `.fp-win.p12w-393` (three recipes per width, captioned Coffee, Mint chip, Mexican Chocolate), and the printed logs use `.dl-page` letter pages (816 x 1056) with a `.p12-clip` wrapper. Copy the engine to `12-board-check.mjs` and make the panel selector a spec field, or write a small purpose-built spec runner; do not patch the Phase 11 file.

**What is worth measuring (and what is already proven).** Sid's own `p12-measure.mjs` already shows board against built app equal for everything the boards keep as built (scale boxes, chips, cues, reading cell boxes at 350 and 393). What the build must still match is what the boards *change*: (a) Low to high anchors line has exactly two spans, "faint" at 0 to 26.9 and "strong" 177.1 to 216, box 88 tall; (b) aria names `1: faint`, `2`, `3`, `4`, `5: strong`; (c) reading cell text `faint (1)`, `2 of 5`, `strong (5)`, with the goldilocks `heavy (4)`, `right (3)`, `more (4)` unchanged; (d) printed Low to high row: no `.lf-mid`, no `.lf-num` other than `lf-n1`/`lf-n5`, row 36 tall, same on the goldilocks row; (e) both log pages' content starts 144 px (48 + 96) from the picture top on screen, and notes lines 13 and 4; (f) no horizontal overflow at 393 (`overflow: true` / `extraWidths`). Seeding for the app side: reuse `p12-capture.mjs` `CASES`/`inject` (they rewrite the Olive Oil v1 version and its seeded batch in a throwaway IndexedDB; the example words are Sid's, not Mark's, and not in the data).

## Test pins that will change

Only these pin current behaviour a Gate 1 change touches. [VERIFIED: grep and Read this session]

| File | Pin | Change |
|------|-----|--------|
| `ui/PrintLogPages.test.jsx:81-83` | `'%s: 14 writing lines …'` / `expect(classCount(markup, 'lf-line')).toBe(14);` | 13 |
| `ui/PrintLogPages.test.jsx:101` | `expect(classCount(markup, 'lf-line')).toBe(5);` | 4 |
| `ui/PrintLogPages.test.jsx` (new) | none for a magnitude row | Add: a version declaring a `magnitude` scale prints a `.lf-srow` with no `lf-mid`, with `lf-lo`/`lf-n1`/`lf-n5`/`lf-hi`, 5 ticks, 2 end ticks; a goldilocks one still prints `lf-mid` "right". Seeded versions are all goldilocks, so `PAGE_CLASSES` in `print.test.js:186` stays complete. |
| `domain/creation.test.js:441-445,452` and `ui/CreationSetup.test.jsx:307-309,416`, `ui/CreationFlow.test.jsx:1513` | `scaleStopsLine(... 'magnitude') toBe('faint to strong')`, `'thin to rich'`, `'<i>thin to rich</i>'` | Change **only if** Open Question 1 is answered "yes, show the numbered ends". The goldilocks pins (`'thin · leaning thin · right · leaning rich · rich'`) stay. |
| `domain/axes.test.js` | `stopWordsFor`/`readMarkWord` assertions iterate `SEEDED_AXES` (all goldilocks) | Stay green; **add** magnitude cases (`stopWordsFor` ends only; `stopLabelFor`; `readMarkText`; `middleWordFor`; unknown/missing kind falls back to goldilocks). Lines 69 and 111 already build a `kind: 'magnitude'` definition but only test ordering. |
| `ui/AxisMark.test.jsx:104-114` | anchors row is `soft`, `right`, `hard` (Hardness) | Stays green (goldilocks). **Add** a magnitude AxisMark: two anchor spans, aria-labels `1: faint`, `2`, `3`, `4`, `5: strong`. |
| `ui/BatchRow.test.jsx:1528-1535` | `more (4)`, `strong (4)` (goldilocks reading) | Stays green. **Add** a batch whose snapshot holds a magnitude scale: `faint (1)`, `2 of 5`, `strong (5)`. |
| `styles/print.test.js` | token-only gate, `PAGE_CLASSES`, "no non-print @media rule can match inside a page" | Should stay green; the new `.print-pages--webkit .print-page--log` / `.print-pages--other .print-page--log` rules are inside `@media print` and read tokens. Add an assertion that the log pages take the drop and `.print-page--sheet` does not (D-16). |
| `styles/tokens.test.js:83,91` | every `var()` resolves; nothing declared and never read | The two new tokens must both be read. |

No existing test pins the "magnitude reads as right in the middle" behaviour (the bug), so none needs weakening. Baseline: `src/ui/PrintLogPages src/domain/axes src/ui/AxisMark src/styles/print src/domain/creation.test` = 5 files, 180 tests, all pass (run this session).

## Common Pitfalls

### Pitfall 1: the Batch log barely fits
**What goes wrong:** the Batch log needs 790 px of a 810 px page in Safari's print model (20 spare, 74 in Chrome). A different font load, a changed token or any added line spills the foot or a notes line onto a third sheet. In print `.print-page` is `overflow: visible`, so nothing clips; it just paginates.
**Why it happens:** the drop (90 px) takes more from the page than 14 to 13 lines returns.
**How to avoid:** a WebKit PDF check of both pages (not a test count); assert in the round-trip's print step that body + foot gap + foot fits the content box less the drop; do not add anything to the Batch log.
**Warning signs:** a PDF with more pages than three (Batch log, Tasting log, Sheet pages) for a one-page recipe; the foot on the next sheet.

### Pitfall 2: 1 in is 96 px on screen and in Chrome but 90 px in WebKit print
**What goes wrong:** one drop value everywhere puts the iPad's text about 1.07 in down, or Chrome's 0.94 in.
**Why it happens:** WebKit prints one CSS px as 0.8 pt (print.css header; tokens.css:561-562). `1in` as a CSS length does not help: it is still 96 px.
**How to avoid:** the two tokens, chosen by the route's engine class (Pattern 3). Say in the token comment which engine each is for, as `--sheet-print-content-w-webkit` does.

### Pitfall 3: a bare printed row collapses to 25 px
**What goes wrong:** removing `lf-mid` empties the grid's second row, so the row is 25 px and the scale list is 11 px per magnitude row shorter and unequal in rhythm.
**How to avoid:** the one `.lf-sc` rule (Pattern 2); assert every `.lf-srow` is 36 px in the board check and the print check.

### Pitfall 4: maker words are unbounded, the print grid is not
**What goes wrong:** scale name, Low end, High end and problem words have no `maxLength` anywhere (grep of `domain/*.js`, `CreationSetup.jsx`, `FieldFeedback.jsx` found none). `.lf-anchor` is `white-space: nowrap` in a 76 px column (`--sheet-print-scale-word-col`); a long end word overflows its neighbour; a long scale name wraps in the 150 px caption column and makes the row taller than 36 px; long problem words wrap the problems row. The Batch/Tasting fits above are for Sid's short example words.
**Why it happens:** Phase 10 authored free text; Phase 12 is the first time a maker's own words reach the printed grid.
**How to avoid:** do not widen scope to fix it; add a worst-case probe (two own scales with long names and end words, two long problems) to the print check, record the measured spare, and put the result in front of Mark (Open Question 2). Coffee has 42 px spare in Safari: one wrapped problems line fits, two wrapped names plus a wrapped problems row may not.

### Pitfall 5: stops 2 to 4 have no word, so the accessible name is the bare number
**What goes wrong:** a radio named only `2` is not unique on the page when two scales are present, and a naive test or walk step that selects `getByRole('radio', { name: '2' })` hits both scales.
**How to avoid:** always scope by the scale's group (`role="group"` labelled by the axis name plus its cue, AxisMark.jsx:89-93) in tests and in the round trip. The board explicitly draws these names (CONTRACT §1).

### Pitfall 6: board against build in the wrong engine or pointer
**What goes wrong:** a Chromium pass proves nothing for the iPad (memory notes `verify-in-the-engine-that-matters`, `playwright-webkit-installed-reproduce-ipad-bugs`); Playwright WebKit is installed. Sid measured with WebKit coarse at 1366 and 393.
**How to avoid:** Playwright WebKit, `hasTouch`/coarse pointer, widths 1366 and 393, tolerance 1 px; PDF through WKWebView; the iOS Simulator for mobile Safari. Neither the Simulator nor WKWebView is proof for hardware Tab, touch or the iPad's own print; that is why D-13's paper step is a Gate 2 iPad row.

### Pitfall 7: the first click after navigation misses
**What goes wrong:** a Playwright click on a fresh Sprinkles route is dropped (memory note `chrome-first-click-after-navigate`; the Phase 11 walk wraps every opener in `clickUntil`).
**How to avoid:** copy `clickUntil`; assert state by JS, not by the click having happened.

## Code Examples

### The printed row (target markup for a Low to high scale)
```jsx
// Source: PrintLogPages.jsx:147-166 as read; only the last span is conditional (CONTRACT §3).
function LogScaleRow({ axis }) {
  const middleWord = middleWordFor(axis);
  return (
    <div className="lf-srow">
      <span className="axis-mark__name">{axis.name}</span>
      <div className="lf-sc">
        <span className="lf-track">{/* five .lf-tick, unchanged */}</span>
        <span className="lf-anchor lf-lo">{axis.low}</span>
        <span className="lf-num lf-n1">1</span>
        <span className="lf-num lf-n5">5</span>
        <span className="lf-anchor lf-hi">{axis.high}</span>
        {middleWord !== null && <span className="lf-anchor lf-mid">{middleWord}</span>}
      </div>
    </div>
  );
}
```

### The print rules to add
```css
/* Source: sketch 015 printed-logs.html inlined CSS (verbatim declarations), mapped onto print.css. */
.lf-sc {
  grid-template-rows: auto calc(var(--sheet-size-small-print) * var(--sheet-print-leading-solid));
}

/* screen picture: 48 + 96 = the board's 144 px from the picture top */
.print-page--log {
  padding: calc(var(--sheet-print-margin-y) + var(--sheet-print-clipboard-drop))
    calc(var(--sheet-print-margin-x) + var(--sheet-print-guard)) var(--sheet-print-margin-y)
    var(--sheet-print-margin-x);
}

@media print {
  /* after the existing .print-page--log { padding: 0 var(--sheet-print-guard) 0 0 } */
  .print-pages--webkit .print-page--log { padding-top: var(--sheet-print-clipboard-drop-webkit); }
  .print-pages--other .print-page--log { padding-top: var(--sheet-print-clipboard-drop); }
}
```
Token lines (tokens.css, beside `--sheet-print-name-pad`, line 557):
```css
--sheet-print-clipboard-drop: 96px; /* the inch the clipboard's clip covers, added to the 0.5 in page margin on the two log pages (Phase 12; 12-CONTEXT D-15, D-16); the page picture and every engine but WebKit's print */
--sheet-print-clipboard-drop-webkit: 90px; /* the same inch in Safari's print, where one CSS px is 0.8 pt */
```

## State of the Art

| Old approach | Current approach | When changed | Impact |
|--------------|------------------|--------------|--------|
| Every scale reads as Right in the middle (`stopWordsFor`, `readMarkWord`, `AxisMark`, printed row) | Kind-aware readers (this phase) | Phase 12 | Closes `bug-p11-low-to-high-scale-centre-mark`. |
| Log pages at the 0.5 in page margin, 14 and 5 notes lines | 1.5 in start, 13 and 4 lines | Phase 12 (D-15 to D-17) | Writing on the clipboard clears the clip. |
| "This recipe only" empty state (SEED-261001-iq4) | Already conditional on pen, reading and creation editor | Phases 6 to 10 | Nothing to build, only pins to extend. |

**Deprecated/outdated:** the CONTEXT/code_context statement that `CreationSetup.jsx` "where a Low to high scale shows 'right' today" is outdated: `scaleStopsLine` already differs by kind (sketch 013 CONTRACT line 47 approved "Low to high 'faint to strong'").

## What Gate 1 must not foreclose for Gate 2 (not researched further)

- `RecipeBand`, `NotebookPlace`, `RecipeList`, `Shell`, `router`, `Method.jsx`, `CreationPage`, `IngredientTable`, `IngredientPicker` are Gate 2's. Gate 1 touches none of them except `BatchRow.jsx` (reading line 310, pen unchanged) and `CreationSetup.jsx` only if Open Question 1 changes the stops line (via `creation.js`).
- The round-trip script (D-10) drives creation through heading controls only, so Gate 2's control reorder cannot break it (section above).
- The Export/Import buttons will be left out below 724 in Gate 2; the script runs at 1366, so it is unaffected, but it must not depend on More's panel.
- `11-walk-check.sh` stays the regression gate for the existing 94 snapshots (it never loads a magnitude scale or the printed log, so Gate 1 should not move it); Gate 2 will legitimately change `create-recipe` focus names and re-record per its own plan.
- The REQUIREMENTS coverage count: Gate 1 adds only LOG-01 (30 to 31 total, Phase 12: 3 to 4); Gate 2 adds PHONE-01 and STRUCT-05 (to 33).

## Checks this round (D-14; `workflow.nyquist_validation` is false, so no Validation Architecture table)

| What | How | Evidence |
|------|-----|----------|
| Unit and markup | `npm --prefix app test` (full), quick subset: `npm --prefix app test -- src/domain/axes src/ui/AxisMark src/ui/PrintLogPages src/styles/print src/domain/creation src/ui/BatchRow` | green; tests named in "Test pins" |
| Existing walk unchanged | `sh .planning/phases/11-steps-structure-save-and-print/11-walk-check.sh` | ends `MATCH 94 snapshots` (builds to a scratch dir; never `app/dist`) |
| Board against build, WebKit coarse, 1366 and 393 | `12-board-check.mjs` spec for `record-pen.html`, `reading.html`, `printed-logs.html` (changed parts, section "Board harness reuse"), with `--selftest` | PASS lines; evidence images |
| Log printed to PDF | `wkprint.swift` on the print route for a recipe with two own scales and two own problems, then `pdf-pages.swift` / `pdf-extents.swift` | 2 log sheets, each one page, foot on its own page, text starts about 1.5 in down; not Chrome's PDF |
| Mobile Safari in the iOS Simulator | `xcrun simctl boot`, `openurl` to a scratch-build static server (`startServers`), screenshot the pen and reading at the phone size | screenshots; boots portrait; not proof for hardware Tab, touch or print (memory `ios-simulator-available-via-xcode`) |
| PROOF-01 | `12-roundtrip.mjs` | all PASS, exit 0 |
| Worst-case words | long-word probe in the print check | measured spare reported (Open Question 2) |

No device row (D-14). Say in the wave-complete message whether main is safe for Mark to rebuild: this round changes no store shape and no `DB_VERSION`, so a dist build of it is safe (memory `tell-mark-when-dist-build-is-safe`).

## Runtime State Inventory

Not a rename/refactor/migration phase. The kind branch changes presentation only, no stored string, key or shape. Recorded explicitly so the planner does not wonder:
- **Stored data:** none changed. Marks stay stops 1 to 5 under the scale's key; definitions already carry `kind`.
- **Live service config, OS-registered state, secrets/env vars:** none.
- **Build artifacts:** none stale; `app/dist` belongs to Mark's running preview and is never rebuilt by a plan.

## Security Domain

`security_enforcement` is on; ASVS level 1.

### Applicable ASVS Categories
| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | single-user local app |
| V3 Session Management | no | none |
| V4 Access Control | no | none |
| V5 Input Validation | yes | Maker words (scale names, ends, problems) are rendered as text by React and never as markup (project convention, no `dangerouslySetInnerHTML` under `app/src`); stored kinds are validated on import by `isScaleDefinition`. The new readers branch on `kind === 'magnitude'` and treat anything else as goldilocks, so a hand-edited kind cannot reach new behaviour. |
| V6 Cryptography | no | none |

### Known Threat Patterns
| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Markup injected through a scale or problem word into the printed log or the reading | Tampering | Text rendering; `PrintLogPages.test.jsx:160-168` pins it for the Sheet title and a declared problem. Add the same pin for a magnitude scale's low, high and name. |
| Prototype-key scale (`__proto__`, `constructor`, `prototype`) as a mark key | Tampering | `UNSAFE_KEYS` in `isScaleDefinition` (catalog.js:33,52) and `setMark`'s spread-and-delete (axes.js:93-101); unchanged. |
| A malicious store file at Import | Tampering | `validateStoreFile` (transfer.js:686) before any write; the round trip exercises the real path. |

## Open Questions

1. **Does the creation editor's Low to high stops line change to the numbered-ends form?**
   - What we know: D-01 says the numbered-ends form "holds wherever the stops are shown: ... the creation editor's Scales (where the bug was seen)". Today `scaleStopsLine` already returns `faint to strong` for a magnitude scale and never says "right" (creation.js:305-310), and that line was approved on sketch 013 (CONTRACT line 47: for Low to high "faint to strong"). Sketch 015 CONTRACT §4 says the editor's Scales are "Not drawn" and "follow 12-CONTEXT D-01". So the bug was not in this line, and no board shows what D-01 would turn it into.
   - What's unclear: whether Mark wants the preview line to read `faint · 2 · 3 · 4 · strong` (D-01's literal picture, matching the goldilocks line's ` · ` join) or to stay `faint to strong`.
   - Recommendation: change it to `faint · 2 · 3 · 4 · strong` (one-line change in `scaleStopsLine`, three test strings), because D-01 is a later, explicit decision of Mark's than sketch 013 and the line says what the pen will draw. Confirm in chat with Mark before planning locks it (a single decision goes in chat, not a row, per memory `list-is-for-batches-uat-is-one-at-a-time`). If Mark says leave it, delete that task and the three test changes; nothing else depends on it.

2. **What happens to the printed grid with long maker words?**
   - What we know: no length limit on scale or problem words; the printed row is fixed (76 px word columns, `nowrap`; 150 px name column).
   - What's unclear: whether Mark wants a limit, wrapping rules, or to accept it.
   - Recommendation: do not fix in Gate 1; measure the worst case in the print check and surface the number. A fix is a new decision (limit in creation, or print wrapping).

3. **Standalone round-trip script versus a Phase 11 walk scenario.**
   - Recommendation: standalone (see Alternatives). Discretion area; no Mark input needed.

4. **Does an ephemeral-port static server reach the iOS Simulator?**
   - What we know: memory note says the Simulator opens `localhost:4173`; `startServers` binds `127.0.0.1` on an ephemeral port. The Simulator shares the host's loopback.
   - Recommendation: serve the scratch build on a fixed port with a tiny `node:http` static server (or `startServers` plus printing the port), keep it alive for the check; do not start a second Vite. [ASSUMED]

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | The creation editor's Low to high preview should become `faint · 2 · 3 · 4 · strong` | Open Question 1 | A planned, tested change Mark did not want; cheap to revert. Needs Mark's yes in chat. |
| A2 | The iOS Simulator can open an ephemeral `127.0.0.1` port served from the host | Open Question 4 / Checks | The Simulator check needs a fixed port or LAN address instead. |
| A3 | A 90 px drop is a physical inch on the iPad's Safari print, as in the macOS WKWebView harness | Pattern 3 | Text starts 1.0 to 1.1 in down; D-13's paper step in the Gate 2 iPad rows is the real test (README: "device-unverified"). |
| A4 | Playwright's `download` event fires for the Shell's anchor-click Export in WebKit, and `setInputFiles` works on the `tabIndex=-1`, `aria-hidden` file input | The D-10 round trip | The export/import steps need a different capture (read the Blob through `page.evaluate`) but the proof is unchanged. Not run this session. |
| A5 | Seeded recipes and seed tables in a fresh context do not conflict with an import of the created recipe | The D-10 round trip | Import would be refused; `definition-roundtrip.test.js:136` ("imports into a fresh profile") and Phase 11's Import-refusal scenario suggest it works, but the built-app path was not run. |

**Provenance note:** every "verbatim" quote above was read with the Read tool this session from `axes.js`, `AxisMark.jsx`, `PrintLogPages.jsx`, `print.css`, `catalog.js`, `CreationSetup.jsx` (lines 28-41), `creation.js`, `BatchRow.jsx`, `tokens.css` (lines 19-22, 528-570), `PrintSheetPages.jsx` (26-33), and the sketch 015 `README.md` and `CONTRACT.md`. The 015 board markup (anchors spans, aria-labels, the `.p12-clip` and `.lf-sc` CSS) was read from the board files with a Python extract; sketch 015's measured numbers are from `.planning/canvas-generators/p12-measure.json`, which is a Playwright output (device-unverified).

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node | build, harness | yes | v24.21.0 | none needed |
| npm | tests, build | yes | 11.19.0 | none needed |
| playwright-core (WebKit) | board check, walk, round trip | yes | 1.63.0 at `/Users/mark/.npm/_npx/e41f203b7505f1fb/…/index.mjs` | refill with `npx -y playwright-core@1.63.0 --version` |
| Swift / WKWebView print | log to PDF | yes | Swift 6.4.2 | none (Playwright cannot print to PDF) |
| Xcode iOS Simulator | mobile Safari check | yes | Xcode 27.2; iPad Pro 13-inch (M5) booted, iPhones shut down | boot an iPhone with `simctl boot` |
| Google Chrome | Chromium cross-check of print fit | yes | installed at `/Applications/Google Chrome.app` | skip; Safari model is the authority |
| Mark's `vite preview --host` | — | running (PID 22153) | — | never rebuild `app/dist`; always `--outDir` a scratch directory |

**Missing dependencies with no fallback:** none.

## Sources

### Primary (HIGH confidence)
- `.planning/phases/12-…/12-CONTEXT.md`; `.planning/ROADMAP.md` (Phase 12, decisions 3, 4); `.planning/REQUIREMENTS.md` (TASTE-04, PROOF-01, PROOF-02, traceability, coverage).
- `.planning/sketches/015-own-scales-and-problems/README.md`, `CONTRACT.md`, `record-pen.html`, `reading.html`, `printed-logs.html` (CSS and markup extracts); `.planning/canvas-generators/p12-measure.json`, `p12-measure.mjs`, `p12-capture.mjs`, `wkprint.swift`.
- `app/src/domain/axes.js`, `catalog.js`, `creation.js`; `app/src/ui/AxisMark.jsx`, `BatchRow.jsx`, `PrintLogPages.jsx`, `CreationSetup.jsx`, `PrintSheetPages.jsx` (engine), `Shell.jsx` (Export/Import); `app/src/styles/print.css`, `tokens.css`; tests named in "Test pins".
- `.planning/phases/11-steps-structure-save-and-print/11-walk.mjs`, `11-walk-check.sh`, `11-board-check.mjs`, `11-print-check.mjs` headers and the creation driver.
- `.planning/sketches/013-creation-editor/CONTRACT.md` line 47 (Low to high "faint to strong").
- Project memory notes: `safari-print-differs-from-chrome-print`, `ios-simulator-available-via-xcode`, `tell-mark-when-dist-build-is-safe`, `verify-in-the-engine-that-matters`, `chrome-first-click-after-navigate`.

### Secondary (MEDIUM confidence)
- Sid's Playwright WebKit and Chromium measures of the drawn pages (not a print from Mark's iPad); README says so itself.

### Tertiary (LOW confidence)
- None used as authority. Items in the Assumptions Log are the only unverified claims.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH, no new packages; versions read from `app/package.json`.
- Architecture (kind branch, consumers, CSS, tokens): HIGH, every site read and the boards extracted.
- Pitfalls: HIGH for the three measured ones (fit, 90 vs 96, 25 px row); MEDIUM for unbounded words (reasoned from the grid, not measured).
- Round trip: MEDIUM, the mechanism is read from the code but the Export/Import steps were not run in WebKit this session.

**Research date:** 2026-11-15
**Valid until:** 2026-12-15, or until `print.css`, `axes.js` or sketch 015 change.
