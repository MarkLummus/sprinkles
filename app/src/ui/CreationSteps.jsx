import { Button } from './Button.jsx';
import { FieldFeedback } from './FieldFeedback.jsx';
import { displayNumbers } from '../domain/stepNumbers.js';
import { liveSteps } from '../domain/creationSteps.js';

// The creation editor's Instructions region (Phase 11, MAKE-07, sketch 013
// decisions 32 and 33, sketch 014 instructions-steps.html): the heading row
// with Add step, then each live step drawn open with no box, its number level
// with its lead-in. A step's body is its own component so the state that
// belongs to one step (the preview, the on-demand purpose and aside) lives
// with it. Every stored string is a React text child, never markup.
function CreationStep({ step, number, onChangeStepField }) {
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
          <FieldFeedback required={step.leadIn.trim() === ''} />
        </label>
        <label className="method-step__field">
          <textarea
            className="prose-field"
            rows="2"
            value={step.instruction}
            aria-label={`Step ${number}, instruction`}
            onChange={(event) => onChangeStepField(step.n, 'instruction', event.target.value)}
          />
          <FieldFeedback required={step.instruction.trim() === ''} />
        </label>
      </div>
    </li>
  );
}

export function CreationSteps({ draft, onAddStep, onChangeStepField }) {
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
            <CreationStep key={step.n} step={step} number={numbers.get(step.n)} onChangeStepField={onChangeStepField} />
          ))}
        </ol>
      )}
    </>
  );
}
