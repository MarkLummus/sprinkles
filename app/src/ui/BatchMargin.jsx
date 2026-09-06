import { formatRecordDate } from '../domain/batch.js';

// The batch-log block leads the margin (route-recipe-batch.md § 3), above
// the advisories and the authored notes, in the printed page's order.
// Three states this task delivers: no batch yet, recording, and a saved
// batch's reading state. Wording beyond what the brief fixes is Claude's
// discretion (02-CONTEXT.md, "Claude's Discretion").
export function BatchMargin({ version, openBatch, mode, draft, onStartRecording, onChangeChurnDate, onSaveBatch }) {
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
