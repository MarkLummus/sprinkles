import { useEffect, useRef, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router';
import { repository } from '../store/repository.js';
import { codeProblem, findVersionsByCode } from '../domain/sheetCode.js';
import { notebookPath } from './notebookPaths.js';
import { Button } from './Button.jsx';

// D-13, UX1-03: one line, words only, no second line.
export const SHEET_CODE_NO_MATCH = 'No version has this code.';

// WR-07: the sentence for a store it cannot read. No storage words (Mark chose
// "look up"). Find stays off, so trying again is the way on.
export const SHEET_CODE_STORE_ERROR = 'Couldn’t look up that code. Try again.';

// WR-07: a code that cannot be a code says why, told apart from a sheet
// nothing has. Mark approved these lines on 2026-10-12. The same day he put
// length first and folded an empty field into it, so it reads 0.
export const SHEET_CODE_WRONG_LENGTH = (count) =>
  `A Sheet code has eight letters and numbers. This one has ${count}.`;
export const SHEET_CODE_LETTER_U = 'Sheet codes never use the letter U.';
export const SHEET_CODE_OTHER_CHARACTER = 'Sheet codes use only letters and numbers.';

function problemLine(problem) {
  switch (problem.reason) {
    case 'other-character':
      return SHEET_CODE_OTHER_CHARACTER;
    case 'letter-u':
      return SHEET_CODE_LETTER_U;
    default:
      return SHEET_CODE_WRONG_LENGTH(problem.count);
  }
}

const RESULT_ID = 'sheet-code-result';

// The Search route's body (D-09 to D-13): the Sheet code field, and the
// lookup over every stored version. The code is read from each version's stored
// sheetCode field (D-06, domain/sheetCode.js); nothing is hashed at search time
// and no separate index exists. A match opens
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
    repository
      .listVersions()
      .then((loaded) => {
        if (!cancelled) setVersions(loaded);
      })
      .catch(() => {
        if (!cancelled) setResult(SHEET_CODE_STORE_ERROR);
      });
    return () => {
      cancelled = true;
    };
  }, [storeRevision]);

  function handleSubmit(event) {
    event.preventDefault();
    if (versions === null) return;
    // An identical line set twice is no change, so a polite live region stays
    // silent. Emptying it first and writing the line on the next frame makes a
    // repeat a change. A microtask is too soon: it runs before the page
    // renders, so the empty region is never seen.
    setResult('');
    let line = SHEET_CODE_NO_MATCH;
    const problem = codeProblem(code);
    if (problem !== null) {
      line = problemLine(problem);
    } else {
      const [match] = findVersionsByCode(versions, code);
      if (match) {
        navigate(notebookPath(match.recipeId, match.id));
        return;
      }
    }
    fieldRef.current?.focus();
    requestAnimationFrame(() => setResult(line));
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
          />
        </label>
        <Button type="submit" className="notebook-action" disabled={versions === null}>Find</Button>
      </form>
      <p id={RESULT_ID} className="place__note" role="status" aria-live="polite">
        {result}
      </p>
    </div>
  );
}
