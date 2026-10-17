// sheetView is pure: it runs in the node Vitest environment with no DOM and no
// store (Phase 8, cut 3, D-09). The null-baseline cases are the contract Phase
// 10's creation editor needs: with no baseline there is nothing to diff against.
import { describe, it, expect } from 'vitest';
import { sheetView, markedFigure } from './sheetView.js';
import { buildDiff } from '../domain/diff.js';
import { penDraftFromVersion, penDraftVersion, setPenGrams } from '../domain/penDraft.js';
import { displayNumbers } from '../domain/stepNumbers.js';
import { oliveOilVersion } from '../data/olive-oil.js';
import { augustSecondBatch } from '../data/batch-2026-08-02.js';

const empty = { id: 'v-empty', recipeId: 'r-empty', rows: [], method: [], authored: { beforeYouStart: [] }, declaredAxes: [] };

const reading = (overrides) => ({
  version: empty,
  baseline: null,
  mode: 'reading',
  penDraft: null,
  parentVersion: null,
  showingChanges: false,
  batches: [],
  batchId: undefined,
  ...overrides,
});

describe('sheetView with no baseline', () => {
  it('baseline null, reading: no pen diff, no figures, no batch', () => {
    const view = sheetView(reading());
    expect(view.penDiff).toBeNull();
    expect(view.penStaleSteps).toEqual([]);
    expect(view.baselineStepNumbers).toBeNull();
    expect(view.changeDiff).toBeNull();
    expect(view.changeStaleSteps).toEqual([]);
    expect(view.figures).toEqual([]);
    expect(view.hasRows).toBe(false);
    expect(view.openBatch).toBeNull();
    expect(view.evidenceBatch).toBeNull();
    expect(view.comparisonBatchLabel).toBeNull();
    expect(view.baseline).toBeNull();
  });

  it('baseline null, developing: the draft shows and no diff is computed', () => {
    const view = sheetView(reading({ mode: 'developing', penDraft: penDraftFromVersion(empty) }));
    expect(view.draftVersion).not.toBeNull();
    expect(view.penDiff).toBeNull();
    expect(view.penStaleSteps).toEqual([]);
    expect(view.baselineStepNumbers).toBeNull();
  });
});

describe('sheetView with the stored version as its baseline', () => {
  it("baseline: version is the editing page's comparison", () => {
    const draft = setPenGrams(penDraftFromVersion(oliveOilVersion), 'row-01', 0, '130');
    const view = sheetView(reading({ version: oliveOilVersion, baseline: oliveOilVersion, mode: 'developing', penDraft: draft }));
    expect(view.penDiff).not.toBeNull();
    expect(view.penDiff).toEqual(buildDiff(penDraftVersion(oliveOilVersion, draft), oliveOilVersion));
    expect(view.baselineStepNumbers).toEqual(displayNumbers(oliveOilVersion.method));
  });
});

describe('markedFigure', () => {
  it('names the rows a figure rests on', () => {
    const view = sheetView(reading({ version: oliveOilVersion, baseline: oliveOilVersion }));
    const figure = view.figures.find((candidate) => candidate.contributorRowIds.length > 0);
    expect(figure).toBeDefined();
    const marked = markedFigure(view, figure.key);
    expect(marked.markedRowIds).toEqual(figure.contributorRowIds);
    expect(marked.markedAnnouncement.startsWith('Contributing to ')).toBe(true);
    const none = markedFigure(view, null);
    expect(none.markedRowIds).toEqual([]);
    expect(none.markedAnnouncement).toBe('');
  });
});

describe('sheetView openBatch', () => {
  it('is the batch the address names, else the newest by the batch order rule', () => {
    const batch = (id, churnDate, recordedAt) => ({
      ...augustSecondBatch,
      id,
      churn: { ...augustSecondBatch.churn, churnDate },
      recordedAt,
    });
    const older = batch('b-older', '2026-08-01', '2026-08-01T20:00:00.000Z');
    const newest = batch('b-newest', '2026-09-15', '2026-08-01T09:00:00.000Z');
    const undated = batch('b-undated', null, null);
    const input = Object.freeze([older, newest, undated]);
    const open = (batchId) =>
      sheetView(reading({ version: oliveOilVersion, baseline: oliveOilVersion, batches: input, batchId }));

    const none = open(undefined);
    expect(none.openBatch.id).toBe('b-newest');
    expect(none.evidenceBatch).toBe(none.openBatch);
    const named = open('b-older');
    expect(named.openBatch.id).toBe('b-older');
    expect(named.evidenceBatch).toBe(named.openBatch);
    const missing = open('missing');
    expect(missing.openBatch).toBeNull();
    expect(missing.evidenceBatch).toBeNull();
    expect(input.map((entry) => entry.id)).toEqual(['b-older', 'b-newest', 'b-undated']);
  });
});
