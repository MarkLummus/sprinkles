import { useEffect, useRef } from 'react';
import { computeBalance, formatShareOfBatch, formatGrams, formatGramsValue } from '../domain/composition.js';
import { hasAsMade, asMadeFor, asMadeTotals } from '../domain/batch.js';
import { activeRows } from '../domain/rows.js';
import { orphanedRows } from '../domain/uses.js';
import { displayNumberOf } from '../domain/stepNumbers.js';
import { parseGramsDraft } from '../domain/lineage.js';

// The one place a stored step key resolves to the number the reader sees
// (03-10): its position in the current map if it has one, otherwise its
// position in the baseline map — the number it had before it was removed
// — otherwise null. Still serves the reading state's step column
// (formatStepReferences) — which names a step that is currently live, or
// nothing at all, never a step this file is naming as removed. The
// selector's option label, the orphaned-row flag (G-03-14, D-UAT-5), and
// the pen's/show-changes' own split-step suffix (G-03-14 CR-01 gap
// closure) no longer call this for a removed step: a removed step's
// number — primary or split — is never shown, this file's one rule
// stated once, so this function's own baseline branch has no remaining
// caller that can reach it through a removed step today. Left in place
// rather than deleted — it is still the correct rule for a site naming a
// step that might be either currently active or currently removed, should
// a future one arise, and safeDisplayNumberOf beside it is its one-sided
// counterpart.
function resolveStepNumber(n, currentMap, baselineMap) {
  const current = safeDisplayNumberOf(currentMap, n);
  if (current != null) return current;
  return safeDisplayNumberOf(baselineMap, n);
}

// A "was"/"now" or struck-baseline site names a step from exactly one
// side of the comparison (the baseline it was, or the current it is now)
// — never blended with the other side's numbering the way
// resolveStepNumber's fallback is. A null map (no baseline/current state
// applies) reads as no number, never a thrown error.
function safeDisplayNumberOf(map, n) {
  return map ? displayNumberOf(map, n) : null;
}

// The step column's own rendering rule (remap-on-read, not migration): a
// row's one or two step references, resolved through the maps and joined
// as they are joined today; the single word `unallocated` when neither
// resolves — the dangling number a step's removal used to leave behind.
function formatStepReferences(currentMap, baselineMap, primary, splitStep) {
  const parts = [];
  const primaryNumber = resolveStepNumber(primary, currentMap, baselineMap);
  if (primaryNumber != null) parts.push(primaryNumber);
  if (splitStep != null) {
    const splitNumber = resolveStepNumber(splitStep, currentMap, baselineMap);
    if (splitNumber != null) parts.push(splitNumber);
  }
  return parts.length > 0 ? parts.join(' + ') : 'unallocated';
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

// changedGrams/changedShare/changedStep carry the pen's current values when
// they differ from the value the pen opened on (route-recipe-version.md
// § 6): the strike is never the only carrier of a change (D-10), so the
// accessible name reads "was 40 g, now 48 g" — and "was 5.0%, now 5.9%",
// "was step 8, now step 6" — rather than just the current value.
function rowAccessibleLabel(
  row,
  dataFlag,
  isMarked,
  markedFigureLabel,
  asMadeValue,
  changedGrams = null,
  changedShare = null,
  changedStep = null,
  removed = false,
) {
  const gramsPhrase = changedGrams != null ? `was ${row.grams} g, now ${changedGrams} g` : `${row.grams} g`;
  const parts = [row.ingredientName, gramsPhrase];
  if (changedShare) parts.push(`was ${changedShare.from}, now ${changedShare.to}`);
  if (changedStep) parts.push(`was step ${changedStep.from}, now step ${changedStep.to}`);
  if (dataFlag) parts.push(dataFlag);
  if (isMarked) parts.push(`contributing to ${markedFigureLabel}`);
  if (asMadeValue !== null) parts.push(`as made ${asMadeValue} g`);
  if (removed) parts.push('removed');
  return parts.join(', ');
}

// The grams cell (route-recipe-version.md § 3, § 6): plain text outside the
// pen, a controlled text field bound to the pen's raw typed string while
// developing — the same branch-by-mode shape AsMadeCell already uses, and
// the same never-round-mid-keystroke discipline (never Number() until
// save, RESEARCH.md Pitfall 5). The struck baseline is row.grams: the
// value the pen opened on (D-03), rendered as a sibling of the field, not
// its ancestor, so the strike can never bleed onto the field beside it.
function GramsCell({ row, mode, penDraft, onChangePenGrams, inputRef }) {
  if (mode !== 'developing') {
    return <>{row.grams} g</>;
  }
  const draftRow = penDraft.rows[row.id];
  const draftValue = draftRow.grams;
  // Forced struck even when the number itself is unchanged once the row is
  // removed — "the whole row strikes in place" (route-recipe-version.md
  // § 3) — while the field stays present and editable, since removing does
  // not clear the grams and a restore should keep whatever was typed.
  const changed = draftRow.removed || draftValue !== String(row.grams);
  return (
    <span className="ingredient-table__grams-cell">
      {changed && <span className="struck-value">{row.grams}</span>}
      <input
        ref={inputRef}
        type="text"
        inputMode="decimal"
        className="ink-field"
        value={draftValue}
        aria-label={`${row.ingredientName}, grams`}
        onChange={(event) => onChangePenGrams(row.id, event.target.value)}
      />
    </span>
  );
}

// The step-allocation cell (route-recipe-version.md § 3, § 6, G-03-3 S3):
// a <select> over EVERY step of the draft version, not only the active
// ones (03-10) — a row's bound value must always match an option, or
// React falls back to selecting the first non-disabled option and shows
// the maker a step the data does not hold. A removed step's own option
// stays present and disabled, and says so in words, but carries NO number
// (G-03-14, D-UAT-5) — the pen's one rule, stated once: a removed step has
// no number, anywhere. Option VALUES are always the stored keys, since
// the change handler, the row's own reference, the comparison, the pen's
// handlers and a batch's step changes all match on them — a value that
// were a position would break every one of them. A row with a splitStep
// (whole milk, sucrose each go into two steps) keeps both — only the
// primary allocation is a choice here; splitStep is rendered untouched,
// since editing a split allocation is out of this milestone's scope, but
// its own number is still resolved through the maps like every other
// live reference. A future pen surface naming a step should follow this
// same rule rather than re-deriving it.
function StepCell({ row, penDraft, stepOptions, currentStepNumbers, baselineStepNumbers, onChangePenRowStep }) {
  const draftRow = penDraft.rows[row.id];
  const changed = draftRow.removed || draftRow.step !== row.step;
  const baselineStepDisplay = safeDisplayNumberOf(baselineStepNumbers, row.step);
  // A removed splitStep renders no numeral (G-03-14 CR-01 gap closure):
  // resolving through resolveStepNumber's baseline fallback would show a
  // removed step's stale pre-removal position, unmarked, which can collide
  // with a different, currently-live step that renumbering has moved into
  // that same position — the same self-contradiction the option label
  // above already closes for a removed primary allocation.
  const splitStepDisplay =
    row.splitStep != null ? safeDisplayNumberOf(currentStepNumbers, row.splitStep) : null;
  return (
    <span className="ingredient-table__step-cell">
      {changed && <span className="struck-value">{baselineStepDisplay}</span>}
      <select
        className="ink-field"
        value={draftRow.step}
        aria-label={`${row.ingredientName}, step`}
        onChange={(event) => onChangePenRowStep(row.id, Number(event.target.value))}
      >
        {stepOptions.map((step) => {
          // A removed step's own option carries no number at all
          // (G-03-14): only a live step's own display number is resolved
          // here, so this option's numeral can never be mistaken for a
          // live step's own — the "2 … + 2" self-contradiction this
          // closes.
          const label = step.removed
            ? `${step.leadIn} (removed)`
            : `${resolveStepNumber(step.n, currentStepNumbers, baselineStepNumbers)}. ${step.leadIn}`;
          return (
            <option key={step.n} value={step.n} disabled={step.removed}>
              {label}
            </option>
          );
        })}
      </select>
      {/* The split-step suffix is printed matter, not the maker's own draft
          — it reads in ink, never pen blue (critique P2 #1, D-30, "The
          parent's words in ink"). */}
      {splitStepDisplay != null && (
        <span className="ingredient-table__split-step">{` + ${splitStepDisplay}`}</span>
      )}
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
    <button type="button" onClick={onToggle}>
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
// discipline GramsCell already applies in the pen.
function DiffGramsCell({ rowDiff }) {
  const changed = rowDiff.removed || rowDiff.gramsChanged;
  return (
    <>
      {changed && rowDiff.gramsFrom != null && <span className="struck-value">{rowDiff.gramsFrom} g</span>}
      {rowDiff.gramsTo} g
    </>
  );
}

// The show-changes from-and-to (03-10): the parent's display number struck
// before the child's own — each read from the map matching the side it
// names, never blended, so the strike can never disagree with the margin
// beside it. The primary always prints something (critique P2 #2): the
// resolved current number when it resolves, otherwise the word
// `unallocated` — the same word the clean reading's own
// formatStepReferences uses — so a row whose primary step was removed and
// whose splitStep survives reads "unallocated + 3" rather than the caller's
// appended split suffix dangling with no primary word before it.
function DiffStepCell({ rowDiff, currentStepNumbers, baselineStepNumbers }) {
  const changed = rowDiff.removed || rowDiff.stepChanged;
  const stepFromDisplay = safeDisplayNumberOf(baselineStepNumbers, rowDiff.stepFrom);
  const stepToDisplay = safeDisplayNumberOf(currentStepNumbers, rowDiff.stepTo);
  return (
    <>
      {changed && stepFromDisplay != null && <span className="struck-value">{stepFromDisplay}</span>}
      {stepToDisplay ?? 'unallocated'}
    </>
  );
}

// A removed row has no current share at all — the mirror of the name
// cell's forced strike — so only the struck baseline renders, exactly as
// the pen's own removed-row share cell does.
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
// row — its own grams/step already equal rowDiff's "to" values — so the
// phrasing reads directly off the diff descriptor, never off `row` itself.
function rowDiffAccessibleLabel(
  row,
  rowDiff,
  dataFlag,
  isMarked,
  markedFigureLabel,
  asMadeValue,
  currentStepNumbers,
  baselineStepNumbers,
) {
  const gramsPhrase =
    (rowDiff.removed || rowDiff.gramsChanged) && rowDiff.gramsFrom != null
      ? `was ${rowDiff.gramsFrom} g, now ${rowDiff.gramsTo} g`
      : `${rowDiff.gramsTo} g`;
  const parts = [row.ingredientName, gramsPhrase];
  if (!rowDiff.removed && rowDiff.shareChanged && rowDiff.shareFrom != null) {
    parts.push(`was ${rowDiff.shareFrom}, now ${rowDiff.shareTo}`);
  }
  if ((rowDiff.removed || rowDiff.stepChanged) && rowDiff.stepFrom != null) {
    const stepFromDisplay = safeDisplayNumberOf(baselineStepNumbers, rowDiff.stepFrom);
    const stepToDisplay = safeDisplayNumberOf(currentStepNumbers, rowDiff.stepTo);
    parts.push(`was step ${stepFromDisplay}, now step ${stepToDisplay}`);
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
// restored, because it is derived, not stored.
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

// The as-made cell (route-recipe-batch.md § 3): blank by default, a numeric
// field bound to the draft while recording, and the stored value — read
// through asMadeFor, never the row's own plan grams — once a saved batch's
// layer is showing. Blank stays blank; the plan never leaks into this
// column under any circumstance. While the plan's pen is open, the open
// batch's as-made column stays in reading form beside the fields
// (route-recipe-version.md § 3) — this component's branch already falls
// through to that reading form for any mode other than 'recording'.
function AsMadeCell({ row, mode, draft, openBatch, onChangeAsMade }) {
  if (mode === 'recording') {
    const draftValue = Object.prototype.hasOwnProperty.call(draft.asMade, row.id) ? draft.asMade[row.id] : '';
    return (
      <input
        type="text"
        inputMode="decimal"
        className="ink-field"
        value={draftValue}
        aria-label={`${row.ingredientName}, as made, grams`}
        onChange={(event) => onChangeAsMade(row.id, event.target.value)}
      />
    );
  }
  if (openBatch && hasAsMade(openBatch, row.id)) {
    return <span className="ink-text">{`${asMadeFor(openBatch, row.id)} g`}</span>;
  }
  return null;
}

// The twelve rows in the version's authored order — the printed sheet's
// order. Never sort, never re-order, never group. `markedRowIds` is the
// focused figure's contributorRowIds (route-recipe.md § 3, § 5) — marking
// changes only outline and weight, and moves nothing. `draftVersion` is
// the pen's own draft, built once by RecipePage (03-02) — present only in
// developing mode, and read here for the live balance, the step-choice
// options, and the orphaned-row cross-flag.
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
  // gives a marked row, and its grams field receives focus once, when
  // this id changes.
  blockedRowId = null,
  mode = 'reading',
  draft = null,
  penDraft = null,
  openBatch = null,
  // The two maps RecipePage computes once through domain/stepNumbers.js
  // (03-10), the same pair Method reads: currentStepNumbers from the
  // method the page is showing, baselineStepNumbers from the record a
  // struck or removed step's number comes from — null wherever neither
  // the pen nor show-changes applies.
  currentStepNumbers = null,
  baselineStepNumbers = null,
  onChangeAsMade = () => {},
  onChangePenGrams = () => {},
  onChangePenRowStep = () => {},
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
    if (!blockedRowId) return;
    gramsInputsRef.current.get(blockedRowId)?.focus();
  }, [blockedRowId]);

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
  // Every step of the draft version, not only the active ones (03-10,
  // G-03-3 S3): a removed step's own option must stay in the list,
  // disabled, so a row still allocated to it always has a matching option
  // — see StepCell's own comment for why.
  const stepOptions = isDeveloping ? draftVersion.method : [];
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
  return (
    <>
      {/* is-developing widens the Step column in the pen alone (D-22) —
          app.css scopes --col-step-pen through this class, so no other
          state's Step column moves. */}
      <table className={isDeveloping ? 'ingredient-table is-developing' : 'ingredient-table'}>
        <thead>
          <tr>
            <th scope="col" className="ingredient-table__col-name">Ingredient</th>
            <th scope="col" className="ingredient-table__col-numeric">Grams</th>
            {hasAsMadeLayer && <th scope="col" className="ingredient-table__col-numeric">As made</th>}
            <th scope="col" className="ingredient-table__col-numeric">% of batch</th>
            <th scope="col" className="ingredient-table__col-step">Step</th>
            {/* The Data column goes blank-headed in the pen (D-22): the
                column stays, its head goes, making room for the widened
                Step column above without moving any other column's
                token. */}
            <th scope="col" className="ingredient-table__col-data">{isDeveloping ? '' : 'Data'}</th>
            {isDeveloping && <th scope="col" className="ingredient-table__col-remove">Remove</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const dataFlag = dataFlagFor(row);
            const isMarked = markedRowIds.includes(row.id);
            const asMadeValue =
              mode !== 'recording' && openBatch && hasAsMade(openBatch, row.id) ? asMadeFor(openBatch, row.id) : null;
            const baselineShare = formatShareOfBatch(row.grams, baselineMass);

            if (isShowingChanges) {
              const rowDiff = diff.rows.find((entry) => entry.id === row.id);
              // A removed splitStep renders no numeral here either (G-03-14
              // CR-01 gap closure) — see StepCell's own comment for why.
              const splitStepDisplay =
                row.splitStep != null ? safeDisplayNumberOf(currentStepNumbers, row.splitStep) : null;
              return (
                <tr
                  key={row.id}
                  className={isMarked ? 'is-marked' : undefined}
                  aria-label={rowDiffAccessibleLabel(
                    row,
                    rowDiff,
                    dataFlag,
                    isMarked,
                    markedFigureLabel,
                    asMadeValue,
                    currentStepNumbers,
                    baselineStepNumbers,
                  )}
                >
                  <td className="ingredient-table__col-name">
                    {rowDiff.removed ? <span className="struck-value">{row.ingredientName}</span> : row.ingredientName}
                  </td>
                  <td className="ingredient-table__col-numeric">
                    <DiffGramsCell rowDiff={rowDiff} />
                  </td>
                  {hasAsMadeLayer && (
                    <td className="ingredient-table__col-numeric">
                      <AsMadeCell row={row} mode={mode} draft={draft} openBatch={openBatch} onChangeAsMade={onChangeAsMade} />
                    </td>
                  )}
                  <td className="ingredient-table__col-numeric">
                    <DiffShareCell rowDiff={rowDiff} />
                  </td>
                  <td className="ingredient-table__col-step">
                    <DiffStepCell rowDiff={rowDiff} currentStepNumbers={currentStepNumbers} baselineStepNumbers={baselineStepNumbers} />
                    {splitStepDisplay != null && ` + ${splitStepDisplay}`}
                  </td>
                  <td className="ingredient-table__col-data">{dataFlag}</td>
                </tr>
              );
            }

            if (!isDeveloping) {
              return (
                <tr
                  key={row.id}
                  className={isMarked ? 'is-marked' : undefined}
                  aria-label={rowAccessibleLabel(row, dataFlag, isMarked, markedFigureLabel, asMadeValue)}
                >
                  <td className="ingredient-table__col-name">{row.ingredientName}</td>
                  <td className="ingredient-table__col-numeric">
                    <GramsCell row={row} mode={mode} penDraft={penDraft} onChangePenGrams={onChangePenGrams} />
                  </td>
                  {hasAsMadeLayer && (
                    <td className="ingredient-table__col-numeric">
                      <AsMadeCell row={row} mode={mode} draft={draft} openBatch={openBatch} onChangeAsMade={onChangeAsMade} />
                    </td>
                  )}
                  <td className="ingredient-table__col-numeric">{baselineShare}</td>
                  <td className="ingredient-table__col-step">
                    {formatStepReferences(currentStepNumbers, baselineStepNumbers, row.step, row.splitStep)}
                  </td>
                  <td className="ingredient-table__col-data">{dataFlag}</td>
                </tr>
              );
            }

            const draftRow = penDraft.rows[row.id];
            const removed = draftRow.removed;
            // A removed row contributes no current share (it is excluded
            // from currentMass by activeRows) — its share cell shows only
            // the struck baseline, the mirror of the name cell beside it.
            const currentGramsValue = parseGramsDraft(draftRow.grams) ?? row.grams;
            const currentShare = removed ? null : formatShareOfBatch(currentGramsValue, currentMass);
            const changedGrams = draftRow.grams !== String(row.grams) ? draftRow.grams : null;
            const changedShare = !removed && currentShare !== baselineShare ? { from: baselineShare, to: currentShare } : null;
            const changedStep =
              draftRow.step !== row.step
                ? {
                    from: safeDisplayNumberOf(baselineStepNumbers, row.step),
                    to: safeDisplayNumberOf(currentStepNumbers, draftRow.step),
                  }
                : null;
            // orphanedRows never names an already-removed row (uses.js), so
            // this flag only ever applies to an active row here.
            const flagged = orphanedRowIds.has(row.id);
            // A blocked save's own row (critique P1 #3, D-21): the same
            // weight-and-outline the focus trace's is-marked class already
            // draws, never a second class for the same meaning.
            const isBlocked = row.id === blockedRowId;

            return (
              <tr
                key={row.id}
                className={isMarked || isBlocked ? 'is-marked' : undefined}
                aria-label={rowAccessibleLabel(
                  row,
                  dataFlag,
                  isMarked,
                  markedFigureLabel,
                  asMadeValue,
                  changedGrams,
                  changedShare,
                  changedStep,
                  removed,
                )}
              >
                <td className="ingredient-table__col-name">
                  {removed ? <span className="struck-value">{row.ingredientName}</span> : row.ingredientName}
                  {flagged && (
                    <OrphanedRowFlag
                      row={row}
                      draftVersion={draftVersion}
                      onTogglePenRowRemoved={onTogglePenRowRemoved}
                    />
                  )}
                </td>
                <td className="ingredient-table__col-numeric">
                  <GramsCell
                    row={row}
                    mode={mode}
                    penDraft={penDraft}
                    onChangePenGrams={onChangePenGrams}
                    inputRef={(element) => registerGramsInput(row.id, element)}
                  />
                </td>
                {hasAsMadeLayer && (
                  <td className="ingredient-table__col-numeric">
                    <AsMadeCell row={row} mode={mode} draft={draft} openBatch={openBatch} onChangeAsMade={onChangeAsMade} />
                  </td>
                )}
                <td className="ingredient-table__col-numeric">
                  {removed ? (
                    <span className="struck-value">{baselineShare}</span>
                  ) : (
                    <ShareCell baselineShare={baselineShare} currentShare={currentShare} />
                  )}
                </td>
                <td className="ingredient-table__col-step">
                  <StepCell
                    row={row}
                    penDraft={penDraft}
                    stepOptions={stepOptions}
                    currentStepNumbers={currentStepNumbers}
                    baselineStepNumbers={baselineStepNumbers}
                    onChangePenRowStep={onChangePenRowStep}
                  />
                </td>
                <td className="ingredient-table__col-data">{dataFlag}</td>
                <td className="ingredient-table__col-remove">
                  <RemoveRowControl removed={removed} onToggle={() => onTogglePenRowRemoved(row.id)} />
                </td>
              </tr>
            );
          })}
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
            <td className="ingredient-table__col-step"></td>
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
