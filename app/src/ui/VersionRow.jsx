import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { formatRecordDate } from '../domain/batch.js';
import { citableBatches, descendantVersions, versionsForRecipe } from '../domain/lineage.js';
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
  // The Record opener this row now owns beside Next version (sketch 003
  // variant B, G-03.3-4) — openBatch/onStartRecording are the same
  // references RecipePage.jsx already computes and passes to BatchRow.
  openBatch = null,
  onStartRecording,
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

  // D-27: after a fork saves and the page lands on the child's own URL,
  // focus goes to the child's own Next version button. A page-level
  // useEffect — not the native autoFocus DOM attribute — drives this fix
  // for G-03.3-1: router.jsx keys RecipePage by `${id}::${batchId}`, so
  // the child mounts fresh (wrapped in StrictMode by main.jsx, and
  // RecipePage returns null until its async repository.getVersion call
  // resolves) — autoFocus's exact firing point relative to React's commit
  // phases is subtle across that remount. This effect fires only after
  // the full real tree (the child's own data) is committed and is the
  // last thing this component does in that commit, so it is deterministic
  // regardless of that timing and cannot be pre-empted by anything else in
  // the same render. Confirmed by grep across app/src: no other
  // .focus()/autoFocus call is reachable on this openPen === null mount
  // path — the plan-pen ceremony's own autoFocus and BatchRow's
  // record/amend/tasting ceremony autoFocuses only render while a pen is
  // open, and VersionStrip's current-version Link carries no .focus()
  // call.
  useEffect(() => {
    if (focusDevelopOnMount) developButtonRef.current?.focus();
  }, [focusDevelopOnMount]);

  // Focus-return for the Record opener, relocated verbatim from
  // BatchRow.jsx (03.3-06, G-03.3-4) since this row now owns the button
  // beside Next version — must sit above the conditional render below,
  // same as every other ref/effect pair here.
  const recordButtonRef = useRef(null);
  const wasRecordingRef = useRef(false);
  useEffect(() => {
    if (openPen === 'record') {
      wasRecordingRef.current = true;
      return;
    }
    if (wasRecordingRef.current) {
      wasRecordingRef.current = false;
      recordButtonRef.current?.focus();
    }
  }, [openPen]);

  // The version-line field's own focus move on a blocked save (critique
  // P1 #3, D-21, WR-01): fires once, on the press of Save, never while
  // the maker types — keyed on the attempt counter, so a second
  // consecutive block on the same field re-fires this effect exactly as
  // the first one did.
  const versionLineFieldRef = useRef(null);
  useEffect(() => {
    if (versionLineBlockedAttempt != null) versionLineFieldRef.current?.focus();
  }, [versionLineBlockedAttempt]);

  // The Later-versions disclosure (sketch 003 variant B, G-03.3-4): closed
  // by default, revealing the CURRENT version's own descendants — the
  // whole subtree below it, not the recipe's full version list (that
  // full-list rendering retired to this disclosure's own use, replacing
  // the unconditional strip call this file used to make below).
  const [laterVersionsOpen, setLaterVersionsOpen] = useState(false);
  const descendants = descendantVersions(versionsForRecipe(versions, version.recipeId), version.id);
  const laterCount = descendants.length;

  return (
    <section className="version-row" aria-label="Version">
      {/* The sketch's own visible "Version" region-name heading
          (G-03.3-4) — the section's aria-label already carries "Version"
          as an accessible name; this adds the same word as a visible
          label, matching the "Batch" legend BatchRow.jsx already prints. */}
      <h2 className="region-name">Version</h2>
      {openPen === 'plan' ? (
        <>
          {/* The plan's pen ceremony (D-06): replaces the Develop opener.
              Markup moved verbatim from Versions.jsx, keeping its
              existing class names. */}
          <div className="versions__ceremony">
            <label className="headnote__version-field">
              <span>Version</span>
              <input
                ref={versionLineFieldRef}
                type="text"
                className="ink-field"
                required
                autoFocus
                placeholder="e.g. 55 g oil · 800 g"
                value={penDraft.versionLabel}
                aria-label="Version"
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
                aria-label="Why"
                onChange={(event) => onChangePenField('reason', event.target.value)}
              />
            </label>
            <div className="headnote__citation">
              <span>From batch</span>
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
            <button type="button" ref={developButtonRef} onClick={onStartDeveloping}>
              Next version
            </button>
            <button type="button" ref={recordButtonRef} onClick={onStartRecording}>
              {openBatch ? 'Record another' : 'Record batch'}
            </button>
          </div>
        </div>
      ) : null}
      {/* D-06: one hint sentence for this row — applies while any pen is
          open, not only the plan's own, since opening a batch pen
          suppresses this row's own links exactly as opening the plan's
          own pen does. */}
      {openPen && <p className="versions__hint">Links return after you save or cancel.</p>}

      {/* The version's own right-hand stack (D-08, sketch 003 variant B,
          G-03.3-4): a Written/From-version+date line, a Why line always
          present, a From-batch line where cited, and a Later disclosure
          fed by this version's own descendants. Parent and Batch stay ink
          links while no pen is open, and plain text while one is (the
          same link-suppression discipline the version list used to
          carry). */}
      <dl className="version-row__meta-list">
        {!version.parentVersionId ? (
          <>
            <dt className="versions__lineage-label">Written</dt>
            <dd className="versions__lineage">{formatRecordDate(version.createdAt)}</dd>
          </>
        ) : (
          <>
            <dt className="versions__lineage-label">From version</dt>
            <dd className="versions__lineage">
              {openPen ? (
                version.parentVersionLabel
              ) : (
                <Link to={`/recipe/${version.parentVersionId}`}>{version.parentVersionLabel}</Link>
              )}
              {' · written '}
              {formatRecordDate(version.createdAt)}
            </dd>
          </>
        )}
        <dt className="versions__lineage-label">Why</dt>
        <dd className="versions__lineage">{version.reason ? version.reason : 'no reason recorded'}</dd>
        {version.citedBatchId && citedBatch && (
          <>
            <dt className="versions__lineage-label">From batch</dt>
            <dd className="versions__lineage">
              {openPen ? (
                citedBatch.churn.churnDate ? formatRecordDate(citedBatch.churn.churnDate) : 'date unknown'
              ) : (
                <Link to={`/recipe/${version.parentVersionId}/batch/${version.citedBatchId}`}>
                  {citedBatch.churn.churnDate ? formatRecordDate(citedBatch.churn.churnDate) : 'date unknown'}
                </Link>
              )}
            </dd>
          </>
        )}
        {laterCount > 0 && (
          <>
            <dt className="versions__lineage-label">Later</dt>
            <dd className="versions__lineage">
              <button
                type="button"
                className="text-control"
                aria-expanded={laterVersionsOpen}
                onClick={() => setLaterVersionsOpen((open) => !open)}
              >
                {laterCount} later version{laterCount === 1 ? '' : 's'}
              </button>
            </dd>
          </>
        )}
      </dl>

      {laterVersionsOpen && (
        <section aria-label="Later versions">
          <h2 className="region-name">Later versions</h2>
          <VersionStrip
            versions={descendants}
            recipeId={version.recipeId}
            currentId={version.id}
            versionIdsWithBatches={versionIdsWithBatches}
            openPen={openPen}
            penReason={penReason}
          />
        </section>
      )}

      {parentVersion && (
        <p className="versions__lineage">
          <button type="button" className="headnote__show-changes" aria-pressed={showingChanges} onClick={onToggleShowChanges}>
            Show changes
          </button>
        </p>
      )}
    </section>
  );
}
