import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { recordDateWords } from '../domain/batch.js';
import { citableBatches, versionsForRecipe, sortedVersions, versionIdentity } from '../domain/lineage.js';
import { RecipeHistory } from './RecipeHistory.jsx';

// The version's own row (sketch 003 variant B, 03.3-01): the front
// matter's first stacked row, spanning the whole page. Carries the
// version's own acts (Develop, the history outline, the lineage line) — the
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
  // The Record opener this row now owns beside Next version (sketch 003
  // variant B, G-03.3-4) — openBatch/onStartRecording are the same
  // references RecipePage.jsx already computes and passes to BatchRow.
  openBatch = null,
  onStartRecording,
  focusVersionOnMount = false,
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

  // The recipe-level History disclosure is closed by default. One complete
  // version set feeds both its count and the parent-child outline, so the
  // label and revealed content cannot diverge.
  const [historyOpen, setHistoryOpen] = useState(false);
  const recipeVersions = versionsForRecipe(versions, version.recipeId);
  const versionCount = recipeVersions.length;
  // The identity heading's inputs (route-recipe.md § 6 "One version
  // identity, wherever a version is named", 2026-09-18): the same ordered
  // array the History disclosure below already computes. isLatest is
  // ordered[0] positionally — the same discipline `Latest` takes in
  // RecipeHistory.jsx, and for the same reason: the marker and the order
  // cannot disagree.
  const ordered = sortedVersions(recipeVersions);
  const isLatest = ordered.length > 0 && ordered[0].id === version.id;

  return (
    <>
      <section
        className={`vmeta${openPen === 'plan' ? ' vmeta--developing' : ''}`}
        aria-label={openPen === 'plan' ? 'Next version' : 'Version'}
        aria-busy={saveAction ? 'true' : undefined}
      >
        {openPen === 'plan' ? (
          <>
            <h2 className="region-name">Next version</h2>
            <dl className="version-row__meta-list">
              <dt className="versions__lineage-label">From version</dt>
              <dd className="versions__lineage">{version.versionLabel}</dd>
            </dl>
            <label className="headnote__reason-field">
              <span className="pen-caption">Why</span>
              <textarea
                className={penDraft.reason === '' ? 'prose-field prose-field--empty' : 'prose-field'}
                rows="2"
                disabled={saveAction !== null}
                placeholder="e.g. less oil after the batch of 2 Aug"
                value={penDraft.reason}
                aria-label="Why"
                onChange={(event) => onChangePenField('reason', event.target.value)}
              />
            </label>
            <label className="headnote__citation">
              <span>From batch</span>
              {batches.length === 0 ? (
                <span className="ink-text">no batch</span>
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
                  {citableBatches(batches).map((batch) => (
                    <option key={batch.id} value={batch.id}>
                      {recordDateWords(batch.churn.churnDate)}
                    </option>
                  ))}
                </select>
              )}
            </label>
            {/* The pen's own form-scoped live region (the todo file's middle
                row): a refused save and a failed write speak here, beside
                the controls and the kept draft, because the pen stays open
                and the draft survives — the page scope is for the save
                that ends the session. Mirrors BatchRow.jsx's own region. */}
            <p className="form-status" role="status" aria-live="polite">
              {formStatus}
            </p>
            <div className="headnote__ceremony">
              <button type="button" disabled={saveAction !== null} onClick={onCancelDeveloping}>
                Cancel
              </button>
              {canSaveOver ? (
                <>
                  <button type="button" disabled={saveAction !== null} onClick={onSaveAsNewVersion}>
                    {saveAction === 'new' ? 'Saving new version…' : 'Save as a new version'}
                  </button>
                  <button type="button" disabled={saveAction !== null} onClick={onSaveOverVersion}>
                    {saveAction === 'over' ? 'Saving this version…' : 'Save over this version'}
                  </button>
                </>
              ) : (
                <button type="button" disabled={saveAction !== null} onClick={onSaveAsNewVersion}>
                  {saveAction === 'new' ? 'Saving new version…' : 'Save as a new version'}
                </button>
              )}
            </div>
          </>
        ) : (
          <>
        {/* The identity heading (route-recipe.md § 6 "One version identity,
            wherever a version is named", 2026-09-18): replaces the sketch's
            bare "Version" region-name heading with the same identity line
            the history register prints for this version, minus "In view"
            — the maker is on it. D-27's landing focus moved here whole
            from Headnote.jsx: the ref, the temporary is-landing-focus
            class, tabIndex and the blur clear. No aria-label override —
            the visible line now says what the override said, so the
            accessible name and the visible text agree. */}
        <h2
          ref={versionIdentityRef}
          className={`version-row__identity${landingFocusVisible ? ' is-landing-focus' : ''}`}
          tabIndex={focusVersionOnMount ? -1 : undefined}
          onBlur={() => setLandingFocusVisible(false)}
        >
          {versionIdentity(ordered, version)}
          {isLatest && (
            <>
              {' '}
              <span className="history-register__marker">· Latest</span>
            </>
          )}
        </h2>

        {/* The version's own right-hand stack (D-08, sketch 003 variant B,
            G-03.3-4): a Written/From-version+date line, a Why line always
            present, and a From-batch line where cited. Parent and Batch
            stay ink links while no pen is open, and plain text while one
            is (the same link-suppression discipline the version list used
            to carry). Sits ABOVE the acts group, matching the sketch's own
            dl-then-acts order (index.html:208-216) — the checkpoint
            feedback's reading-layout fix. The History disclosure control
            used to close this dl (the struck Later dt/dd); it now sits on
            its own line below the dl (260917-odu) — see
            version-row__history just after </dl>. */}
        <dl className="version-row__meta-list">
          {!version.parentVersionId ? (
            <>
              <dt className="versions__lineage-label">Written</dt>
              <dd className="versions__lineage version-row__written">{recordDateWords(version.createdAt)}</dd>
            </>
          ) : (
            <>
              <dt className="versions__lineage-label">From version</dt>
              <dd className="versions__lineage">
                <span className="version-row__parent-name">
                  {openPen ? (
                    version.parentVersionLabel
                  ) : (
                    <Link to={`/recipe/${version.parentVersionId}`} state={{ focusVersion: true }}>
                      {version.parentVersionLabel}
                    </Link>
                  )}
                </span>
                <span className="version-row__written">{` · written ${recordDateWords(version.createdAt)}`}</span>
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
                  <Link to={`/recipe/${version.parentVersionId}/batch/${version.citedBatchId}`} state={{ focusBatch: true }}>
                    {recordDateWords(citedBatch.churn.churnDate)}
                  </Link>
                )}
              </dd>
            </>
          )}
        </dl>

        {/* The history control (route-recipe.md § 3, 260917-odu): names
            the whole set it discloses, so it labels itself — the struck
            "Later" lineage label had no replacement word and inventing
            one is forbidden. Its own line, below the dl and above the
            acts group, rather than inside the dl or the acts group, so it
            stays available while the batch pen is open (D-UAT-2). */}
        {versionCount > 0 && (
          <p className="version-row__history">
            <button
              type="button"
              className="text-control"
              aria-expanded={historyOpen}
              aria-controls="version-row-history"
              onClick={() => setHistoryOpen((open) => !open)}
            >
              {`History (${versionCount} version${versionCount === 1 ? '' : 's'})`}
            </button>
          </p>
        )}

        {/* The acts group (sketch 003 variant B, index.html:215, 479):
            Next version, then Record another/Record batch, then Show
            changes (once a parent exists) — one row, below the dl, only
            while no pen is open. */}
        {openPen === null && (
          <div className="versions__openers">
            <div className="versions__opener-group">
              <button
                type="button"
                ref={developButtonRef}
                onClick={onStartDeveloping}
              >
                Next version
              </button>
              <button type="button" ref={recordButtonRef} onClick={onStartRecording}>
                {openBatch ? 'Record another' : 'Record batch'}
              </button>
              {parentVersion && (
                <button
                  type="button"
                  className="headnote__show-changes text-control text-toggle"
                  aria-pressed={showingChanges}
                  onClick={onToggleShowChanges}
                >
                  Show changes
                </button>
              )}
            </div>
          </div>
        )}
          </>
        )}
      </section>

      {historyOpen && (
        <section id="version-row-history" className="recipe-band__full-row" aria-label="History">
          <h2 className="region-name">History</h2>
          <RecipeHistory
            versions={recipeVersions}
            recipeId={version.recipeId}
            currentVersionId={version.id}
            currentBatchId={openBatch?.id ?? null}
            allBatches={allBatches}
            openPen={openPen}
          />
        </section>
      )}
    </>
  );
}
