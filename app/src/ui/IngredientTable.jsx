import { computeBalance } from '../domain/composition.js';

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

function rowAccessibleLabel(row, dataFlag, isMarked, markedFigureLabel) {
  const parts = [row.ingredientName, `${row.grams} g`];
  if (dataFlag) parts.push(dataFlag);
  if (isMarked) parts.push(`contributing to ${markedFigureLabel}`);
  return parts.join(', ');
}

// The twelve rows in the version's authored order — the printed sheet's
// order. Never sort, never re-order, never group. `markedRowIds` is the
// focused figure's contributorRowIds (route-recipe.md § 3, § 5) — marking
// changes only outline and weight, and moves nothing.
export function IngredientTable({ rows, markedRowIds = [], markedFigureLabel = '' }) {
  const balance = computeBalance(rows);

  return (
    <table className="ingredient-table">
      <thead>
        <tr>
          <th scope="col">Ingredient</th>
          <th scope="col">Grams</th>
          <th scope="col">% of batch</th>
          <th scope="col">Step</th>
          <th scope="col">Data</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => {
          const dataFlag = dataFlagFor(row);
          const isMarked = markedRowIds.includes(row.id);
          return (
            <tr
              key={row.id}
              className={isMarked ? 'is-marked' : undefined}
              aria-label={rowAccessibleLabel(row, dataFlag, isMarked, markedFigureLabel)}
            >
              <td>{row.ingredientName}</td>
              <td>{row.grams} g</td>
              <td>{balance ? `${((100 * row.grams) / balance.mass).toFixed(1)}%` : '—'}</td>
              <td>{row.splitStep ? `${row.step} + ${row.splitStep}` : row.step}</td>
              <td>{dataFlag}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
