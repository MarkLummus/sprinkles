// Save for the creation editor (Phase 11, MAKE-10): buildCreation turns a
// create draft into the recipe and its first version, and creationSaveBlock
// lists every refusal at once. Node environment: the domain imports no
// framework, DOM or store.
import { describe, it, expect } from 'vitest';
import { buildCreation } from './creationSave.js';
import { blankCreateDraft } from './draft.js';
import { addRow, addNote, addProblem, addScale, applyStyle, setBandEnd, updateNote, updateProblem, updateScale } from './creation.js';
import {
  addStep,
  addTarget,
  moveRow,
  removeStep,
  setLineGrams,
  setStepField,
  setTarget,
  toggleStepUses,
} from './creationSteps.js';
import { codeFromVersionId } from './sheetCode.js';
import { library } from '../data/library.js';
import { STYLE_ROWS } from '../data/styles.js';

const NOW = '2026-10-27T09:00:00.000Z';
const libraryById = new Map(Object.entries(library).map(([id, entry]) => [id, { id, entry }]));

function blank(name = 'Vanilla') {
  return blankCreateDraft({ recipeId: 'recipe-1', versionId: 'version-1', name });
}

// Two steps; Whole milk is split across both (400 g then 200 g), Heavy cream is
// in step 1 only, and Sucrose sits in no step.
function worked() {
  let draft = blank();
  draft = addRow(draft, { rowId: 'row-a', libraryId: 'wholeMilk' });
  draft = addRow(draft, { rowId: 'row-b', libraryId: 'heavyCream' });
  draft = addRow(draft, { rowId: 'row-c', libraryId: 'sucrose' });
  draft = addStep(draft, { afterN: null });
  draft = addStep(draft, { afterN: 1 });
  draft = setStepField(draft, 1, 'leadIn', 'Warm');
  draft = setStepField(draft, 1, 'instruction', 'Warm the milk and the cream.');
  draft = setStepField(draft, 2, 'leadIn', 'Churn');
  draft = setStepField(draft, 2, 'instruction', 'Churn, then harden.');
  draft = toggleStepUses(draft, 1, 'row-a');
  draft = toggleStepUses(draft, 1, 'row-b');
  draft = toggleStepUses(draft, 2, 'row-a');
  draft = setLineGrams(draft, 'row-a', 1, '400');
  draft = setLineGrams(draft, 'row-a', 2, '200');
  draft = setLineGrams(draft, 'row-b', 1, '250');
  draft = setLineGrams(draft, 'row-c', 0, '100');
  return { ...draft, description: 'Plain and cold.' };
}

const build = (draft, extra = {}) => buildCreation(draft, { libraryById, styles: STYLE_ROWS, now: NOW, ...extra });

describe('buildCreation: the records a creation saves', () => {
  it('names the recipe and the version from the draft', () => {
    const { recipe, version } = build({ ...worked(), name: '  Vanilla  ', versionLabel: ' Version 1 ' });
    expect(recipe).toEqual({ id: 'recipe-1', name: 'Vanilla', description: 'Plain and cold.' });
    expect(version.id).toBe('version-1');
    expect(version.recipeId).toBe('recipe-1');
    expect(version.versionLabel).toBe('Version 1');
    expect(version.createdAt).toBe(NOW);
    expect(version.sheetCode).toBe(codeFromVersionId('version-1'));
    expect(version.sheetTitle).toBe('Vanilla');
    expect(version.sheetDescription).toBe('Plain and cold.');
    expect(version.parentVersionId).toBeNull();
    expect(version.reason).toBeNull();
  });

  it('copies each row from its library entry, one portion per line, an unplaced row at step 0', () => {
    const { version } = build(worked());
    expect(version.rows.map((row) => row.id)).toEqual(['row-a', 'row-b', 'row-c']);
    const [milk, cream, sugar] = version.rows;
    expect(milk.portions).toEqual([
      { step: 1, grams: 400 },
      { step: 2, grams: 200 },
    ]);
    expect(cream.portions).toEqual([{ step: 1, grams: 250 }]);
    expect(sugar.portions).toEqual([{ step: 0, grams: 100 }]);
    expect(milk.libraryId).toBe('wholeMilk');
    expect(milk.ingredientName).toBe(library.wholeMilk.name);
    expect(milk.removed).toBe(false);
    expect(milk.ingredient).toEqual(library.wholeMilk);
    expect(milk.ingredient).not.toBe(library.wholeMilk);
    expect(milk.ingredient.composition).not.toBe(library.wholeMilk.composition);
  });

  it('saves the live steps in method order, each removed false, with uses in the step\'s own order', () => {
    const { version } = build(moveRow(worked(), 'row-b', 1, 'up'));
    expect(version.method.map((step) => [step.n, step.leadIn, step.removed])).toEqual([
      [1, 'Warm', false],
      [2, 'Churn', false],
    ]);
    expect(version.method[0].uses).toEqual(['row-b', 'row-a']);
    expect(version.method[1].uses).toEqual(['row-a']);
  });

  it('keeps a moved step\'s stored key, and drops a removed step', () => {
    let draft = worked();
    draft = addStep(draft, { afterN: 2 });
    draft = removeStep(draft, 3);
    const { version } = build(draft);
    expect(version.method.map((step) => step.n)).toEqual([1, 2]);
  });

  it('saves a recipe with no steps as a flat table: every row at step 0, an empty method', () => {
    let draft = addRow(blank(), { rowId: 'row-a', libraryId: 'wholeMilk' });
    draft = setLineGrams(draft, 'row-a', 0, '500');
    const { version } = build(draft);
    expect(version.method).toEqual([]);
    expect(version.rows[0].portions).toEqual([{ step: 0, grams: 500 }]);
  });

  it('keeps only complete targets, a purpose and an aside only when they hold words, all trimmed', () => {
    let draft = worked();
    draft = addTarget(draft, 1);
    draft = setTarget(draft, 1, 0, 'label', '  Heat to ');
    draft = setTarget(draft, 1, 0, 'value', ' 80 C ');
    draft = addTarget(draft, 1);
    draft = addTarget(draft, 1);
    draft = setTarget(draft, 1, 2, 'label', 'Half');
    draft = setStepField(draft, 1, 'purpose', '  Dissolve the sugar. ');
    draft = setStepField(draft, 1, 'aside', '   ');
    const step = build(draft).version.method[0];
    expect(step.targets).toEqual([{ label: 'Heat to', value: '80 C' }]);
    expect(step.purpose).toBe('Dissolve the sugar.');
    expect(Object.hasOwn(step, 'aside')).toBe(false);
    expect(Object.hasOwn(build(worked()).version.method[1], 'purpose')).toBe(false);
  });

  it('trims lead-ins and instructions', () => {
    let draft = setStepField(worked(), 1, 'leadIn', '  Warm  ');
    draft = setStepField(draft, 1, 'instruction', '\tWarm it.\n');
    const step = build(draft).version.method[0];
    expect(step.leadIn).toBe('Warm');
    expect(step.instruction).toBe('Warm it.');
  });

  it('saves the non-blank Before you start notes, trimmed, with inheritedFrom null', () => {
    let draft = addNote(addNote(addNote(worked())));
    draft = updateNote(draft, 0, '  Chill the bowl. ');
    draft = updateNote(draft, 2, 'Weigh everything first.');
    expect(build(draft).version.authored).toEqual({
      beforeYouStart: [
        { text: 'Chill the bowl.', inheritedFrom: null },
        { text: 'Weigh everything first.', inheritedFrom: null },
      ],
    });
    expect(build(worked()).version.authored).toEqual({ beforeYouStart: [] });
  });

  it('saves the recipe\'s own scales trimmed as declared definitions and its problems trimmed', () => {
    let draft = addScale(worked(), 'scale-chew');
    draft = updateScale(draft, 'scale-chew', 'name', ' Chew ');
    draft = updateScale(draft, 'scale-chew', 'low', ' soft');
    draft = updateScale(draft, 'scale-chew', 'high', 'firm ');
    draft = updateScale(draft, 'scale-chew', 'kind', 'goldilocks');
    draft = updateProblem(addProblem(addProblem(draft)), 0, '  Bitter ');
    draft = updateProblem(draft, 1, 'Icy');
    const { version } = build(draft);
    expect(version.declaredAxes).toEqual([
      { key: 'scale-chew', name: 'Chew', low: 'soft', high: 'firm', kind: 'goldilocks', group: 'declared' },
    ]);
    expect(version.declaredFlaws).toEqual(['Bitter', 'Icy']);
  });

  it('saves the bands that read as targets, and the style\'s name with the serving temperature', () => {
    let draft = applyStyle(worked(), STYLE_ROWS.find((style) => style.id === 'philadelphia'));
    draft = setBandEnd(setBandEnd(draft, 'fat', 0, '10'), 'fat', 1, '16');
    draft = setBandEnd(draft, 'sugar', 0, '12');
    const { version } = build(draft);
    expect(version.targets).toEqual({ pod: [14, 18], fat: [10, 16], msnf: [8, 12], solids: [36, 42] });
    expect(version.iceEd).toEqual({ style: 'Philadelphia', servingTemperatureC: -14, hardness: null, overrunPercent: null });
    expect(version.serveTempC).toBe(-14);
  });

  it('saves no style and no temperature as null, and an unreadable temperature as null', () => {
    const none = build(worked()).version;
    expect(none.iceEd).toEqual({ style: null, servingTemperatureC: null, hardness: null, overrunPercent: null });
    expect(none.serveTempC).toBeNull();
    expect(none.targets).toEqual({});
    for (const raw of ['abc', '', '  ', '1e999']) {
      expect(build({ ...worked(), serveTempC: raw }).version.serveTempC).toBeNull();
    }
    expect(build({ ...worked(), serveTempC: ' -12.5 ' }).version.serveTempC).toBe(-12.5);
  });

  it('throws a TypeError for a row whose library entry is gone', () => {
    expect(() => build(worked(), { libraryById: new Map() })).toThrow(TypeError);
  });

  it('throws a TypeError for a draft whose uses and portions disagree', () => {
    const draft = worked();
    const broken = { ...draft, method: draft.method.map((step) => (step.n === 1 ? { ...step, uses: [...step.uses, 'row-ghost'] } : step)) };
    expect(() => build(broken)).toThrow(TypeError);
    const lost = { ...draft, rows: draft.rows.map((row) => (row.id === 'row-a' ? { ...row, portions: [{ step: 1, grams: '400' }] } : row)) };
    expect(() => build(lost)).toThrow(TypeError);
  });

  it('throws a TypeError for an amount that does not read', () => {
    expect(() => build(setLineGrams(worked(), 'row-c', 0, 'abc'))).toThrow(TypeError);
    expect(() => build(setLineGrams(worked(), 'row-c', 0, ''))).toThrow(TypeError);
  });

  it('does not change the draft it reads', () => {
    const draft = worked();
    const before = structuredClone(draft);
    build(draft);
    expect(draft).toEqual(before);
  });
});
