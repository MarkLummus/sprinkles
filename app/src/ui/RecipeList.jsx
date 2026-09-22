import { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router';
import { repository } from '../store/repository.js';
import { computeBalance } from '../domain/composition.js';
import { activeRows } from '../domain/rows.js';
import { latestVersionPerRecipe, sortedVersions, versionsForRecipe, versionIdentity } from '../domain/lineage.js';
import { sortedBatches } from '../domain/batch.js';
import { recipeHueByRecipeId } from './recipe-colour.js';

// The arrival — The Sprinkles Jar (.impeccable/surfaces/route.md,
// 260918-gha), built in the world outside the three paper frames. The
// outer element keeps its one existing class, once: two live assertions
// (cross-cutting.test.js) depend on that class name's attribute string
// appearing exactly once in this file's own source, and on app.css's
// matching rule staying the page's one inline gutter, so the Jar world
// renders in a child under its own root class, "home", rather than by
// extending that outer element's class. The header, brand, nav and
// import/export controls moved into Shell.jsx (D-09, D-15) — they now
// render once, in the tools row, on every route.
export function RecipeList() {
  // Shell.jsx increments this after a successful import (via the Outlet
  // context), so this route reloads its own data with no page reload and
  // without Shell reaching into this route's state.
  const storeRevision = useOutletContext();
  const [versions, setVersions] = useState(null);
  const [batches, setBatches] = useState([]);

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
  }, [storeRevision]);

  if (versions === null) return null;

  return (
    <div className="list-page">
      <div className="home">
        <h1 className="home__title">Recipes</h1>
        <p className="home__guidance">Every count is a sprinkle. Versions in the recipe's colour, batches in gold.</p>
        <RecipeRows versions={versions} batches={batches} />
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
