// Save for the creation editor (Phase 11, MAKE-10): buildCreation turns a
// create draft into the recipe and its first version, and creationSaveBlock
// lists every refusal at once. Node environment: the domain imports no
// framework, DOM or store.
import { describe, it, expect } from 'vitest';
import {
  buildCreation,
  creationSaveBlock,
  lineSaveMessages,
  LIBRARY_ENTRY_GONE,
  NO_ROWS_MESSAGE,
  PROBLEM_REPEATED,
} from './creationSave.js';
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

const gate = (draft, extra = {}) => creationSaveBlock(draft, { libraryById, ...extra });
const ids = (blocks) => blocks.map((block) => block.id);
const blankLines = (draft) => {
  let next = draft;
  for (const [rowId, step] of [['row-a', 1], ['row-a', 2], ['row-b', 1], ['row-c', 0]]) next = setLineGrams(next, rowId, step, '');
  return next;
};

describe('creationSaveBlock: every refusal at once, in page order (D-08 to D-11, D-22, D-25)', () => {
  it('gives nothing for a draft that can be saved', () => {
    expect(gate(worked())).toEqual([]);
  });

  it('a blank draft gives the recipe name, then no rows', () => {
    expect(gate(blank(''))).toEqual([
      { id: 'recipe-name', message: 'Enter a recipe name.', target: { kind: 'recipeName' } },
      { id: 'no-rows', message: 'Add at least one ingredient.', target: { kind: 'ingredients' } },
    ]);
    expect(NO_ROWS_MESSAGE).toBe('Add at least one ingredient.');
  });

  it('a name of spaces is blank', () => {
    expect(ids(gate({ ...worked(), name: '   ' }))).toEqual(['recipe-name']);
  });

  it('a blank Version name gives Required right after the name', () => {
    const blocks = gate({ ...blank(''), versionLabel: '  ' });
    expect(blocks.slice(0, 2)).toEqual([
      { id: 'recipe-name', message: 'Enter a recipe name.', target: { kind: 'recipeName' } },
      { id: 'version-name', message: 'Required', target: { kind: 'versionName' } },
    ]);
    expect(ids(blocks)).toEqual(['recipe-name', 'version-name', 'no-rows']);
  });

  it('a blank line and an unreadable one give the two grams sentences, with their line ids', () => {
    let draft = addRow(addRow(blank(), { rowId: 'row-a', libraryId: 'wholeMilk' }), { rowId: 'row-b', libraryId: 'sucrose' });
    draft = setLineGrams(draft, 'row-b', 0, 'abc');
    expect(gate(draft)).toEqual([
      { id: 'grams:row-a:0', message: `${library.wholeMilk.name} needs an amount, or remove it`, target: { kind: 'line', rowId: 'row-a', step: 0 } },
      { id: 'grams:row-b:0', message: `${library.sucrose.name}'s amount is not a number`, target: { kind: 'line', rowId: 'row-b', step: 0 } },
    ]);
  });

  it("walks the lines in the table's order: each step in method order, its rows in its own order, then the unplaced rows", () => {
    expect(ids(gate(blankLines(worked())))).toEqual(['grams:row-a:1', 'grams:row-b:1', 'grams:row-a:2', 'grams:row-c:0']);
    expect(ids(gate(blankLines(moveRow(worked(), 'row-b', 1, 'up'))))).toEqual([
      'grams:row-b:1',
      'grams:row-a:1',
      'grams:row-a:2',
      'grams:row-c:0',
    ]);
  });

  it('a step with a blank lead-in and a blank instruction gives both, Required', () => {
    let draft = worked();
    draft = setStepField(setStepField(draft, 2, 'leadIn', ''), 2, 'instruction', '');
    expect(gate(draft)).toEqual([
      { id: 'lead:2', message: 'Required', target: { kind: 'stepLeadIn', n: 2 } },
      { id: 'instruction:2', message: 'Required', target: { kind: 'stepInstruction', n: 2 } },
    ]);
  });

  it('a target with one side blank is refused under that side; both blank, and an empty purpose or aside, give nothing', () => {
    let draft = worked();
    draft = addTarget(addTarget(addTarget(draft, 1), 1), 1);
    draft = setTarget(draft, 1, 0, 'label', 'Heat to');
    draft = setTarget(draft, 1, 2, 'value', '80 C');
    draft = setStepField(setStepField(draft, 1, 'purpose', ''), 1, 'aside', '   ');
    expect(gate(draft)).toEqual([
      { id: 'target:1:0:value', message: 'Required', target: { kind: 'stepTarget', n: 1, index: 0, side: 'value' } },
      { id: 'target:1:2:label', message: 'Required', target: { kind: 'stepTarget', n: 1, index: 2, side: 'label' } },
    ]);
  });

  it('reads every field trimmed: a lead-in, a target side, a scale field and a problem of spaces are blank', () => {
    let draft = setStepField(worked(), 1, 'leadIn', '   ');
    draft = addTarget(draft, 2);
    draft = setTarget(setTarget(draft, 2, 0, 'label', 'Heat to'), 2, 0, 'value', '  ');
    draft = addScale(draft, 'scale-a');
    draft = updateScale(updateScale(draft, 'scale-a', 'name', '  '), 'scale-a', 'low', ' ');
    draft = updateScale(updateScale(draft, 'scale-a', 'high', '\t'), 'scale-a', 'kind', 'magnitude');
    draft = updateProblem(addProblem(draft), 0, '   ');
    expect(ids(gate(draft))).toEqual([
      'lead:1',
      'target:2:0:value',
      'scale:scale-a:name',
      'scale:scale-a:low',
      'scale:scale-a:high',
      'problem:0',
    ]);
  });

  it('a scale with a blank name and no kind gives the name and the kind; a blank low and high give theirs', () => {
    let draft = addScale(worked(), 'scale-a');
    expect(gate(draft)).toEqual([
      { id: 'scale:scale-a:name', message: 'Required', target: { kind: 'scaleField', key: 'scale-a', field: 'name' } },
      { id: 'scale:scale-a:low', message: 'Required', target: { kind: 'scaleField', key: 'scale-a', field: 'low' } },
      { id: 'scale:scale-a:high', message: 'Required', target: { kind: 'scaleField', key: 'scale-a', field: 'high' } },
      { id: 'scale:scale-a:kind', message: 'Required', target: { kind: 'scaleField', key: 'scale-a', field: 'kind' } },
    ]);
    draft = updateScale(updateScale(updateScale(draft, 'scale-a', 'name', 'Chew'), 'scale-a', 'low', 'soft'), 'scale-a', 'high', 'firm');
    expect(ids(gate(draft))).toEqual(['scale:scale-a:kind']);
  });

  it('a blank problem is Required and a repeated one (trimmed, case as typed) is refused on the second', () => {
    let draft = updateProblem(addProblem(addProblem(worked())), 1, 'Icy');
    expect(gate(draft)).toEqual([{ id: 'problem:0', message: 'Required', target: { kind: 'problem', index: 0 } }]);
    draft = updateProblem(updateProblem(draft, 0, 'Bitter'), 1, ' Bitter ');
    expect(gate(draft)).toEqual([
      { id: 'problem-repeat:1', message: 'This problem is already listed.', target: { kind: 'problem', index: 1 } },
    ]);
    expect(PROBLEM_REPEATED).toBe('This problem is already listed.');
    expect(ids(gate(updateProblem(draft, 1, 'bitter')))).toEqual([]);
  });

  it('a row whose library entry is missing is refused, never dropped', () => {
    expect(gate(worked(), { libraryById: new Map([...libraryById].filter(([id]) => id !== 'sucrose')) })).toEqual([
      { id: 'gone:row-c', message: 'An ingredient on this recipe is no longer in the library.', target: { kind: 'form' } },
    ]);
    expect(LIBRARY_ENTRY_GONE).toBe('An ingredient on this recipe is no longer in the library.');
  });

  it('an empty Before you start note is dropped, not refused', () => {
    expect(gate(addNote(worked()))).toEqual([]);
  });

  it('lists every refusal at once, in page order', () => {
    let draft = blank('');
    draft = addRow(draft, { rowId: 'row-a', libraryId: 'wholeMilk' });
    draft = addStep(draft, { afterN: null });
    draft = addScale(draft, 'scale-a');
    draft = addProblem(draft);
    expect(ids(gate({ ...draft, versionLabel: '' }))).toEqual([
      'recipe-name',
      'version-name',
      'grams:row-a:0',
      'lead:1',
      'instruction:1',
      'scale:scale-a:name',
      'scale:scale-a:low',
      'scale:scale-a:high',
      'scale:scale-a:kind',
      'problem:0',
    ]);
  });

  describe('an amount that overflows', () => {
    const NINES = '9'.repeat(309);
    const BIG = '9'.repeat(308);

    it('a line of 309 nines is not a number', () => {
      expect(gate(setLineGrams(worked(), 'row-c', 0, NINES))).toEqual([
        { id: 'grams:row-c:0', message: `${library.sucrose.name}'s amount is not a number`, target: { kind: 'line', rowId: 'row-c', step: 0 } },
      ]);
    });

    it("two lines that each read but whose sum does not give grams-total, at the row's last line, and no per-line block", () => {
      const draft = setLineGrams(setLineGrams(worked(), 'row-a', 1, BIG), 'row-a', 2, BIG);
      expect(gate(draft)).toEqual([
        {
          id: 'grams-total:row-a',
          message: `${library.wholeMilk.name}'s amount is not a number`,
          target: { kind: 'line', rowId: 'row-a', step: 2 },
        },
      ]);
    });

    it('a row with a blank line is judged line by line only, with no total', () => {
      const draft = setLineGrams(setLineGrams(worked(), 'row-a', 1, BIG), 'row-a', 2, '');
      expect(ids(gate(draft))).toEqual(['grams:row-a:2']);
    });

    it('a row of lines that read and add up finite gives nothing', () => {
      expect(gate(setLineGrams(setLineGrams(worked(), 'row-a', 1, '400'), 'row-a', 2, '200'))).toEqual([]);
    });
  });
});

describe('lineSaveMessages: the one projection the table reads (T-11-53)', () => {
  it('maps a refused line to its sentence, a total refusal to its last line, and holds no key for a clean line', () => {
    const BIG = '9'.repeat(308);
    let draft = setLineGrams(setLineGrams(worked(), 'row-a', 1, BIG), 'row-a', 2, BIG);
    draft = setLineGrams(draft, 'row-c', 0, '');
    const messages = lineSaveMessages(gate(draft));
    expect(messages).toBeInstanceOf(Map);
    expect(messages.get('row-a:2')).toBe(`${library.wholeMilk.name}'s amount is not a number`);
    expect(messages.get('row-c:0')).toBe(`${library.sucrose.name} needs an amount, or remove it`);
    expect(messages.has('row-a:1')).toBe(false);
    expect(messages.has('row-b:1')).toBe(false);
    expect([...messages.keys()].sort()).toEqual(['row-a:2', 'row-c:0']);
  });

  it('keeps the first of two blocks on one line, and leaves out a block that targets no line', () => {
    const messages = lineSaveMessages([
      { id: 'a', message: 'first', target: { kind: 'line', rowId: 'row-a', step: 1 } },
      { id: 'b', message: 'second', target: { kind: 'line', rowId: 'row-a', step: 1 } },
      { id: 'recipe-name', message: 'Enter a recipe name.', target: { kind: 'recipeName' } },
    ]);
    expect([...messages]).toEqual([['row-a:1', 'first']]);
  });
});
