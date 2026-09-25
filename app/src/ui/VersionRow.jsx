import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { recordDateWords } from '../domain/batch.js';
import { citableBatches, versionsForRecipe, sortedVersions, versionIdentity } from '../domain/lineage.js';
import { notebookPath } from './notebookPaths.js';
import { FieldFeedback } from './FieldFeedback.jsx';
import { HistoryDisclosure } from './History.jsx';

// The version's own row (sketch 003 variant B, 03.3-01): the front
// matter's first stacked row, spanning the whole page. Carries the
// version's own acts (Develop, the history outline, the lineage line) — the
// batch's acts (Record, Correct, Add tasting, the batch list, the
// batch's own content) now live in BatchRow.jsx. No page-level running
// head here (ROADMAP Scope bullet 1) — the row carries no "Versions"
// heading of its own.
export function VersionRow({
  version,
  versions,
  mode,
  penDraft,
  batches,
  allBatches = [],
  citedBatch,
  parentVersion = null,
  showingChanges = false,
  openPen = null,
  canSaveOver,
  saveAction = null,
  formStatus = '',
  onStartDeveloping,
  onCancelDeveloping,
  onChangePenField,
  onSaveAsNewVersion,
  onSaveOverVersion,
  onToggleShowChanges = () => {},
  focusVersionOnMount = false,
  // The Version name field's own blocked-save state (03.5-04 Task 3,
  // moved whole from Headnote.jsx): versionLineBlockedAttempt is an
  // attempt counter (WR-01's pattern) so a second consecutive block still
  // refocuses the field; versionLineError is the field's own contract
  // sentence, read by FieldFeedback.
  versionLineBlockedAttempt = null,
  versionLineError = null,
  // The Details fold (03.5-08 Task 1, settled decision 6): below desktop
  // the version's own Written/From/Why details close by default behind a
  // "Details" control; at desktop (foldable false, the default) nothing
  // here changes.
  foldable = false,
}) {
  // Local, never stored (settled decision 6): starts closed on every
  // mount, so every visit to the route below desktop reopens closed.
  const [detailsOpen, setDetailsOpen] = useState(false);
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

  // Focus-return for a fork's landing (D-27), relocated verbatim from
  // Headnote.jsx: after a child is created, land on the identity that was
  // just saved. The temporary class keeps the programmatic landing
  // visible even when the save began with a pointer; blur returns the
  // line to ordinary ink. Must sit above the conditional render below,
  // same as every other ref/effect pair here.
  const versionIdentityRef = useRef(null);
  const [landingFocusVisible, setLandingFocusVisible] = useState(false);
  useEffect(() => {
    if (focusVersionOnMount && mode === 'reading') {
      versionIdentityRef.current?.focus();
      setLandingFocusVisible(true);
    }
  }, [focusVersionOnMount, mode]);

  // Focus-return for the Version name field's own blocked save (03.5-04
  // Task 3, moved whole from Headnote.jsx): must sit above the
  // conditional render below, same as every other ref/effect pair here.
  const versionLineFieldRef = useRef(null);
  useEffect(() => {
    if (versionLineBlockedAttempt != null) versionLineFieldRef.current?.focus();
  }, [versionLineBlockedAttempt]);

  const recipeVersions = versionsForRecipe(versions, version.recipeId);
  // The identity heading's inputs (route-recipe.md § 6 "One version
  // identity, wherever a version is named", 2026-09-18): the same ordered
  // array the History disclosure below already computes. isLatest is
  // ordered[0] positionally — the same discipline `Latest` takes in
  // RecipeHistory.jsx, and for the same reason: the marker and the order
  // cannot disagree.
  const ordered = sortedVersions(recipeVersions);
  const isLatest = ordered.length > 0 && ordered[0].id === version.id;

  // The ceremony's own caption (03.5-04 Task 3, decisions_recorded 6):
  // "Next version · draft from Version N", N the PARENT's (this version's)
  // own position in the same ordered array versionIdentity reads — absent
  // during the pre-load paint, the same edge case versionIdentity itself
  // already handles by falling back to no guessed number.
  const versionOrdinalIndex = ordered.findIndex((candidate) => candidate.id === version.id);
  const ceremonyCaption =
    versionOrdinalIndex >= 0
      ? `Next version · draft from Version ${ordered.length - versionOrdinalIndex}`
      : 'Next version';

  // The From batch fieldset's own citable list (decisions_recorded 5):
  // one checkbox when exactly one batch is citable, the existing select
  // with more than one, and "no batch" with none — computed once here so
  // the fieldset's three branches never call citableBatches a second time.
  const citable = citableBatches(batches);

  return (
    <>
      {openPen === 'plan' ? (
        <form
          className="notebook-ceremony"
          aria-label="Next version"
          aria-busy={saveAction ? 'true' : undefined}
          onSubmit={(event) => event.preventDefault()}
        >
          <span className="notebook-caption">{ceremonyCaption}</span>

          {/* The Version name field (03.5-04 Task 3, moved whole from
              Headnote.jsx): keeps required/autoFocus, the blocked-attempt
              focus effect and FieldFeedback — only its placeholder, helper
              and aria-label change (1600-pen.html). */}
          <label className="notebook-field">
            <span className="notebook-caption">Version name</span>
            <input
              ref={versionLineFieldRef}
              type="text"
              className="ink-field"
              required
              autoFocus
              disabled={saveAction !== null}
              placeholder="e.g. less oil"
              value={penDraft.versionLabel}
              aria-label="Version name"
              aria-invalid={versionLineError ? 'true' : undefined}
              aria-describedby={versionLineError ? 'version-field-error' : undefined}
              onChange={(event) => onChangePenField('versionLabel', event.target.value)}
            />
            <p className="notebook-helper">{`was ${version.versionLabel}`}</p>
            <FieldFeedback error={versionLineError} errorId="version-field-error" required />
          </label>

          <label className="notebook-field">
            <span className="notebook-caption">Why</span>
            <textarea
              className="notebook-ceremony__why"
              rows="2"
              disabled={saveAction !== null}
              placeholder="what this version is for, in your words"
              value={penDraft.reason}
              aria-label="Why"
              onChange={(event) => onChangePenField('reason', event.target.value)}
            />
          </label>

          {/* From batch (decisions_recorded 5): one checkbox when exactly
              one batch is citable, the existing select with more than one,
              "no batch" with none — a group of checkboxes never pretends
              to be single-choice. */}
          <fieldset className="notebook-ceremony__batch-fieldset">
            <legend className="notebook-caption">From batch</legend>
            {batches.length === 0 ? (
              <span className="ink-text">no batch</span>
            ) : citable.length === 1 ? (
              <label className="notebook-ceremony__batch-option">
                <input
                  type="checkbox"
                  disabled={saveAction !== null}
                  checked={penDraft.citedBatchId === citable[0].id}
                  onChange={() =>
                    onChangePenField('citedBatchId', penDraft.citedBatchId === citable[0].id ? null : citable[0].id)
                  }
                />
                {`${recordDateWords(citable[0].churn.churnDate)}${citable[0].churn.atTheMachine ? ` · ${citable[0].churn.atTheMachine}` : ''}`}
              </label>
            ) : (
              <select
                className="ink-field"
                disabled={saveAction !== null}
                value={penDraft.citedBatchId ?? ''}
                aria-label="Cite a batch"
                onChange={(event) =>
                  onChangePenField('citedBatchId', event.target.value === '' ? null : event.target.value)
                }
              >
                <option value="">no batch cited</option>
                {citable.map((batch) => (
                  <option key={batch.id} value={batch.id}>
                    {recordDateWords(batch.churn.churnDate)}
                  </option>
                ))}
              </select>
            )}
          </fieldset>

          {/* The pen's own form-scoped live region (the todo file's middle
              row): a refused save and a failed write speak here, beside
              the controls and the kept draft, because the pen stays open
              and the draft survives — the page scope is for the save
              that ends the session. Mirrors BatchRow.jsx's own region. */}
          <p className="form-status" role="status" aria-live="polite">
            {formStatus}
          </p>

          <div className="notebook-ceremony__actions">
            <button type="button" className="notebook-action--outline" disabled={saveAction !== null} onClick={onCancelDeveloping}>
              Cancel
            </button>
            <button type="button" className="notebook-action" disabled={saveAction !== null} onClick={onSaveAsNewVersion}>
              {saveAction === 'new' ? 'Saving new version…' : 'Save as a new version'}
            </button>
            {canSaveOver && (
              <button type="button" className="notebook-action--outline" disabled={saveAction !== null} onClick={onSaveOverVersion}>
                {saveAction === 'over' ? 'Saving this version…' : 'Save over this version'}
              </button>
            )}
          </div>
        </form>
      ) : (
        <section className="notebook-version" aria-label="Version" aria-busy={saveAction ? 'true' : undefined}>
        {/* The version column as App front matter (03.5-04 Task 2, sketch
            011 1600-batch.html): a "Version" caption, then the identity
            heading. */}
        <span className="notebook-caption">Version</span>

        {/* The identity heading (route-recipe.md § 6 "One version identity,
            wherever a version is named", 2026-09-18): replaces the sketch's
            bare "Version" region-name heading with the same identity line
            the history register prints for this version, minus "In view"
            — the maker is on it. D-27's landing focus moved here whole
            from Headnote.jsx: the ref, the temporary is-landing-focus
            class, tabIndex and the blur clear. No aria-label override —
            the visible line now says what the override said, so the
            accessible name and the visible text agree. Restyled as App
            front matter (Task 2): HistoryMarkers (a Sheet-context register
            marker) is replaced by a literal "· Latest" span — the only
            marker this heading ever draws. */}
        <h2
          ref={versionIdentityRef}
          className={`notebook-version__identity${landingFocusVisible ? ' is-landing-focus' : ''}`}
          tabIndex={focusVersionOnMount ? -1 : undefined}
          onBlur={() => setLandingFocusVisible(false)}
        >
          {versionIdentity(ordered, version)}
          {isLatest && <span className="notebook-version__latest"> · Latest</span>}
        </h2>

        {/* The version's own right-hand stack (D-08, sketch 003 variant B,
            G-03.3-4): a Written line carrying this version's own date, a
            From-version line where a parent exists, a Why line always
            present, and a From-batch line where cited. Parent and Batch
            stay ink links while no pen is open, and plain text while one
            is (the same link-suppression discipline the version list used
            to carry). Sits ABOVE the acts group, matching the sketch's own
            dl-then-acts order (index.html:208-216) — the checkpoint
            feedback's reading-layout fix. The History disclosure control
            used to close this dl (the struck Later dt/dd); it now sits on
            its own line below the dl (260917-odu) — see
            version-row__history just after </dl>. */}
        {foldable && (
          <HistoryDisclosure open={detailsOpen} onToggle={() => setDetailsOpen((open) => !open)} panelId="fold-version">
            Details
          </HistoryDisclosure>
        )}
        <dl
          className="notebook-version__details"
          id={foldable ? 'fold-version' : undefined}
          hidden={foldable ? !detailsOpen : undefined}
        >
          <dt className="versions__lineage-label">Written</dt>
          <dd className="versions__lineage version-row__written">{recordDateWords(version.createdAt)}</dd>
          {version.parentVersionId && (
            <>
              <dt className="versions__lineage-label">From version</dt>
              <dd className="versions__lineage">
                <span className="version-row__parent-name">
                  {openPen ? (
                    version.parentVersionLabel
                  ) : (
                    <Link to={notebookPath(version.recipeId, version.parentVersionId)} state={{ focusVersion: true }} tabIndex={0}>
                      {version.parentVersionLabel}
                    </Link>
                  )}
                </span>
              </dd>
            </>
          )}
          <dt className="versions__lineage-label version-row__reason-label">Why</dt>
          <dd
            className={version.reason
              ? 'version-row__reason prose-text'
              : 'version-row__reason version-row__reason--empty'}
          >
            {version.reason ? version.reason : 'no reason recorded'}
          </dd>
          {version.citedBatchId && citedBatch && (
            <>
              <dt className="versions__lineage-label">From batch</dt>
              <dd className="versions__lineage version-row__batch-provenance">
                {openPen ? (
                  recordDateWords(citedBatch.churn.churnDate)
                ) : (
                  <Link to={notebookPath(version.recipeId, version.parentVersionId, version.citedBatchId)} state={{ focusBatch: true }} tabIndex={0}>
                    {recordDateWords(citedBatch.churn.churnDate)}
                  </Link>
                )}
              </dd>
            </>
          )}
        </dl>

        {/* The acts group (sketch 003 variant B, index.html:215, 479;
            restyled as App front matter, Task 2): Next version, then Show
            changes (once a parent exists) — one row, below the dl, only
            while no pen is open. The Record opener moved to BatchRow.jsx's
            own head, beside Batches/Correct (03.5-07 Task 1,
            decisions_recorded 1). */}
        {openPen === null && (
          <div className="notebook-version__acts">
            <button
              type="button"
              ref={developButtonRef}
              className="notebook-action"
              onClick={onStartDeveloping}
            >
              Next version
            </button>
            {parentVersion && (
              <button
                type="button"
                className="notebook-link"
                aria-pressed={showingChanges}
                onClick={onToggleShowChanges}
              >
                Show changes
              </button>
            )}
          </div>
        )}
        </section>
      )}
    </>
  );
}
