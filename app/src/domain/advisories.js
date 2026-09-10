// Pure. No framework, no DOM, no store import. The four FORM2-02
// structural advisories, reimplemented (not imported) from the
// old-sprinkles slice's advisories.js — read there as evidence for the
// math's shape only, extended in two ways this phase's brief requires:
// the hydration advisory also names a method step whose typed target
// reaches the conflicting temperature, and the estimated-exposure
// advisory reports per figure (through buildFigures' own
// estimatedRowNames) rather than as a flat ingredient list. See
// 03-CONTEXT.md D-05 and route-recipe-version.md § 3 "Derived
// advisories".
import { computeBalance, formatGrams } from './composition.js';
import { buildFigures, figureLabelText } from './figures.js';
import { activeRows, activeSteps, rowGrams } from './rows.js';
import { displayNumbers, displayNumberOf } from './stepNumbers.js';

// A target's value is free text with no grammar (method[].targets[].value).
// Only a string that is nothing but a leading decimal number followed by
// the Celsius mark is read — a range such as "80–85 °C" or a word such as
// "room" is simply not a match, never a thrown error and never a guessed
// number (T-03-33).
const TEMP_TARGET_RE = /^(\d+(?:\.\d+)?)\s*°C$/;

function parseTempTarget(value) {
  if (typeof value !== 'string') return null;
  const match = TEMP_TARGET_RE.exec(value.trim());
  return match ? Number(match[1]) : null;
}

// The precision a kitchen scale's own readout carries for a sub-gram
// amount — two decimals, distinct from formatGrams' one-decimal
// computed-total convention (composition.js), which this advisory never
// uses for these authored, already-two-decimal row amounts.
function formatScaleGrams(grams) {
  return `${grams.toFixed(2)} g`;
}

/**
 * subScaleAdvisory(rows, equipment) -> { key, words, basis } | null.
 * Names every active row below the kitchen scale's own resolution, the
 * master blend made for equipment.batchesAhead, and the take for this
 * batch. equipment.minFillG is read by nothing here: batch mass against
 * the machine's minimum fill is held for SCALE-01, which owns machine
 * capacity and forbids asserting a safe fit (D-05) — this module never
 * builds that fifth advisory.
 */
function subScaleAdvisory(rows, equipment) {
  const under = rows.filter((row) => rowGrams(row) > 0 && rowGrams(row) < equipment.scaleResolutionG);
  if (under.length === 0) return null;

  const blend = rows.filter((row) => row.ingredient.category === 'stabilizer' && rowGrams(row) > 0);
  if (blend.length === 0) return null;

  const multiple = equipment.batchesAhead;
  const take = blend.reduce((total, row) => total + rowGrams(row), 0);
  const blendTotal = take * multiple;

  const underWords = under.map((row) => `${row.ingredientName} at ${formatScaleGrams(rowGrams(row))}`).join(' and ');
  const partsWords = blend
    .map((row) => `${row.ingredientName} ${formatScaleGrams(rowGrams(row) * multiple)}`)
    .join(', ');
  const verb = under.length > 1 ? 'are' : 'is';

  const words =
    `${underWords} ${verb} under the ${equipment.scale}'s resolution. The master blend for ` +
    `${multiple} batches ahead: ${partsWords}, ${formatScaleGrams(blendTotal)} in all, with ` +
    `${formatScaleGrams(take)} taken for this batch.`;

  const basis = `${equipment.scale} reads to ${equipment.scaleResolutionG} g; the equipment profile blends ${multiple} batches ahead.`;

  return { key: 'sub-scale', words, basis };
}

/**
 * ultraPasteurisedAdvisory(rows, mass) -> { key, words, basis } | null.
 * Names the active rows carrying an ultra-pasteurised heat treatment
 * against the batch's own computed mass, through formatGrams — never the
 * recipe's nominal batch size, since this app does not round the maker's
 * typed rows to a number they did not type.
 */
function ultraPasteurisedAdvisory(rows, mass) {
  const treated = rows.filter((row) => row.ingredient.heatTreatment === 'ultra-pasteurised');
  if (treated.length === 0) return null;

  const grams = treated.reduce((total, row) => total + rowGrams(row), 0);
  const names = treated.map((row) => `${row.ingredientName} at ${formatGrams(rowGrams(row))}`).join(' and ');

  const words = `${names} carry an ultra-pasteurised heat treatment: ${formatGrams(grams)} of the batch's ${formatGrams(mass)}.`;
  const basis = 'heat treatment recorded on each ingredient.';

  return { key: 'ultra-pasteurised', words, basis };
}

/**
 * findHydrationStep(steps, neededC) -> the first active step, in step
 * order, carrying a target whose parsed temperature reaches neededC, or
 * null when none does.
 */
function findHydrationStep(steps, neededC) {
  for (const step of steps) {
    for (const target of step.targets ?? []) {
      const temp = parseTempTarget(target.value);
      if (temp != null && temp >= neededC) return { step, target };
    }
  }
  return null;
}

/**
 * hydrationAdvisory(rows, steps, process, stepNumbers) -> { key, words,
 * basis } | null. Names every active gum whose recorded hydration
 * temperature exceeds the version's pasteurisation hold, and — when one
 * can be read — the first active step whose typed target reaches it,
 * named by the number the reader sees (03-10), not its stored key. A
 * target the parser cannot read degrades to no step clause rather than
 * throwing or guessing. `matched.step` is always one of `steps`
 * (activeSteps), so it always holds a position in `stepNumbers`.
 */
function hydrationAdvisory(rows, steps, process, stepNumbers) {
  const hold = process.pasteuriseC;
  const unmet = rows.filter(
    (row) => rowGrams(row) > 0 && row.ingredient.hydrationC != null && row.ingredient.hydrationC > hold,
  );
  if (unmet.length === 0) return null;

  const neededC = Math.max(...unmet.map((row) => row.ingredient.hydrationC));
  const matched = findHydrationStep(steps, neededC);

  const names = unmet.map((row) => `${row.ingredientName} hydrates at ${row.ingredient.hydrationC} °C`).join(' and ');

  let words = `${names}, above the ${hold} °C pasteurisation hold.`;
  if (matched) words += ` Step ${displayNumberOf(stepNumbers, matched.step.n)} targets ${matched.target.value}.`;

  let basis = "the ingredient's recorded hydration temperature and the version's pasteurisation setting";
  basis += matched ? "; the step's typed target." : '.';

  return { key: 'hydration', words, basis };
}

/**
 * estimatedExposureAdvisory(rows, targets) -> { key, words, basis } |
 * null. Restructures buildFigures' own per-figure estimatedRowNames
 * rather than rescanning the ingredient library, so this advisory and the
 * six figures can never disagree about which rows a figure rests on
 * (T-03-30).
 */
function estimatedExposureAdvisory(rows, targets) {
  const figures = buildFigures({ rows, targets });
  const shaky = figures.filter((figure) => figure.estimatedRowNames.length > 0);
  if (shaky.length === 0) return null;

  const words = `${shaky
    .map((figure) => `${figureLabelText(figure.label)} through ${figure.estimatedRowNames.join(', ')}`)
    .join('; ')}.`;
  const basis = 'the per-field basis recorded on each ingredient.';

  return { key: 'estimated', words, basis };
}

/**
 * buildAdvisories(version) -> the FORM2-02 advisories true of the version
 * as it stands, each a { key, words, basis } descriptor, in the fixed
 * order sub-scale, ultra-pasteurised, hydration, estimated. Filters
 * through activeRows/activeSteps before computing anything, exactly as
 * computeBalance/buildFigures require (RESEARCH.md Pitfall 2) — a removed
 * row or step never reaches an advisory. Returns [] for a version with no
 * rows. Never mutates the version it is given.
 */
export function buildAdvisories(version) {
  const rows = activeRows(version);
  const steps = activeSteps(version);
  const balance = computeBalance(rows);
  if (!balance) return [];

  const stepNumbers = displayNumbers(version.method);

  return [
    subScaleAdvisory(rows, version.equipment),
    ultraPasteurisedAdvisory(rows, balance.mass),
    hydrationAdvisory(rows, steps, version.process, stepNumbers),
    estimatedExposureAdvisory(rows, version.targets),
  ].filter(Boolean);
}
