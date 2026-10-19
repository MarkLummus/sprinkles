import { useEffect, useId, useRef, useState } from 'react';
import { useOutletContext } from 'react-router';
import { repository } from '../store/repository.js';
import { filterLibrary, libraryCategories } from '../domain/ingredientSearch.js';
import { FIGURE_SPECS, figureLabelText } from '../domain/figures.js';
import { ingredientCountWords } from './countWords.js';
import { basisWord } from './IngredientTable.jsx';
import { Button } from './Button.jsx';
import { PAGE_LOAD_ERROR } from './RecipePage.jsx';

// The Ingredients place (PLACE-01, sketch 012 ingredients-place.html): the
// library, read-only. It finds by name and category and opens an entry in
// place to show its figures with their basis and source. Nothing here adds,
// edits, duplicates or deletes an entry: the component calls
// repository.listLibrary() and no write method (T-09-07).

const ALL = 'All';

// The figure rows in the board's order. The labels the Sheet already uses
// come from figures.js so the words stay one set; the three the Sheet never
// names on their own are the board's words (Other solids, Emulsifier,
// Stabilizer). `word` is the short form the closed row's summary uses.
const SPEC_LABELS = Object.fromEntries(FIGURE_SPECS.map((spec) => [spec.key, spec.label]));
const FIGURES = [
  { key: 'fat', percent: true, label: figureLabelText(SPEC_LABELS.fat), word: SPEC_LABELS.fat.word },
  { key: 'msnf', percent: true, label: figureLabelText(SPEC_LABELS.msnf), word: SPEC_LABELS.msnf.word },
  { key: 'sugar', percent: true, label: figureLabelText(SPEC_LABELS.sugar), word: SPEC_LABELS.sugar.word },
  { key: 'other', percent: true, label: 'Other solids', word: 'Other solids' },
  { key: 'emulsifier', percent: true, label: 'Emulsifier', word: 'Emulsifier' },
  { key: 'stabilizer', percent: true, label: 'Stabilizer', word: 'Stabilizer' },
  { key: 'pac', percent: false, label: figureLabelText(SPEC_LABELS.pac), word: SPEC_LABELS.pac.word },
  { key: 'pod', percent: false, label: figureLabelText(SPEC_LABELS.pod), word: SPEC_LABELS.pod.word },
];

const BASIS_VALUES = ['stated', 'derived', 'estimated', 'inherited'];
const NOT_RECORDED = 'not recorded';

// At most `decimals` decimals, trailing zeros trimmed, a true minus sign.
function trimmed(value, decimals) {
  let text = value.toFixed(decimals);
  if (text.includes('.')) text = text.replace(/0+$/, '').replace(/\.$/, '');
  if (Number(text) === 0) return '0';
  return text.startsWith('-') ? `−${text.slice(1)}` : text;
}

function amountText(figure, value) {
  return figure.percent ? `${trimmed(value * 100, 2)}%` : trimmed(value, 2);
}

function capitalised(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

// The one door from a stored entry to the page. The library validator checks
// only an entry's id, name and composition numbers, so every other display
// field is read here and kept only when it has the type the place reads; a
// field of any other type is dropped, never thrown on (T-09-34). Text stays
// text: React renders each value as a child, never as markup (T-09-06).
function shownFields(entry) {
  const text = (value) => (typeof value === 'string' && value.trim() !== '' ? value : null);
  const number = (value) => (typeof value === 'number' && Number.isFinite(value) ? value : null);
  const table = (value) => (value !== null && typeof value === 'object' && !Array.isArray(value) ? value : {});
  const basis = table(entry.basis);
  const source = table(entry.source);
  return {
    category: text(entry.category),
    heatTreatment: text(entry.heatTreatment),
    packedState: text(entry.packedState),
    note: text(entry.note),
    density: number(entry.densityGPerMl),
    hydrationC: number(entry.hydrationC),
    dairy: entry.dairy === true,
    // A basis the entry never states was never reviewed ('inherited', as the
    // Sheet's table reads it); a stated value outside the four words is not
    // a basis the place can name.
    basisOf: (field) => {
      const value = basis[field];
      if (value === undefined) return basisWord('inherited');
      return BASIS_VALUES.includes(value) ? basisWord(value) : NOT_RECORDED;
    },
    sourceOf: (field) => text(source[field]) ?? NOT_RECORDED,
  };
}

// The figures an entry holds, in the board's order. Composition numbers are
// validated at the door, so a held figure is a finite number.
function heldFigures(entry) {
  return FIGURES.filter((figure) => Number.isFinite(entry.composition[figure.key]));
}

function summaryText(entry) {
  return FIGURES.filter((figure) => entry.composition[figure.key])
    .map((figure) => `${figure.word} ${amountText(figure, entry.composition[figure.key])}`)
    .join(' · ');
}

// The facts line, value first: density with its word, then the heat-treatment
// and packed-state values on their own with the first letter capitalised, then
// the stored hydration temperature in °C. A middle dot joins them in that
// order, each only where the entry has it.
function factsText(fields) {
  const facts = [];
  if (fields.density !== null) facts.push(`Density ${trimmed(fields.density, 3)} g/ml`);
  if (fields.heatTreatment !== null) facts.push(capitalised(fields.heatTreatment));
  if (fields.packedState !== null) facts.push(capitalised(fields.packedState));
  if (fields.hydrationC !== null) facts.push(`Hydrates at ${trimmed(fields.hydrationC, 2)} °C`);
  return facts.join(' · ');
}

export function IngredientsPlace() {
  // Shell.jsx increments this after a successful import, so the list reads
  // the library the import just wrote (the same context Home and Search read).
  const storeRevision = useOutletContext();
  const [records, setRecords] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setFailed(false);
    repository
      .listLibrary()
      .then((loaded) => {
        if (!cancelled) setRecords(loaded);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [storeRevision]);

  if (failed) {
    return (
      <div className="list-page place ing">
        <h1 className="place__title">Ingredients</h1>
        <p className="place__note">{PAGE_LOAD_ERROR}</p>
      </div>
    );
  }
  if (records === null) {
    return (
      <div className="list-page place ing">
        <h1 className="place__title">Ingredients</h1>
      </div>
    );
  }
  return <IngredientsList records={records} />;
}

// The page over plain records ({ id, entry }, as listLibrary returns them), so
// it is testable without driving the fetch effect. The filters, the count and
// the open entries live in this component's state.
export function IngredientsList({ records }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState(ALL);
  const [open, setOpen] = useState(() => new Set());
  const nameRef = useRef(null);
  const idBase = useId();

  const categories = libraryCategories(records);
  const shown = filterLibrary(records, query, category);
  const filtered = query.trim() !== '' || category !== ALL;

  function toggle(id) {
    setOpen((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function clearFilters() {
    setQuery('');
    setCategory(ALL);
    // The button leaves the page with the filters; focus goes to the field
    // the maker types in rather than to nothing.
    nameRef.current?.focus();
  }

  return (
    <div className="list-page place ing">
      <h1 className="place__title">Ingredients</h1>
      {/* The only text field is Name, so Enter would submit the form and
          reload the page. Nothing submits: the filters apply as they are
          typed, and the default is prevented (SheetCodeSearch does the
          same). */}
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
          {/* The tabindex scan cannot see a select, and WebKit without
              Safari's tab-to-highlight preference Tabs only into controls
              that carry an explicit tabindex (D-15). */}
          <select
            className="ink-field"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            tabIndex={0}
          >
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
        <p className="place__note ing__none">No ingredient matches. Try another name or category.</p>
      ) : (
        <ul className="ing__list">
          {shown.map((record, index) => (
            <IngredientRow
              key={record.id}
              entry={record.entry}
              isOpen={open.has(record.id)}
              detailId={`${idBase}-ing-${index}`}
              onToggle={() => toggle(record.id)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function IngredientRow({ entry, isOpen, detailId, onToggle }) {
  const fields = shownFields(entry);
  return (
    <li className="ing__row">
      <span className="ing__rail" aria-hidden="true" />
      <Button className="ing__head" aria-expanded={isOpen} aria-controls={detailId} onClick={onToggle}>
        <span className="ing__name">{entry.name}</span>
        <span className="ing__meta">
          <span className="ing__cat">{fields.category === null ? null : capitalised(fields.category)}</span>
          <span className="ing__sum">{summaryText(entry)}</span>
        </span>
        <span className="ing__control">{isOpen ? 'Hide' : 'Show'}</span>
      </Button>
      {isOpen && <IngredientDetail entry={entry} fields={fields} id={detailId} />}
    </li>
  );
}

// An open entry: its figures with basis and source, then the lines it has
// (facts, lactose for dairy, the Note), each only where the entry has it.
// Nothing is drawn as a dash or "none".
function IngredientDetail({ entry, fields, id }) {
  const facts = factsText(fields);
  return (
    <div className="ing__detail" id={id}>
      <table className="ing__figures">
        <thead>
          <tr>
            <th scope="col">Figure</th>
            <th scope="col" className="ing__amount">Amount</th>
            <th scope="col">Basis</th>
            <th scope="col">Source</th>
          </tr>
        </thead>
        <tbody>
          {heldFigures(entry).map((figure) => {
            const source = fields.sourceOf(figure.key);
            return (
              <tr key={figure.key}>
                <th scope="row">{figure.label}</th>
                <td className="ing__amount">{amountText(figure, entry.composition[figure.key])}</td>
                <td className="ing__basis">{fields.basisOf(figure.key)}</td>
                <td className={source === NOT_RECORDED ? 'ing__source ing__unsaid' : 'ing__source'}>{source}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {facts !== '' && <p className="ing__facts">{facts}</p>}
      {fields.dairy && (
        <p className="ing__helper">Lactose counts as 54.5% of milk solids in Freezing and Sweetness.</p>
      )}
      {fields.note !== null && (
        <>
          <p className="notebook-caption ing__note-cap">Note</p>
          <p className="ing__note">{fields.note}</p>
        </>
      )}
    </div>
  );
}
