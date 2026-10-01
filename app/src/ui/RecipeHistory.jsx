import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { railEntries, versionCountWords } from '../domain/historyRail.js';
import { versionsForRecipe } from '../domain/lineage.js';
import { notebookPath } from './notebookPaths.js';
import { FoldRow } from './FoldRow.jsx';
import { UprightRail } from './UprightRail.jsx';
import { useFold } from './useBelowDesktop.js';

/**
 * RecipeHistory — decision 19's History (03.5-18): one line at exactly one
 * entry (Task 2), otherwise a fold, open by default from 1366 and closed
 * below (FoldRow/useFold, 03.5-15). From 1366 it is the dated horizontal
 * rail (03.5-05); below it, UprightRail (plan 17's own shared component),
 * latest first. `belowDesktop` is a prop (decisions_recorded 3) rather than
 * an internal useBelowDesktop() call, so this component's own static-markup
 * tests can render both arrangements directly. Batches never appear here —
 * the App-context batch log (plan 07) is their own record.
 */
export function RecipeHistory({
  versions,
  recipeId,
  currentVersionId,
  allBatches = [],
  openPen = null,
  draft = null,
  belowDesktop = false,
}) {
  const railRef = useRef(null);
  const [scrolledLeft, setScrolledLeft] = useState(false);
  const recipeVersions = versionsForRecipe(versions, recipeId);
  const entries = railEntries(recipeVersions, allBatches, {
    currentVersionId,
    draft: openPen === 'plan' ? draft : null,
  });
  const [open, toggle] = useFold(!belowDesktop);

  // The horizontal rail opens scrolled to the version in view
  // (decisions_recorded 1, 03.5-05): sets the rail's own scrollLeft, never
  // scrollIntoView, which would move the page instead of the rail. After
  // any autoscroll it reads whether content is now hidden to the left (the
  // fade). Runs only for the horizontal rail (decisions_recorded 5,
  // 03.5-18) — a closed rail (below 1366, or the fold itself closed) has no
  // width to measure — and re-runs whenever `open` or `belowDesktop`
  // changes, since a rail that was hidden gains its real width only once
  // shown.
  useEffect(() => {
    if (belowDesktop) return;
    const rail = railRef.current;
    if (!rail) return;

    const node = rail.querySelector('[data-in-view="true"]');
    if (node) {
      const railRect = rail.getBoundingClientRect();
      const nodeRect = node.getBoundingClientRect();
      if (nodeRect.left < railRect.left) {
        rail.scrollLeft -= railRect.left - nodeRect.left;
      } else if (nodeRect.right > railRect.right) {
        rail.scrollLeft += nodeRect.right - railRect.right;
      }
    }
    setScrolledLeft(rail.scrollLeft > 0);
  }, [currentVersionId, entries.length, open, belowDesktop]);

  // One entry (a lone saved version, no draft) reads as one plain line —
  // no fold, no rail, no link (decisions_recorded 1, sketch 011
  // versions-1-vs-many.html's picked panel, 03.5-18 Task 2). The rule
  // counts entries, the draft included: with one saved version and the pen
  // open the draft entry makes two, so the fold above still applies.
  if (entries.length === 1) {
    return (
      <section className="notebook-history" aria-label="History">
        <span className="notebook-caption">History</span>
        <p className="notebook-history__only">Only this version so far</p>
      </section>
    );
  }

  return (
    <section className="notebook-history" aria-label="History">
      <FoldRow
        label={<span className="notebook-caption">History</span>}
        labelText="History"
        open={open}
        onToggle={toggle}
        controls="fold-history"
        count={versionCountWords(entries.length)}
      />
      {belowDesktop ? (
        <UprightRail
          id="fold-history"
          label="Versions of this recipe"
          hidden={!open}
          entries={[...entries].reverse().map((entry) => ({
            key: entry.id,
            title: entry.name,
            meta: `${entry.dateWords} · ${entry.stateWords}`,
            filled: entry.churned,
            inView: entry.inView,
            to: entry.inView || entry.isDraft || openPen ? null : notebookPath(recipeId, entry.id),
            state: { focusVersion: true },
          }))}
        />
      ) : (
        <div
          className="notebook-history__rail"
          id="fold-history"
          hidden={!open}
          ref={railRef}
          onScroll={(event) => setScrolledLeft(event.target.scrollLeft > 0)}
        >
          {/* The entry count is a layout count, not a visual value: notebook.css
              sizes the track from it, so the line's length never depends on the
              strip's intrinsic width (261001-den). */}
          <div className="notebook-history__strip" style={{ '--app-notebook-history-count': String(entries.length) }}>
            <div className="notebook-history__track" aria-hidden="true" />
            <ol className="notebook-history__nodes">
              {entries.map((entry) => {
                const inner = (
                  <>
                    <span className="notebook-history__date">{entry.dateWords}</span>
                    <span
                      aria-hidden="true"
                      className={`notebook-history__mark${entry.churned ? ' notebook-history__mark--churned' : ''}${entry.inView ? ' notebook-history__mark--in-view' : ''}`}
                    />
                    <span className={`notebook-history__name${entry.inView ? ' notebook-history__name--in-view' : ''}`}>
                      {entry.name}
                    </span>
                    <span className="notebook-history__state">{entry.stateWords}</span>
                  </>
                );
                return (
                  <li key={entry.id} className="notebook-history__node" data-in-view={entry.inView ? 'true' : undefined}>
                    {entry.inView || openPen ? (
                      <span className="notebook-history__node-inner" aria-current={entry.inView ? 'page' : undefined}>
                        {inner}
                      </span>
                    ) : (
                      <Link
                        className="notebook-history__node-inner"
                        to={notebookPath(recipeId, entry.id)}
                        state={{ focusVersion: true }}
                        tabIndex={0}
                      >
                        {inner}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ol>
          </div>
          {scrolledLeft && <div className="notebook-history__fade" aria-hidden="true" />}
        </div>
      )}
    </section>
  );
}
