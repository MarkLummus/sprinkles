import { Link } from 'react-router';
import { formatRecordDate, latestChurnDate } from '../domain/batch.js';
import { sortedVersions, versionsForRecipe } from '../domain/lineage.js';

// The Versions disclosure's own card list (route-recipe.md § 3 "History
// controls name a whole set, never a direction", 260917-odu; originally
// built against sketch 003 variant B's own `.vtree`/`renderTree` markup,
// index.html:97-103, 230-233, 440-447, for VersionRow's disclosure —
// 03.3-06 checkpoint feedback, Mark, 2026-09-10). Every version of the
// recipe, the one in view included, in creation order, most recently
// created first — never the store's own key order, and never a subtree
// walk. Each card carries the version's own line, a meta line naming its
// parent (when one exists — a root version has none), its cited batch's
// date (when one was cited) and its own written date, and a batch line
// naming its own most recent churn date (when it has one) plus an Open
// control. The entry in view carries neither a version-line link nor an
// Open control — a link to the page it is already on goes nowhere — and
// wears the word "In view"; the newest version (ordered[0], positional)
// wears "Latest"; both can land on one entry. `allBatches` is the whole
// store's batch list (RecipePage.jsx's own repository.getAllBatches()
// read) — every date rendered here is looked up from it rather than
// carried on the version record itself, since a version never stores
// another record's date on itself (D-10).
export function VersionStrip({ versions, recipeId, currentId, allBatches = [], openPen = null, penReason = null }) {
  const ordered = sortedVersions(versionsForRecipe(versions, recipeId));
  // Latest is positional — the id of ordered[0], the very array the list
  // below maps — so the marker and the order cannot disagree (260917-odu).
  // sortedVersions' own createdAt-descending order IS the definition of
  // newest here. `latestVersionPerRecipe` (lineage.js) is deliberately not
  // called: it is a second traversal with its own null coercion and its
  // own tie rule, a second opinion about newest living beside the first.
  const latestId = ordered.length > 0 ? ordered[0].id : null;

  return (
    <nav className="version-strip" aria-label="Version strip">
      <ul className="version-strip__list">
        {ordered.map((version) => {
          const isCurrent = version.id === currentId;
          const isLatest = version.id === latestId;
          const ownChurnDate = latestChurnDate(allBatches.filter((batch) => batch.versionId === version.id));
          const citedBatch = version.citedBatchId
            ? allBatches.find((batch) => batch.id === version.citedBatchId)
            : null;
          // The complete set meets a root version for the first time
          // (260917-odu) — its parentVersionId and parentVersionLabel are
          // both null (store contract), so the "from …" clause becomes
          // conditional rather than reading "from null".
          const metaParts = [];
          if (version.parentVersionId) {
            metaParts.push(`from ${version.parentVersionLabel}`);
          }
          if (citedBatch?.churn.churnDate) {
            metaParts.push(`after the batch of ${formatRecordDate(citedBatch.churn.churnDate)}`);
          }
          metaParts.push(formatRecordDate(version.createdAt));
          // The position markers (route-recipe.md § 3, 260917-odu): words,
          // not a class — form carries state, and a marker existing only
          // as a style is invisible to a screen reader and under forced
          // colours. In-view first, then latest, matching the reading
          // order both can share on one entry.
          const markers = [];
          if (isCurrent) markers.push('In view');
          if (isLatest) markers.push('Latest');
          return (
            <li
              key={version.id}
              className={isCurrent ? 'version-strip__item is-current' : 'version-strip__item'}
            >
              <p className="version-strip__vline">
                {/* D-UAT-2: while a pen is open, the strip is not a way
                    off the page — the version line renders as plain text
                    instead of a link, the same link-suppression
                    discipline every other link in this row carries. The
                    entry in view renders as text unconditionally, pen or
                    no pen: a link to the page it is already on goes
                    nowhere. */}
                {isCurrent || openPen
                  ? version.versionLabel
                  : <Link to={`/recipe/${version.id}`}>{version.versionLabel}</Link>}
                {markers.length > 0 && (
                  <>
                    {' '}
                    <span className="version-strip__marker">{`· ${markers.join(' · ')}`}</span>
                  </>
                )}
              </p>
              <p className="version-strip__meta">{metaParts.join(' · ')}</p>
              <p className="version-strip__batch">
                {ownChurnDate && (
                  <span className="version-strip__churned">churned {formatRecordDate(ownChurnDate)}</span>
                )}
                {/* The entry in view renders no Open control at all — not
                    even as the plain word, which would name an act that
                    has already happened (the same dead-control rule as
                    its version line above). */}
                {isCurrent ? null : openPen ? 'Open' : (
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
