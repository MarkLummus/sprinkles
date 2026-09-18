import { Link } from 'react-router';
import { DECLARED_FLAW } from '../domain/battery.js';
import { recordDateWords, sortedBatches } from '../domain/batch.js';
import { sortedVersions, versionsForRecipe, versionIdentity } from '../domain/lineage.js';

function compareChronological(a, b) {
  if (a.createdAt === b.createdAt) return 0;
  if (a.createdAt == null) return 1;
  if (b.createdAt == null) return -1;
  return a.createdAt < b.createdAt ? -1 : 1;
}

function chronological(versions) {
  return [...versions].sort(compareChronological);
}

// A version's parent counts only if walking the chain of parents above it
// terminates rather than revisiting an id already seen — a version whose
// own id turns back up in its ancestry never counted as terminating.
function chainTerminates(version, byId) {
  const seen = new Set([version.id]);
  let current = version;
  while (current.parentVersionId != null && byId.has(current.parentVersionId)) {
    if (seen.has(current.parentVersionId)) return false;
    seen.add(current.parentVersionId);
    current = byId.get(current.parentVersionId);
  }
  return true;
}

// A recipe usually has one straight line, but parentVersionId permits a
// fork. Keep that truth visible: roots read oldest first and each child sits
// beneath the plan it preserves. Orphans, and a version whose parent chain
// closes on itself, become roots rather than vanishing.
export function versionForest(versions) {
  const ids = new Set(versions.map((version) => version.id));
  const byId = new Map(versions.map((version) => [version.id, version]));
  const children = new Map();
  for (const version of versions) {
    const parentId =
      ids.has(version.parentVersionId) && chainTerminates(version, byId) ? version.parentVersionId : null;
    const siblings = children.get(parentId) ?? [];
    siblings.push(version);
    children.set(parentId, siblings);
  }

  for (const siblings of children.values()) siblings.sort(compareChronological);
  return { roots: chronological(children.get(null) ?? []), children };
}

function tastingOutcome(batch) {
  if (!batch.tasting) return 'No tasting recorded';
  if (batch.tasting.note) return batch.tasting.note;

  const problems = [
    ...(batch.tasting.defects ?? []),
    ...(batch.tasting.bitterDeclared ? [DECLARED_FLAW] : []),
  ];
  if (problems.length > 0) return problems.join(' · ');
  return `Tasted ${recordDateWords(batch.tasting.tastedDate)}`;
}

function BatchAttempt({ batch, version, currentVersionId, currentBatchId, openPen }) {
  const isInView = version.id === currentVersionId && batch.id === currentBatchId;
  const churnDate = recordDateWords(batch.churn.churnDate);
  const label = `Batch · ${churnDate}`;

  return (
    <li className={isInView ? 'recipe-history__batch is-current' : 'recipe-history__batch'}>
      <div className="recipe-history__batch-head">
        <p className="recipe-history__batch-name">
          {isInView || openPen
            ? label
            : <Link to={`/recipe/${version.id}/batch/${batch.id}`} state={{ focusBatch: true }}>{label}</Link>}
          {isInView && <span className="history-register__marker"> · In view</span>}
        </p>
        <p className="recipe-history__batch-state">
          {batch.tasting ? 'Churned and tasted' : 'Churned'}
        </p>
      </div>
      <p className={batch.tasting?.note ? 'recipe-history__outcome prose-text' : 'recipe-history__outcome'}>
        {tastingOutcome(batch)}
      </p>
      {batch.churn.nextTimeNote && (
        <p className="recipe-history__next"><span>Next time</span> {batch.churn.nextTimeNote}</p>
      )}
    </li>
  );
}

function VersionNode({
  version,
  ordered,
  latestId,
  currentVersionId,
  currentBatchId,
  allBatches,
  childrenByParent,
  openPen,
}) {
  const isInView = version.id === currentVersionId;
  const isLatest = version.id === latestId;
  const batches = sortedBatches(allBatches.filter((batch) => batch.versionId === version.id));
  const citedBatch = version.citedBatchId
    ? allBatches.find((batch) => batch.id === version.citedBatchId)
    : null;
  const childVersions = childrenByParent.get(version.id) ?? [];
  const markers = [];
  if (isInView) markers.push('In view');
  if (isLatest) markers.push('Latest');

  return (
    <li className={isInView ? 'recipe-history__version is-current' : 'recipe-history__version'}>
      <article className="recipe-history__version-sheet">
        <div className="recipe-history__version-head">
          <h3 className="recipe-history__version-name">
            {isInView || openPen
              ? versionIdentity(ordered, version)
              : <Link to={`/recipe/${version.id}`} state={{ focusVersion: true }}>{versionIdentity(ordered, version)}</Link>}
            {markers.length > 0 && (
              <span className="history-register__marker">{` · ${markers.join(' · ')}`}</span>
            )}
          </h3>
          <p className="recipe-history__written">written {recordDateWords(version.createdAt)}</p>
        </div>

        {citedBatch && (
          <p className="recipe-history__cause">
            After batch ·{' '}
            {openPen ? (
              recordDateWords(citedBatch.churn.churnDate)
            ) : (
              <Link to={`/recipe/${citedBatch.versionId}/batch/${citedBatch.id}`} state={{ focusBatch: true }}>
                {recordDateWords(citedBatch.churn.churnDate)}
              </Link>
            )}
          </p>
        )}

        {version.reason && (
          <div className="recipe-history__reason">
            <p className="versions__lineage-label">Why</p>
            <p className="prose-text">{version.reason}</p>
          </div>
        )}

        {batches.length > 0 ? (
          <ol className="recipe-history__batches" aria-label={`Batches of ${versionIdentity(ordered, version)}`}>
            {batches.map((batch) => (
              <BatchAttempt
                key={batch.id}
                batch={batch}
                version={version}
                currentVersionId={currentVersionId}
                currentBatchId={currentBatchId}
                openPen={openPen}
              />
            ))}
          </ol>
        ) : (
          <p className="recipe-history__empty">No batch recorded</p>
        )}
      </article>

      {childVersions.length > 0 && (
        <ol className="recipe-history__branches" aria-label={`Versions made from ${versionIdentity(ordered, version)}`}>
          {childVersions.map((child) => (
            <VersionNode
              key={child.id}
              version={child}
              ordered={ordered}
              latestId={latestId}
              currentVersionId={currentVersionId}
              currentBatchId={currentBatchId}
              allBatches={allBatches}
              childrenByParent={childrenByParent}
              openPen={openPen}
            />
          ))}
        </ol>
      )}
    </li>
  );
}

export function RecipeHistory({
  versions,
  recipeId,
  currentVersionId,
  currentBatchId = null,
  allBatches = [],
  openPen = null,
}) {
  const recipeVersions = versionsForRecipe(versions, recipeId);
  const ordered = sortedVersions(recipeVersions);
  const latestId = ordered[0]?.id ?? null;
  const { roots, children: childrenByParent } = versionForest(recipeVersions);

  return (
    <nav className="recipe-history" aria-label="Recipe development history">
      <ol className="recipe-history__versions">
        {roots.map((version) => (
          <VersionNode
            key={version.id}
            version={version}
            ordered={ordered}
            latestId={latestId}
            currentVersionId={currentVersionId}
            currentBatchId={currentBatchId}
            allBatches={allBatches}
            childrenByParent={childrenByParent}
            openPen={openPen}
          />
        ))}
      </ol>
    </nav>
  );
}
