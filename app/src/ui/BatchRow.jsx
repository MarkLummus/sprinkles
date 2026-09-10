import { useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { formatRecordDate, readMeasured, sortedBatches, sortedTastings, hasTasting } from '../domain/batch.js';
import { axesForBatch, markKeyFor } from '../domain/axes.js';
import { AxisMark } from './AxisMark.jsx';

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
          <span className="batch-row__cell-label">Meltdown at 20 min, g</span>
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
        <span>Meltdown at 20 min, g</span>
        <input
          type="number"
          step="1"
          min="0"
          inputMode="decimal"
          className="ink-field"
          value={draft.meltdownLossG}
          aria-label="Meltdown loss, grams"
          onChange={(event) => onChangeTastingField('meltdownLossG', event.target.value)}
        />
      </label>
      <label className="batch-margin__field">
        <textarea
          className="prose-field"
          rows="2"
          value={draft.words}
          aria-label="Words"
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

// The batch's own row (sketch 003 variant B, 03.3-01): the front matter's
// second stacked row, merging Versions.jsx's batch-owning openers/ceremony
// with BatchMargin.jsx's content wholesale — BatchMargin.jsx is deleted.
// No page-level running head here (ROADMAP Scope bullet 1); the "Batch"
// legend prints once, not per state.
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
  onStartRecording,
  onStartAmending,
  onChangeChurnDate,
  onCancelRecording,
  onSaveBatch,
  onStartTasting,
  onUseAsExpectedShortcut,
  onSaveTasting,
  onCancelTasting,
}) {
  // Focus-return for the three openers this row owns, one ref pair per
  // opener — closing a pen returns focus to the control that opened it.
  // Every ref must sit above the conditional render below — hooks cannot
  // be called conditionally.
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
          {/* D-05: Record batch when the version has no batch; Record
              another, Amend and Add tasting when a batch is in view. */}
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
      {/* D-06: one hint sentence for this row — applies while any pen is
          open, not only this row's own. */}
      {openPen && <p className="versions__hint">Links return after you save or cancel.</p>}

      <div className="batch-margin">
        <p className="batch-margin__legend">Batch</p>
        {mode === 'recording' ? (
          <>
            {/* Come-up, overrun and meltdown loss have no meaning below
                zero and carry a floor; draw temperature and tasting
                temperature keep their sign — the working case draws at
                −6 °C. */}
            <label className="batch-margin__field">
              <span>Come-up, min</span>
              <input
                type="number"
                step="1"
                min="0"
                inputMode="decimal"
                className="ink-field"
                value={draft.comeUpMinutes}
                aria-label="Come-up, minutes"
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
              <span>Overrun, %</span>
              <input
                type="number"
                step="1"
                min="0"
                inputMode="decimal"
                className="ink-field"
                value={draft.overrunPercent}
                aria-label="Overrun, percent"
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
                aria-label="Draw notes"
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
            {latestAmendment && <p className="ink-text">{`amended ${formatRecordDate(latestAmendment)}`}</p>}
            <div className="batch-row__cells">
              <div className="batch-row__cell">
                <span className="batch-row__cell-label">Come-up, min</span>
                <span className="batch-row__cell-value">{readMeasured(openBatch.churn.comeUpMinutes)}</span>
              </div>
              <div className="batch-row__cell">
                <span className="batch-row__cell-label">Draw temperature, °C</span>
                <span className="batch-row__cell-value">
                  {readMeasured(openBatch.churn.drawTempC, { signed: true })}
                </span>
              </div>
              <div className="batch-row__cell">
                <span className="batch-row__cell-label">Overrun, %</span>
                <span className="batch-row__cell-value">{readMeasured(openBatch.churn.overrunPercent)}</span>
              </div>
            </div>
            {openBatch.churn.drawNotes && <p className="prose-text">{openBatch.churn.drawNotes}</p>}
            {openBatch.churn.ingredientNotes && <p className="prose-text">{openBatch.churn.ingredientNotes}</p>}
            {openBatch.churn.nextTimeNote && <p className="prose-text">Next time: {openBatch.churn.nextTimeNote}</p>}
            <p className="ink-text">
              {`recorded ${formatRecordDate(openBatch.recordedAt)} against ${openBatch.snapshot.versionLabel}`}
            </p>

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
          <p>{batches.length > 0 ? 'No batch of this version has that address.' : 'no batch yet'}</p>
        )}
      </div>

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
            const latestBatchAmendment =
              batch.amendedAt.length > 0 ? batch.amendedAt[batch.amendedAt.length - 1] : null;
            return (
              <li key={batch.id} className={isOpenBatch ? 'is-open' : undefined}>
                {isOpenBatch || openPen ? label : <Link to={`/recipe/${version.id}/batch/${batch.id}`}>{label}</Link>}
                {latestBatchAmendment && (
                  <span className="versions__batch-amended">{`amended ${formatRecordDate(latestBatchAmendment)}`}</span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
