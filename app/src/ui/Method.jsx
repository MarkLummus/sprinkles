// The numbered method, in the sheet's order. The step number sits in a
// fixed margin column so a Phase 2 batch record can point at exactly one
// step, and so the numbers stay put as prose reflows. Purpose (why the step
// exists) and aside (what to watch while doing it) are different fields,
// rendered only when present.
export function Method({ steps }) {
  return (
    <>
      <h2 className="region-name">Method</h2>
      <ol className="method-steps">
        {steps.map((step) => (
          <li key={step.n} id={`method-step-${step.n}`} className="method-step">
            <span className="method-step__n" aria-hidden="true">
              {step.n}
            </span>
            <div className="method-step__body">
              <p className="method-step__lead">
                <b>{step.leadIn}.</b> {step.instruction}
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
            </div>
          </li>
        ))}
      </ol>
    </>
  );
}
