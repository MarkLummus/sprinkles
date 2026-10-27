// A read-only step in the printed treatment, on the screen classes (decision
// 014 2, sketch 010 D18; PrintInstructions in PrintSheetPages.jsx is the
// grammar it adopts): the targets as a tag row with no box, the purpose as the
// caps word "why", an em dash and the sentence, the aside as a callout. Every
// stored string is a React text child, never markup. The reading page, the
// version pen's closed steps and Show changes (Method.jsx) and the creation
// editor's Preview all draw their steps through these four.

export function StepTargets({ targets, targetDiffs = null }) {
  const list = targetDiffs ?? targets ?? [];
  if (list.length === 0) return null;
  return (
    <p className="method-step__targets method-step__targets--tags">
      {list.map((entry, index) => (
        <span className="target-chip" key={index}>
          <span className="target-chip__label">{entry.label}</span>
          <span className="target-chip__value">{entry.value}</span>
        </span>
      ))}
    </p>
  );
}

export function StepPurpose({ text }) {
  if (!text) return null;
  return (
    <p className="method-step__purpose">
      <span className="method-step__purpose-label">why</span> — {text}
    </p>
  );
}

export function StepAside({ text }) {
  if (!text) return null;
  return <p className="method-step__aside">{text}</p>;
}

export function StepReading({ step, number }) {
  return (
    <li className="method-step">
      <span className="method-step__n" aria-hidden="true">
        {number}
      </span>
      <div className="method-step__body">
        <p className="method-step__lead">
          <span>
            <b>{step.leadIn}.</b> {step.instruction}
          </span>
        </p>
        <StepTargets targets={step.targets} />
        <StepPurpose text={step.purpose} />
        <StepAside text={step.aside} />
      </div>
    </li>
  );
}
