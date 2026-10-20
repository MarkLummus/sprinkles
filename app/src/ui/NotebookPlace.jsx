import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router';
import { repository } from '../store/repository.js';
import { activeWork } from '../domain/lastEvent.js';
import { blankCreateDraft, buildDraftRecord, draftMatchesCreate, newestDraft } from '../domain/draft.js';
import { freshId } from '../domain/id.js';
import { notebookPath, NEW_RECIPE_PATH } from './notebookPaths.js';
import { batchCountWords, recipeCountWords, versionCountWords } from './countWords.js';
import { PAGE_LOAD_ERROR } from './RecipePage.jsx';
import { Button } from './Button.jsx';

// The Notebook place (PLACE-02, sketch 012 notebook-place.html): the recipes,
// one row each, in Home's own order. Since Phase 10 it also starts a recipe:
// New recipe at the end of the title row opens the entry (a name, Cancel and
// Start), and a kept creation shows as a draft row with Resume.
export function NotebookPlace() {
  // Shell.jsx increments this after a successful import, so the list reloads
  // what the import just wrote (the same context Home and Search read).
  const storeRevision = useOutletContext();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [failed, setFailed] = useState(false);
  // The kept create draft the place draws as a row (null for none). Start's
  // re-read sets it when a creation is already kept.
  const [draft, setDraft] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setFailed(false);
    Promise.all([repository.getAll(), repository.getAllBatches(), repository.listRecipes()])
      .then(([versions, batches, recipes]) => {
        if (!cancelled) setData({ versions, batches, recipes });
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
      <div className="list-page place nb">
        <h1 className="place__title">Notebook</h1>
        <p className="place__note">{PAGE_LOAD_ERROR}</p>
      </div>
    );
  }
  // Until the read settles the page shows nothing but its title, so the
  // empty panel's words never flash over a store that holds recipes.
  if (data === null) {
    return (
      <div className="list-page place nb">
        <h1 className="place__title">Notebook</h1>
      </div>
    );
  }

  // Start (D-04, D-04b): one create draft is kept at a time. Re-read the
  // drafts first; when one exists, write nothing and draw its row with Resume
  // in place of the entry. Otherwise mint the ids, write a name-only create
  // draft, wait for the write, and only then open the editor.
  async function handleStart(name) {
    const kept = newestDraft((await repository.listDrafts()).filter(draftMatchesCreate));
    if (kept) {
      setDraft(kept);
      return;
    }
    const recipeId = freshId();
    const versionId = freshId();
    const record = buildDraftRecord({
      versionId,
      kind: 'create',
      payload: blankCreateDraft({ recipeId, versionId, name: name.trim() }),
      now: new Date().toISOString(),
    });
    await repository.saveDraft(record);
    navigate(NEW_RECIPE_PATH, { state: { started: true } });
  }

  return (
    <NotebookList
      versions={data.versions}
      batches={data.batches}
      recipes={data.recipes}
      draft={draft}
      onStart={handleStart}
      onResume={() => navigate(NEW_RECIPE_PATH)}
    />
  );
}

// The title row and, while the maker is starting a recipe, the entry under it
// (sketch 013 notebook-new-recipe.html, panels nA1 and nB1). New recipe is
// offered only while no draft is kept and the entry is closed; opening moves
// focus to Name, and the entry's Cancel returns it to New recipe. Start is the
// form's submit button, so a click and Enter take the one path.
function NotebookHead({ draft, onStart }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const nameRef = useRef(null);
  const newRef = useRef(null);
  const returnFocusRef = useRef(false);

  useEffect(() => {
    if (open) {
      nameRef.current?.focus();
    } else if (returnFocusRef.current) {
      returnFocusRef.current = false;
      newRef.current?.focus();
    }
  }, [open]);

  function handleCancel() {
    returnFocusRef.current = true;
    setName('');
    setOpen(false);
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (name.trim() === '') return;
    // A failed read or write is plan 10-03's to say; until then it stays quiet.
    Promise.resolve(onStart?.(name)).catch(() => {});
  }

  return (
    <>
      <div className="nb__head">
        <h1 className="place__title">Notebook</h1>
        {!draft && !open && (
          <Button ref={newRef} className="notebook-action" onClick={() => setOpen(true)}>
            New recipe
          </Button>
        )}
      </div>
      {!draft && open && (
        <form className="nb__new" aria-label="New recipe" onSubmit={handleSubmit}>
          <label className="notebook-field">
            <span className="notebook-caption">Name</span>
            <input
              ref={nameRef}
              type="text"
              className="ink-field"
              autoComplete="off"
              value={name}
              aria-label="Name"
              onChange={(event) => setName(event.target.value)}
            />
          </label>
          <div className="nb__new-actions">
            <Button className="notebook-action--outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" className="notebook-action">
              Start
            </Button>
          </div>
        </form>
      )}
    </>
  );
}

// The kept creation's row (sketch 013 panels nE1 and nD2): the rail, the name
// as text, 'draft' and Resume. It is not a recipe, so the count never counts
// it. The name is a React text child: stored text never reaches the page as
// markup.
function NotebookDraftRow({ draft, onResume }) {
  return (
    <ul className="nb__drafts">
      <li className="nb__draft">
        <span className="nb__rail" aria-hidden="true" />
        <h2 className="nb__name">{draft.payload.name}</h2>
        <p className="nb__meta">
          <span>draft</span>
        </p>
        <span className="nb__draft-act">
          <Button className="notebook-action--outline" onClick={onResume}>
            Resume
          </Button>
        </span>
      </li>
    </ul>
  );
}

// The page over plain props, so it is testable without driving the fetch
// effect (the convention RecipeRows and HomeBody set). Every name and
// description is a React text child: stored text never reaches the page as
// markup (T-09-06).
export function NotebookList({ versions, batches = [], recipes = [], draft = null, onStart, onResume }) {
  const work = activeWork(versions, batches, recipes);
  if (work.length === 0) {
    return (
      <div className="list-page place nb">
        <NotebookHead draft={draft} onStart={onStart} />
        {draft && <NotebookDraftRow draft={draft} onResume={onResume} />}
        <p className="place__note">No recipes yet.</p>
      </div>
    );
  }
  const descriptions = new Map(recipes.map((recipe) => [recipe.id, recipe.description]));
  return (
    <div className="list-page place nb">
      <NotebookHead draft={draft} onStart={onStart} />
      {draft && <NotebookDraftRow draft={draft} onResume={onResume} />}
      <p className="nb__count">{recipeCountWords(work.length)}</p>
      <ul className="nb__list">
        {work.map((entry) => {
          const description = descriptions.get(entry.id);
          return (
            <li key={entry.id} className="nb__row">
              <span className="nb__rail" aria-hidden="true" />
              <h2 className="nb__name">
                <Link to={notebookPath(entry.id, entry.latestVersion.id)} tabIndex={0}>
                  {entry.name}
                </Link>
              </h2>
              {typeof description === 'string' && description.trim() !== '' && (
                <p className="nb__desc">{description}</p>
              )}
              <p className="nb__meta">
                <span>{versionCountWords(entry.versions.length)}</span>
                <span className="nb__dot" aria-hidden="true">·</span>
                <span>{batchCountWords(entry.batches.length)}</span>
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
