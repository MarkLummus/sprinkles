---
status: diagnosed
trigger: "G-03.3.1-4 — The tasting read view's caption ('Tasting') carries a summary span that repeats every marked axis's word-and-number token (e.g. 'soft (2) · gummy (4) · smooth (4) · less (2) · thin (2) · strong (4)'), and the same tokens then render again immediately below as the per-axis cells in a better-looking layout. User wants the caption's duplicate hint dropped, the axes below kept as-is."
created: 2026-09-13T00:00:00Z
updated: 2026-09-13T00:00:00Z
---

## Current Focus

hypothesis: confirmed — see Resolution
test: read TastingReading() in app/src/ui/BatchRow.jsx end to end, cross-check against its own test file
expecting: n/a — root cause confirmed
next_action: n/a — diagnose-only, return to caller

## Symptoms

expected: "The tasting read view's axis-value wording (plain anchor vs. leaning word) is settled and the section caption does not duplicate the hint shown by the axes below it."
actual: "The tasting section caption has the same dimensions as the hint: 'Tasting · soft (2) · gummy (4) · smooth (4) · less (2) · thin (2) · strong (4)' and then immediately below it are the axes showing the same values in a better looking layout."
errors: none (visual/content duplication, not a crash)
reproduction: Open a batch's read view (record pen, reading mode) for a batch with a tasting that has 2+ marked axes and a declared flaw. The `<h3>` caption reads "Tasting · {word} (n) · {word} (n) · ...", and the `.batch-row__cells` grid directly below repeats the identical "{word} (n)" tokens per axis.
started: introduced when TastingReading's summary line was built (phase 03.3.1, "the record reads as the battery" contract) — not a regression from a prior working state, a first-pass design choice now rejected by UAT

## Evidence

- timestamp: 2026-09-13T00:00:00Z
  checked: app/src/ui/BatchRow.jsx, function TastingReading (lines 210-236)
  found: |
    Line 211-216 builds the duplicate:
      const axes = axesForBatch(batch);
      const marks = batch.tasting.marks;
      const markedAxes = axes.filter((axis) => marks[axis.key] != null);
      const summaryTokens = markedAxes.map((axis) => `${readMarkWord(axis, marks[axis.key])} (${marks[axis.key]})`);
      if (batch.tasting.bitterDeclared) summaryTokens.push(DECLARED_FLAW.toLowerCase());
      const summaryLine = summaryTokens.join(' · ');
    Lines 223-226 render it inside the caption:
      <h3>
        Tasting
        {summaryLine && <span className="tasting-reading__summary"> · {summaryLine}</span>}
      </h3>
    Lines 230-236 render the SAME per-axis tokens again, independently, as the cell grid:
      <div className="batch-row__cells">
        {markedAxes.map((axis) => (
          <div className="batch-row__cell" key={axis.key}>
            <span className="batch-row__cell-label">{axis.name}</span>
            <span className="batch-row__cell-value">{`${readMarkWord(axis, marks[axis.key])} (${marks[axis.key]})`}</span>
          </div>
        ))}
        ...
    `markedAxes` and the per-cell "{word} (n)" string are computed independently of `summaryTokens`/`summaryLine` (duplicated expression, not a shared derived value) — the two renderings do not share code, only the same source data (`marks` via `readMarkWord`).
  implication: The caption's `summaryLine` (built from `summaryTokens`, lines 214-216) is the exact duplicate the user is rejecting. It is visually undifferentiated from the cell grid below — grep of app/src/styles/*.css for `tasting-reading__summary` or `tasting-reading` returns no rules, so the summary span inherits the `<h3>` sizing/weight, which is why the user describes it as having "the same dimensions as the hint" rather than reading as a lighter caption.

- timestamp: 2026-09-13T00:00:00Z
  checked: app/src/ui/BatchRow.test.jsx lines 798-830 (describe block for TastingReading)
  found: |
    Line 820-823 pins the exact behavior to remove:
      it('carries the tasting-head summary line: the marked axes\' tokens then the declared flaw\'s lowercase word, joined by " · "', () => {
        const markup = renderBatchRow({ openBatch: augustSecondBatch, batches: [augustSecondBatch], mode: 'reading' });
        expect(markup).toContain('<span class="tasting-reading__summary"> · more (4) · strong (4) · bitter</span>');
      });
    Line 825-830 already asserts the no-marks case renders a bare `<h3>Tasting</h3>` with no summary span — that assertion would become the universal case once the summary is dropped, not a special case.
  implication: Removing the caption's summary line requires updating/deleting this one test (line 820-823) plus the `describe`/comment block's framing (lines 195-209, 798-802) that documents the summary line as intended behavior — both currently encode the now-rejected design.

## Resolution

root_cause: |
  In app/src/ui/BatchRow.jsx's TastingReading() component, the `<h3>` section caption (lines 223-226) renders a `summaryLine` built at lines 214-216 from the exact same `markedAxes` + `readMarkWord(axis, marks[axis.key])` + stop-number data that the `.batch-row__cells` grid (lines 230-236) renders immediately below as individual axis cells. Both renderings are independently computed from `batch.tasting.marks` via the domain helper `readMarkWord` (app/src/domain/axes.js:71), so the caption is a plain-text restatement of the cells' content, and — because no CSS rule exists for `.tasting-reading__summary` (confirmed absent from app/src/styles/*.css) — it visually reads at the same weight/size as the cells' own layout, which is what the user means by "same dimensions as the hint."
fix: (not applied — diagnose-only mode)
verification: (not applicable — diagnose-only mode)
files_changed: []
