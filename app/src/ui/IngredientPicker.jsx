import { Button } from './Button.jsx';
import { filterLibrary } from '../domain/ingredientSearch.js';

// The ingredient picker under the creation table (Phase 10, MAKE-06, sketch 013
// ingredient-picker.html kA1): it opens in the place of Add ingredient, lists
// the library A to Z, and a pick calls onPick with the record. Its filters, its
// count, its summaries, Added and "Not in the library yet" are plan 10-12's
// (which also reads `addedIds`; this plan's picker does not). Only each entry's
// validated name is drawn, as text.
export function IngredientPicker({ records, onPick, onCancel }) {
  return (
    <div className="pick" role="group" aria-label="Add ingredient">
      <div className="pick__head">
        <span className="pen-caption">Add ingredient</span>
        <Button className="text-control" onClick={onCancel}>
          Cancel
        </Button>
      </div>
      <ul className="pick__list">
        {filterLibrary(records, '', 'All').map((record) => (
          <li key={record.id}>
            <Button className="pick__row" onClick={() => onPick(record)}>
              <span className="pick__name">{record.entry.name}</span>
              <span className="pick__act">Add</span>
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
