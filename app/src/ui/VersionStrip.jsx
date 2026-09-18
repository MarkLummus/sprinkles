import { Link } from 'react-router';
import { formatRecordDate, batchHistoryWords } from '../domain/batch.js';
import { sortedVersions, versionsForRecipe } from '../domain/lineage.js';

// The Versions disclosure's own ruled register (route-recipe.md § 6 "The
// two history panels read as one register, not as cards", revised
// 2026-09-17; row grammar shared with BatchRow.jsx's batch panel). Every
// version of the recipe, the one in view included, in creation order,
// most recently created first — never the store's own key order, and
// never a subtree walk. Each row's identity block carries the version's
// own line and one provenance line, the citation winning where it exists:
// "after the batch of <date>" when a cited batch carries a churn date,
// otherwise "from <parent>" when one exists, otherwise no line at all — a
// root version cites nothing. The record block carries the version's own
// written date over its batch history stated in words
// (batchHistoryWords). The version line is the row's only link. The entry
// in view carries no link at all — a link to the page it is already on
// goes nowhere — and wears the word "In view"; the newest version
// (ordered[0], positional) wears "Latest"; both can land on one entry.
// `allBatches` is the whole store's batch list (RecipePage.jsx's own
// repository.getAllBatches() read) — every date rendered here is looked
// up from it rather than carried on the version record itself, since a
// version never stores another record's date on itself (D-10).
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
      <ul className="history-register">
        {ordered.map((version) => {
          const isCurrent = version.id === currentId;
          const isLatest = version.id === latestId;
          const versionBatches = allBatches.filter((batch) => batch.versionId === version.id);
          const citedBatch = version.citedBatchId
            ? allBatches.find((batch) => batch.id === version.citedBatchId)
            : null;
          // The citation wins where it exists (Mark, 2026-09-17) — never
          // both, the run-on is what is being removed. The complete set
          // meets a root version for the first time (260917-odu): a root
          // cites nothing and has no parent, so provenance stays null and
          // no second line renders at all.
          let provenance = null;
          if (citedBatch?.churn.churnDate) {
            provenance = `after the batch of ${formatRecordDate(citedBatch.churn.churnDate)}`;
          } else if (version.parentVersionId) {
            provenance = `from ${version.parentVersionLabel}`;
          }
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
              className={isCurrent ? 'history-register__item is-current' : 'history-register__item'}
            >
              <div className="history-register__identity">
                <p className="history-register__name">
                  {/* D-UAT-2: while a pen is open, the strip is not a way
                      off the page — the version line renders as plain text
                      instead of a link, the same link-suppression
                      discipline every other link in this row carries. The
                      entry in view renders as text unconditionally, pen or
                      no pen: a link to the page it is already on goes
                      nowhere. The version line is this row's only link. */}
                  {isCurrent || openPen
                    ? version.versionLabel
                    : <Link to={`/recipe/${version.id}`}>{version.versionLabel}</Link>}
                  {markers.length > 0 && (
                    <>
                      {' '}
                      <span className="history-register__marker">{`· ${markers.join(' · ')}`}</span>
                    </>
                  )}
                </p>
                {provenance && <p className="history-register__provenance">{provenance}</p>}
              </div>
              <div className="history-register__record">
                <p>written {formatRecordDate(version.createdAt)}</p>
                <p>{batchHistoryWords(versionBatches)}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
