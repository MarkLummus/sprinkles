import { useRef, useState } from 'react';
import { Button } from './Button.jsx';
import { Checkbox } from './Checkbox.jsx';
import { FieldFeedback } from './FieldFeedback.jsx';
import { useOnDemandField } from './Method.jsx';
import { StepReading } from './StepReading.jsx';
import { displayNumbers } from '../domain/stepNumbers.js';
import { liveSteps } from '../domain/creationSteps.js';

// The creation editor's Instructions region (Phase 11, MAKE-07, sketch 013
// decisions 32 to 34, sketch 014 instructions-steps.html): the heading row with
// Add step, then each live step drawn open with no box, its number level with
// its lead-in. A step's body is its own component so the state that belongs to
// one step (the preview, the on-demand purpose and aside) lives with it. Every
// stored string is a React text child, never markup.

const isBlank = (text) => text.trim() === '';

// One target field's accessible name: the board's own for a step with one
// target, and by place for a step with several, as GramsCell names a split
// row's lines.
function targetFieldName(number, count, index, side) {
  return count === 1 ? `Step ${number}, target ${side}` : `Step ${number}, target ${index + 1} ${side}`;
}

// The uses line's sentence: the names of the rows the step uses, in the step's
// own order (its uses list, which is also the order of its rows in the table:
// CONTRACT section 2), or that it uses nothing yet. A row the Sheet leaves out
// (its library entry is gone) is left out here too.
function usesSentence(step, rows) {
  const nameById = new Map(rows.map((row) => [row.id, row.ingredientName]));
  const names = (step.uses ?? []).filter((id) => nameById.has(id)).map((id) => nameById.get(id));
  return names.length > 0 ? `uses ${names.join(', ')}` : 'uses nothing yet';
}

function CreationStep({
  step,
  number,
  isFirst,
  isLast,
  projected,
  rows,
  saveMessages,
  onAddStep,
  onRemoveStep,
  onMoveStep,
  onChangeStepField,
  onAddTarget,
  onChangeTarget,
  onRemoveTarget,
  onToggleUses,
}) {
  const [previewing, setPreviewing] = useState(false);
  // The Uses checklist is open or closed per step, and local to it.
  const [usesOpen, setUsesOpen] = useState(false);
  const usesControlRef = useRef(null);
  const purpose = useOnDemandField(Boolean(step.purpose), () => onChangeStepField(step.n, 'purpose', ''));
  const aside = useOnDemandField(Boolean(step.aside), () => onChangeStepField(step.n, 'aside', ''));
  const targets = step.targets ?? [];
  // A refused Save's sentence for a field (Phase 11, D-10, D-11), by the gate's
  // block id; the field carries it as its error, invalid and described by it.
  const leadError = saveMessages?.get(`lead:${step.n}`) ?? null;
  const instructionError = saveMessages?.get(`instruction:${step.n}`) ?? null;
  const leadErrorId = `create-step-${step.n}-lead-error`;
  const instructionErrorId = `create-step-${step.n}-instruction-error`;

  // Escape inside the uses line or the checklist closes the checklist and
  // returns focus to its toggle (Method.jsx's pen, the same shape). Gated on
  // the checklist being open, so a closed one lets the key travel on.
  function handleUsesKeyDown(event) {
    if (!usesOpen || event.key !== 'Escape') return;
    event.stopPropagation();
    setUsesOpen(false);
    usesControlRef.current?.focus();
  }

  return (
    <li className="method-step mk-step" data-step={step.n}>
      <span className="method-step__n" aria-hidden="true">
        {number}
      </span>
      <div className="method-step__body">
        <label className="method-step__field">
          <input
            type="text"
            className="prose-field prose-field--lead-in"
            data-field="lead-in"
            value={step.leadIn}
            aria-label={`Step ${number}, lead-in`}
            aria-invalid={leadError ? 'true' : undefined}
            aria-describedby={leadError ? leadErrorId : undefined}
            onChange={(event) => onChangeStepField(step.n, 'leadIn', event.target.value)}
          />
          <FieldFeedback error={leadError} errorId={leadErrorId} required={isBlank(step.leadIn)} />
        </label>
        <label className="method-step__field">
          <textarea
            className="prose-field"
            rows="2"
            value={step.instruction}
            aria-label={`Step ${number}, instruction`}
            aria-invalid={instructionError ? 'true' : undefined}
            aria-describedby={instructionError ? instructionErrorId : undefined}
            onChange={(event) => onChangeStepField(step.n, 'instruction', event.target.value)}
          />
          <FieldFeedback error={instructionError} errorId={instructionErrorId} required={isBlank(step.instruction)} />
        </label>
        <p className="method-step__targets">
          {targets.map((target, index) => {
            const labelError = saveMessages?.get(`target:${step.n}:${index}:label`) ?? null;
            const valueError = saveMessages?.get(`target:${step.n}:${index}:value`) ?? null;
            const labelErrorId = `create-step-${step.n}-target-${index}-label-error`;
            const valueErrorId = `create-step-${step.n}-target-${index}-value-error`;
            // The remove control sits inside its own chip, after the value field,
            // so Add target and Preview step stay the line's direct controls
            // (D-22; drawn on no board). A target with one side blank refuses
            // Save, so Required stands under that side (D-10); both blank is
            // dropped at Save.
            return (
              <span className="target-chip" key={index}>
                <input
                  type="text"
                  className="ink-field target-chip__label-field"
                  value={target.label}
                  aria-label={targetFieldName(number, targets.length, index, 'label')}
                  aria-invalid={labelError ? 'true' : undefined}
                  aria-describedby={labelError ? labelErrorId : undefined}
                  onChange={(event) => onChangeTarget(step.n, index, 'label', event.target.value)}
                />
                <FieldFeedback error={labelError} errorId={labelErrorId} required={isBlank(target.label) && !isBlank(target.value)} />
                <input
                  type="text"
                  className="ink-field target-chip__value-field"
                  value={target.value}
                  aria-label={targetFieldName(number, targets.length, index, 'value')}
                  aria-invalid={valueError ? 'true' : undefined}
                  aria-describedby={valueError ? valueErrorId : undefined}
                  onChange={(event) => onChangeTarget(step.n, index, 'value', event.target.value)}
                />
                <FieldFeedback error={valueError} errorId={valueErrorId} required={isBlank(target.value) && !isBlank(target.label)} />
                <Button
                  className="text-control"
                  aria-label={`Step ${number}, remove target ${index + 1}`}
                  onClick={() => onRemoveTarget(step.n, index)}
                >
                  Remove
                </Button>
              </span>
            );
          })}
          <Button className="text-control" aria-label={`Step ${number}, Add target`} onClick={() => onAddTarget(step.n)}>
            Add target
          </Button>
          <Button
            className="text-control"
            aria-label={`Step ${number}, ${previewing ? 'Hide preview' : 'Preview step'}`}
            onClick={() => setPreviewing((open) => !open)}
          >
            {previewing ? 'Hide preview' : 'Preview step'}
          </Button>
        </p>
        {purpose.isOpen && (
          <label className="method-step__field">
            <textarea
              ref={purpose.fieldRef}
              className="prose-field"
              rows="2"
              value={step.purpose ?? ''}
              aria-label={`Step ${number}, purpose`}
              onChange={(event) => onChangeStepField(step.n, 'purpose', event.target.value)}
              onBlur={purpose.handleBlur}
            />
          </label>
        )}
        {aside.isOpen && (
          <label className="method-step__field">
            <textarea
              ref={aside.fieldRef}
              className="prose-field"
              rows="2"
              value={step.aside ?? ''}
              aria-label={`Step ${number}, aside`}
              onChange={(event) => onChangeStepField(step.n, 'aside', event.target.value)}
              onBlur={aside.handleBlur}
            />
          </label>
        )}
        {previewing && projected && (
          // The step as the Sheet shows it, in the printed treatment (sketch 013
          // decision 34, decision 014 2): the projected step, so a target with
          // one side blank and an empty purpose or aside read as the Sheet reads
          // them.
          <div className="mk-preview" role="group" aria-label={`Step ${number}, preview`}>
            <p className="mk-preview__cue">Preview</p>
            <ol className="method-steps">
              <StepReading step={projected} number={number} />
            </ol>
          </div>
        )}
        <p className="method-step__uses-line" onKeyDown={handleUsesKeyDown}>
          {usesSentence(step, rows)}{' '}
          <Button
            className="text-control"
            ref={usesControlRef}
            aria-label={`Step ${number}, ${usesOpen ? 'done' : 'change ingredients'}`}
            onClick={() => setUsesOpen((open) => !open)}
          >
            {usesOpen ? 'Done' : 'Change ingredients'}
          </Button>
          {!purpose.isOpen && (
            <>
              <span aria-hidden="true">·</span>
              <Button className="text-control" aria-label={`Step ${number}, add purpose`} onClick={purpose.openField}>
                Add purpose
              </Button>
            </>
          )}
          {!aside.isOpen && (
            <>
              <span aria-hidden="true">·</span>
              <Button className="text-control" aria-label={`Step ${number}, add aside`} onClick={aside.openField}>
                Add aside
              </Button>
            </>
          )}
        </p>
        {usesOpen && (
          // Every row of the table, in the table's order, whatever the step's own
          // order: ticking one makes the step use it, the row joining the end of
          // the step's uses.
          <fieldset className="method-step__uses" aria-label={`Step ${number}, uses`} onKeyDown={handleUsesKeyDown}>
            <legend>Uses</legend>
            {rows.map((row) => (
              <label key={row.id} className="method-step__uses-item">
                <Checkbox checked={(step.uses ?? []).includes(row.id)} onChange={() => onToggleUses(step.n, row.id)} />
                <span>{row.ingredientName}</span>
              </label>
            ))}
          </fieldset>
        )}
        {/* The step's own structure controls (Phase 11, STRUCT-01 to STRUCT-03,
            sketch 014 add-remove-move.html). A move that cannot act is .mk-off
            and aria-disabled: it stays in the tab order and does nothing (D-16).
            Add step here adds right after this step. */}
        <p className="method-step__acts">
          <Button className="text-control" data-act="remove" aria-label={`Step ${number}, remove`} onClick={() => onRemoveStep(step.n)}>
            Remove
          </Button>
          <span aria-hidden="true">·</span>
          <Button
            className={isFirst ? 'text-control mk-off' : 'text-control'}
            data-act="move-up"
            aria-label={`Step ${number}, move up`}
            aria-disabled={isFirst ? 'true' : undefined}
            onClick={isFirst ? undefined : () => onMoveStep(step.n, 'up')}
          >
            Move up
          </Button>
          <span aria-hidden="true">·</span>
          <Button
            className={isLast ? 'text-control mk-off' : 'text-control'}
            data-act="move-down"
            aria-label={`Step ${number}, move down`}
            aria-disabled={isLast ? 'true' : undefined}
            onClick={isLast ? undefined : () => onMoveStep(step.n, 'down')}
          >
            Move down
          </Button>
          <span aria-hidden="true">·</span>
          <Button
            className="text-control"
            data-act="add-after"
            aria-label={`Step ${number}, Add step after it`}
            onClick={() => onAddStep(step.n)}
          >
            Add step
          </Button>
        </p>
      </div>
    </li>
  );
}

export function CreationSteps({
  draft,
  version,
  saveMessages = null,
  onAddStep,
  onRemoveStep,
  onMoveStep,
  onChangeStepField,
  onAddTarget,
  onChangeTarget,
  onRemoveTarget,
  onToggleUses,
}) {
  const steps = liveSteps(draft);
  const numbers = displayNumbers(draft.method);
  return (
    <>
      <div className="mk-head-row">
        <h2 className="region-name">Instructions</h2>
        <Button className="text-control mk-head-act" onClick={() => onAddStep(null)}>
          Add step
        </Button>
      </div>
      {steps.length > 0 && (
        <ol className="method-steps">
          {steps.map((step, index) => (
            <CreationStep
              key={step.n}
              step={step}
              number={numbers.get(step.n)}
              isFirst={index === 0}
              isLast={index === steps.length - 1}
              projected={version.method.find((candidate) => candidate.n === step.n)}
              rows={version.rows}
              saveMessages={saveMessages}
              onAddStep={onAddStep}
              onRemoveStep={onRemoveStep}
              onMoveStep={onMoveStep}
              onChangeStepField={onChangeStepField}
              onAddTarget={onAddTarget}
              onChangeTarget={onChangeTarget}
              onRemoveTarget={onRemoveTarget}
              onToggleUses={onToggleUses}
            />
          ))}
        </ol>
      )}
    </>
  );
}
