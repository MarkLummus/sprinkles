// Domain suite for the batch record (02-CONTEXT.md D-01, D-11, D-18, D-20,
// BATCH2-01). Runs under Vitest's default node environment — imports no
// store, no component, and no framework.
import { describe, it, expect } from 'vitest';
import {
  createBatch,
  formatRecordDate,
  hasAsMade,
  asMadeFor,
  asMadeTotals,
  stepChangeFor,
  isStruck,
  changedLineFor,
  readMeasured,
  BATCH_SCHEMA_VERSION,
} from './batch.js';
import { oliveOilVersion } from '../data/olive-oil.js';

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
      { churnDate: '2026-08-02', asMade: { 'row-01': 383 } },
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
    const originalGrams = version.rows[0].grams;
    const originalFat = version.rows[0].ingredient.composition.fat;

    version.rows[0].grams = 999;
    version.rows[0].ingredient.composition.fat = 999;

    expect(batch.snapshot.rows[0].grams).toBe(originalGrams);
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
      { churnDate: '2026-08-02', asMade: { 'row-01': 383 } },
      { id: 'b-1', now: '2026-08-04T09:00:00.000Z' },
    );

    await repository.saveBatch(batch);

    const reloaded = await repository.getBatch('b-1');
    expect(reloaded.churn.asMade['row-01']).toBe(383);

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
      { churnDate: '2026-08-02', asMade: { 'row-01': 383 } },
      { id: 'b-1', now: '2026-08-04T09:00:00.000Z' },
    );
    expect(hasAsMade(batch, 'row-02')).toBe(false);
    expect(asMadeFor(batch, 'row-02')).toBe(null);
    expect('row-02' in batch.churn.asMade).toBe(false);
  });

  it('zero is a value: a written 0 is present and reads back as 0, not null', () => {
    const batch = createBatch(
      oliveOilVersion,
      { churnDate: '2026-08-02', asMade: { 'row-09': 0 } },
      { id: 'b-1', now: '2026-08-04T09:00:00.000Z' },
    );
    expect(hasAsMade(batch, 'row-09')).toBe(true);
    expect(asMadeFor(batch, 'row-09')).toBe(0);
  });

  it('the plan never leaks: an untouched row with grams still reads asMadeFor as null', () => {
    const batch = createBatch(
      oliveOilVersion,
      { churnDate: '2026-08-02', asMade: {} },
      { id: 'b-1', now: '2026-08-04T09:00:00.000Z' },
    );
    expect(oliveOilVersion.rows.find((row) => row.id === 'row-01').grams).toBeGreaterThan(0);
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
    for (const row of oliveOilVersion.rows) asMade[row.id] = 1;
    const batch = createBatch(oliveOilVersion, { churnDate: '2026-08-02', asMade }, { id: 'b-1', now: '2026-08-04T09:00:00.000Z' });
    expect(Object.keys(batch.churn.asMade)).toHaveLength(12);
  });

  it('an as-made value is never rounded, however fine its precision', () => {
    const batch = createBatch(
      oliveOilVersion,
      { churnDate: '2026-08-02', asMade: { 'row-01': 383.25 } },
      { id: 'b-1', now: '2026-08-04T09:00:00.000Z' },
    );
    expect(asMadeFor(batch, 'row-01')).toBe(383.25);
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

  it('sums the 2 Aug as-made entries, counting the written 0 on row-09', () => {
    const asMade = { 'row-01': 383, 'row-02': 241, 'row-03': 45, 'row-09': 0 };
    const { planTotal, asMadeTotal } = asMadeTotals(oliveOilVersion.rows, asMade);
    expect(planTotal).toBeCloseTo(799.68, 2);
    expect(asMadeTotal).toBeCloseTo(804.28, 2);
  });

  it('removing the written 0 raises the as-made total by the row plan grams', () => {
    const withZero = asMadeTotals(oliveOilVersion.rows, { 'row-09': 0 }).asMadeTotal;
    const withoutEntry = asMadeTotals(oliveOilVersion.rows, {}).asMadeTotal;
    expect(withoutEntry - withZero).toBeCloseTo(1.2, 2);
  });
});
