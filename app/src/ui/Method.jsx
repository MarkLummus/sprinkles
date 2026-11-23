import { useEffect, useRef, useState } from 'react';
import { isStruck, changedLineFor, stepChangeFor } from '../domain/batch.js';
import { removedRowsUsedBy, coveredRowsFor } from '../domain/uses.js';
import { displayNumberOf } from '../domain/stepNumbers.js';
import { liveSteps } from '../domain/creationSteps.js';
import { Button } from './Button.jsx';
import { StepMoveButtons, moveFocusTarget, stepMoveWord } from './StepMoves.jsx';
import { useStructureWord } from './useAnnouncer.js';
import { holdReturn, stripNewlines } from './oneLineField.js';
import { Checkbox } from './Checkbox.jsx';
import { FieldFeedback } from './FieldFeedback.jsx';
import { StepAside, StepPurpose, StepReading, StepTargets } from './StepReading.jsx';

// The id of a blocked step field's Required: one blocked step field at a time, as the
// version line has 'version-field-error' and the table has 'ingredient-field-error'.
const STEP_FIELD_ERROR_ID = 'step-field-error';

function joinWithAnd(items) {
  if (items.length <= 1) return items[0] ?? '';
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

// The coverage cue (route-recipe-version.md § 3, D-UAT-3): stated as a fact
// in the maker's own vocabulary, never as reassurance or an instruction.
// Joins rows and steps the way the removed-row flag beside it joins its
// own, so the cross-flag sentences on this page read as one family. Rows
// sharing the identical set of covering steps are named together, once.
// Names each covering step by the number the reader sees (03-10) — a
// covering step is never itself removed, so it always holds a position in
// currentStepNumbers.
function coverageSentence(coveredRows, currentStepNumbers) {
  const groups = [];
  for (const entry of coveredRows) {
    const key = entry.coveringSteps.map((step) => displayNumberOf(currentStepNumbers, step.n)).join(',');
    const group = groups.find((candidate) => candidate.key === key);
    if (group) group.rows.push(entry);
    else groups.push({ key, rows: [entry], coveringSteps: entry.coveringSteps });
  }
  return groups
    .map((group) => {
      const rowNames = joinWithAnd(group.rows.map((entry) => entry.ingredientName));
      const stepNames = joinWithAnd(
        group.coveringSteps.map((step) => `step ${displayNumberOf(currentStepNumbers, step.n)}`),
      );
      const verb = group.rows.length > 1 ? 'are' : 'is';
      return `${rowNames} ${verb} still used by ${stepNames}`;
    })
    .join('; ');
}

// The on-demand field mechanism (D-23, D-25): a boolean local to the field,
// open when the value it starts with already carries text, closing itself
// on an empty blur — write once here, reuse for purpose, aside, and the
// batch pen's per-step "Done differently" line, never a second
// implementation of the same collapse-on-blur rule. The blur handler reads
// the blur event's own value, never the draft, since the draft may not
// have updated synchronously with the blur (RESEARCH.md Pitfall 4's own
// caution, carried into this mechanism). The focus effect only fires for a
// field the maker's own press opened, so the version line's autoFocus wins
// on mount instead of losing to whichever already-texted field renders last.
// A caller whose value can be put back behind a closed field reads the seed
// again with seedOpen when the field's form opens. The version pen's step
// Cancel is such a case: it restores the step while StepPenBody stays mounted
// (bug-pen-step-aside-hidden-after-cancel). seedOpen moves no focus. The
// creation editor and the record pen's Done differently line never call it.
export function useOnDemandField(initialOpen, onCollapse) {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const fieldRef = useRef(null);
  const openedByUser = useRef(false);

  function openField() {
    openedByUser.current = true;
    setIsOpen(true);
  }

  useEffect(() => {
    if (isOpen && openedByUser.current) fieldRef.current?.focus();
  }, [isOpen]);

  function handleBlur(event) {
    if (event.target.value.trim() === '') {
      setIsOpen(false);
      openedByUser.current = false;
      onCollapse();
    }
  }

  function seedOpen(open) {
    openedByUser.current = false;
    setIsOpen(open);
  }

  return { isOpen, openField, fieldRef, handleBlur, seedOpen };
}

// The words " was step N" after a step whose number changed with the order
// (sketch 017 CONTRACT section 5, choice A, decide-p12-pen-order-mark): the type
// of " removed", no new rule, and the same words for the eye and a screen
// reader. Null when the step carries no movedFrom (a hand-built stepDiff too).
function wasStepMark(stepDiff) {
  if (stepDiff.movedFrom == null) return null;
  return <span className="method-step__skipped-label">{` was step ${stepDiff.movedFrom}`}</span>;
}

// A step's body while the plan's pen is open (D-23, D-24, D-28; sketch 011
// decisions_recorded 5, Task 3): pulled out of the steps.map() loop below
// so each step can own its own on-demand state (purpose, aside, the uses
// checklist) via ordinary component-local useState — this component is
// called once per step, and its li is keyed by the step's stored key, so the
// step's own state moves with it when the pen changes the order (sketch 017).
// Whether THIS step is the one open is Method's own state now, not this component's —
// isOpen/onOpen/onDone/onCancel are all Method's, so opening one step can
// close whichever other step was open (Done keeps its edits, matching
// Cancel's own restore-and-close). Exported for its own direct test —
// renderToStaticMarkup cannot simulate the click that opens a step through
// <Method> itself (RESEARCH.md Pitfall 4).
export function StepPenBody({
  step,
  draftStep,
  stepDiff,
  rows,
  flaggedRows,
  coveredRows,
  staleEntry,
  staleFlagVisible,
  currentStepNumbers,
  fieldLabel,
  number = null,
  isOpen,
  onOpen,
  onDone,
  onCancel,
  takeEditFocus = () => false,
  onChangePenStepField,
  onChangePenStepTarget,
  onTogglePenStepUses,
  onTogglePenStepRemoved,
  // The step among the live steps (sketch 017 CONTRACT section 2): { isFirst, isLast,
  // onMove } for a live step, null for a removed one, which offers no Move.
  moves = null,
  // The refused Save's block when it names a field of this step, else null
  // (bug-pen-saves-blank-lead-in), with its message.
  blocked = null,
  blockedMessage = null,
}) {
  const showStruckBeneath = stepDiff.leadInChanged || stepDiff.instructionChanged;
  const showPurposeStruck = stepDiff.purposeChanged && stepDiff.textFrom.purpose !== '';
  const showAsideStruck = stepDiff.asideChanged && stepDiff.textFrom.aside !== '';

  const purpose = useOnDemandField(Boolean(draftStep.purpose), () =>
    onChangePenStepField(step.n, 'purpose', ''),
  );
  const aside = useOnDemandField(Boolean(draftStep.aside), () => onChangePenStepField(step.n, 'aside', ''));

  // A step opens with its purpose and aside open exactly when the draft holds their text, read on
  // the click, since Cancel may have put text back behind a closed field.
  function handleOpen() {
    purpose.seedOpen(Boolean(draftStep.purpose));
    aside.seedOpen(Boolean(draftStep.aside));
    onOpen();
  }

  // The uses line (D-24): closed by default, reading the names live off
  // the draft on every render — never a snapshot — so the line above the
  // checklist updates as boxes change while it is open.
  const [usesOpen, setUsesOpen] = useState(false);
  const usesControlRef = useRef(null);
  const leadInRef = useRef(null);
  const editButtonRef = useRef(null);
  const doneButtonRef = useRef(null);
  // Preview step (CONTRACT section 7; bug-p11-pen-step-no-preview): the open step read as it will read.
  // Done and Cancel close the step without remounting this component, so the preview is put away when
  // the step closes, never carried to the next time it opens.
  const [previewing, setPreviewing] = useState(false);
  useEffect(() => {
    if (!isOpen) setPreviewing(false);
  }, [isOpen]);
  // bug-edit-this-step-focus-on-cancel: the closed step's Edit this step button node is reused as the
  // open step's Cancel, so focus stayed on it. Opening the step puts focus in its lead-in. The branches
  // stay unkeyed so focus after Cancel still lands on Edit this step.
  useEffect(() => {
    if (isOpen) leadInRef.current?.focus();
  }, [isOpen]);
  // bug-pen-step-done-drops-focus: Done's button has no partner in the closed step (a span stands in its
  // place), so its node is removed and focus would fall to the page. This asks Method whether this close
  // was this step's Done, so Cancel's landing (the reused node) and every other close are left alone.
  useEffect(() => {
    if (!isOpen && takeEditFocus()) editButtonRef.current?.focus();
  }, [isOpen]);
  // bug-pen-step-done-drops-focus: Remove this step is drawn only while the step is live, so the press
  // removes the focused button. The step stays open, so focus goes to its own Done in the line below,
  // which is drawn before and after the render. Done keeps the step's edits, where the step's Cancel
  // would put the whole step back.
  function handleRemoveThisStep() {
    onTogglePenStepRemoved(step.n);
    doneButtonRef.current?.focus();
  }
  // A refused Save moves focus into the field it names. The step may open in the render after the
  // refusal (Method's effect), so the attempt alone cannot key the focus: this runs when the step
  // opens too, after the open effect above, and records the attempt it handled so a later Done and
  // Edit this step keep the focus the open effect gives, in the lead-in. The target fields sit in a
  // Map, never a bare object keyed by text (T-02-32), as IngredientTable's gramsInputsRef.
  const instructionRef = useRef(null);
  const targetFieldsRef = useRef(new Map());
  const handledAttemptRef = useRef(null);
  useEffect(() => {
    if (!isOpen || !blocked || blocked.attempt === handledAttemptRef.current) return;
    handledAttemptRef.current = blocked.attempt;
    if (blocked.kind === 'stepLeadIn') leadInRef.current?.focus();
    else if (blocked.kind === 'stepInstruction') instructionRef.current?.focus();
    else if (blocked.kind === 'stepTarget') targetFieldsRef.current.get(`${blocked.index}:${blocked.side}`)?.focus();
  }, [isOpen, blocked?.attempt]);
  const leadError = blocked?.kind === 'stepLeadIn' ? blockedMessage : null;
  const instructionError = blocked?.kind === 'stepInstruction' ? blockedMessage : null;
  function registerTargetField(index, side, element) {
    if (element) targetFieldsRef.current.set(`${index}:${side}`, element);
    else targetFieldsRef.current.delete(`${index}:${side}`);
  }
  const usesNames = rows.filter((row) => (draftStep.uses ?? []).includes(row.id)).sort((a, b) => draftStep.uses.indexOf(a.id) - draftStep.uses.indexOf(b.id)).map((row) => row.ingredientName);

  function handleUsesKeyDown(event) {
    // Gated on usesOpen (G-03.3-2 fix, gap plan 05): a closed checklist's
    // Escape must no-op here so the keydown keeps bubbling to the page's
    // own document-level Escape listener, unchanged.
    if (!usesOpen) return;
    if (event.key !== 'Escape') return;
    // Stops the page's own document-level Escape listener from also
    // firing for this key press (planner decision 4) — one press closes
    // the checklist only, the second reaches the pen.
    event.stopPropagation();
    setUsesOpen(false);
    usesControlRef.current?.focus();
  }

  // The whole-step reveal gate (03.3-03, 03.1 Gap 1 override; sketch 011
  // decisions_recorded 5, Task 3): the pen opens each step read-only by
  // default — the closed branch below transcribes the show-changes
  // branch's own read-only JSX (Method.jsx's isShowingChanges branch), fed
  // draftStep/stepDiff instead of step/stepDiff — with one "edit this
  // step" text control revealing this same, unmodified open form. Both
  // branches keep the outer method-step__body wrapper so its grid/spacing
  // rule applies uniformly regardless of state.
  return isOpen ? (
    <div className="method-step__body">
      {/* The open step's fields, in a hairline outline (sketch 011
          decision 2, decisions_recorded 5): the field grammar itself
          stands unchanged — separate lead-in, instruction and target
          fields, not the board's one pen-blue block — that difference
          goes on plan 08's record for Mark. */}
      <div className="method-step__open-fields">
        <label className="method-step__field">
          <textarea
            rows="1"
            className="prose-field prose-field--lead-in"
            ref={leadInRef}
            value={draftStep.leadIn}
            aria-label={fieldLabel(step, draftStep.removed, 'lead-in')}
            aria-invalid={leadError ? 'true' : undefined}
            aria-describedby={leadError ? STEP_FIELD_ERROR_ID : undefined}
            onChange={(event) => onChangePenStepField(step.n, 'leadIn', stripNewlines(event.target.value))}
            onKeyDown={holdReturn}
          />
          <FieldFeedback error={leadError} errorId={STEP_FIELD_ERROR_ID} />
        </label>
        <label className="method-step__field">
          <textarea
            className="prose-field"
            rows="2"
            ref={instructionRef}
            value={draftStep.instruction}
            aria-label={fieldLabel(step, draftStep.removed, 'instruction')}
            aria-invalid={instructionError ? 'true' : undefined}
            aria-describedby={instructionError ? STEP_FIELD_ERROR_ID : undefined}
            onChange={(event) => onChangePenStepField(step.n, 'instruction', event.target.value)}
          />
          <FieldFeedback error={instructionError} errorId={STEP_FIELD_ERROR_ID} />
        </label>
        {/* The one place the strike sits below rather than beside
            the field, because a paragraph has no room beside
            (route-recipe-version.md § 3). The "removed" label is
            a sibling of the struck element, never nested inside
            it — the same reason the reading branch's "Skipped"
            label sits outside its struck span, below. */}
        {showStruckBeneath && (
          <p className="prose-struck-beneath">
            <b>{stepDiff.textFrom.leadIn}.</b> {stepDiff.textFrom.instruction}
          </p>
        )}
        {draftStep.removed && <span className="method-step__skipped-label"> removed</span>}
        {/* Sketch 017 CONTRACT section 5: under the two fields, where " removed"
            stands on an open removed step. With targets it stands before the
            chips line, the nearest precedent (the board draws no step with targets). */}
        {wasStepMark(stepDiff)}

        {draftStep.targets?.length > 0 && (
          <p className="method-step__targets">
            {draftStep.targets.map((target, index) => {
              const targetDiff = stepDiff.targets[index];
              // Required stands directly after the blank side, inside the chip: the chip's grid puts it
              // on the second row under the field it follows (sketch 016 CONTRACT section 13).
              const refusedHere = blocked?.kind === 'stepTarget' && blocked.index === index;
              const labelError = refusedHere && blocked.side === 'label' ? blockedMessage : null;
              const valueError = refusedHere && blocked.side === 'value' ? blockedMessage : null;
              return (
                <span className="target-chip" key={index}>
                  {targetDiff?.changed && targetDiff.from != null && (
                    <span className="struck-value">{`${targetDiff.label} ${targetDiff.from}`}</span>
                  )}
                  <textarea
                    rows="1"
                    cols="20"
                    className="ink-field target-chip__label-field"
                    ref={(element) => registerTargetField(index, 'label', element)}
                    value={target.label}
                    aria-label={fieldLabel(step, draftStep.removed, `target ${index + 1}, label`)}
                    aria-invalid={labelError ? 'true' : undefined}
                    aria-describedby={labelError ? STEP_FIELD_ERROR_ID : undefined}
                    onChange={(event) => onChangePenStepTarget(step.n, index, 'label', stripNewlines(event.target.value))}
                    onKeyDown={holdReturn}
                  />
                  <FieldFeedback error={labelError} errorId={STEP_FIELD_ERROR_ID} />
                  <textarea
                    rows="1"
                    cols="20"
                    className="ink-field target-chip__value-field"
                    ref={(element) => registerTargetField(index, 'value', element)}
                    value={target.value}
                    aria-label={fieldLabel(step, draftStep.removed, `target ${index + 1}, value`)}
                    aria-invalid={valueError ? 'true' : undefined}
                    aria-describedby={valueError ? STEP_FIELD_ERROR_ID : undefined}
                    onChange={(event) => onChangePenStepTarget(step.n, index, 'value', stripNewlines(event.target.value))}
                    onKeyDown={holdReturn}
                  />
                  <FieldFeedback error={valueError} errorId={STEP_FIELD_ERROR_ID} />
                </span>
              );
            })}
          </p>
        )}
      </div>

      {/* The stale-amount flag (route-recipe-version.md § 3):
          derived from the step's uses list, never from parsing
          the prose — shown in the pen and in show-changes only,
          never in the clean reading. Visibility is decided by
          the page, passed in as a prop, so this component does
          not need to know which state the page is in. */}
      {staleFlagVisible && staleEntry && (
        <p className="method-step__stale-flag">
          {`amounts changed: ${staleEntry.changes
            .map((change) => `${change.ingredientName} ${change.from} → ${change.to} g`)
            .join('; ')}`}
        </p>
      )}

      {/* Purpose and aside on demand (D-23): the field itself once the
          maker asks for one or it already carries a baseline value — the
          "add a purpose"/"add an aside" openers now sit on the shared
          controls line below, beside "Change ingredients", not here. */}
      {purpose.isOpen && (
        <label className="method-step__field">
          <textarea
            ref={purpose.fieldRef}
            className="prose-field"
            rows="2"
            value={draftStep.purpose ?? ''}
            aria-label={fieldLabel(step, draftStep.removed, 'purpose')}
            onChange={(event) => onChangePenStepField(step.n, 'purpose', event.target.value)}
            onBlur={purpose.handleBlur}
          />
        </label>
      )}
      {/* Each of the four text fields strikes only its own
          parent value, beneath itself, when that field moved —
          never the lead-in/instruction pair (03-09). */}
      {showPurposeStruck && <p className="prose-struck-beneath">{stepDiff.textFrom.purpose}</p>}

      {aside.isOpen && (
        <label className="method-step__field">
          <textarea
            ref={aside.fieldRef}
            className="prose-field"
            rows="2"
            value={draftStep.aside ?? ''}
            aria-label={fieldLabel(step, draftStep.removed, 'aside')}
            onChange={(event) => onChangePenStepField(step.n, 'aside', event.target.value)}
            onBlur={aside.handleBlur}
          />
        </label>
      )}
      {showAsideStruck && <p className="prose-struck-beneath">{stepDiff.textFrom.aside}</p>}

      {/* Preview step (CONTRACT section 7 and section 11, number 6): one line holding the one control,
          directly before the uses line, after the written purpose and aside. A removed step has none:
          it will not read in the version being made, and its closed form already shows it struck. */}
      {!draftStep.removed && (
        <>
          <p className="method-step__targets">
            <Button
              className="text-control"
              aria-label={fieldLabel(step, draftStep.removed, previewing ? 'Hide preview' : 'Preview step')}
              onClick={() => setPreviewing((open) => !open)}
            >
              {previewing ? 'Hide preview' : 'Preview step'}
            </Button>
          </p>
          {previewing && (
            <div className="mk-preview" role="group" aria-label={fieldLabel(step, draftStep.removed, 'preview')}>
              <p className="mk-preview__cue">Preview</p>
              <ol className="method-steps">
                <StepReading step={draftStep} number={number} />
              </ol>
            </div>
          )}
        </>
      )}

      {/* The controls line (D-24, D-23; sketch 011 decisions_recorded 5):
          the uses sentence and its "Change ingredients"/"Done"
          toggle, then the on-demand triggers for purpose and aside — one
          line, middot-separated, each trigger absent once its own field
          is open. The wrapper below (G-03.3-2 fix, gap plan 05) covers
          both this line's toggle and the fieldset, so an Escape pressed
          while focus is on the button (not just inside the fieldset) is
          caught by the same usesOpen-gated handler. */}
      <div onKeyDown={handleUsesKeyDown}>
        <p className="method-step__uses-line">
          {usesNames.length > 0 ? `uses ${usesNames.join(', ')}` : 'uses nothing yet'}{' '}
          <Button
            className="text-control"
            ref={usesControlRef}
            aria-label={fieldLabel(step, draftStep.removed, usesOpen ? 'done' : 'change ingredients')}
            onClick={() => setUsesOpen((open) => !open)}
          >
            {usesOpen ? 'Done' : 'Change ingredients'}
          </Button>
          {!purpose.isOpen && (
            <>
              <span aria-hidden="true">·</span>
              <Button
                className="text-control"
                aria-label={fieldLabel(step, draftStep.removed, 'add purpose')}
                onClick={purpose.openField}
              >
                Add purpose
              </Button>
            </>
          )}
          {!aside.isOpen && (
            <>
              <span aria-hidden="true">·</span>
              <Button
                className="text-control"
                aria-label={fieldLabel(step, draftStep.removed, 'add aside')}
                onClick={aside.openField}
              >
                Add aside
              </Button>
            </>
          )}
        </p>
        {usesOpen && (
          <fieldset className="method-step__uses" aria-label={fieldLabel(step, draftStep.removed, 'uses')}>
            <legend>Uses</legend>
            {rows.map((row) => (
              <label key={row.id} className="method-step__uses-item">
                <Checkbox
                  checked={(draftStep.uses ?? []).includes(row.id)}
                  onChange={() => onTogglePenStepUses(step.n, row.id)}
                />
                <span>{row.ingredientName}</span>
              </label>
            ))}
          </fieldset>
        )}
      </div>

      {/* The removed-row cross-flag (route-recipe-version.md
          § 3): beneath an ACTIVE step, naming the removed
          row(s) it still names in its own uses list, with one
          "remove this step" control. One tap, that step only —
          removal never cascades. Gated on the step not itself
          being removed: on an already-removed step this
          control's "remove this step" label lied — the same
          handler restores (T-03-53) — so an already-removed
          step gets the coverage cue in its place, below. */}
      {!draftStep.removed && flaggedRows.length > 0 && (
        <p className="method-step__flag">
          {`uses ${flaggedRows.map((row) => row.ingredientName).join(', ')}, which ${
            flaggedRows.length > 1 ? 'are' : 'is'
          } removed`}{' '}
          <Button onClick={handleRemoveThisStep}>
            Remove this step
          </Button>
        </p>
      )}

      {/* The coverage cue (D-UAT-3): on a removed step, names
          the rows it used that another step still covers, so
          correct silence (nothing orphaned) is legible rather
          than indistinguishable from a broken flag. The rows
          this removal DID orphan already announce themselves
          beside their own names in the ingredient table — this
          cue does not repeat them, and renders nothing when
          the step covers none of its own rows. */}
      {draftStep.removed && coveredRows.length > 0 && (
        <p className="method-step__flag">{coverageSentence(coveredRows, currentStepNumbers)}</p>
      )}

      {/* Done/Cancel (sketch 011 decisions_recorded 5): Cancel first
          (Sheet grammar), an underlined word; Done a hairline ink box —
          both read the binder's existing global button/.text-control
          rules, no class of their own. remove/restore no longer lives
          here at all — it moved to the closed step (decisions_recorded
          4), the mirror of moving into the open form. */}
      <p className="method-step__done-cancel">
        <Button className="text-control" onClick={onCancel}>
          Cancel
        </Button>
        <Button ref={doneButtonRef} onClick={onDone}>
          Done
        </Button>
      </p>
    </div>
  ) : (
    // The closed-state form (03.3-03, 03.1 Gap 1 override): transcribed
    // from the isShowingChanges branch's own read-only JSX below, fed
    // draftStep/stepDiff instead of step/stepDiff — this branch's own
    // data is the maker's live edit, not the baseline `steps` prop.
    // Renders nothing for flaggedRows/the uses line; that content lives
    // only in the revealed form above (Mark, 2026-09-10, option B).
    // remove/restore DOES render here now (sketch 011 decisions_recorded
    // 4) — the mirror of the move above.
    <div className="method-step__body">
      <p className="method-step__lead">
        <span className={draftStep.removed ? 'method-step__prose--struck' : undefined}>
          <b>{draftStep.leadIn}.</b> {draftStep.instruction}
        </span>
        {draftStep.removed && <span className="method-step__skipped-label"> removed</span>}
        {wasStepMark(stepDiff)}
      </p>
      {showStruckBeneath && (
        <p className="prose-struck-beneath">
          <b>{stepDiff.textFrom.leadIn}.</b> {stepDiff.textFrom.instruction}
        </p>
      )}

      <StepTargets targets={draftStep.targets} targetDiffs={stepDiff.targets} />

      {staleFlagVisible && staleEntry && (
        <p className="method-step__stale-flag">
          {`amounts changed: ${staleEntry.changes
            .map((change) => `${change.ingredientName} ${change.from} → ${change.to} g`)
            .join('; ')}`}
        </p>
      )}

      <StepPurpose text={draftStep.purpose} />
      {showPurposeStruck && <p className="prose-struck-beneath">{stepDiff.textFrom.purpose}</p>}
      <StepAside text={draftStep.aside} />
      {showAsideStruck && <p className="prose-struck-beneath">{stepDiff.textFrom.aside}</p>}

      {/* The coverage cue (D-UAT-3, option B): stays on the closed step
          — plain prose, no control, so it does not breach "one edit
          this step text control per step." */}
      {draftStep.removed && coveredRows.length > 0 && (
        <p className="method-step__flag">{coverageSentence(coveredRows, currentStepNumbers)}</p>
      )}

      {/* The open form's Preview step slot, held empty here. The two branches are unkeyed on purpose so
          the Edit this step button node is reused as the open step's Cancel and focus stays on it
          after Cancel (bug-edit-this-step-focus-on-cancel); React pairs them by child position, and
          this branch's last child must keep standing where the open form's Done/Cancel line stands. */}
      {null}

      <p className="method-step__acts">
        <Button
          className="text-control"
          ref={editButtonRef}
          aria-label={fieldLabel(step, draftStep.removed, 'edit this step')}
          onClick={handleOpen}
        >
          Edit this step
        </Button>
        <span aria-hidden="true">·</span>
        {moves && (
          <>
            <StepMoveButtons number={number} isFirst={moves.isFirst} isLast={moves.isLast} onMove={moves.onMove} />
            <span aria-hidden="true">·</span>
          </>
        )}
        <Button
          className="text-control"
          aria-label={fieldLabel(step, draftStep.removed, draftStep.removed ? 'restore' : 'remove')}
          onClick={() => onTogglePenStepRemoved(step.n)}
        >
          {draftStep.removed ? 'Restore' : 'Remove'}
        </Button>
      </p>
    </div>
  );
}

// The batch pen's per-step controls (D-25, D-28): the Skipped checkbox is
// always present; the "Done differently" line reuses the same on-demand
// mechanism StepPenBody's purpose/aside fields use, so it opens when the
// step's own stepChanges entry already holds a line (what makes Amend
// open the lines that hold text) and collapses back to its opener on an
// empty blur. The line is a one-row textarea, so a hardware Tab leaves it on
// the iPad (bug-ipad-tab-lost-from-single-line-fields: iPadOS 27 Safari drops a
// Tab from every input element); Return is held and a pasted line break removed.
function StepRecordingControls({ step, entry, onChangeStepChange, fieldLabel }) {
  const line = useOnDemandField(Boolean(entry && entry.line), () =>
    onChangeStepChange(step.n, { struck: entry ? entry.struck : false, line: null }),
  );

  function handleChangeStruck(event) {
    onChangeStepChange(step.n, { struck: event.target.checked, line: entry ? entry.line : null });
  }

  function handleChangeLine(event) {
    const value = stripNewlines(event.target.value);
    onChangeStepChange(step.n, { struck: entry ? entry.struck : false, line: value === '' ? null : value });
  }

  return (
    <div className="method-step__recording">
      <label className="method-step__strike-control">
        <Checkbox
          checked={entry ? entry.struck : false}
          aria-label={fieldLabel(step, false, 'skipped')}
          onChange={handleChangeStruck}
        />
        <span>Skipped</span>
      </label>
      {line.isOpen ? (
        <label className="method-step__line-control">
          <span>Done differently</span>
          <textarea
            ref={line.fieldRef}
            rows="1"
            className="prose-field"
            value={entry && entry.line ? entry.line : ''}
            aria-label={fieldLabel(step, false, 'done differently')}
            onKeyDown={holdReturn}
            onChange={handleChangeLine}
            onBlur={line.handleBlur}
          />
        </label>
      ) : (
        <Button
          className="method-step__on-demand"
          aria-label={fieldLabel(step, false, 'done differently')}
          onClick={line.openField}
        >
          Done differently
        </Button>
      )}
    </div>
  );
}

// Whether the Instructions section renders at all (261003-9bz; Mark,
// 2026-10-03, option 1: hide the whole section rather than show a heading over
// nothing). It renders when there is at least one step. "Before you start" is a
// section of its own now and no longer keeps this one open (sketch 011 decision
// 36, Mark's answer 5, 2026-10-04: the Instructions heading leaves the reading
// view when there are no steps). Recording and Show changes need no exception:
// their only controls and marks (the strike, the line, the changed-line mark,
// the removed strike) hang on a step, so a method with no step has none to
// lose. The pen keeps the empty section, as asked (Mark, 2026-10-03), although
// it has no add-step control today. The creation editor keeps it too: the
// Instructions heading row carries Add step (Phase 11, sketch 013 decision 33).
export function showsMethodRegion({ mode, steps }) {
  return mode === 'developing' || mode === 'creating' || steps.length > 0;
}

// The numbered method, in the sheet's order. The step number sits in a
// fixed margin column so a Phase 2 batch record can point at exactly one
// step, and so the numbers stay put as prose reflows. Purpose (why the step
// exists) and aside (what to watch while doing it) are different fields,
// rendered only when present.
//
// stepChanges is the draft's while recording, the open batch's while
// reading, or an empty object when there is no batch layer at all — Method
// never imports a batch record itself, only reads through the tested
// isStruck/changedLineFor/stepChangeFor functions against a thin wrapper
// shaped like the object those functions expect (route-recipe-batch.md § 3,
// § 6; 02-CONTEXT.md D-13, D-23).
//
// While developing (03-02), a second render path takes over per step,
// opening read-only by default (03.3-03, 03.1 Gap 1 override): the
// step's prose, targets, purpose/aside and — on a removed step — the
// coverage cue render as plain text, with one "Edit this step" text
// control revealing the step's existing, unchanged editable form — text
// fields for leadIn/instruction/purpose/aside and each target chip, a
// "uses" checkbox list over the version's rows, a remove/restore control,
// the removed-row cross-flag, and the stale-amount flag — all read through
// uses.js and diff.js, never assembled by hand here (route-recipe-version.md
// § 3). The pen draws the draft's own order (sketch 017 CONTRACT section 3):
// `draftVersion.method`, so a step the maker moved stands where they put it, and
// a removed step still renders, struck, in the place the draft holds it.
// `steps` is the baseline (unfiltered) method in every other mode.
// `draftVersion` carries the maker's current edits and `baselineVersion` is the record the
// pen opened on (D-03) — `penDiff` is RecipePage's own one
// buildDiff(draftVersion, baselineVersion), computed once on the page and
// passed down here and to FormulationNote, never re-derived per field
// (critique P1 #2, RESEARCH.md Don't Hand-Roll).
export function Method({
  steps,
  stepChanges = {},
  mode = 'reading',
  onChangeStepChange = () => {},
  rows = [],
  draftVersion = null,
  baselineVersion = null,
  staleFlagVisible = false,
  // The pen's own precomputed comparison (critique P1 #2, build gap 1):
  // RecipePage's one buildDiff(draftVersion, baselineVersion) and the
  // stale-amount entries derived from it — computed once on the page, read
  // here and by FormulationNote's graduated rules, never recomputed.
  penDiff = null,
  penStaleSteps = [],
  // The show-changes state's precomputed comparison (route-recipe-version.md
  // § 3, § 6, 03-04): RecipePage's own one buildDiff of the version against
  // its live parent, and the stale-amount entries derived from it — never
  // recomputed here, so this state can never disagree with what the table
  // and the rules show elsewhere on the same page.
  changeDiff = null,
  staleSteps = [],
  showingChanges = false,
  onChangePenStepField = () => {},
  onChangePenStepTarget = () => {},
  onTogglePenStepUses = () => {},
  onTogglePenStepRemoved = () => {},
  // A step moved one place among the live steps (sketch 017 CONTRACT section 3):
  // RecipePage's handleMovePenStep, called with the step's stored key and 'up' or 'down'.
  onMovePenStep = () => {},
  // Cancel on an open step (sketch 011 decisions_recorded 5, decision 1;
  // Task 3): restores that ONE step from the version the pen opened on —
  // RecipePage.jsx's own restoreStepFromVersion, called with the stored
  // step key Method passes here.
  onRestorePenStep = () => {},
  // A refused Save that names a step field (bug-pen-saves-blank-lead-in): the block
  // { kind, n, index?, side?, attempt } and its message, or null. RecipeSheet passes
  // them as it passes a row block to IngredientTable.
  blockedStepTarget = null,
  blockedStepMessage = null,
  // The two maps RecipePage computes once through domain/stepNumbers.js
  // (03-10): currentStepNumbers from the method this component is showing
  // (the draft's while developing, the version's own otherwise);
  // baselineStepNumbers from the record a struck or removed step's number
  // comes from — null wherever neither the pen nor show-changes applies.
  currentStepNumbers = null,
  baselineStepNumbers = null,
}) {
  const batchLike = { churn: { stepChanges } };
  const isDeveloping = mode === 'developing' && draftVersion != null && baselineVersion != null;
  const isShowingChanges = !isDeveloping && showingChanges && changeDiff != null;
  const activeDiff = isDeveloping ? penDiff : changeDiff;
  const activeStaleSteps = isDeveloping ? penStaleSteps : staleSteps;

  // One step open at a time (sketch 011 decisions_recorded 5, Task 3):
  // Method's own state now, not StepPenBody's — opening a step closes
  // whichever other step was open, with its edits kept (Done does the
  // same). Reset whenever the pen itself closes, so a step cannot stay
  // "open" in memory across a save/cancel/reopen cycle.
  const [openStepN, setOpenStepN] = useState(null);
  useEffect(() => {
    if (!isDeveloping) setOpenStepN(null);
  }, [isDeveloping]);
  // A refused Save opens the step it names, so its field can be marked and focused (the pen's
  // D-21). A closed step draws no field. Opening closes any other open step with its edits kept,
  // as Edit this step does.
  useEffect(() => {
    if (blockedStepTarget) setOpenStepN(blockedStepTarget.n);
  }, [blockedStepTarget?.attempt]);

  function handleOpenStep(stepN) {
    setOpenStepN(stepN);
  }
  // bug-pen-step-done-drops-focus: Done closes the step and its own button goes with it, so focus fell
  // to the page. Done therefore leaves a request naming its step, and that step acts on it after the
  // render that drew its Edit this step again (the request pattern CreationPage's focusRequestRef uses).
  // Written only on the path that closes the step, so a refusal added here later leaves none behind.
  const editFocusRef = useRef(null);
  function takeEditFocus(stepN) {
    if (editFocusRef.current !== stepN) return false;
    editFocusRef.current = null;
    return true;
  }
  function handleDoneStep(stepN) {
    editFocusRef.current = stepN;
    setOpenStepN(null);
  }
  function handleCancelStep(stepN) {
    onRestorePenStep(stepN);
    setOpenStepN(null);
  }
  // A press on Move up or Move down. stepMoveWord is null for a step that is not live or a move
  // past an end, so a stale press does nothing and moveStep never throws inside a state update.
  // Focus stays on the same Move button of the moved step (sketch 017 CONTRACT section 3,
  // D-16): the press leaves a request, and the effect below acts on it after the render that
  // reordered the steps, never on a DOM node a keyed reorder moved.
  const { structureWord, announceStructure } = useStructureWord();
  const stepListRef = useRef(null);
  const moveRequestRef = useRef(null);
  function handleMoveStep(stepN, direction) {
    const word = stepMoveWord(draftVersion, stepN, direction);
    if (word === null) return;
    onMovePenStep(stepN, direction);
    moveRequestRef.current = { n: stepN, act: direction === 'up' ? 'move-up' : 'move-down' };
    announceStructure(word);
  }
  useEffect(() => {
    const request = moveRequestRef.current;
    if (!request) return;
    moveRequestRef.current = null;
    // The li is found by comparing ids among the list's own children, not by a selector built
    // from a stored key.
    const li = [...(stepListRef.current?.children ?? [])].find((child) => child.id === `method-step-${request.n}`);
    moveFocusTarget(li?.querySelector(':scope > .method-step__body > .method-step__acts') ?? null, request.act)?.focus();
  });
  const liveDraftSteps = isDeveloping ? liveSteps(draftVersion) : [];

  // The one place a step's displayed number is resolved (D-UAT-4,
  // D-UAT-5, G-03-14): its position in the current map if it has one,
  // else its position in the baseline map — the number it had before it
  // was removed — else none. The return value now carries WHICH frame
  // answered alongside the number: a bare integer let the pen and
  // show-changes print two different reference frames (a live step's
  // current position and a removed step's baseline one) in one
  // indistinguishable voice, which is the whole defect this closes. Every
  // call site below reads the frame and must not discard it — it is what
  // lets a removed step's number render differently from a live one
  // instead of the two blending together.
  function displayNumberFor(step) {
    const current = currentStepNumbers ? displayNumberOf(currentStepNumbers, step.n) : null;
    if (current != null) return { number: current, frame: 'current' };
    const baseline = baselineStepNumbers ? displayNumberOf(baselineStepNumbers, step.n) : null;
    if (baseline != null) return { number: baseline, frame: 'baseline' };
    return { number: null, frame: null };
  }

  // A field label names the step's own live position; a removed step's
  // fields now name the number it had before removal too (G-03-14,
  // D-UAT-5) — closing the ink-versus-announcement disagreement 03-10
  // closed for live steps and left open for removed ones, where a screen
  // reader learned a step was removed but never which one. A step with no
  // position in either version (already removed when the pen opened)
  // still names none — there is nothing to name.
  function fieldLabel(step, removed, name) {
    const { number } = displayNumberFor(step);
    if (removed) return number != null ? `Removed step ${number}, ${name}` : `Removed step, ${name}`;
    return `Step ${number}, ${name}`;
  }

  return (
    <>
      <h2 className="region-name">Instructions</h2>
      {/* role="list": Safari drops list semantics from a list-style none list
          (D-20; research C6), so the role is stated. */}
      <ol className="method-steps" role="list" ref={stepListRef}>
        {(isDeveloping ? draftVersion.method : steps).map((step) => {
          if (isDeveloping) {
            const draftStep = draftVersion.method.find((candidate) => candidate.n === step.n);
            const livePlace = liveDraftSteps.findIndex((candidate) => candidate.n === step.n);
            const stepDiff = activeDiff.steps.find((candidate) => candidate.n === step.n);
            const flaggedRows = removedRowsUsedBy(draftVersion, draftStep);
            const coveredRows = coveredRowsFor(draftVersion, draftStep);
            const staleEntry = activeStaleSteps.find((entry) => entry.n === step.n);
            // The margin (D-UAT-5, G-03-14): a number that came from the
            // BASELINE frame — a removed step — is not printed here. The
            // span still renders, empty, and app.css's :empty rule on the
            // number gives it one figure's width, so a removed step's words
            // start where the live steps' words start
            // (bug-pen-removed-step-words-shift-left). Empty is what the
            // pen already does for a step
            // removed before it opened; that treatment stops being one of
            // two side by side and becomes the pen's single rule. The pen
            // suppresses where show-changes marks (below) because in the
            // pen the step's prose sits in live editable fields — a strike
            // on the number would be the page's only strike and would read
            // as a state of the fields, not of the step.
            const marginInfo = displayNumberFor(step);

            return (
              <li key={step.n} id={`method-step-${step.n}`} className="method-step">
                <span className="method-step__n" aria-hidden="true">
                  {marginInfo.frame === 'current' ? marginInfo.number : null}
                </span>
                <StepPenBody
                  step={step}
                  draftStep={draftStep}
                  stepDiff={stepDiff}
                  rows={rows}
                  flaggedRows={flaggedRows}
                  coveredRows={coveredRows}
                  staleEntry={staleEntry}
                  staleFlagVisible={staleFlagVisible}
                  currentStepNumbers={currentStepNumbers}
                  fieldLabel={fieldLabel}
                  number={marginInfo.frame === 'current' ? marginInfo.number : null}
                  isOpen={openStepN === step.n}
                  onOpen={() => handleOpenStep(step.n)}
                  onDone={() => handleDoneStep(step.n)}
                  onCancel={() => handleCancelStep(step.n)}
                  takeEditFocus={() => takeEditFocus(step.n)}
                  onChangePenStepField={onChangePenStepField}
                  onChangePenStepTarget={onChangePenStepTarget}
                  onTogglePenStepUses={onTogglePenStepUses}
                  onTogglePenStepRemoved={onTogglePenStepRemoved}
                  moves={
                    livePlace === -1
                      ? null
                      : {
                          isFirst: livePlace === 0,
                          isLast: livePlace === liveDraftSteps.length - 1,
                          onMove: (direction) => handleMoveStep(step.n, direction),
                        }
                  }
                  blocked={blockedStepTarget?.n === step.n ? blockedStepTarget : null}
                  blockedMessage={blockedStepMessage}
                />
              </li>
            );
          }

          if (isShowingChanges) {
            const stepDiff = activeDiff.steps.find((candidate) => candidate.n === step.n);
            const staleEntry = activeStaleSteps.find((entry) => entry.n === step.n);
            // Driven only by the two fields this paragraph shows (03-09,
            // T-03-52), the same rule the pen uses above. Removal here is
            // marked the way the reading state already marks a skipped
            // step — the step's own prose struck in place — not by forcing
            // this paragraph, which would print the same sentence twice.
            //
            // A step absent from the parent has no parent text to strike:
            // buildDiff gives it textFrom: null (diff.js's contract) and every
            // *Changed flag true. It reads plain until Impeccable draws its
            // mark (G-03.5-2a).
            const isNewStep = stepDiff.textFrom == null;
            const showStruckBeneath = !isNewStep && (stepDiff.leadInChanged || stepDiff.instructionChanged);
            const showPurposeStruck = !isNewStep && stepDiff.purposeChanged && stepDiff.textFrom.purpose !== '';
            const showAsideStruck = !isNewStep && stepDiff.asideChanged && stepDiff.textFrom.aside !== '';
            // The margin (D-UAT-5, G-03-14): a number that came from the
            // BASELINE frame — the number the step had in the parent — is
            // printed here, unlike in the pen above, and carries the
            // struck modifier of its own class. A number from the CURRENT
            // frame renders unmarked as it does today.
            const marginInfo = displayNumberFor(step);

            return (
              <li key={step.n} id={`method-step-${step.n}`} className="method-step">
                <span
                  className={marginInfo.frame === 'baseline' ? 'method-step__n method-step__n--struck' : 'method-step__n'}
                  aria-hidden="true"
                >
                  {marginInfo.number}
                </span>
                <div className="method-step__body">
                  <p className="method-step__lead">
                    {/* A removed step's own prose strikes in place — the
                        same treatment the reading state's skipped step
                        uses, below — while a rewritten-but-not-removed
                        step's prose stays plain and gets its struck-beneath
                        paragraph instead: two different facts, two
                        different marks, never both on the same text. The
                        "removed" label is a sibling of the struck element,
                        never nested inside it, for the same reason the
                        reading state's "Skipped" label sits outside its
                        struck span. */}
                    <span className={step.removed ? 'method-step__prose--struck' : undefined}>
                      <b>{step.leadIn}.</b> {step.instruction}
                    </span>
                    {step.removed && <span className="method-step__skipped-label"> removed</span>}
                    {wasStepMark(stepDiff)}
                  </p>
                  {showStruckBeneath && (
                    <p className="prose-struck-beneath">
                      <b>{stepDiff.textFrom.leadIn}.</b> {stepDiff.textFrom.instruction}
                    </p>
                  )}

                  <StepTargets targets={step.targets} targetDiffs={stepDiff.targets} />

                  {/* The stale-amount flag, in the show-changes state too
                      (route-recipe-version.md § 3): the same visibility
                      prop the pen uses, and the same entries — never a
                      second derivation. */}
                  {staleFlagVisible && staleEntry && (
                    <p className="method-step__stale-flag">
                      {`amounts changed: ${staleEntry.changes
                        .map((change) => `${change.ingredientName} ${change.from} → ${change.to} g`)
                        .join('; ')}`}
                    </p>
                  )}

                  <StepPurpose text={step.purpose} />
                  {showPurposeStruck && <p className="prose-struck-beneath">{stepDiff.textFrom.purpose}</p>}
                  <StepAside text={step.aside} />
                  {showAsideStruck && <p className="prose-struck-beneath">{stepDiff.textFrom.aside}</p>}
                </div>
              </li>
            );
          }

          const struck = isStruck(batchLike, step.n);
          const changedLine = changedLineFor(batchLike, step.n);
          const entry = stepChangeFor(batchLike, step.n);

          return (
            <li key={step.n} id={`method-step-${step.n}`} className="method-step">
              <span className="method-step__n" aria-hidden="true">
                {displayNumberFor(step).number}
              </span>
              <div className="method-step__body">
                <p className="method-step__lead">
                  <span className={struck ? 'method-step__prose--struck' : undefined}>
                    <b>{step.leadIn}.</b> {step.instruction}
                  </span>
                  {/* The strike's requirement is a text label, not a drawn
                      line alone (route-recipe-batch.md § 6): a reader who
                      cannot see the line still reads that the step was
                      skipped. The label is a sibling of the struck span,
                      never a descendant of it — a decoration propagated
                      from an ancestor cannot be switched off by a
                      descendant (CSS Text Decoration L3), so being outside
                      the struck element is what keeps this label legible. */}
                  {struck && <span className="method-step__skipped-label"> Skipped</span>}
                </p>
                <StepTargets targets={step.targets} />
                <StepPurpose text={step.purpose} />
                <StepAside text={step.aside} />
                {mode !== 'recording' && changedLine && <p className="method-step__changed sheet-hand">{changedLine}</p>}
                {mode === 'recording' && (
                  <StepRecordingControls
                    step={step}
                    entry={entry}
                    onChangeStepChange={onChangeStepChange}
                    fieldLabel={fieldLabel}
                  />
                )}
              </div>
            </li>
          );
        })}
      </ol>
      {/* The pen's polite word (sketch 017 CONTRACT section 3): the place among the live
          steps, of their count. A div, not the creation editor's p: an empty p adds a
          paragraph break to the page's innerText, which the Phase 11 walk hashes. */}
      {isDeveloping && (
        <div className="visually-hidden" role="status" aria-live="polite">
          {structureWord}
        </div>
      )}
    </>
  );
}
