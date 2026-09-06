import { describe, it, expect } from 'vitest';
import { exportStore, importStore, validateStoreFile } from './transfer.js';

// A plain in-memory object implementing the repository seam's contract —
// no store library, no browser. Mirrors createRepository's putAll/putAllBatches:
// upsert by id, never a wholesale replace. Tracks call counts so a test can
// assert a write method was never invoked (the refuse-whole-file gate).
function createInMemoryRepository(initialVersions = [], initialBatches = []) {
  const versions = [...initialVersions];
  const batches = [...initialBatches];
  let putAllCalls = 0;
  let putAllBatchesCalls = 0;
  return {
    get versions() {
      return versions;
    },
    get batches() {
      return batches;
    },
    get putAllCalls() {
      return putAllCalls;
    },
    get putAllBatchesCalls() {
      return putAllBatchesCalls;
    },
    async getAll() {
      return [...versions];
    },
    async putAll(newVersions) {
      putAllCalls += 1;
      for (const version of newVersions) {
        const i = versions.findIndex((v) => v.id === version.id);
        if (i >= 0) versions[i] = version;
        else versions.push(version);
      }
    },
    async getAllBatches() {
      return [...batches];
    },
    async putAllBatches(newBatches) {
      putAllBatchesCalls += 1;
      for (const batch of newBatches) {
        const i = batches.findIndex((b) => b.id === batch.id);
        if (i >= 0) batches[i] = batch;
        else batches.push(batch);
      }
    },
  };
}

function makeVersion(overrides = {}) {
  return {
    id: 'v1',
    recipeName: 'Test recipe',
    coefficientSetId: 'set-1',
    rows: [
      {
        id: 'row-1',
        ingredientName: 'Whole milk',
        grams: 100,
        ingredient: { composition: { fat: 0.035, msnf: 0.088 } },
      },
    ],
    method: [],
    authored: { carriedForward: [], beforeYouStart: [] },
    ...overrides,
  };
}

function makeBatch(overrides = {}) {
  return {
    schemaVersion: 1,
    id: 'batch-1',
    versionId: 'v1',
    recordedAt: '2026-08-04T09:00:00.000Z',
    amendedAt: [],
    snapshot: {
      coefficientSetId: 'set-1',
      versionLabel: 'Test recipe',
      rows: [
        {
          id: 'row-1',
          ingredientName: 'Whole milk',
          grams: 100,
          ingredient: { composition: { fat: 0.035, msnf: 0.088 } },
        },
      ],
      declaredAxes: [],
    },
    churn: {
      churnDate: '2026-08-02',
      asMade: {},
      stepChanges: {},
      comeUpMinutes: null,
      drawTempC: null,
      overrunPercent: null,
      drawNotes: null,
      ingredientNotes: null,
      nextTimeNote: null,
    },
    tastings: [],
    ...overrides,
  };
}

function makeStoreFile(versions = [makeVersion()]) {
  return { app: 'sprinkles', schemaVersion: 1, exportedAt: '2026-01-01T00:00:00.000Z', versions };
}

function makeStoreFileV2(versions = [makeVersion()], batches = [makeBatch()]) {
  return { app: 'sprinkles', schemaVersion: 2, exportedAt: '2026-01-01T00:00:00.000Z', versions, batches };
}

describe('exportStore', () => {
  it('returns app sprinkles, schemaVersion 2, and every version and batch the repository held', async () => {
    const repository = createInMemoryRepository([makeVersion(), makeVersion({ id: 'v2' })], [makeBatch()]);
    const exported = await exportStore(repository);
    expect(exported.app).toBe('sprinkles');
    expect(exported.schemaVersion).toBe(2);
    expect(exported.versions).toHaveLength(2);
    expect(exported.batches).toHaveLength(1);
  });
});

describe('export then import round trip', () => {
  it('yields records deep-equal to the originals in a second empty repository', async () => {
    const source = createInMemoryRepository([makeVersion(), makeVersion({ id: 'v2' })], [makeBatch()]);
    const exported = await exportStore(source);

    const target = createInMemoryRepository([], []);
    const result = await importStore(target, exported);

    expect(result.ok).toBe(true);
    expect(target.versions).toEqual(source.versions);
    expect(target.batches).toEqual(source.batches);
  });
});

describe('validateStoreFile', () => {
  it('accepts a well-formed file and reports ok', () => {
    expect(validateStoreFile(makeStoreFile())).toEqual({ ok: true, errors: [] });
  });

  it('rejects a payload whose app is not sprinkles, naming the field', () => {
    const result = validateStoreFile({ ...makeStoreFile(), app: 'other' });
    expect(result.ok).toBe(false);
    expect(result.errors.some((error) => error.includes('app'))).toBe(true);
  });

  it('rejects a payload whose schemaVersion is 3, naming the field', () => {
    const result = validateStoreFile({ ...makeStoreFile(), schemaVersion: 3 });
    expect(result.ok).toBe(false);
    expect(result.errors.some((error) => error.includes('schemaVersion'))).toBe(true);
  });

  it('rejects a payload whose versions is not an array', () => {
    const result = validateStoreFile({ ...makeStoreFile(), versions: {} });
    expect(result.ok).toBe(false);
    expect(result.errors.some((error) => error.includes('versions'))).toBe(true);
  });

  it('rejects a version with no id', () => {
    const version = makeVersion();
    delete version.id;
    const result = validateStoreFile(makeStoreFile([version]));
    expect(result.ok).toBe(false);
    expect(result.errors.some((error) => error.includes('.id'))).toBe(true);
  });

  it('rejects a version with an empty rows array', () => {
    const result = validateStoreFile(makeStoreFile([makeVersion({ rows: [] })]));
    expect(result.ok).toBe(false);
    expect(result.errors.some((error) => error.includes('rows'))).toBe(true);
  });

  it('rejects a row whose grams is the string "370.4"', () => {
    const version = makeVersion();
    version.rows[0].grams = '370.4';
    const result = validateStoreFile(makeStoreFile([version]));
    expect(result.ok).toBe(false);
    expect(result.errors.some((error) => error.includes('grams'))).toBe(true);
  });

  it('rejects a row whose grams is negative', () => {
    const version = makeVersion();
    version.rows[0].grams = -1;
    const result = validateStoreFile(makeStoreFile([version]));
    expect(result.ok).toBe(false);
    expect(result.errors.some((error) => error.includes('grams'))).toBe(true);
  });

  it('rejects a row whose grams is not finite', () => {
    const version = makeVersion();
    version.rows[0].grams = Infinity;
    const result = validateStoreFile(makeStoreFile([version]));
    expect(result.ok).toBe(false);
    expect(result.errors.some((error) => error.includes('grams'))).toBe(true);
  });

  it('rejects a version with no method', () => {
    const version = makeVersion();
    delete version.method;
    const result = validateStoreFile(makeStoreFile([version]));
    expect(result.ok).toBe(false);
    expect(result.errors.some((error) => error.includes('.method'))).toBe(true);
  });

  it('rejects a version with no authored', () => {
    const version = makeVersion();
    delete version.authored;
    const result = validateStoreFile(makeStoreFile([version]));
    expect(result.ok).toBe(false);
    expect(result.errors.some((error) => error.includes('.authored'))).toBe(true);
  });

  it('rejects a version whose authored is missing carriedForward or beforeYouStart', () => {
    const version = makeVersion({ authored: { carriedForward: [] } });
    const result = validateStoreFile(makeStoreFile([version]));
    expect(result.ok).toBe(false);
    expect(result.errors.some((error) => error.includes('.authored'))).toBe(true);
  });

  it('reports two errors for a payload with two distinct faults, not only the first', () => {
    const result = validateStoreFile({ ...makeStoreFile(), app: 'other', schemaVersion: 3 });
    expect(result.ok).toBe(false);
    expect(result.errors).toHaveLength(2);
  });

  it('rejects a payload carrying a prototype-mutating key, and leaves a fresh object unpolluted', () => {
    const malicious = JSON.parse(
      '{"app":"sprinkles","schemaVersion":1,"versions":[{"id":"v1","recipeName":"x","coefficientSetId":"c",' +
        '"rows":[{"id":"r1","ingredientName":"x","grams":1,"ingredient":{"composition":{"fat":1}}}],' +
        '"__proto__":{"polluted":true}}]}',
    );
    const result = validateStoreFile(malicious);
    expect(result.ok).toBe(false);
    expect(result.errors.some((error) => error.includes('__proto__'))).toBe(true);
    expect({}.polluted).toBeUndefined();
  });

  // schemaVersion 2 and the batch record (02-02 task 3, BATCH2-01).
  it('accepts schemaVersion 2 with one version and one well-formed batch', () => {
    expect(validateStoreFile(makeStoreFileV2())).toEqual({ ok: true, errors: [] });
  });

  it('accepts a schemaVersion 1 file with no batches key, importing the versions and no batches', () => {
    expect(validateStoreFile(makeStoreFile())).toEqual({ ok: true, errors: [] });
  });

  it('rejects a schemaVersion 1 file that carries a non-empty batches array, naming $.batches', () => {
    const result = validateStoreFile({ ...makeStoreFile(), batches: [makeBatch()] });
    expect(result.ok).toBe(false);
    expect(result.errors.some((error) => error.includes('$.batches'))).toBe(true);
  });

  it('accepts a written 0 in a batch as-made map — a truthiness test would wrongly reject it', () => {
    const batch = makeBatch({ churn: { ...makeBatch().churn, asMade: { 'row-09': 0 } } });
    const result = validateStoreFile(makeStoreFileV2([makeVersion()], [batch]));
    expect(result).toEqual({ ok: true, errors: [] });
  });

  it('rejects a non-numeric as-made value, naming the offending path', () => {
    const batch = makeBatch({ churn: { ...makeBatch().churn, asMade: { 'row-01': '383' } } });
    const result = validateStoreFile(makeStoreFileV2([makeVersion()], [batch]));
    expect(result.ok).toBe(false);
    expect(result.errors.some((error) => error.includes('$.batches[0].churn.asMade.row-01'))).toBe(true);
  });

  it('collects three errors in one call: missing versionId, empty snapshot.rows, non-numeric drawTempC', () => {
    const batch = makeBatch({
      versionId: undefined,
      snapshot: { ...makeBatch().snapshot, rows: [] },
      churn: { ...makeBatch().churn, drawTempC: 'cold' },
    });
    const result = validateStoreFile(makeStoreFileV2([makeVersion()], [batch]));
    expect(result.ok).toBe(false);
    expect(result.errors).toHaveLength(3);
  });

  it('rejects a batch carrying an own __proto__ key, and leaves a fresh object unpolluted', () => {
    const malicious = JSON.parse(
      '{"app":"sprinkles","schemaVersion":2,"versions":[],"batches":[{"id":"b1","versionId":"v1",' +
        '"schemaVersion":1,"recordedAt":"2026-08-04T09:00:00.000Z","amendedAt":[],' +
        '"snapshot":{"coefficientSetId":"c","versionLabel":"v","rows":[{"id":"r1","ingredientName":"x",' +
        '"grams":1,"ingredient":{"composition":{"fat":1}}}],"declaredAxes":[]},' +
        '"churn":{"asMade":{},"stepChanges":{},"comeUpMinutes":null,"drawTempC":null,"overrunPercent":null,' +
        '"drawNotes":null,"ingredientNotes":null,"nextTimeNote":null,"churnDate":null},' +
        '"tastings":[],"__proto__":{"polluted":true}}]}',
    );
    const result = validateStoreFile(malicious);
    expect(result.ok).toBe(false);
    expect(result.errors.some((error) => error.includes('__proto__'))).toBe(true);
    expect({}.polluted).toBeUndefined();
  });
});

describe('importStore', () => {
  it('writes nothing on an invalid payload and reports every error found', async () => {
    const repository = createInMemoryRepository([makeVersion({ id: 'existing' })]);
    const before = [...repository.versions];

    const result = await importStore(repository, { ...makeStoreFile(), app: 'other', schemaVersion: 3 });

    expect(result.ok).toBe(false);
    expect(result.errors).toHaveLength(2);
    expect(repository.versions).toEqual(before);
  });

  it('writes through repository.putAll on a valid schemaVersion 1 payload', async () => {
    const repository = createInMemoryRepository([]);
    const result = await importStore(repository, makeStoreFile());
    expect(result.ok).toBe(true);
    expect(repository.versions).toEqual([makeVersion()]);
    expect(repository.batches).toEqual([]);
  });

  it('writes through repository.putAll and putAllBatches on a valid schemaVersion 2 payload', async () => {
    const repository = createInMemoryRepository([], []);
    const result = await importStore(repository, makeStoreFileV2());
    expect(result.ok).toBe(true);
    expect(repository.versions).toEqual([makeVersion()]);
    expect(repository.batches).toEqual([makeBatch()]);
  });

  it('refuses the whole file: one bad batch beside a good one writes nothing at all', async () => {
    const repository = createInMemoryRepository([], []);
    const goodBatch = makeBatch({ id: 'good' });
    const badBatch = makeBatch({ id: 'bad', versionId: undefined });

    const result = await importStore(repository, makeStoreFileV2([makeVersion()], [goodBatch, badBatch]));

    expect(result.ok).toBe(false);
    expect(repository.putAllCalls).toBe(0);
    expect(repository.putAllBatchesCalls).toBe(0);
    expect(repository.versions).toEqual([]);
    expect(repository.batches).toEqual([]);
  });
});
