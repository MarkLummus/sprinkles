import { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router';
import { repository } from '../store/repository.js';
import { activeWork } from '../domain/lastEvent.js';
import { notebookPath } from './notebookPaths.js';
import { batchCountWords, recipeCountWords, versionCountWords } from './countWords.js';
import { PAGE_LOAD_ERROR } from './RecipePage.jsx';

// The Notebook place (PLACE-02, sketch 012 notebook-place.html): the recipes,
// one row each, in Home's own order. It starts nothing: no New recipe, no
// Resume, and no room held for them (creation arrives in Phase 10).
export function NotebookPlace() {
  // Shell.jsx increments this after a successful import, so the list reloads
  // what the import just wrote (the same context Home and Search read).
  const storeRevision = useOutletContext();
  const [data, setData] = useState(null);
  const [failed, setFailed] = useState(false);

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
  return <NotebookList versions={data.versions} batches={data.batches} recipes={data.recipes} />;
}

// The page over plain props, so it is testable without driving the fetch
// effect (the convention RecipeRows and HomeBody set). Every name and
// description is a React text child: stored text never reaches the page as
// markup (T-09-06).
export function NotebookList({ versions, batches = [], recipes = [] }) {
  const work = activeWork(versions, batches, recipes);
  if (work.length === 0) {
    return (
      <div className="list-page place nb">
        <h1 className="place__title">Notebook</h1>
        <p className="place__note">No recipes yet.</p>
      </div>
    );
  }
  const descriptions = new Map(recipes.map((recipe) => [recipe.id, recipe.description]));
  return (
    <div className="list-page place nb">
      <h1 className="place__title">Notebook</h1>
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
