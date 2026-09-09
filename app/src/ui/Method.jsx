import { isStruck, changedLineFor, stepChangeFor } from '../domain/batch.js';
import { removedRowsUsedBy, coveredRowsFor, stepsWithStaleAmounts } from '../domain/uses.js';
import { buildDiff } from '../domain/diff.js';
import { displayNumberOf } from '../domain/stepNumbers.js';

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
  const penDiff = isDeveloping ? buildDiff(draftVersion, baselineVersion) : null;
  const penStaleSteps = isDeveloping ? stepsWithStaleAmounts(draftVersion, baselineVersion) : [];
  const isShowingChanges = !isDeveloping && showingChanges && changeDiff != null;
  const activeDiff = isDeveloping ? penDiff : changeDiff;
  const activeStaleSteps = isDeveloping ? penStaleSteps : staleSteps;

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
      <h2 className="region-name">Method</h2>
      <ol className="method-steps">
        {steps.map((step) => {
          if (isDeveloping) {
            const draftStep = draftVersion.method.find((candidate) => candidate.n === step.n);
            const stepDiff = activeDiff.steps.find((candidate) => candidate.n === step.n);
            const flaggedRows = removedRowsUsedBy(draftVersion, draftStep);
            const coveredRows = coveredRowsFor(draftVersion, draftStep);
            const staleEntry = activeStaleSteps.find((entry) => entry.n === step.n);
            // Driven only by the two fields this paragraph actually shows
            // (03-09, T-03-52). Unlike GramsCell's forced strike on a
            // removed row — where the number may ALSO have changed, so the
            // struck baseline value is still informative — a removed step's
            // prose has not changed at all; forcing the strike here printed
            // the same sentence twice. Removal is marked by the "removed"
            // label alone, a sibling of this paragraph, never by reusing
            // the changed-text device.
            const showStruckBeneath = stepDiff.leadInChanged || stepDiff.instructionChanged;
            const showPurposeStruck = stepDiff.purposeChanged && stepDiff.textFrom.purpose !== '';
            const showAsideStruck = stepDiff.asideChanged && stepDiff.textFrom.aside !== '';
            // The margin (D-UAT-5, G-03-14): a number that came from the
            // BASELINE frame — a removed step — is not printed here. The
            // span still renders so the two-column grid never shifts, but
            // stays empty, which is what the pen already does for a step
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
                <div className="method-step__body">
                  <label className="method-step__field">
                    <input
                      type="text"
                      className="prose-field prose-field--lead-in"
                      value={draftStep.leadIn}
                      aria-label={fieldLabel(step, draftStep.removed, 'lead-in')}
                      onChange={(event) => onChangePenStepField(step.n, 'leadIn', event.target.value)}
                    />
                  </label>
                  <label className="method-step__field">
                    <textarea
                      className="prose-field"
                      rows="2"
                      value={draftStep.instruction}
                      aria-label={fieldLabel(step, draftStep.removed, 'instruction')}
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
                              aria-label={fieldLabel(step, draftStep.removed, `target ${index + 1}, label`)}
                              onChange={(event) => onChangePenStepTarget(step.n, index, 'label', event.target.value)}
                            />
                            <input
                              type="text"
                              className="ink-field target-chip__value-field"
                              value={target.value}
                              aria-label={fieldLabel(step, draftStep.removed, `target ${index + 1}, value`)}
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
                    <textarea
                      className="prose-field"
                      rows="2"
                      value={draftStep.purpose ?? ''}
                      aria-label={fieldLabel(step, draftStep.removed, 'purpose')}
                      onChange={(event) => onChangePenStepField(step.n, 'purpose', event.target.value)}
                    />
                  </label>
                  {/* Each of the four text fields strikes only its own
                      parent value, beneath itself, when that field moved —
                      never the lead-in/instruction pair (03-09). */}
                  {showPurposeStruck && <p className="prose-struck-beneath">{stepDiff.textFrom.purpose}</p>}
                  <label className="method-step__field">
                    <textarea
                      className="prose-field"
                      rows="2"
                      value={draftStep.aside ?? ''}
                      aria-label={fieldLabel(step, draftStep.removed, 'aside')}
                      onChange={(event) => onChangePenStepField(step.n, 'aside', event.target.value)}
                    />
                  </label>
                  {showAsideStruck && <p className="prose-struck-beneath">{stepDiff.textFrom.aside}</p>}

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
                      <button type="button" onClick={() => onTogglePenStepRemoved(step.n)}>
                        remove this step
                      </button>
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

                  <button type="button" onClick={() => onTogglePenStepRemoved(step.n)}>
                    {draftStep.removed ? 'restore' : 'remove'}
                  </button>
                </div>
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
            const showStruckBeneath = stepDiff.leadInChanged || stepDiff.instructionChanged;
            const showPurposeStruck = stepDiff.purposeChanged && stepDiff.textFrom.purpose !== '';
            const showAsideStruck = stepDiff.asideChanged && stepDiff.textFrom.aside !== '';
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
                  </p>
                  {showStruckBeneath && (
                    <p className="prose-struck-beneath">
                      <b>{stepDiff.textFrom.leadIn}.</b> {stepDiff.textFrom.instruction}
                    </p>
                  )}

                  {step.targets?.length > 0 && (
                    <p className="method-step__targets">
                      {step.targets.map((target, index) => {
                        const targetDiff = stepDiff.targets[index];
                        return (
                          <span className="target-chip" key={target.label}>
                            {targetDiff?.changed && targetDiff.from != null && (
                              <span className="struck-value">{`${targetDiff.label} ${targetDiff.from}`}</span>
                            )}
                            <span className="target-chip__label">{target.label}</span>
                            <span className="target-chip__value">{target.value}</span>
                          </span>
                        );
                      })}
                    </p>
                  )}

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

                  {step.purpose && <p className="method-step__purpose">{step.purpose}</p>}
                  {showPurposeStruck && <p className="prose-struck-beneath">{stepDiff.textFrom.purpose}</p>}
                  {step.aside && <p className="method-step__aside">{step.aside}</p>}
                  {showAsideStruck && <p className="prose-struck-beneath">{stepDiff.textFrom.aside}</p>}
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
                        aria-label={fieldLabel(step, false, 'what was done differently')}
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
