import { Link } from 'react-router';
import { formatRecordDate, readMeasured, sortedTastings, hasTasting, isTastingSaveable } from '../domain/batch.js';
import { axesForBatch, markKeyFor } from '../domain/axes.js';
import { AxisMark } from './AxisMark.jsx';

const AS_EXPECTED_WORDS = 'As expected, nothing to note';

// A tasting in the reading state (task 1, task 2): headed by its date or
// "date unknown" (D-03), then its measured fields through readMeasured —
// never a value from the recipe — the marks against their anchors (an
// unmarked axis reads "unmarked" so a reader can see it existed and was
// not judged), the words as plain prose, and the next-time note labelled
// as intention. No aggregate, average, or overall figure is ever derived
// from the marks.
function TastingReading({ tasting, axes }) {
  const dateWords = tasting.date ? formatRecordDate(tasting.date) : 'date unknown';
  return (
    <div className="tasting">
      <p className="batch-margin__legend">{dateWords}</p>
      <p className="batch-margin__measured">
        <span>Tasting temperature, °C</span>
        <span className="ink-text">{readMeasured(tasting.tastingTempC, { signed: true })}</span>
      </p>
      {axes.map((axis) => {
        const key = markKeyFor(axis);
        const hasMark = Object.prototype.hasOwnProperty.call(tasting.marks, key);
        return (
          <p key={key} className="batch-margin__measured">
            <span>{`${axis.label} (${axis.low} … ${axis.high})`}</span>
            <span className="ink-text">{hasMark ? tasting.marks[key] : 'unmarked'}</span>
          </p>
        );
      })}
      <p className="batch-margin__measured">
        <span>Meltdown at 20 min, g</span>
        <span className="ink-text">{readMeasured(tasting.meltdownLossG)}</span>
      </p>
      {tasting.words && <p className="ink-text">{tasting.words}</p>}
      {tasting.nextTimeNote && <p className="ink-text">Next time: {tasting.nextTimeNote}</p>}
    </div>
  );
}

// A tasting being written (task 1): the same fields as ink fields, all
// empty — the date field is never supplied by the app, and the tasting
// temperature field never reads the version's serve target (D-07). Save
// tasting is gated on isTastingSaveable, its disabled state explained in
// text, never by colour alone.
function TastingForm({ draft, axes, onChangeTastingField, onChangeTastingMark, onUseAsExpectedShortcut, onSaveTasting }) {
  const saveable = isTastingSaveable({ words: draft.words, marks: draft.marks });
  return (
    <div className="tasting tasting--recording">
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
          inputMode="decimal"
          className="ink-field"
          value={draft.meltdownLossG}
          aria-label="Meltdown loss, grams"
          onChange={(event) => onChangeTastingField('meltdownLossG', event.target.value)}
        />
      </label>
      <label className="batch-margin__field">
        <span>Words</span>
        <textarea
          className="ink-field"
          rows="2"
          value={draft.words}
          onChange={(event) => onChangeTastingField('words', event.target.value)}
        />
      </label>
      <button type="button" onClick={onUseAsExpectedShortcut}>
        {AS_EXPECTED_WORDS}
      </button>
      <label className="batch-margin__field">
        <span>Next time</span>
        <textarea
          className="ink-field"
          rows="2"
          value={draft.nextTimeNote}
          onChange={(event) => onChangeTastingField('nextTimeNote', event.target.value)}
        />
      </label>
      <button type="button" onClick={onSaveTasting} disabled={!saveable}>
        Save tasting
      </button>
      {!saveable && <p className="batch-margin__hint">Write words or mark at least one axis to save.</p>}
    </div>
  );
}

// The batch-log block leads the margin (route-recipe-batch.md § 3), above
// the advisories and the authored notes, in the printed page's order.
// Three states this task delivers: no batch yet, recording, and a saved
// batch's reading state. Wording beyond what the brief fixes is Claude's
// discretion (02-CONTEXT.md, "Claude's Discretion").
//
// The churn section's field order, top to bottom, is the sheet's own order
// (route-recipe-batch.md § 3, § 6): churn date; come-up; draw temperature;
// overrun; draw notes; ingredient notes; next time. Every measured field in
// the reading state renders through readMeasured — the one place a blank
// becomes the word "unknown" — never a value read from the recipe.
export function BatchMargin({
  version,
  batches = [],
  openBatch,
  mode,
  draft,
  onStartRecording,
  onStartAmending,
  onChangeChurnDate,
  onChangeChurnField,
  onSaveBatch,
  tastingDraft,
  onStartTasting,
  onChangeTastingField,
  onChangeTastingMark,
  onUseAsExpectedShortcut,
  onSaveTasting,
}) {
  if (mode === 'recording') {
    return (
      <div className="batch-margin">
        <p className="batch-margin__legend">Batch</p>
        <label className="batch-margin__field">
          <span>Churn date</span>
          <input
            type="date"
            className="ink-field"
            autoFocus
            value={draft.churnDate}
            onChange={(event) => onChangeChurnDate(event.target.value)}
          />
        </label>
        <label className="batch-margin__field">
          <span>Come-up, min</span>
          <input
            type="number"
            step="1"
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
            inputMode="decimal"
            className="ink-field"
            value={draft.overrunPercent}
            aria-label="Overrun, percent"
            onChange={(event) => onChangeChurnField('overrunPercent', event.target.value)}
          />
        </label>
        <label className="batch-margin__field">
          <span>Draw notes</span>
          <textarea
            className="ink-field"
            rows="2"
            value={draft.drawNotes}
            onChange={(event) => onChangeChurnField('drawNotes', event.target.value)}
          />
        </label>
        <label className="batch-margin__field">
          <span>Ingredient notes</span>
          <input
            type="text"
            className="ink-field"
            value={draft.ingredientNotes}
            onChange={(event) => onChangeChurnField('ingredientNotes', event.target.value)}
          />
        </label>
        <label className="batch-margin__field">
          <span>Next time</span>
          <textarea
            className="ink-field"
            rows="2"
            value={draft.nextTimeNote}
            onChange={(event) => onChangeChurnField('nextTimeNote', event.target.value)}
          />
        </label>
        <button type="button" onClick={onSaveBatch}>
          Save batch
        </button>
      </div>
    );
  }

  if (openBatch) {
    // A blank churn date is not on the sheet, but is possible if the maker
    // saves before typing one — read the same as any other blank measured
    // field (D-03's "date unknown" wording, applied here).
    const churnDateWords = openBatch.churn.churnDate ? formatRecordDate(openBatch.churn.churnDate) : 'date unknown';
    // The latest amendment only (task 3, D-06) — the full list lives in
    // the record, not the reading state.
    const latestAmendment =
      openBatch.amendedAt.length > 0 ? openBatch.amendedAt[openBatch.amendedAt.length - 1] : null;
    // A version with more than one batch is listed by churn date,
    // undated last, each a link to its own URL (task 3, D-20, D-21).
    const sortedBatches = [...batches].sort((a, b) => {
      const aDate = a.churn.churnDate;
      const bDate = b.churn.churnDate;
      if (aDate === bDate) return 0;
      if (aDate === null) return 1;
      if (bDate === null) return -1;
      return aDate < bDate ? 1 : -1;
    });
    return (
      <div className="batch-margin">
        <p className="batch-margin__legend">Batch</p>
        <p className="ink-text">{churnDateWords}</p>
        {latestAmendment && <p className="ink-text">{`amended ${formatRecordDate(latestAmendment)}`}</p>}
        <p className="batch-margin__measured">
          <span>Come-up, min</span>
          <span className="ink-text">{readMeasured(openBatch.churn.comeUpMinutes)}</span>
        </p>
        <p className="batch-margin__measured">
          <span>Draw temperature, °C</span>
          <span className="ink-text">{readMeasured(openBatch.churn.drawTempC, { signed: true })}</span>
        </p>
        <p className="batch-margin__measured">
          <span>Overrun, %</span>
          <span className="ink-text">{readMeasured(openBatch.churn.overrunPercent)}</span>
        </p>
        {openBatch.churn.drawNotes && <p className="ink-text">{openBatch.churn.drawNotes}</p>}
        {openBatch.churn.ingredientNotes && <p className="ink-text">{openBatch.churn.ingredientNotes}</p>}
        {openBatch.churn.nextTimeNote && <p className="ink-text">Next time: {openBatch.churn.nextTimeNote}</p>}
        <p className="ink-text">
          {`recorded ${formatRecordDate(openBatch.recordedAt)} against ${openBatch.snapshot.versionLabel}`}
        </p>
        <button type="button" onClick={() => onStartAmending(openBatch)}>
          Amend
        </button>

        {sortedBatches.length > 1 && (
          <ul className="batch-margin__list">
            {sortedBatches.map((batch) => (
              <li key={batch.id} className={batch.id === openBatch.id ? 'is-open' : undefined}>
                <Link to={`/recipe/${version.id}/batch/${batch.id}`}>
                  {batch.churn.churnDate ? formatRecordDate(batch.churn.churnDate) : 'date unknown'}
                </Link>
              </li>
            ))}
          </ul>
        )}

        {sortedTastings(openBatch).map((tasting) => (
          <TastingReading key={tasting.id} tasting={tasting} axes={axesForBatch(openBatch)} />
        ))}

        {!hasTasting(openBatch) && (
          <p>This batch has not been tasted yet.</p>
        )}

        {tastingDraft ? (
          <TastingForm
            draft={tastingDraft}
            axes={axesForBatch(openBatch)}
            onChangeTastingField={onChangeTastingField}
            onChangeTastingMark={onChangeTastingMark}
            onUseAsExpectedShortcut={onUseAsExpectedShortcut}
            onSaveTasting={onSaveTasting}
          />
        ) : (
          <button type="button" onClick={onStartTasting}>
            Add a tasting
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="batch-margin">
      <p className="batch-margin__legend">Batch</p>
      <p>No batch recorded against this version yet.</p>
      <button type="button" onClick={onStartRecording}>
        Record a batch
      </button>
    </div>
  );
}
