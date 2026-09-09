import { formatRecordDate, readMeasured, sortedTastings, hasTasting } from '../domain/batch.js';
import { axesForBatch, markKeyFor } from '../domain/axes.js';
import { AxisMark } from './AxisMark.jsx';

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
      {tasting.words && <p className="prose-text">{tasting.words}</p>}
      {tasting.nextTimeNote && <p className="prose-text">Next time: {tasting.nextTimeNote}</p>}
    </div>
  );
}

// A tasting being written (task 1, shortcut and saves moved to Versions'
// own ceremony in task 2): the same fields as ink fields, all empty — the
// date field is never supplied by the app, and the tasting temperature
// field never reads the version's serve target (D-07).
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

// The record's content, and only its content (route-recipe.md § 3 "The
// imprint", D-04): the batch-log block above the advisories and the
// authored notes, in the printed page's order. Every opener, every save
// and every cancel now live in Versions.jsx — this component renders no
// button element at all. Three states this task delivers: no batch yet,
// recording, and a saved batch's reading state.
//
// The churn section's field order, top to bottom, is the sheet's own order
// minus the churn date, which now lives in Versions' own record/amend
// ceremony (D-04, D-09): come-up; draw temperature; overrun; draw notes;
// ingredient notes; next time. Every measured field in the reading state
// renders through readMeasured — the one place a blank becomes the word
// "unknown" — never a value read from the recipe. The tasting's own date
// field carries no autoFocus here — that lands in the ceremony's own
// tasting-date field instead (Rule 1: two autofocus attributes in the same
// page is undefined browser behaviour); this field stays editable as
// printed content, per D-25's "outline on focus only" pattern.
export function BatchMargin({
  version,
  batches = [],
  openBatch,
  mode,
  draft,
  onChangeChurnField,
  tastingDraft,
  onChangeTastingField,
  onChangeTastingMark,
}) {
  if (mode === 'recording') {
    return (
      <div className="batch-margin">
        <p className="batch-margin__legend">Batch</p>
        {/* Come-up, overrun and meltdown loss have no meaning below zero and
            carry a floor; draw temperature and tasting temperature keep
            their sign — the working case draws at −6 °C. */}
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
        <label className="batch-margin__field">
          <textarea
            className="prose-field"
            rows="2"
            value={draft.drawNotes}
            aria-label="Draw notes"
            onChange={(event) => onChangeChurnField('drawNotes', event.target.value)}
          />
        </label>
        <label className="batch-margin__field">
          <input
            type="text"
            className="prose-field"
            value={draft.ingredientNotes}
            aria-label="Ingredient notes"
            onChange={(event) => onChangeChurnField('ingredientNotes', event.target.value)}
          />
        </label>
        <label className="batch-margin__field">
          <textarea
            className="prose-field"
            rows="2"
            value={draft.nextTimeNote}
            aria-label="Next time"
            onChange={(event) => onChangeChurnField('nextTimeNote', event.target.value)}
          />
        </label>
      </div>
    );
  }

  if (openBatch) {
    // The latest amendment only (task 3, D-06) — the full list, the
    // Amend/Record another openers, and the churn date all now live in
    // Versions (D-04, D-09).
    const latestAmendment =
      openBatch.amendedAt.length > 0 ? openBatch.amendedAt[openBatch.amendedAt.length - 1] : null;
    return (
      <div className="batch-margin">
        <p className="batch-margin__legend">Batch</p>
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
        {openBatch.churn.drawNotes && <p className="prose-text">{openBatch.churn.drawNotes}</p>}
        {openBatch.churn.ingredientNotes && <p className="prose-text">{openBatch.churn.ingredientNotes}</p>}
        {openBatch.churn.nextTimeNote && <p className="prose-text">Next time: {openBatch.churn.nextTimeNote}</p>}
        <p className="ink-text">
          {`recorded ${formatRecordDate(openBatch.recordedAt)} against ${openBatch.snapshot.versionLabel}`}
        </p>

        {sortedTastings(openBatch).map((tasting) => (
          <TastingReading key={tasting.id} tasting={tasting} axes={axesForBatch(openBatch)} />
        ))}

        {!hasTasting(openBatch) && (
          <p>This batch has not been tasted yet.</p>
        )}

        {tastingDraft && (
          <TastingForm
            draft={tastingDraft}
            axes={axesForBatch(openBatch)}
            onChangeTastingField={onChangeTastingField}
            onChangeTastingMark={onChangeTastingMark}
          />
        )}
      </div>
    );
  }

  return (
    <div className="batch-margin">
      <p className="batch-margin__legend">Batch</p>
      <p>{batches.length > 0 ? 'No batch of this version has that address.' : 'no batch yet'}</p>
    </div>
  );
}
