// Pure. No framework, no DOM, no store import. The one comparison of two
// versions — see 03-CONTEXT.md D-03 (the baseline is the record the pen
// opened on) and route-recipe-version.md § 3 "The figures and the
// advisories answer live" (tracked changes, computed at display precision
// so a change no reader can see on the page is never reported as one).
// Never mutates either version, its rows, their embedded ingredient
// records, or method steps, and never sorts: the row descriptors follow
// current.rows order and the step descriptors follow current.method's own
// order (already ascending n).
import { computeBalance, formatShareOfBatch, formatGrams } from './composition.js';
import { buildFigures } from './figures.js';
import { activeRows, activeSteps } from './rows.js';

function activeMass(version) {
  const balance = computeBalance(activeRows(version));
  return balance ? balance.mass : 0;
}

function sameSet(a, b) {
  if (a.length !== b.length) return false;
  const bSet = new Set(b);
  return a.every((item) => bSet.has(item));
}

// version.targets is the recipe's authored bands (pac/pod/fat/msnf/solids),
// not editable by the pen in this milestone — compared here for
// completeness of the return shape rather than because it moves today.
function bandsEqual(a, b) {
  const aTargets = a ?? {};
  const bTargets = b ?? {};
  const aKeys = Object.keys(aTargets);
  const bKeys = Object.keys(bTargets);
  if (aKeys.length !== bKeys.length) return false;
  return aKeys.every((key) => {
    if (!Object.prototype.hasOwnProperty.call(bTargets, key)) return false;
    const [aLo, aHi] = aTargets[key];
    const [bLo, bHi] = bTargets[key];
    return aLo === bLo && aHi === bHi;
  });
}

function buildRowDiff(row, baseRow, currentMass, baselineMass) {
  if (!baseRow) {
    return {
      id: row.id,
      ingredientName: row.ingredientName,
      gramsFrom: null,
      gramsTo: row.grams,
      gramsChanged: true,
      shareFrom: null,
      shareTo: formatShareOfBatch(row.grams, currentMass),
      shareChanged: true,
      stepFrom: null,
      stepTo: row.step,
      stepChanged: true,
      removed: row.removed ?? false,
      removedChanged: true,
    };
  }
  const shareFrom = formatShareOfBatch(baseRow.grams, baselineMass);
  const shareTo = formatShareOfBatch(row.grams, currentMass);
  const removed = row.removed ?? false;
  const baseRemoved = baseRow.removed ?? false;
  return {
    id: row.id,
    ingredientName: row.ingredientName,
    gramsFrom: baseRow.grams,
    gramsTo: row.grams,
    gramsChanged: row.grams !== baseRow.grams,
    shareFrom,
    shareTo,
    shareChanged: shareTo !== shareFrom,
    stepFrom: baseRow.step,
    stepTo: row.step,
    stepChanged: row.step !== baseRow.step,
    removed,
    removedChanged: removed !== baseRemoved,
  };
}

// Matched by label, in current's chip order followed by any chip only the
// baseline carries — a chip present on one side and absent on the other
// still gets a descriptor, with null on the absent side.
function buildTargetDiff(currentTargets, baselineTargets) {
  const currentByLabel = new Map(currentTargets.map((target) => [target.label, target.value]));
  const baselineByLabel = new Map(baselineTargets.map((target) => [target.label, target.value]));
  const labels = [];
  for (const target of currentTargets) {
    if (!labels.includes(target.label)) labels.push(target.label);
  }
  for (const target of baselineTargets) {
    if (!labels.includes(target.label)) labels.push(target.label);
  }
  return labels.map((label) => {
    const from = baselineByLabel.has(label) ? baselineByLabel.get(label) : null;
    const to = currentByLabel.has(label) ? currentByLabel.get(label) : null;
    return { label, from, to, changed: from !== to };
  });
}

function buildStepDiff(step, baseStep) {
  if (!baseStep) {
    return {
      n: step.n,
      textChanged: true,
      leadInChanged: true,
      instructionChanged: true,
      purposeChanged: true,
      asideChanged: true,
      textFrom: null,
      targets: buildTargetDiff(step.targets ?? [], []),
      usesChanged: true,
      removed: step.removed ?? false,
      removedChanged: true,
    };
  }
  // An absent optional field and an empty-string one are the same fact —
  // nothing written — and must compare equal on both sides: a first
  // keystroke into an empty purpose/aside, deleted again, must not read as
  // a change from nothing to empty (03-09, T-03-54).
  const textFrom = {
    leadIn: baseStep.leadIn,
    instruction: baseStep.instruction,
    purpose: baseStep.purpose ?? '',
    aside: baseStep.aside ?? '',
  };
  const leadInChanged = step.leadIn !== baseStep.leadIn;
  const instructionChanged = step.instruction !== baseStep.instruction;
  const purposeChanged = (step.purpose ?? '') !== textFrom.purpose;
  const asideChanged = (step.aside ?? '') !== textFrom.aside;
  const textChanged = leadInChanged || instructionChanged || purposeChanged || asideChanged;
  const removed = step.removed ?? false;
  const baseRemoved = baseStep.removed ?? false;
  return {
    n: step.n,
    textChanged,
    leadInChanged,
    instructionChanged,
    purposeChanged,
    asideChanged,
    textFrom,
    targets: buildTargetDiff(step.targets ?? [], baseStep.targets ?? []),
    usesChanged: !sameSet(step.uses ?? [], baseStep.uses ?? []),
    removed,
    removedChanged: removed !== baseRemoved,
  };
}

/**
 * buildDiff(current, baseline) -> { versionLabelChanged, headnoteChanged,
 * rows, steps, targetsChanged, figures, total }. The one comparison of two
 * versions, computed at display precision so a change no reader can see is
 * never reported as one: shares compare formatShareOfBatch's own printed
 * string, figures compare value.toFixed(decimals). `rows` is one
 * descriptor per row of `current`, in `current.rows` order — a row absent
 * from `baseline` reports every `From` as null and every `Changed` as
 * true. `steps` is one descriptor per step of `current`, in
 * `current.method`'s own order (already ascending n); each step descriptor
 * carries `leadInChanged`/`instructionChanged`/`purposeChanged`/
 * `asideChanged`, one per text field, with `textChanged` computed as their
 * disjunction — never a separate four-way expression, so the aggregate can
 * never disagree with its parts. `textFrom` carries the baseline's four
 * text fields so a component can render the parent's text struck beneath
 * the field without re-reading the baseline itself; an absent `purpose` or
 * `aside` on the baseline carries as `''` on `textFrom`, and an absent
 * optional field compares equal to an empty-string one on both sides — a
 * first keystroke into an empty field, deleted again, is not a change.
 * `textFrom` stays `null` when there is no baseline step at all. `figures`
 * zips `buildFigures` over each side — each side filtered
 * through `activeRows`/`activeSteps` first, so a removed row or step never
 * reaches `computeBalance` — matched by `key`, in `FIGURE_SPECS` order; the
 * figure math is never re-derived. `total` compares each side's active
 * mass through `formatGrams`. Never mutates either version, its rows,
 * their embedded ingredient records, or method steps, and never sorts.
 */
export function buildDiff(current, baseline) {
  const currentMass = activeMass(current);
  const baselineMass = activeMass(baseline);

  const baselineRowById = new Map(baseline.rows.map((row) => [row.id, row]));
  const rows = current.rows.map((row) => buildRowDiff(row, baselineRowById.get(row.id), currentMass, baselineMass));

  const baselineStepByN = new Map(baseline.method.map((step) => [step.n, step]));
  const steps = current.method.map((step) => buildStepDiff(step, baselineStepByN.get(step.n)));

  const currentFigures = buildFigures({ ...current, rows: activeRows(current), method: activeSteps(current) });
  const baselineFigures = buildFigures({ ...baseline, rows: activeRows(baseline), method: activeSteps(baseline) });
  const baselineFigureByKey = new Map(baselineFigures.map((figure) => [figure.key, figure]));
  const figures = currentFigures.map((figure) => {
    const baseFigure = baselineFigureByKey.get(figure.key);
    const from = baseFigure ? baseFigure.value : null;
    const to = figure.value;
    const changed = baseFigure ? to.toFixed(figure.decimals) !== from.toFixed(figure.decimals) : true;
    return { key: figure.key, label: figure.label, unit: figure.unit, decimals: figure.decimals, from, to, changed };
  });

  const total = {
    from: formatGrams(baselineMass),
    to: formatGrams(currentMass),
    changed: formatGrams(baselineMass) !== formatGrams(currentMass),
  };

  return {
    versionLabelChanged: current.versionLabel !== baseline.versionLabel,
    headnoteChanged: current.headnote !== baseline.headnote,
    rows,
    steps,
    targetsChanged: !bandsEqual(current.targets, baseline.targets),
    figures,
    total,
  };
}
