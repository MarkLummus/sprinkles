import { computeBalance, formatShareOfBatch, formatGrams } from '../domain/composition.js';
import { hasAsMade, asMadeFor, asMadeTotals } from '../domain/batch.js';
import { activeRows, activeSteps } from '../domain/rows.js';
import { orphanedRows } from '../domain/uses.js';

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
function GramsCell({ row, mode, penDraft, onChangePenGrams }) {
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

// The step-allocation cell (route-recipe-version.md § 3, § 6): a <select>
// over the draft version's non-removed steps while developing, bound to
// the pen's own value for the row. A row with a splitStep (whole milk,
// sucrose each go into two steps) keeps both — only the primary
// allocation is a choice here; splitStep is rendered untouched, since
// editing a split allocation is out of this milestone's scope and the row
// must not lose its second step by being edited.
function StepCell({ row, penDraft, stepOptions, onChangePenRowStep }) {
  const draftRow = penDraft.rows[row.id];
  const changed = draftRow.removed || draftRow.step !== row.step;
  return (
    <span className="ingredient-table__step-cell">
      {changed && <span className="struck-value">{row.step}</span>}
      <select
        className="ink-field"
        value={draftRow.step}
        aria-label={`${row.ingredientName}, step`}
        onChange={(event) => onChangePenRowStep(row.id, Number(event.target.value))}
      >
        {stepOptions.map((step) => (
          <option key={step.n} value={step.n}>{`${step.n}. ${step.leadIn}`}</option>
        ))}
      </select>
      {row.splitStep != null && (
        <span className="ink-text ingredient-table__split-step">{` + ${row.splitStep}`}</span>
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

function DiffStepCell({ rowDiff }) {
  const changed = rowDiff.removed || rowDiff.stepChanged;
  return (
    <>
      {changed && rowDiff.stepFrom != null && <span className="struck-value">{rowDiff.stepFrom}</span>}
      {rowDiff.stepTo}
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
function rowDiffAccessibleLabel(row, rowDiff, dataFlag, isMarked, markedFigureLabel, asMadeValue) {
  const gramsPhrase =
    (rowDiff.removed || rowDiff.gramsChanged) && rowDiff.gramsFrom != null
      ? `was ${rowDiff.gramsFrom} g, now ${rowDiff.gramsTo} g`
      : `${rowDiff.gramsTo} g`;
  const parts = [row.ingredientName, gramsPhrase];
  if (!rowDiff.removed && rowDiff.shareChanged && rowDiff.shareFrom != null) {
    parts.push(`was ${rowDiff.shareFrom}, now ${rowDiff.shareTo}`);
  }
  if ((rowDiff.removed || rowDiff.stepChanged) && rowDiff.stepFrom != null) {
    parts.push(`was step ${rowDiff.stepFrom}, now step ${rowDiff.stepTo}`);
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
// name when orphanedRows names it, naming the removed step(s) by number
// and lead-in, with one "remove this row" control. Tapping it removes the
// row — one tap, nothing else. It clears the moment the step that caused
// it is restored, because it is derived, not stored.
function OrphanedRowFlag({ row, draftVersion, onTogglePenRowRemoved }) {
  const causingSteps = removedStepsUsing(draftVersion, row.id);
  if (causingSteps.length === 0) return null;
  const descriptions = causingSteps.map((step) => `step ${step.n}, ${step.leadIn}`);
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
  mode = 'reading',
  draft = null,
  penDraft = null,
  openBatch = null,
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
  const stepOptions = isDeveloping ? activeSteps(draftVersion) : [];
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

  return (
    <>
      <table className="ingredient-table">
        <thead>
          <tr>
            <th scope="col" className="ingredient-table__col-name">Ingredient</th>
            <th scope="col" className="ingredient-table__col-numeric">Grams</th>
            <th scope="col" className="ingredient-table__col-numeric">As made</th>
            <th scope="col" className="ingredient-table__col-numeric">% of batch</th>
            <th scope="col" className="ingredient-table__col-step">Step</th>
            <th scope="col" className="ingredient-table__col-data">Data</th>
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
              return (
                <tr
                  key={row.id}
                  className={isMarked ? 'is-marked' : undefined}
                  aria-label={rowDiffAccessibleLabel(row, rowDiff, dataFlag, isMarked, markedFigureLabel, asMadeValue)}
                >
                  <td className="ingredient-table__col-name">
                    {rowDiff.removed ? <span className="struck-value">{row.ingredientName}</span> : row.ingredientName}
                  </td>
                  <td className="ingredient-table__col-numeric">
                    <DiffGramsCell rowDiff={rowDiff} />
                  </td>
                  <td className="ingredient-table__col-numeric">
                    <AsMadeCell row={row} mode={mode} draft={draft} openBatch={openBatch} onChangeAsMade={onChangeAsMade} />
                  </td>
                  <td className="ingredient-table__col-numeric">
                    <DiffShareCell rowDiff={rowDiff} />
                  </td>
                  <td className="ingredient-table__col-step">
                    <DiffStepCell rowDiff={rowDiff} />
                    {row.splitStep != null && ` + ${row.splitStep}`}
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
                  <td className="ingredient-table__col-numeric">
                    <AsMadeCell row={row} mode={mode} draft={draft} openBatch={openBatch} onChangeAsMade={onChangeAsMade} />
                  </td>
                  <td className="ingredient-table__col-numeric">{baselineShare}</td>
                  <td className="ingredient-table__col-step">
                    {row.splitStep ? `${row.step} + ${row.splitStep}` : row.step}
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
            const parsed = Number(draftRow.grams);
            const currentGramsValue = draftRow.grams !== '' && Number.isFinite(parsed) ? parsed : row.grams;
            const currentShare = removed ? null : formatShareOfBatch(currentGramsValue, currentMass);
            const changedGrams = draftRow.grams !== String(row.grams) ? draftRow.grams : null;
            const changedShare = !removed && currentShare !== baselineShare ? { from: baselineShare, to: currentShare } : null;
            const changedStep = draftRow.step !== row.step ? { from: row.step, to: draftRow.step } : null;
            // orphanedRows never names an already-removed row (uses.js), so
            // this flag only ever applies to an active row here.
            const flagged = orphanedRowIds.has(row.id);

            return (
              <tr
                key={row.id}
                className={isMarked ? 'is-marked' : undefined}
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
                    <OrphanedRowFlag row={row} draftVersion={draftVersion} onTogglePenRowRemoved={onTogglePenRowRemoved} />
                  )}
                </td>
                <td className="ingredient-table__col-numeric">
                  <GramsCell row={row} mode={mode} penDraft={penDraft} onChangePenGrams={onChangePenGrams} />
                </td>
                <td className="ingredient-table__col-numeric">
                  <AsMadeCell row={row} mode={mode} draft={draft} openBatch={openBatch} onChangeAsMade={onChangeAsMade} />
                </td>
                <td className="ingredient-table__col-numeric">
                  {removed ? (
                    <span className="struck-value">{baselineShare}</span>
                  ) : (
                    <ShareCell baselineShare={baselineShare} currentShare={currentShare} />
                  )}
                </td>
                <td className="ingredient-table__col-step">
                  <StepCell row={row} penDraft={penDraft} stepOptions={stepOptions} onChangePenRowStep={onChangePenRowStep} />
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
            <td className="ingredient-table__col-numeric">
              {isDeveloping && currentTotalText !== baselineTotalText && (
                <span className="struck-value">{baselineTotalText}</span>
              )}
              {isShowingChanges && diff.total.changed && <span className="struck-value">{diff.total.from}</span>}
              {totalDisplayText}
            </td>
            <td className="ingredient-table__col-numeric">{hasAsMadeLayer ? asMadeTotalText : ''}</td>
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
