import { useEffect, useRef } from 'react';
import { computeBalance, formatShareOfBatch, formatGrams, formatGramsValue, formatPortionLine } from '../domain/composition.js';
import { asMadeForPortion, asMadeTotals } from '../domain/batch.js';
import { activeRows, isLineRemoved, isStepRemoved, rowGrams } from '../domain/rows.js';
import { orphanedRows } from '../domain/uses.js';
import { displayNumberOf } from '../domain/stepNumbers.js';
import { parseGramsDraft } from '../domain/lineage.js';
import { FieldFeedback } from './FieldFeedback.jsx';

// The id of the blocked line's sentence: one blocked line at a time, as the version
// line has one 'version-field-error'.
const BLOCKED_ROW_ERROR_ID = 'ingredient-field-error';

// The table's step-grouping (LD-01, ROADMAP Scope bullet 3): resolves
// every portion's step through the active stepNumberMap via
// displayNumberOf alone — never a hand-rolled filter mentioning `removed`
// (domain/rows.js's own discipline, extended here from rows to portions).
// A portion whose step is removed in `steps` forms one group of kind
// 'removed' for that step, headed 'Removed' with the step's lead-in, sorted
// at the step's own place in the method (after every active step that
// precedes it, before the next one), its entries flagged `stepRemoved`
// (sketch 011 decision 51, Mark's answer 2). A portion whose step does not
// resolve (a null map, or a step this map has no entry for) is never
// dropped: it joins one trailing "Unallocated" group instead (RESEARCH.md
// Pitfall 4). Active groups sort by display number, with Unallocated (when
// non-empty) always last; entries within a group keep `rows`' own iteration
// order, then portion order — never re-sorted, matching the sketch's own
// ING.forEach iteration (index.html:390-406).
//
// `rows` are the stored rows. A line that is out (its own flag, or its step
// removed) is skipped before any group is created for it, so no empty step
// head prints, unless `keepOutLines` is set: the pen and Show changes draw a
// line that is out, struck.
function groupPortionsByStep(rows, steps, stepNumberMap, keepOutLines) {
  const numbered = new Map();
  const removedSteps = new Map();
  const unallocated = [];
  for (const row of rows) {
    row.portions.forEach((portion, portionIndex) => {
      if (!keepOutLines && isLineRemoved(row, portion, steps)) return;
      const step = steps.find((candidate) => candidate.n === portion.step);
      if (isStepRemoved(steps, portion.step)) {
        if (!removedSteps.has(portion.step)) {
          removedSteps.set(portion.step, { kind: 'removed', n: portion.step, displayNumber: null, leadIn: step.leadIn, entries: [] });
        }
        removedSteps.get(portion.step).entries.push({ row, portion, portionIndex, displayNumber: null, stepRemoved: true });
        return;
      }
      const displayNumber = stepNumberMap ? displayNumberOf(stepNumberMap, portion.step) : null;
      const entry = { row, portion, portionIndex, displayNumber, stepRemoved: false };
      if (displayNumber == null) {
        unallocated.push(entry);
        return;
      }
      if (!numbered.has(displayNumber)) {
        numbered.set(displayNumber, { kind: 'numbered', n: portion.step, displayNumber, leadIn: step ? step.leadIn : '', entries: [] });
      }
      numbered.get(displayNumber).entries.push(entry);
    });
  }
  const methodIndex = (n) => steps.findIndex((candidate) => candidate.n === n);
  const removedGroups = [...removedSteps.values()].sort((a, b) => methodIndex(a.n) - methodIndex(b.n));
  const groups = [];
  let nextRemoved = 0;
  for (const group of [...numbered.values()].sort((a, b) => a.displayNumber - b.displayNumber)) {
    while (nextRemoved < removedGroups.length && methodIndex(removedGroups[nextRemoved].n) < methodIndex(group.n)) {
      groups.push(removedGroups[nextRemoved]);
      nextRemoved += 1;
    }
    groups.push(group);
  }
  groups.push(...removedGroups.slice(nextRemoved));
  if (unallocated.length > 0) {
    groups.push({ kind: 'unallocated', n: null, displayNumber: null, leadIn: null, entries: unallocated });
  }
  return groups;
}

// A row's weakest basis is the worst basis across every composition field it
// contributes a non-zero amount of — the same stated -> derived -> estimated
// -> inherited ranking figures.js applies per figure (D-04), applied here
// per row.
const BASIS_ORDER = ['stated', 'derived', 'estimated', 'inherited'];

function weakestRowBasis(row) {
  let worst = 'stated';
  for (const [field, amount] of Object.entries(row.ingredient.composition)) {
    if (!(amount > 0)) continue;
    const basis = row.ingredient.basis?.[field] ?? 'inherited';
    if (BASIS_ORDER.indexOf(basis) > BASIS_ORDER.indexOf(worst)) worst = basis;
  }
  return worst;
}

function dataFlagFor(row) {
  const basis = weakestRowBasis(row);
  if (basis === 'estimated') return 'estimated';
  if (basis === 'inherited') return 'unreviewed';
  return '';
}

// changedGrams/changedShare carry the pen's current values when they differ
// from the value the pen opened on (route-recipe-version.md § 6): the
// strike is never the only carrier of a change (D-10), so the accessible
// name reads "was 40 g, now 48 g" and "was 5.0%, now 5.9%" rather than just
// the current value. Per LD-02, a portion's step is no longer editable in
// the pen, so this label carries no step phrase at all — a fact this file
// can no longer produce.
function rowAccessibleLabel(
  row,
  dataFlag,
  isMarked,
  markedFigureLabel,
  asMadeValue,
  changedGrams = null,
  changedShare = null,
  removed = false,
) {
  const gramsPhrase = changedGrams != null ? `was ${rowGrams(row)} g, now ${changedGrams} g` : `${rowGrams(row)} g`;
  const parts = [row.ingredientName, gramsPhrase];
  if (changedShare) parts.push(`was ${changedShare.from}, now ${changedShare.to}`);
  if (dataFlag) parts.push(dataFlag);
  if (isMarked) parts.push(`contributing to ${markedFigureLabel}`);
  if (asMadeValue !== null) parts.push(`as made ${asMadeValue} g`);
  if (removed) parts.push('removed');
  return parts.join(', ');
}

// The plan-grams slot (route-recipe-version.md § 3, § 6; sketch 011
// decision 2, Task 2): style 6's own right-aligned span before the name —
// plain text outside the pen, one controlled text field while developing
// — scoped to exactly ONE named portion (Task 2), not a loop joining every
// portion inside one cell, since each portion is its own <tr> once the
// table groups by step. The struck baseline (a changed value's parent
// amount) is a SIBLING before the slot, never its ancestor — the strike
// can never bleed onto the field beside it — mirroring the total row's own
// struck-then-current pair, which instead nests both INSIDE the slot
// (route-recipe-version.md § 3's "Grams field sits in the plan-grams slot,
// a changed value's parent amount is struck before it").
function GramsCell({ row, portionIndex, mode, penDraft, onChangePenGrams, inputRef, out = false, errorId = null }) {
  if (mode !== 'developing') {
    return <span className="ingredient-table__plan-grams">{`${row.portions[portionIndex].grams} g`}</span>;
  }
  const draftRow = penDraft.rows[row.id];
  const portion = row.portions[portionIndex];
  const draftPortion = draftRow.portions[portionIndex];
  // Forced struck even when the number itself is unchanged once the line is
  // out (the draft portion's own flag, or its step removed; nothing at the row
  // level) — a removed
  // line strikes in place (route-recipe-version.md § 3) — while the field
  // stays present and editable, since removing does not clear the amount and
  // a restore should keep whatever was typed.
  const changed = out || Boolean(draftPortion.removed) || draftPortion.grams !== String(portion.grams);
  // Accessible name, stated once (T-03.2-13): a one-portion row keeps
  // today's unqualified name unchanged; a row with more than one portion
  // names each field by its own portion index, since two fields sharing
  // one accessible name would be two controls a screen reader cannot tell
  // apart.
  const multiPortion = row.portions.length > 1;
  return (
    <>
      {changed && <span className="struck-value">{`${portion.grams} g`}</span>}
      <span className="ingredient-table__plan-grams">
        <input
          ref={inputRef}
          type="text"
          inputMode="decimal"
          className="ink-field"
          value={draftPortion.grams}
          aria-label={
            multiPortion ? `${row.ingredientName}, grams, portion ${portionIndex + 1}` : `${row.ingredientName}, grams`
          }
          aria-invalid={errorId ? 'true' : undefined}
          aria-describedby={errorId ?? undefined}
          onChange={(event) => onChangePenGrams(row.id, portionIndex, event.target.value)}
        />
        {' g'}
      </span>
    </>
  );
}

// The % of batch cell's own strike (route-recipe-version.md § 3): a row
// whose grams held but whose share moved because another row changed
// shows the share strike alone — the whole reason share is compared
// separately from grams.
function ShareCell({ baselineShare, currentShare }) {
  const changed = baselineShare !== null && currentShare !== baselineShare;
  return (
    <>
      {changed && <span className="struck-value">{baselineShare}</span>}
      {currentShare}
    </>
  );
}

// The remove/restore control: a text button, never an icon and never a
// colour. Every line of a split row has the control, and each one toggles its
// own line (sketch 011 decision 51, Mark 2026-10-05, replacing decision 44's
// option B); a split line's accessible name says which line it is (`lineName`). The span
// before the button carries the gap (sketch 011 decision 26): a collapsible
// word space widened by --sheet-remove-gap, so a link on the name's line
// stands 14px clear and a wrapped link stays flush.
function RemoveRowControl({ removed, onToggle, lineName }) {
  const word = removed ? 'restore' : 'remove';
  return (
    <>
      <span className="ingredient-table__remove-gap">{' '}</span>
      <button type="button" className="text-control" tabIndex={0} aria-label={lineName ? `${word} ${lineName}` : undefined} onClick={onToggle}>
        {removed ? 'restore' : 'remove'}
      </button>
    </>
  );
}

// The show-changes state's plan-grams slot (route-recipe-version.md § 3,
// § 6, 03-04; sketch 011 Task 2): both the struck parent value and the
// current value read through ink, never pen blue — a saved version's
// marks are never still being typed, so nothing here reads through
// .ink-field or .ink-text — nested INSIDE the slot, mirroring the total
// row's own struck-then-current pair (both values are static text here,
// never a field beside it). Driven entirely by the line's own buildDiff
// descriptor (rowDiff.lines[portionIndex]); a line that is out forces the
// strike even when the number itself did not move, the same forced-strike
// discipline GramsCell already applies in the pen. A line that is out prints
// its struck old amount alone, with no current amount after it (sketch 011
// decision 24). A one-line row has one line whose figures equal its row's.
function DiffGramsCell({ line }) {
  const changed = line.removed || line.gramsChanged;
  return (
    <span className="ingredient-table__plan-grams">
      {changed && line.gramsFrom != null && <span className="struck-value">{`${line.gramsFrom} g`}</span>}
      {!line.removed && `${line.gramsTo} g`}
    </span>
  );
}

// A line that is out has no current share at all — the mirror of the name
// cell's forced strike — so only the struck baseline renders, exactly as
// the pen's own removed-line share cell does.
function DiffShareCell({ line }) {
  if (line.removed) {
    return <span className="struck-value">{line.shareFrom}</span>;
  }
  return (
    <>
      {line.shareChanged && line.shareFrom != null && <span className="struck-value">{line.shareFrom}</span>}
      {line.shareTo}
    </>
  );
}

// The show-changes state's accessible name (route-recipe-version.md § 6):
// the strike is never the only carrier, so a changed cell's row still
// reads "was 40 g, now 48 g" even with no pen field to attach it to. `row` is
// the CURRENT (child) version's own row; the phrasing reads off the line's
// own diff descriptor, one line at a time, never off `row` itself: a "was X g,
// now Y g" phrase when the line's amount changed or the line is out and has a
// baseline amount, a "was A, now B" share phrase when the line is in and its
// share changed, and "removed" last when it is out. Per LD-02, no step phrase
// is ever produced here.
function rowDiffAccessibleLabel(row, line, dataFlag, isMarked, markedFigureLabel, asMadeValue) {
  const gramsPhrase =
    (line.removed || line.gramsChanged) && line.gramsFrom != null
      ? `was ${line.gramsFrom} g, now ${line.gramsTo} g`
      : `${line.gramsTo} g`;
  const parts = [row.ingredientName, gramsPhrase];
  if (!line.removed && line.shareChanged && line.shareFrom != null) {
    parts.push(`was ${line.shareFrom}, now ${line.shareTo}`);
  }
  if (dataFlag) parts.push(dataFlag);
  if (isMarked) parts.push(`contributing to ${markedFigureLabel}`);
  if (asMadeValue !== null) parts.push(`as made ${asMadeValue} g`);
  if (line.removed) parts.push('removed');
  return parts.join(', ');
}

// Never `.filter(` — the automated gate on this file forbids a filter
// whose arguments mention `removed`, since that pattern is what would drop
// a removed row from the table's own rendering (the thing this file must
// never do). This helper filters *steps*, for a different purpose (naming
// which removed step orphaned a row), so it is written as a plain loop.
function removedStepsUsing(draftVersion, rowId) {
  const steps = [];
  for (const step of draftVersion.method) {
    if (step.removed && (step.uses ?? []).includes(rowId)) steps.push(step);
  }
  return steps;
}

// The row of `activeById` (activeRows keyed by row id) when it holds the line at
// stored position `portionIndex`, otherwise null. A row kept whole holds every
// position; a copied row holds the positions its portions carry in `index`
// (domain/rows.js). A plain loop over `.some`, never a filter over removal.
function rowHoldingLine(activeById, rowId, portionIndex) {
  const row = activeById.get(rowId);
  if (!row) return null;
  return row.portions.some((portion, i) => (portion.index ?? i) === portionIndex) ? row : null;
}

// The orphaned-row flag (route-recipe-version.md § 3): beside the row's
// name when orphanedRows names it, naming the removed step(s) by lead-in
// alone, with one "remove this row" control (G-03-14, D-UAT-5) — every
// causing step here is removed by construction (removedStepsUsing filters
// on step.removed), so the number it once had would read as though it
// were live; this flag never presents one. Tapping it takes every line of
// the row out — one tap, nothing else. It clears the moment the step that
// caused it is restored, because it is derived, not stored. Rendered once
// per row, on the row's first line still in (plan 03.6-02), never once per
// portion and never on a struck line.
function OrphanedRowFlag({ row, draftVersion, onTogglePenRowRemoved }) {
  const causingSteps = removedStepsUsing(draftVersion, row.id);
  if (causingSteps.length === 0) return null;
  const descriptions = causingSteps.map((step) => step.leadIn);
  const joined =
    descriptions.length === 1
      ? descriptions[0]
      : `${descriptions.slice(0, -1).join(', ')} and ${descriptions[descriptions.length - 1]}`;
  const verb = descriptions.length > 1 ? 'are' : 'is';
  return (
    <p className="ingredient-table__flag">
      {`used by ${joined}, which ${verb} removed`}{' '}
      <button type="button" tabIndex={0} onClick={() => onTogglePenRowRemoved(row.id)}>
        remove this row
      </button>
    </p>
  );
}

// The as-made cell (route-recipe-batch.md § 3, D-10): blank by default, one
// text field while recording, and the stored per-portion reading —
// through asMadeForPortion, never the row's own plan grams — once a saved
// batch's layer is showing. Blank stays blank; the plan never leaks into
// this column under any circumstance. Scoped to exactly ONE named portion
// now (Task 2), replacing the row-level formatAsMadeReading join entirely:
// each portion is its own <tr>, so there is no cell left that would ever
// join two portions' readings together.
function AsMadeCell({ row, drawnRow = row, portionIndex, mode, draft, openBatch, onChangeAsMade }) {
  if (mode === 'recording') {
    const draftValues = Object.prototype.hasOwnProperty.call(draft.asMade, row.id) ? draft.asMade[row.id] : null;
    // The name counts the lines drawn (sketch 011 decision 56, Mark's answer A recommended,
    // 2026-10-05); the value stays at the stored position, so nothing stored changes and
    // Correct reopens the same values.
    const multiPortion = drawnRow.portions.length > 1;
    const drawnNumber = drawnRow.portions.findIndex((line, i) => (line.index ?? i) === portionIndex) + 1;
    return (
      <input
        type="text"
        inputMode="decimal"
        className="ink-field ingredient-table__as-made-field"
        value={draftValues ? draftValues[portionIndex] : ''}
        aria-label={
          multiPortion
            ? `${row.ingredientName}, as made, grams, portion ${drawnNumber}`
            : `${row.ingredientName}, as made, grams`
        }
        onChange={(event) => onChangeAsMade(row.id, portionIndex, event.target.value)}
      />
    );
  }
  const value = openBatch ? asMadeForPortion(openBatch, row.id, portionIndex) : null;
  if (value !== null) {
    return <span className="sheet-hand">{`${value} g`}</span>;
  }
  return null;
}

// The Ingredients region's heading. Below 724 it is the board's head row:
// the region name with Show changes at the right end (sketch 011 decision 30
// addendum, option 3, "Move it to the table head, below 724 only", Mark,
// 2026-10-02; boards 393-show-changes-head.html and 723-show-changes-head.html).
// The control is the Sheet's `.text-control`, not the band's `.notebook-link`,
// because it now sits on the Sheet. As in the band it is absent for a first
// version and while any pen is open, and from 724 up the band carries it
// instead, so exactly one Show changes control exists at any width. Hook-free:
// the width signal arrives as `below724`.
export function IngredientsHead({ parentVersion, openPen, below724, showingChanges, onToggleShowChanges }) {
  const heading = <h2 className="region-name">Ingredients</h2>;
  if (!(below724 && openPen === null && parentVersion)) return heading;
  return (
    <div className="ingredient-table-region__head">
      {heading}
      <button type="button" className="text-control" tabIndex={0} onClick={onToggleShowChanges}>
        {showingChanges ? 'Hide changes' : 'Show changes'}
      </button>
    </div>
  );
}

// The table now groups by step (LD-01, ROADMAP Scope bullet 3) rather than
// rendering one <tr> per ingredient in the version's authored order — one
// <tbody> per group (one group, one row group, so print can keep it whole:
// sketch 011 decision 45), each opening with a step-head <tr> (its lead-in
// text looked up from `steps`, or the pen's own live
// `draftVersion.method`), then one <tr> per portion
// under its resolved step, a split ingredient's name repeated once per
// step it participates in with a sub-line naming its share of the row
// (formatPortionLine, domain/composition.js). A portion whose step cannot
// be resolved groups under a trailing "Unallocated" head instead of being
// dropped; when that is the only group the head is not drawn, since a lone
// Unallocated head labels nothing and the label earns its place only beside a
// numbered group (Mark, 2026-10-02, option 1). `markedRowIds` is the focused figure's contributorRowIds
// (route-recipe.md § 3, § 5) — marking changes only outline and weight,
// and moves nothing. `draftVersion` is the pen's own draft, built once by
// RecipePage (03-02) — present only in developing mode, and read here for
// the live balance and the orphaned-row cross-flag. Per LD-02, the pen
// offers no control at all to change which step a portion belongs to.
export function IngredientTable({
  rows,
  draftVersion = null,
  diff = null,
  showingChanges = false,
  // The parent when the page gives one. In Show changes it is the version
  // compared against: a line that is out reads the figures it had there, never
  // the new batch it was not in. In the pen it is the parent of the version the
  // pen opened on, read only for a line that was already out when the pen opened
  // (Mark's List row per-step-open-pen-with-line-out). Null elsewhere.
  baselineVersion = null,
  markedRowIds = [],
  markedFigureLabel = '',
  // The row a blocked save names (critique P1 #3, D-21): the id
  // blockedSaveRowId returned, or null — the row it names carries the
  // same weight-and-outline treatment a figure's focus trace already
  // gives a marked row, and its grams field receives focus once, on every
  // blocked attempt (WR-01: keyed on blockedRowAttempt below, not on this
  // id alone, so a second consecutive blocked press on the same row still
  // re-fires the effect).
  blockedRowId = null,
  // The incrementing attempt number RecipePage stamps onto blockedTarget
  // on every blocked buildPenFields call (WR-01, IngredientTable.jsx:518-521
  // pre-Task-2): a value-equal blockedRowId alone does not re-fire a
  // useEffect across two consecutive blocked presses on the same row,
  // since React's dependency comparison sees no change — this attempt
  // counter differs on every press even when blockedRowId repeats.
  blockedRowAttempt = null,
  // The stored position of the blocked line within the blocked row, from
  // blockedSaveLineIndex: removal is per line, so a blocked save marks and
  // focuses that line alone.
  blockedLineIndex = null,
  // The sentence blockedSaveMessage computed for the blocked line, printed in that
  // line's own name cell (sketch 011 README decision 57, Mark's answer A recommended,
  // 2026-10-05).
  blockedRowMessage = null,
  mode = 'reading',
  draft = null,
  penDraft = null,
  openBatch = null,
  comparisonBatchLabel = null,
  // The method array supplying each numbered group's lead-in text in the
  // reading and show-changes states — the same expression Method.jsx's own
  // `steps` prop already computes. The pen branch uses draftVersion.method
  // instead (below), since it is the live, unsaved method a step removal
  // mid-session must be reflected against, not this stale baseline.
  steps = [],
  // The two maps RecipePage computes once through domain/stepNumbers.js
  // (03-10): currentStepNumbers from the method the page is showing (the
  // draft's while developing, the version's own otherwise) — this is what
  // the grouping helper resolves every portion's step through.
  currentStepNumbers = null,
  onChangeAsMade = () => {},
  onChangePenGrams = () => {},
  onTogglePenRowRemoved = () => {},
  onTogglePenLineRemoved = () => {},
}) {
  // The share denominator and the totals are computed from activeRows, so
  // a removed row contributes nothing to either while still rendering,
  // struck, in the pen's own table (RESEARCH.md Pitfall 2). `rows` here is
  // the version the pen opened on (the baseline) outside the pen, and the
  // baseline again inside it — the struck values before every field.
  // The blocked-save focus target (critique P1 #3, D-21, T-03.1-20): a
  // Map, never a bare object keyed by a stored row id (T-02-32's
  // discipline), filled through each grams input's own ref callback.
  // Moving focus is a real DOM effect, so it lives here rather than being
  // asserted by a render test (RESEARCH.md Pitfall 4).
  // Keyed by row id and line index together, one string per line.
  const gramsInputsRef = useRef(new Map());
  useEffect(() => {
    if (blockedRowAttempt == null || !blockedRowId) return;
    gramsInputsRef.current.get(`${blockedRowId}:${blockedLineIndex}`)?.focus();
  }, [blockedRowAttempt]);

  function registerGramsInput(rowId, lineIndex, element) {
    if (element) gramsInputsRef.current.set(`${rowId}:${lineIndex}`, element);
    else gramsInputsRef.current.delete(`${rowId}:${lineIndex}`);
  }

  const activeRowsOnly = activeRows({ rows, method: steps });
  const baselineBalance = computeBalance(activeRowsOnly);
  const baselineMass = baselineBalance ? baselineBalance.mass : 0;
  // Keyed by row id in a Map, never a bare object read against a stored id
  // (T-03.6-02): the row as it stood when the pen opened, lines still in.
  const baselineActiveById = new Map(activeRowsOnly.map((row) => [row.id, row]));
  // The figures a struck line reads: the version the comparison opened on.
  // The page's parent while Show changes is on, otherwise the version the pen
  // opened on (the table's own rows), so one rule serves both states.
  let openingActiveById = baselineActiveById;
  let openingMass = baselineMass;
  if (baselineVersion) {
    const openingActive = activeRows(baselineVersion);
    const openingBalance = computeBalance(openingActive);
    openingActiveById = new Map(openingActive.map((row) => [row.id, row]));
    openingMass = openingBalance ? openingBalance.mass : 0;
  }

  const isDeveloping = mode === 'developing' && draftVersion != null;
  // The show-changes state (route-recipe-version.md § 3, § 6; D-02, 03-04):
  // never while the pen is open — its own always-visible grammar owns that
  // state — and only once the diff itself exists (no parent, or an unread
  // parent, and there is nothing to mark).
  const isShowingChanges = !isDeveloping && showingChanges && diff != null;
  const currentActiveRows = isDeveloping ? activeRows(draftVersion) : activeRowsOnly;
  const currentBalance = isDeveloping ? computeBalance(currentActiveRows) : baselineBalance;
  const currentMass = currentBalance ? currentBalance.mass : 0;
  const currentActiveById = new Map(currentActiveRows.map((row) => [row.id, row]));
  const orphanedRowIds = isDeveloping ? new Set(orphanedRows(draftVersion).map((row) => row.id)) : new Set();

  // The as-made total appears only while an as-made layer is showing —
  // recording, or a saved batch reading (D-22) — and only once a value has
  // been written for an active row (anyWritten); until then its cell stays
  // in the row, empty. Reading the plan total needs no as-made source at
  // all, so it is always computed.
  const hasAsMadeLayer = mode === 'recording' || Boolean(openBatch);
  const asMadeSource = mode === 'recording' ? draft.asMade : openBatch ? openBatch.churn.asMade : {};
  const { asMadeTotal, anyWritten } = asMadeTotals(activeRowsOnly, asMadeSource);
  const baselineTotalText = formatGrams(baselineMass);
  const currentTotalText = isDeveloping ? formatGrams(currentMass) : baselineTotalText;
  const asMadeTotalText = formatGrams(asMadeTotal);
  // The total row's show-changes reading (route-recipe-version.md § 3, § 6):
  // the parent's total struck before the current one, read straight off
  // buildDiff's own total rather than recomputed here.
  const totalDisplayText = isShowingChanges ? diff.total.to : currentTotalText;
  const totalAriaLabel =
    isShowingChanges && diff.total.changed
      ? `Total, plan was ${diff.total.from.replace(' g', ' grams')}, now ${diff.total.to.replace(' g', ' grams')}`
      : hasAsMadeLayer && anyWritten
        ? `Total, plan ${totalDisplayText.replace(' g', ' grams')}, as made ${asMadeTotalText.replace(' g', ' grams')}`
        : `Total, plan ${totalDisplayText.replace(' g', ' grams')}`;

  // Decision 15 (sketch 011, 03.5-11 Task 1): the table now has three
  // column identities — the content-sized amount column (the plan grams,
  // right-aligned before the name), the auto-width name column (the
  // estimated/unreviewed chip, the portion note, the orphaned-row flag and
  // remove/restore all stay here), and the content-sized numeric column
  // (As made, % of batch). As made alone stays conditional, governed by
  // hasAsMadeLayer, gated at the header and all three body branches plus
  // the total row.
  const columnCount = 3 + (hasAsMadeLayer ? 1 : 0);

  // The method array the grouping helper reads lead-in text from: the
  // pen's own live draftVersion.method while developing (its own comment
  // above states why), the `steps` prop everywhere else.
  const stepsForGrouping = isDeveloping ? draftVersion.method : steps;
  const groups = groupPortionsByStep(rows, stepsForGrouping, currentStepNumbers, isDeveloping || isShowingChanges);
  const showStepHeads = !(groups.length === 1 && groups[0].kind === 'unallocated');

  // Style 6's reading row (sketch 011 decisions 2, 3; D-19; 03.5-06 Task
  // 1) — also the recording state's row (Task 2): GramsCell's own
  // non-developing branch already renders the plain plan-grams span, so
  // recording (mode "recording", the as-made field rendered by AsMadeCell
  // below) reads the identical name-cell shape as plain reading, with no
  // second branch to keep in sync.
  function renderReadingEntry(row, portion, portionIndex) {
    const dataFlag = dataFlagFor(row);
    const isMarked = markedRowIds.includes(row.id);
    const asMadeValue = mode !== 'recording' && openBatch ? asMadeForPortion(openBatch, row.id, portionIndex) : null;
    // The lines still in, over the live batch: the stored row itself when every
    // line is in.
    const liveRow = baselineActiveById.get(row.id) ?? row;
    // In the reading Sheet, in print and while recording, a split ingredient with one line
    // still in reads like a one-line row, with no portion line (Mark's List row
    // per-step-one-line-left, Mark's answer drop, 2026-10-05; sketch 011 decision 56,
    // Mark's answer A recommended, 2026-10-05).
    const isSplit = liveRow.portions.length > 1;
    const ariaLabel = rowAccessibleLabel(liveRow, dataFlag, isMarked, markedFigureLabel, asMadeValue);

    return (
      <tr key={`${row.id}:${portionIndex}`} className={isMarked ? 'is-marked' : undefined} aria-label={ariaLabel}>
        <td className="ingredient-table__col-grams">
          <GramsCell row={row} portionIndex={portionIndex} mode={mode} penDraft={penDraft} onChangePenGrams={onChangePenGrams} />
        </td>
        <td className="ingredient-table__col-name">
          {row.ingredientName}
          {dataFlag && (
            <span className="target-chip ingredient-table__flag">
              <span className="target-chip__value">{dataFlag}</span>
            </span>
          )}
          {isSplit && (
            <span className="ingredient-table__portion-note">
              {formatPortionLine(portion.grams, rowGrams(liveRow), baselineMass)}
            </span>
          )}
        </td>
        {hasAsMadeLayer && (
          <td className="ingredient-table__col-numeric">
            <AsMadeCell row={row} drawnRow={liveRow} portionIndex={portionIndex} mode={mode} draft={draft} openBatch={openBatch} onChangeAsMade={onChangeAsMade} />
          </td>
        )}
        <td className="ingredient-table__col-numeric">{formatShareOfBatch(portion.grams, baselineMass)}</td>
      </tr>
    );
  }

  function renderShowChangesEntry(row, portion, portionIndex) {
    const rowDiff = diff.rows.find((entry) => entry.id === row.id);
    const line = rowDiff.lines[portionIndex];
    const dataFlag = dataFlagFor(row);
    const isMarked = markedRowIds.includes(row.id);
    const asMadeValue = openBatch ? asMadeForPortion(openBatch, row.id, portionIndex) : null;
    const isSplit = row.portions.length > 1;
    // A line that is in reads the lines still in over the current batch; a
    // line that is out reads the opening figures (the parent's row over the
    // parent's batch), since the new batch it was not in has no share for it.
    const liveRow = baselineActiveById.get(row.id) ?? row;
    const openingRow = openingActiveById.get(row.id) ?? row;
    return (
      <tr
        key={`${row.id}:${portionIndex}`}
        className={isMarked ? 'is-marked' : undefined}
        aria-label={rowDiffAccessibleLabel(row, line, dataFlag, isMarked, markedFigureLabel, asMadeValue)}
      >
        <td className="ingredient-table__col-grams">
          <DiffGramsCell line={line} />
        </td>
        <td className="ingredient-table__col-name">
          {line.removed ? <span className="struck-value">{row.ingredientName}</span> : row.ingredientName}
          {dataFlag && (
            <span className="target-chip ingredient-table__flag">
              <span className="target-chip__value">{dataFlag}</span>
            </span>
          )}
          {isSplit && (
            <span className="ingredient-table__portion-note">
              {line.removed
                ? formatPortionLine(portion.grams, rowGrams(openingRow), openingMass)
                : formatPortionLine(line.gramsTo, rowGrams(liveRow), baselineMass)}
            </span>
          )}
        </td>
        {hasAsMadeLayer && (
          <td className="ingredient-table__col-numeric">
            <AsMadeCell row={row} portionIndex={portionIndex} mode={mode} draft={draft} openBatch={openBatch} onChangeAsMade={onChangeAsMade} />
          </td>
        )}
        <td className="ingredient-table__col-numeric">
          <DiffShareCell line={line} />
        </td>
      </tr>
    );
  }

  function renderDevelopingEntry(row, portion, portionIndex, displayNumber, stepRemoved) {
    const draftRow = penDraft.rows[row.id];
    const draftPortion = draftRow.portions[portionIndex];
    // This line is out when this portion's own draft flag is set or its step
    // is removed (sketch 011 decision 51); a sibling line is never affected by
    // the flag, and the draft row holds no flag of its own.
    const lineOut = Boolean(draftPortion.removed) || stepRemoved;
    // A line is in now when its own draft flag is clear and its step is not
    // removed in the draft's method.
    const lineInNow = (candidate, i) => !candidate.removed && !isStepRemoved(stepsForGrouping, row.portions[i].step);
    // The orphaned-row flag prints on the first line still in (not struck by
    // the maker's own flag and not under a removed step), so it never lands on
    // a struck line; a row flagged orphaned always has one.
    const firstLineIn = draftRow.portions.findIndex(lineInNow);
    const dataFlag = dataFlagFor(row);
    const isMarked = markedRowIds.includes(row.id);
    const asMadeValue = mode !== 'recording' && openBatch ? asMadeForPortion(openBatch, row.id, portionIndex) : null;
    const isSplit = row.portions.length > 1;

    // The row as it stood when the pen opened, lines in (undefined when every
    // line was out). A line the version the pen opened on holds reads that
    // version; a line it does not hold was already out at open, so it reads the
    // parent's figures, and when the parent does not hold it either it has none
    // (Mark's List row per-step-open-pen-with-line-out; its D-B).
    const openingRow = baselineActiveById.get(row.id);
    let lineFigures = null;
    if (rowHoldingLine(baselineActiveById, row.id, portionIndex)) {
      lineFigures = { row: openingRow, mass: baselineMass };
    } else if (baselineVersion) {
      const parentRow = rowHoldingLine(openingActiveById, row.id, portionIndex);
      if (parentRow) lineFigures = { row: parentRow, mass: openingMass };
    }

    // Row-level current grams/share (route-recipe-version.md § 3): the
    // lines still in, summed — the draft's parsed raw strings, falling back
    // to a portion's own stored amount when the string is blank or does not
    // parse (a blank or unparseable keystroke keeps the portion's own
    // number rather than becoming 0 or NaN), which is what the draft
    // version's rows already hold. A row with no line in sums to 0.
    const liveRow = currentActiveById.get(row.id);
    const baselineShare = openingRow ? formatShareOfBatch(rowGrams(openingRow), baselineMass) : null;
    const currentGramsValue = liveRow ? rowGrams(liveRow) : 0;
    const currentShare = lineOut ? null : formatShareOfBatch(currentGramsValue, currentMass);
    // Only the lines in now count toward the row's changed amount.
    const gramsDirty = draftRow.portions.some((draftPortion, i) => lineInNow(draftPortion, i) && draftPortion.grams !== String(row.portions[i].grams));
    let changedGrams = null;
    if (gramsDirty) {
      const parts = [];
      draftRow.portions.forEach((draftPortion, i) => {
        if (lineInNow(draftPortion, i)) parts.push(draftPortion.grams.trim() === '' ? String(row.portions[i].grams) : draftPortion.grams);
      });
      changedGrams = parts.join(' + ');
    }
    const changedShare = !lineOut && baselineShare !== null && currentShare !== baselineShare ? { from: baselineShare, to: currentShare } : null;
    // orphanedRows never names an already-removed row (uses.js), so this
    // flag only ever applies to an active row here.
    const flagged = orphanedRowIds.has(row.id);
    // A blocked save's own line (critique P1 #3, D-21): the same
    // weight-and-outline the focus trace's is-marked class already draws,
    // never a second class for the same meaning. Removal is per line, so only
    // the blocked line is marked, not every line of its row.
    const isBlocked = row.id === blockedRowId && portionIndex === blockedLineIndex;
    const blockedSentence = isBlocked ? blockedRowMessage : null;

    // This portion's own current/baseline values, for the portion-scoped
    // % of batch cell and the split-ingredient sub-line — the pen's own
    // live values (Task 2's action text), not the row-level ones above.
    const livePortionGrams = parseGramsDraft(draftPortion.grams) ?? portion.grams;
    const portionBaselineShare = rowHoldingLine(baselineActiveById, row.id, portionIndex) ? formatShareOfBatch(portion.grams, baselineMass) : null;
    const portionCurrentShare = lineOut ? null : formatShareOfBatch(livePortionGrams, currentMass);

    return (
      <tr
        key={`${row.id}:${portionIndex}`}
        className={isMarked || isBlocked ? 'is-marked' : undefined}
        aria-label={rowAccessibleLabel(openingRow ?? row, dataFlag, isMarked, markedFigureLabel, asMadeValue, changedGrams, changedShare, lineOut)}
      >
        <td className="ingredient-table__col-grams">
          <GramsCell
            row={row}
            portionIndex={portionIndex}
            mode={mode}
            penDraft={penDraft}
            onChangePenGrams={onChangePenGrams}
            inputRef={(element) => registerGramsInput(row.id, portionIndex, element)}
            out={lineOut}
            errorId={blockedSentence ? BLOCKED_ROW_ERROR_ID : null}
          />
        </td>
        <td className="ingredient-table__col-name">
          {lineOut ? <span className="struck-value">{row.ingredientName}</span> : row.ingredientName}
          {dataFlag && (
            <span className="target-chip ingredient-table__flag">
              <span className="target-chip__value">{dataFlag}</span>
            </span>
          )}
          {portionIndex === firstLineIn && flagged && (
            <OrphanedRowFlag row={row} draftVersion={draftVersion} onTogglePenRowRemoved={onTogglePenRowRemoved} />
          )}
          {/* Remove/restore, in the name cell now (sketch 011 Task 2) —
              never its own column — on the name's line, after the name,
              the estimated tag and the orphan flag when present, and
              before a split row's portion line, which is a block that
              starts its own line under the link (sketch 011 decision 26;
              decision 33 addendum, Mark 2026-10-04). On every portion line
              of a split row, each toggling its own line (decision 51), named
              for its line as its step head reads it. */}
          {!stepRemoved && (
            <RemoveRowControl
              removed={lineOut}
              onToggle={() => onTogglePenLineRemoved(row.id, portionIndex)}
              lineName={isSplit ? `${row.ingredientName}, ${displayNumber != null ? `Step ${displayNumber}` : 'Unallocated'}` : undefined}
            />
          )}
          {/* A line that is out is outside the live batch, so its portion line reads
              the figures it had: the row's lines in when the pen opened over that
              batch, or, for a line already out at open, the parent's row over the
              parent's batch (the same basis as the struck % of batch cell), and none
              at all when neither held it. A line that is in reads the lines still in
              over the live batch (sketch 011 decision 44 finding 1 and decision 51
              finding 4 (a); Mark's answers 2026-10-04 and 2026-10-05; Mark's List row
              per-step-open-pen-with-line-out). */}
          {isSplit && (!lineOut || lineFigures) && (
            <span className="ingredient-table__portion-note">
              {lineOut
                ? formatPortionLine(livePortionGrams, rowGrams(lineFigures.row), lineFigures.mass)
                : formatPortionLine(livePortionGrams, rowGrams(liveRow), currentMass)}
            </span>
          )}
          {/* The sentence sits in the line it names, so the cursor and the sentence are
              together and two lines of one ingredient are told apart; the ceremony's
              status line stays empty for a line (sketch 011 decision 57). */}
          <FieldFeedback error={blockedSentence} errorId={BLOCKED_ROW_ERROR_ID} />
        </td>
        {hasAsMadeLayer && (
          <td className="ingredient-table__col-numeric">
            <AsMadeCell row={row} portionIndex={portionIndex} mode={mode} draft={draft} openBatch={openBatch} onChangeAsMade={onChangeAsMade} />
          </td>
        )}
        <td className="ingredient-table__col-numeric">
          {lineOut ? (
            lineFigures && <span className="struck-value">{formatShareOfBatch(portion.grams, lineFigures.mass)}</span>
          ) : (
            <ShareCell baselineShare={portionBaselineShare} currentShare={portionCurrentShare} />
          )}
        </td>
      </tr>
    );
  }

  function renderEntry({ row, portion, portionIndex, displayNumber, stepRemoved }) {
    if (isShowingChanges) return renderShowChangesEntry(row, portion, portionIndex);
    if (isDeveloping) return renderDevelopingEntry(row, portion, portionIndex, displayNumber, stepRemoved);
    return renderReadingEntry(row, portion, portionIndex);
  }

  return (
    <>
      {/* ingredient-table--as-made picks the D3 grid's four tracks from 724 up (sketch 011
          decisions 31 and 32; decision 33 brief (c)); the DOM already omits the As made cells
          when there is no layer. */}
      <table
        className={`ingredient-table${hasAsMadeLayer ? ' ingredient-table--as-made' : ''}${isDeveloping ? ' is-developing' : ''}`}
      >
        {comparisonBatchLabel && <caption className="ingredient-table__comparison">{comparisonBatchLabel}</caption>}
        <thead>
          <tr>
            {/* Decision 15 (sketch 011, 03.5-11 Task 1): the amount and the
                name are two columns now, sharing one "Ingredient" head —
                still no Grams, Source/Data or Remove column of its own.
                The estimated/unreviewed flag, the portion note, the
                orphaned-row flag and remove/restore all stay inline
                inside the name column; only the plan amount moved out,
                into its own preceding column. */}
            <th scope="col" className="ingredient-table__col-name" colSpan={2}>Ingredient</th>
            {hasAsMadeLayer && <th scope="col" className="ingredient-table__col-numeric">As made</th>}
            <th scope="col" className="ingredient-table__col-numeric">% of batch</th>
          </tr>
        </thead>
        {/* One tbody per step group, the step head its first row, so print can keep a
            group whole: a row group never splits where a table's rows may (sketch 011
            decision 45). A flat table is one group, one tbody; no group at all keeps
            today's single empty tbody. */}
        {groups.length === 0 && <tbody />}
        {groups.map((group) => (
          <tbody key={group.kind === 'removed' ? `removed:${group.n}` : (group.displayNumber ?? 'unallocated')}>
            {showStepHeads && (
              <tr className="ingredient-table__step-head">
                <td colSpan={columnCount}>
                  {group.kind === 'unallocated' ? (
                    'Unallocated'
                  ) : (
                    <>
                      {group.kind === 'removed' ? 'Removed' : `Step ${group.displayNumber}`}
                      <span className="ingredient-table__step-head-lead">{group.leadIn}</span>
                    </>
                  )}
                </td>
              </tr>
            )}
            {group.entries.map((entry) => renderEntry(entry))}
          </tbody>
        ))}
        <tfoot>
          <tr aria-label={totalAriaLabel}>
            <td className="ingredient-table__col-grams">
              {/* The unit prints once (D-22, critique P2 #2): the struck
                  baseline reads the bare-number formatter — the pen's own
                  through formatGramsValue, show-changes' through
                  diff.total.fromValue — never composing a second unit onto
                  what totalDisplayText already carries after it. Nested
                  INSIDE the plan-grams slot (sketch 011 Task 2), unlike a
                  row's own struck value, which sits as a sibling before it
                  — the total row's struck-then-current pair is one static
                  figure, never a field beside it. Decision 15 (03.5-11
                  Task 1) moved this slot into its own preceding column;
                  the name cell keeps only "Total". */}
              <span className="ingredient-table__plan-grams">
                {isDeveloping && currentTotalText !== baselineTotalText && (
                  <span className="struck-value">{formatGramsValue(baselineMass)}</span>
                )}
                {isShowingChanges && diff.total.changed && <span className="struck-value">{diff.total.fromValue}</span>}
                {totalDisplayText}
              </span>
            </td>
            <td className="ingredient-table__col-name">Total</td>
            {hasAsMadeLayer && (
              <td
                className={
                  mode === 'recording'
                    ? 'ingredient-table__col-numeric ingredient-table__live-total'
                    : 'ingredient-table__col-numeric'
                }
              >
                {anyWritten && <span className="sheet-hand">{asMadeTotalText}</span>}
              </td>
            )}
            <td className="ingredient-table__col-numeric"></td>
          </tr>
        </tfoot>
      </table>
      {hasAsMadeLayer && (
        <p className="table-small-print">As made totals what was written; the plan fills in where nothing was.</p>
      )}
    </>
  );
}
