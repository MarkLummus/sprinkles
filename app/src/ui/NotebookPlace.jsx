import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useOutletContext } from 'react-router';
import { repository } from '../store/repository.js';
import { activeWork } from '../domain/lastEvent.js';
import { blankCreateDraft, buildDraftRecord, draftMatchesCreate, newestDraft } from '../domain/draft.js';
import { creationTitle } from '../domain/creation.js';
import { RECIPE_NAME_TAKEN, recipeNameMessage, recipeNameTaken } from '../domain/recipe.js';
import { freshId } from '../domain/id.js';
import { notebookPath, NEW_RECIPE_PATH } from './notebookPaths.js';
import { batchCountWords, recipeCountWords, versionCountWords } from './countWords.js';
import { PAGE_LOAD_ERROR } from './RecipePage.jsx';
import { Button } from './Button.jsx';
import { PageNotice, usePageNotice } from './PageNotice.jsx';
import { FieldFeedback } from './FieldFeedback.jsx';

export const DRAFT_DISCARDED_STATUS = 'Draft discarded.';

// The Notebook place (PLACE-02, sketch 012 notebook-place.html): the recipes,
// one row each, in Home's own order. Since Phase 10 it also starts a recipe:
// New recipe at the end of the title row opens the entry (a name, Cancel and
// Start), and a kept creation shows as a draft row with Resume.
export function NotebookPlace() {
  // Shell.jsx increments this after a successful import, so the list reloads
  // what the import just wrote (the same context Home and Search read).
  const storeRevision = useOutletContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [notice, announce] = usePageNotice();
  const [data, setData] = useState(null);
  const [failed, setFailed] = useState(false);
  // The kept create draft the place draws as a row (null for none). The read
  // at load sets it, and so does Start's re-read when a creation is kept.
  const [draft, setDraft] = useState(null);
  // Start's lifetime. startingRef is set while a Start is out, so a second
  // press writes nothing. withdrawnRef is set by the entry's Cancel, and
  // mountedRef is cleared when the place is left: either one stops the move
  // into the editor when the write resolves (D-04: the write itself stands).
  const startingRef = useRef(false);
  const withdrawnRef = useRef(false);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setFailed(false);
    Promise.all([repository.getAll(), repository.getAllBatches(), repository.listRecipes(), repository.listDrafts()])
      .then(([versions, batches, recipes, drafts]) => {
        if (cancelled) return;
        // One create draft is kept at a time (decision 10): the newest is the
        // row. A plan or record draft is not a creation and shows no row.
        setDraft(newestDraft(drafts.filter(draftMatchesCreate)) ?? null);
        setData({ versions, batches, recipes });
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [storeRevision]);

  // Cancel in the creation editor lands here with the flag { discarded: true }
  // (a flag, never text: the words are this file's own constant). It is read
  // once and the entry's state replaced with null, so Back or a reload never
  // repeats the notice (the useRouteIntents pattern). The effect depends on the
  // state alone, so once it is null the effect has nothing left to read.
  useEffect(() => {
    if (location.state?.discarded !== true) return;
    announce(DRAFT_DISCARDED_STATUS);
    navigate({ pathname: location.pathname }, { replace: true, state: null });
  }, [location.state]);

  if (failed) {
    return (
      <>
        <PageNotice message={notice} />
        <div className="list-page place nb">
          <h1 className="place__title">Notebook</h1>
          <p className="place__note">{PAGE_LOAD_ERROR}</p>
        </div>
      </>
    );
  }
  // Until the read settles the page shows nothing but its title, so the
  // empty panel's words never flash over a store that holds recipes.
  if (data === null) {
    return (
      <>
        <PageNotice message={notice} />
        <div className="list-page place nb">
          <h1 className="place__title">Notebook</h1>
        </div>
      </>
    );
  }

  // Start (D-04, D-04b): one create draft is kept at a time. Re-read the
  // drafts first; when one exists, write nothing and draw its row with Resume
  // in place of the entry. Otherwise mint the ids, write a name-only create
  // draft, wait for the write, and only then open the editor. The write is
  // never withdrawn: a Cancel on the entry or a departure while it is out stops
  // only the move, and a place still shown draws the draft it wrote.
  async function handleStart(name) {
    if (startingRef.current) return;
    startingRef.current = true;
    withdrawnRef.current = false;
    try {
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
      if (!mountedRef.current) return;
      if (withdrawnRef.current) setDraft(record);
      else navigate(NEW_RECIPE_PATH, { state: { started: true } });
    } catch {
      if (mountedRef.current) announce(PAGE_LOAD_ERROR);
    } finally {
      startingRef.current = false;
    }
  }

  return (
    <>
      <PageNotice message={notice} />
      <NotebookList
        versions={data.versions}
        batches={data.batches}
        recipes={data.recipes}
        draft={draft}
        onStart={handleStart}
        onCancel={() => {
          withdrawnRef.current = true;
        }}
        onResume={() => navigate(NEW_RECIPE_PATH)}
      />
    </>
  );
}

// The title row and, while the maker is starting a recipe, the entry under it
// (sketch 013 notebook-new-recipe.html, panels nA1 and nB1). New recipe is
// offered only while no draft is kept and the entry is closed; opening moves
// focus to Name, and the entry's Cancel returns it to New recipe. Start is the
// form's submit button, so a click and Enter take the one path.
function NotebookHead({ draft, recipes, onStart, onCancel }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  // Set when Start is pressed over a blank name; the next keystroke clears it.
  const [required, setRequired] = useState(false);
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
    setRequired(false);
    setOpen(false);
    onCancel?.();
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (recipeNameMessage(name)) {
      setRequired(true);
      return;
    }
    onStart?.(name);
  }

  // The one line under the field: the required sentence after a refused Start,
  // else the same-name warning (decisions 1 and 11), which never blocks.
  const line = required
    ? recipeNameMessage(name)
    : recipeNameTaken(recipes, name)
      ? RECIPE_NAME_TAKEN
      : null;

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
              aria-invalid={required ? 'true' : undefined}
              aria-describedby={line ? 'nb-new-name-error' : undefined}
              onChange={(event) => {
                setName(event.target.value);
                setRequired(false);
              }}
            />
            <FieldFeedback error={line} errorId="nb-new-name-error" />
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
// as text ('Untitled' while blank, D-08c), 'draft' and Resume. It is not a
// recipe, so the count never counts it. The name is a React text child: stored
// text never reaches the page as markup.
function NotebookDraftRow({ draft, onResume }) {
  return (
    <ul className="nb__drafts">
      <li className="nb__draft">
        <span className="nb__rail" aria-hidden="true" />
        <h2 className="nb__name">{creationTitle(draft.payload.name)}</h2>
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
export function NotebookList({ versions, batches = [], recipes = [], draft = null, onStart, onCancel, onResume }) {
  const work = activeWork(versions, batches, recipes);
  if (work.length === 0) {
    return (
      <div className="list-page place nb">
        <NotebookHead draft={draft} recipes={recipes} onStart={onStart} onCancel={onCancel} />
        {draft && <NotebookDraftRow draft={draft} onResume={onResume} />}
        <p className="place__note">No recipes yet.</p>
      </div>
    );
  }
  const descriptions = new Map(recipes.map((recipe) => [recipe.id, recipe.description]));
  return (
    <div className="list-page place nb">
      <NotebookHead draft={draft} recipes={recipes} onStart={onStart} onCancel={onCancel} />
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
