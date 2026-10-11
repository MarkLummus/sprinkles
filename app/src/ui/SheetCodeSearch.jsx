import { useEffect, useRef, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router';
import { repository } from '../store/repository.js';
import { findVersionsByCode } from '../domain/sheetCode.js';
import { notebookPath } from './notebookPaths.js';
import { Button } from './Button.jsx';

// D-13, UX1-03: one line, words only, no second line.
export const SHEET_CODE_NO_MATCH = 'No version has this code.';

const RESULT_ID = 'sheet-code-result';

// The Search route's body (D-09 to D-13): the Sheet code field, and the
// lookup over every stored version. The code is computed from each version on
// the spot (domain/sheetCode.js); nothing stores or indexes one. A match opens
// that version's own Notebook page, built by notebookPath from the stored
// version's ids, never from what was typed (T-04-03). The frame is the unbuilt
// place's (Placeholder.jsx), so the shell's rail and the page gutter match.
export function SheetCodeSearch() {
  // Shell.jsx increments this after a successful import, so the lookup reads
  // the versions the import just wrote (the same context RecipeList reads).
  const storeRevision = useOutletContext();
  const navigate = useNavigate();
  const fieldRef = useRef(null);
  const [versions, setVersions] = useState(null);
  const [code, setCode] = useState('');
  const [result, setResult] = useState('');

  useEffect(() => {
    let cancelled = false;
    repository.listVersions().then((loaded) => {
      if (!cancelled) setVersions(loaded);
    });
    return () => {
      cancelled = true;
    };
  }, [storeRevision]);

  function handleSubmit(event) {
    event.preventDefault();
    const [match] = findVersionsByCode(versions ?? [], code);
    if (match) {
      navigate(notebookPath(match.recipeId, match.id));
      return;
    }
    setResult(SHEET_CODE_NO_MATCH);
    fieldRef.current?.focus();
  }

  return (
    <div className="list-page place">
      <h1 className="place__title">Search</h1>
      <form className="search__form" onSubmit={handleSubmit} noValidate>
        <label className="notebook-field">
          <span className="notebook-caption">Sheet code</span>
          <input
            ref={fieldRef}
            className="ink-field"
            type="text"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            enterKeyHint="go"
            aria-describedby={RESULT_ID}
          />
        </label>
        <Button type="submit" className="notebook-action">Find</Button>
      </form>
      <p id={RESULT_ID} className="place__note" role="status" aria-live="polite">
        {result}
      </p>
    </div>
  );
}
