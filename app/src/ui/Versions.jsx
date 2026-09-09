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
  openPen = null,
  penReason = null,
  canSaveOver,
  penSaveDisabled = false,
  penHint = null,
  onStartDeveloping,
  onCancelDeveloping,
  onChangePenField,
  onSaveAsNewVersion,
  onSaveOverVersion,
  onToggleShowChanges = () => {},
  onStartRecording,
  onStartAmending,
  onChangeChurnDate,
  onCancelRecording,
  onSaveBatch,
  tastingDraft,
  onStartTasting,
  onChangeTastingField,
  onUseAsExpectedShortcut,
  onSaveTasting,
  onCancelTasting,
  focusDevelopOnMount = false,
}) {
  // Focus-return for each of the four pens, one ref pair per opener,
  // moved verbatim from Headnote.jsx (the plan's pen, Phase 2 precedent)
  // and BatchMargin.jsx (the tasting opener): closing a pen returns focus
  // to the control that opened it. Every ref must sit above the
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

  const amendButtonRef = useRef(null);
  const wasAmendingRef = useRef(false);
  useEffect(() => {
    if (openPen === 'amend') {
      wasAmendingRef.current = true;
      return;
    }
    if (wasAmendingRef.current) {
      wasAmendingRef.current = false;
      amendButtonRef.current?.focus();
    }
  }, [openPen]);

  const addTastingButtonRef = useRef(null);
  const wasTastingRef = useRef(false);
  useEffect(() => {
    if (openPen === 'tasting') {
      wasTastingRef.current = true;
      return;
    }
    if (wasTastingRef.current) {
      wasTastingRef.current = false;
      addTastingButtonRef.current?.focus();
    }
  }, [openPen]);

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
      ) : openPen === 'record' || openPen === 'amend' ? (
        // The record and amend ceremony (D-05, D-10, D-11): the churn
        // date is the identifying field for this event, so it sits here
        // exactly as the plan's own version line does, moved from the
        // headnote's old inline slot. Amend pre-fills draft.churnDate
        // from the batch (RecipePage's handleStartAmending); a fresh
        // recording opens it blank.
        <div className="versions__ceremony">
          <label className="versions__ceremony-field">
            churned{' '}
            <input
              type="date"
              className="ink-field"
              autoFocus
              value={draft.churnDate}
              onChange={(event) => onChangeChurnDate(event.target.value)}
            />
          </label>
          <div className="headnote__ceremony">
            <button type="button" onClick={onCancelRecording}>
              Cancel
            </button>
            <button type="button" onClick={onSaveBatch}>
              Save
            </button>
          </div>
        </div>
      ) : openPen === 'tasting' ? (
        // The tasting ceremony (D-05, D-10, D-11): the shortcut moves
        // here from the margin's TastingForm, since the margin may hold
        // no control at all (D-04) — see the planner decision above.
        <div className="versions__ceremony">
          <label className="versions__ceremony-field">
            <span>Tasting date</span>
            <input
              type="date"
              className="ink-field"
              autoFocus
              value={tastingDraft.date}
              onChange={(event) => onChangeTastingField('date', event.target.value)}
            />
          </label>
          <button type="button" className="versions__ceremony-shortcut" onClick={onUseAsExpectedShortcut}>
            As expected, nothing to note
          </button>
          <div className="headnote__ceremony">
            <button type="button" onClick={onCancelTasting}>
              Cancel
            </button>
            <button type="button" onClick={onSaveTasting} disabled={penSaveDisabled}>
              Save
            </button>
          </div>
          {penHint && <p className="batch-margin__hint">{penHint}</p>}
        </div>
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
          {/* D-05: Record batch when the version has no batch; Record
              another, Amend and Add tasting when a batch is in view —
              the same conditions the margin used (batches, openBatch),
              read here rather than invented anew. */}
          <div className="versions__opener-group">
            <button type="button" ref={recordButtonRef} onClick={onStartRecording}>
              {openBatch ? 'Record another' : 'Record batch'}
            </button>
            {openBatch && (
              <button type="button" ref={amendButtonRef} onClick={() => onStartAmending(openBatch)}>
                Amend
              </button>
            )}
            {openBatch && (
              <button type="button" ref={addTastingButtonRef} onClick={onStartTasting}>
                Add tasting
              </button>
            )}
          </div>
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
