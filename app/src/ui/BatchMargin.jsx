import { formatRecordDate, readMeasured } from '../domain/batch.js';

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
  openBatch,
  mode,
  draft,
  onStartRecording,
  onChangeChurnDate,
  onChangeChurnField,
  onSaveBatch,
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
    return (
      <div className="batch-margin">
        <p className="batch-margin__legend">Batch</p>
        <p className="ink-text">{churnDateWords}</p>
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
