import { isStruck, changedLineFor, stepChangeFor } from '../domain/batch.js';
import { removedRowsUsedBy, stepsWithStaleAmounts } from '../domain/uses.js';
import { buildDiff } from '../domain/diff.js';

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
// While developing (03-02), a second render path takes over per step: text
// fields for leadIn/instruction/purpose/aside and each target chip, a
// "uses" checkbox list over the version's rows, a remove/restore control,
// the removed-row cross-flag, and the stale-amount flag — all read through
// uses.js and diff.js, never assembled by hand here (route-recipe-version.md
// § 3). `steps` is the baseline (unfiltered) method in that mode, so a
// removed step still renders, struck, in its original place; `draftVersion`
// carries the maker's current edits and `baselineVersion` is the record the
// pen opened on (D-03) — buildDiff(draftVersion, baselineVersion) is the
// one comparison, never re-derived per field.
export function Method({
  steps,
  stepChanges = {},
  mode = 'reading',
  onChangeStepChange = () => {},
  rows = [],
  draftVersion = null,
  baselineVersion = null,
  staleFlagVisible = false,
  onChangePenStepField = () => {},
  onChangePenStepTarget = () => {},
  onTogglePenStepUses = () => {},
  onTogglePenStepRemoved = () => {},
}) {
  const batchLike = { churn: { stepChanges } };
  const isDeveloping = mode === 'developing' && draftVersion != null && baselineVersion != null;
  const diff = isDeveloping ? buildDiff(draftVersion, baselineVersion) : null;
  const staleSteps = isDeveloping ? stepsWithStaleAmounts(draftVersion, baselineVersion) : [];

  return (
    <>
      <h2 className="region-name">Method</h2>
      <ol className="method-steps">
        {steps.map((step) => {
          if (isDeveloping) {
            const draftStep = draftVersion.method.find((candidate) => candidate.n === step.n);
            const stepDiff = diff.steps.find((candidate) => candidate.n === step.n);
            const flaggedRows = removedRowsUsedBy(draftVersion, draftStep);
            const staleEntry = staleSteps.find((entry) => entry.n === step.n);
            // Forced struck even when the text itself is unchanged once the
            // step is removed — "its prose struck" — while the fields stay
            // present and editable, mirroring GramsCell's forced strike on
            // a removed row (03-02).
            const showStruckBeneath = stepDiff.textChanged || draftStep.removed;

            return (
              <li key={step.n} id={`method-step-${step.n}`} className="method-step">
                <span className="method-step__n" aria-hidden="true">
                  {step.n}
                </span>
                <div className="method-step__body">
                  <label className="method-step__field">
                    <span>Lead-in</span>
                    <input
                      type="text"
                      className="ink-field"
                      value={draftStep.leadIn}
                      aria-label={`Step ${step.n}, lead-in`}
                      onChange={(event) => onChangePenStepField(step.n, 'leadIn', event.target.value)}
                    />
                  </label>
                  <label className="method-step__field">
                    <span>Instruction</span>
                    <textarea
                      className="ink-field"
                      rows="2"
                      value={draftStep.instruction}
                      aria-label={`Step ${step.n}, instruction`}
                      onChange={(event) => onChangePenStepField(step.n, 'instruction', event.target.value)}
                    />
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

                  {draftStep.targets?.length > 0 && (
                    <p className="method-step__targets">
                      {draftStep.targets.map((target, index) => {
                        const targetDiff = stepDiff.targets[index];
                        return (
                          <span className="target-chip" key={index}>
                            {targetDiff?.changed && targetDiff.from != null && (
                              <span className="struck-value">{`${targetDiff.label} ${targetDiff.from}`}</span>
                            )}
                            <input
                              type="text"
                              className="ink-field target-chip__label-field"
                              value={target.label}
                              aria-label={`Step ${step.n}, target ${index + 1}, label`}
                              onChange={(event) => onChangePenStepTarget(step.n, index, 'label', event.target.value)}
                            />
                            <input
                              type="text"
                              className="ink-field target-chip__value-field"
                              value={target.value}
                              aria-label={`Step ${step.n}, target ${index + 1}, value`}
                              onChange={(event) => onChangePenStepTarget(step.n, index, 'value', event.target.value)}
                            />
                          </span>
                        );
                      })}
                    </p>
                  )}

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

                  <label className="method-step__field">
                    <span>Purpose</span>
                    <textarea
                      className="ink-field"
                      rows="2"
                      value={draftStep.purpose ?? ''}
                      aria-label={`Step ${step.n}, purpose`}
                      onChange={(event) => onChangePenStepField(step.n, 'purpose', event.target.value)}
                    />
                  </label>
                  <label className="method-step__field">
                    <span>Aside</span>
                    <textarea
                      className="ink-field"
                      rows="2"
                      value={draftStep.aside ?? ''}
                      aria-label={`Step ${step.n}, aside`}
                      onChange={(event) => onChangePenStepField(step.n, 'aside', event.target.value)}
                    />
                  </label>

                  <fieldset className="method-step__uses">
                    <legend>Uses</legend>
                    {rows.map((row) => (
                      <label key={row.id} className="method-step__uses-item">
                        <input
                          type="checkbox"
                          checked={(draftStep.uses ?? []).includes(row.id)}
                          onChange={() => onTogglePenStepUses(step.n, row.id)}
                        />
                        <span>{row.ingredientName}</span>
                      </label>
                    ))}
                  </fieldset>

                  {/* The removed-row cross-flag (route-recipe-version.md
                      § 3): beneath the step, naming the removed row(s) it
                      still names in its own uses list, with one
                      "remove this step" control. One tap, that step only —
                      removal never cascades. */}
                  {flaggedRows.length > 0 && (
                    <p className="method-step__flag">
                      {`uses ${flaggedRows.map((row) => row.ingredientName).join(', ')}, which ${
                        flaggedRows.length > 1 ? 'are' : 'is'
                      } removed`}{' '}
                      <button type="button" onClick={() => onTogglePenStepRemoved(step.n)}>
                        remove this step
                      </button>
                    </p>
                  )}

                  <button type="button" onClick={() => onTogglePenStepRemoved(step.n)}>
                    {draftStep.removed ? 'restore' : 'remove'}
                  </button>
                </div>
              </li>
            );
          }

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
