import { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router';
import { repository } from '../store/repository.js';
import { computeBalance } from '../domain/composition.js';
import { activeRows } from '../domain/rows.js';
import { latestVersionPerRecipe, sortedVersions, versionsForRecipe, versionIdentity } from '../domain/lineage.js';
import { sortedBatches } from '../domain/batch.js';
import { activeWork } from '../domain/lastEvent.js';
import { recipeHueByRecipeId } from './recipe-colour.js';

// Home — "Active work first" (.impeccable/surfaces/route.md, Home
// direction amendment 2026-09-20; DESIGN.md "App marks"). The outer
// element keeps its one existing class, once: two live assertions
// (cross-cutting.test.js) depend on that class name's attribute string
// appearing exactly once in this file's own source, and on app.css's
// matching rule staying the page's one inline gutter, so this world
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

  const work = activeWork(versions, batches);

  return (
    <div className="list-page">
      <div className="home">
        <h1 className="home__title">Pick up where you left off</h1>
        <HomeLead entry={work[0] ?? null} />
        <RecipeRows versions={versions} batches={batches} />
      </div>
    </div>
  );
}

// The lead block (D-06, D-12, D-18): the recipe the maker touched last,
// as a larger block above the list — the place it lives in, its name as
// a link to its latest version, the version identity and mass line the
// row already computes, and, when its newest batch carries one, the
// maker's own Next time in the hand (D-18, D-20 — the one place the
// hand appears on the page). A separate presentational component, over
// one activeWork() entry, so it is testable without driving RecipeList's
// own fetch effect — the same convention RecipeRows already establishes.
// Every recipe lives in the Notebook this phase (03.4-CONTEXT.md), so
// the place name reads the Notebook's own text companion.
export function HomeLead({ entry }) {
  if (!entry) return null;
  const balance = computeBalance(activeRows(entry.latestVersion));
  const massLine = balance ? `${balance.mass.toFixed(1)} g` : 'no ingredient rows';
  const nextTime = entry.batches[0]?.churn?.nextTimeNote ?? null;
  return (
    <section className="home__lead">
      <p className="home__lead-place">Notebook</p>
      <h2 className="home__lead-name">
        <Link to={`/recipe/${entry.latestVersion.id}`}>{entry.name}</Link>
      </h2>
      <p className="home__lead-meta">
        {versionIdentity(entry.versions, entry.latestVersion)} · {massLine}
      </p>
      {/* Notes render as text, never as markup — no dangerouslySetInnerHTML
          (T-03.4-12). The hand role class plan 02 shipped in app.css
          carries the face, colour and leading; home__lead-next-time
          carries spacing and measure only. */}
      {nextTime && <p className="home__lead-next-time app-hand">{nextTime}</p>}
    </section>
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
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
