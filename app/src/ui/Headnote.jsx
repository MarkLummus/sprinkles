import { useEffect, useRef } from 'react';
import { formatRecordDate, sortedBatches } from '../domain/batch.js';

// The headnote region, extracted verbatim from RecipePage.jsx (route-recipe-version.md
// § 3, "The ceremony in the headnote") and then given the save ceremony. RecipePage
// stays the controller and keeps every handler; this component only renders the
// two states — reading/recording (unchanged from Phase 1/2) and developing (new).
export function Headnote({
  version,
  mode,
  draft,
  penDraft,
  openBatch,
  batches,
  blockedMessage,
  onChangeChurnDate,
  onStartDeveloping,
  onCancelDeveloping,
  onChangePenField,
  onSaveAsNewVersion,
  onSaveOverVersion,
}) {
  // Focus-return for the pen (Phase 2 precedent, BatchMargin's tasting
  // focus-return): closing the pen returns focus to "Develop the next
  // version". developButtonRef must sit above the conditional return
  // below — hooks cannot be called conditionally.
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

  if (mode === 'developing') {
    // D-01: on any version with no batch recorded, both saves are offered;
    // on a churned version only "Save as a new version" exists, so a
    // churned version's own record is never written to (D04).
    const canSaveOver = batches.length === 0;
    return (
      <header className="headnote">
        <p className="region-name">Headnote</p>
        <h1>{version.recipeName}</h1>
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
        <p className="headnote__version-was ink-text">was {version.versionLabel}</p>
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
              {sortedBatches(batches).map((batch) => (
                <option key={batch.id} value={batch.id}>
                  {batch.churn.churnDate ? formatRecordDate(batch.churn.churnDate) : 'date unknown'}
                </option>
              ))}
            </select>
          )}
        </div>
        <div className="headnote__ceremony">
          <button type="button" onClick={onSaveAsNewVersion}>
            Save as a new version
          </button>
          {canSaveOver && (
            <button type="button" onClick={onSaveOverVersion}>
              Save over this version
            </button>
          )}
          <button type="button" onClick={onCancelDeveloping}>
            Cancel
          </button>
        </div>
        {blockedMessage && <p className="headnote__blocked">{blockedMessage}</p>}
        {/* The headnote prose (route-recipe-version.md § 3): a text field
            in developing mode, with the baseline's prose struck beneath it
            once it differs — the same treatment a step's text gets. */}
        <label className="headnote__prose-field">
          <span>Headnote prose</span>
          <textarea
            className="ink-field"
            rows="3"
            value={penDraft.headnote}
            aria-label="Headnote prose"
            onChange={(event) => onChangePenField('headnote', event.target.value)}
          />
        </label>
        {penDraft.headnote !== version.headnote && <p className="prose-struck-beneath">{version.headnote}</p>}
      </header>
    );
  }

  return (
    <header className="headnote">
      <p className="region-name">Headnote</p>
      <h1>{version.recipeName}</h1>
      <p className="headnote__version">
        {version.versionLabel}
        {(mode === 'recording' || openBatch) && (
          <>
            {' · '}
            {mode === 'recording' ? (
              <label>
                churned{' '}
                <input
                  type="date"
                  className="ink-field headnote__churn-field"
                  autoFocus
                  value={draft.churnDate}
                  onChange={(event) => onChangeChurnDate(event.target.value)}
                />
              </label>
            ) : (
              <>
                churned{' '}
                <span className="ink-text">
                  {openBatch.churn.churnDate ? formatRecordDate(openBatch.churn.churnDate) : 'date unknown'}
                </span>
              </>
            )}
          </>
        )}
      </p>
      {/* D-01: this wording on every version, churned or not — disabled
          while mode === 'recording' so the two pens stay mutually
          exclusive (03-CONTEXT.md D-10, RESEARCH.md Pitfall 4). */}
      <button type="button" ref={developButtonRef} onClick={onStartDeveloping} disabled={mode === 'recording'}>
        Develop the next version
      </button>
      <p className="headnote__prose">{version.headnote}</p>
    </header>
  );
}
