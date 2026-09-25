import { useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { railEntries, railHint } from '../domain/historyRail.js';
import { versionsForRecipe } from '../domain/lineage.js';
import { notebookPath } from './notebookPaths.js';

/**
 * RecipeHistory — the dated rail (03.5-05, sketch 011 decision 4): every
 * saved version of the recipe, oldest left, the version in view ringed,
 * the others linked to their own Notebook address. Batches never appear
 * here — the App-context batch log (plan 07) is their own record. A
 * draft node (D-13) is Task 2's own addition.
 */
export function RecipeHistory({ versions, recipeId, currentVersionId, allBatches = [], openPen = null }) {
  const railRef = useRef(null);
  const recipeVersions = versionsForRecipe(versions, recipeId);
  const entries = railEntries(recipeVersions, allBatches, { currentVersionId });

  // The rail opens scrolled to the version in view (decisions_recorded
  // 1): sets the rail's own scrollLeft, never scrollIntoView, which
  // would move the page instead of the rail.
  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const node = rail.querySelector('[data-in-view="true"]');
    if (!node) return;
    const railRect = rail.getBoundingClientRect();
    const nodeRect = node.getBoundingClientRect();
    if (nodeRect.left < railRect.left) {
      rail.scrollLeft -= railRect.left - nodeRect.left;
    } else if (nodeRect.right > railRect.right) {
      rail.scrollLeft += nodeRect.right - railRect.right;
    }
  }, [currentVersionId]);

  return (
    <section className="notebook-history" aria-label="History">
      <div className="notebook-history__head">
        <span className="notebook-caption">History</span>
        <span className="notebook-history__hint">{railHint(entries.length, {})}</span>
      </div>
      <div className="notebook-history__rail" ref={railRef}>
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
    </section>
  );
}
