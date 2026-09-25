// Domain suite for the battery's one-save batch record
// (03.3.1-CONTEXT.md D-01 through D-04, D-07, D-09, D-10; BATCH2-01).
// Runs under Vitest's default node environment — imports no store, no
// component, and no framework.
import { describe, it, expect } from 'vitest';
import {
  createBatch,
  completeRecord,
  formatRecordDate,
  recordDateWords,
  dayMonthWords,
  batchIdentity,
  tastingProvenance,
  hasAsMade,
  asMadeFor,
  asMadeForPortion,
  asMadeTotals,
  stepChangeFor,
  isStruck,
  changedLineFor,
  readMeasured,
  sortedBatches,
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

const CHURN_ONLY = { churnDate: '2026-08-02', asMade: { 'row-01': [383] } };

describe('recordDateWords', () => {
  it('formats a stored date and keeps a missing imported date readable', () => {
    expect(recordDateWords('2026-08-02')).toBe('2 Aug 2026');
    expect(recordDateWords(null)).toBe('date unknown');
    expect(recordDateWords('')).toBe('date unknown');
  });
});

// The History rail's own compact date (03.5-05): day and month, no year.
describe('dayMonthWords', () => {
  it('drops the year from a full timestamp and a bare date, and reads unknown when absent', () => {
    expect(dayMonthWords('2026-07-01T00:00:00.000Z')).toBe('1 Jul');
    expect(dayMonthWords('2026-08-02')).toBe('2 Aug');
    expect(dayMonthWords(null)).toBe('date unknown');
  });
});

describe('createBatch', () => {
  it('returns a record with the supplied id, versionId, recordedAt, changed null and tasting null when tastingFields is null', () => {
    const batch = createBatch(oliveOilVersion, CHURN_ONLY, null, { id: 'b-1', now: '2026-08-04T09:00:00.000Z' });
    expect(batch.schemaVersion).toBe(BATCH_SCHEMA_VERSION);
    expect(batch.id).toBe('b-1');
    expect(batch.versionId).toBe('olive-oil-ice-cream-v1');
    expect(batch.recordedAt).toBe('2026-08-04T09:00:00.000Z');
    expect(batch.changed).toBe(null);
    expect(batch.tasting).toBe(null);
  });

  it("snapshots twelve rows, the version's coefficient set id, declared axes, and declared flaw", () => {
    const batch = createBatch(oliveOilVersion, CHURN_ONLY, null, { id: 'b-1', now: '2026-08-04T09:00:00.000Z' });
    expect(batch.snapshot.rows).toHaveLength(12);
    expect(batch.snapshot.coefficientSetId).toBe('2026.1-slice-transcription');
    expect(batch.snapshot.declaredAxes).toEqual(['Body', 'Oil']);
    expect(batch.snapshot.declaredFlaw).toBe('Bitter');
  });

  it('the snapshot does not move when the version is edited afterwards (BATCH2-01)', () => {
    const version = structuredClone(oliveOilVersion);
    const batch = createBatch(version, CHURN_ONLY, null, { id: 'b-1', now: '2026-08-04T09:00:00.000Z' });
    const originalGrams = version.rows[0].portions[0].grams;
    const originalFat = version.rows[0].ingredient.composition.fat;

    version.rows[0].portions[0].grams = 999;
    version.rows[0].ingredient.composition.fat = 999;
    version.declaredAxes = [];
    version.declaredFlaw = null;

    expect(batch.snapshot.rows[0].portions[0].grams).toBe(originalGrams);
    expect(batch.snapshot.rows[0].ingredient.composition.fat).toBe(originalFat);
    expect(batch.snapshot.declaredAxes).toEqual(['Body', 'Oil']);
    expect(batch.snapshot.declaredFlaw).toBe('Bitter');
  });

  it('a zero-or-one tasting: passing tastingFields builds the single tasting object', () => {
    const batch = createBatch(
      oliveOilVersion,
      CHURN_ONLY,
      { marks: { sweetness: 4 } },
      { id: 'b-1', now: '2026-08-04T09:00:00.000Z' },
    );
    expect(batch.tasting).not.toBe(null);
    expect(batch.tasting.marks).toEqual({ sweetness: 4 });
  });

  it('a null tastingFields manufactures no empty tasting record', () => {
    const batch = createBatch(oliveOilVersion, CHURN_ONLY, null, { id: 'b-1', now: '2026-08-04T09:00:00.000Z' });
    expect(batch.tasting).toBe(null);
  });

  it('round-trips through a plain repository double', async () => {
    const repository = createRepositoryDouble();
    const batch = createBatch(oliveOilVersion, CHURN_ONLY, null, { id: 'b-1', now: '2026-08-04T09:00:00.000Z' });

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

// batchIdentity and tastingProvenance (HIST-03, HIST-04): one attempt
// identity and one attempt provenance, shared by the recipe-level History
// outline and the version-level Batches register.
describe('batchIdentity', () => {
  it('names the churn date', () => {
    expect(batchIdentity({ churn: { churnDate: '2026-08-02' } })).toBe('Batch · 2 Aug 2026');
  });

  it('reads "date unknown" through recordDateWords when the churn date is absent', () => {
    expect(batchIdentity({ churn: { churnDate: null } })).toBe('Batch · date unknown');
  });
});

describe('tastingProvenance', () => {
  it('names the tasted date when the tasting carries one', () => {
    expect(tastingProvenance({ tasting: { tastedDate: '2026-08-03' } })).toBe('Tasted 3 Aug 2026');
  });

  it('reads "Tasted date unknown" for a tasting with no date', () => {
    expect(tastingProvenance(augustSecondBatch)).toBe('Tasted date unknown');
  });

  it('reads "Not yet tasted" when the batch carries no tasting at all', () => {
    expect(tastingProvenance({ tasting: null })).toBe('Not yet tasted');
  });
});

// Blank, zero, and the snapshot that does not move.
describe('the blank/zero/plan-never-leaks discipline', () => {
  it('blank is absent: an untouched row has no key, hasAsMade is false, asMadeFor is null', () => {
    const batch = createBatch(oliveOilVersion, CHURN_ONLY, null, { id: 'b-1', now: '2026-08-04T09:00:00.000Z' });
    expect(hasAsMade(batch, 'row-02')).toBe(false);
    expect(asMadeFor(batch, 'row-02')).toBe(null);
    expect(asMadeForPortion(batch, 'row-02', 0)).toBe(null);
    expect('row-02' in batch.churn.asMade).toBe(false);
  });

  it('zero is a value: a written 0 is present and reads back as 0, not null', () => {
    const batch = createBatch(
      oliveOilVersion,
      { churnDate: '2026-08-02', asMade: { 'row-09': [0] } },
      null,
      { id: 'b-1', now: '2026-08-04T09:00:00.000Z' },
    );
    expect(hasAsMade(batch, 'row-09')).toBe(true);
    expect(asMadeFor(batch, 'row-09')).toEqual([0]);
    expect(asMadeForPortion(batch, 'row-09', 0)).toBe(0);
  });

  it('the plan never leaks: an untouched row with grams still reads asMadeFor as null', () => {
    const batch = createBatch(oliveOilVersion, { churnDate: '2026-08-02', asMade: {} }, null, {
      id: 'b-1',
      now: '2026-08-04T09:00:00.000Z',
    });
    expect(rowGrams(oliveOilVersion.rows.find((row) => row.id === 'row-01'))).toBeGreaterThan(0);
    expect(asMadeFor(batch, 'row-01')).toBe(null);
  });

  it('every new churn field is absent, never zero, when not supplied', () => {
    const batch = createBatch(oliveOilVersion, { churnDate: '2026-08-02', asMade: {} }, null, {
      id: 'b-1',
      now: '2026-08-04T09:00:00.000Z',
    });
    expect(batch.churn.timeToDrawTempMinutes).toBe(null);
    expect(batch.churn.outOfMachineTempC).toBe(null);
    expect(batch.churn.churnDurationMinutes).toBe(null);
    expect(batch.churn.exitConsistency).toBe(null);
    expect(batch.churn.airiness).toBe(null);
    expect(batch.churn.atTheMachine).toBe(null);
  });

  it('a written 0 melt test survives as a real value, not absent', () => {
    const batch = createBatch(
      oliveOilVersion,
      CHURN_ONLY,
      { marks: {}, meltTestG: 0 },
      { id: 'b-1', now: '2026-08-04T09:00:00.000Z' },
    );
    expect(batch.tasting.meltTestG).toBe(0);
  });

  it('an unmarked axis is absent from marks, never zero', () => {
    const batch = createBatch(
      oliveOilVersion,
      CHURN_ONLY,
      { marks: { sweetness: 4 } },
      { id: 'b-1', now: '2026-08-04T09:00:00.000Z' },
    );
    expect(batch.tasting.marks).not.toHaveProperty('hardness');
    expect(Object.keys(batch.tasting.marks)).toEqual(['sweetness']);
  });

  it('bitterDeclared is true-or-null, never false', () => {
    const declared = createBatch(oliveOilVersion, CHURN_ONLY, { marks: {}, bitterDeclared: true }, { id: 'b-1', now: 'x' });
    const undeclared = createBatch(oliveOilVersion, CHURN_ONLY, { marks: {} }, { id: 'b-2', now: 'x' });
    expect(declared.tasting.bitterDeclared).toBe(true);
    expect(undeclared.tasting.bitterDeclared).toBe(null);
  });

  it('defects is a copy of the supplied array, or null when none', () => {
    const withDefects = createBatch(oliveOilVersion, CHURN_ONLY, { marks: {}, defects: ['Sandy, gritty'] }, { id: 'b-1', now: 'x' });
    const withoutDefects = createBatch(oliveOilVersion, CHURN_ONLY, { marks: {} }, { id: 'b-2', now: 'x' });
    expect(withDefects.tasting.defects).toEqual(['Sandy, gritty']);
    expect(withoutDefects.tasting.defects).toBe(null);
  });

  it('empty as-made round-trips through the repository double unchanged', async () => {
    const repository = createRepositoryDouble();
    const batch = createBatch(oliveOilVersion, { churnDate: '2026-08-02', asMade: {} }, null, {
      id: 'b-1',
      now: '2026-08-04T09:00:00.000Z',
    });
    expect(Object.keys(batch.churn.asMade)).toHaveLength(0);

    await repository.saveBatch(batch);
    const reloaded = await repository.getBatch('b-1');
    expect(Object.keys(reloaded.churn.asMade)).toHaveLength(0);
  });

  it('a full as-made on all twelve rows produces twelve keys', () => {
    const asMade = {};
    for (const row of oliveOilVersion.rows) asMade[row.id] = [1];
    const batch = createBatch(oliveOilVersion, { churnDate: '2026-08-02', asMade }, null, {
      id: 'b-1',
      now: '2026-08-04T09:00:00.000Z',
    });
    expect(Object.keys(batch.churn.asMade)).toHaveLength(12);
  });

  it('an as-made value is never rounded, however fine its precision', () => {
    const batch = createBatch(
      oliveOilVersion,
      { churnDate: '2026-08-02', asMade: { 'row-01': [383.25] } },
      null,
      { id: 'b-1', now: '2026-08-04T09:00:00.000Z' },
    );
    expect(asMadeForPortion(batch, 'row-01', 0)).toBe(383.25);
  });
});

// Method: strike or change, one line per step.
describe('stepChangeFor / isStruck / changedLineFor', () => {
  const stepChanges = {
    '1': { struck: true, line: null },
    '8': { struck: false, line: 'blend 60 s' },
  };
  const batch = createBatch(
    oliveOilVersion,
    { churnDate: '2026-08-02', asMade: {}, stepChanges },
    null,
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
      null,
      { id: 'b-2', now: '2026-08-04T09:00:00.000Z' },
    );
    expect(isStruck(both, 1)).toBe(true);
    expect(changedLineFor(both, 1)).toBe('skipped, drizzled instead');
  });

  it('presence is decided by an own-property check, not a special case for step 0', () => {
    const zeroKeyed = createBatch(
      oliveOilVersion,
      { churnDate: '2026-08-02', asMade: {}, stepChanges: { '0': { struck: true, line: null } } },
      null,
      { id: 'b-3', now: '2026-08-04T09:00:00.000Z' },
    );
    expect(isStruck(zeroKeyed, 0)).toBe(true);
    expect(stepChangeFor(zeroKeyed, 1)).toBe(null);
  });
});

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

describe('the churn section round trip: unrounded, and blank battery fields stay null rather than 0', () => {
  it('stores exactly what createBatch was given for the working case', () => {
    const batch = createBatch(
      oliveOilVersion,
      {
        churnDate: '2026-08-02',
        asMade: {},
        timeToDrawTempMinutes: 20,
        outOfMachineTempC: -6,
        churnDurationMinutes: null,
        atTheMachine: 'Soft, not greasy',
      },
      null,
      { id: 'b-1', now: '2026-08-04T09:00:00.000Z' },
    );
    expect(batch.churn.timeToDrawTempMinutes).toBe(20);
    expect(batch.churn.outOfMachineTempC).toBe(-6);
    expect(batch.churn.churnDurationMinutes).toBe(null);
    expect(batch.churn.atTheMachine).toBe('Soft, not greasy');
    expect(readMeasured(batch.churn.churnDurationMinutes)).toBe('unknown');
  });
});

describe('asMadeTotals', () => {
  it('sums the plan and treats no-as-made as plan-equals-as-made', () => {
    const { planTotal, asMadeTotal } = asMadeTotals(oliveOilVersion.rows, {});
    expect(planTotal).toBeCloseTo(799.68, 2);
    expect(asMadeTotal).toBeCloseTo(799.68, 2);
  });

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

describe('completeRecord', () => {
  it('replaces churn wholesale and stamps changed with now', () => {
    const batch = createBatch(oliveOilVersion, CHURN_ONLY, null, { id: 'b-1', now: '2026-08-04T09:00:00.000Z' });
    const newChurn = { churnDate: '2026-08-02', asMade: { 'row-01': [400] }, atTheMachine: 'ok' };
    const updated = completeRecord(batch, newChurn, null, { now: '2026-09-06' });
    expect(updated.churn.asMade['row-01']).toEqual([400]);
    expect(updated.churn.atTheMachine).toBe('ok');
    expect(updated.changed).toBe('2026-09-06');
  });

  it('a completing save with tasting data assembles churn plus tasting in one save', () => {
    const batch = createBatch(oliveOilVersion, CHURN_ONLY, null, { id: 'b-1', now: '2026-08-04T09:00:00.000Z' });
    const updated = completeRecord(batch, CHURN_ONLY, { marks: { sweetness: 4 } }, { now: '2026-08-05' });
    expect(updated.tasting.marks).toEqual({ sweetness: 4 });
    expect(updated.changed).toBe('2026-08-05');
  });

  it('a null tasting argument removes a stored tasting (D-02\'s literal reading)', () => {
    const batch = createBatch(oliveOilVersion, CHURN_ONLY, { marks: { sweetness: 4 } }, { id: 'b-1', now: 'x' });
    expect(batch.tasting).not.toBe(null);
    const updated = completeRecord(batch, CHURN_ONLY, null, { now: '2026-08-05' });
    expect(updated.tasting).toBe(null);
  });

  it('leaves recordedAt, snapshot and id untouched — the snapshot is never retaken (BATCH2-01)', () => {
    const batch = createBatch(oliveOilVersion, CHURN_ONLY, null, { id: 'b-1', now: '2026-08-04T09:00:00.000Z' });
    const updated = completeRecord(batch, CHURN_ONLY, null, { now: '2026-08-05' });
    expect(updated.id).toBe(batch.id);
    expect(updated.recordedAt).toBe(batch.recordedAt);
    expect(updated.snapshot).toBe(batch.snapshot);
  });

  it('does not mutate the original batch', () => {
    const batch = createBatch(oliveOilVersion, CHURN_ONLY, null, { id: 'b-1', now: '2026-08-04T09:00:00.000Z' });
    const originalChanged = batch.changed;
    completeRecord(batch, CHURN_ONLY, null, { now: '2026-08-05' });
    expect(batch.changed).toBe(originalChanged);
  });

  it('changed is stamped only by completeRecord, never by createBatch', () => {
    const batch = createBatch(oliveOilVersion, CHURN_ONLY, null, { id: 'b-1', now: '2026-08-04T09:00:00.000Z' });
    expect(batch.changed).toBe(null);
  });
});

describe('sortedBatches', () => {
  it('orders by churn date descending, undated last', () => {
    const batches = [
      { churn: { churnDate: '2026-08-02' } },
      { churn: { churnDate: '2026-09-01' } },
      { churn: { churnDate: null } },
    ];
    expect(sortedBatches(batches).map((b) => b.churn.churnDate)).toEqual(['2026-09-01', '2026-08-02', null]);
  });

  it('does not sort in place', () => {
    const batches = [{ churn: { churnDate: '2026-08-02' } }, { churn: { churnDate: '2026-09-01' } }];
    const original = [...batches];
    sortedBatches(batches);
    expect(batches).toEqual(original);
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

// The 2 Aug 2026 working case, confirmed by Mark (03.3.1-CONTEXT.md D-07),
// built through one createBatch call.
describe('augustSecondBatch (the 2 Aug 2026 working case, on the battery)', () => {
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

  it('carries the confirmed measured churn values', () => {
    expect(augustSecondBatch.churn.timeToDrawTempMinutes).toBe(20);
    expect(augustSecondBatch.churn.outOfMachineTempC).toBe(-6);
    expect(augustSecondBatch.churn.churnDurationMinutes).toBe(30);
    expect(augustSecondBatch.churn.exitConsistency).toBe(null);
    expect(augustSecondBatch.churn.airiness).toBe(null);
    expect(augustSecondBatch.churn.atTheMachine).toBe('Soft, not greasy');
    expect(augustSecondBatch.churn.ingredientNotes).toBe('oil bottle opened 24 Jul');
    expect(augustSecondBatch.changed).toBe(null);
  });

  it('step 1 is struck, steps 8 and 9 carry their changed lines, step 3 carries nothing', () => {
    expect(isStruck(augustSecondBatch, 1)).toBe(true);
    expect(isStruck(augustSecondBatch, 8)).toBe(false);
    expect(changedLineFor(augustSecondBatch, 8)).toBe('blend 60 s');
    expect(changedLineFor(augustSecondBatch, 9)).toContain('Speed Δ @ 20 min');
    expect(stepChangeFor(augustSecondBatch, 3)).toBe(null);
  });

  it('carries exactly one tasting with the confirmed marks and battery fields', () => {
    expect(augustSecondBatch.tasting).not.toBe(null);
    const tasting = augustSecondBatch.tasting;
    expect(tasting.tastedDate).toBe(null);
    expect(tasting.tastingTempC).toBe(-12);
    expect(tasting.temperingMinutes).toBe(null);
    expect(tasting.meltTestG).toBe(3);
    expect(tasting.meltStyle).toBe(null);
    expect(tasting.note).toBe(null);
    expect(tasting.defects).toBe(null);
    expect(tasting.bitterDeclared).toBe(true);
    expect(Object.keys(tasting.marks)).toHaveLength(2);
    expect(tasting.marks.sweetness).toBe(4);
    expect(tasting.marks.oil).toBe(4);
    expect(tasting.marks).not.toHaveProperty('hardness');
    expect(tasting.marks).not.toHaveProperty('scoopability');
    expect(tasting.marks).not.toHaveProperty('smoothness');
    expect(tasting.marks).not.toHaveProperty('body');
  });

  it('has a fixed id and recorded-on date so the seeded URL and reading line are stable', () => {
    expect(augustSecondBatch.id).toBe('b8cc3566-48a4-4b23-b6e5-749a332afe89');
    expect(augustSecondBatch.recordedAt).toBe('2026-08-04T00:00:00.000Z');
    expect(formatRecordDate(augustSecondBatch.recordedAt)).toBe('4 Aug 2026');
  });
});
