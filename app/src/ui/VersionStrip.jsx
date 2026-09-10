import { Link } from 'react-router';
import { formatRecordDate, latestChurnDate } from '../domain/batch.js';
import { sortedVersions, versionsForRecipe } from '../domain/lineage.js';

// The Later-versions disclosure's own card list (route-recipe.md § 3 "The
// imprint", D-04, D-07; rebuilt against sketch 003 variant B's own
// `.vtree`/`renderTree` markup, index.html:97-103, 230-233, 440-447, for
// VersionRow's Later disclosure — 03.3-06 checkpoint feedback, Mark,
// 2026-09-10). Every descendant of the version being viewed, in creation
// order, most recently created first — never the store's own key order.
// Each card carries the version's own line as a link, a meta line naming
// its parent, its cited batch's date (when one was cited) and its own
// written date, and a batch line naming its own most recent churn date
// (when it has one) plus an Open control that goes to the same place the
// version line's own link does. `allBatches` is the whole store's batch
// list (RecipePage.jsx's own repository.getAllBatches() read) — every
// date rendered here is looked up from it rather than carried on the
// version record itself, since a version never stores another record's
// date on itself (D-10).
export function VersionStrip({ versions, recipeId, currentId, allBatches = [], openPen = null, penReason = null }) {
  const ordered = sortedVersions(versionsForRecipe(versions, recipeId));

  return (
    <nav className="version-strip" aria-label="Version strip">
      <ul className="version-strip__list">
        {ordered.map((version) => {
          const isCurrent = version.id === currentId;
          const ownChurnDate = latestChurnDate(allBatches.filter((batch) => batch.versionId === version.id));
          const citedBatch = version.citedBatchId
            ? allBatches.find((batch) => batch.id === version.citedBatchId)
            : null;
          const metaParts = [`from ${version.parentVersionLabel}`];
          if (citedBatch?.churn.churnDate) {
            metaParts.push(`after the batch of ${formatRecordDate(citedBatch.churn.churnDate)}`);
          }
          metaParts.push(formatRecordDate(version.createdAt));
          return (
            <li
              key={version.id}
              className={isCurrent ? 'version-strip__item is-current' : 'version-strip__item'}
            >
              <p className="version-strip__vline">
                {/* D-UAT-2: while a pen is open, the strip is not a way
                    off the page — the version line renders as plain text
                    instead of a link, the same link-suppression
                    discipline every other link in this row carries. */}
                {openPen ? version.versionLabel : <Link to={`/recipe/${version.id}`}>{version.versionLabel}</Link>}
              </p>
              <p className="version-strip__meta">{metaParts.join(' · ')}</p>
              <p className="version-strip__batch">
                {ownChurnDate && (
                  <span className="version-strip__churned">churned {formatRecordDate(ownChurnDate)}</span>
                )}
                {openPen ? 'Open' : (
                  <Link className="text-control" to={`/recipe/${version.id}`}>
                    Open
                  </Link>
                )}
              </p>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
