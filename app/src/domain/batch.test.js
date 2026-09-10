// Domain suite for the batch record (02-CONTEXT.md D-01, D-11, D-18, D-20,
// BATCH2-01). Runs under Vitest's default node environment — imports no
// store, no component, and no framework.
import { describe, it, expect } from 'vitest';
import {
  createBatch,
  formatRecordDate,
  hasAsMade,
  asMadeFor,
  asMadeForPortion,
  asMadeTotals,
  stepChangeFor,
  isStruck,
  changedLineFor,
  readMeasured,
  isTastingSaveable,
  sortedTastings,
  hasTasting,
  addTasting,
  recordAmendment,
  latestChurnDate,
  BATCH_SCHEMA_VERSION,
} from './batch.js';
import { oliveOilVersion } from '../data/olive-oil.js';
import { augustSecondBatch } from '../data/batch-2026-08-02.js';
import { rowGrams } from './rows.js';

// A plain in-memory double for the repository seam's batch methods — the
// domain suite must not import store/repository.js, which touches idb.
function createRepositoryDouble() {
  const batches = new Map();
  return {
    async saveBatch(batch) {
      batches.set(batch.id, batch);
    },
    async getBatch(id) {
      return batches.get(id);
    },
    async listBatchesForVersion(versionId) {
      return [...batches.values()].filter((batch) => batch.versionId === versionId);
    },
  };
}

describe('createBatch', () => {
  it('returns a record with the supplied id, versionId, recordedAt, empty amendedAt and tastings', () => {
    const batch = createBatch(
      oliveOilVersion,
      { churnDate: '2026-08-02', asMade: { 'row-01': [383] } },
      { id: 'b-1', now: '2026-08-04T09:00:00.000Z' },
    );
    expect(batch.schemaVersion).toBe(BATCH_SCHEMA_VERSION);
    expect(batch.id).toBe('b-1');
    expect(batch.versionId).toBe('olive-oil-ice-cream-v1');
    expect(batch.recordedAt).toBe('2026-08-04T09:00:00.000Z');
    expect(batch.amendedAt).toEqual([]);
    expect(batch.tastings).toEqual([]);
  });

  it("snapshots twelve rows and the version's coefficient set id", () => {
    const batch = createBatch(
      oliveOilVersion,
      { churnDate: '2026-08-02', asMade: {} },
      { id: 'b-1', now: '2026-08-04T09:00:00.000Z' },
    );
    expect(batch.snapshot.rows).toHaveLength(12);
    expect(batch.snapshot.coefficientSetId).toBe('2026.1-slice-transcription');
  });

  it('the snapshot does not move when the version is edited afterwards', () => {
    const version = structuredClone(oliveOilVersion);
    const batch = createBatch(
      version,
      { churnDate: '2026-08-02', asMade: {} },
      { id: 'b-1', now: '2026-08-04T09:00:00.000Z' },
    );
    const originalGrams = version.rows[0].portions[0].grams;
    const originalFat = version.rows[0].ingredient.composition.fat;

    version.rows[0].portions[0].grams = 999;
    version.rows[0].ingredient.composition.fat = 999;

    expect(batch.snapshot.rows[0].portions[0].grams).toBe(originalGrams);
    expect(batch.snapshot.rows[0].ingredient.composition.fat).toBe(originalFat);
  });

  it('snapshots the declared axes as two { name, low, high } entries', () => {
    const batch = createBatch(
      oliveOilVersion,
      { churnDate: '2026-08-02', asMade: {} },
      { id: 'b-1', now: '2026-08-04T09:00:00.000Z' },
    );
    expect(batch.snapshot.declaredAxes).toHaveLength(2);
    expect(batch.snapshot.declaredAxes[0]).toHaveProperty('name');
    expect(batch.snapshot.declaredAxes[0]).toHaveProperty('low');
    expect(batch.snapshot.declaredAxes[0]).toHaveProperty('high');
  });

  it('round-trips through a plain repository double', async () => {
    const repository = createRepositoryDouble();
    const batch = createBatch(
      oliveOilVersion,
      { churnDate: '2026-08-02', asMade: { 'row-01': [383] } },
      { id: 'b-1', now: '2026-08-04T09:00:00.000Z' },
    );

    await repository.saveBatch(batch);

    const reloaded = await repository.getBatch('b-1');
    expect(reloaded.churn.asMade['row-01']).toEqual([383]);

    const listed = await repository.listBatchesForVersion('olive-oil-ice-cream-v1');
    expect(listed).toEqual([batch]);
  });
});

describe('formatRecordDate', () => {
  it('formats a full ISO timestamp as "D Mon YYYY"', () => {
    expect(formatRecordDate('2026-08-04T09:00:00.000Z')).toBe('4 Aug 2026');
  });

  it('formats a bare YYYY-MM-DD string the same way', () => {
    expect(formatRecordDate('2026-08-02')).toBe('2 Aug 2026');
  });
});

// Blank, zero, and the snapshot that does not move (02-01 task 2).
describe('the blank/zero/plan-never-leaks discipline', () => {
  it('blank is absent: an untouched row has no key, hasAsMade is false, asMadeFor is null', () => {
    const batch = createBatch(
      oliveOilVersion,
      { churnDate: '2026-08-02', asMade: { 'row-01': [383] } },
      { id: 'b-1', now: '2026-08-04T09:00:00.000Z' },
    );
    expect(hasAsMade(batch, 'row-02')).toBe(false);
    expect(asMadeFor(batch, 'row-02')).toBe(null);
    expect(asMadeForPortion(batch, 'row-02', 0)).toBe(null);
    expect('row-02' in batch.churn.asMade).toBe(false);
  });

  it('zero is a value: a written 0 is present and reads back as 0, not null', () => {
    const batch = createBatch(
      oliveOilVersion,
      { churnDate: '2026-08-02', asMade: { 'row-09': [0] } },
      { id: 'b-1', now: '2026-08-04T09:00:00.000Z' },
    );
    expect(hasAsMade(batch, 'row-09')).toBe(true);
    expect(asMadeFor(batch, 'row-09')).toEqual([0]);
    expect(asMadeForPortion(batch, 'row-09', 0)).toBe(0);
  });

  it('the plan never leaks: an untouched row with grams still reads asMadeFor as null', () => {
    const batch = createBatch(
      oliveOilVersion,
      { churnDate: '2026-08-02', asMade: {} },
      { id: 'b-1', now: '2026-08-04T09:00:00.000Z' },
    );
    expect(rowGrams(oliveOilVersion.rows.find((row) => row.id === 'row-01'))).toBeGreaterThan(0);
    expect(asMadeFor(batch, 'row-01')).toBe(null);
  });

  it('empty as-made round-trips through the repository double unchanged', async () => {
    const repository = createRepositoryDouble();
    const batch = createBatch(oliveOilVersion, { churnDate: '2026-08-02', asMade: {} }, { id: 'b-1', now: '2026-08-04T09:00:00.000Z' });
    expect(Object.keys(batch.churn.asMade)).toHaveLength(0);

    await repository.saveBatch(batch);
    const reloaded = await repository.getBatch('b-1');
    expect(Object.keys(reloaded.churn.asMade)).toHaveLength(0);
  });

  it('a full as-made on all twelve rows produces twelve keys', () => {
    const asMade = {};
    for (const row of oliveOilVersion.rows) asMade[row.id] = [1];
    const batch = createBatch(oliveOilVersion, { churnDate: '2026-08-02', asMade }, { id: 'b-1', now: '2026-08-04T09:00:00.000Z' });
    expect(Object.keys(batch.churn.asMade)).toHaveLength(12);
  });

  it('an as-made value is never rounded, however fine its precision', () => {
    const batch = createBatch(
      oliveOilVersion,
      { churnDate: '2026-08-02', asMade: { 'row-01': [383.25] } },
      { id: 'b-1', now: '2026-08-04T09:00:00.000Z' },
    );
    expect(asMadeForPortion(batch, 'row-01', 0)).toBe(383.25);
  });

  it('the snapshot survives a whole-version edit made after createBatch', () => {
    const version = structuredClone(oliveOilVersion);
    const batch = createBatch(version, { churnDate: '2026-08-02', asMade: {} }, { id: 'b-1', now: '2026-08-04T09:00:00.000Z' });

    version.rows = [];
    version.coefficientSetId = 'some-other-set';

    expect(batch.snapshot.rows).toHaveLength(12);
    expect(batch.snapshot.coefficientSetId).toBe('2026.1-slice-transcription');
  });
});

// Method: strike or change, one line per step (02-02 task 1, D-10, D-11, D-13).
describe('stepChangeFor / isStruck / changedLineFor', () => {
  const stepChanges = {
    '1': { struck: true, line: null },
    '8': { struck: false, line: 'blend 60 s' },
  };
  const batch = createBatch(
    oliveOilVersion,
    { churnDate: '2026-08-02', asMade: {}, stepChanges },
    { id: 'b-1', now: '2026-08-04T09:00:00.000Z' },
  );

  it('stepChangeFor returns null for a step the maker did not touch', () => {
    expect(stepChangeFor(batch, 3)).toBe(null);
  });

  it('isStruck is true only for a struck step; an untouched step is not struck and is not "done as written"', () => {
    expect(isStruck(batch, 1)).toBe(true);
    expect(isStruck(batch, 8)).toBe(false);
    expect(isStruck(batch, 3)).toBe(false);
  });

  it('changedLineFor returns the line, or null when the step has none', () => {
    expect(changedLineFor(batch, 8)).toBe('blend 60 s');
    expect(changedLineFor(batch, 1)).toBe(null);
    expect(changedLineFor(batch, 3)).toBe(null);
  });

  it('a step may be struck and carry a line at once', () => {
    const both = createBatch(
      oliveOilVersion,
      { churnDate: '2026-08-02', asMade: {}, stepChanges: { '1': { struck: true, line: 'skipped, drizzled instead' } } },
      { id: 'b-2', now: '2026-08-04T09:00:00.000Z' },
    );
    expect(isStruck(both, 1)).toBe(true);
    expect(changedLineFor(both, 1)).toBe('skipped, drizzled instead');
  });

  it('presence is decided by an own-property check, not a special case for step 0', () => {
    const zeroKeyed = createBatch(
      oliveOilVersion,
      { churnDate: '2026-08-02', asMade: {}, stepChanges: { '0': { struck: true, line: null } } },
      { id: 'b-3', now: '2026-08-04T09:00:00.000Z' },
    );
    expect(isStruck(zeroKeyed, 0)).toBe(true);
    expect(stepChangeFor(zeroKeyed, 1)).toBe(null);
  });
});

// The churn section's measured values: unit-on-the-label reading, unknown
// in words, never rounded (02-02 task 2, D-17, D-18, BATCH1-02).
describe('readMeasured', () => {
  it('a blank measurement reads unknown for both null and undefined', () => {
    expect(readMeasured(null)).toBe('unknown');
    expect(readMeasured(undefined)).toBe('unknown');
  });

  it('a written zero is a value, not unknown', () => {
    expect(readMeasured(0)).toBe('0');
  });

  it('an unsigned value reads exactly as stored', () => {
    expect(readMeasured(20)).toBe('20');
  });

  it('a signed value carries a leading + or the Unicode minus sign U+2212', () => {
    expect(readMeasured(-6, { signed: true })).toBe('−6');
    expect(readMeasured(4, { signed: true })).toBe('+4');
  });

  it('a signed zero carries no sign', () => {
    expect(readMeasured(0, { signed: true })).toBe('0');
  });

  it('never rounds, however fine the typed precision', () => {
    expect(readMeasured(6.25, { signed: true })).toBe('+6.25');
    expect(readMeasured(20.5)).toBe('20.5');
  });
});

describe('the churn section round trip: unrounded, and overrunPercent stays null rather than 0', () => {
  it('stores exactly what createBatch was given for the working case', () => {
    const batch = createBatch(
      oliveOilVersion,
      {
        churnDate: '2026-08-02',
        asMade: {},
        comeUpMinutes: 20,
        drawTempC: -6,
        overrunPercent: null,
        drawNotes: 'Soft, not greasy',
      },
      { id: 'b-1', now: '2026-08-04T09:00:00.000Z' },
    );
    expect(batch.churn.comeUpMinutes).toBe(20);
    expect(batch.churn.drawTempC).toBe(-6);
    expect(batch.churn.overrunPercent).toBe(null);
    expect(batch.churn.drawNotes).toBe('Soft, not greasy');
    expect(readMeasured(batch.churn.overrunPercent)).toBe('unknown');
  });
});

describe('asMadeTotals', () => {
  it('sums the plan and treats no-as-made as plan-equals-as-made', () => {
    const { planTotal, asMadeTotal } = asMadeTotals(oliveOilVersion.rows, {});
    expect(planTotal).toBeCloseTo(799.68, 2);
    expect(asMadeTotal).toBeCloseTo(799.68, 2);
  });

  // The seeded batch's own as-made map (D-10): whole milk's two portions
  // both written (120 + 263), counting the written 0 on soy lecithin.
  it("sums the seeded batch's own as-made entries, counting the written 0 on row-09", () => {
    const { planTotal, asMadeTotal } = asMadeTotals(oliveOilVersion.rows, augustSecondBatch.churn.asMade);
    expect(planTotal).toBeCloseTo(799.68, 2);
    expect(asMadeTotal).toBeCloseTo(804.28, 2);
  });

  it('removing the written 0 raises the as-made total by the row plan grams', () => {
    const withZero = asMadeTotals(oliveOilVersion.rows, { 'row-09': [0] }).asMadeTotal;
    const withoutEntry = asMadeTotals(oliveOilVersion.rows, {}).asMadeTotal;
    expect(withoutEntry - withZero).toBeCloseTo(1.2, 2);
  });

  // The recording draft stores as-made values as typed strings until save
  // (D-18) — IngredientTable.jsx feeds that draft straight into
  // asMadeTotals. A string summed with += concatenates rather than adds,
  // so this reproduces the crash a maker hit on the very first keystroke
  // into any as-made cell (and immediately on Amend for an already-recorded
  // batch): before the fix, asMadeTotal came out as a concatenated string
  // instead of the number 804.28, and the sum below is not a number at all.
  it('sums the 2 Aug as-made entries when they arrive as the recording draft\'s strings', () => {
    const asMade = { 'row-01': ['120', '263'], 'row-02': ['241'], 'row-03': ['45'], 'row-09': ['0'] };
    const { planTotal, asMadeTotal } = asMadeTotals(oliveOilVersion.rows, asMade);
    expect(planTotal).toBeCloseTo(799.68, 2);
    expect(asMadeTotal).toBeCloseTo(804.28, 2);
  });

  it('treats a non-numeric as-made element as absent, falling back to that portion\'s own plan grams', () => {
    const withGarbage = asMadeTotals(oliveOilVersion.rows, { 'row-01': ['abc', 'abc'] }).asMadeTotal;
    const withoutEntry = asMadeTotals(oliveOilVersion.rows, {}).asMadeTotal;
    expect(withGarbage).toBeCloseTo(withoutEntry, 2);
  });

  it('a row whose key is present with one written portion and one null portion takes the written value for the first and the plan amount for the second', () => {
    const rows = [{ id: 'r', portions: [{ step: 1, grams: 10 }, { step: 2, grams: 20 }] }];
    const { asMadeTotal } = asMadeTotals(rows, { r: [15, null] });
    expect(asMadeTotal).toBe(15 + 20);
  });

  it('a row with no as-made key contributes its whole plan total, summed across every one of its portions', () => {
    const rows = [{ id: 'r', portions: [{ step: 1, grams: 10 }, { step: 2, grams: 20 }] }];
    const { asMadeTotal } = asMadeTotals(rows, {});
    expect(asMadeTotal).toBe(30);
  });
});

describe('asMadeForPortion', () => {
  it("returns 0, not null, for the soy lecithin's written zero", () => {
    expect(asMadeForPortion(augustSecondBatch, 'row-09', 0)).toBe(0);
  });
});

// A tasting is its own dated event on the batch (02-03 task 1, D-01, D-02,
// D-03, D-06, OBS1-01). Never an amendment, never retakes the snapshot.
describe('isTastingSaveable', () => {
  it('words with content is saveable', () => {
    expect(isTastingSaveable({ words: 'thin, oil forward' })).toBe(true);
  });

  it('an empty words string is not saveable', () => {
    expect(isTastingSaveable({ words: '' })).toBe(false);
  });

  it('no words and no marks is not saveable', () => {
    expect(isTastingSaveable({})).toBe(false);
  });

  it('whitespace-only words is not saveable: the gate trims first', () => {
    expect(isTastingSaveable({ words: '   ' })).toBe(false);
    expect(isTastingSaveable({ words: '\t\n' })).toBe(false);
    expect(isTastingSaveable({ words: ' ' })).toBe(false);
  });

  it('a single emoji is saveable words, even though it occupies two UTF-16 code units', () => {
    expect(isTastingSaveable({ words: '🍦' })).toBe(true);
  });

  it('a marks object with at least one own key is saveable', () => {
    expect(isTastingSaveable({ marks: { sweetness: 4 } })).toBe(true);
  });

  it('an empty marks object is not saveable', () => {
    expect(isTastingSaveable({ marks: {} })).toBe(false);
  });

  it('a mark of 0 is saveable: presence of the key is what counts, not the value', () => {
    expect(isTastingSaveable({ marks: { sweetness: 0 } })).toBe(true);
  });
});

describe('sortedTastings / hasTasting', () => {
  it('an empty tastings array sorts to empty and hasTasting is false', () => {
    const batch = { tastings: [] };
    expect(sortedTastings(batch)).toEqual([]);
    expect(hasTasting(batch)).toBe(false);
  });

  it('a batch with exactly one tasting returns that one and hasTasting is true', () => {
    const tasting = { id: 't-1', date: '2026-08-04' };
    const batch = { tastings: [tasting] };
    expect(sortedTastings(batch)).toEqual([tasting]);
    expect(hasTasting(batch)).toBe(true);
  });

  it('orders four tastings by date ascending, undated last', () => {
    const t1 = { id: 't-1', date: '2026-08-05' };
    const t2 = { id: 't-2', date: '2026-08-03' };
    const t3 = { id: 't-3', date: null };
    const t4 = { id: 't-4', date: '2026-08-04' };
    const batch = { tastings: [t1, t2, t3, t4] };
    expect(sortedTastings(batch).map((t) => t.id)).toEqual(['t-2', 't-4', 't-1', 't-3']);
  });

  it('two undated tastings keep the order they were added', () => {
    const t1 = { id: 't-1', date: null };
    const t2 = { id: 't-2', date: null };
    const batch = { tastings: [t1, t2] };
    expect(sortedTastings(batch).map((t) => t.id)).toEqual(['t-1', 't-2']);
  });

  it('does not sort the batch tastings array in place', () => {
    const t1 = { id: 't-1', date: '2026-08-05' };
    const t2 = { id: 't-2', date: '2026-08-03' };
    const batch = { tastings: [t1, t2] };
    sortedTastings(batch);
    expect(batch.tastings).toEqual([t1, t2]);
  });
});

describe('addTasting', () => {
  it('appends a tasting and leaves snapshot, recordedAt, amendedAt unchanged (never an amendment, D-06)', () => {
    const batch = createBatch(
      oliveOilVersion,
      { churnDate: '2026-08-02', asMade: {} },
      { id: 'b-1', now: '2026-08-04T09:00:00.000Z' },
    );
    const updated = addTasting(batch, { words: 'thin' }, { id: 't-1' });
    expect(updated.tastings).toHaveLength(1);
    expect(updated.tastings[0].id).toBe('t-1');
    expect(updated.tastings[0].words).toBe('thin');
    expect(updated.snapshot).toBe(batch.snapshot);
    expect(updated.recordedAt).toBe(batch.recordedAt);
    expect(updated.amendedAt).toBe(batch.amendedAt);
  });

  it('does not mutate the original batch tastings array', () => {
    const batch = createBatch(
      oliveOilVersion,
      { churnDate: '2026-08-02', asMade: {} },
      { id: 'b-1', now: '2026-08-04T09:00:00.000Z' },
    );
    const originalLength = batch.tastings.length;
    addTasting(batch, { words: 'thin' }, { id: 't-1' });
    expect(batch.tastings).toHaveLength(originalLength);
  });
});

// Amend, and the version's latest churn date (02-03 task 3, D-06, D-21).
describe('recordAmendment', () => {
  const newChurn = {
    churnDate: '2026-08-02',
    asMade: { 'row-01': 400 },
    stepChanges: {},
    comeUpMinutes: 22,
    drawTempC: -6,
    overrunPercent: null,
    drawNotes: 'ok',
    ingredientNotes: null,
    nextTimeNote: null,
  };

  it('replaces the churn fields, appends amendedAt, leaves recordedAt/tastings/snapshot unchanged', () => {
    const batch = createBatch(
      oliveOilVersion,
      { churnDate: '2026-08-02', asMade: {} },
      { id: 'b-1', now: '2026-08-04T09:00:00.000Z' },
    );
    const amended = recordAmendment(batch, newChurn, '2026-09-06');
    expect(amended.churn).toEqual(newChurn);
    expect(amended.amendedAt).toEqual(['2026-09-06']);
    expect(amended.recordedAt).toBe(batch.recordedAt);
    expect(amended.tastings).toBe(batch.tastings);
    expect(amended.snapshot).toBe(batch.snapshot);
  });

  it('appends two dates in order across two amendments, without mutating the original', () => {
    const batch = createBatch(
      oliveOilVersion,
      { churnDate: '2026-08-02', asMade: {} },
      { id: 'b-1', now: '2026-08-04T09:00:00.000Z' },
    );
    const once = recordAmendment(batch, newChurn, '2026-09-01');
    const twice = recordAmendment(once, newChurn, '2026-09-06');
    expect(twice.amendedAt).toEqual(['2026-09-01', '2026-09-06']);
    expect(batch.amendedAt).toEqual([]);
  });
});

describe('latestChurnDate', () => {
  it('returns the most recent churn date across batches, ignoring undated ones', () => {
    const batches = [
      { churn: { churnDate: '2026-08-02' } },
      { churn: { churnDate: '2026-09-01' } },
      { churn: { churnDate: null } },
    ];
    expect(latestChurnDate(batches)).toBe('2026-09-01');
  });

  it('returns null for an empty list', () => {
    expect(latestChurnDate([])).toBe(null);
  });

  it('returns null when every batch is undated', () => {
    expect(latestChurnDate([{ churn: { churnDate: null } }, { churn: { churnDate: null } }])).toBe(null);
  });
});

// The 2 Aug 2026 working case, confirmed by Mark (02-CONTEXT.md D-10 to
// D-13), built through createBatch and addTasting.
describe('augustSecondBatch (the 2 Aug 2026 working case)', () => {
  it('churns against the seeded version with the confirmed as-made amounts', () => {
    expect(augustSecondBatch.versionId).toBe('olive-oil-ice-cream-v1');
    expect(augustSecondBatch.churn.churnDate).toBe('2026-08-02');
    expect(augustSecondBatch.churn.asMade).toEqual({
      'row-01': [120, 263],
      'row-02': [241],
      'row-03': [45],
      'row-09': [0],
    });
    expect(Object.keys(augustSecondBatch.churn.asMade)).toHaveLength(4);
  });

  it('carries the confirmed measured churn values, overrun stored absent not zero', () => {
    expect(augustSecondBatch.churn.comeUpMinutes).toBe(20);
    expect(augustSecondBatch.churn.drawTempC).toBe(-6);
    expect(augustSecondBatch.churn.overrunPercent).toBe(null);
    expect(augustSecondBatch.churn.drawNotes).toBe('Soft, not greasy');
    expect(augustSecondBatch.amendedAt).toEqual([]);
  });

  it('step 1 is struck, steps 8 and 9 carry their changed lines, step 3 carries nothing', () => {
    expect(isStruck(augustSecondBatch, 1)).toBe(true);
    expect(isStruck(augustSecondBatch, 8)).toBe(false);
    expect(changedLineFor(augustSecondBatch, 8)).toBe('blend 60 s');
    expect(changedLineFor(augustSecondBatch, 9)).toContain('Speed Δ @ 20 min');
    expect(stepChangeFor(augustSecondBatch, 3)).toBe(null);
  });

  it('carries exactly one undated tasting with the confirmed marks', () => {
    expect(augustSecondBatch.tastings).toHaveLength(1);
    const tasting = augustSecondBatch.tastings[0];
    expect(tasting.date).toBe(null);
    expect(tasting.tastingTempC).toBe(-12);
    expect(tasting.meltdownLossG).toBe(3);
    expect(tasting.words).toBe(null);
    expect(Object.keys(tasting.marks)).toHaveLength(3);
    expect(tasting.marks['Olive oil character']).toBe(4.5);
    expect(tasting.marks.Bitterness).toBe(5);
    expect(tasting.marks.sweetness).toBe(4);
    expect(tasting.marks).not.toHaveProperty('hardness');
    expect(tasting.marks).not.toHaveProperty('scoopability');
    expect(tasting.marks).not.toHaveProperty('smoothness');
  });

  it('has a fixed id and recorded-on date so the seeded URL and reading line are stable', () => {
    expect(augustSecondBatch.id).toBe('b8cc3566-48a4-4b23-b6e5-749a332afe89');
    expect(augustSecondBatch.recordedAt).toBe('2026-08-04T00:00:00.000Z');
    expect(formatRecordDate(augustSecondBatch.recordedAt)).toBe('4 Aug 2026');
  });
});
