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

function rowAccessibleLabel(row, dataFlag) {
  const parts = [row.ingredientName, `${row.grams} g`];
  if (dataFlag) parts.push(dataFlag);
  return parts.join(', ');
}

// The twelve rows in the version's authored order — the printed sheet's
// order. Never sort, never re-order, never group.
export function IngredientTable({ rows }) {
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
          return (
            <tr key={row.id} aria-label={rowAccessibleLabel(row, dataFlag)}>
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
