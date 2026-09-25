import { HistoryDisclosure, HistoryPanel, HistoryList, HistoryItem, HistoryMarkers, HistoryProvenance } from './History.jsx';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { formatRecordDate, readMeasured, recordDateWords, sortedBatches, batchIdentity, tastingProvenance } from '../domain/batch.js';
import { targetValueFor } from '../domain/rows.js';
import { BATTERY_FIELDS, SEGMENT_OPTIONS, DEFECTS, DECLARED_FLAW } from '../domain/battery.js';
import { axesForBatch, readMarkWord } from '../domain/axes.js';
import { SaveCeremony } from './PenFoot.jsx';
import { Segmented } from './Segmented.jsx';
import { AxisMark } from './AxisMark.jsx';
import { FieldFeedback } from './FieldFeedback.jsx';
import { notebookPath } from './notebookPaths.js';

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

// churnDate is not a BATTERY_FIELDS key, so it carries its own error id
// rather than flowing through MeasuredField below.
const CHURN_DATE_ERROR_ID = 'field-error-churnDate';

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
      <FieldFeedback error={error} errorId={errorId} />
    </label>
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
// matchMedia listener on (max-width: 759.98px), re-rendering on crossing.
// Node-guarded (RESEARCH.md Code Example 6, this plan's own critical
// note): BatchRow's own static-markup tests run under Vitest's node
// environment (renderToStaticMarkup, no jsdom), where `window` does not
// exist — an unguarded read here would crash every existing static test
// the instant this hook landed. With no window, or no
// window.matchMedia, the hook answers the desktop arrangement and builds
// no listener; the real subscription exists only in the browser.
function useBelow760() {
  const hasMatchMedia = typeof window !== 'undefined' && typeof window.matchMedia === 'function';
  const [below, setBelow] = useState(() => (hasMatchMedia ? window.matchMedia('(max-width: 759.98px)').matches : false));
  useEffect(() => {
    if (!hasMatchMedia) return undefined;
    const mediaQuery = window.matchMedia('(max-width: 759.98px)');
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
// crossing the boundary survives by construction (Pitfall 8). `children`
// is the defects block (BatchRow's own markup, Plan 04): one grid for the
// axes and the defects (007 @ 2a212be lines 58-70, 261-282), so the
// defects share the axes' columns and the vertical hairline spans them.
// No axis carries a caption any more (README "Group captions on their
// own row") — the two cue rows head their columns instead.
//
// The two cue ids below name the core/declared split for assistive tech
// (Impeccable critique issue 5, 2026-09-16; Mark's per-axis decision): each
// axis's stops group is qualified via AxisMark's cueId prop, so a screen
// reader hears "{axis name}, Every recipe" / "{axis name}, This recipe
// only". One pair suffices — AxesGrid renders exactly one arrangement, and
// AxesGrid itself mounts once. Distinct from the defects section's own
// `defects-core-cue` / `defects-declared-cue` ids below.
const AXES_CORE_CUE_ID = 'axes-core-cue';
const AXES_DECLARED_CUE_ID = 'axes-declared-cue';

export function AxesGrid({ axes, marks, below, onChangeMark, onClearMark, children }) {
  const core = axes.filter((axis) => axis.group === 'core');
  const declared = axes.filter((axis) => axis.group === 'declared');

  function renderAxis(axis) {
    if (!axis) return null;
    return (
      <AxisMark
        key={axis.key}
        axis={axis}
        value={marks[axis.key]}
        onChange={(stop) => onChangeMark(axis.key, stop)}
        onClear={() => onClearMark(axis.key, axis.name)}
        cueId={axis.group === 'declared' ? AXES_DECLARED_CUE_ID : AXES_CORE_CUE_ID}
      />
    );
  }

  if (below) {
    return (
      <div className="axes-grid axes-grid--stacked">
        <div className="axes-grid__group">
          <p className="pen-caption axes-cue" id={AXES_CORE_CUE_ID}>Every recipe</p>
          {core.map((axis) => renderAxis(axis))}
        </div>
        <div className="axes-grid__group axes-grid__group--declared">
          <p className="pen-caption axes-cue" id={AXES_DECLARED_CUE_ID}>This recipe only</p>
          {declared.map((axis) => renderAxis(axis))}
        </div>
        {children}
      </div>
    );
  }

  // Desktop row-major (contract "Axes spec"/"Keyboard and tab order"):
  // the two cue rows, then Hardness, Scoopability, Body, Smoothness,
  // Sweetness, Oil — the hairline sits between columns 2 and 3 (007 line
  // 419).
  return (
    <div className="axes-grid">
      <div className="axes-rule" aria-hidden="true" />
      <p className="pen-caption axes-cue axes-cue--core" id={AXES_CORE_CUE_ID}>Every recipe</p>
      <p className="pen-caption axes-cue axes-cue--declared" id={AXES_DECLARED_CUE_ID}>This recipe only</p>
      {renderAxis(core[0])}
      {renderAxis(core[1])}
      {renderAxis(declared[0])}
      {renderAxis(core[2])}
      {renderAxis(core[3])}
      {renderAxis(declared[1])}
      {children}
    </div>
  );
}

// TastingReading (brief § 3 "The record reads as the battery", contract
// "Axes spec"/"Controls spec"): the read view's own rendering of the
// single stored tasting — only the marked axes, each as its goldilocks
// word with the stop number (readMarkWord, "Soft (2)" style, D-04's
// battery); the tasting's own measured cells (temperature signed, melt
// test with its own unit, melt style as its picked words); the defects as
// a line of the picked words, including the recipe-specific flaw by its
// plain name (Bitter is stored separately, but the read view does not
// repeat the entry form's "This recipe only" classification);
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
    ...(batch.tasting.bitterDeclared ? [DECLARED_FLAW] : []),
  ];
  return (
    <div className="tasting-reading">
      <div className="tasting-reading__head">
        <h3 className="region-name">Tasting</h3>
        <p className="batch-row__date">
          {`tasted ${recordDateWords(batch.tasting.tastedDate)}`}
        </p>
      </div>
      <div className="batch-row__cells tasting-reading__conditions">
        <div className="batch-row__cell">
          <span className="batch-row__cell-label">Tempering</span>
          <span className="batch-row__cell-value">
            {batch.tasting.temperingMinutes != null ? (
              <>
                {churnMeasured(batch.tasting.temperingMinutes)}
                <span className="batch-row__unit"> min</span>
              </>
            ) : (
              <span className="batch-row__unit batch-row__unit--absent">not measured</span>
            )}
          </span>
        </div>
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
      </div>
      {batch.tasting.note && <p className="prose-text tasting-reading__note">{batch.tasting.note}</p>}
      {(markedAxes.length > 0 || defectWords.length > 0) && (
        <div className="tasting-reading__group">
          <h4 className="batch-row__group-label">Observations</h4>
          {markedAxes.length > 0 && (
            <div className="batch-row__cells tasting-reading__axes">
              {markedAxes.map((axis) => (
                <div className="batch-row__cell" key={axis.key}>
                  <span className="batch-row__cell-label">{axis.name}</span>
                  <span className="batch-row__cell-value">{`${readMarkWord(axis, marks[axis.key])} (${marks[axis.key]})`}</span>
                </div>
              ))}
            </div>
          )}
          {defectWords.length > 0 && <p className="prose-text tasting-reading__problems">{defectWords.join(' · ')}</p>}
        </div>
      )}
      <div className="tasting-reading__group">
        <h4 className="batch-row__group-label">Melt</h4>
        <div className="batch-row__cells tasting-reading__melt">
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
      </div>
    </div>
  );
}

// batchHistoryMetaFor(batch) -> the batch list's own meta small print parts
// (D-04, D-09, HIST-04, HIST-07): the shared tasting provenance leads,
// then the drawn temperature and At-the-machine prose follow it as
// supporting evidence, then "changed {date}" when the batch carries a
// changed value. Exported for direct testing, since the disclosure that
// renders this has no prop to open it from a render-only test (this
// file's own AxesGrid precedent).
export function batchHistoryMetaFor(batch) {
  const metaParts = [tastingProvenance(batch)];
  if (batch.churn.outOfMachineTempC != null) {
    metaParts.push(`out of machine ${churnMeasured(batch.churn.outOfMachineTempC, { signed: true })} °C`);
  }
  if (batch.churn.atTheMachine) metaParts.push(batch.churn.atTheMachine);
  if (batch.changed) metaParts.push(`changed ${formatRecordDate(batch.changed)}`);
  return metaParts;
}

export function BatchHistoryPanel({ version, batches, openBatch = null, openPen = null, open = true }) {
  return (
    <HistoryPanel open={open} id="batch-row-batches" className="batch-row__batches" title="Batches of this version">
      <HistoryList ordered className="history-register" label="Batches of this version">
        {sortedBatches(batches).map((batch) => {
          const isOpenBatch = openBatch && batch.id === openBatch.id;
          const identity = batchIdentity(batch);
          const metaParts = batchHistoryMetaFor(batch);
          return (
            <HistoryItem key={batch.id} current={isOpenBatch} className="history-register__item">
              <div className="history-register__identity">
                <p className="history-register__name">
                  {isOpenBatch ? (
                    <>
                      {identity}<HistoryMarkers current />
                    </>
                  ) : openPen ? (
                    identity
                  ) : (
                    <Link to={notebookPath(version.recipeId, version.id, batch.id)} state={{ focusBatch: true }} tabIndex={0}>{identity}</Link>
                  )}
                </p>
                <HistoryProvenance>{metaParts.join(' · ')}</HistoryProvenance>
              </div>
            </HistoryItem>
          );
        })}
      </HistoryList>
    </HistoryPanel>
  );
}

// The batch's own row (sketch 003 variant B, 03.3-01; rebuilt to the full
// battery in 03.3.1-02, the tasting section added in 03.3.1-03): the front
// matter's second stacked row. One head line (Batch label, churned date,
// the Batches count) precedes the churn section, the tasting section
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
  recordStatus = '',
  pendingUndo = null,
  restoreAttempt = null,
  removeTastingAttempt = null,
  batchSaveAction = null,
  focusBatchOnMount = false,
  focusBatchAttempt = null,
  onChangeRecordField,
  onChangeSegment,
  onClearSegment,
  onChangeRecordMark,
  onClearAxisMark,
  onChangeDefect,
  onToggleBitter,
  onRemoveTasting,
  onUndoRemove,
  onAddTasting,
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

  // A completed save lands on the record that now exists. New records
  // carry the signal through navigation; amendments increment the local
  // attempt counter. The explicit class keeps the programmatic landing
  // visible after a pointer-driven save, then retires on blur.
  const batchHeadingRef = useRef(null);
  const [landingFocusVisible, setLandingFocusVisible] = useState(false);
  useEffect(() => {
    if (focusBatchOnMount || focusBatchAttempt != null) {
      batchHeadingRef.current?.focus();
      setLandingFocusVisible(true);
    }
  }, [focusBatchOnMount, focusBatchAttempt]);

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

  // The removal sequence's own focus landing (D-01, contract "Focus
  // landings"; the ninth round, 007 lines 542, 560): fires once per
  // removal attempt — the end-of-record ceremony's own Add tasting after
  // an empty removal, Restore tasting after a data removal — reading
  // pendingUndo from the same render that carried the attempt counter
  // (RecipePage sets both in the same batch, so this effect never races;
  // Pitfall 8 — these refs are ceremony A's own, never PenFoot's).
  const addTastingRef = useRef(null);
  const restoreRef = useRef(null);
  useEffect(() => {
    if (removeTastingAttempt == null) return;
    if (pendingUndo) restoreRef.current?.focus();
    else addTastingRef.current?.focus();
  }, [removeTastingAttempt]);

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

  // The Batches disclosure (route-recipe.md § 3 "History controls name a
  // whole set, never a direction", 260917-odu): closed by default,
  // counting every batch of the version in view, the one being read
  // included — the list it discloses already renders every batch (D-09),
  // so only the count and the words move here.
  const [batchesOpen, setBatchesOpen] = useState(false);
  const batchCount = batches.length;

  return (
    <section className="batch-row" aria-label="Batch">
      {/* The date and the Batches control name the batch IN VIEW — a
          different batch than the one being recorded while
          openPen === 'record' (Mark, 2026-09-10 live review, G-03.3-4):
          showing them there read as the wrong batch's date. Amending
          keeps both, since amend corrects the very batch in view. */}
      <div className="batch-row__head">
        <h2
          ref={batchHeadingRef}
          className={`region-name${landingFocusVisible ? ' is-landing-focus' : ''}`}
          tabIndex={focusBatchOnMount || focusBatchAttempt != null ? -1 : undefined}
          aria-label={
            (focusBatchOnMount || focusBatchAttempt != null) && openBatch
              ? `Batch churned ${recordDateWords(openBatch.churn.churnDate)}`
              : undefined
          }
          onBlur={() => setLandingFocusVisible(false)}
        >
          Batch
        </h2>
        {openPen !== 'record' && openBatch && (
          <span className="batch-row__date">
            {`churned ${recordDateWords(openBatch.churn.churnDate)}`}
          </span>
        )}
        {openPen !== 'record' && batchCount > 0 && (
          <HistoryDisclosure
            open={batchesOpen}
            panelId="batch-row-batches"
            onToggle={() => setBatchesOpen((open) => !open)}
          >
            {`Batches (${batchCount})`}
          </HistoryDisclosure>
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
                uses it. Mark's 2026-09-16 ruling: the batch's name is not
                the record's content, so the field names the requirement
                before refusal. The quiet helper gives way to the error
                here — once, beside the field focus lands on — rather than
                at either ceremony. */}
            <div className="field-row">
              <label className="field-row__label field-row__label--date">
                <span className="pen-caption">Churn date</span>
                <input
                  type="date"
                  className="ink-field"
                  required
                  aria-required="true"
                  aria-invalid={blockedDateMessage ? 'true' : undefined}
                  aria-describedby={blockedDateMessage ? CHURN_DATE_ERROR_ID : undefined}
                  autoFocus
                  ref={churnDateRef}
                  value={draft.churnDate}
                  onChange={(event) => onChangeRecordField('churnDate', event.target.value)}
                />
                {/* Native required semantics already announce this fact;
                    the visible helper is for the maker reading the sheet. */}
                <FieldFeedback
                  error={blockedDateMessage}
                  errorId={CHURN_DATE_ERROR_ID}
                  required
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
            <Segmented
              groupLabel="Exit consistency"
              options={SEGMENT_OPTIONS.exitConsistency}
              value={draft.exitConsistency}
              onChange={(option) => onChangeSegment('exitConsistency', option)}
              onClear={() => onClearSegment('exitConsistency', 'Exit consistency')}
            />
            <Segmented
              groupLabel="Airiness (estimated)"
              options={SEGMENT_OPTIONS.airiness}
              value={draft.airiness}
              onChange={(option) => onChangeSegment('airiness', option)}
              onClear={() => onClearSegment('airiness', 'Airiness (estimated)')}
            />
            {/* At the machine and Ingredient notes (sketch 007 lines 237-238):
                each carries its own visible caption, as Next time does (I-14).
                This supersedes the 03.1 Gap 2 override's "no visible label
                word" — the sketch draws the caption, and the HTML governs
                (D-01). The blank field keeps its graduation-weight rule. */}
            <label className="batch-margin__field">
              <span className="pen-caption">At the machine</span>
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
              <span className="pen-caption">Ingredient notes</span>
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
                hidden until Add tasting opens it (SaveCeremony renders
                that control, both mounts) — the record opens with no
                heading, no helper, no rule at all. Variant A's own order
                once open: the field-row, then the note (before the
                texture block, which arrives in Task 2), then the defects
                row and the melt block (Task 3). */}
            {draft.tastingOpen && (
              <>
                {/* The tasting head (sketch 007 @ 109733d lines 242-246;
                    G-03.3.1-4; UAT items 6, 18): a bare region-name
                    "Tasting" — the two helper spans ("· optional",
                    "— leave anything you did not record blank") are gone,
                    a plain .head with no reserved caption-line height (that
                    reserve is the axes' and categories' own, not this
                    row's). The tasting-status live region beside the
                    action, the Restore tasting slot — the contract's own
                    static mount; in hidden mode a removal always collapses
                    the section, so this slot renders in practice only on a
                    reopened section (Add tasting pressed again) while a
                    prior removal's own restore is still pending — then the
                    Remove control, "Remove tasting" verbatim in hidden
                    mode (Pitfall 6: the always-visible mode's "Clear
                    tasting" label is never built), right-aligned (007 line
                    246, `margin-left: auto`). */}
                <div className="tasting-head">
                  <h3 className="region-name">Tasting</h3>
                  <p className="tasting-status pen-helper" role="status" aria-live="polite">
                    {tastingStatus}
                  </p>
                  {pendingUndo && (
                    <button type="button" className="text-control undo-control" onClick={onUndoRemove}>Restore tasting</button>
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
                >
                  {/* The defects, inside the axes grid as its own two
                      labelled groups (contract "Controls spec", "DOM
                      order inventory"; 007 lines 263-281): the head
                      carries the caption and its lowercase helper on one
                      row, then "Every recipe" (the four DEFECTS chips
                      verbatim) and "This recipe only" (Bitter, a plain
                      defect with no helper and no aria-label — the group
                      cue carries the meaning through aria-labelledby).
                      Picked state is aria-pressed, never colour alone
                      (UX1-03). */}
                  <div className="defects-head">
                    <p className="pen-caption" id="defects-caption">
                      Any problems?
                    </p>
                    <p className="pen-helper defects-head__helper">select all that apply</p>
                  </div>
                  <div
                    className="defect-group defect-group--core"
                    role="group"
                    aria-labelledby="defects-caption defects-core-cue"
                  >
                    <p className="pen-caption axes-cue" id="defects-core-cue">
                      Every recipe
                    </p>
                    <div className="defects-row__chips">
                      {/* Each of the four DEFECTS chips is a native
                          toggle button carrying its own aria-pressed — a
                          picked chip's own boolean, read fresh per chip
                          from the draft's defects list. */}
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
                    </div>
                  </div>
                  <div
                    className="defect-group defect-group--declared"
                    role="group"
                    aria-labelledby="defects-caption defects-declared-cue"
                  >
                    <p className="pen-caption axes-cue" id="defects-declared-cue">This recipe only</p>
                    <div className="defects-row__chips">
                      {/* Bitter is a plain defect — no helper span, no
                          aria-label of its own; its own boolean reads
                          from bitterDeclared rather than the defects
                          list. */}
                      <button type="button" className="chip-toggle" aria-pressed={draft.bitterDeclared} onClick={onToggleBitter}>
                        {DECLARED_FLAW}
                      </button>
                    </div>
                  </div>
                </AxesGrid>
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
                    <Segmented
                      groupLabel="Melt style"
                      options={SEGMENT_OPTIONS.meltStyle}
                      value={draft.meltStyle}
                      onChange={(option) => onChangeSegment('meltStyle', option)}
                      onClear={() => onClearSegment('meltStyle', 'Melt style')}
                    />
                  </div>
                </div>
              </>
            )}
            {/* Next time (sketch 007 line 301; UAT item 14; D-12): carries
                its own visible caption and the sketch's e.g. placeholder,
                verbatim. */}
            <label className="batch-margin__field batch-margin__field--next-time">
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
            {/* Ceremony A (D-01): closes the record body after all record
                content, below the shared Next time, in every state
                (placement revised 2026-09-16, sketch 007's eleventh
                round). The blocked-date sentence renders in the churn
                date's own label now (one occurrence), so neither this
                ceremony nor ceremony B (PenFoot) carries a hint of it.
                Add tasting stands beside it exactly while the section is
                absent and no restore is pending (007 line 484); Restore
                tasting takes the opener's own place while a restore is
                pending and the section is absent (007 lines 505-510) —
                the head slot above carries it once the section reopens.
                status is the end-of-record ceremony's own live region
                (007 line 304) — the removal toasts' home (the ninth
                round, Pattern 5); addTastingRef/restoreRef are the
                removal focus landing's own refs (Pitfall 8). */}
            <SaveCeremony
              onCancel={onCancelRecording}
              onSave={onSaveBatch}
              status={recordStatus}
              saveAction={batchSaveAction}
              onAddTasting={!draft.tastingOpen && !pendingUndo ? onAddTasting : null}
              addTastingRef={addTastingRef}
              onRestore={pendingUndo && !draft.tastingOpen ? onUndoRemove : null}
              restoreRef={restoreRef}
            />
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
            </div>
            {openBatch.churn.atTheMachine && <p className="prose-text">{openBatch.churn.atTheMachine}</p>}
            {openBatch.churn.ingredientNotes && <p className="prose-text">{openBatch.churn.ingredientNotes}</p>}

            {/* The tasting battery's own read view (contract "Axes spec",
                brief § 3): TastingReading reads only the single stored
                tasting; a batch with none reads its own
                silence-is-a-value sentence instead. */}
            {openBatch.tasting ? (
              <TastingReading batch={openBatch} />
            ) : (
              <p>This batch has not been tasted yet.</p>
            )}
            {openBatch.churn.nextTimeNote && (
              <div className="batch-row__conclusion">
                <h3 className="batch-row__group-label">Next time</h3>
                <p className="prose-text">{openBatch.churn.nextTimeNote}</p>
              </div>
            )}
            <dl className="batch-row__provenance">
              <div>
                <dt>Recorded</dt>
                <dd>{`${recordDateWords(openBatch.recordedAt)} against ${openBatch.snapshot.versionLabel}`}</dd>
              </div>
              {/* D-04: churned, tasted, changed — only the latest change
                  ever shows, since every save after the first replaces
                  this one stored value (never a list). */}
              {openBatch.changed && (
                <div>
                  <dt>Changed</dt>
                  <dd>{formatRecordDate(openBatch.changed)}</dd>
                </div>
              )}
            </dl>
          </>
        ) : (
          batches.length > 0 && <p>No batch of this version has that address.</p>
        )}
      </div>

      {/* The batch list (D-09): always a list with zero batches, since
          there is no count to disclose. With one or more, it becomes the
          "Batches of this version" panel the head's own count control
          opens (sketch 003 variant B, G-03.3-4) — closed by default, and
          it already includes every batch of the version in view, the one
          being read among them. */}
      {batches.length === 0 ? (
        <ul className="batch-margin__list">
          <li>no batch yet</li>
        </ul>
      ) : (
          <BatchHistoryPanel
            open={batchesOpen}
            version={version}
            batches={batches}
            openBatch={openBatch}
            openPen={openPen}
          />
      )}
    </section>
  );
}
