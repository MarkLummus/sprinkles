import { describe, it, expect } from 'vitest';
import { exportStore, importStore, validateStoreFile } from './transfer.js';
import { oliveOilVersion } from '../data/olive-oil.js';
import { augustSecondBatch } from '../data/batch-2026-08-02.js';

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

// Schema 4-shaped by default (D-08): every version validateStoreFile sees
// in production is authored fresh (createChildVersion, or the seed) — there
// is no lift branch left to fill these in on the way in, so a well-formed
// fixture carries them from the start.
function makeVersion(overrides = {}) {
  return {
    id: 'v1',
    schemaVersion: 3,
    recipeName: 'Test recipe',
    coefficientSetId: 'set-1',
    parentVersionId: null,
    parentVersionLabel: null,
    reason: null,
    citedBatchId: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    rows: [
      {
        id: 'row-1',
        ingredientName: 'Whole milk',
        portions: [{ step: 1, grams: 100 }],
        ingredient: { composition: { fat: 0.035, msnf: 0.088 } },
        removed: false,
      },
    ],
    method: [],
    authored: { carriedForward: [], beforeYouStart: [] },
    ...overrides,
  };
}

function makeStep(overrides = {}) {
  return {
    n: 1,
    leadIn: 'Step',
    instruction: 'Do it',
    removed: false,
    uses: [],
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
          portions: [{ step: 1, grams: 100 }],
          ingredient: { composition: { fat: 0.035, msnf: 0.088 } },
          removed: false,
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

// The one accepted shape (D-08): schemaVersion 4, batches always present
// (an array, never absent) — there is no longer a schema number under
// which batches may be omitted.
function makeStoreFile(versions = [makeVersion()], batches = []) {
  return { app: 'sprinkles', schemaVersion: 4, exportedAt: '2026-01-01T00:00:00.000Z', versions, batches };
}

describe('exportStore', () => {
  it('returns app sprinkles, schemaVersion 4, and every version and batch the repository held', async () => {
    const repository = createInMemoryRepository([makeVersion(), makeVersion({ id: 'v2' })], [makeBatch()]);
    const exported = await exportStore(repository);
    expect(exported.app).toBe('sprinkles');
    expect(exported.schemaVersion).toBe(4);
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

  // The phase's Done-when (D-08): a store exported after this change
  // imports after it, proven against the real seeded olive oil version and
  // its real 2 Aug batch, not a fixture. JSON.parse(JSON.stringify(...))
  // carries a genuinely serialised payload, the same as a file on disk,
  // rather than a live object graph the two repositories could share by
  // reference.
  it('carries the real seeded olive oil version and its 2 Aug batch intact', async () => {
    const source = createInMemoryRepository([oliveOilVersion], [augustSecondBatch]);
    const exported = await exportStore(source);
    const serialised = JSON.parse(JSON.stringify(exported));

    const target = createInMemoryRepository([], []);
    const result = await importStore(target, serialised);

    expect(result.ok).toBe(true);
    expect(target.versions).toEqual([oliveOilVersion]);
    expect(target.batches).toEqual([augustSecondBatch]);
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

  it('accepts a payload whose schemaVersion is 4 — the schema number flips from refused to accepted (D-08)', () => {
    const result = validateStoreFile(makeStoreFile());
    expect(result.errors.some((error) => error.includes('schemaVersion'))).toBe(false);
  });

  it.each([1, 2, 3])(
    'rejects a payload whose schemaVersion is %i, naming the path and both the expected and received value',
    (oldSchemaVersion) => {
      const result = validateStoreFile({ ...makeStoreFile(), schemaVersion: oldSchemaVersion });
      expect(result.ok).toBe(false);
      const error = result.errors.find((message) => message.includes('$.schemaVersion'));
      expect(error).toContain('expected 4');
      expect(error).toContain(String(oldSchemaVersion));
    },
  );

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

  it('rejects a row whose portions array is empty, naming the path (D-01)', () => {
    const version = makeVersion();
    version.rows[0].portions = [];
    const result = validateStoreFile(makeStoreFile([version]));
    expect(result.ok).toBe(false);
    expect(result.errors.some((error) => error.includes('.rows[0].portions'))).toBe(true);
  });

  it('rejects a row whose portion grams is the string "370.4"', () => {
    const version = makeVersion();
    version.rows[0].portions[0].grams = '370.4';
    const result = validateStoreFile(makeStoreFile([version]));
    expect(result.ok).toBe(false);
    expect(result.errors.some((error) => error.includes('.rows[0].portions[0].grams'))).toBe(true);
  });

  it('rejects a row whose portion carries a negative amount, refused at its own indexed path', () => {
    const version = makeVersion();
    version.rows[0].portions[0].grams = -1;
    const result = validateStoreFile(makeStoreFile([version]));
    expect(result.ok).toBe(false);
    expect(result.errors.some((error) => error.includes('.rows[0].portions[0].grams'))).toBe(true);
  });

  it('rejects a row whose portion grams is not finite', () => {
    const version = makeVersion();
    version.rows[0].portions[0].grams = Infinity;
    const result = validateStoreFile(makeStoreFile([version]));
    expect(result.ok).toBe(false);
    expect(result.errors.some((error) => error.includes('.rows[0].portions[0].grams'))).toBe(true);
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

  it('accepts a well-formed file with one version and one well-formed batch, reporting ok', () => {
    const result = validateStoreFile(makeStoreFile([makeVersion()], [makeBatch()]));
    expect(result).toEqual({ ok: true, errors: [] });
  });

  it('accepts a written 0 in a batch as-made array — a truthiness test would wrongly reject it', () => {
    const batch = makeBatch({ churn: { ...makeBatch().churn, asMade: { 'row-09': [0] } } });
    const result = validateStoreFile(makeStoreFile([makeVersion()], [batch]));
    expect(result).toEqual({ ok: true, errors: [] });
  });

  it('accepts null as an as-made array element — an untouched portion within an otherwise written row (D-10)', () => {
    const batch = makeBatch({ churn: { ...makeBatch().churn, asMade: { 'row-01': [383, null] } } });
    const result = validateStoreFile(makeStoreFile([makeVersion()], [batch]));
    expect(result).toEqual({ ok: true, errors: [] });
  });

  it('rejects a scalar (non-array) as-made value, naming the row\'s own path (D-10)', () => {
    const batch = makeBatch({ churn: { ...makeBatch().churn, asMade: { 'row-01': 383 } } });
    const result = validateStoreFile(makeStoreFile([makeVersion()], [batch]));
    expect(result.ok).toBe(false);
    const error = result.errors.find((message) => message.includes('$.batches[0].churn.asMade.row-01'));
    expect(error).toBeDefined();
    expect(error).not.toContain('row-01[0]');
  });

  it('rejects an array element that is neither a finite number nor null, naming its own indexed path', () => {
    const batch = makeBatch({ churn: { ...makeBatch().churn, asMade: { 'row-01': ['383'] } } });
    const result = validateStoreFile(makeStoreFile([makeVersion()], [batch]));
    expect(result.ok).toBe(false);
    expect(result.errors.some((error) => error.includes('$.batches[0].churn.asMade.row-01[0]'))).toBe(true);
  });

  it('collects three errors in one call: missing versionId, empty snapshot.rows, non-numeric drawTempC', () => {
    const batch = makeBatch({
      versionId: undefined,
      snapshot: { ...makeBatch().snapshot, rows: [] },
      churn: { ...makeBatch().churn, drawTempC: 'cold' },
    });
    const result = validateStoreFile(makeStoreFile([makeVersion()], [batch]));
    expect(result.ok).toBe(false);
    expect(result.errors).toHaveLength(3);
  });

  it('rejects a batch whose declaredAxes element is a bare string, refused at its own indexed path (D-07a)', () => {
    const batch = makeBatch({ snapshot: { ...makeBatch().snapshot, declaredAxes: ['Olive oil character'] } });
    const result = validateStoreFile(makeStoreFile([makeVersion()], [batch]));
    expect(result.ok).toBe(false);
    expect(result.errors.some((error) => error.includes('.snapshot.declaredAxes[0]'))).toBe(true);
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

  it('imports a well-formed schemaVersion 4 file with a batch, round-tripping through putAll and putAllBatches', async () => {
    const repository = createInMemoryRepository([], []);
    const result = await importStore(repository, makeStoreFile([makeVersion()], [makeBatch()]));
    expect(result.ok).toBe(true);
    expect(repository.versions).toEqual([makeVersion()]);
    expect(repository.batches).toEqual([makeBatch()]);
  });

  it('refuses the whole file: one bad batch beside a good one writes nothing at all', async () => {
    const repository = createInMemoryRepository([], []);
    const goodBatch = makeBatch({ id: 'good' });
    const badBatch = makeBatch({ id: 'bad', versionId: undefined });

    const result = await importStore(repository, makeStoreFile([makeVersion()], [goodBatch, badBatch]));

    expect(result.ok).toBe(false);
    expect(repository.putAllCalls).toBe(0);
    expect(repository.putAllBatchesCalls).toBe(0);
    expect(repository.versions).toEqual([]);
    expect(repository.batches).toEqual([]);
  });
});

// D-09: an imported file carrying a child version whose parent is neither
// in the file nor already in the store is refused whole.
describe('the D-09 parent-resolves gate', () => {
  it('accepts a file whose child version names a parent present in the same file', async () => {
    const parent = makeVersion({ id: 'parent' });
    const child = makeVersion({ id: 'child', parentVersionId: 'parent', parentVersionLabel: 'line' });
    const repository = createInMemoryRepository([]);
    const result = await importStore(repository, makeStoreFile([parent, child]));
    expect(result.ok).toBe(true);
    expect(repository.versions.map((version) => version.id).sort()).toEqual(['child', 'parent']);
  });

  it('accepts a file whose child version names a parent already in the store', async () => {
    const child = makeVersion({ id: 'child', parentVersionId: 'v1', parentVersionLabel: 'line' });
    const repository = createInMemoryRepository([makeVersion({ id: 'v1' })]);
    const result = await importStore(repository, makeStoreFile([child]));
    expect(result.ok).toBe(true);
  });

  it('refuses whole a file whose child version names a parent in neither the file nor the store — nothing is written', async () => {
    const child = makeVersion({ id: 'child', parentVersionId: 'unknown-parent', parentVersionLabel: 'line' });
    const repository = createInMemoryRepository([]);
    const result = await importStore(repository, makeStoreFile([child]));
    expect(result.ok).toBe(false);
    expect(result.errors.some((error) => error.includes('parentVersionId'))).toBe(true);
    expect(repository.putAllCalls).toBe(0);
    expect(repository.versions).toEqual([]);
  });

  it('validateStoreFile stays pure: it accepts the same unresolvable-parent file with no error, since the gate lives in importStore', () => {
    const child = makeVersion({ id: 'child', parentVersionId: 'unknown-parent', parentVersionLabel: 'line' });
    expect(validateStoreFile(makeStoreFile([child]))).toEqual({ ok: true, errors: [] });
  });
});

// The new per-field checks validateVersion gained this phase.
describe('validateVersion, the new fields (D-06)', () => {
  it('rejects a version whose reason is a number, naming the field', () => {
    const version = makeVersion({ reason: 42 });
    const result = validateStoreFile(makeStoreFile([version]));
    expect(result.ok).toBe(false);
    expect(result.errors.some((error) => error.includes('.reason'))).toBe(true);
  });

  it('rejects a version whose createdAt is missing, naming the field', () => {
    const version = makeVersion();
    delete version.createdAt;
    const result = validateStoreFile(makeStoreFile([version]));
    expect(result.ok).toBe(false);
    expect(result.errors.some((error) => error.includes('.createdAt'))).toBe(true);
  });

  it("rejects a row whose removed is missing, naming the field", () => {
    const version = makeVersion();
    delete version.rows[0].removed;
    const result = validateStoreFile(makeStoreFile([version]));
    expect(result.ok).toBe(false);
    expect(result.errors.some((error) => error.includes('.rows[0].removed'))).toBe(true);
  });

  it('rejects a step whose removed is missing, naming the path', () => {
    const version = makeVersion({ method: [makeStep()] });
    delete version.method[0].removed;
    const result = validateStoreFile(makeStoreFile([version]));
    expect(result.ok).toBe(false);
    expect(result.errors.some((error) => error.includes('.method[0].removed'))).toBe(true);
  });

  it('rejects a step whose uses array holds a number rather than a string, naming the path', () => {
    const version = makeVersion({ method: [makeStep({ uses: [42] })] });
    const result = validateStoreFile(makeStoreFile([version]));
    expect(result.ok).toBe(false);
    expect(result.errors.some((error) => error.includes('.method[0].uses'))).toBe(true);
  });

  it('rejects an authored note with no text field, naming the path', () => {
    const version = makeVersion({ authored: { carriedForward: [{ inheritedFrom: null }], beforeYouStart: [] } });
    const result = validateStoreFile(makeStoreFile([version]));
    expect(result.ok).toBe(false);
    expect(result.errors.some((error) => error.includes('.authored.carriedForward[0].text'))).toBe(true);
  });

  it('accepts a well-formed authored note carrying an inheritedFrom string', () => {
    const version = makeVersion({
      authored: { carriedForward: [{ text: 'note', inheritedFrom: '50 g oil · 800 g' }], beforeYouStart: [] },
    });
    expect(validateStoreFile(makeStoreFile([version]))).toEqual({ ok: true, errors: [] });
  });

  it("rejects a file carrying __proto__ on a method step — the uses array's containing object — via the existing scanner", () => {
    const malicious = JSON.parse(
      '{"app":"sprinkles","schemaVersion":4,"versions":[{"id":"v1","schemaVersion":3,"recipeName":"x","coefficientSetId":"c",' +
        '"parentVersionId":null,"parentVersionLabel":null,"reason":null,"citedBatchId":null,"createdAt":"2026-01-01T00:00:00.000Z",' +
        '"rows":[{"id":"r1","ingredientName":"x","portions":[{"step":1,"grams":1}],"ingredient":{"composition":{"fat":1}},"removed":false}],' +
        '"method":[{"n":1,"leadIn":"x","instruction":"x","removed":false,"uses":[],"__proto__":{"polluted":true}}],' +
        '"authored":{"carriedForward":[],"beforeYouStart":[]}}],"batches":[]}',
    );
    const result = validateStoreFile(malicious);
    expect(result.ok).toBe(false);
    expect(result.errors.some((error) => error.includes('__proto__'))).toBe(true);
    expect({}.polluted).toBeUndefined();
  });
});
