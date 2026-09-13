import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { formatRecordDate, readMeasured, sortedBatches } from '../domain/batch.js';
import { targetValueFor } from '../domain/rows.js';
import { BATTERY_FIELDS, SEGMENT_OPTIONS } from '../domain/battery.js';
import { SaveCeremony } from './PenFoot.jsx';

// A display-only override of readMeasured's own "unknown" wording (D-18),
// scoped to this row's own measured cells (03.3-07, G-03.3-4): reads "not
// measured" instead, matching sketch 003 variant B. readMeasured itself,
// and every other call site of it in this codebase, are untouched.
function churnMeasured(value, options) {
  const result = readMeasured(value, options);
  return result === 'unknown' ? 'not measured' : result;
}

// The three churn-section battery fields, in the contract's own DOM order
// — BATTERY_FIELDS lists the churn numerics before the tasting ones
// (domain/battery.js), so a straight filter preserves that order without
// hard-coding index positions.
const CHURN_MEASURED_FIELDS = BATTERY_FIELDS.filter((field) =>
  ['timeToDrawTempMinutes', 'outOfMachineTempC', 'churnDurationMinutes'].includes(field.key),
);

// aria-label spells the unit out in words (matching the codebase's own
// established convention — "Time to temperature, minutes" — over the
// visible label's abbreviated "min"/"°C").
function unitWords(unit) {
  if (unit === 'min') return 'minutes';
  if (unit === '°C') return 'degrees Celsius';
  return unit;
}

// One battery measured field (contract "Controls spec"): text-mode,
// inputMode="decimal" — never type="number", so a malformed value stays
// in place rather than being rejected before validation runs. The
// .field-error line, aria-invalid and aria-describedby wiring, and the
// first-invalid-field focus move are Task 2's build (03.3.1-02); Task 1's
// own minimum is storing the error and aborting the save, with no
// field-level UI wired yet.
function ChurnMeasuredField({ field, value, onChange }) {
  return (
    <label className="batch-margin__field">
      <span>{`${field.label}, ${field.unit}`}</span>
      <input
        type="text"
        inputMode="decimal"
        className="ink-field"
        aria-label={`${field.label}, ${unitWords(field.unit)}`}
        value={value}
        onChange={(event) => onChange(field.key, event.target.value)}
      />
    </label>
  );
}

// One of the battery's three segmented controls (contract "Controls
// spec"): a role="radiogroup" of native radio inputs, restyled — the
// codebase's own established pattern for keyboard semantics it gets free
// (AxisMark.jsx's header comment). Clicking the checked option again
// clears it (D-10 "Blank stays blank"): a native radio's onChange does not
// re-fire for a click that leaves its value unchanged, so the clear-on-
// reclick logic lives in onClick, with a no-op onChange to keep React's
// controlled-input contract happy.
function SegmentedField({ legend, options, value, onPick }) {
  const groupName = `segment-${legend.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`;
  return (
    <fieldset className="batch-margin__field">
      <legend>{legend}</legend>
      <div className="segmented" role="radiogroup" aria-label={legend}>
        {options.map((option) => (
          <label key={option} className="segmented__option">
            <input
              type="radio"
              name={groupName}
              value={option}
              checked={value === option}
              onChange={() => {}}
              onClick={() => onPick(option)}
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

// Textareas grow with their content (contract "Textareas"): height re-fits
// to the scroll height on every input, rather than clipping or scrolling
// internally.
function autoGrow(event) {
  const el = event.target;
  el.style.height = 'auto';
  el.style.height = `${el.scrollHeight}px`;
}

// The batch's own row (sketch 003 variant B, 03.3-01; rebuilt to the full
// battery in 03.3.1-02): the front matter's second stacked row. One head
// line (Batch label, churned date, later-batches count) precedes the
// churn section, the read view, and the foot controls, in that order. The
// tasting section (its own ceremony, its own fields) is not built here —
// the draft already carries every tasting field (RecipePage.jsx), but no
// control opens or renders it until plan 03.
export function BatchRow({
  version,
  batches = [],
  openBatch,
  mode,
  draft,
  onChangeRecordField,
  onChangeSegment,
  openPen = null,
  penReason = null,
  onStartAmending,
  onCancelRecording,
  onSaveBatch,
}) {
  // Focus-return for the Correct opener this row owns — closing the pen
  // returns focus to the control that opened it. Must sit above the
  // conditional render below — hooks cannot be called conditionally. The
  // Record opener's own ref/effect pair lives in VersionRow.jsx; the Add
  // tasting opener's pair retires with the tasting pen (03.3.1-02) and
  // returns in plan 03 keyed on tastingOpen rather than a pen state. The
  // churn date's own press-to-block focus and the first-invalid-field
  // focus (D-05, contract "Controls spec") are Task 2's build.
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

  // The later-batches disclosure (sketch 003 variant B, G-03.3-4): closed
  // by default, matching the same convention VersionRow's own Later
  // disclosure uses (03.3-06) — the count and the list it discloses are
  // fed by the same computed value, never two divergent queries.
  const [laterBatchesOpen, setLaterBatchesOpen] = useState(false);
  const laterBatchesCount = batches.length - (openBatch ? 1 : 0);

  return (
    <section className="batch-row" aria-label="Batch">
      {/* D-06: one hint sentence for this row — applies while any pen is
          open, not only this row's own. */}
      {openPen && <p className="versions__hint">Links return after you save or cancel.</p>}

      {/* The date and later-batches control name the batch IN VIEW — a
          different batch than the one being recorded while
          openPen === 'record' (Mark, 2026-09-10 live review, G-03.3-4):
          showing them there read as the wrong batch's date. Amending
          keeps both, since amend corrects the very batch in view. */}
      <div className="batch-row__head">
        <h2 className="region-name">Batch</h2>
        {openPen !== 'record' && openBatch && (
          <span className="batch-row__date">
            {`churned ${openBatch.churn.churnDate ? formatRecordDate(openBatch.churn.churnDate) : 'date unknown'}`}
          </span>
        )}
        {openPen !== 'record' && laterBatchesCount > 0 && (
          <button
            type="button"
            className="text-control"
            aria-expanded={laterBatchesOpen}
            onClick={() => setLaterBatchesOpen((open) => !open)}
          >
            {`${laterBatchesCount} later batch${laterBatchesCount === 1 ? '' : 'es'}`}
          </button>
        )}
      </div>

      <div className="batch-margin">
        {mode === 'recording' ? (
          <>
            {/* The churned date, this event's identifying field (D-05),
                as the grid's first cell, then the three numeric churn
                measurements beside it (contract "DOM order inventory"). */}
            <div className="batch-row__cells">
              <label className="batch-margin__field">
                <span>churned</span>
                <input
                  type="date"
                  className="ink-field"
                  autoFocus
                  value={draft.churnDate}
                  onChange={(event) => onChangeRecordField('churnDate', event.target.value)}
                />
              </label>
              {CHURN_MEASURED_FIELDS.map((field) => (
                <ChurnMeasuredField key={field.key} field={field} value={draft[field.key]} onChange={onChangeRecordField} />
              ))}
            </div>
            <SegmentedField
              legend="Exit consistency"
              options={SEGMENT_OPTIONS.exitConsistency}
              value={draft.exitConsistency}
              onPick={(option) => onChangeSegment('exitConsistency', option)}
            />
            <SegmentedField
              legend="Airiness (estimated)"
              options={SEGMENT_OPTIONS.airiness}
              value={draft.airiness}
              onPick={(option) => onChangeSegment('airiness', option)}
            />
            {/* The hairline-baseline fix (03.1 Gap 2 override): a blank
                named prose field carries a graduation-weight rule until
                it holds text — no visible label word is added. */}
            <label className="batch-margin__field">
              <textarea
                className={draft.atTheMachine === '' ? 'prose-field prose-field--empty' : 'prose-field'}
                dir="auto"
                rows="2"
                value={draft.atTheMachine}
                aria-label="At the machine"
                onChange={(event) => onChangeRecordField('atTheMachine', event.target.value)}
                onInput={autoGrow}
              />
            </label>
            <label className="batch-margin__field">
              <textarea
                className={draft.ingredientNotes === '' ? 'prose-field prose-field--empty' : 'prose-field'}
                dir="auto"
                rows="2"
                placeholder="e.g. oil bottle opened 24 Jul"
                value={draft.ingredientNotes}
                aria-label="Ingredient notes"
                onChange={(event) => onChangeRecordField('ingredientNotes', event.target.value)}
                onInput={autoGrow}
              />
            </label>
            {/* Ceremony A (D-01): after the churn section while the
                tasting section is absent, just above the shared Next
                time. Its hint slot renders the record pen's own
                blocked-date sentence once Task 2 wires D-05; Task 1 has
                no such state yet, so the hint is always absent here. */}
            <SaveCeremony onCancel={onCancelRecording} onSave={onSaveBatch} hint={null} />
            <label className="batch-margin__field">
              <textarea
                className={draft.nextTimeNote === '' ? 'prose-field prose-field--empty' : 'prose-field'}
                dir="auto"
                rows="2"
                placeholder="optional — for the batch, the tasting, or both"
                value={draft.nextTimeNote}
                aria-label="Next time"
                onChange={(event) => onChangeRecordField('nextTimeNote', event.target.value)}
                onInput={autoGrow}
              />
            </label>
            {/* The form-status live region (contract "DOM order
                inventory") is Task 2's build. */}
          </>
        ) : openBatch ? (
          <>
            <div className="batch-row__cells">
              <div className="batch-row__cell">
                <span className="batch-row__cell-label">Time to draw temp.</span>
                <span className="batch-row__cell-value">
                  {openBatch.churn.timeToDrawTempMinutes != null ? (
                    <>
                      {churnMeasured(openBatch.churn.timeToDrawTempMinutes)}
                      <span className="batch-row__unit"> min</span>
                    </>
                  ) : (
                    <span className="batch-row__unit">not measured</span>
                  )}
                </span>
                {targetValueFor(version, 'come-up') && (
                  <span className="batch-row__plan">{`plan ${targetValueFor(version, 'come-up')}`}</span>
                )}
              </div>
              <div className="batch-row__cell">
                <span className="batch-row__cell-label">Out of machine</span>
                <span className="batch-row__cell-value">
                  {openBatch.churn.outOfMachineTempC != null ? (
                    <>
                      {churnMeasured(openBatch.churn.outOfMachineTempC, { signed: true })}
                      <span className="batch-row__unit"> °C</span>
                    </>
                  ) : (
                    <span className="batch-row__unit">not measured</span>
                  )}
                </span>
              </div>
              <div className="batch-row__cell">
                <span className="batch-row__cell-label">Churn duration</span>
                <span className="batch-row__cell-value">
                  {openBatch.churn.churnDurationMinutes != null ? (
                    <>
                      {churnMeasured(openBatch.churn.churnDurationMinutes)}
                      <span className="batch-row__unit"> min</span>
                    </>
                  ) : (
                    <span className="batch-row__unit">not measured</span>
                  )}
                </span>
              </div>
              <div className="batch-row__cell">
                <span className="batch-row__cell-label">Exit consistency</span>
                <span className="batch-row__cell-value">
                  {openBatch.churn.exitConsistency ?? <span className="batch-row__unit">not measured</span>}
                </span>
              </div>
              <div className="batch-row__cell">
                <span className="batch-row__cell-label">Airiness</span>
                <span className="batch-row__cell-value">
                  {openBatch.churn.airiness ?? <span className="batch-row__unit">not measured</span>}
                </span>
              </div>
              <div className="batch-row__cell">
                <span className="batch-row__cell-label">Recorded</span>
                <span className="batch-row__cell-value">
                  {`${formatRecordDate(openBatch.recordedAt)} against ${openBatch.snapshot.versionLabel}`}
                </span>
              </div>
            </div>
            {openBatch.churn.atTheMachine && <p className="prose-text">{openBatch.churn.atTheMachine}</p>}
            {openBatch.churn.ingredientNotes && <p className="prose-text">{openBatch.churn.ingredientNotes}</p>}
            {openBatch.churn.nextTimeNote && <p className="prose-text">Next time: {openBatch.churn.nextTimeNote}</p>}

            {/* The tasting battery's own read view (marks, defects, melt
                block, the summary line) is plan 05's build; this plan
                only carries the silence-is-a-value sentence forward. */}
            {!openBatch.tasting && <p>This batch has not been tasted yet.</p>}
          </>
        ) : (
          batches.length > 0 && <p>No batch of this version has that address.</p>
        )}
      </div>

      {/* Correct, relocated to the row's foot as an underlined text
          control (sketch 003 variant B, G-03.3-4) — present only with no
          pen open and a batch in view. Add tasting returns in plan 03,
          once the tasting section has somewhere to open into. */}
      {openPen === null && openBatch && (
        <div className="batch-row__acts">
          <button
            type="button"
            ref={amendButtonRef}
            className="text-control"
            onClick={() => onStartAmending(openBatch)}
          >
            Correct
          </button>
        </div>
      )}

      {/* The batch list (D-09): always a list with zero batches, since
          there is no count to disclose. With one or more, it becomes the
          "Batches of this version" panel the head's own count control
          opens (sketch 003 variant B, G-03.3-4) — closed by default. */}
      {batches.length === 0 ? (
        <ul className="batch-margin__list">
          <li>no batch yet</li>
        </ul>
      ) : (
        laterBatchesOpen && (
          <section className="batch-row__later" aria-label="Batches of this version">
            <h2 className="region-name">Batches of this version</h2>
            <ul className="batch-row__later-list">
              {sortedBatches(batches).map((batch) => {
                const isOpenBatch = openBatch && batch.id === openBatch.id;
                const dateWords = batch.churn.churnDate ? formatRecordDate(batch.churn.churnDate) : 'date unknown';
                const metaParts = [];
                if (batch.churn.outOfMachineTempC != null) {
                  metaParts.push(`out of machine ${churnMeasured(batch.churn.outOfMachineTempC, { signed: true })} °C`);
                }
                if (batch.churn.atTheMachine) metaParts.push(batch.churn.atTheMachine);
                if (batch.tasting) metaParts.push('tasted');
                return (
                  <li key={batch.id}>
                    <p className="batch-row__later-date">
                      {isOpenBatch ? (
                        <>
                          <strong>{dateWords}</strong> <span className="batch-row__later-small">· in view</span>
                        </>
                      ) : openPen ? (
                        dateWords
                      ) : (
                        <Link to={`/recipe/${version.id}/batch/${batch.id}`}>{dateWords}</Link>
                      )}
                    </p>
                    {metaParts.length > 0 && <p className="batch-row__later-meta">{metaParts.join(' · ')}</p>}
                  </li>
                );
              })}
            </ul>
          </section>
        )
      )}
    </section>
  );
}
