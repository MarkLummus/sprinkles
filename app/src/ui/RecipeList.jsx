import { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router';
import { repository } from '../store/repository.js';
import { versionIdentity } from '../domain/lineage.js';
import { activeWork, NOT_YET_CHURNED, AWAITING_TASTING, TASTED } from '../domain/lastEvent.js';
import { notebookPath } from './notebookPaths.js';

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
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([repository.listVersions(), repository.getAllBatches(), repository.listRecipes()]).then(
      ([loadedVersions, loadedBatches, loadedRecipes]) => {
        if (!cancelled) {
          setVersions(loadedVersions);
          setBatches(loadedBatches);
          setRecipes(loadedRecipes);
        }
      },
    );
    return () => {
      cancelled = true;
    };
  }, [storeRevision]);

  return (
    <div className="list-page">
      <div className="home">
        <h1 className="home__title">Pick up where you left off</h1>
        {versions === null ? (
          <p className="home__loading">Loading your recipes…</p>
        ) : (
          <HomeBody versions={versions} batches={batches} recipes={recipes} />
        )}
      </div>
    </div>
  );
}

// The body below the title: the empty shelf (D-08) when the store holds
// no recipes, or the lead block and the rows (D-06, D-12) otherwise. A
// separate presentational component, over plain versions/batches props,
// so it is testable without driving RecipeList's own fetch effect — the
// same convention HomeLead and RecipeRows already establish.
export function HomeBody({ versions, batches, recipes = [] }) {
  if (versions.length === 0) {
    return (
      <div className="home__empty">
        <p>Nothing is in progress right now.</p>
        <p>
          <Link to="/recipe-book" className="home__empty-lead" tabIndex={0}>
            Recipe book
          </Link>{' '}
          and{' '}
          <Link to="/idea-log" className="home__empty-lead" tabIndex={0}>
            Idea log
          </Link>{' '}
          are ready when you are.
        </p>
      </div>
    );
  }
  const work = activeWork(versions, batches, recipes);
  return (
    <>
      <HomeLead entry={work[0] ?? null} />
      <h2 className="home__section">Recipes</h2>
      <RecipeRows versions={versions} batches={batches} recipes={recipes} />
    </>
  );
}

// The lead block (D-06, D-12, D-18, gap 5): the recipe the maker touched
// last, as a larger, bordered block above the list — the board's own
// order (board 170 lines 49-79): the destination rod, the identity
// column (the place it lives in, its name as a link to its latest
// version, the version identity), a Next time column captioned in the
// app's own words when its newest batch carries one, and the standing's
// own actions — RowActions over this same entry, so the lead's action is
// always the one its own row shows. The meta line carries the version
// identity alone (Mark, UAT test 6 ruling 6.4 of 2026-09-22, against
// board 170's own meta) — whether the board's standing word and
// last-batch date should join it is open, not decided. A separate
// presentational component, over one activeWork() entry, so it is
// testable without driving RecipeList's own fetch effect — the same
// convention RecipeRows already establishes. Every recipe lives in the
// Notebook this phase (03.4-CONTEXT.md), so the place name reads the
// Notebook's own text companion.
export function HomeLead({ entry }) {
  if (!entry) return null;
  const nextTime = entry.batches[0]?.churn?.nextTimeNote ?? null;
  return (
    <section className="home__lead">
      <span className="home__rail" aria-hidden="true" />
      <div className="home__lead-identity">
        <p className="home__lead-place">Notebook</p>
        <h2 className="home__lead-name">
          <Link to={notebookPath(entry.id, entry.latestVersion.id)} tabIndex={0}>{entry.name}</Link>
        </h2>
        <p className="home__lead-meta">{versionIdentity(entry.versions, entry.latestVersion)}</p>
      </div>
      {/* Notes render as text, never as markup — no dangerouslySetInnerHTML
          (T-03.4-12). The caption is the app's own label, not the
          maker's words (DESIGN.md's Hand Rule) — only the note beneath
          it reads the hand role class plan 02 shipped in app.css, which
          carries the face, colour and leading; home__lead-next-time
          carries spacing and measure only. */}
      {nextTime && (
        <div className="home__lead-next">
          <p className="home__lead-caption">Next time</p>
          <p className="home__lead-next-time app-hand">{nextTime}</p>
        </div>
      )}
      <RowActions entry={entry} />
    </section>
  );
}

// Every recipe lives in the Notebook this phase (03.4-CONTEXT.md D-07) —
// read from this one function so a second destination becomes a change
// here and in the matching home.css rule, not a rewrite of the row's own
// markup.
function placeNameFor() {
  return 'Notebook';
}

// batchCountWords(n) -> the batch tally's count in words (D-11, D-19,
// UX1-03): the marks beside it are decorative, so the count is never
// carried by marks alone.
function batchCountWords(count) {
  if (count === 0) return 'not yet made';
  return `${count} batch${count === 1 ? '' : 'es'}`;
}

// The standing's own word (D-07, D-11, gap 6): looked up from
// lastEvent.js's exported constants — never hand-spelled — so a row's
// word can never disagree with the standing that also decides
// RowActions beside it (T-03.4-G07). D-07 also names two standings a
// Recipe Book version's own "Ready to make" and a saved idea's own
// "Saved idea" — that lastEvent.js's standingFor cannot return this
// phase (03.4-CONTEXT.md decision #2), so this lookup carries no entry
// for either.
const STANDING_WORDS = {
  [NOT_YET_CHURNED]: 'Not yet churned',
  [AWAITING_TASTING]: 'Awaiting tasting',
  [TASTED]: 'Tasted',
};

// The row's next action(s) (D-07, D-11): one filled action, and at most
// one outline secondary, chosen by the recipe's own standing. Record a
// tasting is the one action that opens the newest batch's own path;
// every other action opens the recipe at its latest version.
function RowActions({ entry }) {
  const latestPath = notebookPath(entry.id, entry.latestVersion.id);
  if (entry.standing === NOT_YET_CHURNED) {
    return (
      <span className="home__actions">
        <Link to={latestPath} className="home__action" tabIndex={0}>
          Record a batch
        </Link>
      </span>
    );
  }
  if (entry.standing === AWAITING_TASTING) {
    const tastingPath = notebookPath(entry.id, entry.latestVersion.id, entry.batches[0].id);
    return (
      <span className="home__actions">
        <Link to={tastingPath} className="home__action" tabIndex={0}>
          Record a tasting
        </Link>
        <Link to={latestPath} className="home__action home__action--secondary" tabIndex={0}>
          Continue developing
        </Link>
      </span>
    );
  }
  if (entry.standing === TASTED) {
    return (
      <span className="home__actions">
        <Link to={latestPath} className="home__action" tabIndex={0}>
          Next version
        </Link>
        <Link to={latestPath} className="home__action home__action--secondary" tabIndex={0}>
          Adapt
        </Link>
      </span>
    );
  }
  // No fourth branch: D-07's other two standings need the Recipe Book
  // and the Idea Log, which lastEvent.js's standingFor never returns
  // this phase (03.4-CONTEXT.md decision #2).
  return null;
}

// The list itself, split out as a presentational component over an array
// (the same convention RecipeHistory.jsx establishes and HomeLead now
// shares) so it is testable without driving RecipeList's own fetch
// effect. One row per recipe, at its most recently created version, in
// recency order (D-05, D-06) — hides nothing permanently: every
// superseded version stays reachable through the history outline on the
// recipe page (RecipeHistory.jsx). The lead recipe stays in this list
// too (D-12): activeWork's own first entry is not excluded here.
//
// batches and recipes default to [] so the existing tests, which pass
// versions alone, keep passing.
export function RecipeRows({ versions, batches = [], recipes = [] }) {
  const work = activeWork(versions, batches, recipes);
  return (
    <ul className="home__list">
      {work.map((entry) => {
        const batchCount = entry.batches.length;
        return (
          <li key={entry.id} className="home__row">
            <span className="home__rail" aria-hidden="true" />
            <p className="home__place">{placeNameFor()}</p>
            <h2 className="home__name">
              <Link to={notebookPath(entry.id, entry.latestVersion.id)} tabIndex={0}>{entry.name}</Link>
            </h2>
            <span className="home__standing">{STANDING_WORDS[entry.standing]}</span>
            <span className="home__meta">
              <span className="home__tally" aria-hidden="true">
                {Array.from({ length: batchCount }, (_, i) => (
                  <span key={i} className="home__tally-mark" />
                ))}
              </span>
              <span className="home__count">{batchCountWords(batchCount)}</span>
            </span>
            <RowActions entry={entry} />
          </li>
        );
      })}
    </ul>
  );
}
