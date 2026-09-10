import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { formatRecordDate, readMeasured, sortedBatches, sortedTastings, hasTasting } from '../domain/batch.js';
import { targetValueFor } from '../domain/rows.js';
import { axesForBatch, markKeyFor } from '../domain/axes.js';
import { AxisMark } from './AxisMark.jsx';

// A display-only override of readMeasured's own "unknown" wording (D-18),
// scoped to this row's own measured cells (03.3-07, G-03.3-4): reads "not
// measured" instead, matching sketch 003 variant B. readMeasured itself,
// and every other call site of it in this codebase, are untouched.
function churnMeasured(value, options) {
  const result = readMeasured(value, options);
  return result === 'unknown' ? 'not measured' : result;
}

// A tasting in the reading state: headed by its date or "date unknown"
// (D-03), then its measured fields and marks as labelled cells at figure
// size (sketch 003 variant B), an unmarked axis reading "unmarked" so a
// reader can see it existed and was not judged. No aggregate, average, or
// overall figure is ever derived from the marks.
function TastingReading({ tasting, axes }) {
  const dateWords = tasting.date ? formatRecordDate(tasting.date) : 'date unknown';
  return (
    <div className="tasting">
      <p className="batch-margin__legend">{dateWords}</p>
      <div className="batch-row__cells">
        <div className="batch-row__cell">
          <span className="batch-row__cell-label">Tasting temperature, °C</span>
          <span className="batch-row__cell-value">{readMeasured(tasting.tastingTempC, { signed: true })}</span>
        </div>
        {axes.map((axis) => {
          const key = markKeyFor(axis);
          const hasMark = Object.prototype.hasOwnProperty.call(tasting.marks, key);
          return (
            <div key={key} className="batch-row__cell">
              <span className="batch-row__cell-label">{`${axis.label} (${axis.low} … ${axis.high})`}</span>
              <span className="batch-row__cell-value">{hasMark ? tasting.marks[key] : 'unmarked'}</span>
            </div>
          );
        })}
        <div className="batch-row__cell">
          <span className="batch-row__cell-label">Melt test, g</span>
          <span className="batch-row__cell-value">{readMeasured(tasting.meltdownLossG)}</span>
        </div>
      </div>
      {tasting.words && <p className="prose-text">{tasting.words}</p>}
      {tasting.nextTimeNote && <p className="prose-text">Next time: {tasting.nextTimeNote}</p>}
    </div>
  );
}

// A tasting being written (shortcut and saves live in this row's own
// ceremony): the same fields as ink fields, all empty — the date field is
// never supplied by the app, and the tasting temperature field never
// reads the version's serve target (D-07).
function TastingForm({ draft, axes, onChangeTastingField, onChangeTastingMark }) {
  return (
    <div className="tasting tasting--recording">
      <p className="batch-margin__legend">Tasting</p>
      <label className="batch-margin__field">
        <span>Tasting date</span>
        <input
          type="date"
          className="ink-field"
          value={draft.date}
          onChange={(event) => onChangeTastingField('date', event.target.value)}
        />
      </label>
      <label className="batch-margin__field">
        <span>Tasting temperature, °C</span>
        <input
          type="number"
          step="0.5"
          inputMode="decimal"
          className="ink-field"
          value={draft.tastingTempC}
          aria-label="Tasting temperature, degrees Celsius"
          onChange={(event) => onChangeTastingField('tastingTempC', event.target.value)}
        />
      </label>
      {axes.map((axis) => {
        const key = markKeyFor(axis);
        return (
          <AxisMark
            key={key}
            axis={axis}
            value={Object.prototype.hasOwnProperty.call(draft.marks, key) ? draft.marks[key] : undefined}
            onChange={(stop) => onChangeTastingMark(key, stop)}
          />
        );
      })}
      <label className="batch-margin__field">
        <span>Melt test, g</span>
        <input
          type="number"
          step="1"
          min="0"
          inputMode="decimal"
          className="ink-field"
          value={draft.meltdownLossG}
          aria-label="Melt test, grams"
          onChange={(event) => onChangeTastingField('meltdownLossG', event.target.value)}
        />
      </label>
      <label className="batch-margin__field">
        <textarea
          className="prose-field"
          rows="2"
          value={draft.words}
          aria-label="How did it turn out?"
          onChange={(event) => onChangeTastingField('words', event.target.value)}
        />
      </label>
      <label className="batch-margin__field">
        <textarea
          className="prose-field"
          rows="2"
          value={draft.nextTimeNote}
          aria-label="Next time"
          onChange={(event) => onChangeTastingField('nextTimeNote', event.target.value)}
        />
      </label>
    </div>
  );
}

// The batch's own row (sketch 003 variant B, 03.3-01, rebuilt against the
// sketch's own `.row-batch` markup in 03.3-07, G-03.3-3/G-03.3-4): the
// front matter's second stacked row. One head line (Batch label, churned
// date, later-batches count) replaces the old per-state "Batch" legend;
// the measured cells, tasting, and foot controls follow it in that order.
export function BatchRow({
  version,
  batches = [],
  openBatch,
  mode,
  draft,
  onChangeChurnField,
  tastingDraft,
  onChangeTastingField,
  onChangeTastingMark,
  openPen = null,
  penReason = null,
  penSaveDisabled = false,
  penHint = null,
  onStartAmending,
  onChangeChurnDate,
  onCancelRecording,
  onSaveBatch,
  onStartTasting,
  onUseAsExpectedShortcut,
  onSaveTasting,
  onCancelTasting,
}) {
  // Focus-return for the two openers this row owns, one ref pair per
  // opener — closing a pen returns focus to the control that opened it.
  // Every ref must sit above the conditional render below — hooks cannot
  // be called conditionally. The Record opener's own ref/effect pair
  // moved to VersionRow.jsx (03.3-06, G-03.3-4) since that row now owns
  // the button beside Next version.
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

  // The later-batches disclosure (sketch 003 variant B, G-03.3-4): closed
  // by default, matching the same convention VersionRow's own Later
  // disclosure uses (03.3-06) — the count and the list it discloses are
  // fed by the same computed value, never two divergent queries.
  const [laterBatchesOpen, setLaterBatchesOpen] = useState(false);
  const laterBatchesCount = batches.length - (openBatch ? 1 : 0);

  const latestAmendment =
    openBatch && openBatch.amendedAt.length > 0 ? openBatch.amendedAt[openBatch.amendedAt.length - 1] : null;

  return (
    <section className="batch-row" aria-label="Batch">
      {openPen === 'record' || openPen === 'amend' ? (
        // The record and amend ceremony (D-05, D-10, D-11): the churn
        // date is the identifying field for this event. Amend pre-fills
        // draft.churnDate from the batch (RecipePage's handleStartAmending);
        // a fresh recording opens it blank.
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
        // The tasting ceremony (D-05, D-10, D-11): the shortcut moves here
        // from the margin's TastingForm, since the margin may hold no
        // control at all (D-04).
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
          {/* D-05: Amend and Add tasting when a batch is in view — Record
              another/Record batch now lives in VersionRow's own acts
              group, beside Next version (03.3-06, G-03.3-4). */}
          <div className="versions__opener-group">
            {openBatch && (
              <button type="button" ref={amendButtonRef} onClick={() => onStartAmending(openBatch)}>
                Correct
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
      {/* D-06: one hint sentence for this row — applies while any pen is
          open, not only this row's own. */}
      {openPen && <p className="versions__hint">Links return after you save or cancel.</p>}

      <div className="batch-row__head">
        <h2 className="region-name">Batch</h2>
        {openBatch && (
          <span className="batch-row__date">
            {`churned ${openBatch.churn.churnDate ? formatRecordDate(openBatch.churn.churnDate) : 'date unknown'}`}
          </span>
        )}
        {laterBatchesCount > 0 && (
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
            {/* Come-up, overrun and meltdown loss have no meaning below
                zero and carry a floor; draw temperature and tasting
                temperature keep their sign — the working case draws at
                −6 °C. */}
            <label className="batch-margin__field">
              <span>Time to temperature, min</span>
              <input
                type="number"
                step="1"
                min="0"
                inputMode="decimal"
                className="ink-field"
                value={draft.comeUpMinutes}
                aria-label="Time to temperature, minutes"
                onChange={(event) => onChangeChurnField('comeUpMinutes', event.target.value)}
              />
            </label>
            <label className="batch-margin__field">
              <span>Draw temperature, °C</span>
              <input
                type="number"
                step="0.5"
                inputMode="decimal"
                className="ink-field"
                value={draft.drawTempC}
                aria-label="Draw temperature, degrees Celsius"
                onChange={(event) => onChangeChurnField('drawTempC', event.target.value)}
              />
            </label>
            <label className="batch-margin__field">
              <span>Air, overrun %</span>
              <input
                type="number"
                step="1"
                min="0"
                inputMode="decimal"
                className="ink-field"
                value={draft.overrunPercent}
                aria-label="Air, overrun percent"
                onChange={(event) => onChangeChurnField('overrunPercent', event.target.value)}
              />
            </label>
            {/* The hairline-baseline fix (03.1 Gap 2 override): a blank
                named prose field carries a graduation-weight rule until
                it holds text — no visible label word is added. */}
            <label className="batch-margin__field">
              <textarea
                className={draft.drawNotes === '' ? 'prose-field prose-field--empty' : 'prose-field'}
                rows="2"
                value={draft.drawNotes}
                aria-label="At the machine"
                onChange={(event) => onChangeChurnField('drawNotes', event.target.value)}
              />
            </label>
            <label className="batch-margin__field">
              <input
                type="text"
                className={draft.ingredientNotes === '' ? 'prose-field prose-field--empty' : 'prose-field'}
                value={draft.ingredientNotes}
                aria-label="Ingredient notes"
                onChange={(event) => onChangeChurnField('ingredientNotes', event.target.value)}
              />
            </label>
            <label className="batch-margin__field">
              <textarea
                className={draft.nextTimeNote === '' ? 'prose-field prose-field--empty' : 'prose-field'}
                rows="2"
                value={draft.nextTimeNote}
                aria-label="Next time"
                onChange={(event) => onChangeChurnField('nextTimeNote', event.target.value)}
              />
            </label>
          </>
        ) : openBatch ? (
          <>
            <div className="batch-row__cells">
              <div className="batch-row__cell">
                <span className="batch-row__cell-label">Time to temperature</span>
                <span className="batch-row__cell-value">
                  {openBatch.churn.comeUpMinutes != null ? (
                    <>
                      {churnMeasured(openBatch.churn.comeUpMinutes)}
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
                <span className="batch-row__cell-label">Draw temperature</span>
                <span className="batch-row__cell-value">
                  {openBatch.churn.drawTempC != null ? (
                    <>
                      {churnMeasured(openBatch.churn.drawTempC, { signed: true })}
                      <span className="batch-row__unit"> °C</span>
                    </>
                  ) : (
                    <span className="batch-row__unit">not measured</span>
                  )}
                </span>
              </div>
              <div className="batch-row__cell">
                <span className="batch-row__cell-label">Air</span>
                <span className="batch-row__cell-value">
                  {openBatch.churn.overrunPercent != null ? (
                    <>
                      {churnMeasured(openBatch.churn.overrunPercent)}
                      <span className="batch-row__unit"> %</span>
                    </>
                  ) : (
                    <span className="batch-row__unit">not measured</span>
                  )}
                </span>
                <span className="batch-row__plan">overrun</span>
              </div>
              {latestAmendment && (
                <div className="batch-row__cell">
                  <span className="batch-row__cell-label">Amended</span>
                  <span className="batch-row__cell-value">{formatRecordDate(latestAmendment)}</span>
                </div>
              )}
              <div className="batch-row__cell">
                <span className="batch-row__cell-label">Recorded</span>
                <span className="batch-row__cell-value">
                  {`${formatRecordDate(openBatch.recordedAt)} against ${openBatch.snapshot.versionLabel}`}
                </span>
              </div>
            </div>
            {openBatch.churn.drawNotes && <p className="prose-text">{openBatch.churn.drawNotes}</p>}
            {openBatch.churn.ingredientNotes && <p className="prose-text">{openBatch.churn.ingredientNotes}</p>}
            {openBatch.churn.nextTimeNote && <p className="prose-text">Next time: {openBatch.churn.nextTimeNote}</p>}

            {sortedTastings(openBatch).map((tasting) => (
              <TastingReading key={tasting.id} tasting={tasting} axes={axesForBatch(openBatch)} />
            ))}

            {!hasTasting(openBatch) && <p>This batch has not been tasted yet.</p>}

            {tastingDraft && (
              <TastingForm
                draft={tastingDraft}
                axes={axesForBatch(openBatch)}
                onChangeTastingField={onChangeTastingField}
                onChangeTastingMark={onChangeTastingMark}
              />
            )}
          </>
        ) : (
          batches.length > 0 && <p>No batch of this version has that address.</p>
        )}
      </div>

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
                if (batch.churn.drawTempC != null) {
                  metaParts.push(`drawn ${churnMeasured(batch.churn.drawTempC, { signed: true })} °C`);
                }
                if (batch.churn.drawNotes) metaParts.push(batch.churn.drawNotes);
                const tastingCount = batch.tastings.length;
                if (tastingCount > 0) {
                  const tastedWords =
                    tastingCount === 1 ? 'once' : tastingCount === 2 ? 'twice' : `${tastingCount} times`;
                  metaParts.push(`tasted ${tastedWords}`);
                }
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
