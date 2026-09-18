import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { repository } from '../store/repository.js';
import { computeBalance } from '../domain/composition.js';
import { activeRows } from '../domain/rows.js';
import { latestVersionPerRecipe, sortedVersions, versionsForRecipe, versionIdentity } from '../domain/lineage.js';
import { sortedBatches } from '../domain/batch.js';
import { exportStore, importStore } from '../store/transfer.js';
import { recipeHueByRecipeId } from './recipe-colour.js';

// The arrival — The Sprinkles Jar (.impeccable/surfaces/route.md,
// 260918-gha), built in the world outside the three paper frames. The
// outer element keeps its one existing class, once: two live assertions
// (cross-cutting.test.js) depend on that class name's attribute string
// appearing exactly once in this file's own source, and on app.css's
// matching rule staying the page's one inline gutter, so the Jar world
// renders in a child under its own root class, "home", rather than by
// extending that outer element's class.
export function RecipeList() {
  const [versions, setVersions] = useState(null);
  const [batches, setBatches] = useState([]);
  const [importErrors, setImportErrors] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([repository.listVersions(), repository.getAllBatches()]).then(([loadedVersions, loadedBatches]) => {
      if (!cancelled) {
        setVersions(loadedVersions);
        setBatches(loadedBatches);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Export hands the maker a file, using the browser's own object URL and
  // an anchor click — no upload, no network, no external service (D-06).
  async function handleExport() {
    const exported = await exportStore(repository);
    const blob = new Blob([JSON.stringify(exported, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'sprinkles-store.json';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  // Import reads a file the maker chose, using the browser's local file
  // reading. On rejection the errors render as text; nothing is replaced
  // or cleared.
  async function handleImportChange(event) {
    const file = event.target.files[0];
    event.target.value = '';
    if (!file) return;

    let parsed;
    try {
      parsed = JSON.parse(await file.text());
    } catch {
      setImportErrors(['$: the file is not valid JSON']);
      return;
    }

    const result = await importStore(repository, parsed);
    if (!result.ok) {
      setImportErrors(result.errors);
      return;
    }
    setImportErrors([]);
    const [loadedVersions, loadedBatches] = await Promise.all([repository.listVersions(), repository.getAllBatches()]);
    setVersions(loadedVersions);
    setBatches(loadedBatches);
  }

  if (versions === null) return null;

  return (
    <div className="list-page">
      <div className="home">
        <header className="home__header">
          <p className="home__brand">Sprinkles</p>
          <nav className="home__nav" aria-label="Primary">
            <span className="home__nav-current" aria-current="page">
              Recipes
            </span>
          </nav>
        </header>
        <h1 className="home__title">Recipes</h1>
        <p className="home__guidance">Every count is a sprinkle. Versions in the recipe's colour, batches in gold.</p>
        <RecipeRows versions={versions} batches={batches} />
        <div className="home__actions">
          <button type="button" className="home__cta" onClick={() => fileInputRef.current?.click()}>
            Import
          </button>
          <button type="button" className="home__quiet" onClick={handleExport}>
            Export
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="home__file-input"
            onChange={handleImportChange}
            tabIndex={-1}
            aria-hidden="true"
          />
          {importErrors.length > 0 && (
            <ul className="home__import-errors">
              {importErrors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

// The list itself, split out as a presentational component over an array
// (the same convention RecipeHistory.jsx establishes) so it is testable
// without driving RecipeList's own fetch effect. One row per recipe, at
// its most recently created version (route-recipe-version.md § 3,
// 03-03) — hides nothing permanently: every superseded version stays
// reachable through the history outline on the recipe page (RecipeHistory.jsx).
// This is only honest while that stays true.
//
// batches defaults to [] so the existing tests, which pass versions
// alone, keep passing. <li> stays attribute-free (RecipeList.test.jsx
// counts rows with markup.match(/<li>/g)); the list class lives on the
// <ul> and the row class on the inner <Link>.
export function RecipeRows({ versions, batches = [] }) {
  const hueByRecipeId = recipeHueByRecipeId(versions);
  return (
    <ul className="home__list">
      {latestVersionPerRecipe(versions).map((version) => {
        const ordered = sortedVersions(versionsForRecipe(versions, version.recipeId));
        const orderedIds = new Set(ordered.map((v) => v.id));
        // Read null-safely: an imported record that fails validation
        // should never reach the store, but a malformed one that does
        // must render an incomplete row rather than throw the page away
        // (T-260918-gha-03) — filtered here, before sortedBatches (the
        // domain's one ordering) ever sees it.
        const recipeBatches = batches.filter((batch) => orderedIds.has(batch.versionId) && batch.churn);
        const newestBatch = sortedBatches(recipeBatches)[0] ?? null;
        const balance = computeBalance(activeRows(version));
        const hue = hueByRecipeId.get(version.recipeId);
        const versionCount = ordered.length;
        const batchCount = recipeBatches.length;
        return (
          <li key={version.id}>
            {/* The inline style's value is a fixed var(--recipe-hue-NN)
                reference built from an integer index, never a string
                taken from a stored record (T-260918-gha-02). */}
            <Link to={`/recipe/${version.id}`} className="home__row" style={{ '--c': `var(${hue})` }}>
              <span className="home__bar" aria-hidden="true" />
              <span className="home__main">
                <h2 className="home__name">{version.recipeName}</h2>
                <span className="home__meta">
                  {versionIdentity(ordered, version)} ·{' '}
                  {balance ? `${balance.mass.toFixed(1)} g` : 'no ingredient rows'}
                </span>
              </span>
              <span className="home__tally-group">
                <span className="home__tally-label">
                  {versionCount} version{versionCount === 1 ? '' : 's'}
                </span>
                <span className="home__tally" aria-hidden="true">
                  {Array.from({ length: versionCount }, (_, i) => (
                    <span key={i} className="home__tally-mark home__tally-mark--version" />
                  ))}
                </span>
              </span>
              <span className="home__tally-group">
                {batchCount > 0 ? (
                  <>
                    <span className="home__tally-label">
                      {batchCount} batch{batchCount === 1 ? '' : 'es'}
                    </span>
                    <span className="home__tally" aria-hidden="true">
                      {Array.from({ length: batchCount }, (_, i) => (
                        <span key={i} className="home__tally-mark home__tally-mark--batch" />
                      ))}
                    </span>
                  </>
                ) : (
                  <span className="home__tally-label home__tally-label--empty">not yet made</span>
                )}
              </span>
              {/* Notes and prose render as text, never as markup — no
                  dangerouslySetInnerHTML (T-260918-gha-01). A batch
                  carrying no words of its own leaves this cell empty
                  rather than inventing a sentence. */}
              <span className="home__words">{newestBatch?.churn?.atTheMachine ?? ''}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
