---
phase: 12
reviewers: [codex, opencode]
reviewed_at: 2026-11-16T03:44:54Z
plans_reviewed: [12-01-PLAN.md, 12-02-PLAN.md, 12-03-PLAN.md, 12-04-PLAN.md, 12-05-PLAN.md, 12-06-PLAN.md]
models:
  codex: "gpt-6.1-sol (reasoning=high)"
  opencode: "openrouter/google/gemini-4-argon#high"
model_sources:
  codex: "banner"
  opencode: "pinned"
plan_coverage:
  codex:
    total: 6
    missing: ["12-05"]
---

# Cross-AI Plan Review — Phase 12

<!-- gsd:plan-revision-conflicts:begin -->
## Plan-Revision Conflicts
<!-- gsd:plan-revision-conflicts:end -->

## Codex Review

**Verdict: revise before execution.** Gate 1’s scope and domain approach are sound, but several verification instructions would reject a correct implementation or leave gaps in the claimed proof.

1. **P1 — 12-01 specifies contradictory radio and ordering assertions.**  
   Task 1 requires a radio named exactly `2` inside both declared scales, although its goldilocks scale must retain `2: leaning thin`. It also requires all core scales before declared scales, while the desktop pen deliberately interleaves them in row-major order. See [12-01:127](/Users/mark/Documents/projects/sprinkles/.planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-01-PLAN.md:127) and [BatchRow.jsx:249](/Users/mark/Documents/projects/sprinkles/app/src/ui/BatchRow.jsx:249).  
   **Change:** use two magnitude scales for the duplicate-name test; test the mixed-kind labels separately. Preserve desktop ordering and assert declared scales’ relative order.

2. **P1 — 12-04 contains checks incompatible with the existing engine.**  
   The common log specification requires `.lf-srow`, `.lf-anchor`, `.lf-num` and `.lf-mid` on the Batch log, which contains none. The engine rejects empty board matches even for count checks. Its proposed negative self-test also expects `count` when a missing board element actually produces `undeclared`. See [12-04:146](/Users/mark/Documents/projects/sprinkles/.planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-04-PLAN.md:146), [BatchLogPage:118](/Users/mark/Documents/projects/sprinkles/app/src/ui/PrintLogPages.jsx:118) and [engine:345](/Users/mark/Documents/projects/sprinkles/.planning/phases/11-steps-structure-save-and-print/11-board-check.mjs:345).  
   **Change:** define separate Batch and Tasting element lists, declare genuine absences explicitly, and expect `undeclared` in that negative self-test.

3. **P1 — The log fixtures cannot match the required footer text.**  
   The boards substitute `Coffee · Version 1 · [Sheet code]` and equivalent Mint text. The planned injection changes only scales, problems and tasting data, leaving the Olive Oil identity and actual code. Exact `.lf-foot` comparison therefore fails independently of implementation correctness. See [board substitutions:32](/Users/mark/Documents/projects/sprinkles/.planning/canvas-generators/p12.py:32), [injection:27](/Users/mark/Documents/projects/sprinkles/.planning/canvas-generators/p12-capture.mjs:27) and [footer construction:16](/Users/mark/Documents/projects/sprinkles/app/src/ui/PrintLogPages.jsx:16).  
   **Change:** specify matching fixture metadata or explicit substitution of illustrative identity fields during comparison, while independently checking the actual stored Sheet code.

4. **P2 — 12-04 needs a complete panel-selector adaptation.**  
   The engine’s `.p4-win` assumption appears beyond its main reader: panel classification, evidence handling and stand-in self-test styling also use it. Extending only the named lookup leaves later stages broken. See [classification:647](/Users/mark/Documents/projects/sprinkles/.planning/phases/11-steps-structure-save-and-print/11-board-check.mjs:647), [evidence:610](/Users/mark/Documents/projects/sprinkles/.planning/phases/11-steps-structure-save-and-print/11-board-check.mjs:610) and [self-test styling:695](/Users/mark/Documents/projects/sprinkles/.planning/phases/11-steps-structure-save-and-print/11-board-check.mjs:695).  
   **Change:** carry one panel reference through lookup, measurement, `against`, screenshots and mutation styling; test those paths explicitly.

5. **P2 — 12-03’s comparison is narrower than its “every record” claim.**  
   The copied `dumpStores` reads only recipes, versions, batches and drafts; export carries eight stores. Library, machines, styles, scales and problems would escape the comparison. Also, requiring every B record to match A does not detect A records missing from B. See [dumpStores:280](/Users/mark/Documents/projects/sprinkles/.planning/phases/11-steps-structure-save-and-print/11-walk.mjs:280), [exportStore:793](/Users/mark/Documents/projects/sprinkles/app/src/store/transfer.js:793) and [12-03:144](/Users/mark/Documents/projects/sprinkles/.planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-03-PLAN.md:144).  
   **Change:** compare complete key sets and values in both directions for all eight exported stores. Check local drafts separately.

6. **P2 — The A1 veto path leaves dependent checks inconsistent.**  
   12-01 says reverting the editor change requires one function and four test strings. However, 12-06 also hard-codes the numbered editor line and requires that facet to fail on the base build. Honouring a veto without updating the probe would break the final gate. See [12-01:274](/Users/mark/Documents/projects/sprinkles/.planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-01-PLAN.md:274) and [12-06 Task 2](/Users/mark/Documents/projects/sprinkles/.planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-06-PLAN.md:129).  
   **Change:** settle the interpretation before execution, or enumerate every dependent expectation affected by a veto.

7. **P2 — Wave 1 already changes print behaviour indirectly.**  
   Changing `stopWordsFor` to return `null` at magnitude stop 3 changes `PrintLogPages` immediately, because it consumes that value directly. The handoff’s claim that print still shows “right” until 12-02 is inaccurate; the row-height correction arrives later. The bug is also scheduled to close before the final built-app probe runs. See [PrintLogPages.jsx:148](/Users/mark/Documents/projects/sprinkles/app/src/ui/PrintLogPages.jsx:148), [12-01 handoff:289](/Users/mark/Documents/projects/sprinkles/.planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-01-PLAN.md:289) and [final probe timing:168](/Users/mark/Documents/projects/sprinkles/.planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-05-PLAN.md:168).  
   **Change:** describe the intermediate print state accurately and close the bug after its relevant final-build checks pass.

The strongest parts should stay: snapshot-based rendering matches [axesForBatch](/Users/mark/Documents/projects/sprinkles/app/src/domain/axes.js:34), real UI export/import exercises the actual [Shell handlers](/Users/mark/Documents/projects/sprinkles/app/src/ui/Shell.jsx:408), and deferring Gate 2 and PROOF-02 correctly follows [D-06](/Users/mark/Documents/projects/sprinkles/.planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-CONTEXT.md:30). Long-word overflow should remain an explicit unresolved acceptance risk until its report is reviewed.

Source inspection and parsed board HTML support these findings. The selected axes, AxisMark and PrintLogPages tests passed. WebKit aborted at launch, so browser verification remains unconfirmed. No project files were changed.


---

## OpenCode Review

## 12-01

### 1. Summary
Plan `12-01` introduces kind-aware scale presentation in `app/src/domain/axes.js` (`stopWordsFor`, `stopLabelFor`, `middleWordFor`, and `readMarkText`) and wires them into the record pen (`app/src/ui/AxisMark.jsx`), the batch reading (`app/src/ui/BatchRow.jsx`), and the creation editor's scale stops preview (`app/src/domain/creation.js`), addressing `TASTE-04` and decisions `D-01` through `D-03`. The boundary between pure domain logic and UI consumers is clean, backward compatibility for `goldilocks` and unknown/missing kinds is preserved, and the snapshot immutability rule (`axesForBatch`) is explicitly guarded.

### 2. Strengths
- **Single-source kind branching in the domain (`app/src/domain/axes.js:29-31, 74-78`):** Centralizing `isMagnitude(axis)` inside `stopWordsFor`, `stopLabelFor`, `middleWordFor`, and `readMarkText` prevents UI components (`app/src/ui/AxisMark.jsx:40, 105, 113-117` and `app/src/ui/BatchRow.jsx:310`) from branching on `axis.kind` directly, enforced by negative grep guards in the acceptance criteria.
- **Exhaustiveness invariant against `SCALE_KINDS` (`app/src/domain/catalog.js:18`):** Requiring `app/src/domain/axes.test.js` to assert that its kind-keyed expected-output table matches `SCALE_KINDS` (`['goldilocks', 'magnitude']`) ensures any future scale kind added to `catalog.js` will immediately fail unit tests until its presentation is defined.
- **Preservation of batch snapshot isolation (`app/src/domain/axes.js:42-44`, `app/src/ui/BatchRow.jsx:292`):** `TastingReading` continues to read scale definitions exclusively from `axesForBatch(batch)` (`batch.snapshot.coreScales` and `batch.snapshot.declaredAxes`), and Task 2 adds a test where the live `version.declaredAxes` disagrees with `batch.snapshot.declaredAxes` on `kind` to verify stored marks never shift presentation when a version changes.
- **Clean flex layout behavior on the anchors row (`app/src/ui/AxisMark.jsx:113-117`):** Because `.axis-mark__anchors` already uses `display: flex; justify-content: space-between`, omitting the middle `<span>` when `middleWordFor(axis)` returns `null` places the two remaining `<span>` elements at the left and right ends of the 216 px (or narrow) track without any CSS rules or `:nth-child` selectors breaking.

### 3. Concerns
- **[LOW] Out-of-range stop inputs to `stopLabelFor` (`app/src/domain/axes.js:29-31`):** In RESEARCH Pattern 1, `stopLabelFor(axis, stop)` indexes `stopWordsFor(axis)[stop - 1]` and checks `word === null ? `${stop}` : `${stop}: ${word}``. If an out-of-range `stop` yields `undefined`, `word === null` is `false` and it would return `"6: undefined"`. Checking `word == null` (nullish) instead of `word === null` makes `stopLabelFor` resilient to any unexpected stop index.
- **[LOW] Flagged assumption A1 on `scaleStopsLine` (`app/src/domain/creation.js:305-310`):** Today `scaleStopsLine` already branches on `scale.kind === 'magnitude'` and returns `` `${scale.low} to ${scale.high}` ``, pinned at `app/src/domain/creation.test.js:445, 452` and `app/src/ui/CreationSetup.test.jsx:309, 416`. Changing this to `'faint · 2 · 3 · 4 · strong'` matches `D-01` and `.planning/sketches/015-own-scales-and-problems/CONTRACT.md` §4, and the plan properly isolates this in Task 3 so it can be reverted in one commit if vetoed by Mark.

### 4. Suggestions
- In `app/src/domain/axes.js`, write `stopLabelFor` using a nullish check (`word == null ? `${stop}` : `${stop}: ${word}``) and derive `scaleStopsLine` in `app/src/domain/creation.js:305-310` directly via `stopWordsFor(scale).map((word, i) => word ?? `${i + 1}`).join(' · ')` for both `goldilocks` and `magnitude` so `creation.js` does not duplicate stop-numbering logic.

### 5. Risk Assessment
- **Risk Level: LOW** — All changes in `12-01` are pure domain functions and small JSX text/attribute updates with comprehensive unit and static-markup test coverage and zero storage schema changes.

---

## 12-02

### 1. Summary
Plan `12-02` updates `app/src/ui/PrintLogPages.jsx`, `app/src/styles/print.css`, and `app/src/styles/tokens.css` so that printed `Low to high` scales omit `span.lf-anchor.lf-mid`, every printed `.lf-sc` row holds a 36 px height via an explicit second grid row, and the two printed log pages take a 1 in clipboard drop (`96px` on screen and non-WebKit print, `90px` in WebKit print) offset by reducing the ruled notes lines from 14 to 13 (`BatchLogPage`) and 5 to 4 (`TastingLogPage`). It also builds `12-print-check.mjs` and records `LOG-01` and the split Design Gates 1 and 2 in `.planning/REQUIREMENTS.md` and `.planning/ROADMAP.md`.

### 2. Strengths
- **Exact compliance with CSS token and media gates (`app/src/styles/print.test.js:97-115`, `app/src/styles/tokens.test.js:83-95`):** Using `grid-template-rows: auto calc(var(--sheet-size-small-print) * var(--sheet-print-leading-solid))` on `.lf-sc` (`app/src/styles/print.css:326-333`) and declaring both `--sheet-print-clipboard-drop: 96px` and `--sheet-print-clipboard-drop-webkit: 90px` in `app/src/styles/tokens.css:557` satisfies `print.test.js`'s zero-unit-literal rule (`LENGTH.test(sansVars(value))`) and `tokens.test.js`'s zero-unread-token rule.
- **Engine-specific print drop matching the content-box pattern (`app/src/styles/print.css:486-493, 899-907`, `app/src/ui/PrintSheet.jsx:134`):** Scoping `@media print` rules to `.print-pages--webkit .print-page--log` (`90px`) and `.print-pages--other .print-page--log` (`96px`) while leaving `.print-page--sheet` at `padding: 0` cleanly accounts for WebKit's `1 CSS px = 0.8 pt` scaling (`90 * 0.8 = 72 pt = 1 in`) without affecting bench sheet pages (`D-16`).
- **Source-pin awareness (`app/src/ui/PrintLogPages.test.jsx:171-187`):** Replacing `stopWordsFor` with `middleWordFor` in `app/src/ui/PrintLogPages.jsx:1, 148` preserves `axesForVersion(version, catalog)` and `problemNames(catalog.problems)`, which `PrintLogPages.test.jsx:184-185` pins by reading `PrintLogPages.jsx` source text.

### 3. Concerns
- **[MEDIUM] `fit` and `worst` inline style reset in `12-print-check.mjs` interacts with the new `@media print` specificity (`app/src/styles/print.css:899-904`, `.planning/canvas-generators/p12-capture.mjs:51-53`):** Task 1 instructs `12-print-check.mjs` to measure `fit` "as `p12-capture.mjs` `printFacts` measures it". In `.planning/canvas-generators/p12-capture.mjs:51-52`, `printFacts` ran under screen media and set `pg.style.padding = '0'; pg.style.paddingRight = '2px';` so that `body.getBoundingClientRect().height + 16 + foot.getBoundingClientRect().height` measured the unpadded content height at `630px` and `672px` against `810` (`900 - 90`) and `864` (`960 - 96`). That works because `body` (`.lf-body`) and `foot` (`.lf-foot`) are children *inside* `.lf` inside `pg` (`.print-page--log`), so `pg`'s `padding-top` does not add to `body.getBoundingClientRect().height`. However, if `12-print-check.mjs` runs `fit` while `page.emulateMedia({ media: 'print' })` is active, setting `pg.style.padding = '0'` first and then `pg.style.paddingRight = '2px'` is fine (inline styles override `.print-pages--webkit .print-page--log`), whereas restoring `pg.style.cssText = keep[0]` afterward must not leave mutated inline styles before subsequent facets run.
- **[LOW] Anchor overflow detection in the `worst` facet (`app/src/styles/print.css:326-342, 349-371`):** In `.lf-sc`, `.lf-lo` is `grid-column: 1; justify-self: end` (`76px` column, `--sheet-print-scale-word-col`) and `.lf-hi` is `grid-column: 9; justify-self: start` (`76px` column) with `white-space: nowrap` (`app/src/styles/print.css:340`). Because a CSS grid item with `white-space: nowrap` and default `min-width: auto` expands its own bounding box (`getBoundingClientRect().width > 76`) to fit the text `'barely there at all'` / `'overwhelmingly nutty'` while overflowing the `76px` track (`--sheet-print-scale-word-col`), checking "whether any `.lf-anchor`'s box runs past its grid column" in `12-print-check.mjs` (`worst` facet) should compare `anchor.getBoundingClientRect().width > 76` (or compare `.lf-lo`'s left edge against `.lf-sc`'s left edge and `.lf-hi`'s right edge against `.lf-sc`'s right edge), rather than comparing the element's rect to itself.

### 4. Suggestions
- In `12-print-check.mjs`'s `worst` facet, check `anchor.getBoundingClientRect().width > 76` (and whether `.lf-lo.getBoundingClientRect().left < sc.getBoundingClientRect().left` or `.lf-hi.getBoundingClientRect().right > sc.getBoundingClientRect().right`) to accurately report horizontal overflow of `.lf-anchor` past its `76px` grid track.
- Run the `rows` and `drop` facets before `fit` and `worst` (which temporarily mutate `pg.style` and `lf.style`), or restore `cssText` in a `try / finally` block.

### 5. Risk Assessment
- **Risk Level: LOW** — The CSS and JSX changes are small, directly transcribed from the approved sketch 015 board (`printed-logs.html:4766-4768`), and guarded by existing stylesheet and markup test suites.

---

## 12-03

### 1. Summary
Plan `12-03` creates the standalone Playwright WebKit round-trip harness (`12-roundtrip.mjs` and `12-roundtrip-check.sh`) to satisfy `PROOF-01` and `D-10`: creating a recipe with both scale kinds (`goldilocks` and `magnitude`) and a custom problem in Profile A, verifying its print route, recording a batch that marks both scales and the problem, verifying the batch reading, exporting via the Shell's Export button, importing into a fresh Profile B via the hidden file input, and verifying field-by-field record equality, exact `buildFigures` output, Sheet code lookup, and deterministic repeatability across two runs.

### 2. Strengths
- **Gate 2 insulation (`12-03-PLAN.md` Truth 6, `.planning/phases/11-steps-structure-save-and-print/11-walk.mjs:983-1015`):** Driving creation strictly through section-heading actions (`.ingredient-table-region .mk-head-act`, `.method-region .mk-head-act`, `Add scale`, `Add problem`, and `Add {name} to a step`) without touching per-row `Move up`/`Move down` or the `More` menu ensures Gate 2's upcoming row-control reorder and `<724` entry-point changes will not break `12-roundtrip.mjs`.
- **Real UI export/import exercise (`app/src/ui/Shell.jsx:408-419, 601-609`):** Using `page.waitForEvent('download')` on the Export button (`handleExport`) and `page.setInputFiles('.shell__file-input', ...)` on the hidden file input exercises `exportStore`, `validateStoreFile`, `importStore`, and `storeRevision` remounting end to end in WebKit rather than bypassing the UI.
- **Byte-for-byte determinism check (`12-roundtrip-check.sh`):** Running `12-roundtrip.mjs` twice under a fixed clock (`FIXED_ISO`) and counted `crypto.randomUUID` and comparing the `--out` dumps with `cmp` prevents flaky timestamps or nondeterministic IDs.

### 3. Concerns
- **[HIGH] `openRecordPen` selector mismatch on a newly created recipe with zero batches (`app/src/ui/BatchRow.jsx:1335-1339` vs `.planning/phases/11-steps-structure-save-and-print/11-walk.mjs:490-492`):** The `<interfaces>` block in `12-03-PLAN.md` (line 53) instructs the executor to copy `openRecordPen` from `11-walk.mjs:490-512`. In `11-walk.mjs:490-492`, `openRecordPen` clicks `page.locator('.batch-row__record').first()`. However, in `app/src/ui/BatchRow.jsx:1335-1339`, when a version has **zero** batches (`batches.length === 0`, which is true for the newly created `Coffee` recipe in `12-roundtrip.mjs`), the button is rendered as:
  ```jsx
  <Button ref={recordButtonRef} className="notebook-action" onClick={() => onStartRecording()}>
    Record batch
  </Button>
  ```
  It does **not** have the class `.batch-row__record` (which only exists in the batch-row header when `batches.length > 0`, where the button says `"Record another"`). Copying `openRecordPen` verbatim from `11-walk.mjs:490` will time out waiting for `.batch-row__record`!
- **[MEDIUM] `exportedAt` timestamp in `exportStore` when comparing `--out` files across two runs (`app/src/store/transfer.js:798`):** In `app/src/store/transfer.js:798`, `exportStore` writes `exportedAt: new Date().toISOString()`. In `11-walk.mjs:122-145`, `newScenarioContext` installs `page.clock.setFixedTime(new Date(FIXED_ISO))` (or overrides `Date`). If `page.clock.setFixedTime` is used (which freezes `new Date()`), `exportedAt` will equal `FIXED_ISO` on both runs; if `page.clock.install({ time })` is used instead, `Date` ticks forward with wall-clock elapsed ms during the run, which would make `exportedAt` differ by a few milliseconds between run 1 and run 2 and cause `cmp` in `12-roundtrip-check.sh` to fail!
- **[LOW] Waiting for `versions` to load on `/search` before clicking `Find` (`app/src/ui/SheetCodeSearch.jsx:50, 112`):** In `SheetCodeSearch.jsx:50, 112`, the `Find` button starts with `disabled={versions === null}` until `repository.listVersions()` resolves in `useEffect`. In Task 2's Sheet code search check in Profile B, clicking `Find` before `disabled` clears will be a no-op.

### 4. Suggestions
- In `12-roundtrip.mjs`, define `openRecordPen` using `. p12-capture.mjs:72`'s role selector:
  ```js
  await clickUntil(page, () => page.locator('.notebook-log').getByRole('button', { name: /^Record (batch|another)$/ }).first(), PEN, 'open the record pen');
  ```
  rather than `page.locator('.batch-row__record').first()`.
- Ensure `newScenarioContext` uses `await page.clock.setFixedTime(new Date(FIXED_ISO))` (freezing `Date` at `FIXED_ISO`) so `exportedAt` in the exported JSON is identical across both runs of `12-roundtrip-check.sh`.
- On `/search`, wait for `.search__form button[type="submit"]:not([disabled])` before filling the Sheet code and clicking `Find`.

### 5. Risk Assessment
- **Risk Level: MEDIUM** — The `.batch-row__record` vs `Record batch` (`.notebook-action`) selector difference on a zero-batch version is a guaranteed timeout if copied unchanged from `11-walk.mjs:490`, and frozen time via `setFixedTime` is required for `cmp` on the exported JSON to succeed.

---

## 12-04

### 1. Summary
Plan `12-04` copies `11-board-check.mjs` to `12-board-check.mjs`, extending it with `panelSelector`/`panelIndex`, `attr` checks, and `appStyle`, and writes four board spec modules (`12-board-pen.mjs`, `12-board-reading.mjs`, `12-board-logs.mjs`, and `12-board-selftest.mjs`) to verify all 16 drawn panels of sketch 015 (`record-pen.html`, `reading.html`, `printed-logs.html`) against the built app in Playwright WebKit at 1366 and 393 with `--selftest` and `--evidence`.

### 2. Strengths
- **Strict separation of verification from app code (`12-04-PLAN.md` Prohibitions & Task 2):** Prohibiting edits to `app/`, loosening of the 1 px tolerance, or dropping failing elements guarantees that `12-04` is a genuine verification gate and routes any real divergence to a `--gaps` plan or Mark/Sid decision.
- **Anti-vacuous `--selftest` enforcement (`.planning/phases/11-steps-structure-save-and-print/11-board-check.mjs:687-706`):** Preserving the `1px` font-size mutation pass and the `selftest-blind` check ensures no panel can pass vacuously with only text/count checks.

### 3. Concerns
- **[HIGH] `.lf-foot` `text` mismatch on `two` (Coffee) and `one` (Mint chip) in `12-board-logs.mjs` (`.planning/canvas-generators/p12.py:32-36, 163` vs `.planning/canvas-generators/p12-capture.mjs:22-24, 27-30`):** Task 2 (line 113) specifies for `12-board-logs.mjs`:
  > "elements .lf-title (box: its top is 144 px below the page top), .lf-line (count, box), .lf-srow (count, box), .lf-anchor (count, text, box), .lf-num (count, text), `.lf-srow .lf-mid` (count) and **.lf-foot (box, text)**."
  However, inspect `.planning/canvas-generators/p12.py:32-36, 163`: when generating `printed-logs.html`, `p12.py` replaced the `.lf-foot` text on the `two` (Coffee) and `one` (Mint chip) pages with synthetic strings:
  - `'Coffee · Version 1 · [Sheet code] · Side 1 of 2'` (`printed-logs.html:4775`)
  - `'Coffee · Version 1 · [Sheet code] · Side 2 of 2'` (`printed-logs.html:4776`)
  - `'Mint chip · Version 1 · [Sheet code] · Side 2 of 2'` (`printed-logs.html:4777`)
  Meanwhile, `12-cases.mjs`'s `inject` (copied from `p12-capture.mjs:27-30`) only mutates `v.declaredAxes` and `v.declaredFlaws` on `olive-oil-ice-cream-v1`, leaving `v.sheetTitle` as `'Olive Oil Ice Cream'` and `v.sheetCode` as `'64JH-G408'`. Thus in the app, `.lf-foot` renders `'Olive Oil Ice Cream · Version 1 · 50 g oil · 800 g · 64JH-G408 · Side 1 of 2'`. If `12-board-logs.mjs` includes `'text'` on `.lf-foot` for the `batch`, `tasting-two`, and `tasting-one` panels (without rewriting `.lf-foot` in `steps` or restricting `.lf-foot` `'text'` to the `none` / Mexican Chocolate panel where `CASES['none']['foot'] = None`), `12-board-logs.mjs` will **FAIL** on `.lf-foot[0] text`, and under Task 2's rules the executor is forbidden from dropping `'text'` once specified!
- **[HIGH] Same-page `panel.against` mutation bug during `--selftest` (`11-board-check.mjs:378-389, 658-659, 678, 693-706`):** Task 2 (line 115) instructs `12-board-selftest.mjs` to define "a panel held against its own board panel by `against` (every check passes)". In `11-board-check.mjs:378-389`, `openBoard(boardPath)` caches one `Page` per board file in `boardPages`. When `spec.board` and `panel.against.board` are the **same** board file:
  1. `boardPage` and `other.page` are the exact same Playwright `Page` object.
  2. In `11-board-check.mjs:695`, `const css = panel.against ? \`.p4-win.${panel.against.id} *{font-size:1px !important}\` : '*{font-size:1px !important}';` first hardcodes `.p4-win.${panel.against.id}` (which matches nothing on sketch 015 boards).
  3. Even if updated to use `panelSelector`, if a panel is held against *itself* on the same `boardPage`, injecting `font-size: 1px !important` into `other.page` and then calling `const [b2, a2] = await read()` (`11-board-check.mjs:699`) re-reads **both** `b2` and `a2` from the same mutated DOM element! Because both `b2` and `a2` shrink identically to `1px`, `compareData(quiet, panel, kind, b2, a2)` finds zero differences (`quiet.failed === 0`), causing `--selftest` to **FAIL** with `FAIL selftest <label>: the 1 px font run produced no FAIL`!
- **[MEDIUM] Native `querySelectorAll` anchor selector for `12-board-logs.mjs` (`11-board-check.mjs:195`, `app/src/ui/PrintSheet.jsx:160-169`, `printed-logs.html:4775-4778`):** Task 2 (line 113) says: `anchor .print-page--log holding the page title the panel draws`. In `11-board-check.mjs:195`, `root.querySelectorAll(cfg.anchor)` uses the browser's native DOM `querySelectorAll` (which does **not** support Playwright's `:has-text()` pseudo-class), and `anchors.length !== 1` is an immediate FAIL. In the app on `/print`, `.shell` contains **two** `.print-page--log` elements (Batch log and Tasting log), whereas on `printed-logs.html` each `.dl-page` contains **one** `.print-page--log` (and its parent `.print-route__picture` on the board does not carry `aria-label="Batch log"` / `"Tasting log"`). To match 1 element on both the board and the app using standard CSS in `querySelectorAll`, the Batch log panel must use `.print-page--log:not(:has(.lf-srow))` and the Tasting log panels must use `.print-page--log:has(.lf-srow)`.
- **[MEDIUM] Remaining `.p4-win` references in `11-board-check.mjs` (`lines 142, 610-616, 648, 695`):** `11-board-check.mjs` references `.p4-win` in four places: `GATHER` (line 142), `pictures` `anchoredFull` (lines 611, 616), `processPanel` `kind` detection (line 648), and `--selftest` CSS injection (line 695), plus `panel.against` (line 659) only passes `panelId: panel.against.id` instead of `{ id, panelSelector, panelIndex }`. All four sites plus `panel.against` must be updated in `12-board-check.mjs`.

### 4. Suggestions
- In `12-board-logs.mjs`, either check `checks: ['box']` on `.lf-foot` for the `two` and `one` panels and `checks: ['box', 'text']` on the `none` (Mexican Chocolate) panel (explaining in a comment that `p12.py:32, 163` replaces the foot text with `'Coffee · Version 1 · [Sheet code]'` on `two` and `one`), OR have `12-board-logs.mjs`'s `steps` hook set the board's example foot text on the app side after `data-print-ready="true"`.
- In `12-board-check.mjs` around line 699, reuse `b` from the initial `read()` (`compareData(quiet, panel, kind, b, a2)`) instead of re-reading `b2` after injecting the `1px` font style tag into `other.page`, and tag `other`'s resolved panel element with a temporary `[data-selftest-1px]` attribute so `[data-selftest-1px] * { font-size: 1px !important }` always targets `other`'s panel even when `panel.against` points to the same panel on the same board page.
- In `12-board-logs.mjs`, use `anchor: '.print-page--log:not(:has(.lf-srow))'` for the Batch log panel and `anchor: '.print-page--log:has(.lf-srow)'` for the three Tasting log panels so native `root.querySelectorAll(cfg.anchor)` matches exactly 1 element on both the board and the app.
- For `appStyle` in `12-board-logs.mjs`, note that `PrintSheet.jsx:159` sets `--sheet-print-picture-scale` as an inline `style` on `.print-route__pages`, so `appStyle` needs `.print-route__pages { --sheet-print-picture-scale: 1 !important; }` (`!important` is required to override the inline style).

### 5. Risk Assessment
- **Risk Level: HIGH** — Without addressing the synthetic `.lf-foot` text in `printed-logs.html` (`p12.py:32, 163`), the same-page `panel.against` `--selftest` mutation in `11-board-check.mjs:695-700`, and the native `querySelectorAll` selector for `.print-page--log`, `12-04` will hit immediate `FAIL`s during execution.

---

## 12-05

### 1. Summary
Plan `12-05` implements the remaining `D-14` Gate 1 checks (`12-safari-check.mjs` and `12-wkprint.swift`) and the unified Gate 1 runner (`12-check.sh`): printing the real `/print` route to PDF via macOS `WKWebView` (`12-wkprint.swift` + `pdf-pages.swift`) to verify one-page fit and the `1.5 in` (`100.8–115.2 pt`) ink top on the two log pages (plus reporting the `worst` long-words case), opening the record pen and reading in mobile Safari in the iOS Simulator (`< 724` width) to verify `Low to high` presentation and zero horizontal scroll, and running the full test suite, probes, round trip, and Phase 11 94-snapshot walk in one command.

### 2. Strengths
- **Verified PDF point math (`12-05-PLAN.md` Task 1, `.planning/canvas-generators/wkprint.swift:67-71`, `.planning/canvas-generators/pdf-pages.swift:32-39`):** With `WKP_MARGINS="36,36,54,54"` (`36 pt = 0.5 in` top margin) and `--sheet-print-clipboard-drop-webkit: 90px` at WebKit's `0.8 pt/px` print scale (`90 * 0.8 = 72 pt = 1.0 in`), the top border of `.lf-datebox` lands at `36 + 72 = 108 pt` (`1.5 in`) from the top of the 792 pt page, right in the middle of the plan's `100.8 to 115.2 pt` (`1.5 in ± 0.1 in`) check window, while the first sheet page lands at `~36–42 pt` (`<= 54 pt`).
- **Single-poll-loop guard in `12-wkprint.swift` (`.planning/canvas-generators/wkprint.swift:38-50`):** In `wkprint.swift:38`, `webView(_:didFinish:)` calls `poll()` on every navigation. Because `/p12-seed` navigates to `/notebook/.../print`, copying `wkprint.swift` to `12-wkprint.swift` and guarding `poll()` and `print_()` so they run once with a 240-try (`60 s`) cap prevents duplicate concurrent polling loops and double prints.
- **Complete regression coverage (`12-check.sh`):** Running `11-walk-check.sh` alongside the new Phase 12 checks ensures the 94 existing snapshots remain untouched.

### 3. Concerns
- **[HIGH] Polling `indexedDB.open('sprinkles')` in `/p12-seed` before the app boots can create a v1 storeless DB or block the v10 upgrade (`app/src/store/db.js:8, 83-104`, `12-05-PLAN.md` Task 1 lines 80-83):** Task 1 states:
  > "The seed page ... loads the case route in a hidden same-origin iframe so the app seeds its own store, polls the page's IndexedDB 'sprinkles' until the case's version record exists (every 200 ms, up to 30 s), runs inject for the case..."
  In a fresh `WKWebView` (`WKWebsiteDataStore.nonPersistent()`) or fresh Simulator profile, if the parent `/p12-seed` page calls `indexedDB.open('sprinkles')` (with no version argument) at `t = 0` or `200 ms` *before* the iframe's bundle executes `openDB('sprinkles', 10)` (`app/src/store/db.js:84`):
  1. `indexedDB.open('sprinkles')` creates `'sprinkles'` at version `1` with **no object stores**; calling `db.transaction('versions')` throws `NotFoundError`.
  2. Worse, if `/p12-seed`'s `IDBDatabase` connection does not immediately register `db.onversionchange = () => db.close()` and close itself in `finally`, the iframe's `openDB('sprinkles', 10)` will be **blocked** (`db.js:91`) and never finish seeding!
  Instead of polling `indexedDB.open('sprinkles')` while the iframe is still booting, `/p12-seed` should simply wait until the same-origin iframe's DOM contains `.notebook-log` (`iframe.contentDocument?.querySelector('.notebook-log')`), which proves the app has already opened `'sprinkles'` at version 10, seeded all stores, and loaded the version record!
- **[MEDIUM] In `sim` mode, the iframe must load/reload the case route *after* `inject` completes (`12-05-PLAN.md` Task 2 lines 110-114):** Task 2 says:
  > "The seed page's views pen and reading: after inject, it shows the case route in a full-viewport same-origin iframe (fixed, inset 0, no border, the whole window), waits for '.notebook-log' inside it, and drives the app inside the frame..."
  If `/p12-seed` reuses the hidden iframe that initially loaded the case route to seed the DB without reloading it (`iframe.contentWindow.location.reload()`) or creating a second iframe after `inject(c)` resolves, the React app inside the iframe will still hold the pre-`inject` `Olive Oil v1` state (`Oil` instead of `Coffee flavour`)!
- **[LOW] `MarkAxis` vs blank pen state in `sim` mode (`12-05-PLAN.md` Task 2 lines 112-119):** In `sim` mode for `view=pen`, Task 2 only asserts `Coffee flavour`'s anchors (`faint`, `strong`), stop `aria-label`s (`1: faint`, `2`, `3`, `4`, `5: strong`), and `Body`'s anchors (`thin`, `right`, `heavy`). Opening the record pen and clicking `Add tasting` is sufficient for those checks, just as in `12-stops-probe.mjs`.

### 4. Suggestions
- In `/p12-seed` (`12-safari-check.mjs`), wait for the hidden seeding iframe to render `.notebook-log` (`iframe.contentDocument?.querySelector('.notebook-log')`) before calling `inject(c)`. Never call `indexedDB.open('sprinkles')` before the app has created and seeded the v10 database.
- After `await inject(c)` completes in `/p12-seed`:
  - For `view=print`, navigate the top-level window (`location.replace(c.route + '/print')`).
  - For `view=pen` and `view=reading`, remove the hidden seeding iframe and mount a fresh full-viewport `<iframe src="${c.route}">` (or reload the iframe and wait for a fresh `.notebook-log` after reload) so the iframe's React tree reads the injected IndexedDB records.

### 5. Risk Assessment
- **Risk Level: MEDIUM** — The IndexedDB version-1 race and iframe reload ordering in `/p12-seed` are classic browser harness traps; waiting on the seeding iframe's `.notebook-log` before calling `inject` and loading the target view afterward eliminates both risks cleanly.

---

## 12-06

### 1. Summary
Plan `12-06` splits the shared test fixtures (`12-cases.mjs`) and the WebKit stops probe (`12-stops-probe.mjs`) out of `12-01` into a parallel Wave 1 plan that touches no files under `app/`. It builds the base commit into a scratch directory, runs `12-stops-probe.mjs` in `report` and `check` modes across the `pen`, `reading`, and `editor` facets to reproduce `bug-p11-low-to-high-scale-centre-mark` on the base build, and verifies that `check` fails on all three facets before `12-01` lands.

### 2. Strengths
- **Zero file overlap with `12-01` in Wave 1 (`12-06-PLAN.md` `files_modified`):** Splitting `12-cases.mjs` and `12-stops-probe.mjs` into `12-06` keeps `12-01` focused strictly on `app/src/` and allows both Wave 1 plans to execute in parallel worktrees without merge conflicts.
- **Self-verifying negative baseline (`12-06-PLAN.md` Task 2 `<verify>`):** Requiring `12-stops-probe.mjs check pen reading editor` to exit non-zero AND produce a `FAIL <facet>` line for every facet (`pen`, `reading`, and `editor`) on the base build proves the probe is not vacuously passing before `12-05` runs it as a positive gate on the final build.
- **Worktree fallback for sequential Wave 1 execution (`12-06-PLAN.md` Task 1):** Checking `git log --format=%H --grep='(12-01)' -- app` and creating a temporary detached worktree of the parent commit if `12-01` has already committed to the current branch ensures the base build is genuinely pre-`12-01` regardless of whether Wave 1 runs in parallel worktrees or sequentially.

### 3. Concerns
- **[MEDIUM] Text-node parent class check in the `editor` facet (`app/src/ui/Segmented.jsx:70-80`, `app/src/ui/CreationSetup.jsx:279-288`, `12-06-PLAN.md` Task 2 lines 95-96):** Task 2 states:
  > "report the card's `.mk-stops` text and every text node inside the Scales section that matches the word right (case-insensitive, whole word) with its parent element's class. check: `.mk-stops` reads 'faint · 2 · 3 · 4 · strong' and **no matching text node stands outside the Kind group's own option labels**."
  Inspect `app/src/ui/Segmented.jsx:70-80`:
  ```jsx
  <label key={option} className="segmented__option">
    <Radio ... />
    <span>{option}</span>
  </label>
  ```
  Inside the Kind segmented control, the option text `"Right in the middle"` is inside an unclassed `<span>` (`node.parentElement.tagName === 'SPAN'`, `node.parentElement.className === ''`) whose parent is `<label class="segmented__option">`. If `12-stops-probe.mjs` checks `node.parentElement.classList.contains('segmented__option')` instead of `Boolean(node.parentElement?.closest('label.segmented__option'))`, it will falsely fail `check editor` on the final build (`12-05` Task 3) by treating `"Right in the middle"` as standing outside the Kind group's option labels!
- **[LOW] `inject` handling of `CASES.worst` when `marks` and `ticks` are omitted (`.planning/canvas-generators/p12-capture.mjs:27-30`, `12-06-PLAN.md` Task 1 line 68):** In `p12-capture.mjs:29`, `inject` writes:
  ```js
  if (b.tasting) { b.tasting.marks = c.marks; b.tasting.declaredDefects = c.ticks; }
  ```
  For `CASES.worst`, Task 1 specifies `no marks` (and no ticks). If `c.marks` is `undefined`, `b.tasting.marks = c.marks` would set `b.tasting.marks` to `undefined` instead of `{}` (which would throw in `TastingReading` at `BatchRow.jsx:294` `marks[axis.key]` if a reading page were ever opened on `worst`). Using `b.tasting.marks = c.marks ?? {}; b.tasting.declaredDefects = c.ticks ?? [];` in `12-cases.mjs` keeps `inject` safe for all cases.

### 4. Suggestions
- In `12-stops-probe.mjs` (`editor` facet), test whether a text node matching `/\bright\b/i` is inside a Kind option label via `Boolean(node.parentElement?.closest('.segmented__option'))`, and when reporting its parent class, report `node.parentElement?.className || node.parentElement?.closest('[class]')?.className || ''`.
- In `12-cases.mjs`, default `marks: {}` and `ticks: []` on `CASES.worst` and guard `inject` with `c.marks ?? {}` and `c.ticks ?? []`.

### 5. Risk Assessment
- **Risk Level: LOW** — `12-06` touches only two new harness files in `.planning/phases/12-.../`, and the `.closest('.segmented__option')` check is a simple guard that prevents a false negative when `12-check.sh` runs in Wave 3.

---

## Cross-Plan Comparison & Overall Assessment

### Wave & Dependency Ordering
- **Wave 1 (`12-01`, `12-06`):** Truly independent (`files_modified` are disjoint: `app/src/**` vs `.planning/phases/12-.../12-{cases,stops-probe}.mjs`). `12-06` includes an explicit git-log fallback worktree mechanism if run sequentially after `12-01`.
- **Wave 2 (`12-02` depends on `12-01` & `12-06`; `12-03` depends on `12-01`):** `12-02` consumes `middleWordFor` from `12-01` and `12-cases.mjs` from `12-06`. `12-03` consumes `12-01`'s domain/UI changes and purposefully avoids asserting `12-02`'s notes-line counts or `.lf-mid` omission so `12-02` and `12-03` can run concurrently in Wave 2 without conflict.
- **Wave 3 (`12-04` depends on `12-01`, `12-02`, `12-06`; `12-05` depends on `12-01`, `12-02`, `12-03`, `12-06`):** Both Wave 3 plans modify only their own harness files in `.planning/phases/12-.../` and use distinct scratch directories (`dist-04`/`evidence-04` vs `dist-05`/`evidence-05` and `check-...`).

### Top Actionable Fixes Before Execution
1. **`12-03` (HIGH):** In `12-roundtrip.mjs`, do not use `.batch-row__record` from `11-walk.mjs:490` to open the record pen on the newly created recipe (which has 0 batches and therefore renders `<Button className="notebook-action">Record batch</Button>` per `app/src/ui/BatchRow.jsx:1336`); match `getByRole('button', { name: /^Record (batch|another)$/ })` instead.
2. **`12-04` (HIGH):** Account for `.planning/canvas-generators/p12.py:32-36, 163` having replaced `.lf-foot` text on `printed-logs.html` for `two` (`Coffee · Version 1 · [Sheet code]`) and `one` (`Mint chip · Version 1 · [Sheet code]`) while `12-cases.mjs`'s `inject` leaves `olive-oil-ice-cream-v1`'s `sheetTitle` and `sheetCode` intact. Also fix `11-board-check.mjs:695-700` when copying to `12-board-check.mjs` so a same-page `panel.against` stand-in does not mutate both `b2` and `a2` with `1px` font size during `--selftest`, and use `.print-page--log:not(:has(.lf-srow))` / `.print-page--log:has(.lf-srow)` for the log page anchors in native `querySelectorAll`.
3. **`12-05` (HIGH):** In `12-safari-check.mjs`'s `/p12-seed` page, wait for the hidden seeding iframe to render `.notebook-log` before calling `inject(c)` rather than polling `indexedDB.open('sprinkles')` while the app is still booting (which risks creating a v1 storeless DB or blocking the v10 upgrade in `app/src/store/db.js:84`), and reload/replace the iframe after `inject(c)` in `sim` mode.
4. **`12-06` (MEDIUM):** In `12-stops-probe.mjs`'s `editor` facet, use `node.parentElement?.closest('.segmented__option')` when checking whether the word `"right"` in `"Right in the middle"` (`app/src/ui/Segmented.jsx:79`, rendered inside an unclassed `<span>` child of `label.segmented__option`) belongs to the Kind option labels.


---

## Consensus Summary

Two source-grounded reviewers (Codex, gpt-6.1-sol; OpenCode, gemini-4-argon), both citing `file:line`. Both say the Gate 1 scope, the domain approach in 12-01 and the D-06 deferral of Gate 2 and PROOF-02 are sound, and both say the verification harnesses as written would fail on a correct build. Codex's verdict is "revise before execution"; OpenCode rates 12-04 HIGH, 12-03 and 12-05 MEDIUM, 12-01, 12-02 and 12-06 LOW. Codex did not write a section per plan (its findings are numbered and name the plans) and could not launch WebKit, so none of its findings is browser-confirmed. No finding here has been checked by the orchestrator against the source; the replan should confirm each before acting.

### Agreed Strengths
- Kind branching lives in the domain readers and the reading draws from the batch snapshot (`axesForBatch`), so stored marks do not move when a version changes.
- The round trip drives the real Export button and the real file input (`Shell.jsx` handlers), not a store shortcut.
- Deferring Gate 2 and PROOF-02 follows 12-CONTEXT D-06.

### Agreed Concerns
1. **12-04, HIGH: the log boards' footer text cannot match the app.** `p12.py` wrote `Coffee · Version 1 · [Sheet code]` (and the Mint chip equivalent) into the boards; the injected case leaves the Olive Oil title and its real Sheet code. An exact `.lf-foot` text check fails on a correct build, and the plan forbids dropping a check. Fix: matching fixture identity, or a declared substitution, with the stored Sheet code checked separately.
2. **12-04, MEDIUM: `.p4-win` is assumed all through the copied engine** (panel lookup, kind classification, evidence, `against`, the self-test's 1 px style), not only in the reader the plan names. One panel reference has to be carried through every stage.
3. **12-04: the self-test as specified cannot pass.** Codex: the negative self-test expects `count` where a missing board element yields `undeclared`. OpenCode: a panel held against itself on the same board page gets the 1 px mutation on both sides, so the mutation run reports no FAIL. Different mechanisms, same step.

### Raised by one reviewer (check before acting)
- **12-01 (Codex, P1):** Task 1 asks for a radio named exactly `2` in both declared scales although the Right in the middle scale keeps `2: leaning thin`, and asks for all core scales before declared ones although the desktop pen interleaves them in row-major order (`BatchRow.jsx:249`).
- **12-04 (Codex, P1):** the common log spec requires `.lf-srow`, `.lf-anchor`, `.lf-num`, `.lf-mid` on the Batch log, which has none, and the engine rejects empty board matches.
- **12-04 (OpenCode, MEDIUM):** the log anchor must be plain CSS matching exactly one element on board and app (`.print-page--log:has(.lf-srow)` and its negation); the picture scale needs `!important` over the inline style.
- **12-03 (OpenCode, HIGH):** `openRecordPen` copied from `11-walk.mjs:490` clicks `.batch-row__record`, which a version with no batches does not render (`BatchRow.jsx:1335`, "Record batch" is `.notebook-action`).
- **12-03 (Codex, P2):** the copied `dumpStores` reads four stores where the export carries eight, and compares B against A only, so a record missing from B passes.
- **12-03 (OpenCode, MEDIUM/LOW):** `exportedAt` needs a frozen clock for the `cmp`; wait for Find to enable on `/search`.
- **12-05 (OpenCode, HIGH):** the seed page polling `indexedDB.open('sprinkles')` before the app boots can create a storeless v1 database or block the v10 upgrade; wait for `.notebook-log` in the iframe instead, and load the view after `inject`.
- **12-06 (OpenCode, MEDIUM):** the editor facet's "right" filter must use `closest('.segmented__option')`; the option text sits in an unclassed span.
- **12-01/12-06 (Codex, P2):** a veto of A1 (the editor's stops line) also breaks 12-06's hard-coded editor expectation and its must-fail-on-base rule.
- **Wave 1 (Codex, P2):** `stopWordsFor` returning null at stop 3 changes the printed log as soon as 12-01 lands (`PrintLogPages.jsx:148`), so the handoff's "print still shows right until 12-02" is wrong; the row-height fix arrives a wave later. The bug row is also scheduled to close before the final built-app probe.
- **12-02 (OpenCode, MEDIUM/LOW):** restore inline styles after the `fit` and `worst` facets; measure anchor overflow against the 76 px track, not the element's own box.

### Divergent Views
- **12-01:** OpenCode rates it LOW with only a nullish-check suggestion; Codex finds two test assertions a correct implementation cannot satisfy. Worth resolving first, since 12-01 is the only plan that edits `app/`.
- **12-03:** each reviewer found a different defect (selector on a zero-batch version; comparison breadth). Neither contradicts the other.
