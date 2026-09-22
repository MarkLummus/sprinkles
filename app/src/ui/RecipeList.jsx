import { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router';
import { repository } from '../store/repository.js';
import { computeBalance } from '../domain/composition.js';
import { activeRows } from '../domain/rows.js';
import { versionIdentity } from '../domain/lineage.js';
import { activeWork, NOT_YET_CHURNED, AWAITING_TASTING, TASTED } from '../domain/lastEvent.js';

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

  return (
    <div className="list-page">
      <div className="home">
        <h1 className="home__title">Pick up where you left off</h1>
        <HomeBody versions={versions} batches={batches} />
      </div>
    </div>
  );
}

// The body below the title: the empty shelf (D-08) when the store holds
// no recipes, or the lead block and the rows (D-06, D-12) otherwise. A
// separate presentational component, over plain versions/batches props,
// so it is testable without driving RecipeList's own fetch effect — the
// same convention HomeLead and RecipeRows already establish.
export function HomeBody({ versions, batches }) {
  if (versions.length === 0) {
    return (
      <div className="home__empty">
        <p>Nothing is in progress right now.</p>
        <p>
          <Link to="/recipe-book" className="home__empty-lead">
            Recipe book
          </Link>{' '}
          and{' '}
          <Link to="/idea-log" className="home__empty-lead">
            Idea log
          </Link>{' '}
          are ready when you are.
        </p>
      </div>
    );
  }
  const work = activeWork(versions, batches);
  return (
    <>
      <HomeLead entry={work[0] ?? null} />
      <h2 className="home__section">Recipes</h2>
      <RecipeRows versions={versions} batches={batches} />
    </>
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
  const latestPath = `/recipe/${entry.latestVersion.id}`;
  if (entry.standing === NOT_YET_CHURNED) {
    return (
      <span className="home__actions">
        <Link to={latestPath} className="home__action">
          Record a batch
        </Link>
      </span>
    );
  }
  if (entry.standing === AWAITING_TASTING) {
    const tastingPath = `/recipe/${entry.latestVersion.id}/batch/${entry.batches[0].id}`;
    return (
      <span className="home__actions">
        <Link to={tastingPath} className="home__action">
          Record a tasting
        </Link>
        <Link to={latestPath} className="home__action home__action--secondary">
          Continue developing
        </Link>
      </span>
    );
  }
  if (entry.standing === TASTED) {
    return (
      <span className="home__actions">
        <Link to={latestPath} className="home__action">
          Next version
        </Link>
        <Link to={latestPath} className="home__action home__action--secondary">
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
// batches defaults to [] so the existing tests, which pass versions
// alone, keep passing.
export function RecipeRows({ versions, batches = [] }) {
  const work = activeWork(versions, batches);
  return (
    <ul className="home__list">
      {work.map((entry) => {
        const batchCount = entry.batches.length;
        return (
          <li key={entry.id} className="home__row">
            <span className="home__rail" aria-hidden="true" />
            <p className="home__place">{placeNameFor()}</p>
            <h2 className="home__name">
              <Link to={`/recipe/${entry.latestVersion.id}`}>{entry.name}</Link>
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
