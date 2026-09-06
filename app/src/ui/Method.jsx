import { isStruck, changedLineFor, stepChangeFor } from '../domain/batch.js';

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
export function Method({ steps, stepChanges = {}, mode = 'reading', onChangeStepChange = () => {} }) {
  const batchLike = { churn: { stepChanges } };

  return (
    <>
      <h2 className="region-name">Method</h2>
      <ol className="method-steps">
        {steps.map((step) => {
          const struck = isStruck(batchLike, step.n);
          const changedLine = changedLineFor(batchLike, step.n);
          const entry = stepChangeFor(batchLike, step.n);

          function handleChangeStruck(event) {
            onChangeStepChange(step.n, { struck: event.target.checked, line: entry ? entry.line : null });
          }

          function handleChangeLine(event) {
            const value = event.target.value;
            onChangeStepChange(step.n, { struck: entry ? entry.struck : false, line: value === '' ? null : value });
          }

          return (
            <li key={step.n} id={`method-step-${step.n}`} className="method-step">
              <span className="method-step__n" aria-hidden="true">
                {step.n}
              </span>
              <div className="method-step__body">
                <p className={struck ? 'method-step__lead method-step__lead--struck' : 'method-step__lead'}>
                  <b>{step.leadIn}.</b> {step.instruction}
                  {/* The strike's requirement is a text label, not a drawn
                      line alone (route-recipe-batch.md § 6): a reader who
                      cannot see the line still reads that the step was
                      skipped. */}
                  {struck && <span className="method-step__skipped-label"> Skipped</span>}
                </p>
                {step.targets?.length > 0 && (
                  <p className="method-step__targets">
                    {step.targets.map((target) => (
                      <span className="target-chip" key={target.label}>
                        <span className="target-chip__label">{target.label}</span>
                        <span className="target-chip__value">{target.value}</span>
                      </span>
                    ))}
                  </p>
                )}
                {step.purpose && <p className="method-step__purpose">{step.purpose}</p>}
                {step.aside && <p className="method-step__aside">{step.aside}</p>}
                {mode !== 'recording' && changedLine && <p className="method-step__changed ink-text">{changedLine}</p>}
                {mode === 'recording' && (
                  <div className="method-step__recording">
                    <label className="method-step__strike-control">
                      <input type="checkbox" checked={entry ? entry.struck : false} onChange={handleChangeStruck} />
                      <span>Skipped</span>
                    </label>
                    <label className="method-step__line-control">
                      <span>What did you do differently?</span>
                      <input
                        type="text"
                        className="ink-field"
                        value={entry && entry.line ? entry.line : ''}
                        aria-label={`Step ${step.n}, what was done differently`}
                        onChange={handleChangeLine}
                      />
                    </label>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </>
  );
}
