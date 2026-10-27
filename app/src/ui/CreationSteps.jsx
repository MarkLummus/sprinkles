import { useState } from 'react';
import { Button } from './Button.jsx';
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

// The uses line's sentence: the names of the rows the step uses, in the
// table's order, or that it uses nothing yet.
function usesSentence(step, rows) {
  const used = new Set(step.uses ?? []);
  const names = rows.filter((row) => used.has(row.id)).map((row) => row.ingredientName);
  return names.length > 0 ? `uses ${names.join(', ')}` : 'uses nothing yet';
}

function CreationStep({
  step,
  number,
  projected,
  rows,
  onChangeStepField,
  onAddTarget,
  onChangeTarget,
  onRemoveTarget,
}) {
  const [previewing, setPreviewing] = useState(false);
  const purpose = useOnDemandField(Boolean(step.purpose), () => onChangeStepField(step.n, 'purpose', ''));
  const aside = useOnDemandField(Boolean(step.aside), () => onChangeStepField(step.n, 'aside', ''));
  const targets = step.targets ?? [];

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
            onChange={(event) => onChangeStepField(step.n, 'leadIn', event.target.value)}
          />
          <FieldFeedback required={isBlank(step.leadIn)} />
        </label>
        <label className="method-step__field">
          <textarea
            className="prose-field"
            rows="2"
            value={step.instruction}
            aria-label={`Step ${number}, instruction`}
            onChange={(event) => onChangeStepField(step.n, 'instruction', event.target.value)}
          />
          <FieldFeedback required={isBlank(step.instruction)} />
        </label>
        <p className="method-step__targets">
          {targets.map((target, index) => (
            // The remove control sits inside its own chip, after the value field,
            // so Add target and Preview step stay the line's direct controls
            // (D-22; drawn on no board). A target with one side blank refuses
            // Save, so Required stands under that side (D-10); both blank is
            // dropped at Save.
            <span className="target-chip" key={index}>
              <input
                type="text"
                className="ink-field target-chip__label-field"
                value={target.label}
                aria-label={targetFieldName(number, targets.length, index, 'label')}
                onChange={(event) => onChangeTarget(step.n, index, 'label', event.target.value)}
              />
              <FieldFeedback required={isBlank(target.label) && !isBlank(target.value)} />
              <input
                type="text"
                className="ink-field target-chip__value-field"
                value={target.value}
                aria-label={targetFieldName(number, targets.length, index, 'value')}
                onChange={(event) => onChangeTarget(step.n, index, 'value', event.target.value)}
              />
              <FieldFeedback required={isBlank(target.value) && !isBlank(target.label)} />
              <Button
                className="text-control"
                aria-label={`Step ${number}, remove target ${index + 1}`}
                onClick={() => onRemoveTarget(step.n, index)}
              >
                remove
              </Button>
            </span>
          ))}
          <Button className="text-control" aria-label={`Step ${number}, add a target`} onClick={() => onAddTarget(step.n)}>
            Add target
          </Button>
          <Button
            className="text-control"
            aria-label={`Step ${number}, ${previewing ? 'hide the preview' : 'preview the step'}`}
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
        <p className="method-step__uses-line">
          {usesSentence(step, rows)}{' '}
          {!purpose.isOpen && (
            <Button className="text-control" aria-label={`Step ${number}, add a purpose`} onClick={purpose.openField}>
              add a purpose
            </Button>
          )}
          {!purpose.isOpen && !aside.isOpen && <span aria-hidden="true">·</span>}
          {!aside.isOpen && (
            <Button className="text-control" aria-label={`Step ${number}, add an aside`} onClick={aside.openField}>
              add an aside
            </Button>
          )}
        </p>
      </div>
    </li>
  );
}

export function CreationSteps({ draft, version, onAddStep, onChangeStepField, onAddTarget, onChangeTarget, onRemoveTarget }) {
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
          {steps.map((step) => (
            <CreationStep
              key={step.n}
              step={step}
              number={numbers.get(step.n)}
              projected={version.method.find((candidate) => candidate.n === step.n)}
              rows={version.rows}
              onChangeStepField={onChangeStepField}
              onAddTarget={onAddTarget}
              onChangeTarget={onChangeTarget}
              onRemoveTarget={onRemoveTarget}
            />
          ))}
        </ol>
      )}
    </>
  );
}
