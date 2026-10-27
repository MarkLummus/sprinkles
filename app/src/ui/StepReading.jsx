// A read-only step in the printed treatment, on the screen classes (decision
// 014 2, sketch 010 D18; PrintInstructions in PrintSheetPages.jsx is the
// grammar it adopts): the targets as a tag row with no box, the purpose as the
// caps word "why", an em dash and the sentence, the aside as a callout. Every
// stored string is a React text child, never markup. The reading page, the
// version pen's closed steps and Show changes (Method.jsx) and the creation
// editor's Preview all draw their steps through these four.

// `targetDiffs` is diff.js's [{ label, from, to, changed }] list; without it
// the step's own targets read plain. The decision to draw belongs to the list
// drawn here, never to the step's own targets, because a step whose only
// target was removed has none of its own and still reads that target struck.
// A changed target reads its label once, the old value struck, then the new
// value; a removed one is a single struck tag; an added one reads plain (D-18,
// D-26).
// `targetDiffs` is diff.js's [{ label, from, to, changed }] list; without it
// the step's own targets read plain. The decision to draw belongs to the list
// drawn here, never to the step's own targets, because a step whose only
// target was removed has none of its own and still reads that target struck.
// A changed target reads its label once, the old value struck, then the new
// value; a removed one is a single struck tag; an added one reads plain (D-18,
// D-26).
export function StepTargets({ targets, targetDiffs = null }) {
  const list = targetDiffs ?? targets ?? [];
  if (list.length === 0) return null;
  return (
    <p className="method-step__targets method-step__targets--tags">
      {list.map((entry, index) => {
        if (targetDiffs && entry.to === null) {
          return (
            <span className="target-chip" key={index}>
              <span className="struck-value">{`${entry.label} ${entry.from}`}</span>
            </span>
          );
        }
        const value = targetDiffs ? entry.to : entry.value;
        return (
          <span className="target-chip" key={index}>
            <span className="target-chip__label">{entry.label}</span>
            {targetDiffs && entry.changed && entry.from !== null && <span className="struck-value">{entry.from}</span>}
            <span className="target-chip__value">{value}</span>
          </span>
        );
      })}
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
