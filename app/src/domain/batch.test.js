// Domain suite for the batch record (02-CONTEXT.md D-01, D-11, D-18, D-20,
// BATCH2-01). Runs under Vitest's default node environment — imports no
// store, no component, and no framework.
import { describe, it, expect } from 'vitest';
import { createBatch, formatRecordDate, BATCH_SCHEMA_VERSION } from './batch.js';
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
