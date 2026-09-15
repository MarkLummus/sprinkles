import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { formatRecordDate, readMeasured, sortedBatches } from '../domain/batch.js';
import { targetValueFor } from '../domain/rows.js';
import { BATTERY_FIELDS, SEGMENT_OPTIONS, DEFECTS, DECLARED_FLAW } from '../domain/battery.js';
import { axesForBatch, readMarkWord } from '../domain/axes.js';
import { SaveCeremony } from './PenFoot.jsx';
import { Segmented } from './Segmented.jsx';
import { AxisMark } from './AxisMark.jsx';

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

// The tasting field-row's two measured fields (contract "DOM order
// inventory" § tasting body): Tempering, unit min — "Where sources
// disagree (HTML wins)" § 1 places it here, never in the churn section,
// however D-10's own wording groups it.
// Tasting temperature, unit °C, signed — the field-row's other measured
// field, beside Tempering. Melt test (meltTestG) is also a BATTERY_FIELDS
// entry but belongs to the melt block at the tasting body's foot
// (03.3.1-03 Task 3), not this field-row.
const TASTING_MEASURED_FIELDS = BATTERY_FIELDS.filter((field) =>
  ['temperingMinutes', 'tastingTempC'].includes(field.key),
);

// The melt block's own measured field (sketch 007 line 287; D-12 drops
// the "(optional)" suffix this field used to carry): the same
// BATTERY_FIELDS entry as every other measured field, used unmodified —
// domain/battery.js's own label ('Melt test') is already the sketch's
// wording, so no override is needed here.
const MELT_TEST_FIELD = BATTERY_FIELDS.find((field) => field.key === 'meltTestG');

// aria-label spells the unit out in words (matching the codebase's own
// established convention — "Time to temperature, minutes" — over the
// visible label's abbreviated "min"/"°C").
function unitWords(unit) {
  if (unit === 'min') return 'minutes';
  if (unit === '°C') return 'degrees Celsius';
  return unit;
}

// One battery measured field (contract "Controls spec"; sketch 007 @
// 2a212be lines 37-44; D-13): text-mode, inputMode="decimal" — never
// type="number", so a malformed value stays in place rather than being
// rejected before validation runs. The unit word is a sibling after the
// input, never concatenated into the caption (007 lines 42-44: the root
// cause of UAT item 2) — the aria-label keeps the spelled-out unit for
// the field's accessible name. The .field-error line renders inside the
// label and is wired by aria-describedby exactly as the contract
// specifies; aria-invalid tracks the same fact. Shared by both sections —
// the three churn measurements and the tasting field-row's own two
// (03.3.1-03 Task 1) — since the contract's rule is identical either
// side of the churn/tasting line.
function MeasuredField({ field, value, error, onChange, inputRef }) {
  const errorId = `field-error-${field.key}`;
  return (
    <label className="field-row__label">
      <span className="pen-caption">{field.label}</span>
      <span className="field-unit">
        <input
          type="text"
          inputMode="decimal"
          className="ink-field"
          aria-label={`${field.label}, ${unitWords(field.unit)}`}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? errorId : undefined}
          value={value}
          ref={inputRef}
          onChange={(event) => onChange(field.key, event.target.value)}
        />
        <span className="field-unit__unit">{field.unit}</span>
      </span>
      {error && (
        <span id={errorId} className="field-error">
          {error}
        </span>
      )}
    </label>
  );
}

// One of the battery's three segmented controls (contract "Controls
// spec"), wrapped in its own labelled field — the visible legend is this
// wrapper's own job; Segmented.jsx (one home, three uses: Exit
// consistency, Airiness (estimated), Melt style (optional)) owns the
// radiogroup itself, including click-again-clears. `onPick` receives
// whatever Segmented passes through — the picked option, or null when the
// checked option was clicked again — so the caller decides how a null is
// stored (D-10 "Blank stays blank").
function SegmentedField({ legend, options, value, onPick }) {
  return (
    <fieldset className="batch-margin__field">
      <legend className="pen-caption">{legend}</legend>
      <Segmented groupLabel={legend} options={options} value={value} onChange={onPick} />
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

// The axes' per-arrangement render (contract "Keyboard and tab order"): a
// matchMedia listener on (max-width: 760px), re-rendering on crossing.
// Node-guarded (RESEARCH.md Code Example 6, this plan's own critical
// note): BatchRow's own static-markup tests run under Vitest's node
// environment (renderToStaticMarkup, no jsdom), where `window` does not
// exist — an unguarded read here would crash every existing static test
// the instant this hook landed. With no window, or no
// window.matchMedia, the hook answers the desktop arrangement and builds
// no listener; the real subscription exists only in the browser.
function useBelow760() {
  const hasMatchMedia = typeof window !== 'undefined' && typeof window.matchMedia === 'function';
  const [below, setBelow] = useState(() => (hasMatchMedia ? window.matchMedia('(max-width: 760px)').matches : false));
  useEffect(() => {
    if (!hasMatchMedia) return undefined;
    const mediaQuery = window.matchMedia('(max-width: 760px)');
    const onChange = (event) => setBelow(event.matches);
    mediaQuery.addEventListener('change', onChange);
    return () => mediaQuery.removeEventListener('change', onChange);
  }, [hasMatchMedia]);
  return below;
}

// AxesGrid: the six-axis battery in one of the contract's two DOM orders
// per arrangement (contract "Keyboard and tab order") — desktop row-major
// or stacked core-then-declared. `below` is an explicit boolean, never a
// live matchMedia read, so BatchRow.test.jsx can render and assert both
// arrangements directly, without stubbing matchMedia (this plan's own
// critical note) — BatchRow's own useBelow760 above is the only thing
// that reads the real matchMedia, and only where window supports it.
// `marks` is the draft's own marks map, read by axis key, so a mark
// crossing the boundary survives by construction (Pitfall 8).
export function AxesGrid({ axes, marks, below, onChangeMark, onClearMark }) {
  const core = axes.filter((axis) => axis.group === 'core');
  const declared = axes.filter((axis) => axis.group === 'declared');

  function renderAxis(axis, declaredCaption = null) {
    if (!axis) return null;
    return (
      <AxisMark
        key={axis.key}
        axis={axis}
        value={marks[axis.key]}
        onChange={(stop) => onChangeMark(axis.key, stop)}
        onClear={() => onClearMark(axis.key, axis.name)}
        declaredCaption={declaredCaption}
      />
    );
  }

  if (below) {
    return (
      <div className="axes-grid axes-grid--stacked">
        <div className="axes-grid__group">{core.map((axis) => renderAxis(axis))}</div>
        <div className="axes-grid__group axes-grid__group--declared">
          <p className="axes-declared-caption">Declared for this recipe</p>
          {declared.map((axis) => renderAxis(axis))}
        </div>
      </div>
    );
  }

  // Desktop row-major (contract "Axes spec"/"Keyboard and tab order"):
  // Hardness, Scoopability, Body, Smoothness, Sweetness, Oil — the
  // hairline sits between columns 2 and 3; the caption rides inside
  // Body's own box (declared[0]), never a second, separate element
  // (Pitfall 8: this order must never read as the stacked order).
  return (
    <div className="axes-grid">
      <div className="axes-rule" aria-hidden="true" />
      {renderAxis(core[0])}
      {renderAxis(core[1])}
      {renderAxis(declared[0], 'Declared for this recipe')}
      {renderAxis(core[2])}
      {renderAxis(core[3])}
      {renderAxis(declared[1])}
    </div>
  );
}

// TastingReading (brief § 3 "The record reads as the battery", contract
// "Axes spec"/"Controls spec"): the read view's own rendering of the
// single stored tasting — only the marked axes, each as its goldilocks
// word with the stop number (readMarkWord, "Soft (2)" style, D-04's
// battery); the tasting's own measured cells (temperature signed, melt
// test with its own unit, melt style as its picked words); the defects as
// a line of the picked words with the declared flaw carrying "· declared"
// (never a plain defect — Bitter is never in the defects list itself);
// and the note as prose. No aggregate, average, or overall figure is ever
// derived (D12) — an unmarked axis is dropped entirely, never a blank
// judgment. The caller renders this only while `batch.tasting` exists; a
// batch with none reads its own silence-is-a-value sentence instead
// (BatchRow's read view, below).
function TastingReading({ batch }) {
  const axes = axesForBatch(batch);
  const marks = batch.tasting.marks;
  const markedAxes = axes.filter((axis) => marks[axis.key] != null);
  const defectWords = [
    ...(batch.tasting.defects ?? []),
    ...(batch.tasting.bitterDeclared ? [`${DECLARED_FLAW} · declared`] : []),
  ];
  return (
    <div className="tasting-reading">
      <h3 className="region-name">Tasting</h3>
      <p className="batch-row__dates">
        {`tasted ${batch.tasting.tastedDate ? formatRecordDate(batch.tasting.tastedDate) : 'date unknown'}`}
      </p>
      <div className="batch-row__cells">
        {markedAxes.map((axis) => (
          <div className="batch-row__cell" key={axis.key}>
            <span className="batch-row__cell-label">{axis.name}</span>
            <span className="batch-row__cell-value">{`${readMarkWord(axis, marks[axis.key])} (${marks[axis.key]})`}</span>
          </div>
        ))}
        <div className="batch-row__cell">
          <span className="batch-row__cell-label">Tasting temperature</span>
          <span className="batch-row__cell-value">
            {batch.tasting.tastingTempC != null ? (
              <>
                {churnMeasured(batch.tasting.tastingTempC, { signed: true })}
                <span className="batch-row__unit"> °C</span>
              </>
            ) : (
              <span className="batch-row__unit batch-row__unit--absent">not measured</span>
            )}
          </span>
        </div>
        <div className="batch-row__cell">
          <span className="batch-row__cell-label">Melt test</span>
          <span className="batch-row__cell-value">
            {batch.tasting.meltTestG != null ? (
              <>
                {churnMeasured(batch.tasting.meltTestG)}
                <span className="batch-row__unit"> g lost at 20 min</span>
              </>
            ) : (
              <span className="batch-row__unit batch-row__unit--absent">not measured</span>
            )}
          </span>
        </div>
        <div className="batch-row__cell">
          <span className="batch-row__cell-label">Melt style</span>
          <span className="batch-row__cell-value">
            {batch.tasting.meltStyle ?? <span className="batch-row__unit batch-row__unit--absent">not measured</span>}
          </span>
        </div>
      </div>
      {defectWords.length > 0 && <p className="prose-text">{defectWords.join(' · ')}</p>}
      {batch.tasting.note && <p className="prose-text">{batch.tasting.note}</p>}
    </div>
  );
}

// laterBatchMetaFor(batch) -> the later-batches list's own meta small
// print parts (D-04, D-09): the drawn temperature and At-the-machine
// prose, unchanged, plus "changed {date}" when the batch carries a
// changed value — replacing the retired tasted-count wording (Pitfall 7:
// a batch is tasted zero or one, never plural). Exported for direct
// testing, since the disclosure that renders this has no prop to open it
// from a render-only test (this file's own AxesGrid precedent).
export function laterBatchMetaFor(batch) {
  const metaParts = [];
  if (batch.churn.outOfMachineTempC != null) {
    metaParts.push(`out of machine ${churnMeasured(batch.churn.outOfMachineTempC, { signed: true })} °C`);
  }
  if (batch.churn.atTheMachine) metaParts.push(batch.churn.atTheMachine);
  if (batch.changed) metaParts.push(`changed ${formatRecordDate(batch.changed)}`);
  return metaParts;
}

// The batch's own row (sketch 003 variant B, 03.3-01; rebuilt to the full
// battery in 03.3.1-02, the tasting section added in 03.3.1-03): the front
// matter's second stacked row. One head line (Batch label, churned date,
// later-batches count) precedes the churn section, the tasting section
// (hidden until Add tasting opens it, D-01), the read view, and the foot
// controls, in that order.
export function BatchRow({
  version,
  batches = [],
  openBatch,
  mode,
  draft,
  fieldErrors = {},
  invalidFieldTarget = null,
  blockedDateMessage = null,
  blockedDateAttempt = null,
  addTastingAttempt = null,
  formStatus = '',
  tastingStatus = '',
  pendingUndo = null,
  restoreAttempt = null,
  onChangeRecordField,
  onChangeSegment,
  onChangeRecordMark,
  onClearAxisMark,
  onChangeDefect,
  onToggleBitter,
  onRemoveTasting,
  onUndoRemove,
  openPen = null,
  penReason = null,
  onStartAmending,
  onCancelRecording,
  onSaveBatch,
}) {
  // Focus-return for the Correct opener this row owns — closing the pen
  // returns focus to the control that opened it. Must sit above the
  // conditional render below — hooks cannot be called conditionally. The
  // Record opener's own ref/effect pair lives in VersionRow.jsx.
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

  // The churn date's own press-to-block focus (D-05): fires once per
  // press, keyed on the attempt counter so a second consecutive block on
  // an untouched date still re-fires (the VersionRow/WR-01 pattern,
  // single-target variant).
  const churnDateRef = useRef(null);
  useEffect(() => {
    if (blockedDateAttempt != null) churnDateRef.current?.focus();
  }, [blockedDateAttempt]);

  // Add tasting's own focus landing (D-01, contract "Focus landings"):
  // fires once per press, keyed on the attempt counter (the same
  // WR-01/single-target pattern as the churn date's own block above) so a
  // second press still moves focus even though the section is already
  // open by then.
  const tastedDateRef = useRef(null);
  useEffect(() => {
    if (addTastingAttempt != null) tastedDateRef.current?.focus();
  }, [addTastingAttempt]);

  // The restore sequence's own focus landing (contract "Focus landings":
  // "undo after restore → the Clear/Remove control") — the same
  // attempt-counter pattern as the two focus effects above.
  const removeTastingButtonRef = useRef(null);
  useEffect(() => {
    if (restoreAttempt != null) removeTastingButtonRef.current?.focus();
  }, [restoreAttempt]);

  // The axes' own arrangement (contract "Keyboard and tab order") — see
  // useBelow760's own header comment for the node-environment guard.
  const below760 = useBelow760();

  // The first-invalid-measurement focus (contract "Controls spec"): a ref
  // per battery field key, keyed by the constants in BATTERY_FIELDS —
  // never a maker-influenced key (T-02-32) — so the same attempt-keyed
  // pattern can move focus to whichever field the traversal named.
  const fieldRefs = useRef({});
  useEffect(() => {
    if (invalidFieldTarget) fieldRefs.current[invalidFieldTarget.key]?.focus();
  }, [invalidFieldTarget]);

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
            aria-controls="batch-row-later"
            onClick={() => setLaterBatchesOpen((open) => !open)}
          >
            {`${laterBatchesCount} later batch${laterBatchesCount === 1 ? '' : 'es'}`}
          </button>
        )}
        {/* Correct: an underlined word standing on the head line that
            names the record it acts on, right-aligned like Remove tasting
            on 007's Tasting head (sketch 003 line 84, D-15) — present
            only with no pen open and a batch in view. The row has no foot
            acts and no read-view Add tasting (003 line 256): the pen is
            the one door (03.3.1 D-01/D-03). */}
        {openPen === null && openBatch && (
          <button
            type="button"
            ref={amendButtonRef}
            className="text-control batch-row__correct"
            onClick={() => onStartAmending(openBatch)}
          >
            Correct
          </button>
        )}
      </div>

      {/* recording-mode caps the frame at --pen-w (640px, contract
          "Responsive ladder") — the read view below shares this same
          container and must keep its own already-shipped full width, so
          the cap is conditional on mode rather than the class's own rule
          (VERIFICATION.md gap, 03.3.1). */}
      <div className={mode === 'recording' ? 'batch-margin batch-margin--pen' : 'batch-margin'}>
        {mode === 'recording' ? (
          <>
            {/* The churn row (sketch 007 @ 2a212be lines 210-216; D-12
                "Churn date" replaces "churned"): a .field-row holding the
                128px Churn date field, this event's identifying field
                (D-05), then the three numeric churn measurements beside
                it (contract "DOM order inventory"). .batch-row__cells
                stays only for the read view below — the pen no longer
                uses it. */}
            <div className="field-row">
              <label className="field-row__label field-row__label--date">
                <span className="pen-caption">Churn date</span>
                <input
                  type="date"
                  className="ink-field"
                  autoFocus
                  ref={churnDateRef}
                  value={draft.churnDate}
                  onChange={(event) => onChangeRecordField('churnDate', event.target.value)}
                />
              </label>
              {CHURN_MEASURED_FIELDS.map((field) => (
                <MeasuredField
                  key={field.key}
                  field={field}
                  value={draft[field.key]}
                  error={fieldErrors[field.key]}
                  onChange={onChangeRecordField}
                  inputRef={(el) => {
                    fieldRefs.current[field.key] = el;
                  }}
                />
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
                placeholder="e.g. bowl frozen overnight"
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
            {/* The tasting section (D-01, contract "Settled defaults"):
                hidden until Add tasting opens it (PenFoot renders that
                control) — the record opens with no heading, no helper, no
                rule at all. Variant A's own order once open: the
                field-row, then the note (before the texture block, which
                arrives in Task 2), then the defects row and the melt
                block (Task 3). */}
            {draft.tastingOpen && (
              <>
                {/* The tasting head (sketch 007 @ 2a212be lines 242-246;
                    G-03.3.1-4; UAT items 6, 18): a bare region-name
                    "Tasting" — the two helper spans ("· optional",
                    "— leave anything you did not record blank") are gone,
                    a plain .head with no reserved caption-line height (that
                    reserve is the axes' and categories' own, not this
                    row's). The tasting-status live region beside the
                    action, the undo head slot — the contract's own static
                    mount; in hidden mode a removal always collapses the
                    section, so this slot renders in practice only on a
                    reopened section (Add tasting pressed again) while a
                    prior removal's undo is still pending — then the
                    Remove/Clear control, "Remove tasting" verbatim in
                    hidden mode (Pitfall 6: the always-visible mode's
                    "Clear tasting" label is never built), right-aligned
                    (007 line 246, `margin-left: auto`). */}
                <div className="tasting-head">
                  <h3 className="region-name">Tasting</h3>
                  <p className="tasting-status pen-helper" role="status" aria-live="polite">
                    {tastingStatus}
                  </p>
                  {pendingUndo && (
                    <button type="button" className="text-control undo-control" onClick={onUndoRemove}>
                      Undo clear tasting
                    </button>
                  )}
                  <button
                    type="button"
                    className="text-control tasting-head__remove"
                    ref={removeTastingButtonRef}
                    onClick={onRemoveTasting}
                  >
                    Remove tasting
                  </button>
                </div>
                {/* The tasting field row (sketch 007 lines 249-253; UAT
                    items 7, 8): a .field-row holding the 128px Tasted date
                    then Tempering and Tasting temperature, MeasuredField's
                    own field-row shape (Task 1). */}
                <div className="field-row">
                  <label className="field-row__label field-row__label--date">
                    <span className="pen-caption">Tasted</span>
                    <input
                      type="date"
                      className="ink-field"
                      ref={tastedDateRef}
                      value={draft.tastedDate}
                      onChange={(event) => onChangeRecordField('tastedDate', event.target.value)}
                    />
                  </label>
                  {TASTING_MEASURED_FIELDS.map((field) => (
                    <MeasuredField
                      key={field.key}
                      field={field}
                      value={draft[field.key]}
                      error={fieldErrors[field.key]}
                      onChange={onChangeRecordField}
                      inputRef={(el) => {
                        fieldRefs.current[field.key] = el;
                      }}
                    />
                  ))}
                </div>
                <div className="note-block">
                  <p className="note-block__eyebrow pen-caption">How did it turn out?</p>
                  <textarea
                    className={draft.note === '' ? 'prose-field prose-field--empty' : 'prose-field'}
                    dir="auto"
                    rows="2"
                    placeholder="e.g. flavor, texture, what stood out"
                    value={draft.note}
                    aria-label="How did it turn out?"
                    onChange={(event) => onChangeRecordField('note', event.target.value)}
                    onInput={autoGrow}
                  />
                </div>
                {/* axesForBatch's own contract (domain/axes.js) reads
                    batch.snapshot.declaredAxes only, never a live version —
                    the snapshot is what protects a stored mark from a
                    later change to the recipe's declared pair (WR-04 code
                    review). Amending an existing batch reads its own
                    snapshot; a genuinely fresh record has no snapshot yet
                    (it is written at save time), so the live version is
                    the only source available and is not the drift the
                    contract guards against. */}
                <AxesGrid
                  axes={axesForBatch(
                    openPen === 'amend' && openBatch
                      ? openBatch
                      : { snapshot: { declaredAxes: version.declaredAxes } },
                  )}
                  marks={draft.marks}
                  below={below760}
                  onChangeMark={onChangeRecordMark}
                  onClearMark={onClearAxisMark}
                />
                {/* The defects checklist, a standalone row after the axes
                    grid (contract "Controls spec", "DOM order
                    inventory"): the caption and its lowercase helper on
                    one row, then the chip row — the four DEFECTS chips
                    verbatim, then the declared Bitter chip trailing after
                    a wider gap. Picked state is aria-pressed, never
                    colour alone (UX1-03) — the bold-plus-underline
                    affordance is plan 06's CSS. */}
                <div className="defects-row" role="group" aria-label="Any problems? Select all that apply">
                  <p className="defects-row__caption">
                    Any problems? <span className="defects-row__helper">select all that apply</span>
                  </p>
                  <div className="defects-row__chips">
                    {/* Each of the four DEFECTS chips is a native toggle
                        button carrying its own aria-pressed — a picked
                        chip's own boolean, read fresh per chip from the
                        draft's defects list. */}
                    {DEFECTS.map((defect) => (
                      <button
                        key={defect}
                        type="button"
                        className="chip-toggle"
                        aria-pressed={draft.defects.includes(defect)}
                        onClick={() => onChangeDefect(defect)}
                      >
                        {defect}
                      </button>
                    ))}
                    {/* The declared chip: a fifth aria-pressed button,
                        trailing the row after a wider gap, its own
                        boolean read from bitterDeclared rather than the
                        defects list. */}
                    <button
                      type="button"
                      className="chip-toggle chip-toggle--declared"
                      aria-pressed={draft.bitterDeclared}
                      aria-label={`Declared for this recipe: ${DECLARED_FLAW}`}
                      onClick={onToggleBitter}
                    >
                      {DECLARED_FLAW} <span className="chip-toggle__helper">· declared</span>
                    </button>
                  </div>
                </div>
                {/* The melt block, at the tasting body's foot (sketch 007
                    lines 285-297; UAT item 12; D-12): a .field-row with
                    top alignment holding Melt test and the Melt style
                    category — the domain's own "Melt test" label (no
                    "(optional)" override needed) and "Melt style" with the
                    suffix dropped, both fields optional. */}
                <div className="melt-block">
                  <div className="field-row field-row--start">
                    <MeasuredField
                      field={MELT_TEST_FIELD}
                      value={draft.meltTestG}
                      error={fieldErrors.meltTestG}
                      onChange={onChangeRecordField}
                      inputRef={(el) => {
                        fieldRefs.current.meltTestG = el;
                      }}
                    />
                    <SegmentedField
                      legend="Melt style"
                      options={SEGMENT_OPTIONS.meltStyle}
                      value={draft.meltStyle}
                      onPick={(option) => onChangeSegment('meltStyle', option)}
                    />
                  </div>
                </div>
              </>
            )}
            {/* Ceremony A (D-01): after the tasting section when it is
                open, after the churn section when it is not, just above
                the shared Next time. Its hint is the record pen's own
                blocked-date sentence — the same state ceremony B
                (PenFoot) reads, so the two can never disagree. */}
            <SaveCeremony onCancel={onCancelRecording} onSave={onSaveBatch} hint={blockedDateMessage} />
            {/* Next time (sketch 007 line 307; UAT item 14; D-12): carries
                its own visible caption and the sketch's e.g. placeholder,
                verbatim. */}
            <label className="batch-margin__field">
              <span className="pen-caption">Next time</span>
              <textarea
                className={draft.nextTimeNote === '' ? 'prose-field prose-field--empty' : 'prose-field'}
                dir="auto"
                rows="2"
                placeholder="e.g. churn 2 min longer"
                value={draft.nextTimeNote}
                aria-label="Next time"
                onChange={(event) => onChangeRecordField('nextTimeNote', event.target.value)}
                onInput={autoGrow}
              />
            </label>
            {/* The form-status live region (contract "DOM order
                inventory"): the record body's last element, directly
                above PenFoot's ceremony B — its one home for the phase. */}
            <p className="form-status" role="status" aria-live="polite">
              {formStatus}
            </p>
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
                    <span className="batch-row__unit batch-row__unit--absent">not measured</span>
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
                    <span className="batch-row__unit batch-row__unit--absent">not measured</span>
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
                    <span className="batch-row__unit batch-row__unit--absent">not measured</span>
                  )}
                </span>
              </div>
              <div className="batch-row__cell">
                <span className="batch-row__cell-label">Exit consistency</span>
                <span className="batch-row__cell-value">
                  {openBatch.churn.exitConsistency ?? <span className="batch-row__unit batch-row__unit--absent">not measured</span>}
                </span>
              </div>
              <div className="batch-row__cell">
                <span className="batch-row__cell-label">Airiness</span>
                <span className="batch-row__cell-value">
                  {openBatch.churn.airiness ?? <span className="batch-row__unit batch-row__unit--absent">not measured</span>}
                </span>
              </div>
              <div className="batch-row__cell">
                <span className="batch-row__cell-label">Recorded</span>
                <span className="batch-row__cell-value">
                  {`${formatRecordDate(openBatch.recordedAt)} against ${openBatch.snapshot.versionLabel}`}
                </span>
              </div>
              {/* D-04: churned, tasted, changed — only the latest change
                  ever shows, since every save after the first replaces
                  this one stored value (never a list). */}
              {openBatch.changed && (
                <div className="batch-row__cell">
                  <span className="batch-row__cell-label">Changed</span>
                  <span className="batch-row__cell-value">{formatRecordDate(openBatch.changed)}</span>
                </div>
              )}
            </div>
            {openBatch.churn.atTheMachine && <p className="prose-text">{openBatch.churn.atTheMachine}</p>}
            {openBatch.churn.ingredientNotes && <p className="prose-text">{openBatch.churn.ingredientNotes}</p>}
            {openBatch.churn.nextTimeNote && <p className="prose-text">Next time: {openBatch.churn.nextTimeNote}</p>}

            {/* The tasting battery's own read view (contract "Axes spec",
                brief § 3): TastingReading reads only the single stored
                tasting; a batch with none reads its own
                silence-is-a-value sentence instead. */}
            {openBatch.tasting ? (
              <TastingReading batch={openBatch} />
            ) : (
              <p>This batch has not been tasted yet.</p>
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
          <section id="batch-row-later" className="batch-row__later" aria-label="Batches of this version">
            <h2 className="region-name">Batches of this version</h2>
            <ul className="batch-row__later-list">
              {sortedBatches(batches).map((batch) => {
                const isOpenBatch = openBatch && batch.id === openBatch.id;
                const dateWords = batch.churn.churnDate ? formatRecordDate(batch.churn.churnDate) : 'date unknown';
                const metaParts = laterBatchMetaFor(batch);
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
