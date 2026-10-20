import { useEffect, useRef, useState } from 'react';
import { Button } from './Button.jsx';
import { filterLibrary, libraryCategories } from '../domain/ingredientSearch.js';
import { ingredientCountWords } from './countWords.js';
import { capitalised, summaryText } from './IngredientsPlace.jsx';

// The ingredient picker under the creation table (Phase 10, MAKE-06, sketch 013
// ingredient-picker.html): it opens in the place of Add ingredient and finds as
// the Ingredients place does (Name, Category, the polite count, Clear filters),
// each row showing the name, the category and the place's summary. Only a
// library record's own row adds: an entry already on the recipe reads Added and
// does nothing, and a name that matches nothing says it is not in the library
// and adds nothing (decisions 4 and 7). Every entry's text renders as text.

const ALL = 'All';

// A category word only when the entry holds a non-blank string; the summary
// joins only the parts it has, so an entry with no non-zero figure reads its
// category alone and never ends in a separator (T-10-28).
function rowSummary(entry) {
  const category = typeof entry.category === 'string' && entry.category.trim() !== '' ? capitalised(entry.category) : '';
  return [category, summaryText(entry)].filter((part) => part !== '').join(' · ');
}

export function IngredientPicker({ records, addedIds, onPick, onCancel }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState(ALL);
  const nameRef = useRef(null);

  // Opening the picker moves focus to Name.
  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  const categories = libraryCategories(records);
  const shown = filterLibrary(records, query, category);
  const filtered = query.trim() !== '' || category !== ALL;

  function clearFilters() {
    setQuery('');
    setCategory(ALL);
    // The button leaves the page with the filters; focus goes to the field the
    // maker types in rather than to nothing.
    nameRef.current?.focus();
  }

  return (
    <div className="pick" role="group" aria-label="Add ingredient">
      <div className="pick__head">
        <span className="pen-caption">Add ingredient</span>
        <Button className="text-control" onClick={onCancel}>
          Cancel
        </Button>
      </div>
      {/* The only text field is Name, so Enter would submit the form and reload
          the page. Nothing submits: the filters apply as they are typed. */}
      <form className="ing__filters" role="search" aria-label="Ingredients" onSubmit={(event) => event.preventDefault()}>
        <label className="notebook-field ing__field">
          <span className="notebook-caption">Name</span>
          <input
            ref={nameRef}
            className="ink-field"
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            autoComplete="off"
            spellCheck={false}
            enterKeyHint="search"
          />
        </label>
        <label className="notebook-field ing__field ing__field--category">
          <span className="notebook-caption">Category</span>
          {/* The tabindex scan cannot see a select, and WebKit without Safari's
              tab-to-highlight preference Tabs only into controls that carry an
              explicit tabindex (D-15). */}
          <select className="ink-field" value={category} onChange={(event) => setCategory(event.target.value)} tabIndex={0}>
            <option value={ALL}>{ALL}</option>
            {categories.map((word) => (
              <option key={word} value={word}>
                {capitalised(word)}
              </option>
            ))}
          </select>
        </label>
      </form>
      <div className="ing__status">
        <p className="ing__count" role="status" aria-live="polite">
          {ingredientCountWords(shown.length, records.length, filtered)}
        </p>
        {filtered && (
          <Button className="notebook-link ing__clear" onClick={clearFilters}>
            Clear filters
          </Button>
        )}
      </div>
      {shown.length === 0 ? (
        <p className="pick__none" role="status">
          Not in the library yet
        </p>
      ) : (
        <ul className="pick__list">
          {shown.map((record) => {
            const added = addedIds.has(record.id);
            return (
              <li key={record.id}>
                <Button
                  className={added ? 'pick__row pick__row--added' : 'pick__row'}
                  aria-disabled={added ? 'true' : undefined}
                  onClick={added ? undefined : () => onPick(record)}
                >
                  <span className="pick__name">{record.entry.name}</span>
                  <span className="pick__sum">{rowSummary(record.entry)}</span>
                  <span className="pick__act">{added ? 'Added' : 'Add'}</span>
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
