# Phase 12 (Gate 1): Pattern Map

**Mapped:** 2026-11-15
**Scope:** Gate 1 only (12-CONTEXT D-06, D-07). Gate 2 files are out of this round.
**Files analyzed:** 14 | **Analogs found:** 14 / 14 (most are edit-in-place; the analog is the file itself or its test)
**Tracked-source gate:** all analog paths below are git-tracked (`git ls-files` checked for axes.js, AxisMark.jsx, PrintLogPages.jsx, print.css, tokens.css, 11-walk.mjs, 11-board-check.mjs, 11-print-check.mjs). No mirror paths used.

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match |
|---|---|---|---|---|
| `app/src/domain/axes.js` | utility (pure domain) | transform | itself (`stopWordsFor`, `readMarkWord`) | exact |
| `app/src/domain/axes.test.js` | test | transform | itself (SEEDED_AXES cases) | exact |
| `app/src/ui/AxisMark.jsx` | component | request-response | itself, lines ~40, 105, 113-117 | exact |
| `app/src/ui/AxisMark.test.jsx` | test | transform | itself (104-114 anchors test) | exact |
| `app/src/ui/BatchRow.jsx` (line 310 only) | component | request-response | itself, `markGroup` in `TastingReading` | exact |
| `app/src/ui/BatchRow.test.jsx` | test | transform | itself (1528-1535) | exact |
| `app/src/ui/PrintLogPages.jsx` | component | transform | itself (`LogScaleRow`, `LogNotes`) | exact |
| `app/src/ui/PrintLogPages.test.jsx` | test | transform | itself (81-83, 101, 160-168) | exact |
| `app/src/styles/print.css` | config (print CSS) | transform | itself (`.print-page--log`, `.lf-sc`, content-w pair) | exact |
| `app/src/styles/tokens.css` | config | n/a | `--sheet-print-content-w-webkit` pair (555-570) | exact |
| `app/src/styles/print.test.js` | test | n/a | itself | exact |
| `app/src/domain/creation.js` `scaleStopsLine` (+3 tests) | utility | transform | itself (305-310); change only if Open Question 1 gets Mark's yes | exact |
| `.planning/phases/12-.../12-roundtrip.mjs` | test harness | request-response / file-I/O | `.planning/phases/11-steps-structure-save-and-print/11-walk.mjs` | role-match |
| `.planning/phases/12-.../12-board-check.mjs`, `12-print-check.mjs` | test harness | batch | `11-board-check.mjs`, `11-print-check.mjs` (same dir as 11-walk) | exact |

## Pattern Assignments

### `app/src/domain/axes.js` (utility, transform)

**Analog:** itself. Header comment (lines 13-18) names Phase 12 as the owner of the kind branch; update it when done.

Today (lines 29-31, 74-78):
```js
export function stopWordsFor(axis) {
  return [axis.low, `leaning ${axis.low}`, 'right', `leaning ${axis.high}`, axis.high];
}
export function readMarkWord(axis, stop) {
  if (stop <= 2) return axis.low;
  if (stop >= 4) return axis.high;
  return 'right';
}
```
Target (RESEARCH Pattern 1; default every non-`'magnitude'` kind to goldilocks):
```js
const isMagnitude = (axis) => axis.kind === 'magnitude';
export function stopWordsFor(axis) {
  if (isMagnitude(axis)) return [axis.low, null, null, null, axis.high];
  return [axis.low, `leaning ${axis.low}`, 'right', `leaning ${axis.high}`, axis.high];
}
export function stopLabelFor(axis, stop) {            // "1: faint", "2", "3", "4", "5: strong"
  const word = stopWordsFor(axis)[stop - 1];
  return word === null ? `${stop}` : `${stop}: ${word}`;
}
export function middleWordFor(axis) { return isMagnitude(axis) ? null : 'right'; }
export function readMarkText(axis, stop) {            // candidate A, decide-p12-low-to-high-read-back
  if (!isMagnitude(axis)) return `${readMarkWord(axis, stop)} (${stop})`;
  if (stop === 1) return `${axis.low} (1)`;
  if (stop === 5) return `${axis.high} (5)`;
  return `${stop} of 5`;
}
```
Keep `readMarkWord` exported unchanged. Keep `axesForBatch` / `axesForVersion` untouched (snapshot rule, lines 42-58). No framework/DOM/store import (domain convention).

### `app/src/ui/AxisMark.jsx` (component)

**Analog:** itself. Replace aria-label and make the middle anchor conditional.
Today (lines ~105, 113-117):
```jsx
aria-label={`${stop}: ${words[index]}`}
...
<div className="axis-mark__anchors" aria-hidden="true">
  <span>{axis.low}</span>
  <span>right</span>
  <span>{axis.high}</span>
</div>
```
Target: `aria-label={stopLabelFor(axis, stop)}` and `{middleWordFor(axis) !== null && <span>{middleWordFor(axis)}</span>}`. Anchors row is flex `space-between` (app.css 2070-2078), so no CSS change. Drop the now-unused `const words = stopWordsFor(axis)` (line 40) if nothing else reads it. Scope tests by the scale's `role="group"` (bare-number radios are not unique across scales, RESEARCH Pitfall 5).

### `app/src/ui/BatchRow.jsx` (component), `markGroup` in `TastingReading`

**Analog:** itself, line 310:
```jsx
<span className="batch-row__cell-value">{`${readMarkWord(axis, marks[axis.key])} (${marks[axis.key]})`}</span>
```
Target: `{readMarkText(axis, marks[axis.key])}`. Update the import (`readMarkWord` becomes `readMarkText` if unused elsewhere). The reading must keep getting axes from `axesForBatch(openBatch)` (snapshot), not the live version. "This recipe only" conditionality already exists (`groupAxes.length > 0 &&`); do not rebuild.

### `app/src/ui/PrintLogPages.jsx` (component, transform)

**Analog:** itself. Lines 147-166 `LogScaleRow`:
```jsx
const [, , middleWord] = stopWordsFor(axis);
...
<span className="lf-anchor lf-mid">{middleWord}</span>
```
Target: `const middleWord = middleWordFor(axis);` and `{middleWord !== null && <span className="lf-anchor lf-mid">{middleWord}</span>}`; swap the `stopWordsFor` import for `middleWordFor`. Update the comment at 140-146 ("the middle is right" only for goldilocks). Notes lines: `LogNotes ... lines={14}` (line 133) to `13`; `lines={5}` (line 203) to `4`. Add nothing else to the Batch log (790 of 810 px, Pitfall 1).

### `app/src/styles/print.css` + `tokens.css` (LOG-01 and the 36 px row)

**Analog:** the existing engine-class pair `--sheet-print-content-w-webkit: 630px` / `--sheet-print-content-w: 672px` (tokens.css 565-568), picked by `print-pages--webkit` / `print-pages--other` on the route (`PrintSheet.jsx:134`, `PrintSheetPages.jsx:29-32`).

Screen picture, today (print.css ~106-109):
```css
.print-page--log {
  padding: var(--sheet-print-margin-y) calc(var(--sheet-print-margin-x) + var(--sheet-print-guard))
    var(--sheet-print-margin-y) var(--sheet-print-margin-x);
}
```
Change the first value to `calc(var(--sheet-print-margin-y) + var(--sheet-print-clipboard-drop))`.

In `@media print`, after the existing `.print-page--log { padding: 0 var(--sheet-print-guard) 0 0; }` (~899-901), add:
```css
.print-pages--webkit .print-page--log { padding-top: var(--sheet-print-clipboard-drop-webkit); }
.print-pages--other .print-page--log { padding-top: var(--sheet-print-clipboard-drop); }
```
Next to `.lf-sc` (~326-333) add `grid-template-rows: auto calc(var(--sheet-size-small-print) * var(--sheet-print-leading-solid));` (keeps every scale row 36 px; bare row is 25 px).

Tokens beside `--sheet-print-name-pad` (tokens.css ~557), comment each with its engine as the content-w pair does:
```css
--sheet-print-clipboard-drop: 96px;        /* page picture and every engine but WebKit's print */
--sheet-print-clipboard-drop-webkit: 90px; /* the same inch in Safari's print (1 CSS px = 0.8 pt) */
```
Constraints: no second `@page`, no named page (WebKit ignores them); `@page` is the only place a unit literal is allowed (`print.test.js`); both new tokens must be read (`tokens.test.js`); `.print-page--sheet` untouched (D-16).

### Tests (pins that change; analog is each file itself)

- `PrintLogPages.test.jsx:81-83` 14 -> 13; `:101` 5 -> 4. Add: magnitude row has no `lf-mid`, has `lf-lo`/`lf-n1`/`lf-n5`/`lf-hi`, five ticks; goldilocks row keeps `lf-mid` "right". Add the markup-injection pin (copy lines 160-168 style) for a magnitude scale's name, low, high.
- `axes.test.js`: leave the SEEDED_AXES goldilocks assertions (137-158); add magnitude cases for `stopWordsFor`, `stopLabelFor`, `middleWordFor`, `readMarkText`, and missing/unknown kind falling back to goldilocks.
- `AxisMark.test.jsx`: keep 104-114 (soft/right/hard); add a magnitude mark: two anchor spans, labels `1: faint`, `2`, `3`, `4`, `5: strong`.
- `BatchRow.test.jsx`: keep 1528-1535; add a batch whose snapshot holds a magnitude scale: `faint (1)`, `2 of 5`, `strong (5)`. Extend the 2126 pin ("no This recipe only cue") to a created recipe with a magnitude scale only if cheap.
- `print.test.js`: add an assertion that the log pages take the drop and `.print-page--sheet` does not.
- `creation.js` `scaleStopsLine` (305-310) and tests `creation.test.js:441-445,452`, `CreationSetup.test.jsx:307-309,416`, `CreationFlow.test.jsx:1513`: change `faint to strong` to `faint · 2 · 3 · 4 · strong` ONLY after Mark says yes in chat (Open Question 1). The goldilocks join `stopWordsFor(scale).join(' · ')` is the style to match.

### `12-roundtrip.mjs` (harness, PROOF-01)

**Analog:** `.planning/phases/11-steps-structure-save-and-print/11-walk.mjs`. It is a top-level script, not importable, so copy these helpers: `newScenarioContext` (line 122; fixed clock, counted UUID, third-party requests aborted), `dumpStores` (280), `clickUntil` (320; first click after navigate misses), `makeVanilla` (973, creation driver). Seeded static server: `startServers({ appRoot })` from `08-walk-server.mjs`. Build into a scratch `--outDir`, never `app/dist`.
Extra steps over `makeVanilla` (RESEARCH "The D-10 round trip"): `Add scale` twice (Kind radios "Right in the middle" / "Low to high", `KIND_WORDS` in `CreationSetup.jsx:35`), `Add problem`, Save, print route under `emulateMedia({media:'print'})`, record batch marking the magnitude scale at 2 (scope the radio by group), Export via the `download` event, Import into a second fresh context via `setInputFiles('.shell__file-input', ...)`, then deep-compare recipes/versions/batches by id and recompute figures. Drive creation with heading controls only so Gate 2's reordered row controls cannot break it. Print PASS/FAIL lines, exit non-zero on any FAIL. Keep `11-walk-check.sh` as regression gate (`MATCH 94 snapshots`).

### `12-board-check.mjs`, `12-print-check.mjs` (harness)

**Analogs:** `11-board-check.mjs` (spec modules `{board, panels:[{id,width,route,seed,anchor,scope,elements,absent,frame,pageHeight,extraWidths}]}`, `--selftest`, `--evidence`) and `11-print-check.mjs` (waits on `.print-route[data-print-ready="true"]`, WKWebView PDF via `.planning/canvas-generators/wkprint.swift` and `pdf-pages.swift`). Copy, do not patch: the board reader hard-codes `.p4-win.${cfg.panel}`; make it a spec field for sketch 015 panels (`.fp-win.p12w-1366`, `.fp-win.p12w-393`, `.dl-page`). Seed with `.planning/canvas-generators/p12-capture.mjs` `CASES`/`inject`. Measure what the boards change: Low to high anchors (2 spans, faint 0-26.9, strong 177.1-216), aria names, reading text, printed row 36 px with no `.lf-mid`, log content starts 144 px from picture top, notes lines 13 and 4, no overflow at 393. Add a worst-case long-words probe (Open Question 2).

## Shared Patterns

### Kind branch lives only in `axes.js`
**Apply to:** AxisMark, BatchRow, PrintLogPages. Consumers call `stopLabelFor` / `middleWordFor` / `readMarkText`; no component tests `axis.kind` itself. Anything not `'magnitude'` reads as goldilocks (also the import-safety rule: `isScaleDefinition`, `catalog.js:53`).

### Snapshot, not live version
**Apply to:** reading and any recorded-batch view. `axesForBatch(batch)` reads `batch.snapshot.coreScales` + `declaredAxes` only (axes.js 42-44); blank log and new batch use `axesForVersion`. No stored shape or `DB_VERSION` change.

### Tokens and print rules
**Apply to:** print.css, tokens.css. Every value via a custom property; in-flow padding chosen by `print-pages--webkit` / `print-pages--other`; no non-print `@media` inside pages; new buttons/checkboxes via `ui/Button.jsx`, `Checkbox.jsx`, `Radio.jsx` (none expected this round).

### Text, not markup
**Apply to:** all rendered maker words. React text children only; no `dangerouslySetInnerHTML`.

### Verification engine
**Apply to:** all checks. Playwright WebKit coarse at 1366 and 393, WKWebView PDF for print (Chrome PDF is not proof), iOS Simulator for mobile Safari; scratch build only; no device row (D-14).

## No Analog Found

| File | Role | Data Flow | Reason |
|---|---|---|---|
| Cross-context export/import compare in `12-roundtrip.mjs` | harness | file-I/O | Phase 11's walk is one-context-per-scenario with a strict baseline compare; use `store/definition-roundtrip.test.js:136` ("imports into a fresh profile") as the semantic reference and RESEARCH steps 4-6 as the recipe |

## Metadata

**Analog search scope:** `app/src/domain`, `app/src/ui`, `app/src/styles`, `.planning/phases/10-*`, `.planning/phases/11-*`, `.planning/canvas-generators`
**Excerpts:** axes.js and PrintLogPages.jsx read directly this session; AxisMark.jsx, BatchRow.jsx, print.css, tokens.css line ranges taken from targeted reads and RESEARCH verified quotes (re-check exact line numbers when editing).
**Pattern extraction date:** 2026-11-15
