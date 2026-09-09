import { useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { formatRecordDate, sortedBatches } from '../domain/batch.js';
import { citableBatches } from '../domain/lineage.js';
import { VersionStrip } from './VersionStrip.jsx';

// The Versions region (route-recipe.md § 3 "The imprint", renamed per
// D-01): the front-matter band beside the recipe block that holds every
// control and fact about the recipe that is not the recipe itself.
// Reading state, top to bottom (D-04): the openers, the version list, the
// current version's lineage, the batch list — this plan (03.1-02) fills
// all four; plan 01 built only the openers and the plan's own pen
// ceremony.
//
// Every prop here is computed once by RecipePage (openPen/penReason by
// the page's own one-pen derivation, canSaveOver beside it) and passed
// straight through — this component never recomputes any of them;
// re-deriving would reopen the bug class G-03-9 closed (RESEARCH.md
// Anti-Patterns). The version list orders through VersionStrip's own
// sortedVersions call and the batch list orders through sortedBatches —
// this component chooses no order and formats no date of its own beyond
// formatRecordDate.
export function Versions({
  version,
  versions,
  mode,
  draft,
  penDraft,
  openBatch,
  batches,
  versionIdsWithBatches,
  citedBatch,
  parentVersion = null,
  showingChanges = false,
  blockedMessage,
  openPen = null,
  penReason = null,
  canSaveOver,
  onStartDeveloping,
  onCancelDeveloping,
  onChangePenField,
  onSaveAsNewVersion,
  onSaveOverVersion,
  onToggleShowChanges = () => {},
}) {
  // Focus-return for the plan's pen, moved verbatim from Headnote.jsx
  // (Phase 2 precedent, BatchMargin's tasting focus-return): closing the
  // pen returns focus to Develop. developButtonRef must sit above the
  // conditional render below — hooks cannot be called conditionally.
  const developButtonRef = useRef(null);
  const wasDevelopingRef = useRef(false);
  useEffect(() => {
    if (mode === 'developing') {
      wasDevelopingRef.current = true;
      return;
    }
    if (wasDevelopingRef.current) {
      wasDevelopingRef.current = false;
      developButtonRef.current?.focus();
    }
  }, [mode]);

  return (
    <section className="versions" aria-label="Versions">
      <h2 className="region-name">Versions</h2>
      {openPen === 'plan' ? (
        <>
          {/* The plan's pen ceremony (D-06): replaces the openers at the
              top of Versions. Markup moved verbatim from Headnote.jsx's
              former developing-mode branch, keeping its existing class
              names (03.1-CONTEXT.md planner decision 1) — only the
              control pair's order/labels and the was-line's class change. */}
          <div className="versions__ceremony">
            <label className="headnote__version-field">
              <span>Version line</span>
              <input
                type="text"
                className="ink-field"
                required
                autoFocus
                value={penDraft.versionLabel}
                aria-label="Version line"
                onChange={(event) => onChangePenField('versionLabel', event.target.value)}
              />
            </label>
            {/* The parent's own line, in ink — not the maker's draft
                (D-30, critique P2 #1, route-recipe-version.md § 6 "The
                parent's words in ink"). */}
            <p className="headnote__version-was">was {version.versionLabel}</p>
            <label className="headnote__reason-field">
              <span>Reason</span>
              <textarea
                className="ink-field"
                rows="2"
                value={penDraft.reason}
                onChange={(event) => onChangePenField('reason', event.target.value)}
              />
            </label>
            <div className="headnote__citation">
              <span>Cites</span>
              {batches.length === 0 ? (
                <span className="ink-text">no batch to cite</span>
              ) : (
                <select
                  className="ink-field"
                  value={penDraft.citedBatchId ?? ''}
                  aria-label="Cite a batch"
                  onChange={(event) =>
                    onChangePenField('citedBatchId', event.target.value === '' ? null : event.target.value)
                  }
                >
                  <option value="">no batch cited</option>
                  {citableBatches(batches).map((batch) => (
                    <option key={batch.id} value={batch.id}>
                      {batch.churn.churnDate ? formatRecordDate(batch.churn.churnDate) : 'date unknown'}
                    </option>
                  ))}
                </select>
              )}
            </div>
            {/* D-10: Cancel first always. A churned version (canSaveOver
                false) offers one Save, bound to onSaveAsNewVersion since a
                churned version's own record is never written to (D04). An
                unchurned version offers both: Save as forks, Save writes
                over. Supersedes Phase 3 D-01's outcome-at-the-end labels. */}
            <div className="headnote__ceremony">
              <button type="button" onClick={onCancelDeveloping}>
                Cancel
              </button>
              {canSaveOver ? (
                <>
                  <button type="button" onClick={onSaveAsNewVersion}>
                    Save as
                  </button>
                  <button type="button" onClick={onSaveOverVersion}>
                    Save
                  </button>
                </>
              ) : (
                <button type="button" onClick={onSaveAsNewVersion}>
                  Save
                </button>
              )}
            </div>
            {blockedMessage && <p className="headnote__blocked">{blockedMessage}</p>}
          </div>
        </>
      ) : openPen === null ? (
        <div className="versions__openers">
          <div className="versions__opener-group">
            <button type="button" ref={developButtonRef} onClick={onStartDeveloping}>
              Develop
            </button>
          </div>
          {/* Record batch/Record another, Amend, Add tasting arrive in
              plan 02 — this group stays present and empty until then. */}
          <div className="versions__opener-group" />
        </div>
      ) : null}
      {/* D-06: one hint sentence for the whole block, replacing the
          per-control pen-hint sentences every link below used to carry —
          applies while any pen is open, not only the plan's own. */}
      {openPen && <p className="versions__hint">Links return after you save or cancel.</p>}

      <VersionStrip
        versions={versions}
        recipeId={version.recipeId}
        currentId={version.id}
        versionIdsWithBatches={versionIdsWithBatches}
        openPen={openPen}
        penReason={penReason}
      />

      {/* The lineage (D-08): labelled lines, a root version shows none of
          them. Parent and Batch stay ink links while no pen is open, and
          plain text while one is (the same link-suppression discipline
          the version list above already carries). */}
      {version.parentVersionId && (
        <>
          <p className="versions__lineage">
            <span className="versions__lineage-label">Parent</span>
            {openPen ? (
              version.parentVersionLabel
            ) : (
              <Link to={`/recipe/${version.parentVersionId}`}>{version.parentVersionLabel}</Link>
            )}
          </p>
          {version.citedBatchId && citedBatch && (
            <p className="versions__lineage">
              <span className="versions__lineage-label">Batch</span>
              {openPen ? (
                citedBatch.churn.churnDate ? formatRecordDate(citedBatch.churn.churnDate) : 'date unknown'
              ) : (
                <Link to={`/recipe/${version.parentVersionId}/batch/${version.citedBatchId}`}>
                  {citedBatch.churn.churnDate ? formatRecordDate(citedBatch.churn.churnDate) : 'date unknown'}
                </Link>
              )}
            </p>
          )}
          <p className="versions__lineage">
            <span className="versions__lineage-label">Reason</span>
            {version.reason ? version.reason : 'no reason recorded'}
          </p>
          {parentVersion && (
            <p className="versions__lineage">
              <button type="button" className="headnote__show-changes" aria-pressed={showingChanges} onClick={onToggleShowChanges}>
                Show changes
              </button>
            </p>
          )}
        </>
      )}

      {/* The batch list (D-09): always a list, even with one batch and
          with none — the "no batch yet" line is the list's own single
          entry in that state, not a different element. */}
      {batches.length === 0 ? (
        <ul className="batch-margin__list">
          <li>no batch yet</li>
        </ul>
      ) : (
        <ul className="batch-margin__list">
          {sortedBatches(batches).map((batch) => {
            const isOpenBatch = openBatch && batch.id === openBatch.id;
            const dateWords = batch.churn.churnDate ? formatRecordDate(batch.churn.churnDate) : 'date unknown';
            const label = `churned ${dateWords}`;
            const latestAmendment = batch.amendedAt.length > 0 ? batch.amendedAt[batch.amendedAt.length - 1] : null;
            return (
              <li key={batch.id} className={isOpenBatch ? 'is-open' : undefined}>
                {isOpenBatch || openPen ? label : <Link to={`/recipe/${version.id}/batch/${batch.id}`}>{label}</Link>}
                {latestAmendment && (
                  <span className="versions__batch-amended">{`amended ${formatRecordDate(latestAmendment)}`}</span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
