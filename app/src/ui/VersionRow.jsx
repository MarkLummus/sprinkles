import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { formatRecordDate } from '../domain/batch.js';
import { citableBatches, versionsForRecipe } from '../domain/lineage.js';
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
  allBatches = [],
  citedBatch,
  parentVersion = null,
  showingChanges = false,
  openPen = null,
  penReason = null,
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

  // The Versions disclosure (route-recipe.md § 3 "History controls name a
  // whole set, never a direction", 260917-odu): closed by default,
  // revealing the recipe's COMPLETE version list — every version of this
  // recipe, the one in view included, never the subtree below it. One
  // array feeds both the count and the strip, so the two can never
  // diverge.
  const [versionsOpen, setVersionsOpen] = useState(false);
  const recipeVersions = versionsForRecipe(versions, version.recipeId);
  const versionCount = recipeVersions.length;

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
                      {batch.churn.churnDate ? formatRecordDate(batch.churn.churnDate) : 'date unknown'}
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
        {/* The sketch's own visible "Version" region-name heading
            (G-03.3-4) — the section's aria-label already carries "Version"
            as an accessible name; this adds the same word as a visible
            label, matching the "Batch" legend BatchRow.jsx already prints. */}
        <h2 className="region-name">Version</h2>

        {/* The version's own right-hand stack (D-08, sketch 003 variant B,
            G-03.3-4): a Written/From-version+date line, a Why line always
            present, and a From-batch line where cited. Parent and Batch
            stay ink links while no pen is open, and plain text while one
            is (the same link-suppression discipline the version list used
            to carry). Sits ABOVE the acts group, matching the sketch's own
            dl-then-acts order (index.html:208-216) — the checkpoint
            feedback's reading-layout fix. The Versions disclosure control
            used to close this dl (the struck Later dt/dd); it now sits on
            its own line below the dl (260917-odu) — see
            version-row__history just after </dl>. */}
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
              aria-expanded={versionsOpen}
              aria-controls="version-row-versions"
              onClick={() => setVersionsOpen((open) => !open)}
            >
              {`Versions (${versionCount})`}
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

      {versionsOpen && (
        // The Versions disclosure (route-recipe.md § 3, 260917-odu): a
        // full-width row, not nested in vmeta's own narrow column
        // (03.3-06 checkpoint feedback) — now the recipe's complete
        // version list, the version in view included, not the subtree
        // below it.
        <section id="version-row-versions" className="recipe-band__full-row" aria-label="Versions">
          <h2 className="region-name">Versions</h2>
          <VersionStrip
            versions={recipeVersions}
            recipeId={version.recipeId}
            currentId={version.id}
            allBatches={allBatches}
            openPen={openPen}
            penReason={penReason}
          />
        </section>
      )}
    </>
  );
}
