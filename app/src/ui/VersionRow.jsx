import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { recordDateWords, sortedBatches } from '../domain/batch.js';
import { standingFor, NOT_YET_CHURNED, AWAITING_TASTING, TASTED } from '../domain/lastEvent.js';
import { citableBatches, versionsForRecipe, sortedVersions, versionIdentity } from '../domain/lineage.js';
import { notebookPath } from './notebookPaths.js';
import { FieldFeedback } from './FieldFeedback.jsx';
import { FoldRow } from './FoldRow.jsx';
import { useFold } from './useBelowDesktop.js';

// The record act's own word, looked up from the three standings (never
// hand-spelled), the way RecipeList.jsx's STANDING_WORDS does for Home's
// row: the band's filled control, below 724, names what the version is
// waiting on (sketch 011 decision 30, answers 1 and 4).
const RECORD_ACT_WORDS = {
  [NOT_YET_CHURNED]: 'Record a batch',
  [AWAITING_TASTING]: 'Record a tasting',
  [TASTED]: 'Record another',
};

// The version's own row (sketch 003 variant B, 03.3-01): the front
// matter's first stacked row, spanning the whole page. Carries the
// version's own acts (Develop, the history outline, the lineage line) — the
// batch's acts (Record, Correct, Add tasting, the batch list, the
// batch's own content) live in BatchRow.jsx, except that below 724 the
// band's first act is the record act the version is waiting on (sketch 011
// decision 30, Mark 2026-10-02); from 724 up the band is as built. No
// page-level running head here (ROADMAP Scope bullet 1) — the row carries
// no "Versions" heading of its own.
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
  // The details fold (sketch 011 decisions 18/19, 03.5-15 Task 1): a
  // convenience at every width now, not a below-desktop-only affordance —
  // open by default from 1366 (foldsOpen true, the default here) and
  // closed by default below it. Never stored (decisions_recorded 2):
  // useFold below returns detailsOpen to this default whenever it
  // changes, so an iPad rotation across 1366 resets the fold.
  foldsOpen = true,
  // Below 724 (useBelow724, RecipePage's read) the acts row leads with the
  // filled record act and Next version becomes a text control. The two
  // handlers are RecipePage's own: onStartRecording is the one the log's
  // Record another and Record a batch call; onStartTasting opens the amend
  // pen on the batch the label rule read, with the tasting step already open
  // (261002-wn0). amendOpener is RecipePage's record of which control opened
  // the amend pen, so this row takes focus back only when it was the one.
  below724 = false,
  onStartRecording = () => {},
  onStartTasting = () => {},
  amendOpener = 'correct',
}) {
  const [detailsOpen, toggleDetailsOpen] = useFold(foldsOpen);
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

  // Focus-return for the band's Record a tasting (sketch 011 decision 30,
  // Mark 2026-10-02; route-recipe-batch.md section 6: Cancel returns focus
  // to the control that opened the pen). The button unmounts while a pen is
  // open, so the same ref and was-open pair as Develop above. Above the
  // conditional render, like every other ref/effect pair here.
  const recordTastingButtonRef = useRef(null);
  const wasTastingOpenerRef = useRef(false);
  useEffect(() => {
    if (openPen === 'amend') {
      wasTastingOpenerRef.current = amendOpener === 'record-a-tasting';
      return;
    }
    if (wasTastingOpenerRef.current) {
      wasTastingOpenerRef.current = false;
      // focus() alone does not bring the band back in Playwright's WebKit
      // (it left the control 2.7 screens above the viewport after Cancel
      // from the log); Chrome's does. The explicit scroll makes the return
      // the same in both, with the band centred as Chrome's own focus does.
      recordTastingButtonRef.current?.focus();
      recordTastingButtonRef.current?.scrollIntoView({ block: 'center' });
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

  // The band's record act (sketch 011 decision 30), from the same
  // standingFor Home's RowActions and the Go to batch status read, so the
  // band, Home and the jump cannot disagree.
  const standing = standingFor(batches);
  // The batch that standing read (sortedBatches' newest), handed to
  // onStartTasting so RecipePage can open the pen on that batch.
  const latestBatch = sortedBatches(batches)[0];

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
                  tabIndex={0}
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
            <button type="button" className="notebook-action--outline" disabled={saveAction !== null} tabIndex={0} onClick={onCancelDeveloping}>
              Cancel
            </button>
            <button type="button" className="notebook-action" disabled={saveAction !== null} tabIndex={0} onClick={onSaveAsNewVersion}>
              {saveAction === 'new' ? 'Saving new version…' : 'Save as a new version'}
            </button>
            {canSaveOver && (
              <button type="button" className="notebook-action--outline" disabled={saveAction !== null} tabIndex={0} onClick={onSaveOverVersion}>
                {saveAction === 'over' ? 'Saving this version…' : 'Save over this version'}
              </button>
            )}
          </div>
        </form>
      ) : (
        <section className="notebook-version" aria-label="Version" aria-busy={saveAction ? 'true' : undefined}>
        {/* The version column as App front matter (03.5-04 Task 2, sketch
            011 1600-batch.html), and the details fold at every width
            (sketch 011 decisions 18/19, 03.5-15 Task 1): the section's
            first child is FoldRow, whose own label doubles as the
            "Version" caption — the standalone caption span and the old
            below-desktop-only HistoryDisclosure both retire into it. */}
        <FoldRow
          label={<span className="notebook-caption">Version</span>}
          labelText="Version"
          open={detailsOpen}
          onToggle={toggleDetailsOpen}
          controls="fold-version"
          what="details"
        />

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
            version-row__history just after </dl>. The dl always carries
            id="fold-version" now (03.5-15 Task 1) — FoldRow above is its
            control at every width. */}
        <dl
          className="notebook-version__details"
          id="fold-version"
          hidden={!detailsOpen}
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
            restyled as App front matter, Task 2): one row, below the dl,
            only while no pen is open. Below 724 it leads with ONE filled
            control, the record act the version is waiting on (Record a
            tasting, Record another or Record a batch, sketch 011 decision
            30, Mark 2026-10-02), then Next version as the underlined text
            control; from 724 up Next version is the filled control, as
            built, and the record acts live only in BatchRow.jsx's own
            head. Show changes follows once a parent exists, from 724 up;
            below 724 it is on the Ingredients row (IngredientsHead, decision
            30 addendum). */}
        {openPen === null && (
          <div className="notebook-version__acts">
            {below724 && (
              <button
                type="button"
                ref={standing === AWAITING_TASTING ? recordTastingButtonRef : undefined}
                className="notebook-action"
                tabIndex={0}
                onClick={() => (standing === AWAITING_TASTING ? onStartTasting(latestBatch) : onStartRecording())}
              >
                {RECORD_ACT_WORDS[standing]}
              </button>
            )}
            <button
              type="button"
              ref={developButtonRef}
              className={below724 ? 'notebook-link' : 'notebook-action'}
              tabIndex={0}
              onClick={onStartDeveloping}
            >
              Next version
            </button>
            {parentVersion && !below724 && (
              // 03.5-15 Task 2, decisions_recorded 5: names the action by
              // its own state instead of carrying aria-pressed — a toggle
              // that renames itself must not also announce a pressed
              // state (WAI-ARIA APG button pattern), or it doubles the
              // state in the accessible name.
              <button
                type="button"
                className="notebook-link"
                tabIndex={0}
                onClick={onToggleShowChanges}
              >
                {showingChanges ? 'Hide changes' : 'Show changes'}
              </button>
            )}
          </div>
        )}
        </section>
      )}
    </>
  );
}
