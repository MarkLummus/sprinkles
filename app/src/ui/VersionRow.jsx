import { useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { formatRecordDate } from '../domain/batch.js';
import { citableBatches } from '../domain/lineage.js';
import { VersionStrip } from './VersionStrip.jsx';

// The version's own row (sketch 003 variant B, 03.3-01): the front
// matter's first stacked row, spanning the whole page. Carries the
// version's own acts (Develop, the version strip, the lineage line) — the
// batch's acts (Record another, Amend, Add tasting, the batch list, the
// batch's own content) now live in BatchRow.jsx. No page-level running
// head here (ROADMAP Scope bullet 1) — the row carries no "Versions"
// heading of its own.
export function VersionRow({
  version,
  versions,
  mode,
  penDraft,
  batches,
  versionIdsWithBatches,
  citedBatch,
  parentVersion = null,
  showingChanges = false,
  openPen = null,
  penReason = null,
  canSaveOver,
  penHint = null,
  // A blocked save whose block is the version line's own (critique P1 #3,
  // D-21, WR-01 fix): an incrementing attempt counter, not a boolean, so a
  // second consecutive blocked press on the same field re-fires the focus
  // effect below — a value-equal boolean cannot.
  versionLineBlockedAttempt = null,
  onStartDeveloping,
  onCancelDeveloping,
  onChangePenField,
  onSaveAsNewVersion,
  onSaveOverVersion,
  onToggleShowChanges = () => {},
  focusDevelopOnMount = false,
}) {
  // Focus-return for the Develop opener: closing the plan's pen returns
  // focus to the control that opened it. Must sit above the conditional
  // render below — hooks cannot be called conditionally.
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

  // The version-line field's own focus move on a blocked save (critique
  // P1 #3, D-21, WR-01): fires once, on the press of Save, never while
  // the maker types — keyed on the attempt counter, so a second
  // consecutive block on the same field re-fires this effect exactly as
  // the first one did.
  const versionLineFieldRef = useRef(null);
  useEffect(() => {
    if (versionLineBlockedAttempt != null) versionLineFieldRef.current?.focus();
  }, [versionLineBlockedAttempt]);

  return (
    <section className="version-row" aria-label="Version">
      {openPen === 'plan' ? (
        <>
          {/* The plan's pen ceremony (D-06): replaces the Develop opener.
              Markup moved verbatim from Versions.jsx, keeping its
              existing class names. */}
          <div className="versions__ceremony">
            <label className="headnote__version-field">
              <span>Version line</span>
              <input
                ref={versionLineFieldRef}
                type="text"
                className="ink-field"
                required
                autoFocus
                placeholder="e.g. 55 g oil · 800 g"
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
              <textarea
                className="prose-field"
                rows="2"
                placeholder="e.g. less oil after the batch of 2 Aug"
                value={penDraft.reason}
                aria-label="Reason"
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
            {penHint && <p className="headnote__blocked">{penHint}</p>}
          </div>
        </>
      ) : openPen === null ? (
        <div className="versions__openers">
          <div className="versions__opener-group">
            {/* D-27: after a fork saves and the page lands on the child's
                URL, focus goes to the child's own Develop control —
                autoFocus is the DOM's own mechanism for landing focus on
                mount, which a ref-based effect (built for a same-page
                open-to-closed transition) cannot reach across a
                navigation to a freshly-mounted page. */}
            <button
              type="button"
              ref={developButtonRef}
              autoFocus={focusDevelopOnMount}
              onClick={onStartDeveloping}
            >
              Develop
            </button>
          </div>
        </div>
      ) : null}
      {/* D-06: one hint sentence for this row — applies while any pen is
          open, not only the plan's own, since opening a batch pen
          suppresses this row's own links exactly as opening the plan's
          own pen does. */}
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
    </section>
  );
}
