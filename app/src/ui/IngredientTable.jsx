import { computeBalance, formatShareOfBatch, formatGrams } from '../domain/composition.js';
import { hasAsMade, asMadeFor, asMadeTotals } from '../domain/batch.js';
import { activeRows } from '../domain/rows.js';

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

// changedGrams is the pen's current typed value when it differs from the
// value the pen opened on (route-recipe-version.md § 6): the strike is
// never the only carrier of a change (D-10), so the accessible name reads
// "was 40 g, now 48 g" rather than just "40 g".
function rowAccessibleLabel(row, dataFlag, isMarked, markedFigureLabel, asMadeValue, changedGrams = null) {
  const gramsPhrase = changedGrams != null ? `was ${row.grams} g, now ${changedGrams} g` : `${row.grams} g`;
  const parts = [row.ingredientName, gramsPhrase];
  if (dataFlag) parts.push(dataFlag);
  if (isMarked) parts.push(`contributing to ${markedFigureLabel}`);
  if (asMadeValue !== null) parts.push(`as made ${asMadeValue} g`);
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
  const draftValue = Object.prototype.hasOwnProperty.call(penDraft.rows, row.id) ? penDraft.rows[row.id] : '';
  const changed = draftValue !== String(row.grams);
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

// The as-made cell (route-recipe-batch.md § 3): blank by default, a numeric
// field bound to the draft while recording, and the stored value — read
// through asMadeFor, never the row's own plan grams — once a saved batch's
// layer is showing. Blank stays blank; the plan never leaks into this
// column under any circumstance.
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
// changes only outline and weight, and moves nothing.
export function IngredientTable({
  rows,
  markedRowIds = [],
  markedFigureLabel = '',
  mode = 'reading',
  draft = null,
  penDraft = null,
  openBatch = null,
  onChangeAsMade = () => {},
  onChangePenGrams = () => {},
}) {
  // The share denominator and the totals are computed from activeRows, so
  // a removed row contributes nothing to either while still rendering,
  // struck, in the pen's own table (RESEARCH.md Pitfall 2). No row is
  // removable yet (03-02), so this is a no-op filter today.
  const activeRowsOnly = activeRows({ rows });
  const balance = computeBalance(activeRowsOnly);

  // The as-made total appears only while an as-made layer is showing —
  // recording, or a saved batch reading (D-22). Reading the plan total
  // needs no as-made source at all, so it is always computed.
  const hasAsMadeLayer = mode === 'recording' || Boolean(openBatch);
  const asMadeSource = mode === 'recording' ? draft.asMade : openBatch ? openBatch.churn.asMade : {};
  const { planTotal, asMadeTotal } = asMadeTotals(activeRowsOnly, asMadeSource);
  const planTotalText = formatGrams(planTotal);
  const asMadeTotalText = formatGrams(asMadeTotal);

  return (
    <>
      <table className="ingredient-table">
        <thead>
          <tr>
            <th scope="col">Ingredient</th>
            <th scope="col">Grams</th>
            <th scope="col">As made</th>
            <th scope="col">% of batch</th>
            <th scope="col">Step</th>
            <th scope="col">Data</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const dataFlag = dataFlagFor(row);
            const isMarked = markedRowIds.includes(row.id);
            const asMadeValue =
              mode !== 'recording' && openBatch && hasAsMade(openBatch, row.id) ? asMadeFor(openBatch, row.id) : null;
            const penGramsValue =
              mode === 'developing' && penDraft && Object.prototype.hasOwnProperty.call(penDraft.rows, row.id)
                ? penDraft.rows[row.id]
                : undefined;
            const changedGrams = penGramsValue !== undefined && penGramsValue !== String(row.grams) ? penGramsValue : null;
            return (
              <tr
                key={row.id}
                className={isMarked ? 'is-marked' : undefined}
                aria-label={rowAccessibleLabel(row, dataFlag, isMarked, markedFigureLabel, asMadeValue, changedGrams)}
              >
                <td>{row.ingredientName}</td>
                <td>
                  <GramsCell row={row} mode={mode} penDraft={penDraft} onChangePenGrams={onChangePenGrams} />
                </td>
                <td>
                  <AsMadeCell row={row} mode={mode} draft={draft} openBatch={openBatch} onChangeAsMade={onChangeAsMade} />
                </td>
                <td>{formatShareOfBatch(row.grams, balance ? balance.mass : 0)}</td>
                <td>{row.splitStep ? `${row.step} + ${row.splitStep}` : row.step}</td>
                <td>{dataFlag}</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr
            aria-label={
              hasAsMadeLayer
                ? `Total, plan ${planTotalText.replace(' g', ' grams')}, as made ${asMadeTotalText.replace(' g', ' grams')}`
                : `Total, plan ${planTotalText.replace(' g', ' grams')}`
            }
          >
            <td>Total</td>
            <td>{planTotalText}</td>
            <td>{hasAsMadeLayer ? asMadeTotalText : ''}</td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
        </tfoot>
      </table>
      {hasAsMadeLayer && (
        <p className="table-small-print">As made totals what was written; the plan fills in where nothing was.</p>
      )}
    </>
  );
}
