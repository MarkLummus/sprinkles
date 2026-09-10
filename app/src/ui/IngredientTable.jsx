import { Fragment, useEffect, useRef } from 'react';
import { computeBalance, formatShareOfBatch, formatGrams, formatGramsValue, formatPortionLine } from '../domain/composition.js';
import { asMadeForPortion, asMadeTotals } from '../domain/batch.js';
import { activeRows, rowGrams } from '../domain/rows.js';
import { orphanedRows } from '../domain/uses.js';
import { displayNumberOf } from '../domain/stepNumbers.js';
import { parseGramsDraft } from '../domain/lineage.js';

// The table's step-grouping (LD-01, ROADMAP Scope bullet 3): resolves
// every portion's step through the active stepNumberMap via
// displayNumberOf alone — never a hand-rolled filter mentioning `removed`
// (domain/rows.js's own discipline, extended here from rows to portions).
// A portion whose step does not resolve (a null map, or a step this map
// has no entry for — its step was removed) is never dropped: it joins one
// trailing "Unallocated" group instead (RESEARCH.md Pitfall 4). Groups
// sort by display number, with Unallocated (when non-empty) always last;
// entries within a group keep `rows`' own iteration order, then portion
// order — never re-sorted, matching the sketch's own ING.forEach
// iteration (index.html:390-406).
function groupPortionsByStep(rows, steps, stepNumberMap) {
  const numbered = new Map();
  const unallocated = [];
  for (const row of rows) {
    row.portions.forEach((portion, portionIndex) => {
      const displayNumber = stepNumberMap ? displayNumberOf(stepNumberMap, portion.step) : null;
      const entry = { row, portion, portionIndex };
      if (displayNumber == null) {
        unallocated.push(entry);
        return;
      }
      if (!numbered.has(displayNumber)) {
        const step = steps.find((candidate) => candidate.n === portion.step);
        numbered.set(displayNumber, { displayNumber, leadIn: step ? step.leadIn : '', entries: [] });
      }
      numbered.get(displayNumber).entries.push(entry);
    });
  }
  const groups = [...numbered.values()].sort((a, b) => a.displayNumber - b.displayNumber);
  if (unallocated.length > 0) {
    groups.push({ displayNumber: null, leadIn: null, entries: unallocated });
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

// The grams cell (route-recipe-version.md § 3, § 6): plain text outside the
// pen, one controlled text field while developing — scoped to exactly ONE
// named portion now (Task 2), not a loop joining every portion inside one
// cell, since each portion is its own <tr> once the table groups by step.
// The struck baseline is that portion's own stored amount, rendered as a
// sibling of the field, not its ancestor, so the strike can never bleed
// onto the field beside it.
function GramsCell({ row, portionIndex, mode, penDraft, onChangePenGrams, inputRef }) {
  if (mode !== 'developing') {
    return <>{row.portions[portionIndex].grams} g</>;
  }
  const draftRow = penDraft.rows[row.id];
  const portion = row.portions[portionIndex];
  const draftPortion = draftRow.portions[portionIndex];
  // Forced struck even when the number itself is unchanged once the row is
  // removed — "the whole row strikes in place" (route-recipe-version.md
  // § 3) — while the field stays present and editable, since removing does
  // not clear the amount and a restore should keep whatever was typed.
  const changed = draftRow.removed || draftPortion.grams !== String(portion.grams);
  // Accessible name, stated once (T-03.2-13): a one-portion row keeps
  // today's unqualified name unchanged; a row with more than one portion
  // names each field by its own portion index, since two fields sharing
  // one accessible name would be two controls a screen reader cannot tell
  // apart.
  const multiPortion = row.portions.length > 1;
  return (
    <span className="ingredient-table__grams-cell">
      {changed && <span className="struck-value">{portion.grams}</span>}
      <input
        ref={inputRef}
        type="text"
        inputMode="decimal"
        className="ink-field"
        value={draftPortion.grams}
        aria-label={
          multiPortion ? `${row.ingredientName}, grams, portion ${portionIndex + 1}` : `${row.ingredientName}, grams`
        }
        onChange={(event) => onChangePenGrams(row.id, portionIndex, event.target.value)}
      />
    </span>
  );
}

// The % of batch cell's own strike (route-recipe-version.md § 3): a row
// whose grams held but whose share moved because another row changed
// shows the share strike alone — the whole reason share is compared
// separately from grams.
function ShareCell({ baselineShare, currentShare }) {
  const changed = currentShare !== baselineShare;
  return (
    <>
      {changed && <span className="struck-value">{baselineShare}</span>}
      {currentShare}
    </>
  );
}

// The remove/restore control: a text button, never an icon and never a
// colour — exactly one control per row.
function RemoveRowControl({ removed, onToggle }) {
  return (
    <button type="button" className="text-control" onClick={onToggle}>
      {removed ? 'restore' : 'remove'}
    </button>
  );
}

// The show-changes state's grams cell (route-recipe-version.md § 3, § 6,
// 03-04): both the struck parent value and the current value read through
// ink, never pen blue — a saved version's marks are never still being
// typed, so nothing here reads through .ink-field or .ink-text. Driven
// entirely by the row's own buildDiff descriptor; a removed row forces the
// strike even when the number itself did not move, the same forced-strike
// discipline GramsCell already applies in the pen. Only valid for a
// single-portion row — diff.js's rowDiff carries ROW-level totals alone, so
// it cannot attribute a struck comparison to one portion of a split row
// (Task 2's own show-changes branch renders a split row's grams plainly
// instead, with no strike).
function DiffGramsCell({ rowDiff }) {
  const changed = rowDiff.removed || rowDiff.gramsChanged;
  return (
    <>
      {changed && rowDiff.gramsFrom != null && <span className="struck-value">{rowDiff.gramsFrom} g</span>}
      {rowDiff.gramsTo} g
    </>
  );
}

// A removed row has no current share at all — the mirror of the name
// cell's forced strike — so only the struck baseline renders, exactly as
// the pen's own removed-row share cell does. Single-portion only — see
// DiffGramsCell's own comment.
function DiffShareCell({ rowDiff }) {
  if (rowDiff.removed) {
    return <span className="struck-value">{rowDiff.shareFrom}</span>;
  }
  return (
    <>
      {rowDiff.shareChanged && rowDiff.shareFrom != null && <span className="struck-value">{rowDiff.shareFrom}</span>}
      {rowDiff.shareTo}
    </>
  );
}

// The show-changes state's accessible name (route-recipe-version.md § 6):
// the strike is never the only carrier, so a changed cell's row still
// reads "was 40 g, now 48 g" even with no pen field to attach it to. Unlike
// rowAccessibleLabel above, `row` here is the CURRENT (child) version's own
// row — its own grams already equals rowDiff's "to" value for a
// single-portion row — so the phrasing reads directly off the diff
// descriptor, never off `row` itself. `isSplit` selects the same fork the
// visible cell takes: a struck "was/now" comparison for a single-portion
// row, or that portion's own plain current value for a split row (diff.js
// carries no per-portion comparison to strike against). Per LD-02, no step
// phrase is ever produced here.
function rowDiffAccessibleLabel(row, portion, rowDiff, dataFlag, isMarked, markedFigureLabel, asMadeValue, isSplit) {
  const gramsPhrase = isSplit
    ? `${portion.grams} g`
    : (rowDiff.removed || rowDiff.gramsChanged) && rowDiff.gramsFrom != null
      ? `was ${rowDiff.gramsFrom} g, now ${rowDiff.gramsTo} g`
      : `${rowDiff.gramsTo} g`;
  const parts = [row.ingredientName, gramsPhrase];
  if (!isSplit && !rowDiff.removed && rowDiff.shareChanged && rowDiff.shareFrom != null) {
    parts.push(`was ${rowDiff.shareFrom}, now ${rowDiff.shareTo}`);
  }
  if (dataFlag) parts.push(dataFlag);
  if (isMarked) parts.push(`contributing to ${markedFigureLabel}`);
  if (asMadeValue !== null) parts.push(`as made ${asMadeValue} g`);
  if (rowDiff.removed) parts.push('removed');
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

// The orphaned-row flag (route-recipe-version.md § 3): beside the row's
// name when orphanedRows names it, naming the removed step(s) by lead-in
// alone, with one "remove this row" control (G-03-14, D-UAT-5) — every
// causing step here is removed by construction (removedStepsUsing filters
// on step.removed), so the number it once had would read as though it
// were live; this flag never presents one. Tapping it removes the row —
// one tap, nothing else. It clears the moment the step that caused it is
// restored, because it is derived, not stored. Rendered once per row
// (Task 2: only on the row's first portion line), never once per portion.
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
      <button type="button" onClick={() => onTogglePenRowRemoved(row.id)}>
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
function AsMadeCell({ row, portionIndex, mode, draft, openBatch, onChangeAsMade }) {
  if (mode === 'recording') {
    const draftValues = Object.prototype.hasOwnProperty.call(draft.asMade, row.id) ? draft.asMade[row.id] : null;
    const multiPortion = row.portions.length > 1;
    return (
      <input
        type="text"
        inputMode="decimal"
        className="ink-field"
        value={draftValues ? draftValues[portionIndex] : ''}
        aria-label={
          multiPortion
            ? `${row.ingredientName}, as made, grams, portion ${portionIndex + 1}`
            : `${row.ingredientName}, as made, grams`
        }
        onChange={(event) => onChangeAsMade(row.id, portionIndex, event.target.value)}
      />
    );
  }
  const value = openBatch ? asMadeForPortion(openBatch, row.id, portionIndex) : null;
  if (value !== null) {
    return <span className="ink-text">{`${value} g`}</span>;
  }
  return null;
}

// The table now groups by step (LD-01, ROADMAP Scope bullet 3) rather than
// rendering one <tr> per ingredient in the version's authored order — a
// step-head <tr> per group (its lead-in text looked up from `steps`, or
// the pen's own live `draftVersion.method`), then one <tr> per portion
// under its resolved step, a split ingredient's name repeated once per
// step it participates in with a sub-line naming its share of the row
// (formatPortionLine, domain/composition.js). A portion whose step cannot
// be resolved groups under a trailing "Unallocated" head instead of being
// dropped. `markedRowIds` is the focused figure's contributorRowIds
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
  mode = 'reading',
  draft = null,
  penDraft = null,
  openBatch = null,
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
  const gramsInputsRef = useRef(new Map());
  useEffect(() => {
    if (blockedRowAttempt == null || !blockedRowId) return;
    gramsInputsRef.current.get(blockedRowId)?.focus();
  }, [blockedRowAttempt]);

  function registerGramsInput(rowId, element) {
    if (element) gramsInputsRef.current.set(rowId, element);
    else gramsInputsRef.current.delete(rowId);
  }

  const activeRowsOnly = activeRows({ rows });
  const baselineBalance = computeBalance(activeRowsOnly);
  const baselineMass = baselineBalance ? baselineBalance.mass : 0;

  const isDeveloping = mode === 'developing' && draftVersion != null;
  // The show-changes state (route-recipe-version.md § 3, § 6; D-02, 03-04):
  // never while the pen is open — its own always-visible grammar owns that
  // state — and only once the diff itself exists (no parent, or an unread
  // parent, and there is nothing to mark).
  const isShowingChanges = !isDeveloping && showingChanges && diff != null;
  const currentActiveRows = isDeveloping ? activeRows(draftVersion) : activeRowsOnly;
  const currentBalance = isDeveloping ? computeBalance(currentActiveRows) : baselineBalance;
  const currentMass = currentBalance ? currentBalance.mass : 0;
  const orphanedRowIds = isDeveloping ? new Set(orphanedRows(draftVersion).map((row) => row.id)) : new Set();

  // The as-made total appears only while an as-made layer is showing —
  // recording, or a saved batch reading (D-22). Reading the plan total
  // needs no as-made source at all, so it is always computed.
  const hasAsMadeLayer = mode === 'recording' || Boolean(openBatch);
  const asMadeSource = mode === 'recording' ? draft.asMade : openBatch ? openBatch.churn.asMade : {};
  const { asMadeTotal } = asMadeTotals(activeRowsOnly, asMadeSource);
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
      : hasAsMadeLayer
        ? `Total, plan ${totalDisplayText.replace(' g', ' grams')}, as made ${asMadeTotalText.replace(' g', ' grams')}`
        : `Total, plan ${totalDisplayText.replace(' g', ' grams')}`;

  // This table carries two conditional columns: As made, in the middle,
  // governed by hasAsMadeLayer; and Remove, at the end, governed by
  // isDeveloping. Each is gated at exactly four sites — the header and
  // all three body branches — plus the total row, so a future third
  // conditional column should follow this same shape (one named
  // predicate, four-plus-one gated sites) rather than inventing its own.
  const columnCount = 4 + (hasAsMadeLayer ? 1 : 0) + (isDeveloping ? 1 : 0);

  // The method array the grouping helper reads lead-in text from: the
  // pen's own live draftVersion.method while developing (its own comment
  // above states why), the `steps` prop everywhere else.
  const stepsForGrouping = isDeveloping ? draftVersion.method : steps;
  const groups = groupPortionsByStep(rows, stepsForGrouping, currentStepNumbers);

  function renderReadingEntry(row, portion, portionIndex) {
    const dataFlag = dataFlagFor(row);
    const isMarked = markedRowIds.includes(row.id);
    const asMadeValue = mode !== 'recording' && openBatch ? asMadeForPortion(openBatch, row.id, portionIndex) : null;
    const isSplit = row.portions.length > 1;
    return (
      <tr
        key={`${row.id}:${portionIndex}`}
        className={isMarked ? 'is-marked' : undefined}
        aria-label={rowAccessibleLabel(row, dataFlag, isMarked, markedFigureLabel, asMadeValue)}
      >
        <td className="ingredient-table__col-name">
          {row.ingredientName}
          {isSplit && (
            <span className="ingredient-table__portion-note">
              {formatPortionLine(portion.grams, rowGrams(row), baselineMass)}
            </span>
          )}
        </td>
        <td className="ingredient-table__col-numeric">
          <GramsCell row={row} portionIndex={portionIndex} mode={mode} penDraft={penDraft} onChangePenGrams={onChangePenGrams} />
        </td>
        {hasAsMadeLayer && (
          <td className="ingredient-table__col-numeric">
            <AsMadeCell row={row} portionIndex={portionIndex} mode={mode} draft={draft} openBatch={openBatch} onChangeAsMade={onChangeAsMade} />
          </td>
        )}
        <td className="ingredient-table__col-numeric">{formatShareOfBatch(portion.grams, baselineMass)}</td>
        <td className="ingredient-table__col-data">{dataFlag}</td>
      </tr>
    );
  }

  function renderShowChangesEntry(row, portion, portionIndex) {
    const rowDiff = diff.rows.find((entry) => entry.id === row.id);
    const dataFlag = dataFlagFor(row);
    const isMarked = markedRowIds.includes(row.id);
    const asMadeValue = openBatch ? asMadeForPortion(openBatch, row.id, portionIndex) : null;
    const isSplit = row.portions.length > 1;
    return (
      <tr
        key={`${row.id}:${portionIndex}`}
        className={isMarked ? 'is-marked' : undefined}
        aria-label={rowDiffAccessibleLabel(row, portion, rowDiff, dataFlag, isMarked, markedFigureLabel, asMadeValue, isSplit)}
      >
        <td className="ingredient-table__col-name">
          {rowDiff.removed ? <span className="struck-value">{row.ingredientName}</span> : row.ingredientName}
          {isSplit && (
            <span className="ingredient-table__portion-note">
              {formatPortionLine(portion.grams, rowGrams(row), baselineMass)}
            </span>
          )}
        </td>
        <td className="ingredient-table__col-numeric">
          {isSplit ? <>{portion.grams} g</> : <DiffGramsCell rowDiff={rowDiff} />}
        </td>
        {hasAsMadeLayer && (
          <td className="ingredient-table__col-numeric">
            <AsMadeCell row={row} portionIndex={portionIndex} mode={mode} draft={draft} openBatch={openBatch} onChangeAsMade={onChangeAsMade} />
          </td>
        )}
        <td className="ingredient-table__col-numeric">
          {isSplit ? formatShareOfBatch(portion.grams, baselineMass) : <DiffShareCell rowDiff={rowDiff} />}
        </td>
        <td className="ingredient-table__col-data">{dataFlag}</td>
      </tr>
    );
  }

  function renderDevelopingEntry(row, portion, portionIndex) {
    const draftRow = penDraft.rows[row.id];
    const removed = draftRow.removed;
    const dataFlag = dataFlagFor(row);
    const isMarked = markedRowIds.includes(row.id);
    const asMadeValue = mode !== 'recording' && openBatch ? asMadeForPortion(openBatch, row.id, portionIndex) : null;
    const isSplit = row.portions.length > 1;

    // Row-level current grams/share (route-recipe-version.md § 3): the
    // same values every portion-line of this row's own sub-line and
    // accessible name report, since removing/restoring and the row's own
    // total are whole-row facts, unchanged by which portion a given <tr>
    // is naming. The current grams value: the sum over the draft's
    // portions of the parsed raw string, falling back to that portion's
    // own stored amount when the string is blank or does not parse — a
    // blank or unparseable keystroke keeps the portion's own number rather
    // than becoming 0 or NaN, applied per portion.
    const baselineShare = formatShareOfBatch(rowGrams(row), baselineMass);
    const currentGramsValue = draftRow.portions.reduce(
      (total, draftPortion, i) => total + (parseGramsDraft(draftPortion.grams) ?? row.portions[i].grams),
      0,
    );
    const currentShare = removed ? null : formatShareOfBatch(currentGramsValue, currentMass);
    const gramsDirty = draftRow.portions.some((draftPortion, i) => draftPortion.grams !== String(row.portions[i].grams));
    const changedGrams = gramsDirty
      ? draftRow.portions
          .map((draftPortion, i) => (draftPortion.grams.trim() === '' ? String(row.portions[i].grams) : draftPortion.grams))
          .join(' + ')
      : null;
    const changedShare = !removed && currentShare !== baselineShare ? { from: baselineShare, to: currentShare } : null;
    // orphanedRows never names an already-removed row (uses.js), so this
    // flag only ever applies to an active row here.
    const flagged = orphanedRowIds.has(row.id);
    // A blocked save's own row (critique P1 #3, D-21): the same
    // weight-and-outline the focus trace's is-marked class already draws,
    // never a second class for the same meaning. Applies to every portion
    // line of the blocked row — the row itself is what is blocked, not
    // one portion of it.
    const isBlocked = row.id === blockedRowId;

    // This portion's own current/baseline values, for the portion-scoped
    // % of batch cell and the split-ingredient sub-line — the pen's own
    // live values (Task 2's action text), not the row-level ones above.
    const draftPortion = draftRow.portions[portionIndex];
    const livePortionGrams = parseGramsDraft(draftPortion.grams) ?? portion.grams;
    const portionBaselineShare = formatShareOfBatch(portion.grams, baselineMass);
    const portionCurrentShare = removed ? null : formatShareOfBatch(livePortionGrams, currentMass);

    return (
      <tr
        key={`${row.id}:${portionIndex}`}
        className={isMarked || isBlocked ? 'is-marked' : undefined}
        aria-label={rowAccessibleLabel(row, dataFlag, isMarked, markedFigureLabel, asMadeValue, changedGrams, changedShare, removed)}
      >
        <td className="ingredient-table__col-name">
          {removed ? <span className="struck-value">{row.ingredientName}</span> : row.ingredientName}
          {isSplit && (
            <span className="ingredient-table__portion-note">
              {formatPortionLine(livePortionGrams, rowGrams(row), currentMass)}
            </span>
          )}
          {portionIndex === 0 && flagged && (
            <OrphanedRowFlag row={row} draftVersion={draftVersion} onTogglePenRowRemoved={onTogglePenRowRemoved} />
          )}
        </td>
        <td className="ingredient-table__col-numeric">
          <GramsCell
            row={row}
            portionIndex={portionIndex}
            mode={mode}
            penDraft={penDraft}
            onChangePenGrams={onChangePenGrams}
            inputRef={portionIndex === 0 ? (element) => registerGramsInput(row.id, element) : undefined}
          />
        </td>
        {hasAsMadeLayer && (
          <td className="ingredient-table__col-numeric">
            <AsMadeCell row={row} portionIndex={portionIndex} mode={mode} draft={draft} openBatch={openBatch} onChangeAsMade={onChangeAsMade} />
          </td>
        )}
        <td className="ingredient-table__col-numeric">
          {removed ? (
            <span className="struck-value">{portionBaselineShare}</span>
          ) : (
            <ShareCell baselineShare={portionBaselineShare} currentShare={portionCurrentShare} />
          )}
        </td>
        <td className="ingredient-table__col-data">{dataFlag}</td>
        <td className="ingredient-table__col-remove">
          {portionIndex === 0 && <RemoveRowControl removed={removed} onToggle={() => onTogglePenRowRemoved(row.id)} />}
        </td>
      </tr>
    );
  }

  function renderEntry({ row, portion, portionIndex }) {
    if (isShowingChanges) return renderShowChangesEntry(row, portion, portionIndex);
    if (isDeveloping) return renderDevelopingEntry(row, portion, portionIndex);
    return renderReadingEntry(row, portion, portionIndex);
  }

  return (
    <>
      <table className={isDeveloping ? 'ingredient-table is-developing' : 'ingredient-table'}>
        <thead>
          <tr>
            <th scope="col" className="ingredient-table__col-name">Ingredient</th>
            <th scope="col" className="ingredient-table__col-numeric">Grams</th>
            {hasAsMadeLayer && <th scope="col" className="ingredient-table__col-numeric">As made</th>}
            <th scope="col" className="ingredient-table__col-numeric">% of batch</th>
            {/* The Data column goes blank-headed in the pen (D-22): the
                column stays, its head goes. */}
            <th scope="col" className="ingredient-table__col-data">{isDeveloping ? '' : 'Data'}</th>
            {isDeveloping && <th scope="col" className="ingredient-table__col-remove">Remove</th>}
          </tr>
        </thead>
        <tbody>
          {groups.map((group) => (
            <Fragment key={group.displayNumber ?? 'unallocated'}>
              <tr className="ingredient-table__step-head">
                <td colSpan={columnCount}>
                  {group.displayNumber != null ? (
                    <>
                      {`Step ${group.displayNumber}`}
                      <span className="ingredient-table__step-head-lead">{group.leadIn}</span>
                    </>
                  ) : (
                    'Unallocated'
                  )}
                </td>
              </tr>
              {group.entries.map((entry) => renderEntry(entry))}
            </Fragment>
          ))}
        </tbody>
        <tfoot>
          <tr aria-label={totalAriaLabel}>
            <td className="ingredient-table__col-name">Total</td>
            {/* The unit prints once (D-22, critique P2 #2): the struck
                baseline reads the bare-number formatter — the pen's own
                through formatGramsValue, show-changes' through
                diff.total.fromValue — never composing a second unit onto
                what totalDisplayText already carries after it. */}
            <td className="ingredient-table__col-numeric">
              {isDeveloping && currentTotalText !== baselineTotalText && (
                <span className="struck-value">{formatGramsValue(baselineMass)}</span>
              )}
              {isShowingChanges && diff.total.changed && <span className="struck-value">{diff.total.fromValue}</span>}
              {totalDisplayText}
            </td>
            {hasAsMadeLayer && <td className="ingredient-table__col-numeric">{asMadeTotalText}</td>}
            <td className="ingredient-table__col-numeric"></td>
            <td className="ingredient-table__col-data"></td>
            {isDeveloping && <td className="ingredient-table__col-remove"></td>}
          </tr>
        </tfoot>
      </table>
      {hasAsMadeLayer && (
        <p className="table-small-print">As made totals what was written; the plan fills in where nothing was.</p>
      )}
    </>
  );
}
