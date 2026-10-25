import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { formatRecordDate, readMeasured, recordDateWords, sortedBatches, tastingProvenance } from '../domain/batch.js';
import { BATTERY_FIELDS, SEGMENT_OPTIONS, coreProblemsForBatch, declaredProblemsForBatch } from '../domain/battery.js';
import { axesForBatch, axesForVersion, readMarkWord } from '../domain/axes.js';
import { problemNames } from '../domain/catalog.js';
import { SaveCeremony } from './PenFoot.jsx';
import { Segmented } from './Segmented.jsx';
import { MarkOneField } from './MarkOneField.jsx';
import { AxisMark } from './AxisMark.jsx';
import { FieldFeedback } from './FieldFeedback.jsx';
import { notebookPath } from './notebookPaths.js';
import { FoldRow } from './FoldRow.jsx';
import { UprightRail } from './UprightRail.jsx';
import { useBelow724, useLogBesideSheet, useFold } from './useBelowDesktop.js';
import { Button } from './Button.jsx';

// A display-only override of readMeasured's own "unknown" wording (D-18),
// scoped to this row's own measured cells (03.3-07, G-03.3-4): reads "not
// measured" instead, matching sketch 003 variant B. readMeasured itself,
// and every other call site of it in this codebase, are untouched.
function churnMeasured(value, options) {
  const result = readMeasured(value, options);
  return result === 'unknown' ? 'not measured' : result;
}

// The two churn-section battery fields the pen draws, in the contract's own
// DOM order — BATTERY_FIELDS lists the churn numerics before the tasting ones
// (domain/battery.js), so a straight filter preserves that order without
// hard-coding index positions. (Time to draw temp. is gone from the data
// altogether: Mark, 2026-10-07, sketch 010 D17 — it came from an instruction
// for immersion heaters in small jars and does not apply to his machine.)
const CHURN_MEASURED_FIELDS = BATTERY_FIELDS.filter((field) =>
  ['outOfMachineTempC', 'churnDurationMinutes'].includes(field.key),
);

// The tasting field-row's two measured fields (contract "DOM order
// inventory" § tasting body): Tempering, unit min — "Where sources
// disagree (HTML wins)" § 1 places it here, never in the churn section,
// however D-10's own wording groups it.
// Temperature, unit °C, signed — the field-row's other measured
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

// The no-batch state's own prose (1600-no-batch.html, 03.5-07 decisions):
// a version with no batch reads this sentence in place of the churn
// cells, with Record a batch as the filled action beside it. The board's
// other control there is Phase 4's, not built here.
export const NO_BATCH_PROSE = 'Not yet churned. Print the sheet, make it, then record what happened.';

// What the draft holds for a signed field's entry that the browser cannot
// read as a number (a lone minus, "1-2", "5e"): a fixed string with letters
// in it, so parseMeasuredDraft rejects it and the one save gate flags the
// field with its own contract sentence. A number input reports such an entry
// as value "" with validity.badInput true, which the draft would otherwise
// save as blank (G-03.5-R2-2, T-03.5-82). A string, not a flag: isDraftDirty,
// tastingHasInk and the save gate already read the draft's strings, so none
// of them changes.
export const MALFORMED_NUMBER_ENTRY = 'unreadable number';

// A signed input's draft value: the constant when the browser holds text it
// cannot read, the input's own value otherwise.
export function readSignedInput(input) {
  return input.validity.badInput ? MALFORMED_NUMBER_ENTRY : input.value;
}

// What a signed input displays for a draft value. The constant shows as
// blank: setting a number input's value to text it cannot hold wipes the
// characters the maker typed from the screen, so the unreadable entry stays
// where it is and the draft alone carries the fact.
export function shownSignedValue(value) {
  return value === MALFORMED_NUMBER_ENTRY ? '' : value;
}

// One battery measured field (contract "Controls spec"; sketch 007 @
// 2a212be lines 37-44; D-13): text-mode, inputMode="decimal", so a
// malformed value stays in place rather than being rejected before
// validation runs. The exception is a signed field (the two °C ones): the
// iPhone decimal pad has no minus key and the text keyboard opens on
// letters, while WebKit opens a number input on the numbers layer with a
// minus and a period, so these two are type="number" with step="any" and
// no inputMode (an inputmode would win over the type), and no autocorrect
// or autocapitalize, which mean nothing there (G-03.5-R2-2; Mark,
// 2026-09-30, after trying it on his iPhone; it reverses the 03.3.1 rule
// never to use a number input, for these two fields only). A number input
// hands over no text for an entry it cannot read, so MALFORMED_NUMBER_ENTRY
// carries that fact into the draft, and the displayed value stays blank for
// it. React's onChange does not fire for a lone minus typed into an empty
// field (the value string stays ""), while the browser's own input event
// does, so one handler serves both on a signed field. A mouse wheel over a
// focused number input steps its value in Chromium, so a signed field blurs
// on wheel (no preventDefault: the page still scrolls). The unit word is a sibling after the
// input, never concatenated into the caption (007 lines 42-44: the root
// cause of UAT item 2) — the aria-label keeps the spelled-out unit for
// the field's accessible name. The .field-error line renders inside the
// label and is wired by aria-describedby exactly as the contract
// specifies; aria-invalid tracks the same fact. Shared by both sections —
// the two churn measurements and the tasting field-row's own two
// (03.3.1-03 Task 1) — since the contract's rule is identical either
// side of the churn/tasting line.
function MeasuredField({ field, value, error, onChange, inputRef }) {
  const errorId = `field-error-${field.key}`;
  const handleEdit = (event) =>
    onChange(field.key, field.signed ? readSignedInput(event.target) : event.target.value);
  return (
    <label className="field-row__label">
      <span className="pen-caption">{field.label}</span>
      <span className="field-unit">
        <input
          type={field.signed ? 'number' : 'text'}
          step={field.signed ? 'any' : undefined}
          inputMode={field.signed ? undefined : 'decimal'}
          className="ink-field"
          aria-label={`${field.label}, ${unitWords(field.unit)}`}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? errorId : undefined}
          value={field.signed ? shownSignedValue(value) : value}
          ref={inputRef}
          onChange={handleEdit}
          onInput={field.signed ? handleEdit : undefined}
          onWheel={field.signed ? (event) => event.currentTarget.blur() : undefined}
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

// AxesGrid: the six-axis battery in one of the contract's two DOM orders
// per arrangement (contract "Keyboard and tab order") — desktop row-major
// or stacked core-then-declared. `below` is an explicit boolean, never a
// live matchMedia read, so BatchRow.test.jsx can render and assert both
// arrangements directly, without stubbing matchMedia (this plan's own
// critical note) — BatchRow's own useBelow724 above is the only thing
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
  // A recipe that declares no scale shows no This recipe only cue and no
  // hairline (sketch 010 D25 rule 3); the third column stays in the grid as
  // an empty cell, so the core scales keep the width they have beside a
  // declared one.
  const hasDeclared = declared.length > 0;

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
          <h3 className="pen-caption axes-cue" id={AXES_CORE_CUE_ID}>Every recipe</h3>
          {core.map((axis) => renderAxis(axis))}
        </div>
        {hasDeclared && (
          <div className="axes-grid__group axes-grid__group--declared">
            <h3 className="pen-caption axes-cue" id={AXES_DECLARED_CUE_ID}>This recipe only</h3>
            {declared.map((axis) => renderAxis(axis))}
          </div>
        )}
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
      {hasDeclared && <div className="axes-rule" aria-hidden="true" />}
      <h3 className="pen-caption axes-cue axes-cue--core" id={AXES_CORE_CUE_ID}>Every recipe</h3>
      {hasDeclared ? (
        <h3 className="pen-caption axes-cue axes-cue--declared" id={AXES_DECLARED_CUE_ID}>This recipe only</h3>
      ) : (
        <div className="axes-grid__void" aria-hidden="true" />
      )}
      {renderAxis(core[0])}
      {renderAxis(core[1])}
      {hasDeclared ? renderAxis(declared[0]) : <div className="axes-grid__void" aria-hidden="true" />}
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
// plain name; the reading heads the marks and the picked words with the
// pen's own two names, Every recipe and This recipe only (sketch 011 README
// decision 58, Mark's answers B and B2, 2026-10-06); Any problems? is a cue
// over two caption labels, and the picked words read as content, not the hand
// (decide-p10-any-problems-level-r2, decide-p10-picked-option-face), and melt
// test and melt style stand with the measured cells at the top;
// and the note as prose. No aggregate, average, or overall figure is ever
// derived (D12) — an unmarked axis is dropped entirely, never a blank
// judgment. The caller renders this only while `batch.tasting` exists; a
// batch with none reads its own silence-is-a-value sentence instead
// (BatchRow's read view, below).
function TastingReading({ batch, foldsOpen = true }) {
  const axes = axesForBatch(batch);
  const marks = batch.tasting.marks;
  const markedAxes = axes.filter((axis) => marks[axis.key] != null);
  const coreAxes = markedAxes.filter((axis) => axis.group === 'core');
  const declaredAxes = markedAxes.filter((axis) => axis.group === 'declared');
  const coreProblems = batch.tasting.defects ?? [];
  const declaredProblems = batch.tasting.declaredDefects ?? [];
  // The group names and Any problems? stand one level under the Tasting h2, the
  // problem names one under Any problems?, so the outline never skips a level
  // (the in-page detector's skipped-heading; critique P3, Mark 2026-10-22).
  const markGroup = (name, groupAxes) =>
    groupAxes.length > 0 && (
      <div className="tasting-reading__group">
        <h3 className="batch-row__group-label batch-row__group-label--cue">{name}</h3>
        <div className="batch-row__cells tasting-reading__axes">
          {groupAxes.map((axis) => (
            <div className="batch-row__cell" key={axis.key}>
              <span className="batch-row__cell-label">{axis.name}</span>
              <span className="batch-row__cell-value">{`${readMarkWord(axis, marks[axis.key])} (${marks[axis.key]})`}</span>
            </div>
          ))}
        </div>
      </div>
    );
  const problemBlock = (name, words) =>
    words.length > 0 && (
      <div className="tasting-reading__subgroup">
        <h4 className="batch-row__group-label">{name}</h4>
        <span className="tasting-reading__problems">{words.join(' · ')}</span>
      </div>
    );
  // The Tasting fold (decisions_recorded 2/3, 03.5-16): its own full-row
  // head at every width, reading the same foldsOpen prop (the negation of
  // belowDesktop) every other fold reads, and resetting to that default on
  // every width crossing (useFold, 03.5-15) — never stored. The churn
  // cells above it (BatchRow's own reading branch) stay outside the fold
  // at every width. The tasted date moves into the fold row's own count
  // slot (decisions_recorded 3) — the separate date paragraph is gone.
  // Tasting is its own section (G-03.5-8d; Mark, UAT item 9): a section
  // named Tasting with an h2, the level of Balance and Watch for, still
  // nested where it sits in the log. The h2 holds FoldRow directly, with no
  // head wrapper, so it is a block and the button's width: 100% reaches the
  // log's content box with the tasted date at the row's end (G-03.5-4).
  const [open, toggle] = useFold(foldsOpen);
  // The conditions and the melt fields (sketch 010 D14; pen-reading.html):
  // Tempering and Temperature, then the tasting note in the hand, then
  // Melt test and Melt style, as the pen runs. With no note written the four
  // stand in one row.
  const tempering = (
    <div className="batch-row__cell">
      <span className="batch-row__cell-label">Tempering</span>
      {batch.tasting.temperingMinutes != null ? (
        <span className="batch-row__cell-value">
          {churnMeasured(batch.tasting.temperingMinutes)}
          <span className="batch-row__unit"> min</span>
        </span>
      ) : (
        <span className="batch-row__unit batch-row__unit--absent">not measured</span>
      )}
    </div>
  );
  const tastingTemperature = (
    <div className="batch-row__cell">
      <span className="batch-row__cell-label">Temperature</span>
      {batch.tasting.tastingTempC != null ? (
        <span className="batch-row__cell-value">
          {churnMeasured(batch.tasting.tastingTempC, { signed: true })}
          <span className="batch-row__unit"> °C</span>
        </span>
      ) : (
        <span className="batch-row__unit batch-row__unit--absent">not measured</span>
      )}
    </div>
  );
  const meltFields = (
    <>
      <div className="batch-row__cell">
        <span className="batch-row__cell-label">Melt test</span>
        {batch.tasting.meltTestG != null ? (
          <span className="batch-row__cell-value">
            {churnMeasured(batch.tasting.meltTestG)}
            <span className="batch-row__unit"> g lost at 20 min</span>
          </span>
        ) : (
          <span className="batch-row__unit batch-row__unit--absent">not measured</span>
        )}
      </div>
      <div className="batch-row__cell">
        <span className="batch-row__cell-label">Melt style</span>
        {batch.tasting.meltStyle != null ? (
          <span className="batch-row__cell-value">{batch.tasting.meltStyle}</span>
        ) : (
          <span className="batch-row__unit batch-row__unit--absent">not measured</span>
        )}
      </div>
    </>
  );
  const body = (
    <>
      {batch.tasting.note ? (
        <>
          <div className="batch-row__cells tasting-reading__conditions">
            {tempering}
            {tastingTemperature}
          </div>
          <p className="app-hand tasting-reading__note">{batch.tasting.note}</p>
          <div className="batch-row__cells tasting-reading__conditions">{meltFields}</div>
        </>
      ) : (
        <div className="batch-row__cells tasting-reading__conditions">
          {tempering}
          {tastingTemperature}
          {meltFields}
        </div>
      )}
      {/* From freezer (sketch 010 D6a, D6b, D14): a stored word reads as one
          full-width cell in place of the scales and Any problems?; with no
          word those read as they always have. The record never reads the
          word beside marks. */}
      {batch.tasting.fromFreezer ? (
        <div className="batch-row__cells mo-readgroup">
          <div className="batch-row__cell mo-lead">
            <span className="batch-row__cell-label">From freezer</span>
            <span className="batch-row__cell-value">{batch.tasting.fromFreezer}</span>
          </div>
        </div>
      ) : (
        <>
          {markGroup('Every recipe', coreAxes)}
          {markGroup('This recipe only', declaredAxes)}
          {/* Any problems? (sketch 011 README decision 58, Mark's answers B
              and B2): a cue over two caption labels, the picked problems split
              the pen's two ways and read as content, not the hand
              (decide-p10-any-problems-level-r2, decide-p10-picked-option-face). */}
          {(coreProblems.length > 0 || declaredProblems.length > 0) && (
            <div className="tasting-reading__group">
              <h3 className="batch-row__group-label batch-row__group-label--cue">Any problems?</h3>
              {problemBlock('Every recipe', coreProblems)}
              {problemBlock('This recipe only', declaredProblems)}
            </div>
          )}
        </>
      )}
    </>
  );
  return (
    <section className="tasting-reading" aria-label="Tasting">
      <h2 className="region-name">
        <FoldRow
          label="Tasting"
          open={open}
          onToggle={toggle}
          controls="fold-tasting"
          count={`tasted ${recordDateWords(batch.tasting.tastedDate)}`}
        />
      </h2>
      <div id="fold-tasting" hidden={!open}>
        {body}
      </div>
    </section>
  );
}

// batchListMeta(batch) -> the batch list's own meta small print parts
// (decisions_recorded 3, 03.5-17): the shared tasting provenance leads,
// then "out of machine {temp} °C" when measured. The retired register's
// other parts (the at-the-machine words, the changed date) are not on the
// board's rows (batches-many.html panel D) and are not carried. Exported
// for direct testing, since the fold that renders this has no prop to
// open it from a render-only test (this file's own AxesGrid precedent).
export function batchListMeta(batch) {
  const metaParts = [tastingProvenance(batch)];
  if (batch.churn.outOfMachineTempC != null) {
    metaParts.push(`out of machine ${churnMeasured(batch.churn.outOfMachineTempC, { signed: true })} °C`);
  }
  return metaParts;
}

// The batch's own row (sketch 003 variant B, 03.3-01; rebuilt to the full
// battery in 03.3.1-02, the tasting section added in 03.3.1-03): the front
// matter's second stacked row. One head line (Batch label, churned date,
// the Batches count) precedes the churn section, the tasting section
// (hidden until Add tasting opens it, D-01), the read view, and the foot
// controls, in that order.
export function BatchRow({
  version,
  // The catalog the recipe page read (D-02): a new record pen draws its core
  // scales and Every recipe chips from it. This row reads no context.
  catalog,
  batches = [],
  openBatch,
  mode,
  draft,
  fieldErrors = {},
  invalidFieldTarget = null,
  blockedDateMessage = null,
  blockedDateAttempt = null,
  addTastingAttempt = null,
  amendOpener = 'correct',
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
  onChangeMarkOne,
  onClearMarkOne,
  onChangeRecordMark,
  onClearAxisMark,
  onChangeDefect,
  onToggleDeclaredDefect,
  onRemoveTasting,
  onUndoRemove,
  onAddTasting,
  openPen = null,
  penReason = null,
  onStartAmending,
  onCancelRecording,
  onSaveBatch,
  // The Record opener, moved here from VersionRow.jsx (03.5-07 Task 1,
  // decisions_recorded 1) — the same reference RecipePage.jsx already
  // passes to VersionRow's own Next version/Develop opener.
  onStartRecording,
  // The Tasting fold (decisions_recorded 2/3, 03.5-16): passed straight
  // through to TastingReading's own useFold — open by default (the
  // 1366-up answer), closed below, per RecipePage's foldsOpen={!belowDesktop}.
  foldsOpen = true,
  // The Batch fold's state, owned by RecipePage (decision 50); open by default for the component tests.
  batchOpen = true,
  onToggleBatch,
}) {
  // Focus-return for the Correct opener this row owns — closing the pen
  // returns focus to the control that opened it. Must sit above the
  // conditional render below — hooks cannot be called conditionally.
  const amendButtonRef = useRef(null);
  const wasAmendingRef = useRef(false);
  useEffect(() => {
    if (openPen === 'amend') {
      // Only Correct gets focus back: a pen the band's Record a tasting
      // opened returns to the band (VersionRow.jsx), sketch 011 decision 30.
      wasAmendingRef.current = amendOpener === 'correct';
      return;
    }
    if (wasAmendingRef.current) {
      wasAmendingRef.current = false;
      amendButtonRef.current?.focus();
    }
  }, [openPen]);

  // Focus-return for the Record opener, moved here from VersionRow.jsx
  // verbatim (03.5-07 Task 1, decisions_recorded 1) — this row now owns
  // the button beside Batches/Correct. Shared by both the head's "Record
  // another" (a batch is in view) and the no-batch state's "Record a
  // batch" below, since exactly one of the two ever mounts.
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

  // 261003-by3 (.planning/debug/ios-tasting-date-picker.md): iOS's Reset on
  // a date calendar calls setValue(null), which falls back to the input's
  // value content attribute. React keeps that attribute equal to the
  // controlled value, so Reset re-applied the shown date and onChange never
  // fired. With no attribute, the null Reset falls back to empty, which
  // reaches onChange as ''. React writes the attribute at commit time
  // (caught by the layout effect) and again after the commit, when it
  // restores the input after that input's own onChange (caught by the
  // microtask in each date onChange). See facebook/react #8938, #12313 and
  // #23299. Removing the attribute never changes .value: a picked or typed
  // value is the dirty value.
  function stripDateValueAttributes() {
    churnDateRef.current?.removeAttribute('value');
    tastedDateRef.current?.removeAttribute('value');
  }
  useLayoutEffect(() => {
    stripDateValueAttributes();
  });

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
  // useBelow724's own header comment for the node-environment guard.
  const below724 = useBelow724();

  // Option A (03.5-07 Task 2 answer, decisions_recorded 4): the record
  // pen's own frame now lives in the log column whenever the log sits
  // beside the Sheet (1366px and up, sketch 011 decision 16), so the
  // axes take the stacked core-then-declared arrangement there too — not
  // only below 724px.
  const logBesideSheet = useLogBesideSheet();
  const below = below724 || logBesideSheet;

  // The declared problems the pen draws (0 to 2 words). Amending a batch
  // reads its own snapshot, as axesForBatch does for the scales; a fresh
  // record has no snapshot yet, so the live version is the only source.
  const declaredProblems = declaredProblemsForBatch(
    openPen === 'amend' && openBatch ? openBatch : { snapshot: { declaredFlaws: version.declaredFlaws } },
  );

  // The first-invalid-measurement focus (contract "Controls spec"): a ref
  // per battery field key, keyed by the constants in BATTERY_FIELDS —
  // never a maker-influenced key (T-02-32) — so the same attempt-keyed
  // pattern can move focus to whichever field the traversal named.
  const fieldRefs = useRef({});
  useEffect(() => {
    if (invalidFieldTarget) fieldRefs.current[invalidFieldTarget.key]?.focus();
  }, [invalidFieldTarget]);

  // The batch list (decision 19, sketch 011, 03.5-17): from two batches,
  // the version's batches stand as an upright list above the batch in
  // view (option D), latest first. It folds like every other section
  // (FoldRow/useFold, 03.5-15/16) — open by default from 1366, closed
  // below, with no state stored. Withheld entirely while the record pen
  // is open (G-03.3-4: the batch in view is not the one being recorded);
  // its rows read as text (no `to`) while any other pen is open
  // (D-UAT-1/2's link suppression). Replaces the retired "Batches (n)"
  // head disclosure and BatchHistoryPanel outright — at 0 or 1 batch
  // there is nothing to disclose (the batch-head todo).
  const [batchListOpen, toggleBatchList] = useFold(foldsOpen);
  const showBatchList = batches.length >= 2 && openPen !== 'record';
  const batchFold = openPen === null && Boolean(openBatch);

  // The pen's Next time field (sketch 007 line 301; UAT item 14; D-12): carries
  // its own visible caption and the sketch's e.g. placeholder, verbatim. It
  // stands inside the open Tasting section (so From freezer follows it) and,
  // with the section closed, after the churn section. Called only while
  // recording, when the draft exists.
  function renderNextTime() {
    return (
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
    );
  }

  return (
    <section className="batch-row" aria-label="Batch">
      {showBatchList && (
        <div className="batch-row__batch-list">
          <FoldRow
            label={<span className="notebook-caption">Batches</span>}
            labelText="Batches"
            open={batchListOpen}
            onToggle={toggleBatchList}
            controls="fold-batches"
            count={`${batches.length} batches`}
          />
          <UprightRail
            id="fold-batches"
            label="Batches of this version"
            hidden={!batchListOpen}
            entries={sortedBatches(batches).map((batch) => ({
              key: batch.id,
              title: `churned ${recordDateWords(batch.churn.churnDate)}`,
              meta: batchListMeta(batch).join(' · '),
              filled: Boolean(batch.tasting),
              inView: Boolean(openBatch && batch.id === openBatch.id),
              to: openPen ? null : notebookPath(version.recipeId, version.id, batch.id),
              state: { focusBatch: true },
            }))}
          />
        </div>
      )}
      {/* The head's own two groups (393-batch.html/723-batch.html, the
          batch-head todo, 03.5-17 Task 2): a lead group (Batch + the
          churned date, naming the batch IN VIEW — a different batch than
          the one being recorded while openPen === 'record', Mark,
          2026-09-10 live review, G-03.3-4) and an acts group (Correct,
          Record another), space-between with wrap. Amending keeps both
          groups' content, since amend corrects the very batch in view.
          With no pen open and a batch in view, the lead is the Batch fold
          row, with the churned date as its count (sketch 011 decision 50
          A); it folds the whole body below. With a pen open or no batch in
          view, the head is as built. */}
      <div className={`batch-row__head${showBatchList ? ' batch-row__head--after-list' : ''}`}>
        <div className="batch-row__head-lead">
          <h2
            id="batch"
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
            {batchFold ? (
              <FoldRow
                label="Batch"
                open={batchOpen}
                onToggle={onToggleBatch}
                controls="fold-batch"
                count={`churned ${recordDateWords(openBatch.churn.churnDate)}`}
              />
            ) : (
              'Batch'
            )}
          </h2>
          {!batchFold && openPen !== 'record' && openBatch && (
            <span className="batch-row__date">
              {`churned ${recordDateWords(openBatch.churn.churnDate)}`}
            </span>
          )}
        </div>
        <div className="batch-row__head-acts">
          {/* Correct: an underlined word standing on the head line that
              names the record it acts on (sketch 003 line 84, D-15) —
              present only with no pen open and a batch in view. The row
              has no foot acts and no read-view Add tasting (003 line
              256): the pen is the one door (03.3.1 D-01/D-03). */}
          {openPen === null && openBatch && (
            <Button
              ref={amendButtonRef}
              className="text-control batch-row__correct"
              onClick={() => onStartAmending(openBatch)}
            >
              Correct
            </Button>
          )}
          {/* Record another: moved from VersionRow.jsx (03.5-07 Task 1,
              decisions_recorded 1), last in the acts group. Present only
              with no pen open and a batch in view — the no-batch state's
              own "Record a batch" (below) is the same handler, offered
              where the sketch draws it instead. */}
          {openPen === null && openBatch && (
            <Button
              ref={recordButtonRef}
              className="text-control batch-row__record"
              onClick={onStartRecording}
            >
              Record another
            </Button>
          )}
        </div>
      </div>

      {/* recording-mode caps the frame at --pen-w (640px, contract
          "Responsive ladder") — the read view below shares this same
          container and must keep its own already-shipped full width, so
          the cap is conditional on mode rather than the class's own rule
          (VERIFICATION.md gap, 03.3.1). */}
      <div id="fold-batch" hidden={batchFold && !batchOpen}>
      <div className={mode === 'recording' ? 'batch-margin batch-margin--pen' : 'batch-margin'}>
        {mode === 'recording' ? (
          <>
            {/* The churn row (sketch 007 @ 2a212be lines 210-216; D-12's
                date caption, shortened to "Churned" by Mark's 2026-10-25
                decide-p10-churn-trio): a .field-row holding the
                120px Churned date field, this event's identifying field
                (D-05), then the two numeric churn measurements beside
                it (contract "DOM order inventory"). .batch-row__cells
                stays only for the read view below — the pen no longer
                uses it. Mark's 2026-09-16 ruling: the batch's name is not
                the record's content, so the field names the requirement
                before refusal. The quiet helper gives way to the error
                here — once, beside the field focus lands on — rather than
                at either ceremony. */}
            <div className="field-row">
              <label className="field-row__label field-row__label--date">
                <span className="pen-caption">Churned</span>
                {/* 261003-by3, .planning/debug/ios-tasting-date-picker.md: the
                    Record a tasting open already targets the Tasted date
                    (addTastingAttempt is a number only for that opener), and a
                    second date focus in the same tap tears down iOS's calendar.
                    Correct and Record another keep this mount focus. */}
                <input
                  type="date"
                  className="ink-field"
                  required
                  aria-required="true"
                  aria-invalid={blockedDateMessage ? 'true' : undefined}
                  aria-describedby={blockedDateMessage ? CHURN_DATE_ERROR_ID : undefined}
                  autoFocus={addTastingAttempt == null}
                  ref={churnDateRef}
                  value={draft.churnDate}
                  onChange={(event) => {
                    onChangeRecordField('churnDate', event.target.value);
                    queueMicrotask(stripDateValueAttributes);
                  }}
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
            {/* At draw (sketch 010 D6, D6b, D11, D13): Nothing to note or Not
                evaluated says why Exit consistency and Airiness are absent.
                A pick hides the two fields; a mark in either turns the
                options off with their reason. The Ingredient notes underline
                above is the group's rule. */}
            <MarkOneField
              field="atDraw"
              label="At draw"
              value={draft.atDraw}
              off={draft.exitConsistency !== '' || draft.airiness !== ''}
              onChange={(option) => onChangeMarkOne('atDraw', option)}
              onClear={() => onClearMarkOne('atDraw', 'At draw')}
            />
            {draft.atDraw === '' && (
              <>
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
              </>
            )}
            {/* The tasting section (D-01, contract "Settled defaults"):
                hidden until Add tasting opens it (SaveCeremony renders
                that control, both mounts) — the record opens with no
                heading, no helper, no rule at all. Variant A's own order
                once open: the field-row, then the note (before the
                texture block, which arrives in Task 2), then the defects
                row and the melt block (Task 3). */}
            {draft.tastingOpen && (
              <section aria-label="Tasting">
                {/* The Tasting head: a region, a peer of Batch (Mark,
                    2026-10-25, "I want Tasting to be treated as a region like
                    Batch"; decide-p10-tasting-gate; the ladder proposal's
                    section "Tasting a region, a peer of Batch"). It takes
                    the Batch head's own grammar: the lead holds the region
                    name, an h2 as the reading's is, then the tasting-status
                    live region (the slot the churned date uses on the Batch
                    head; it stays rendered while empty so a removal or a
                    restore is still announced); the acts hold the Restore
                    tasting slot (the contract's own static mount; in hidden
                    mode a removal always collapses the section, so it renders
                    in practice only on a reopened section while a prior
                    removal's restore is still pending) and Remove tasting,
                    "Remove tasting" verbatim in hidden mode (Pitfall 6: the
                    always-visible mode's "Clear tasting" label is never
                    built), flush right where Correct and Record another sit
                    on the Batch head in the reading. The region stays hidden
                    until Add tasting opens it (2026-09-12, D-01), which stays
                    in the two ceremonies (D-14). Its row height, its 18 under
                    and the region seam above it are notebook.css's. */}
                <div className="batch-row__head batch-row__head--tasting">
                  <div className="batch-row__head-lead">
                    <h2 className="region-name">Tasting</h2>
                    <p className="tasting-status pen-helper" role="status" aria-live="polite">
                      {tastingStatus}
                    </p>
                  </div>
                  <div className="batch-row__head-acts">
                    {pendingUndo && (
                      <Button className="text-control undo-control" onClick={onUndoRemove}>Restore tasting</Button>
                    )}
                    <Button
                      className="text-control"
                      ref={removeTastingButtonRef}
                      onClick={onRemoveTasting}
                    >
                      Remove tasting
                    </Button>
                  </div>
                </div>
                {/* The tasting field row (sketch 007 lines 249-253; UAT
                    items 7, 8): a .field-row holding the 120px Tasted date
                    then Tempering and Temperature, MeasuredField's
                    own field-row shape (Task 1). */}
                <div className="field-row">
                  <label className="field-row__label field-row__label--date">
                    <span className="pen-caption">Tasted</span>
                    <input
                      type="date"
                      className="ink-field"
                      ref={tastedDateRef}
                      value={draft.tastedDate}
                      onChange={(event) => {
                        onChangeRecordField('tastedDate', event.target.value);
                        queueMicrotask(stripDateValueAttributes);
                      }}
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
                {/* The melt block, under the note (sketch 010 CONTRACT section
                    7 moved it up from the tasting body's foot; sketch 007
                    lines 285-297; UAT item 12; D-12): a .field-row with top
                    alignment holding Melt test and the Melt style category
                    — the domain's own "Melt test" label (no "(optional)"
                    override needed) and "Melt style" with the suffix
                    dropped, both fields optional. */}
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
                {/* Next time stands inside the open section, under the melt
                    block, so From freezer and the scales come after it
                    (sketch 010 D11b, D13). With the section closed it stays
                    where it was, after the churn section (not drawn). */}
                {renderNextTime()}
                {/* From freezer (sketch 010 D6, D6b, D11b, D13): Nothing to
                    note or Not evaluated says why the scales and Any
                    problems? are absent. A pick hides them; a mark, a
                    problem or a declared problem turns the options off with
                    their reason. Next time's underline above is its rule. */}
                <MarkOneField
                  field="fromFreezer"
                  label="From freezer"
                  value={draft.fromFreezer}
                  off={
                    Object.keys(draft.marks).length > 0 ||
                    draft.defects.length > 0 ||
                    draft.declaredDefects.length > 0
                  }
                  onChange={(option) => onChangeMarkOne('fromFreezer', option)}
                  onClear={() => onClearMarkOne('fromFreezer', 'From freezer')}
                />
                {/* A From freezer pick hides the scales and Any problems?
                    (sketch 010 D9); the group's marks are off while it holds
                    a pick, so the draft never holds both. */}
                {draft.fromFreezer === '' && (
                  <>
                    {/* axesForBatch's own contract (domain/axes.js) reads
                        batch.snapshot.coreScales and declaredAxes only, never
                        a live version or the catalog — the snapshot is what
                        protects a stored mark from a later change to the
                        scales table or the recipe's declared pair (WR-04 code
                        review, D-03). Amending an existing batch reads its own
                        snapshot; a genuinely fresh record has no snapshot yet
                        (it is written at save time), so it reads the catalog
                        the page was handed and the live version's own declared
                        scales (axesForVersion) — not the drift the contract
                        guards against (D-01, D-02). */}
                    <AxesGrid
                      axes={
                        openPen === 'amend' && openBatch
                          ? axesForBatch(openBatch)
                          : axesForVersion(version, catalog)
                      }
                      marks={draft.marks}
                      below={below}
                      onChangeMark={onChangeRecordMark}
                      onClearMark={onClearAxisMark}
                    >
                      {/* The defects, inside the axes grid as its own two
                          labelled groups (contract "Controls spec", "DOM
                          order inventory"; 007 lines 263-281): the head
                          carries the caption and its lowercase helper on one
                          row, then "Every recipe" (a new pen's chips are the
                          catalog's problem words, a Correct's the words its
                          own snapshot carries) and "This recipe only" (Bitter, a plain
                          defect with no helper and no aria-label — the group
                          cue carries the meaning through aria-labelledby).
                          Picked state is aria-pressed, never colour alone
                          (UX1-03). */}
                      <div className="defects-head">
                        <h3 className="pen-caption axes-cue" id="defects-caption">
                          Any problems?
                        </h3>
                        <p className="pen-helper defects-head__helper">select all that apply</p>
                      </div>
                      <div
                        className="defect-group defect-group--core"
                        role="group"
                        aria-labelledby="defects-caption defects-core-cue"
                      >
                        <h4 className="pen-caption" id="defects-core-cue">
                          Every recipe
                        </h4>
                        <div className="defects-row__chips">
                          {/* Each Every recipe chip is a native toggle
                              button carrying its own aria-pressed — a picked
                              chip's own boolean, read fresh per chip from the
                              draft's defects list. */}
                          {(openPen === 'amend' && openBatch ? coreProblemsForBatch(openBatch) : problemNames(catalog.problems)).map((defect) => (
                            <Button
                              key={defect}
                              className="chip-toggle"
                              aria-pressed={draft.defects.includes(defect)}
                              onClick={() => onChangeDefect(defect)}
                            >
                              {defect}
                            </Button>
                          ))}
                        </div>
                      </div>
                      {declaredProblems.length > 0 && (
                        <div
                          className="defect-group defect-group--declared"
                          role="group"
                          aria-labelledby="defects-caption defects-declared-cue"
                        >
                          <h4 className="pen-caption" id="defects-declared-cue">This recipe only</h4>
                          <div className="defects-row__chips">
                            {/* A declared problem is a plain defect — no helper
                                span, no aria-label of its own; its pressed
                                state reads from the draft's declaredDefects
                                list, one chip per word the recipe declares
                                (0 to 2; the group is absent for none). */}
                            {declaredProblems.map((word) => (
                              <Button
                                key={word}
                                className="chip-toggle"
                                aria-pressed={draft.declaredDefects.includes(word)}
                                onClick={() => onToggleDeclaredDefect(word)}
                              >
                                {word}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                    </AxesGrid>
                  </>
                )}
              </section>
            )}
            {!draft.tastingOpen && renderNextTime()}
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
                <span className="batch-row__cell-label">Out of machine</span>
                {openBatch.churn.outOfMachineTempC != null ? (
                  <span className="batch-row__cell-value">
                    {churnMeasured(openBatch.churn.outOfMachineTempC, { signed: true })}
                    <span className="batch-row__unit"> °C</span>
                  </span>
                ) : (
                  <span className="batch-row__unit batch-row__unit--absent">not measured</span>
                )}
              </div>
              <div className="batch-row__cell">
                <span className="batch-row__cell-label">Duration</span>
                {openBatch.churn.churnDurationMinutes != null ? (
                  <span className="batch-row__cell-value">
                    {churnMeasured(openBatch.churn.churnDurationMinutes)}
                    <span className="batch-row__unit"> min</span>
                  </span>
                ) : (
                  <span className="batch-row__unit batch-row__unit--absent">not measured</span>
                )}
              </div>
            </div>
            {/* At the machine / Ingredient notes: the maker's own words,
                in the hand (03.5-07, decisions_recorded 1). Each note is
                its own paragraph in one column, 4px apart and 18px under
                the cells, as every sketch 011 batch board draws it
                (260925-u3r). */}
            {(openBatch.churn.atTheMachine || openBatch.churn.ingredientNotes) && (
              <div className="batch-row__notes">
                {openBatch.churn.atTheMachine && <p className="batch-row__note app-hand">{openBatch.churn.atTheMachine}</p>}
                {openBatch.churn.ingredientNotes && (
                  <p className="batch-row__note app-hand">{openBatch.churn.ingredientNotes}</p>
                )}
              </div>
            )}
            {/* At draw (sketch 010 D6a, D6b, D12): a stored word reads as one
                full-width cell and none of the group's fields; with no word
                the two fields read as they always have ("not measured" when
                absent). The record never reads the word beside marks. */}
            {openBatch.churn.atDraw ? (
              <div className="batch-row__cells mo-readgroup">
                <div className="batch-row__cell mo-lead">
                  <span className="batch-row__cell-label">At draw</span>
                  <span className="batch-row__cell-value">{openBatch.churn.atDraw}</span>
                </div>
              </div>
            ) : (
              <div className="batch-row__cells mo-readgroup">
                <div className="batch-row__cell">
                  <span className="batch-row__cell-label">Exit consistency</span>
                  {openBatch.churn.exitConsistency != null ? (
                    <span className="batch-row__cell-value">{openBatch.churn.exitConsistency}</span>
                  ) : (
                    <span className="batch-row__unit batch-row__unit--absent">not measured</span>
                  )}
                </div>
                <div className="batch-row__cell">
                  <span className="batch-row__cell-label">Airiness</span>
                  {openBatch.churn.airiness != null ? (
                    <span className="batch-row__cell-value">{openBatch.churn.airiness}</span>
                  ) : (
                    <span className="batch-row__unit batch-row__unit--absent">not measured</span>
                  )}
                </div>
              </div>
            )}

            {/* The tasting battery's own read view (contract "Axes spec",
                brief § 3): TastingReading reads only the single stored
                tasting; a batch with none reads its own
                silence-is-a-value sentence instead. */}
            {openBatch.tasting ? (
              <TastingReading batch={openBatch} foldsOpen={foldsOpen} />
            ) : (
              <p>This batch has not been tasted yet.</p>
            )}
            {/* Next time always renders its caption (03.5-07,
                decisions_recorded 3): the note in the hand when written,
                "nothing written yet" in the same muted voice as an absent
                measured value otherwise. */}
            <div className="batch-row__conclusion">
              <h3 className="batch-row__group-label">Next time</h3>
              {openBatch.churn.nextTimeNote ? (
                <span className="app-hand">{openBatch.churn.nextTimeNote}</span>
              ) : (
                <span className="batch-row__unit batch-row__unit--absent">nothing written yet</span>
              )}
            </div>
            <dl className="batch-row__provenance">
              <div>
                <dt>Recorded</dt>
                <dd>{recordDateWords(openBatch.recordedAt)}</dd>
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
        ) : batches.length > 0 ? (
          <p>No batch of this version has that address.</p>
        ) : (
          <>
            {/* The no-batch state (1600-no-batch.html): a version that
                has never been churned. Record a batch is the filled
                action (.notebook-action); it shares the head's own
                Record opener handler and focus-return ref, since exactly
                one of the two ever mounts. The board's other control
                there is Phase 4's, out of scope here. */}
            <p>{NO_BATCH_PROSE}</p>
            {openPen === null && (
              <Button ref={recordButtonRef} className="notebook-action" onClick={onStartRecording}>
                Record a batch
              </Button>
            )}
          </>
        )}
      </div>
      </div>

      {/* The no-batch state's own list (D-09): with zero batches there is
          nothing to disclose. From one batch, nothing renders here any
          more — the batch list above (showBatchList) replaces it from
          two, and one batch offers no control of any kind (the
          batch-head todo). The list is also withheld while any pen is
          open, as the brief withholds the batch list while recording, so
          "no batch yet" never sits under Save batch while the first batch
          is recorded (critique P3, Mark 2026-10-22). */}
      {batches.length === 0 && openPen === null && (
        <ul className="batch-margin__list">
          <li>no batch yet</li>
        </ul>
      )}
    </section>
  );
}
