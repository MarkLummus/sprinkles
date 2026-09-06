import { computeBalance } from '../domain/composition.js';

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
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id}>
            <td>{row.ingredientName}</td>
            <td>{row.grams} g</td>
            <td>{balance ? `${((100 * row.grams) / balance.mass).toFixed(1)}%` : '—'}</td>
            <td>{row.splitStep ? `${row.step} + ${row.splitStep}` : row.step}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
