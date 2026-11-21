> Round two (Design gate 2: entry points below 724, Preview step in the version pen, row controls, PROOF-02) is researched in the last part of this file, "# Round two (Design gate 2)"; everything above that heading is round one and unchanged.
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

---

# Round two (Design gate 2)

**Researched:** 2026-11-21
**Domain:** Width-dependent presence of controls (a React render gate on the existing 724 hook), a regrouped creation editor (step and ingredient-row controls, new keys, caret kept across a keyed move), Preview step on the version pen's open step, and the iPad proof (PROOF-02)
**Confidence:** HIGH for what the code does now and what sketch 016 requires; HIGH for the DOM and React focus behaviour measured in Playwright WebKit on a Mac; MEDIUM for everything that touches the iPad (device-unverified by design until PROOF-02)
**Scope of this part:** Gate 2 only (12-CONTEXT D-04 to D-13). Round one (Plans 12-01 to 12-08, Design gate 1) is complete and verified (12-VERIFICATION.md) and is not re-researched. Sections of the part above are cited by their old headings and lines and were not changed. Sketch 016's `CONTRACT.md` and boards are the authority; this part cites them and does not restate their markup.

<user_constraints>
## User Constraints (from CONTEXT.md)

Copied verbatim from `12-CONTEXT.md` `## Implementation Decisions`; D-04 to D-13 govern round two. D-01 to D-03 and D-14 to D-17 are round one's and are kept in the part above.

### Locked Decisions
- **D-04:** REQUIREMENTS.md gains three IDs, one per new behaviour: hiding the entry points below 724 with the one-line page; the creation editor's row controls (their order, and Add ingredient on each row); the clipboard top margin on the printed logs. The two bug fixes (Preview step in the version pen, Low to high stops) get no ID: their Mark's List rows trace them, and Low to high sits under TASTE-04. The first plan that touches each behaviour writes its ID into REQUIREMENTS.md (text, traceability row, coverage count) and ROADMAP's Phase 12 Requirements line. (Mark, 2026-11-15)
- **D-05:** Suggested IDs, the planner may rename within the file's categories: `PHONE-01` (entry points below 724), `STRUCT-05` (row controls), `LOG-01` (clipboard margin). (Claude's proposal, not Mark's words)
- **D-06:** Two design gates, scales first. **Gate 1**: the boards for the record pen, the reading and the printed log showing a recipe's own scales and problems (a scale of each kind, and none; the tasting pen and reading also at 393). Once approved and snapshotted, `/gsd-plan-phase 12` plans and builds TASTE-04, D-01 to D-03, and the scripted round trip (D-10). **Gate 2**: the boards for the entry points below 724, Preview step in the version pen, and the row controls. Once approved, a second planning round plans them, and the iPad proof (D-11) runs after they land. ROADMAP's single Design gate paragraph is restated as these two gates by the first planning round. (Mark, 2026-11-15)
- **D-08:** The order of a step's and an ingredient row's controls is Sid's to draw; Mark's brief is only that adding the next row is quick to reach by keyboard. (Mark, 2026-11-15)
- **D-09:** Add ingredient on an ingredient row opens the picker, and the picked ingredient lands right after that row in the same step group, ticked in that step's Uses; on a row under "Not in a step yet" it lands after it, unplaced. The heading's Add ingredient stays and still adds an unplaced row. (Mark, 2026-11-15, confirming the todo's reading)
- **D-11:** PROOF-02's iPad check covers creation only, as written in success criterion 3: create end to end with scales, problems and targets, Tab reaches every creation control, each Move button included, focus stays with the moved step or row, then print. It runs from the production build (`npm --prefix app run build && npm --prefix app run preview -- --host`) after the Gate 2 work lands, so the Tab walk runs once on the final control order. (Mark, 2026-11-15)
- **D-12:** The recipe Mark creates for the iPad check is a real one he will keep, with a scale of each kind and a problem. It is live data from then on. The check's steps therefore name controls and expected behaviour, never the recipe's words or figures. (Mark, 2026-11-15)
- **D-13:** The iPad check is handed over as `check` rows on Mark's List, in order: two or three rows of about ten numbered steps each (set-up, scales and targets; steps, Move and Tab; Save and print), each citing the others in `source`, walked in WebKit first. The last row carries the paper step: print the batch log and the tasting log from the iPad, put them on the clipboard, expect every printed line clear of the clip. The orchestrator writes the rows (executors have no `ArtifactData`). (Mark, 2026-11-15)

**Carried forward (do not re-decide), as CONTEXT.md states them**
- Phone brief (PRODUCT.md, "On the phone", Mark 2026-11-15): phone width is below 724; New recipe, Edit, Resume editing, Next version (band and Home row), Import and Export are left out there, Print sheet stays; a kept new-recipe draft keeps its Notebook row without Resume; a hidden job's address shows a one-line page whose wording Sid draws. This overrides sketch 011 decision 30, sketch 013 decision 10 and Phase 11 D-04 / D-05 below 724. The tasting pen and the reading get 393 boards; the printed log does not.
- Preview step in the version pen is built from Sid's board, as the creation editor's (013 decision 34, decision 014 2); the plan that builds it closes `bug-p11-pen-step-no-preview`.
- No `DB_VERSION` change and no store-file-version change: the reset window closed in Phase 11, and D-12 makes the store live.
- Boards and their inlined CSS are the authority; conformance is board and build side by side in WebKit, never prose or a test count. Every new button, checkbox and radio renders through `ui/Button.jsx`, `Checkbox.jsx` or `Radio.jsx`; every link carries `tabIndex={0}`; every visual value reads a token.
- Sid draws creation boards at 1366 only; 393 only where the phone brief names the job.

### Claude's Discretion
- The three IDs' names and wording (D-05), and how the two planning rounds are numbered.
- How the hidden entry points are left out below 724 (render or CSS) and how the one-line page is routed, within Sid's board.
- The walk's shape for anything round two adds (how it extends the Phase 10 to 12 harnesses).

### Deferred Ideas (OUT OF SCOPE)
- Reordering steps in the version pen (`bug-p11-pen-steps-no-reorder`): deferred by Mark on 2026-11-01.
- An iPhone device check: not added to this phase (roadmap; D-14).
- Reviewed, not folded: Build the Recipe book print format; Consider a "Mise en Place" auto-generator; Add a Delete recipe feature.
- Not in this phase: authoring scales or problems after creation, more than 2 of either, any `DB_VERSION` or store-file-version change.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| PHONE-01 (new, D-04/D-05) | Below 724 the entry points New recipe, Edit, Resume editing, Next version (band and Home), Import and Export are left out; Print sheet stays; a hidden job's address shows the one-line page "Done at the desk or on the iPad."; two recipe-head lines stand in for the left-out controls | CONTRACT.md sections 1 to 4; the code map "Where each phone-hidden control lives" below; the render gate on `useBelow724`; the draft-restore change in `useKeptDraft.js`; Open Questions 1 to 5 |
| STRUCT-05 (new, D-04/D-05) | The creation editor's step and ingredient-row controls stand in two groups in the drawn Tab order, each ingredient row has Add ingredient (the pick lands after that row), and the keys add and move a step or row | CONTRACT.md sections 5 and 6; "The creation editor" sections below; `addRowAfter` domain op; keyed-move caret evidence |
| PROOF-02 (existing, Pending) | Creation is checked on the iPad from the production build, including Move focus and keyboard reach | "PROOF-02" section: the WebKit walk written first, the three `check` rows, and the harness reruns that must pass before the rows are handed over |
| LOG-01, TASTE-04, PROOF-01 | Complete in round one | Not touched; `12-check.sh` is rerun as the regression gate |

Preview step in the version pen (`bug-p11-pen-step-no-preview`) takes no ID (D-04); its Mark's List row traces it.
</phase_requirements>

## Project Constraints (from CLAUDE.md)

Read this session: `/Users/mark/Documents/projects/sprinkles/CLAUDE.md` and `.claude/CLAUDE.md`. The ones round two touches:
- Every edit under `app/` goes through a GSD command; Impeccable decides and evaluates, never edits `app/`. The sketch is the authority; conformance is board and build side by side, never prose or a test count.
- React with JSX through Vite; **TypeScript is not adopted**; domain math in framework-free modules under `app/src/domain/` (no framework, DOM or store import; the domain suite runs under Vitest's `node` environment); every store access through `app/src/store/repository.js`; no `dangerouslySetInnerHTML` under `app/src`; agent-facing prose, commit messages and browser-test input values are English.
- Every visual value reads a token in `app/src/styles/tokens.css`; no component or stylesheet carries a literal. Every link carries a literal `tabIndex={0}`; every button, checkbox and radio renders through `ui/Button.jsx`, `Checkbox.jsx` or `Radio.jsx` (enforced by `ui/tabindex-scan.test.js`).
- Device UAT is served from `npm --prefix app run build && npm --prefix app run preview -- --host`, never the dev server; one Vite process per workspace; never rebuild `app/dist` (Mark serves it): always `--outDir` a scratch directory.
- Mark's List: the research agent has no `ArtifactData`, so the list was not read this session; check rows are written by the orchestrator (memory `gsd-executor-has-no-artifactdata`), one numbered step per line, `Expect:` for results, about ten steps per row, no "Check:" prefix in the title, `needs: "hands"`, never the recipe's words (D-12).
- Project skills: `.claude/skills/sketch-findings-sprinkles` (read): 44 px targets under 760, "measure the DOM", push-never-cover. The state-machine audit skills (`state-machine-audit`, `gsd-state-machine-audit`) exist: round two edits the draft writer's restore and the pen's open state, which that audit names as a risky cluster, and `gsd-state-machine-audit` is dispatched after the phase executes.

## Summary

Round two is mostly re-ordering and gating, not new mechanisms. Every control the boards move already exists in a known file; the new work is (1) a render gate keyed on the existing `useBelow724()` hook across six places plus one wrapper for two routes, (2) a restore change so a kept Next version draft does not reopen the pen below 724, (3) the step and row control regrouping, (4) one new domain op (an ingredient landing after a given row), (5) three small keys on three textareas, and (6) Preview step on the pen's open step. None needs a new package, a store shape, or a new media query. All figures below were read from the code this session; the focus and key behaviour was measured in Playwright WebKit on a Mac against a scratch build of HEAD (`7caf6c11` is the last `app/` commit, and sketch 016's boards were captured from a build at that commit, so the boards' "as built" panels equal today's code).

Two facts change how the plan should be written. **First, a kept Next version draft and the phone's one named job collide.** The drafts store has one record per version id (`createObjectStore('drafts', { keyPath: 'versionId' })`), and `plan`, `record` and `amend` are one family, so a record or tasting pen opened below 724 while a plan draft is held would write over it and a saved batch would delete it. Today this cannot happen because the plan draft reopens its pen on load and the one-pen rule blocks the record act. CONTRACT section 9 left "may a batch be recorded while a draft is held" open; this is the mechanism that makes it a data-loss question, not a styling one (Open Question 1). **Second, the caret after a keyed move mostly takes care of itself.** Measured: moving a keyed step or row up leaves the focused node in place; moving it down makes React re-insert that node, and WebKit drops focus, but React DOM's own commit-phase selection restore puts focus and the selection back on the same textarea, so the key handler must set **no** focus request (a focus request would send focus to a Move button, as the buttons do today). The consequence for the plan: caret preservation is proven only in a real WebKit run, not in the jsdom suite.

**Primary recommendation:** Gate with `useBelow724()` at render (presentational components take a `below724` prop, as `VersionRow` already does), wrap the two hidden routes in one `DeskOnly` element that renders the existing placeholder markup, skip only the `plan` restore below 724 (keeping the record, the fit check and the stored draft), reorder JSX to CONTRACT section 5 with `aria-label`s unchanged, add `addRowAfter` beside `addRow` in `domain/creation.js`, attach one key helper to the lead-in, instruction and grams textareas composed with `holdReturn`, and prove order, keys and caret with WebKit probes (Tab counts 45 stops; 1/4/5/6/9 and 1/7/8/9/12) before the iPad rows are written.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| "Below 724" presence of the six controls | Browser / React render (`useBelow724`, `useBelowDesktop.js`) | CSS already hides the header's Import/Export at this cut (`shell.css`) | CONTRACT section 1: "left out of the page", not greyed. The code already splits the cut the same way: layout in CSS, presence in a node-guarded hook |
| One-line page at `/notebook/new` and `…/edit` | Browser / router element (`router.jsx`) | Shell (tab row is the way out) | Must render before `CreationRoute` / `EditRoute` effects run, because both can navigate away; "a kept draft is not touched" |
| Keeping a kept `plan` draft shut below 724 | Browser hook (`useKeptDraft.js`) | Store (one draft per version id) | The restore effect is the only place the pen is reopened; the store's draft family rule is why a record pen is a hazard (Open Question 1) |
| Step and row control order | React markup (`CreationSteps.jsx`, `IngredientTable.jsx`) | CSS (classes already styled) | Tab order is DOM order; no tabindex above 0 exists in the app |
| Ingredient lands after a row | Domain (`creation.js` / `creationSteps.js`, pure) | `CreationPage.jsx` state, `IngredientPicker.jsx` unchanged | Placement lives in one place, a step's `uses` list (`creationSteps.js` header) |
| Keys (add, move) | React `onKeyDown` on three textareas | `CreationPage.jsx` handlers that already guard the ends | The handlers already do nothing at an end and say nothing; the key reuses them |
| Caret after a keyed move | React DOM commit (selection restore) | A WebKit probe as the proof | Not unit-testable in jsdom; see pitfall 1 |
| Preview step on the pen's open step | React (`Method.jsx` `StepPenBody`) reusing `StepReading` | CSS already styles `.mk-preview` | The creation editor's block exists; the pen only gains a button and a state |
| PROOF-02 | Device (iPad) | Playwright WebKit walk first, orchestrator writes rows | Device Tab, keys and print cannot be proven by WebKit on a Mac |

## Standard Stack

No new packages. Versions read from `app/package.json` this session [VERIFIED: app/package.json]: react / react-dom 19.2.8, react-router 8.3.1, vite 8.2.2, vitest 5.0.0, jsdom 30.1.1 (a dev dependency, opted into per test file with a `// @vitest-environment jsdom` docblock; the default environment is `node`, `app/vitest.config.js`), fake-indexeddb 6.2.5, idb 8.0.3. Playwright WebKit comes from the npx cache (`/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs`, 1.63.0 per the round-one harness headers).

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `useBelow724()` render gate | A CSS `@media (max-width: 723.98px) { display:none }` on each control | Contract says left out, not hidden; `display:none` keeps the control in the DOM (the walk's `buttons` snapshot, a jsdom test and a hidden file chooser would all still see it). The header's Import/Export are already CSS-hidden, which is why they need no change |
| A hotkeys package | `onKeyDown` | Three fields, three combos; a package is a supply-chain surface for no gain. Nothing to install |
| A new placeholder component | `Placeholder` with an optional `note` prop | `Placeholder.jsx` is 13 lines and is the contract's named markup |

**Installation:** none.

## Package Legitimacy Audit

No external packages are installed or added by round two. The legitimacy gate is not applicable.

**Packages removed due to [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none

## What the code does now (round two's map)

Every row was opened with Read this session. Line ranges are from HEAD (`11fd05e8`; last `app/` commit `7caf6c11`, `git log -3 -- app`).

### What "below 724" already means

- One JS hook and one CSS cut. `app/src/ui/useBelowDesktop.js:39` `export const BELOW_724_QUERY = '(max-width: 723.98px)';` and `useBelow724()` (lines 41-52): initial state from `window.matchMedia(BELOW_724_QUERY).matches`, a `change` listener, and, with no `window` or no `matchMedia`, `false` (the desktop arrangement), so `renderToStaticMarkup` tests and node tests never see the phone [VERIFIED: useBelowDesktop.js:39-52].
- Today it gates: Show changes and the band's record act (`VersionRow.jsx:449-493`, via the `below724` **prop** that `RecipePage.jsx:309` reads and passes down at 446), the axes arrangement in the pen (`BatchRow.jsx:648`), Shell's fly-out (`Shell.jsx:279-280`), and `IngredientsHead` (prop). CSS carries the same cut in `shell.css:1123` (tab row, More, header tools hidden), `app.css`, `notebook.css:2013`.
- Presence of a control is already a render decision where the contract wants it: `VersionRow.jsx:449` `{editState !== 'editing' && below724 && (` draws the record act; `VersionRow.jsx:481` `{parentVersion && !below724 && (` leaves Show changes out. Presentational components take `below724 = false` as a prop and the page owns the hook, so a test drives the arrangement by prop with no `matchMedia` stub (VersionRow.test.jsx:732-827 do this). Components that call the hook themselves are tested in jsdom with a mutable-width `matchMedia` (`Shell.flyout.test.jsx:43-96`). Both patterns exist; use the first for `NotebookList`, `HomeBody`/`HomeLead`/`RowActions`, and `VersionRow`, the second only for Shell and the route wrapper.
- There is **no route guard** anywhere. The router (`router.jsx:141-169`) is a flat list under `Shell`; `/notebook/new` is `Component: CreationRoute` (line 147) and `…/edit` is `Component: EditRoute` (line 157). The only placeholder pages are `Placeholder.jsx` (below) and an inline copy in `Shell.jsx:663-666` (the `catalogStale` page).

### The model for the one-line page

`Placeholder.jsx:6-13` [VERIFIED, quoted]:
```jsx
export function Placeholder({ name }) {
  return (
    <div className="list-page place">
      <h1 className="place__title">{name}</h1>
      <p className="place__note">{name} is not built yet.</p>
    </div>
  );
}
```
CONTRACT section 4: "It is the built placeholder place's markup inside the shell: `div.list-page.place > h1.place__title + p.place__note`." The only pin on the old sentence is `Shell.test.jsx:72` (`'Notebook is not built yet.'`), which stays green if the default note is kept. The Notebook tab reads as current at `/notebook/new` and `/notebook/:r/:v/edit` without any code: `RailPlace` is a `NavLink` with no `end` prop (`Shell.jsx`, `function RailPlace`), so the `/notebook` link matches by prefix [VERIFIED: Shell.jsx RailPlace; the 016 board shows it].

### Where each phone-hidden control lives

| Control | Where | Gate today |
|---------|-------|------------|
| New recipe | `NotebookPlace.jsx:221-227` `{!draft && !open && (<Button ref={newRef} className="notebook-action" …>New recipe</Button>)}` inside `NotebookHead` | none |
| Resume (the kept draft's row) | `NotebookPlace.jsx:277-281` `<span className="nb__draft-act"><Button className="notebook-action--outline" onClick={onResume}>Resume</Button></span>` | none |
| Resume editing (a kept edit's row) | `NotebookPlace.jsx:330-336` `{editVersionId && (<span className="nb__row-act">…Resume editing…)}`; the `<li>` also takes class `nb__row--resume` (line 315), which `shell.css:415-418` gives a fourth grid column | none. **Not drawn on any 016 board** (Open Question 4) |
| Next version (Home) | `RecipeList.jsx:231-241`, the `TASTED` branch of `RowActions`: `<Link … state={{ startNextVersion: true }} …>Next version</Link>` and `Adapt` in one `span.home__actions`; the same `RowActions` serves the lead (`:184`) and every row (`:282`) | none |
| Next version, Edit, Resume editing (band) | `VersionRow.jsx:458-480` | `editState !== 'editing'` for Next version; `below724` only changes its class (`:461`) |
| Import, Export | header: `Shell.jsx:589-600`, hidden by `shell.css:1266` `.shell__tools > .shell__place { display: none; }` at ≤723.98; More: `Shell.jsx:729-740` | the header's by CSS; More's none |
| Hidden file input | `Shell.jsx:601-609`, inside `.shell__tools`, stays (the CSS comment says "the tools row itself stays, because the shared hidden file input lives inside it") | n/a |
| Preview step (creation editor, as built) | `CreationSteps.jsx:160-166`, beside Add target | n/a |

### The creation editor today, in Tab order

A step (`CreationSteps.jsx:78-287`), as built [VERIFIED: file read]: lead-in textarea (85-95) → instruction textarea (99-107) → `p.method-step__targets` (110-167: each chip's label, value, its Remove; then Add target; then Preview step) → purpose field when open (168-180) → aside field when open (181-193) → preview block when pressed (194-205) → `p.method-step__uses-line` (206-232: "uses …", Change ingredients, then `·` Add purpose, `·` Add aside) → the Uses `fieldset` when open (233-246) → `p.method-step__acts` (251-284: Remove · Move up · Move down · Add step, with `data-act="remove"`, `"move-up"`, `"move-down"`, `"add-after"`).

An ingredient row (`IngredientTable.jsx:817-894`): the grams cell comes first (`td.ingredient-table__col-grams`, textarea at 838-850), then the name cell with `RowActs` (862-885). `RowActs` (249-327) draws Remove · Move up · Move down, then Add to step only when `canAddToStep` (`portion.step === UNPLACED_STEP && creatingSteps.length > 0`, line 868). Tab order is DOM order (no `tabIndex` above 0 exists; `Button.jsx` forces `tabIndex={0}`).

Focus after an act is a **request left in a ref and acted on after the render** (`CreationPage.jsx:296-350`, an effect with no dependency list): `step-act` (308-317, the same Move button, or the other when that one turned off), `row-act` (322-330), `lead-in` (306-307), `step-field` (318-319), `add-step-head`, target kinds, `'ingredient-target'`. `handleMoveStep` (479-486) and `handleMoveRow` (425-437) already `return` before setting a request or announcing when the move is past an end, so a key that calls them is silent at the ends for free. `handleAddStep(afterN)` (461-465) sets `{ kind: 'lead-in', position }`, so Cmd+Return calling `onAddStep(step.n)` lands focus in the new lead-in exactly as the button does.

The picker: `picking` is a boolean (`CreationPage.jsx:205`); `ingredientsAct` is `null` while it is open (786-796); the picker is `ingredientsFoot` (797-807), rendered by `RecipeSheet.jsx:184` after the table inside the Ingredients section, i.e. under the table. `IngredientPicker` focuses its Name field on mount (`IngredientPicker.jsx:32-34`, `nameRef.current?.focus()` with no `preventScroll`, so the page scrolls to it). `handlePick` (390-395) mints the row id, `addRow` appends it unplaced, closes the picker and sets `focusRowId`; `creationRows.focusLine` is hard-coded `focusRowId ? \`${focusRowId}:0\` : null` (line 770), and `IngredientTable.jsx:625-628` focuses `gramsInputsRef.get(creationFocusLine)`. `handleCancelPicker` (397-400) sends focus to the heading's Add ingredient (`'ingredient-target'`).

Keys today: the lead-in and every one-row field use `holdReturn` (`oneLineField.js`), which `preventDefault`s **any** Enter, with or without modifiers, and neither stops propagation nor touches other keys; the instruction textarea has no `onKeyDown` (it is multi-line by design) [VERIFIED: oneLineField.js, CreationSteps.jsx:94, 99-107]. The grams textarea has `onKeyDown={holdReturn}` (`IngredientTable.jsx:848`).

The version pen's open step (`Method.jsx:173-405`): `div.method-step__open-fields` (180-246: lead-in, instruction, and the chips' fields only when the step has targets) → stale flag → purpose field → aside field → `div` holding the uses line (307-357) → the removed-row flag → `p.method-step__done-cancel` (397-404: Cancel, Done). `StepPenBody` is one component per step whose closed and open branches share an instance, so any state in it survives Done and Cancel unless reset. Open/closed is `Method`'s `openStepN` (625-639).

### Drafts: why the pen reopens and what a draft key holds

- `useKeptDraft.js:293-294` `} else if (record.kind === 'plan') { onRestorePlan(record.payload, record.penOpenedAt); }` is the only line that reopens the Next version pen on load, after a fit check (244-248) and the foreign-family check (228-243). `draftStoredRef.current = true` is set at 290 just before.
- The persist effect (311-371) deletes the stored draft whenever no pen is open and `draftStoredRef.current` is true (356-359). So skipping `onRestorePlan` is not enough: `draftStoredRef` must stay unset for a held plan draft, as it does for a foreign record (comment at 228-231, "draftStoredRef stays unset so the persist effect neither writes over it nor deletes it").
- `db.js:61-62` `db.createObjectStore('drafts', { keyPath: 'versionId' })`: one record per version. `draft.js:557-562` `draftFamily`: `'plan' | 'record' | 'amend' | 'pen' → 'pen'`. `repository.saveDraft` refuses a write only when the stored family differs (`repository.js:468-496`), so a `record` or `amend` draft **overwrites** a `plan` draft on the same version. `RecipePage.jsx:115-125` `discardDraft` runs after a batch save and deletes the whole pen family for the version. [VERIFIED: files read]
- The band's "Draft:" line today names a draft kept on **another** version of the recipe, never this version's own: `RecipePage.jsx:358` `record.kind !== 'plan' || record.versionId === version.id || …` returns false, then `waitingPlanDraft` is passed to `VersionRow` (451) **and** to `RecipeHistory` as `waitingDraft` (470-474), which draws the rail's draft node. The 016 board's draft panel keeps History at "Only this version so far", so the band's new own-version line must not reuse `waitingPlanDraft` (pitfall 6).
- `editStateFor` (`firstVersion.js`): any draft under the version that is not an edit returns `null`, so Edit is not offered while a plan draft is held. This agrees with the board ("Record batch, Print sheet", no Edit).

## Architecture Patterns

### System architecture (round two's paths)

```
window width ──► useBelow724() ──┬─► Shell: More list drops Import, Export (header's already CSS-hidden)
 (matchMedia,                    ├─► NotebookPlace → NotebookList(below724): no New recipe, no Resume, no Resume editing
  node-guarded)                  ├─► RecipeList → HomeBody → RowActions(below724): a tasted row/lead loses Next version
                                 ├─► RecipePage → VersionRow(below724): acts = record act, Print sheet;
                                 │       + editState 'editing' → "Edit kept. …" line; + own plan draft → "Draft: … " line
                                 ├─► useKeptDraft: a fitting `plan` record is NOT restored (kept, untouched, no notice)
                                 └─► router: DeskOnly wraps /notebook/new and …/edit → Placeholder-markup page
                                         (CreationRoute / EditRoute never mount, so none of their reads or redirects run)

creation editor (≥724 only)
 step textarea (lead-in | instruction) ──onKeyDown──► keyIntent(event) ──► add: onAddStep(n)  [focus request: lead-in, as the button]
                                                                      └─► move: onMoveStep(n, dir) [NO focus request; React restores the textarea]
 grams textarea ──onKeyDown──► keyIntent ──► add: open picker anchored {afterRowId, group}  → pick → addRowAfter → focus new row's grams
                                         └─► move: onMoveRow(rowId, group, dir) [NO focus request]
 per-row Add ingredient button ───────────────► the same anchored open

version pen open step ──Preview step──► StepReading(draftStep) in div.mk-preview, closed by Done, Cancel and pen close
```

### Recommended file touch list

```
app/src/ui/Placeholder.jsx          # optional `note` prop (default keeps "X is not built yet.")
app/src/router.jsx                  # DeskOnly element on the two routes (a small wrapper beside the router's others)
app/src/ui/NotebookPlace.jsx        # below724 prop on NotebookList / NotebookHead / NotebookDraftRow
app/src/ui/RecipeList.jsx           # below724 prop through HomeBody → HomeLead / RecipeRows → RowActions
app/src/ui/Shell.jsx                # More's Import and Export <li>s gated on below724 (already in scope at :279)
app/src/ui/VersionRow.jsx           # acts row, two lines (edit kept; own draft), Next version/Edit/Resume editing gated
app/src/ui/RecipePage.jsx           # own-plan-draft derivation; handleStartDeveloping gate; useKeptDraft arg
app/src/ui/useKeptDraft.js          # skip onRestorePlan below 724 without touching draftStoredRef
app/src/ui/CreationSteps.jsx        # step regrouping; keys; mk-keys line; aria-keyshortcuts; data-field on the instruction
app/src/ui/IngredientTable.jsx      # RowActs order + Add ingredient; grams key handler; mk-keys line placement via RecipeSheet
app/src/ui/RecipeSheet.jsx          # mk-keys line under the Ingredients head row (the head row is built in IngredientsHead)
app/src/ui/CreationPage.jsx         # anchored picker state, focus line per landing group, onAddRowAfter, key paths with no focus request
app/src/domain/creation.js          # addRowAfter (beside addRow)
app/src/ui/Method.jsx               # Preview step in StepPenBody (button, state, reset on close, number prop)
app/src/styles/notebook.css         # .mk-keys (the one new rule; tokens only)
.planning/REQUIREMENTS.md, ROADMAP.md  # PHONE-01, STRUCT-05 (text, traceability, coverage 31 → 33, Phase 12: 4 → 6)
```

### Pattern 1: gate at render on `useBelow724`, prop-driven below the page

**What:** The page or route owner calls the hook; presentational components take `below724 = false`. **When:** every left-out control. **Why:** the repo's own pattern (`VersionRow`, `IngredientsHead`, `RecipeSheet`), and the static-markup tests then keep exercising the desktop arrangement with no `matchMedia`, so the existing suite stays green; the phone arrangement is a new set of cases by prop. CSS cannot do this: the contract says "left out of the page there: not greyed, not hidden behind a disclosure" (CONTRACT section 1).

### Pattern 2: one wrapper for the two hidden routes

`DeskOnly({ title, children })` calls `useBelow724()` and returns `<Placeholder name={title} note="Done at the desk or on the iPad." />` when below, else `children`. Routes become `{ path: '/notebook/new', element: <DeskOnly title="New recipe"><CreationRoute /></DeskOnly> }` and the edit route with title `"Edit"`. It must wrap the **route element**, not sit inside `CreationRoute`/`EditRoute`, because both read drafts in effects and `navigate(…, { replace: true })` away on several branches (`CreationRoute.jsx:35-51`, `EditRoute.jsx:55-90`); a guard inside would run after those redirects were scheduled. Nothing is read, written or deleted below 724, so "a kept draft is not touched" holds by construction. Crossing 724 swaps the element: the editor unmounts (`useKeptDraft`'s unmount flush writes the pending keystrokes) and remounts on the way back, reading the draft again [VERIFIED: useKeptDraft.js:378-389].

### Pattern 3: keep a held plan draft shut, in `useKeptDraft`

Only the `plan` branch changes: below 724, the fit check still runs (a misfit is still deleted quietly), and a fitting `plan` record is left alone: no `onRestorePlan`, **no `draftStoredRef.current = true`**, no `DRAFT_KEPT_STATUS` notice, and `setDraftRestoreDone(true)`. That mirrors the foreign-record exit (`useKeptDraft.js:240-243`), and it is what stops the persist effect from deleting the draft (`:356-359`). `record` and `amend` drafts restore as built (the phone's tasting job). The band needs to know a plan draft exists for this version without feeding `RecipeHistory`: derive `ownPlanDraft` in `RecipePage` from `drafts` with the same `draftMatchesVersion(record, version, allBatches.filter(...), catalog)` check as `waitingPlanDraft` (`RecipePage.jsx:358-368`) and pass it as its own prop. `handleStartDeveloping` (`RecipePage.jsx:205-207`) gains `&& !below724` as the safety net the page already uses for `editState` (route intents and Home links can still ask for the pen).

### Pattern 4: the step's controls in two groups (CONTRACT section 5)

The DOM order is the contract. In `CreationStep`: lead-in, instruction, **line 1** `p.method-step__targets` (chips, Add target, Add purpose while no purpose), purpose field when open, `p.method-step__uses-line` (uses sentence and Change ingredients only), the Uses `fieldset` when open, aside field when open, **line 2** a second `p.method-step__targets` (Add aside while no aside, then Preview step), the preview block when pressed, then `p.method-step__acts` (Add step · Move up · Move down · Remove). Class names, `data-act` values and `aria-label`s are the built ones (the board's step markup was extracted this session: `Step 1, Add target`, `Step 1, add purpose`, `Step 1, change ingredients`, `Step 1, add aside`, `Step 1, Preview step`, `data-act="add-after"` with `Step 1, Add step after it`, `data-act="move-up"`, `"move-down"`, `"remove"`), so every existing selector in the walk, the round trip and `findRefusedField` keeps working: all of them take the **first** `.method-step__targets` (`CreationPage.jsx:79`, `:334`) or a `data-act` inside `.method-step__acts`. The Uses `fieldset` keeps its place right after the uses line as built (CONTRACT section 9, bullet 3), so Tab runs Change ingredients (reading Done) → the checkboxes → the aside field. Preview step stays the group's last stop in the step's own group, and Remove the step's last stop.

### Pattern 5: an ingredient row's two groups, and Add ingredient after a row

`RowActs` order becomes: Add to step (only when `canAddToStep`), Add ingredient, Move up, Move down, Remove, with `data-act="add-ingredient"` and `aria-label` `Add ingredient after <row name>` (CONTRACT section 5) and `aria-keyshortcuts`. The chooser branch is untouched. State: `picking` becomes `false | { afterRowId, group }` (the heading's button opens with no anchor, as today). The pick calls a new pure op, and the landing focus line is `${rowId}:${landingGroup}`, not the hard-coded `:0`:

- `addRowAfter(draft, { rowId, libraryId, afterRowId, group })` in `domain/creation.js` (it already imports `liveSteps`, `rowLines` from `creationSteps.js`; the reverse import does not exist, so no cycle). For a live step `group`: `addRow`, then tick the new row into that step (`toggleStepUses`, which appends to `uses` and moves the placeholder grams `''` into a portion at that step), then move its id in `uses` to immediately after `afterRowId`. For `UNPLACED_STEP`: `addRow` then splice the new row into `draft.rows` immediately after the anchor (the unplaced group's order is `draft.rows` order, `groupRows`, `creationSteps.js:93-101`). Throw `RangeError` for an anchor not in the group, as the neighbours do.
- A row that sits in two steps has two lines, each with its own `RowActs`; the anchor is the line's group, which `RowActs` already receives as `group`.
- `handlePick` today closes the picker and sets `focusRowId`; the change is to read the anchor from `picking` and to set the focus line key from the landing group. `handleBlurGrams(rowId)` clears it as built.

### Pattern 6: three keys, one helper, composed with `holdReturn`

A small pure helper beside `oneLineField.js` returns the intent from a React keydown event and is attached by composition: `onKeyDown={(event) => { if (!stepKey(event, …)) holdReturn(event); }}` on the lead-in; on the instruction (which has no handler today) the helper alone; on the grams textarea the same composition as the lead-in. Combination tests: add = `key === 'Enter'` with `metaKey || ctrlKey`, no `altKey`, no `shiftKey`; move = `ctrlKey && metaKey`, no `altKey`, no `shiftKey`, `key` `'ArrowUp'`/`'ArrowDown'`. Return early when `event.nativeEvent?.isComposing === true || event.keyCode === 229` (the repo's own IME test, `oneLineField.js`). Always `preventDefault()` for a recognised combination, **including at an end**, so a no-op move cannot fall through to a default action. Attach to the three named fields only (CONTRACT section 6 names "a step's lead-in or instruction" and "a row's grams"); the target, purpose, aside and Name fields are not named (Open Question 8). For a move, call `onMoveStep` / `onMoveRow` and set **no** focus request (the button path sets `step-act` / `row-act`, which would move focus to a Move button). The caret then rests on what pitfall 1 measured. Add the key's announcement for free: the handlers announce (`announceStructure`).

### Pattern 7: Preview step on the pen's open step

In `StepPenBody`: `const [previewing, setPreviewing] = useState(false)`; a `p.method-step__targets` after `div.method-step__open-fields` holding one `Button` (label `Preview step` / `Hide preview`, `aria-label` from `fieldLabel(step, draftStep.removed, previewing ? 'Hide preview' : 'Preview step')`, which yields `Step n, Preview step`); then, when pressed, `div.mk-preview` `role="group"` `aria-label` `fieldLabel(…, 'preview')`, holding `p.mk-preview__cue` "Preview" and `ol.method-steps > StepReading`. `StepReading` takes `step` and `number`; give `StepPenBody` a `number` prop from `Method.jsx`'s `marginInfo.number` (`:696-701`) and pass `draftStep` (the same object the closed branch already draws through `StepTargets`, `StepPurpose`, `StepAside`, `Method.jsx:428-440`). Reset `previewing` when `isOpen` turns false (an effect keyed on `isOpen`): Done and Cancel both call `setOpenStepN(null)` (`Method.jsx:633-639`) and the component instance stays mounted, so without the reset the preview would reappear on the next Edit this step (CONTRACT section 7: "either closes the preview with the step"). Where the line sits relative to a written purpose or aside is not drawn (Open Question 6).

### Anti-Patterns to Avoid
- **A CSS-only phone gate** for the six controls (leaves them in the DOM; contradicts the contract).
- **Reusing `waitingPlanDraft` for the band's own-version line** (it also drives the History rail's draft node; the board keeps History as "Only this version so far").
- **Setting `focusRequestRef` in a key move** (a Move button takes focus; the caret is lost) or, for the add key, building a second add path (call `onAddStep(step.n)`).
- **A guard inside `CreationRoute` / `EditRoute`** (their effects navigate away first).
- **Editing the Phase 11 board specs** (`11-board-steps.mjs`, `11-board-structure.mjs`, `11-board-first-version.mjs`, `11-board-save.mjs`) to follow 016: they hold sketch 014, which 016 overrides for these controls; 12-check.sh does not run them (see Harness).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Width detection | A new hook, `window.innerWidth` reads, a resize listener | `useBelow724()` (`useBelowDesktop.js:41`) | Node-guarded, subscription and cut already shared by CSS and JS |
| The one-line page | A new page component and styles | `Placeholder` with an optional `note` | CONTRACT section 4 names the markup; the styles exist (`.place__title`, `.place__note`) |
| Restoring the caret after a keyed move | A saved-selection ref, a `focus()` and `setSelectionRange` pair, a `requestAnimationFrame` | Nothing: set no focus request and let React DOM's commit-phase restore act; prove it in a WebKit probe | Measured: it restores focus and the selection on the same textarea for up and down, steps and rows (pitfall 1). A second restore races it and invites a stale caret |
| Add-after logic | A second row-insertion path | `addRow` + `toggleStepUses` inside one `addRowAfter` | Allocation invariants (`checkAllocation`, `creationSteps.js:383`) already hold for these two ops; the placeholder portion rule (`creationSteps.js` header, RESEARCH G-2) is easy to break by hand |
| The preview block | A new preview | `StepReading`, `StepTargets`, `StepPurpose`, `StepAside` and the `.mk-preview` rules | The creation editor and the pen's closed step already draw through them |
| Keyboard shortcut handling | A hotkeys package or a document-level listener | `onKeyDown` on the three fields | The keys are field-scoped by contract; a document listener would also fire in the target, purpose, aside and Name fields |
| A second announcement path | New live regions | `announceStructure` and the handlers' own sentences | The handlers already say "Step 2 of 2" and "Heavy cream, 36% fat, row 2 of 2 in step 1" (CONTRACT section 6, captured) |

**Key insight:** every behaviour here already has an owner. The risk is not missing machinery; it is the two places the old design guaranteed something implicitly (a plan draft reopens its pen so nothing else can write the draft key; a button press sets the focus request so focus is predictable) and the new design removes that guarantee.

## Common Pitfalls

### Pitfall 1: the focus-and-caret behaviour after a keyed move is React's, and only a real WebKit run proves it
**What goes wrong:** the plan adds a saved-selection restore (or sets the Move button focus request for key moves) and the caret jumps, or jsdom tests "prove" something WebKit does not do.
**Why it happens:** `CreationStep` and the table rows are keyed lists. React moves the *other* node when a step goes up and the *focused* node when it goes down. Measured this session in Playwright WebKit against a scratch build of HEAD, with the Move button's `focus()` suppressed to mimic a key path that sets no request: step 3 up: the `li` of the step that went down was removed and re-added, the moved step's node stayed, focus and selection stayed; step 2 down: the moved step's own `li` was removed and re-added, and with `focus()` fully stubbed `document.activeElement` became `BODY` (focus lost), selection values kept on the node ([6,8], [1,3]). With only buttons stubbed, the textarea **kept focus and the same selection after both directions, for the lead-in, the instruction, and a grams field** (rows measured the same way). The cause is in the bundle: after `commitMutationEffectsOnFiber`, React compares the active element with the one focused before the commit and, when it changed and the old one is still in the document, calls `focus()` and sets `selectionStart` / `selectionEnd` (`react-dom-client.development.js:17979-18010`, React 19.2.8) [VERIFIED: source read and probe, `focus-probe.mjs` and `row-probe.mjs` in the scratchpad, 2026-11-21].
**How to avoid:** key paths call `onMoveStep` / `onMoveRow` and leave `focusRequestRef` null; the button paths are unchanged. Prove it with a WebKit probe that presses the real key (`Control+Meta+ArrowUp` and `ArrowDown`) in the lead-in, the instruction and a grams field, with a collapsed and a ranged selection, and asserts `document.activeElement`, `selectionStart/End` and the new order. Do not rely on jsdom (its focus fixup on re-inserted nodes is not WebKit's).
**Warning signs:** focus on a Move button after a key move; `activeElement` is `BODY` after a move down. Residual: React restores `selectionStart/End` only (not `selectionDirection`) and a re-inserted textarea's `scrollTop` resets; a two-row textarea with long text can scroll to the top. Minor; note for the iPad rows.

### Pitfall 2: Playwright WebKit proves the code path, not the iPad
**What it can prove** [VERIFIED: probes this session]: `keyboard.press('Meta+Enter')` and `('Control+Enter')` deliver `keydown` with `metaKey` / `ctrlKey` and `key: 'Enter'`; in a multi-line textarea neither inserts a newline nor changes the caret by default (value unchanged, selection [12,14] before and after) in this engine; `Control+Meta+ArrowUp` and `ArrowDown` leave the caret where it was by default, while `Meta+ArrowUp` moves it to 0 (so Ctrl+Cmd is the combination that does not collide with caret movement here, as README decision 15c says); the Tab order of a built page (Playwright's Tab on macOS WebKit, buttons with `tabindex="0"`); React's focus restore; every handler and announcement.
**What it cannot:** the iPadOS hardware-keyboard event path (`pressesBegan`, UIKit key commands, Globe-key shortcuts) and what iPad Safari does with each combination in the app's real DOM (Mark's iPad probe covered a probe page, not the app: README "Mark's answers"); iPadOS 27's dropped Tab from `<input>` (the lead-in and grams are textareas for that reason, `oneLineField.js` header); non-US layouts; key repeat; autocorrect and IME on the iPad; the virtual keyboard's shortcut bar; focus rings after programmatic focus (PRODUCT.md: "A button focused from code shows no focus ring after a finger tap"); scroll-into-view after `focus()` in iPad Safari. `keyboard.press` on macOS emulates Mac editing commands, which is why `Meta+ArrowUp` moved the caret; that is Mac behaviour, not iPad's. Every claim stays device-unverified until PROOF-02.

### Pitfall 3: Cmd+Return held down adds a step per repeat
`keydown` repeats while a key is held. A held Cmd+Return would add steps until released. Ignore `event.repeat` for the add key (the contract is silent: Open Question 11); moves may repeat (a held Ctrl+Cmd+Down walking a step to the end is plausible and harmless: the ends are silent).

### Pitfall 4: `holdReturn` and the instruction field
`holdReturn` `preventDefault`s every Enter, so a composed handler must run first for the combinations and fall through to `holdReturn` for everything else. The instruction textarea has no handler; Enter there must keep inserting a line break, so the helper must `preventDefault` only for the recognised combination (Cmd+Return, Ctrl+Return), never for a plain Enter.

### Pitfall 5: a held plan draft and a record or tasting pen (the data-loss path)
Below 724 the pen stays shut, so the one-pen rule no longer protects the `plan` record on the version's one draft key. Pressing Record batch / Record tasting there opens a record or amend pen; its first dirty write goes through `saveDraft`, which treats `plan`, `record`, `amend` as one family and overwrites; a saved batch then deletes the family (`RecipePage.jsx:115-125`). The band line "Draft: Version 2 · less cream. …" would then be a lie, and the Next version draft is gone. This is Open Question 1; the plan must not pick a side silently, and whichever is picked needs a test that opens the record pen below 724 with a held plan draft.

### Pitfall 6: the band's own-version draft line and History
`waitingPlanDraft` feeds `VersionRow`'s `draft` (451) and `RecipeHistory`'s `waitingDraft` (470-474). Reusing it for an own-version draft would add a rail node the board does not draw. Pass a separate prop.

### Pitfall 7: the restore is once per mount, the width is not
`useKeptDraft`'s restore runs once per page instance (`draftRestoreStartedRef`, `:195`, `:211`). If the page mounts below 724 and the window then widens past 724 (iPad split view closing, a phone turned sideways; an iPhone SE in landscape is 667 wide and larger phones are wider than 724 [ASSUMED: device widths from memory]), the held plan draft stays shut and, with the controls back, there is no way to reopen it short of a reload. Conversely, a pen restored at ≥724 stays open if the window narrows (state, not width). Open Question 5.

### Pitfall 8: Preview step state survives Done and Cancel
`StepPenBody` is one instance per step; opening and closing a step does not remount it (the unkeyed branches are deliberate: `Method.jsx:143-145`). Reset the preview state when `isOpen` goes false.

### Pitfall 9: "Add ingredient" is now many buttons with one visible word
The heading's button and each row's button read "Add ingredient". The heading's is `.mk-head-act`; the rows' are `text-control` with `aria-label` "Add ingredient after <row>". Playwright `getByRole('button', { name: 'Add ingredient' })` matches by substring and becomes ambiguous; jsdom helpers matching by text do too. The walks and the round trip already select the heading by class (`.ingredient-table-region .mk-head-act`, `11-walk.mjs:985`, `12-roundtrip.mjs:257`), which stays correct as long as a row's button never takes `mk-head-act`. Pins to update: `CreationFlow.test.jsx:1057-1065` (`buttonByText('Add ingredient')` must be null while the picker is open: with rows on the page it will not be unless rows' buttons also go away or the helper is scoped), `:1090-1108`, `:1148`, `CreationStructure.test.jsx:436`.

### Pitfall 10: the landing focus line is hard-coded to the unplaced group
`CreationPage.jsx:770` builds `${focusRowId}:0`. A row that lands in a step has the line key `${rowId}:${n}`, so it would never take focus. The focus state must carry the landing group (CONTRACT section 5: "Focus goes to the new row's grams").

### Pitfall 11: static-markup tests cannot see the phone
With no `window` the hook answers desktop, so `Shell.test.jsx:145` ("the More disclosure holds Ingredients, Kitchen, Search, Import and Export") and `:244` (19 `shell__place` stops) stay true and prove nothing about 393. Add phone cases by prop (page components) or jsdom `matchMedia` (Shell, DeskOnly), asserting both presence at ≥724 and absence below.

### Pitfall 12: code the change makes dead
Below 724 the Import error panel can no longer be reached by a tap: `Shell.jsx:373-376` `(below724 ? moreSummaryRef : importRef)`, the `below724` dependency at `:392`, `shell.css:1253-1261`, and the tests `Shell.flyout.test.jsx:399-409` and `:461-500` (which drive the hidden file input directly, so they stay green while describing a state no phone reaches). `VersionRow.jsx:461` `className={below724 ? 'notebook-link' : 'notebook-action'}` becomes always `notebook-action`. CLAUDE.md: remove what your change orphans, leave pre-existing dead code; the plan decides each, naming it.

## Code Examples

Shapes, not final code. Every string is from CONTRACT section 8 or the built markup quoted above.

### The route wrapper
```jsx
// Source: CONTRACT section 4; Placeholder.jsx; useBelowDesktop.js:41
export function DeskOnly({ title, children }) {
  const below724 = useBelow724();
  return below724 ? <Placeholder name={title} note="Done at the desk or on the iPad." /> : children;
}
// router.jsx: { path: '/notebook/new', element: <DeskOnly title="New recipe"><CreationRoute /></DeskOnly> }
//             { path: '/notebook/:recipeId/:versionId/edit', element: <DeskOnly title="Edit"><EditRoute /></DeskOnly> }
```
`Placeholder` gains `note = \`${name} is not built yet.\`` so `Shell.test.jsx:72` keeps passing.

### The key intent
```js
// Source: CONTRACT section 6; oneLineField.js (the IME test)
export function keyIntent(event) {
  if (event.nativeEvent?.isComposing === true || event.keyCode === 229) return null;
  if (event.altKey || event.shiftKey) return null;
  if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) return event.repeat ? 'ignore' : 'add';
  if (event.ctrlKey && event.metaKey && event.key === 'ArrowUp') return 'move-up';
  if (event.ctrlKey && event.metaKey && event.key === 'ArrowDown') return 'move-down';
  return null;
}
// In a field: const intent = keyIntent(event); if (intent) { event.preventDefault(); act(intent); return; } holdReturn(event);
```
(`'ignore'` still `preventDefault`s so a held key types nothing.) Keep it in `app/src/ui/`, beside `oneLineField.js`: it reads a React event, so it does not belong under `domain/`.

### The held plan draft in `useKeptDraft`
```js
// Source: useKeptDraft.js:290-300 as read; the foreign-record exit at :240-243 is the model
} else if (record.kind === 'plan' && keepPlanShut) {
  // below 724: leave the record where it is; draftStoredRef stays unset so the persist effect neither writes nor deletes it
  setDraftRestoreDone(true);
  return;
}
```
placed **before** `draftStoredRef.current = true` (`:290`). `keepPlanShut` is a new argument from `RecipePage` (`below724`), read once at restore (Pitfall 7).

### The new domain op
```js
// Source: creation.js addRow (read); creationSteps.js toggleStepUses, groupRows, UNPLACED_STEP (read)
export function addRowAfter(draft, { rowId, libraryId, afterRowId, group }) {
  const added = addRow(draft, { rowId, libraryId });            // unplaced, grams ''
  if (group === UNPLACED_STEP) {
    const rows = added.rows.filter((row) => row.id !== rowId);
    const at = rows.findIndex((row) => row.id === afterRowId);
    if (at === -1) throw new RangeError(`row ${String(afterRowId)} is not on the draft`);
    return { ...added, rows: [...rows.slice(0, at + 1), added.rows.at(-1), ...rows.slice(at + 1)] };
  }
  const ticked = toggleStepUses(added, group, rowId);            // appends to that step's uses
  return withUsesAfter(ticked, group, rowId, afterRowId);        // a small local helper: move rowId to just after afterRowId
}
```
Required domain tests (node environment, `creation.test.js`): lands after the anchor in a step group and in the unplaced group; the step's `uses` reads in that order; `checkAllocation` holds; the new row's single portion is at the step with `''`; a split row's anchor is the line's group; a missing anchor throws.

### The row's controls, in order
```jsx
// RowActs, non-chooser branch (IngredientTable.jsx:292-325): Add to step (when canAddToStep), Add ingredient, Move up, Move down, Remove
<Button className="text-control" data-act="add-ingredient" aria-label={`Add ingredient after ${name}`} aria-keyshortcuts="Meta+Enter Control+Enter" onClick={onAddAfter}>Add ingredient</Button>
```
(`aria-keyshortcuts` for the Moves: `Control+Meta+ArrowUp` / `Control+Meta+ArrowDown`, from CONTRACT section 6.)

## Tests, walks and board checks the changes touch

`workflow.nyquist_validation` is `false` in `.planning/config.json` (read this session), so there is no Validation Architecture table, as in round one. What follows is the list of pins to change and extend, from grep and Read.

### Unit and markup pins that will break (change them with their plan)

| File and lines | Pin today | Becomes |
|----------------|-----------|---------|
| `ui/CreationSteps.test.jsx:134-136`, `:167-180` | the targets line's direct controls are `['Add target', 'Preview step']` | line 1 holds Add target (and Add purpose while none); Preview step is on the second line with Add aside |
| `ui/CreationSteps.test.jsx:189-201` | Add purpose and Add aside after "·" on the uses line | Add purpose on line 1, Add aside on line 2; the uses line holds "uses …" and Change ingredients only |
| `ui/CreationSteps.test.jsx:301-365` | Preview step on the targets line; the block "before the uses line" | Preview step on the last line of the step's own group; the block under it, above the list line |
| `ui/CreationSteps.test.jsx` (acts) | Remove · Move up · Move down · Add step | Add step · Move up · Move down · Remove; add the `aria-keyshortcuts` and key cases |
| `ui/IngredientTable.creating.test.jsx:274-295`, `:370-399`, `:427-480` | `actsText` is `'Remove · Move up · Move down · Add to step'`; control order lists | `Add to step · Add ingredient · Move up · Move down · Remove` (Add to step only when unplaced) |
| `ui/CreationFlow.test.jsx:1057-1065`, `:1090-1108`, `:1148`; `ui/CreationStructure.test.jsx:436` | the heading's Add ingredient found by text | scope to `.mk-head-act` (Pitfall 9); add Add-ingredient-after cases |
| `ui/VersionRow.test.jsx:725-827`, `:905-935`; `ui/VersionRow.record.test.jsx:71-110` | below 724 the acts are `['Record another', 'Next version']`, Next version as `notebook-link`, Edit drawn below 724, Resume editing drawn below 724 | below 724: the record act, Print sheet; no Next version, Edit, Resume editing; two new lines. Test I (the text-control Next version) goes; Tests A to C, F, G, H are rewritten. Desktop arrangements stay |
| `ui/RecipeList.test.jsx`, `ui/RecipeList.nextVersion.test.jsx` | tasted row and lead offer Next version | desktop unchanged; add the below-724 cases |
| `ui/NotebookPlace.test.jsx` | New recipe, Resume, Resume editing | desktop unchanged; add the below-724 cases |
| `ui/Method.test.jsx`, `ui/RecipePage.perStep.test.jsx` | an open pen step's controls and counts | one more `p.method-step__targets` with one button; check any count of `.text-control` per open step |
| `ui/Shell.test.jsx:145`, `:244` | static, desktop | unchanged and silent about the phone; add jsdom phone cases beside `Shell.flyout.test.jsx:292-310` |
| `ui/RecipePage.drafts.test.jsx`, `ui/useKeptDraft.test.jsx` | restore reopens the plan pen | unchanged at desktop; add: below 724 a fitting plan record is not restored, not deleted, no notice; a misfit is still deleted; a `record` record still restores |
| `styles/tokens.test.js:83,91` | every `var()` resolves; nothing declared and never read | `.mk-keys` reads three existing tokens (`--face-grotesk`, `--sheet-size-cross-flag`, `--gap-xs`, `tokens.css:13`, `:207`, `:49`) |
| `ui/tabindex-scan.test.js` | every `a`, `Link`, `NavLink` carries `tabIndex={0}`; raw `button` only in `Button.jsx` | new controls use `Button`; the one-line page has no control |

New domain cases (node environment): `addRowAfter` (list above), `keyIntent` (each combination, the IME and `repeat` cases, plain Enter returns null).

### Walks and gates

- **`11-walk-check.sh` (the gate `12-check.sh` runs; baseline `11-walk-before.json`, 12 scenarios at width 1366, `WIDTH = 1366` at `11-walk.mjs:103`).** Reading the scenario list (`'version-pen-kept-draft'` … `'tasting-save'`, the twelve baseline names at `11-walk.mjs:432-919`) and grepping for the pen's step controls finds no baseline scenario that opens a step in the version pen (no "edit this step" press) and none that renders the creation editor, so Preview step in the pen and the editor regrouping should not move any of the 94 snapshots. The five new scenarios (`create-recipe`, `create-save-refused`, `edit-first-version`, `edit-stale`, `edit-kept`, `ALLOWED_NEW_SCENARIOS`, `:107`) drive the editor and print `NEW` (not compared against the baseline) but their own `expect`s must still pass: they press `Step n, Add step after it`, `Step n, move down` / `move up`, `Add to step, <row>` and `.method-region .mk-head-act`, all kept by the contract. **Run it before deciding to re-record.** Re-record through `11-walk-record-base.sh` with its own trace (12-08's method) only if a DIFF line appears; the plan states the BASE it moves to and why. Not yet run for round two (a claim from reading, not from a run).
- **`12-roundtrip.mjs`** drives creation through heading controls only and presses no Move (header comment, lines 34-35); it should pass unchanged (68 PASS at round one). Rerun in `12-check.sh`.
- **`12-stops-probe.mjs`, `12-print-check.mjs`, `12-safari-check.mjs`:** untouched surfaces (the pen's scale stops, the printed logs, the Simulator's pen and reading). Rerun as regression; `12-stops-probe.mjs:297` opens the New recipe entry at 1366 (unaffected).
- **Phase 11's `11-board-steps.mjs`, `-structure.mjs`, `-first-version.mjs`, `-save.mjs` and the Phase 10 board specs** hold sketches 013 and 014, which sketch 016 overrides for the step and row controls (016 README, "What this overrides"). `12-check.sh` does not run any board check (its header says the board check is 12-04's own command). Do not treat their failure after Gate 2 as a regression, and do not "fix" them toward 016; the new specs below replace them for these panels. `11-device-steps.mjs:322`, `:342`, `:371` Tab to `Step 2, move up`, `Move Sucrose down…` and `remove <row>` by counting Tabs: they describe the old order (Phase 11's device check, already run); `12-device-steps.mjs` copies the file and re-derives them.

### New harness pieces (names are the planner's)

1. **Board specs for sketch 016** on `12-board-check.mjs` (round one's engine takes a panel by `panelSelector` and `panelIndex`, so no engine change is needed): panels `.fp-win.g2w-393`, `.g2w-723`, `.g2w-1366` selected by `data-pid` (`rc-drawn`, `rc-full`, `kr-moved`, `kr-preview`, `ai-pick`, `ai-step`, `ai-unplaced`; the band panels `band-tasted`, `band-awaiting`, `band-none`, `band-tasted-723`, `band-editable`, `band-editing`, `band-draft`; the Places panels `nb`, `nb-draft`, `home`, `more`; the pen panels `pv-pen`, `pv-pen-on`; the desk page). The "As built" panels (`rc-built`, `rc-full-built`, `band-built-*`, `pv-editor`, `pv-pen-built`) are not targets (CONTRACT, preamble). Seeding follows `12-cases.mjs` (an example recipe injected into a throwaway IndexedDB) and Sid's capture scripts (`.planning/canvas-generators/p12g2-capture.mjs`, `p12g2-measure.mjs`, which already walk the board's Tab order and print `equal` or `DIFFERS`).
2. **A Tab-order probe** on the build: Playwright WebKit with `hasTouch`, on the Coffee example (Heavy cream, Coffee beans, Dextrose, Fine sea salt; steps Steep and Churn, made through the editor). Assert 45 stops through the Ingredients and Instructions regions, and from a step's instruction: a new step reaches target 1, aside 4, Preview step 5, Add step 6, Remove 9; a step with a target, a purpose and an aside written reaches 1, 7, 8, 9, 12 (CONTRACT section 5); from a row's grams Add ingredient is 1 Tab on a row in a step and 2 on a row in no step [CITED: CONTRACT.md section 5]. The built control order was walked at 41 stops (README "Measured").
3. **A keys-and-caret probe** (Pitfall 1): presses `Meta+Enter`, `Control+Enter`, `Control+Meta+ArrowUp` and `ArrowDown` in the lead-in, instruction and a grams field, and asserts the order, the announcement text (`Step 2 of 2`; `Heavy cream, 36% fat, row 2 of 2 in step 1`), focus, selection, no typed text, and silence at the ends.
4. **A phone probe** at 393 and 723 (WebKit, `isMobile`, touch): the six controls absent at ≥ their cut and present at 724 and 1366; `/notebook/new` and `/…/edit` show the page with "Done at the desk or on the iPad." and no control; a kept create draft, a kept edit draft and a held plan draft are byte-identical in `dumpStores` before and after the visit (the "touched" test); no sideways overflow. Add to the Simulator check (`12-safari-check.mjs sim`) a phone-size view of the band and More if the plan wants mobile Safari evidence (no device row: D-14).
5. **`12-check.sh` round two**: keep every round-one step and add the new probes and board specs; end with a new last line (round one ends `GATE1 PASS`). Run after a scratch build (`--outDir`), never into `app/dist`.

## PROOF-02: the iPad proof

**Order of operations.** (1) Gate 2's plans land and `12-check.sh` round two passes. (2) The orchestrator tells Mark whether `main` is safe to deploy (memory `tell-mark-when-dist-build-is-safe`; round two changes no store shape, so a dist build is safe). (3) A WebKit walk, `12-device-steps.mjs`, copies `11-device-steps.mjs`'s discipline (ready state, **one** activation, FAIL on a miss, `tabTo` at most 40 Tabs; file header lines 1-23) and walks each step of the three rows as written, on the final build, before any row is handed over (memory `verify-device-check-steps-before-handing-over`). (4) The orchestrator writes the rows (executors have no `ArtifactData`; memory `gsd-executor-has-no-artifactdata`), one at a time into the list in order, each citing the others in `source`.

**What the rows must cover** (D-11 to D-13; step wording stays about controls and expected behaviour, never the recipe's words or figures, because the recipe is live data):
- Row 1, set-up, scales and targets: create a recipe with a scale of each kind, a problem, a style and targets, from the production build served with `build` then `preview --host`; no iPhone.
- Row 2, steps, Move and Tab: add two steps and ingredients; Tab through the regrouped controls (the contract's counts are the "Expect:" lines); press each Move by touch and by keyboard and check focus stays with the moved step or row; **the new keys, because they are device-unverified in the app**: Cmd+Return in a step's lead-in, instruction and a row's grams, Ctrl+Cmd+Up and Down in the same fields with the caret where it was, and Add ingredient on a row landing after it. iPad Full Keyboard Access stays off (memory `ipad-full-keyboard-access-stays-off`): tap a field, then Tab.
- Row 3, Save and print: Save with "Recipe saved.", print the bench sheet, then the paper step: print the Batch log and the Tasting log from the iPad, put them on the clipboard, expect every printed line clear of the clip (this also closes Mark's List row `adoajjb9sgzbezmyrt4s`, LOG-01's paper check, `12-VERIFICATION.md` human item 2).
Each row at most about ten numbered steps, one per line, an `Expect:` where a step has a result (CLAUDE.md "Mark's List"); a row longer than that is split and the pieces cite each other. PHONE-01 gets no device row (D-14); its evidence is board against build at 393 and 723, the phone probe and, if the plan wants it, the Simulator. `12-VERIFICATION.md` also owes Mark's confirmation of G11 (focus after Save over): it rides the same visit but is not part of this phase's code.

## Suggested plan slicing (the planner decides)

Plans 12-01 to 12-08 exist; round two numbers from 12-09. Files overlap (`CreationSteps.jsx`, `IngredientTable.jsx`, `CreationPage.jsx`), so the editor plans are sequential waves; the phone and pen plans are independent of them.
- **Wave A (parallel):** *phone entry points* (PHONE-01 written into REQUIREMENTS and ROADMAP; Shell, Notebook, Home, band, two lines, `DeskOnly`, `useKeptDraft`; Open Questions 1 to 5 resolved first) and *Preview step in the pen* (`Method.jsx` only; closes `bug-p11-pen-step-no-preview`).
- **Wave B:** *step regroup, `mk-keys` lines, `aria-keyshortcuts`* (STRUCT-05 written here; `CreationSteps.jsx`, `IngredientTable.jsx` order, `RecipeSheet.jsx`, `notebook.css`).
- **Wave C:** *Add ingredient on each row* (`addRowAfter`, anchored picker, landing focus line; Open Question 9) and *the three keys* (`keyIntent`, composed handlers, no focus request) together, since both edit the grams textarea and `CreationPage.jsx`.
- **Wave D:** the harness (board specs, Tab-order, keys-and-caret and phone probes, `12-check.sh` round two, a walk re-record only on a DIFF) and `12-device-steps.mjs`; then the orchestrator's checkpoint for the rows.
`ui_review` and `state_machine_audit` are on in config: the audit's cluster (the pen, the draft writer) is exactly what Wave A edits.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node | build, tests, probes | yes | the round-one probes ran under it (v24.21.0 at round one) | none needed |
| Playwright WebKit | board checks, probes, walks | yes | `playwright-core` at `/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs`; used this session (`webkit.launch()` ran) | refill: `npx -y playwright-core@1.63.0 --version` |
| Scratch build | probes | yes | `npm --prefix app run build -- --outDir <scratch> --emptyOutDir` ran in 0.5 s this session; `app/dist` untouched (`git status` clean for `app/`) | none needed |
| Xcode iOS Simulator | optional phone evidence | not re-probed this session; present at round one | Xcode 27.2 | skip: no device row for the phone (D-14) |
| iPad with Magic Keyboard, build served with `preview --host` | PROOF-02 | Mark's | n/a | none (the proof is the device) |

**Missing dependencies with no fallback:** none for the code. PROOF-02 needs Mark.

## Security Domain

`security_enforcement` is true, ASVS level 1, `security_block_on: high` (`.planning/config.json`, read this session).

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication / V3 Session | no | single-user local app |
| V4 Access Control | no | no accounts; the left-out controls are a presentation rule, not a permission (a typed address still reaches the route, and below 724 shows the page) |
| V5 Input Validation | yes | The new keys add no input path. Maker text (row names in `aria-label`s and the announcement, step words in the preview) stays a React text child or attribute, never markup (project rule; no `dangerouslySetInnerHTML`). A picked ingredient comes from the library record, as today. `addRowAfter` validates its ids as `addRow` does (non-empty strings, no duplicate row id) |
| V6 Cryptography | no | none |
| V12 / data integrity (ASVS 1 level) | yes | The kept-draft store is the maker's work; see the first threat |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| A Next version draft overwritten or deleted by a record or tasting pen opened below 724 (Pitfall 5, Open Question 1) | Tampering (of the maker's own data), integrity loss | Decide Open Question 1 explicitly; test the sequence (held plan draft, open record pen, type, save) in jsdom with a `matchMedia` stub and in the store (`fake-indexeddb`) |
| The one-line page "touches" a kept draft | Tampering | Wrapper at the route element; the phone probe compares `dumpStores` before and after the visit |
| A key combination typed into the app's text, or a held key adding many steps | Tampering / denial of the maker's own flow | `preventDefault` for recognised combinations only; ignore `repeat` for add (Pitfall 3) |
| Prototype-key or unsafe ids in a draft | Tampering | unchanged: `draftMatchesVersion`'s `UNSAFE_KEYS` check and `isScaleDefinition` (round one, Security Domain) |
| Import left out below 724 leaves the hidden file input | none new | The input stays inside `.shell__tools` (`Shell.jsx:601-609`), unreachable by tap; no file is read without a click that no longer exists below 724 |

## CONTRACT.md section 9, fact by fact (what the code settles and what needs a decision)

| Open build fact (CONTRACT section 9) | Disposition |
|--------------------------------------|-------------|
| The caret after a keyed move is drawn, not built | **Code settles the mechanism, the iPad settles the result.** No decision needed: a key move sets no focus request and React DOM restores the textarea and its selection (Pitfall 1, measured for steps and rows, up and down). Device-unverified; proof is the keys-and-caret probe now and PROOF-02's row 2 on the iPad |
| The open preview on `row-controls.html` does not show a target or an aside | **Code settles it.** The editor's preview is `StepReading step={projected}` where `projected` is `version.method.find(...)` (`CreationSteps.jsx:194-205`, `:322`); `StepReading` draws targets, why and aside (`StepReading.jsx:63-77`). Nothing to decide; the board panel to match for a written step is the build's own |
| The Uses checklist is not drawn open | **Code settles it.** The `fieldset` is `{usesOpen && …}` directly after the uses line (`CreationSteps.jsx:233-246`); keep it there. Tab then runs Change ingredients (reads Done) → checkboxes → the aside field. Measure it in the Tab-order probe with a checklist open |
| Keys on a keyboard with no Cmd key | **Left undecided by the contract; no code beyond Ctrl+Return.** The plan must not invent another combination (Open Question 10 asks only that this is confirmed as intended) |
| Whether a batch may be recorded while a Next version draft is held below 724 | **Needs a decision** (Open Question 1), and it is a data-loss question |
| The picker opens under the table's Total also from a row; where the page scrolls to is not drawn | **Code settles it.** `IngredientPicker` focuses Name on mount with no `preventScroll` (`IngredientPicker.jsx:32-34`), so the page scrolls to the picker; the pick then focuses the new row's grams, which scrolls back. Remaining choices are in Open Question 9 |
| Everything is device-unverified | PROOF-02, as planned above |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | React DOM's post-commit focus and selection restore behaves on iPad Safari as it did in Playwright WebKit on a Mac (focus and caret kept after a keyed move down) | Pitfall 1 | The caret jumps or focus is lost after a key move down on the iPad; the fallback is an explicit post-render `focus()` and `setSelectionRange` request (a new `focusRequestRef` kind), added if the iPad row fails |
| A2 | Recognised combinations still need `preventDefault` in other engines even though WebKit on a Mac showed no default for them | Pitfall 2, Patterns 6 | Only a newline typed into the instruction in an engine that inserts one; calling `preventDefault` is harmless |
| A3 | Phone widths: an iPhone SE in landscape is about 667 and larger iPhones in landscape exceed 724 | Pitfall 7 | The width-crossing question (Open Question 5) matters less or more than described; no code depends on the figure |
| A4 | None of the twelve baseline walk scenarios renders a pen step or the editor, so the Phase 11 walk baseline will not move | Walks and gates | A DIFF appears and the baseline is re-recorded through `11-walk-record-base.sh` with a trace; the plan already allows for it. This is a claim from reading the scenario list and grep, not from a run |
| A5 | The Xcode Simulator is still available as at round one | Environment | The optional phone evidence from mobile Safari drops out; no device row depends on it (D-14) |
| A6 | Mark's List was not read this session (no `ArtifactData`); rows named in the contract (`look-p12-phone-entry-points`, `decide-p12-desk-page-words`, `look-p12-pen-preview-step`, `look-p12-row-controls-r3`, `adoajjb9sgzbezmyrt4s`, `check-p11-ipad-…`) are taken from the README, ROADMAP and VERIFICATION | PROOF-02 | The orchestrator reads the list before writing rows and before closing `adoajjb9sgzbezmyrt4s` |

## Open Questions

Each is listed for a decision; none is resolved here. Where a recommendation is given it is Claude's reading, not Mark's.

1. **May a batch or a tasting be recorded below 724 while a Next version draft is held? (CONTRACT section 9, bullet 5; the data-loss path)**
   - What we know: the band line is drawn with the record act staying. The drafts store holds one record per version id; `plan`, `record` and `amend` are one family; a record or amend write overwrites a plan record and a saved batch deletes the family (Pitfall 5; `db.js:61-62`, `draft.js:557-562`, `repository.js:468-496`, `RecipePage.jsx:115-125`). Today the held plan draft reopens its pen on load, so the record act is blocked; below 724 the pen stays shut, so the act is open. The phone's one named job is Record tasting, and a tasting is recorded on the version that holds the batch, which is the version a Next version draft was started on.
   - What's unclear: whether Mark wants (A) the record act left out while a plan draft is held (the band would read Print sheet and the line; contradicts the drawn board, and takes the phone's tasting job away on that version), (B) the board as drawn with the draft silently lost, (C) the board as drawn with the record and tasting pens persisting nothing while a plan draft is held and a saved batch leaving the plan draft alone (needs the writer to scope its delete and write to `record` and `amend` kinds; a larger change in the risky cluster), or (D) the board as drawn with the pen refusing to open and saying why in the page notice.
   - Recommendation: not B. Put it to Mark as a `decide` row with options and `recommended` on C if its cost is acceptable, else A; the plan for Wave A waits on it (the roadmap's "Gate 2 met" covers the drawing, not this).
2. **The band's draft line, other cases.** Drawn: the draft's own version, plain text, "Draft: Version 2 · less cream. Finish it at the desk or on the iPad." Not drawn: a draft kept on **another** version of the recipe, which today reads "Draft: <link to that version>" (`VersionRow.jsx:369-373`) and at ≥724 still should. Recommendation: below 724 give both cases the same sentence and drop the link only for the own-version case; confirm with Mark or Sid.
3. **Home's tasted lead and Adapt.** CONTRACT section 3: a tasted row "has no action (its `span.home__actions` is not in the markup)", "The lead block loses Next version the same way; Keep developing and Adapt, which only open the recipe page, are as built." The `TASTED` branch of `RowActions` holds Next version **and** Adapt in one span, serves lead and rows alike (`RecipeList.jsx:231-241`, `:184`, `:282`), and the board draws no tasted lead. Does a tasted row also lose Adapt, and does a tasted lead keep it? Recommendation: the row loses the whole span (as drawn); the lead keeps Adapt alone; confirm.
4. **The Notebook row of a recipe with a kept edit, below 724.** Not drawn. PRODUCT.md lists Resume editing as left out; `NotebookPlace.jsx:330-336` draws it, with the `nb__row--resume` class (`shell.css:415-418`). Recommendation: leave the button out and drop the class; confirm, since no board shows it.
5. **Crossing 724 mid-session.** (a) A held plan draft whose restore was skipped at a narrow mount is not restored when the window widens (the restore is once per page instance); (b) an open pen stays open when the window narrows; (c) `DeskOnly` swaps the editor for the page in place and back. Recommendation: (a) make the restore decision follow the width once more (restore when the page widens with a held plan draft and no pen open), (b) leave open pens alone, (c) as built by the wrapper; confirm (a).
6. **Where Preview step sits in the pen's open step when a purpose or an aside is written.** CONTRACT section 7: "one line under its two fields and before its uses line". The pen's order is open fields → purpose field → aside field → uses line, so "under its two fields" and "before its uses line" differ once a purpose or aside is written. Recommendation: directly before the uses line, after the written purpose and aside, so the preview can show them and the line stays the group's last stop as in the editor; confirm.
7. **The `mk-keys` lines when there is nothing to key.** Drawn: one line under each heading with steps and rows on the page. Not drawn: the Instructions heading with no step (a heading row alone), the Ingredients heading with no row, and the Ingredients heading while the picker is open (the heading's Add ingredient is away then; `IngredientsHead` builds its head row only when `act` is set, `IngredientTable.jsx:497-504`). Recommendation: show each line only when its region has at least one step or row, and keep the Ingredients line while the picker is open; confirm.
8. **Keys in the other step fields.** CONTRACT section 6 names a step's lead-in and instruction and a row's grams only. The target label and value, purpose, aside, Name, Version name fields get no key. Recommendation: literal reading; the line "In a step: …" says "in a step", which a maker may read as any field of the step; confirm with Mark.
9. **Add ingredient on a row, the open picker.** (a) Cancel from a picker opened by a row: focus to that row's Add ingredient (the opener; the chooser's Cancel does this: `IngredientTable.jsx:877-880`) or to the heading's (as `handleCancelPicker` does today); (b) while the picker is open, do the rows' Add ingredient buttons stay (pressing another re-anchors and refocuses Name) or go, like the heading's; (c) Cmd+Return in a row's grams while the picker is open. Recommendation: (a) the opener, (b) stay and re-anchor, (c) same as the button; confirm.
10. **Keyboards with no Cmd key** (CONTRACT section 9, bullet 4: "not drawn and not decided, beyond Ctrl+Return for add"). Confirm the plan adds nothing for move on such a keyboard.
11. **Key repeat.** Ignore `event.repeat` for add (Pitfall 3); allow it for move. Not in the contract; Claude's recommendation.

## Sources

### Primary (HIGH confidence)
- `.planning/phases/12-…/12-CONTEXT.md` (D-04 to D-13), `12-VERIFICATION.md`, `12-08-SUMMARY.md`, the round-one part of this file.
- `.planning/sketches/016-entry-points-pen-preview-row-controls/CONTRACT.md` and `README.md`; the board files `recipe-head-below-724.html`, `notebook-home-more-393.html`, `one-line-page.html`, `pen-preview-step.html`, `row-controls.html` (markup extracted with Python; the step and ingredient-row markup, the pen panels, the Places panels and the `.mk-keys` rule were read). `.planning/sketches/014-steps-structure-save/CONTRACT.md`.
- `.planning/ROADMAP.md` (Phase 12, Design gate 2), `.planning/REQUIREMENTS.md` (sections, traceability, coverage 31), `.planning/STATE.md` was not opened (not needed for round two's code), `PRODUCT.md` "On the phone", `.planning/config.json`.
- Code read this session: `useBelowDesktop.js`, `router.jsx`, `Placeholder.jsx`, `CreationRoute.jsx`, `EditRoute.jsx`, `Shell.jsx`, `NotebookPlace.jsx`, `RecipeList.jsx`, `VersionRow.jsx`, `RecipePage.jsx`, `useKeptDraft.js`, `useRouteIntents.js`, `CreationPage.jsx`, `CreationSteps.jsx`, `IngredientTable.jsx` (sections), `IngredientPicker.jsx`, `Method.jsx`, `StepReading.jsx`, `oneLineField.js`, `Button.jsx`, `tabindex-scan.test.js` (head), `domain/creationSteps.js`, `domain/creation.js` (addRow, removeRow, imports), `domain/draft.js` (`draftFamily`), `domain/firstVersion.js`, `store/repository.js` (drafts), `styles/shell.css`, `styles/tokens.css` (the three tokens), the test files named in "Tests, walks and board checks".
- `app/node_modules/react-dom/cjs/react-dom-client.development.js:17979-18030` (the commit-phase focus and selection restore) [CITED: react-dom 19.2.8 source in this repo].
- Probes run this session in Playwright WebKit against a scratch build of HEAD (`npm --prefix app run build -- --outDir <scratchpad>/dist`, served through `08-walk-server.mjs`): `focus-probe.mjs` (keyed step moves, four trials, plus `Meta+Enter` and `Control+Enter` in the instruction and lead-in), `row-probe.mjs` (keyed row moves, two trials), `key-probe.mjs` (default caret behaviour of four combinations). They live in the session scratchpad (`/private/tmp/claude-501/-Users-mark-Documents-projects-sprinkles/b024880d-9ca9-4ad5-a629-57780a2d83de/scratchpad/`), are not durable, and were not added to the repo; the planner should rebuild them as the keys-and-caret probe. Device-unverified.

### Secondary (MEDIUM confidence)
- Sid's own measures in the 016 README ("Measured": Tab counts 41 built, 45 drawn; the Tab walk on the board markup) and `p12g2-measure.mjs`; Playwright WebKit and Chromium on a Mac, on board markup.

### Tertiary (LOW confidence)
- Phone widths in Pitfall 7 and A3 (training knowledge, not looked up).

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH, no new packages; versions read from `app/package.json`.
- Architecture (gating, restore change, regroup, `addRowAfter`, keys): HIGH, every site read; the one new mechanism (keyed-move caret) measured.
- Pitfalls: HIGH for the measured ones (focus and caret, key defaults, draft family); MEDIUM for the iPad-facing ones (A1 to A3).
- Walk baseline unaffected: MEDIUM (A4, from reading, not a run).
- Open Question 1 is the one item whose answer changes the design, not only its cost.

**Research date:** 2026-11-21
**Valid until:** 2026-12-05, or until any `app/` commit touches the files in "What the code does now" or sketch 016 changes.

