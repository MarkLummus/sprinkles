// The create draft's step, row and allocation ops (Phase 11, MAKE-07,
// STRUCT-01 to STRUCT-03). Runs in the node environment: the module imports no
// framework, DOM or store.
import { describe, it, expect } from 'vitest';
import {
  UNPLACED_STEP,
  liveSteps,
  placementOf,
  groupRows,
  rowLines,
  addStep,
  toggleStepUses,
  checkAllocation,
} from './creationSteps.js';
import { addRow, setRowGrams, creationSheetVersion } from './creation.js';
import { blankCreateDraft } from './draft.js';
import { library } from '../data/library.js';

const records = new Map(Object.entries(library).map(([id, entry]) => [id, { id, entry }]));

// A Phase 10 draft: two rows at the placeholder, no method.
function phaseTenDraft() {
  let draft = blankCreateDraft({ recipeId: 'r1', versionId: 'v1', name: 'Vanilla' });
  draft = addRow(draft, { rowId: 'rowA', libraryId: 'wholeMilk' });
  draft = addRow(draft, { rowId: 'rowB', libraryId: 'sucrose' });
  draft = setRowGrams(draft, 'rowA', '600');
  return setRowGrams(draft, 'rowB', '150');
}

describe('tracer: a step added to a Phase 10 draft and a row ticked into it', () => {
  it('addStep gives the first step key 1 and leaves both rows unplaced with their grams', () => {
    const draft = phaseTenDraft();
    const before = structuredClone(draft);
    const next = addStep(draft);
    expect(draft).toEqual(before);
    expect(next.method).toEqual([{ n: 1, leadIn: '', instruction: '', uses: [], targets: [] }]);
    expect(next.rows).toEqual(draft.rows);
    expect(placementOf(next, 'rowA')).toEqual([]);
    expect(checkAllocation(next)).toBeNull();
    expect(UNPLACED_STEP).toBe(0);
  });

  it('projects the first step with both rows unplaced at step 0', () => {
    const version = creationSheetVersion(addStep(phaseTenDraft()), records);
    expect(version.method).toEqual([{ n: 1, leadIn: '', instruction: '', uses: [], targets: [] }]);
    expect(version.rows.map((row) => row.portions)).toEqual([
      [{ step: UNPLACED_STEP, grams: 600 }],
      [{ step: UNPLACED_STEP, grams: 150 }],
    ]);
  });

  it('ticking an unplaced row into step 1 moves its grams there and lists it in uses', () => {
    const next = toggleStepUses(addStep(phaseTenDraft()), 1, 'rowA');
    expect(next.rows[0].portions).toEqual([{ step: 1, grams: '600' }]);
    expect(next.rows[1].portions).toEqual([{ step: 1, grams: '150' }]);
    expect(next.method[0].uses).toEqual(['rowA']);
    expect(placementOf(next, 'rowA')).toEqual([1]);
    expect(placementOf(next, 'rowB')).toEqual([]);
    expect(checkAllocation(next)).toBeNull();
    const version = creationSheetVersion(next, records);
    expect(version.rows.map((row) => row.portions)).toEqual([
      [{ step: 1, grams: 600 }],
      [{ step: UNPLACED_STEP, grams: 150 }],
    ]);
    expect(version.method[0].uses).toEqual(['rowA']);
  });

  it('unticking a row whose only step is that one returns it to the placeholder with its grams', () => {
    const ticked = toggleStepUses(addStep(phaseTenDraft()), 1, 'rowA');
    const back = toggleStepUses(ticked, 1, 'rowA');
    expect(back.rows[0].portions).toEqual([{ step: 1, grams: '600' }]);
    expect(back.method[0].uses).toEqual([]);
    expect(placementOf(back, 'rowA')).toEqual([]);
    expect(rowLines(back, 'rowA')).toEqual([{ step: UNPLACED_STEP, grams: '600' }]);
    expect(checkAllocation(back)).toBeNull();
  });

  it('reads a placed row at its step key and an unplaced row at the placeholder in rowLines', () => {
    const ticked = toggleStepUses(addStep(phaseTenDraft()), 1, 'rowA');
    expect(rowLines(ticked, 'rowA')).toEqual([{ step: 1, grams: '600' }]);
    expect(rowLines(ticked, 'rowB')).toEqual([{ step: UNPLACED_STEP, grams: '150' }]);
  });

  it('each step orders its own rows: ticking B then A reads B, A while draft.rows reads A, B', () => {
    let draft = addStep(phaseTenDraft());
    draft = toggleStepUses(draft, 1, 'rowB');
    draft = toggleStepUses(draft, 1, 'rowA');
    expect(draft.method[0].uses).toEqual(['rowB', 'rowA']);
    expect(groupRows(draft, 1)).toEqual(['rowB', 'rowA']);
    expect(draft.rows.map((row) => row.id)).toEqual(['rowA', 'rowB']);
    expect(creationSheetVersion(draft, records).method[0].uses).toEqual(['rowB', 'rowA']);
    expect(groupRows(draft, UNPLACED_STEP)).toEqual([]);
  });

  it('groupRows reads the unplaced rows in draft.rows order', () => {
    const draft = toggleStepUses(addStep(phaseTenDraft()), 1, 'rowA');
    expect(groupRows(draft, UNPLACED_STEP)).toEqual(['rowB']);
  });

  it('liveSteps leaves out a removed step', () => {
    const draft = addStep(addStep(phaseTenDraft()));
    draft.method = [draft.method[0], { ...draft.method[1], removed: true }];
    expect(liveSteps(draft).map((step) => step.n)).toEqual([draft.method[0].n]);
  });

  it('a step added with no afterN goes to the beginning, and afterN puts it right after that step', () => {
    let draft = addStep(phaseTenDraft());
    draft = addStep(draft);
    expect(draft.method.map((step) => step.n)).toEqual([2, 1]);
    draft = addStep(draft, { afterN: 2 });
    expect(draft.method.map((step) => step.n)).toEqual([2, 3, 1]);
    expect(() => addStep(draft, { afterN: 99 })).toThrow(RangeError);
  });
});

describe('checkAllocation names the first violation', () => {
  it('names the row when a step uses it but the row holds no portion at that step', () => {
    const draft = addStep(addStep(phaseTenDraft()));
    draft.method[1].uses = [];
    draft.method[0].uses = ['rowA']; // step 2, while rowA's only portion sits at the placeholder 1
    expect(draft.method[0].n).toBe(2);
    expect(checkAllocation(draft)).toContain('rowA');
  });

  it('names the row when it holds two portions while one step uses it', () => {
    const ticked = toggleStepUses(addStep(phaseTenDraft()), 1, 'rowA');
    ticked.rows[0].portions = [
      { step: 1, grams: '300' },
      { step: 2, grams: '300' },
    ];
    expect(checkAllocation(ticked)).toContain('rowA');
  });

  it('names a uses id that is not a row, a repeated id and a removed step that still lists a row', () => {
    const none = addStep(phaseTenDraft());
    none.method[0].uses = ['ghost'];
    expect(checkAllocation(none)).toContain('ghost');
    const twice = toggleStepUses(addStep(phaseTenDraft()), 1, 'rowA');
    twice.method[0].uses = ['rowA', 'rowA'];
    expect(checkAllocation(twice)).toContain('rowA');
    const removed = toggleStepUses(addStep(phaseTenDraft()), 1, 'rowA');
    removed.method[0].removed = true;
    expect(checkAllocation(removed)).not.toBeNull();
  });

  it('names an unplaced row that holds a portion other than the one placeholder, and duplicate portion steps', () => {
    const odd = addStep(phaseTenDraft());
    odd.rows[1].portions = [{ step: 2, grams: '150' }];
    expect(checkAllocation(odd)).toContain('rowB');
    const dup = addStep(phaseTenDraft());
    dup.rows[1].portions = [
      { step: 1, grams: '1' },
      { step: 1, grams: '2' },
    ];
    expect(checkAllocation(dup)).toContain('rowB');
  });
});
