// fake-indexeddb/auto installs indexedDB before repository.js loads (its
// module-level singleton opens the store on import), so it comes first.
import 'fake-indexeddb/auto';
import { IDBFactory } from 'fake-indexeddb';
import { describe, it, expect, beforeEach } from 'vitest';
import { createRepository } from './repository.js';
import { exportStore, importStore, validateStoreFile, STORE_SCHEMA_VERSION, OLDER_EXPORT_MESSAGE, IMPORT_STORAGE_ERROR } from './transfer.js';
import { seedIfEmpty } from './seed.js';
import { oliveOilVersion, oliveOilRecipe } from '../data/olive-oil.js';
import { augustSecondBatch } from '../data/batch-2026-08-02.js';
import { library } from '../data/library.js';

// A plain in-memory object implementing the repository seam's contract —
// no store library, no browser. Mirrors createRepository's exportAll and
// importAll over four stores: importAll upserts by id, never a wholesale
// replace. Counts importAll calls so a test can assert the write was never
// invoked (the refuse-whole-file gate).
function createInMemoryRepository(initialVersions = [], initialBatches = [], initialRecipes = [], initialLibrary = []) {
  const versions = [...initialVersions];
  const batches = [...initialBatches];
  const recipes = [...initialRecipes];
  const libraryRecords = [...initialLibrary];
  let importAllCalls = 0;
  return {
    get versions() {
      return versions;
    },
    get batches() {
      return batches;
    },
    get recipes() {
      return recipes;
    },
    get library() {
      return libraryRecords;
    },
    get importAllCalls() {
      return importAllCalls;
    },
    async getAll() {
      return [...versions];
    },
    async listRecipes() {
      return [...recipes];
    },
    async exportAll() {
      return {
        recipes: [...recipes],
        versions: [...versions],
        batches: [...batches],
        library: [...libraryRecords],
      };
    },
    async importAll({ recipes: newRecipes, versions: newVersions, batches: newBatches, library: newLibrary }) {
      importAllCalls += 1;
      const upsert = (list, items) => {
        for (const item of items) {
          const i = list.findIndex((entry) => entry.id === item.id);
          if (i >= 0) list[i] = item;
          else list.push(item);
        }
      };
      upsert(recipes, newRecipes);
      upsert(versions, newVersions);
      upsert(batches, newBatches);
      upsert(libraryRecords, newLibrary);
    },
  };
}

// Schema 8-shaped by default (D-10, D-11, 03.5-CONTEXT.md; 04-03): every version
// validateStoreFile sees in production is authored fresh (createChildVersion,
// or the seed) — there is no lift branch left to fill these in on the way
// in, so a well-formed fixture carries them from the start.
function makeVersion(overrides = {}) {
  return {
    id: 'v1',
    schemaVersion: 4,
    recipeId: 'r1',
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
    authored: { beforeYouStart: [] },
    declaredAxes: ['Body', 'Oil'],
    declaredFlaws: ['Bitter'],
    versionLabel: 'v1 label',
    sheetTitle: '',
    sheetDescription: '',
    ...overrides,
  };
}

// D-11: a recipe record { id, name, description }, reached only through
// the repository seam. Its default id matches makeVersion's default
// recipeId, so the recipe-resolves gate accepts the two default fixtures
// together with no extra wiring.
function makeRecipe(overrides = {}) {
  return {
    id: 'r1',
    name: 'Test recipe',
    description: 'A description',
    ...overrides,
  };
}

function makeStep(overrides = {}) {
  return {
    n: 1,
    leadIn: 'Step',
    instruction: 'Do it',
    targets: [],
    removed: false,
    uses: [],
    ...overrides,
  };
}

function makeBatch(overrides = {}) {
  return {
    schemaVersion: 3,
    id: 'batch-1',
    versionId: 'v1',
    recordedAt: '2026-08-04T09:00:00.000Z',
    changed: null,
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
      declaredAxes: ['Body', 'Oil'],
      declaredFlaws: ['Bitter'],
    },
    churn: {
      churnDate: '2026-08-02',
      asMade: {},
      stepChanges: {},
      outOfMachineTempC: null,
      churnDurationMinutes: null,
      exitConsistency: null,
      airiness: null,
      atDraw: null,
      atTheMachine: null,
      ingredientNotes: null,
      nextTimeNote: null,
    },
    tasting: null,
    ...overrides,
  };
}

function makeTasting(overrides = {}) {
  return {
    tastedDate: null,
    temperingMinutes: null,
    tastingTempC: null,
    marks: {},
    note: null,
    defects: null,
    declaredDefects: null,
    fromFreezer: null,
    meltTestG: null,
    meltStyle: null,
    ...overrides,
  };
}

// D-08: a library record { id, entry }, the shape the seed writes. Its
// default is sucrose, the real data/library.js entry.
function makeLibraryRecord(overrides = {}) {
  return { id: 'sucrose', entry: structuredClone(library.sucrose), ...overrides };
}

// The one accepted shape (D-06, D-10, D-11): schemaVersion 8, batches,
// recipes and library always present (arrays, never absent).
function makeStoreFile(
  versions = [makeVersion()],
  batches = [],
  recipes = [makeRecipe()],
  libraryRecords = [makeLibraryRecord()],
) {
  return {
    app: 'sprinkles',
    schemaVersion: STORE_SCHEMA_VERSION,
    exportedAt: '2026-01-01T00:00:00.000Z',
    versions,
    batches,
    recipes,
    library: libraryRecords,
  };
}

// A fresh database per test for the tests that use a real repository.
beforeEach(() => {
  globalThis.indexedDB = new IDBFactory();
});

describe('exportStore, drafts stay on the device (T-04-12)', () => {
  it('writes exactly the file keys and no draft anywhere in the result', async () => {
    const repository = createRepository();
    await repository.saveRecipe(makeRecipe());
    await repository.saveVersion(makeVersion());
    await repository.saveBatch(makeBatch());
    await repository.saveDraft({ versionId: 'v1', note: 'DRAFT-MARKER-unsaved-words' });
    expect(await repository.listDrafts()).toHaveLength(1);

    const exported = await exportStore(repository);

    expect(Object.keys(exported).sort()).toEqual(['app', 'batches', 'exportedAt', 'library', 'recipes', 'schemaVersion', 'versions']);
    expect(exported.schemaVersion).toBe(8);
    expect(JSON.stringify(exported)).not.toContain('DRAFT-MARKER');
    expect(JSON.stringify(exported)).not.toContain('drafts');
  });
});

describe('exportStore', () => {
  it('returns app sprinkles, schemaVersion 8, and every version, batch, recipe and library record the repository held', async () => {
    const repository = createInMemoryRepository(
      [makeVersion(), makeVersion({ id: 'v2' })],
      [makeBatch()],
      [makeRecipe()],
      [makeLibraryRecord()],
    );
    const exported = await exportStore(repository);
    expect(exported.app).toBe('sprinkles');
    expect(exported.schemaVersion).toBe(8);
    expect(exported.schemaVersion).toBe(STORE_SCHEMA_VERSION);
    expect(exported.versions).toHaveLength(2);
    expect(exported.batches).toHaveLength(1);
    expect(exported.recipes).toHaveLength(1);
    expect(exported.library).toHaveLength(1);
  });
});

describe('export then import round trip', () => {
  it('yields records deep-equal to the originals in a second empty repository', async () => {
    const source = createInMemoryRepository(
      [makeVersion(), makeVersion({ id: 'v2' })],
      [makeBatch()],
      [makeRecipe()],
      [makeLibraryRecord()],
    );
    const exported = await exportStore(source);

    const target = createInMemoryRepository([], [], []);
    const result = await importStore(target, exported);

    expect(result.ok).toBe(true);
    expect(target.versions).toEqual(source.versions);
    expect(target.batches).toEqual(source.batches);
    expect(target.recipes).toEqual(source.recipes);
    expect(target.library).toEqual(source.library);
  });

  // The phase's Done-when (D-10, D-11): a store exported after this change
  // imports after it, proven against the real seeded olive oil recipe,
  // version and its real 2 Aug batch, not a fixture. JSON.parse(JSON.stringify(...))
  // carries a genuinely serialised payload, the same as a file on disk,
  // rather than a live object graph the two repositories could share by
  // reference.
  it('carries the real seeded olive oil recipe, version and its 2 Aug batch intact', async () => {
    const source = createInMemoryRepository([oliveOilVersion], [augustSecondBatch], [oliveOilRecipe]);
    const exported = await exportStore(source);
    const serialised = JSON.parse(JSON.stringify(exported));

    const target = createInMemoryRepository([], [], []);
    const result = await importStore(target, serialised);

    expect(result.ok).toBe(true);
    expect(target.versions).toEqual([oliveOilVersion]);
    expect(target.batches).toEqual([augustSecondBatch]);
    expect(target.recipes).toEqual([oliveOilRecipe]);
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

  it('accepts a payload whose schemaVersion is 8 — the schema number flips from refused to accepted (D-10, D-11)', () => {
    const result = validateStoreFile(makeStoreFile());
    expect(result.errors.some((error) => error.includes('schemaVersion'))).toBe(false);
  });

  it.each([1, 2, 3, 4, 5, 6, 7])(
    'rejects a payload whose schemaVersion is %i, naming the path and both the expected and received value',
    (oldSchemaVersion) => {
      const result = validateStoreFile({ ...makeStoreFile(), schemaVersion: oldSchemaVersion });
      expect(result.ok).toBe(false);
      const error = result.errors.find((message) => message.includes('$.schemaVersion'));
      expect(error).toContain('expected 8');
      expect(error).toContain(String(oldSchemaVersion));
    },
  );

  // D-10: a plain sentence goes first, before the path-named error, so an
  // older export's own maker sees words before a technical path.
  it.each([1, 2, 3, 4, 5, 6, 7])(
    'reports OLDER_EXPORT_MESSAGE as the first error for a payload whose schemaVersion is %i',
    (oldSchemaVersion) => {
      const result = validateStoreFile({ ...makeStoreFile(), schemaVersion: oldSchemaVersion });
      expect(result.ok).toBe(false);
      expect(result.errors[0]).toBe(OLDER_EXPORT_MESSAGE);
    },
  );

  it('does not report OLDER_EXPORT_MESSAGE for a well-formed schemaVersion 8 payload', () => {
    const result = validateStoreFile(makeStoreFile());
    expect(result.errors).not.toContain(OLDER_EXPORT_MESSAGE);
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

  it('rejects a version whose authored is missing beforeYouStart', () => {
    const version = makeVersion({ authored: {} });
    const result = validateStoreFile(makeStoreFile([version]));
    expect(result.ok).toBe(false);
    expect(result.errors.some((error) => error.includes('.authored'))).toBe(true);
  });

  it('reports every error for a payload with distinct faults, not only the first — app plus the two schemaVersion entries (D-10)', () => {
    const result = validateStoreFile({ ...makeStoreFile(), app: 'other', schemaVersion: 3 });
    expect(result.ok).toBe(false);
    expect(result.errors).toHaveLength(3);
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

  it('collects three errors in one call: missing versionId, empty snapshot.rows, non-numeric outOfMachineTempC', () => {
    const batch = makeBatch({
      versionId: undefined,
      snapshot: { ...makeBatch().snapshot, rows: [] },
      churn: { ...makeBatch().churn, outOfMachineTempC: 'cold' },
    });
    const result = validateStoreFile(makeStoreFile([makeVersion()], [batch]));
    expect(result.ok).toBe(false);
    expect(result.errors).toHaveLength(3);
  });

  it('rejects a batch whose declaredAxes element is the pre-reset { name, low, high } object shape, refused at its own indexed path', () => {
    const batch = makeBatch({
      snapshot: { ...makeBatch().snapshot, declaredAxes: [{ name: 'Olive oil character', low: 'x', high: 'y' }] },
    });
    const result = validateStoreFile(makeStoreFile([makeVersion()], [batch]));
    expect(result.ok).toBe(false);
    expect(result.errors.some((error) => error.includes('.snapshot.declaredAxes[0]'))).toBe(true);
  });

  it('rejects a batch whose declaredAxes names an axis outside the declared pair', () => {
    const batch = makeBatch({ snapshot: { ...makeBatch().snapshot, declaredAxes: ['Hardness'] } });
    const result = validateStoreFile(makeStoreFile([makeVersion()], [batch]));
    expect(result.ok).toBe(false);
    expect(result.errors.some((error) => error.includes('.snapshot.declaredAxes[0]'))).toBe(true);
  });

  it('rejects a batch carrying an own __proto__ key, and leaves a fresh object unpolluted', () => {
    const malicious = JSON.parse(
      '{"app":"sprinkles","schemaVersion":2,"versions":[],"batches":[{"id":"b1","versionId":"v1",' +
        '"schemaVersion":1,"recordedAt":"2026-08-04T09:00:00.000Z","changed":null,' +
        '"snapshot":{"coefficientSetId":"c","versionLabel":"v","rows":[{"id":"r1","ingredientName":"x",' +
        '"grams":1,"ingredient":{"composition":{"fat":1}}}],"declaredAxes":[]},' +
        '"churn":{"asMade":{},"stepChanges":{},"timeToDrawTempMinutes":null,"outOfMachineTempC":null,"churnDurationMinutes":null,' +
        '"exitConsistency":null,"airiness":null,"atTheMachine":null,"ingredientNotes":null,"nextTimeNote":null,"churnDate":null},' +
        '"tasting":null,"__proto__":{"polluted":true}}]}',
    );
    const result = validateStoreFile(malicious);
    expect(result.ok).toBe(false);
    expect(result.errors.some((error) => error.includes('__proto__'))).toBe(true);
    expect({}.polluted).toBeUndefined();
  });

  // The battery's new churn fields (03.3.1-CONTEXT.md D-09, D-10).
  describe('validateBatch, the battery\'s churn fields', () => {
    describe('atDraw (sketch 010 D6, D6b, D10; T-04-08)', () => {
      const withChurn = (patch) => makeBatch({ churn: { ...makeBatch().churn, ...patch } });
      const check = (batch) => validateStoreFile(makeStoreFile([makeVersion()], [batch]));

      it.each(['Nothing to note', 'Not evaluated'])('accepts %s on a group with no mark, and exports then imports it unchanged', async (pick) => {
        const batch = withChurn({ atDraw: pick });
        expect(check(batch)).toEqual({ ok: true, errors: [] });
        const source = createInMemoryRepository([makeVersion()], [batch], [makeRecipe()]);
        const file = JSON.parse(JSON.stringify(await exportStore(source)));
        const target = createInMemoryRepository([], [], []);
        expect(await importStore(target, file)).toEqual({ ok: true, errors: [] });
        expect(target.batches[0].churn.atDraw).toBe(pick);
      });

      it('accepts null and an absent value', () => {
        expect(check(withChurn({ atDraw: null }))).toEqual({ ok: true, errors: [] });
        const { atDraw, ...bare } = makeBatch().churn;
        expect(check(makeBatch({ churn: bare }))).toEqual({ ok: true, errors: [] });
      });

      it('refuses an unknown word, naming the path, See below included (the print\'s word, not the pen\'s)', () => {
        for (const bad of ['See below', 'Fine', 3, true]) {
          const result = check(withChurn({ atDraw: bad }));
          expect(result.ok).toBe(false);
          expect(result.errors.some((error) => error.includes('churn.atDraw'))).toBe(true);
        }
      });

      it('refuses a pick stored beside Exit consistency or Airiness', () => {
        for (const mark of [{ exitConsistency: 'Smooth ribbon' }, { airiness: 'Low, dense' }]) {
          const result = check(withChurn({ atDraw: 'Nothing to note', ...mark }));
          expect(result.ok).toBe(false);
          expect(result.errors.some((error) => error.includes('churn.atDraw'))).toBe(true);
        }
      });
    });

    it('rejects a non-numeric value under a churn numeric field, naming the path', () => {
      const batch = makeBatch({ churn: { ...makeBatch().churn, outOfMachineTempC: 'cold' } });
      const result = validateStoreFile(makeStoreFile([makeVersion()], [batch]));
      expect(result.ok).toBe(false);
      expect(result.errors.some((error) => error.includes('churn.outOfMachineTempC'))).toBe(true);
    });

    it('no longer checks the retired draw-temperature key: the shape forgets it (sketch 010 D17)', () => {
      const batch = makeBatch({ churn: { ...makeBatch().churn, timeToDrawTempMinutes: 'cold' } });
      expect(validateStoreFile(makeStoreFile([makeVersion()], [batch]))).toEqual({ ok: true, errors: [] });
    });

    it('accepts a written 0 churnDurationMinutes — a truthiness test would wrongly reject it', () => {
      const batch = makeBatch({ churn: { ...makeBatch().churn, churnDurationMinutes: 0 } });
      const result = validateStoreFile(makeStoreFile([makeVersion()], [batch]));
      expect(result).toEqual({ ok: true, errors: [] });
    });

    it('accepts a known exitConsistency/airiness option and rejects an unknown one, naming the path', () => {
      const good = makeBatch({ churn: { ...makeBatch().churn, exitConsistency: 'Smooth ribbon', airiness: 'Low, dense' } });
      expect(validateStoreFile(makeStoreFile([makeVersion()], [good]))).toEqual({ ok: true, errors: [] });

      const bad = makeBatch({ churn: { ...makeBatch().churn, exitConsistency: 'Runny' } });
      const result = validateStoreFile(makeStoreFile([makeVersion()], [bad]));
      expect(result.ok).toBe(false);
      expect(result.errors.some((error) => error.includes('churn.exitConsistency'))).toBe(true);
    });
  });

  // The single zero-or-one tasting (D-03) and its own fields.
  describe('validateBatch, the tasting object', () => {
    describe('fromFreezer (sketch 010 D6, D6b, D10; T-04-08)', () => {
      const check = (tasting) => validateStoreFile(makeStoreFile([makeVersion()], [makeBatch({ tasting })]));

      it.each(['Nothing to note', 'Not evaluated'])('accepts %s on a bare tasting, and exports then imports it unchanged', async (pick) => {
        const batch = makeBatch({ tasting: makeTasting({ fromFreezer: pick }) });
        expect(validateStoreFile(makeStoreFile([makeVersion()], [batch]))).toEqual({ ok: true, errors: [] });
        const source = createInMemoryRepository([makeVersion()], [batch], [makeRecipe()]);
        const file = JSON.parse(JSON.stringify(await exportStore(source)));
        const target = createInMemoryRepository([], [], []);
        expect(await importStore(target, file)).toEqual({ ok: true, errors: [] });
        expect(target.batches[0].tasting.fromFreezer).toBe(pick);
      });

      it('accepts null and an absent value', () => {
        expect(check(makeTasting({ fromFreezer: null }))).toEqual({ ok: true, errors: [] });
        const { fromFreezer, ...bare } = makeTasting();
        expect(check(bare)).toEqual({ ok: true, errors: [] });
      });

      it('refuses an unknown word, naming the path', () => {
        for (const bad of ['See below', 'Fine', 3]) {
          const result = check(makeTasting({ fromFreezer: bad }));
          expect(result.ok).toBe(false);
          expect(result.errors.some((error) => error.includes('tasting.fromFreezer'))).toBe(true);
        }
      });

      it('refuses a pick stored beside a scale mark, a defect or a declared defect', () => {
        for (const beside of [
          { marks: { sweetness: 4 } },
          { defects: ['Greasy film'] },
          { declaredDefects: ['Bitter'] },
        ]) {
          const result = check(makeTasting({ fromFreezer: 'Nothing to note', ...beside }));
          expect(result.ok).toBe(false);
          expect(result.errors.some((error) => error.includes('tasting.fromFreezer'))).toBe(true);
        }
      });

      it('accepts a pick beside an empty marks object, empty defects and null declaredDefects', () => {
        expect(check(makeTasting({ fromFreezer: 'Not evaluated', marks: {}, defects: [], declaredDefects: null }))).toEqual({
          ok: true,
          errors: [],
        });
      });
    });

    it('accepts a batch whose tasting is null', () => {
      expect(validateStoreFile(makeStoreFile([makeVersion()], [makeBatch({ tasting: null })]))).toEqual({
        ok: true,
        errors: [],
      });
    });

    it('accepts a well-formed tasting object', () => {
      const batch = makeBatch({ tasting: makeTasting({ marks: { sweetness: 4, oil: 4 }, declaredDefects: ['Bitter'], meltTestG: 3 }) });
      expect(validateStoreFile(makeStoreFile([makeVersion()], [batch]))).toEqual({ ok: true, errors: [] });
    });

    it('rejects a marks value of 0, naming the path', () => {
      const batch = makeBatch({ tasting: makeTasting({ marks: { sweetness: 0 } }) });
      const result = validateStoreFile(makeStoreFile([makeVersion()], [batch]));
      expect(result.ok).toBe(false);
      expect(result.errors.some((error) => error.includes('tasting.marks.sweetness'))).toBe(true);
    });

    it('rejects a marks value of 4.5, naming the path', () => {
      const batch = makeBatch({ tasting: makeTasting({ marks: { oil: 4.5 } }) });
      const result = validateStoreFile(makeStoreFile([makeVersion()], [batch]));
      expect(result.ok).toBe(false);
      expect(result.errors.some((error) => error.includes('tasting.marks.oil'))).toBe(true);
    });

    it('accepts a written 0 meltTestG — a truthiness test would wrongly reject it', () => {
      const batch = makeBatch({ tasting: makeTasting({ meltTestG: 0 }) });
      expect(validateStoreFile(makeStoreFile([makeVersion()], [batch]))).toEqual({ ok: true, errors: [] });
    });

    it('rejects an unknown defect chip string, naming the path', () => {
      const batch = makeBatch({ tasting: makeTasting({ defects: ['Watery mess'] }) });
      const result = validateStoreFile(makeStoreFile([makeVersion()], [batch]));
      expect(result.ok).toBe(false);
      expect(result.errors.some((error) => error.includes('tasting.defects'))).toBe(true);
    });

    it('accepts a known defect chip and null defects', () => {
      const withDefect = makeBatch({ tasting: makeTasting({ defects: ['Sandy, gritty'] }) });
      expect(validateStoreFile(makeStoreFile([makeVersion()], [withDefect]))).toEqual({ ok: true, errors: [] });
      const withoutDefects = makeBatch({ tasting: makeTasting({ defects: null }) });
      expect(validateStoreFile(makeStoreFile([makeVersion()], [withoutDefects]))).toEqual({ ok: true, errors: [] });
    });

    it('rejects a declaredDefects value that is not null or an array, naming the path', () => {
      for (const bad of [true, false, 'Bitter']) {
        const batch = makeBatch({ tasting: makeTasting({ declaredDefects: bad }) });
        const result = validateStoreFile(makeStoreFile([makeVersion()], [batch]));
        expect(result.ok).toBe(false);
        expect(result.errors.some((error) => error.includes('tasting.declaredDefects'))).toBe(true);
      }
    });

    it("rejects a tick naming a word the batch's own snapshot lacks, naming the path (T-04-07)", () => {
      const batch = makeBatch({ tasting: makeTasting({ declaredDefects: ['Salty'] }) });
      const result = validateStoreFile(makeStoreFile([makeVersion()], [batch]));
      expect(result.ok).toBe(false);
      expect(result.errors.some((error) => error.includes('$.batches[0].tasting.declaredDefects'))).toBe(true);
    });

    it('rejects a tick on a batch whose snapshot declares no problem', () => {
      const batch = makeBatch({
        snapshot: { ...makeBatch().snapshot, declaredFlaws: [] },
        tasting: makeTasting({ declaredDefects: ['Bitter'] }),
      });
      const result = validateStoreFile(makeStoreFile([makeVersion()], [batch]));
      expect(result.ok).toBe(false);
      expect(result.errors.some((error) => error.includes('tasting.declaredDefects'))).toBe(true);
    });

    it('rejects a repeated tick, naming the path', () => {
      const batch = makeBatch({
        snapshot: { ...makeBatch().snapshot, declaredFlaws: ['Bitter', 'Salty'] },
        tasting: makeTasting({ declaredDefects: ['Bitter', 'Bitter'] }),
      });
      const result = validateStoreFile(makeStoreFile([makeVersion()], [batch]));
      expect(result.ok).toBe(false);
      expect(result.errors.some((error) => error.includes('tasting.declaredDefects'))).toBe(true);
    });

    it('accepts one and two ticks naming words the snapshot holds', () => {
      const snapshot = { ...makeBatch().snapshot, declaredFlaws: ['Bitter', 'Salty'] };
      for (const ticks of [['Bitter'], ['Salty'], ['Bitter', 'Salty']]) {
        const batch = makeBatch({ snapshot, tasting: makeTasting({ declaredDefects: ticks }) });
        expect(validateStoreFile(makeStoreFile([makeVersion()], [batch]))).toEqual({ ok: true, errors: [] });
      }
    });

    it('rejects an unknown meltStyle, naming the path', () => {
      const batch = makeBatch({ tasting: makeTasting({ meltStyle: 'Frozen solid' }) });
      const result = validateStoreFile(makeStoreFile([makeVersion()], [batch]));
      expect(result.ok).toBe(false);
      expect(result.errors.some((error) => error.includes('tasting.meltStyle'))).toBe(true);
    });
  });

  // The batch-level changed date (D-04), replacing the amendedAt list.
  describe('validateBatch, the changed date', () => {
    it('accepts a null changed date', () => {
      expect(validateStoreFile(makeStoreFile([makeVersion()], [makeBatch({ changed: null })]))).toEqual({
        ok: true,
        errors: [],
      });
    });

    it('accepts a string changed date', () => {
      expect(validateStoreFile(makeStoreFile([makeVersion()], [makeBatch({ changed: '2026-09-06' })]))).toEqual({
        ok: true,
        errors: [],
      });
    });

    it('rejects a non-string, non-null changed date, naming the path', () => {
      const batch = makeBatch({ changed: 42 });
      const result = validateStoreFile(makeStoreFile([makeVersion()], [batch]));
      expect(result.ok).toBe(false);
      expect(result.errors.some((error) => error.includes('.changed'))).toBe(true);
    });
  });
});

// D-11: the recipe record { id, name, description }, validated in
// validateAuthoredNote's collect-all-errors, name-the-path style.
describe('validateRecipe / $.recipes', () => {
  it('accepts a well-formed store file with one recipe, reporting ok', () => {
    expect(validateStoreFile(makeStoreFile([makeVersion()], [], [makeRecipe()]))).toEqual({ ok: true, errors: [] });
  });

  it('rejects a missing recipes array, naming the path', () => {
    const result = validateStoreFile({ ...makeStoreFile(), recipes: undefined });
    expect(result.ok).toBe(false);
    expect(result.errors.some((error) => error.includes('$.recipes: expected an array'))).toBe(true);
  });

  it('rejects a recipe with no id, naming the path', () => {
    const recipe = makeRecipe();
    delete recipe.id;
    const result = validateStoreFile(makeStoreFile([makeVersion()], [], [recipe]));
    expect(result.ok).toBe(false);
    expect(result.errors.some((error) => error.includes('$.recipes[0].id'))).toBe(true);
  });

  it('rejects a recipe whose name is not a string, naming the path and the received value', () => {
    const recipe = makeRecipe({ name: 42 });
    const result = validateStoreFile(makeStoreFile([makeVersion()], [], [recipe]));
    expect(result.ok).toBe(false);
    const error = result.errors.find((message) => message.includes('$.recipes[0].name'));
    expect(error).toBe('$.recipes[0].name: expected a string, got 42');
  });

  it('rejects a recipe whose description is not a string, naming the path', () => {
    const recipe = makeRecipe({ description: null });
    const result = validateStoreFile(makeStoreFile([makeVersion()], [], [recipe]));
    expect(result.ok).toBe(false);
    expect(result.errors.some((error) => error.includes('$.recipes[0].description'))).toBe(true);
  });

  it('rejects a recipe carrying an own __proto__ key via the existing unsafe-key scanner, and leaves a fresh object unpolluted', () => {
    const malicious = JSON.parse(
      '{"app":"sprinkles","schemaVersion":8,"versions":[],"batches":[],"library":[],' +
        '"recipes":[{"id":"r1","name":"x","description":"x","__proto__":{"polluted":true}}]}',
    );
    const result = validateStoreFile(malicious);
    expect(result.ok).toBe(false);
    expect(result.errors.some((error) => error.includes('__proto__'))).toBe(true);
    expect({}.polluted).toBeUndefined();
  });
});

// D-08 as amended: a library record is checked as a wrapper, { id, entry },
// and no further; a reserved name is refused as an id's value too.
describe('validateLibraryRecord / $.library (D-08)', () => {
  const fileWith = (...records) => makeStoreFile([makeVersion()], [], [makeRecipe()], records);

  it('accepts { id: sucrose, entry: library.sucrose } and the whole seeded library', () => {
    expect(validateStoreFile(fileWith(makeLibraryRecord()))).toEqual({ ok: true, errors: [] });
    const everything = Object.entries(library).map(([id, entry]) => ({ id, entry }));
    expect(validateStoreFile(fileWith(...everything))).toEqual({ ok: true, errors: [] });
  });

  it('accepts an empty library list', () => {
    expect(validateStoreFile(fileWith())).toEqual({ ok: true, errors: [] });
  });

  it.each([['absent', undefined], ['an object', {}]])('refuses a library that is %s, naming the path', (_label, value) => {
    const result = validateStoreFile({ ...makeStoreFile(), library: value });
    expect(result.ok).toBe(false);
    expect(result.errors).toEqual(['$.library: expected an array']);
  });

  it.each([['null', null], ['an array', []], ['a string', 'sucrose']])('refuses a record that is %s', (_label, record) => {
    const result = validateStoreFile(fileWith(record));
    expect(result.ok).toBe(false);
    expect(result.errors).toEqual(['$.library[0]: expected an object']);
  });

  it.each([['missing', undefined], ['empty', ''], ['a number', 42]])('refuses an id that is %s', (_label, id) => {
    const record = makeLibraryRecord({ id });
    if (id === undefined) delete record.id;
    const result = validateStoreFile(fileWith(record));
    expect(result.ok).toBe(false);
    expect(result.errors).toEqual(['$.library[0].id: expected a non-empty string']);
  });

  it.each(['__proto__', 'constructor', 'prototype'])('refuses %s as a library id, naming the path and the value', (name) => {
    const result = validateStoreFile(fileWith(makeLibraryRecord({ id: name })));
    expect(result.ok).toBe(false);
    expect(result.errors).toEqual([`$.library[0].id: prototype-mutating id is not allowed, got "${name}"`]);
  });

  it.each(['__proto__x', 'my-constructor', 'prototype-2'])('still accepts the library id %s, which only contains a reserved name', (id) => {
    expect(validateStoreFile(fileWith(makeLibraryRecord({ id }))).ok).toBe(true);
  });

  it.each([['null', null], ['an array', []], ['a string', 'x']])(
    'refuses an entry that is %s, and reports no name or composition error for it',
    (_label, entry) => {
      const result = validateStoreFile(fileWith(makeLibraryRecord({ entry })));
      expect(result.ok).toBe(false);
      expect(result.errors).toEqual(['$.library[0].entry: expected an object']);
    },
  );

  it.each([['missing', undefined], ['empty', '']])('refuses an entry name that is %s', (_label, name) => {
    const entry = { ...structuredClone(library.sucrose), name };
    if (name === undefined) delete entry.name;
    const result = validateStoreFile(fileWith(makeLibraryRecord({ entry })));
    expect(result.ok).toBe(false);
    expect(result.errors).toEqual([`$.library[0].entry.name: expected a non-empty string, got ${JSON.stringify(name)}`]);
  });

  it.each([['missing', undefined], ['null', null], ['an array', []]])('refuses a composition that is %s', (_label, composition) => {
    const entry = { ...structuredClone(library.sucrose), composition };
    if (composition === undefined) delete entry.composition;
    const result = validateStoreFile(fileWith(makeLibraryRecord({ entry })));
    expect(result.ok).toBe(false);
    expect(result.errors).toEqual(['$.library[0].entry.composition: expected an object']);
  });

  it('refuses a composition field that is not a finite number, naming the path and the value', () => {
    const entry = structuredClone(library.sucrose);
    entry.composition.pac = '100';
    const result = validateStoreFile(fileWith(makeLibraryRecord({ entry })));
    expect(result.ok).toBe(false);
    expect(result.errors).toEqual(['$.library[0].entry.composition.pac: expected a finite number, got "100"']);
  });

  it('checks the wrapper only: an entry of just name and composition validates, and so does a category that is a number', () => {
    const bare = { id: 'bare', entry: { name: 'Bare', composition: { fat: 1 } } };
    const odd = makeLibraryRecord({ id: 'odd', entry: { ...structuredClone(library.sucrose), category: 42 } });
    expect(validateStoreFile(fileWith(bare, odd))).toEqual({ ok: true, errors: [] });
  });

  it('names the second record by its index when the first is good', () => {
    const result = validateStoreFile(fileWith(makeLibraryRecord(), { id: 'bad', entry: null }));
    expect(result.errors).toEqual(['$.library[1].entry: expected an object']);
  });

  it('rejects a library entry carrying an own __proto__ key via the existing unsafe-key scanner, and leaves a fresh object unpolluted', () => {
    const malicious = JSON.parse(
      '{"app":"sprinkles","schemaVersion":8,"versions":[],"batches":[],"recipes":[],' +
        '"library":[{"id":"sucrose","entry":{"name":"Sucrose","composition":{"pac":100},"__proto__":{"polluted":true}}}]}',
    );
    const result = validateStoreFile(malicious);
    expect(result.ok).toBe(false);
    expect(result.errors.some((error) => error.includes('__proto__'))).toBe(true);
    expect({}.polluted).toBeUndefined();
  });
});

describe('importStore, a storage failure reads in words', () => {
  it('has the one sentence the import panel shows', () => {
    expect(IMPORT_STORAGE_ERROR).toBe('Couldn’t save this file. Nothing was changed.');
  });

  it('resolves to ok false with that sentence when importAll rejects, rather than throwing', async () => {
    const repository = createInMemoryRepository([], [], []);
    repository.importAll = async () => {
      throw new Error('quota exceeded');
    };
    const result = await importStore(repository, makeStoreFile([makeVersion()], [], [makeRecipe()]));
    expect(result).toEqual({ ok: false, errors: [IMPORT_STORAGE_ERROR] });
  });

  it.each(['getAll', 'listRecipes'])('resolves to the same result when %s rejects', async (method) => {
    const repository = createInMemoryRepository([], [], []);
    repository[method] = async () => {
      throw new Error('store unavailable');
    };
    const result = await importStore(repository, makeStoreFile([makeVersion()], [], [makeRecipe()]));
    expect(result).toEqual({ ok: false, errors: [IMPORT_STORAGE_ERROR] });
    expect(repository.importAllCalls).toBe(0);
  });

  it("still round-trips the seeded store's export through importStore and a real repository", async () => {
    const source = createRepository();
    await seedIfEmpty(source);
    const file = JSON.parse(JSON.stringify(await exportStore(source)));

    globalThis.indexedDB = new IDBFactory();
    const target = createRepository();
    expect(await importStore(target, file)).toEqual({ ok: true, errors: [] });
    expect(await target.listRecipes()).toEqual(file.recipes);
    expect(await target.listVersions()).toEqual(file.versions);
    expect(await target.getAllBatches()).toEqual(file.batches);
    expect(file.library).toHaveLength(Object.keys(library).length);
    expect(await target.listLibrary()).toEqual(file.library);
  });
});

describe('importStore', () => {
  it('writes nothing on an invalid payload and reports every error found', async () => {
    const repository = createInMemoryRepository([makeVersion({ id: 'existing' })]);
    const before = [...repository.versions];

    const result = await importStore(repository, { ...makeStoreFile(), app: 'other', schemaVersion: 3 });

    expect(result.ok).toBe(false);
    expect(result.errors).toHaveLength(3);
    expect(repository.versions).toEqual(before);
  });

  it('imports a well-formed schemaVersion 8 file with a batch, a recipe and a library record, through one importAll call', async () => {
    const repository = createInMemoryRepository([], [], []);
    const result = await importStore(repository, makeStoreFile([makeVersion()], [makeBatch()], [makeRecipe()]));
    expect(result.ok).toBe(true);
    expect(repository.recipes).toEqual([makeRecipe()]);
    expect(repository.versions).toEqual([makeVersion()]);
    expect(repository.batches).toEqual([makeBatch()]);
    expect(repository.library).toEqual([makeLibraryRecord()]);
    expect(repository.importAllCalls).toBe(1);
  });

  it('refuses a version 7 file, which has no library, with OLDER_EXPORT_MESSAGE first, and writes nothing (D-06)', async () => {
    const repository = createInMemoryRepository([], [], []);
    const file = { ...makeStoreFile(), schemaVersion: 7 };
    delete file.library;

    const result = await importStore(repository, file);

    expect(result.ok).toBe(false);
    expect(result.errors[0]).toBe(OLDER_EXPORT_MESSAGE);
    expect(repository.importAllCalls).toBe(0);
  });

  it('refuses a file with a reserved library id and writes nothing (D-08)', async () => {
    const repository = createInMemoryRepository([], [], []);
    const file = JSON.parse(
      JSON.stringify(makeStoreFile([makeVersion()], [], [makeRecipe()], [makeLibraryRecord({ id: '__proto__' })])),
    );

    const result = await importStore(repository, file);

    expect(result.ok).toBe(false);
    expect(repository.importAllCalls).toBe(0);
    expect(repository.library).toEqual([]);
  });

  it('refuses the whole file: one bad library record beside a good one writes nothing at all', async () => {
    const repository = createInMemoryRepository([], [], []);
    const file = makeStoreFile([makeVersion()], [], [makeRecipe()], [makeLibraryRecord(), { id: 'bad', entry: null }]);

    const result = await importStore(repository, file);

    expect(result.ok).toBe(false);
    expect(repository.importAllCalls).toBe(0);
    expect(repository.library).toEqual([]);
    expect(repository.versions).toEqual([]);
  });

  it('refuses a cloneable malformed library record and leaves a real store empty (review item 2)', async () => {
    const repository = createRepository();
    const file = JSON.parse(
      JSON.stringify(makeStoreFile([makeVersion()], [], [makeRecipe()], [{ id: 'sucrose', entry: null }])),
    );

    const result = await importStore(repository, file);

    expect(result.ok).toBe(false);
    expect(result.errors.some((error) => error.includes('$.library[0].entry'))).toBe(true);
    const fresh = createRepository();
    expect(await fresh.listLibrary()).toEqual([]);
    expect(await fresh.listVersions()).toEqual([]);
    expect(await fresh.listRecipes()).toEqual([]);
  });

  it('refuses the whole file: one bad batch beside a good one writes nothing at all', async () => {
    const repository = createInMemoryRepository([], []);
    const goodBatch = makeBatch({ id: 'good' });
    const badBatch = makeBatch({ id: 'bad', versionId: undefined });

    const result = await importStore(repository, makeStoreFile([makeVersion()], [goodBatch, badBatch]));

    expect(result.ok).toBe(false);
    expect(repository.importAllCalls).toBe(0);
    expect(repository.versions).toEqual([]);
    expect(repository.batches).toEqual([]);
  });
});

// An imported file carrying a child version whose parent is neither in the
// file nor already in the store is refused whole.
describe('the parent-resolves gate', () => {
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
    expect(repository.versions).toEqual([]);
    expect(repository.importAllCalls).toBe(0);
  });

  it('validateStoreFile stays pure: it accepts the same unresolvable-parent file with no error, since the gate lives in importStore', () => {
    const child = makeVersion({ id: 'child', parentVersionId: 'unknown-parent', parentVersionLabel: 'line' });
    expect(validateStoreFile(makeStoreFile([child]))).toEqual({ ok: true, errors: [] });
  });
});

// D-11: an imported version whose recipeId names no recipe in the file or
// the store is refused whole — the same "validate then write" shape as
// the parent-resolves gate above, run after it and before any write.
describe('the recipe-resolves gate', () => {
  it('accepts a file whose version names a recipe present in the same file', async () => {
    const version = makeVersion({ recipeId: 'r1' });
    const repository = createInMemoryRepository([], [], []);
    const result = await importStore(repository, makeStoreFile([version], [], [makeRecipe({ id: 'r1' })]));
    expect(result.ok).toBe(true);
    expect(repository.versions).toEqual([version]);
  });

  it('accepts a file whose version names a recipe already in the store', async () => {
    const version = makeVersion({ recipeId: 'r1' });
    const repository = createInMemoryRepository([], [], [makeRecipe({ id: 'r1' })]);
    const result = await importStore(repository, makeStoreFile([version], [], []));
    expect(result.ok).toBe(true);
  });

  it('refuses whole a file whose version names a recipe in neither the file nor the store — nothing is written', async () => {
    const version = makeVersion({ recipeId: 'unknown-recipe' });
    const repository = createInMemoryRepository([], [], []);
    const result = await importStore(repository, makeStoreFile([version], [], [makeRecipe({ id: 'r1' })]));
    expect(result.ok).toBe(false);
    expect(result.errors.some((error) => error.includes('recipeId'))).toBe(true);
    expect(repository.versions).toEqual([]);
    expect(repository.recipes).toEqual([]);
    expect(repository.importAllCalls).toBe(0);
  });

  it('validateStoreFile stays pure: it accepts the same unresolvable-recipe file with no error, since the gate lives in importStore', () => {
    const version = makeVersion({ recipeId: 'unknown-recipe' });
    expect(validateStoreFile(makeStoreFile([version], [], [makeRecipe({ id: 'r1' })]))).toEqual({ ok: true, errors: [] });
  });
});

// The new per-field checks validateVersion carries.
describe('validateVersion, the fields', () => {
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

  // WR-01 (code review): validateStep previously checked only removed/uses,
  // leaving n/leadIn/instruction/targets — every one UI-facing — unvalidated.
  it('rejects a step whose n is not a number, naming the path', () => {
    const version = makeVersion({ method: [makeStep({ n: '1' })] });
    const result = validateStoreFile(makeStoreFile([version]));
    expect(result.ok).toBe(false);
    expect(result.errors.some((error) => error.includes('.method[0].n'))).toBe(true);
  });

  it('rejects a step whose leadIn is blank, naming the path', () => {
    const version = makeVersion({ method: [makeStep({ leadIn: '' })] });
    const result = validateStoreFile(makeStoreFile([version]));
    expect(result.ok).toBe(false);
    expect(result.errors.some((error) => error.includes('.method[0].leadIn'))).toBe(true);
  });

  it('rejects a step whose instruction is null, naming the path', () => {
    const version = makeVersion({ method: [makeStep({ instruction: null })] });
    const result = validateStoreFile(makeStoreFile([version]));
    expect(result.ok).toBe(false);
    expect(result.errors.some((error) => error.includes('.method[0].instruction'))).toBe(true);
  });

  it('rejects a step whose targets is not an array, naming the path', () => {
    const version = makeVersion({ method: [makeStep({ targets: 'not an array' })] });
    const result = validateStoreFile(makeStoreFile([version]));
    expect(result.ok).toBe(false);
    expect(result.errors.some((error) => error.includes('.method[0].targets'))).toBe(true);
  });

  it('rejects a step whose targets entry is missing a value, naming the path', () => {
    const version = makeVersion({ method: [makeStep({ targets: [{ label: 'temp' }] })] });
    const result = validateStoreFile(makeStoreFile([version]));
    expect(result.ok).toBe(false);
    expect(result.errors.some((error) => error.includes('.method[0].targets[0]'))).toBe(true);
  });

  it('accepts a well-formed step carrying n/leadIn/instruction/targets', () => {
    const version = makeVersion({
      method: [makeStep({ n: 1, leadIn: 'Step', instruction: 'Do it', targets: [{ label: 'temp', value: '69 °C' }] })],
    });
    expect(validateStoreFile(makeStoreFile([version]))).toEqual({ ok: true, errors: [] });
  });

  it('rejects an authored note with no text field, naming the path', () => {
    const version = makeVersion({ authored: { beforeYouStart: [{ inheritedFrom: null }] } });
    const result = validateStoreFile(makeStoreFile([version]));
    expect(result.ok).toBe(false);
    expect(result.errors.some((error) => error.includes('.authored.beforeYouStart[0].text'))).toBe(true);
  });

  it('accepts a well-formed authored note carrying an inheritedFrom string', () => {
    const version = makeVersion({
      authored: { beforeYouStart: [{ text: 'note', inheritedFrom: '50 g oil · 800 g' }] },
    });
    expect(validateStoreFile(makeStoreFile([version]))).toEqual({ ok: true, errors: [] });
  });

  it('accepts the battery\'s declared pair and declared problem', () => {
    const version = makeVersion({ declaredAxes: ['Body', 'Oil'], declaredFlaws: ['Bitter'] });
    expect(validateStoreFile(makeStoreFile([version]))).toEqual({ ok: true, errors: [] });
  });

  it('accepts empty declaredFlaws and an empty declaredAxes array', () => {
    const version = makeVersion({ declaredAxes: [], declaredFlaws: [] });
    expect(validateStoreFile(makeStoreFile([version]))).toEqual({ ok: true, errors: [] });
  });

  it('accepts two declared scales and two declared problems', () => {
    const version = makeVersion({ declaredAxes: ['Body', 'Oil'], declaredFlaws: ['Bitter', 'Salty'] });
    expect(validateStoreFile(makeStoreFile([version]))).toEqual({ ok: true, errors: [] });
  });

  it('rejects a third declared problem, naming the path', () => {
    const version = makeVersion({ declaredFlaws: ['Bitter', 'Salty', 'Burnt'] });
    const result = validateStoreFile(makeStoreFile([version]));
    expect(result.ok).toBe(false);
    expect(result.errors.some((error) => error.includes('$.versions[0].declaredFlaws') && error.includes('at most 2'))).toBe(true);
  });

  it('rejects a repeated declared problem, naming the path', () => {
    const version = makeVersion({ declaredFlaws: ['Bitter', 'Bitter'] });
    const result = validateStoreFile(makeStoreFile([version]));
    expect(result.ok).toBe(false);
    expect(result.errors.some((error) => error.includes('$.versions[0].declaredFlaws'))).toBe(true);
  });

  it('rejects an empty or non-string declared problem, naming the path', () => {
    for (const bad of ['', 42, null]) {
      const result = validateStoreFile(makeStoreFile([makeVersion({ declaredFlaws: [bad] })]));
      expect(result.ok).toBe(false);
      expect(result.errors.some((error) => error.includes('$.versions[0].declaredFlaws[0]'))).toBe(true);
    }
  });

  it('rejects a third declared scale and a repeated declared scale, naming the path', () => {
    const third = validateStoreFile(makeStoreFile([makeVersion({ declaredAxes: ['Body', 'Oil', 'Sweetness'] })]));
    expect(third.ok).toBe(false);
    expect(third.errors.some((error) => error.includes('$.versions[0].declaredAxes') && error.includes('at most 2'))).toBe(true);
    const repeat = validateStoreFile(makeStoreFile([makeVersion({ declaredAxes: ['Body', 'Body'] })]));
    expect(repeat.ok).toBe(false);
    expect(repeat.errors.some((error) => error.includes('$.versions[0].declaredAxes'))).toBe(true);
  });

  it('rejects the pre-04 single declaredFlaw string left in place of the list, naming the path', () => {
    const result = validateStoreFile(makeStoreFile([makeVersion({ declaredFlaws: 'Bitter' })]));
    expect(result.ok).toBe(false);
    expect(result.errors.some((error) => error.includes('$.versions[0].declaredFlaws'))).toBe(true);
  });

  it("applies the same bounds to a batch snapshot's declaredFlaws", () => {
    const snapshot = { ...makeBatch().snapshot, declaredFlaws: ['A', 'B', 'C'] };
    const result = validateStoreFile(makeStoreFile([makeVersion()], [makeBatch({ snapshot })]));
    expect(result.ok).toBe(false);
    expect(result.errors.some((error) => error.includes('$.batches[0].snapshot.declaredFlaws'))).toBe(true);
  });

  // WR-01 (code review): versionLabel, sheetTitle and sheetDescription are
  // read directly by the UI (the version-line uniqueness check, the
  // Sheet title/description's own rendering) but were never checked here.
  it('rejects a version whose versionLabel is blank, naming the field', () => {
    const version = makeVersion({ versionLabel: '' });
    const result = validateStoreFile(makeStoreFile([version]));
    expect(result.ok).toBe(false);
    expect(result.errors.some((error) => error.includes('.versionLabel'))).toBe(true);
  });

  it('rejects a version whose versionLabel is missing, naming the field', () => {
    const version = makeVersion();
    delete version.versionLabel;
    const result = validateStoreFile(makeStoreFile([version]));
    expect(result.ok).toBe(false);
    expect(result.errors.some((error) => error.includes('.versionLabel'))).toBe(true);
  });

  it('rejects a version whose sheetTitle is not a string, naming the field', () => {
    const version = makeVersion({ sheetTitle: null });
    const result = validateStoreFile(makeStoreFile([version]));
    expect(result.ok).toBe(false);
    expect(result.errors.some((error) => error.includes('.sheetTitle'))).toBe(true);
  });

  it('accepts a version whose sheetTitle is a blank string', () => {
    const version = makeVersion({ sheetTitle: '' });
    expect(validateStoreFile(makeStoreFile([version]))).toEqual({ ok: true, errors: [] });
  });

  it('rejects a version whose sheetDescription is not a string, naming the field', () => {
    const version = makeVersion({ sheetDescription: null });
    const result = validateStoreFile(makeStoreFile([version]));
    expect(result.ok).toBe(false);
    expect(result.errors.some((error) => error.includes('.sheetDescription'))).toBe(true);
  });

  it('accepts a version whose sheetDescription is a blank string', () => {
    const version = makeVersion({ sheetDescription: '' });
    expect(validateStoreFile(makeStoreFile([version]))).toEqual({ ok: true, errors: [] });
  });

  it('rejects a version whose recipeId is missing, naming the field', () => {
    const version = makeVersion();
    delete version.recipeId;
    const result = validateStoreFile(makeStoreFile([version]));
    expect(result.ok).toBe(false);
    expect(result.errors.some((error) => error.includes('.recipeId'))).toBe(true);
  });

  it('says nothing about a recipe name — the field left the version (D-11)', () => {
    const result = validateStoreFile(makeStoreFile([makeVersion()]));
    expect(result.errors.some((error) => error.includes('recipeName'))).toBe(false);
  });

  it('rejects a declaredAxes entry naming an axis outside the declared pair, naming the path', () => {
    const version = makeVersion({ declaredAxes: ['Sweetness'] });
    const result = validateStoreFile(makeStoreFile([version]));
    expect(result.ok).toBe(false);
    expect(result.errors.some((error) => error.includes('.declaredAxes[0]'))).toBe(true);
  });

  it("rejects a file carrying __proto__ on a method step — the uses array's containing object — via the existing scanner", () => {
    const malicious = JSON.parse(
      '{"app":"sprinkles","schemaVersion":8,"versions":[{"id":"v1","schemaVersion":6,"recipeId":"r1","coefficientSetId":"c",' +
        '"parentVersionId":null,"parentVersionLabel":null,"reason":null,"citedBatchId":null,"createdAt":"2026-01-01T00:00:00.000Z",' +
        '"declaredAxes":["Body","Oil"],"declaredFlaws":["Bitter"],"versionLabel":"v","sheetTitle":"","sheetDescription":"",' +
        '"rows":[{"id":"r1","ingredientName":"x","portions":[{"step":1,"grams":1}],"ingredient":{"composition":{"fat":1}},"removed":false}],' +
        '"method":[{"n":1,"leadIn":"x","instruction":"x","removed":false,"uses":[],"__proto__":{"polluted":true}}],' +
        '"authored":{"beforeYouStart":[]}}],"batches":[],"recipes":[],"library":[]}',
    );
    const result = validateStoreFile(malicious);
    expect(result.ok).toBe(false);
    expect(result.errors.some((error) => error.includes('__proto__'))).toBe(true);
    expect({}.polluted).toBeUndefined();
  });
});

// Phase 03.6 (sketch 011 decision 51): a portion may carry an optional boolean
// `removed`, in a version's rows and in a batch's snapshot rows. Absent or a
// boolean is accepted; anything else is refused by path (T-03.6-05).
describe('a portion\'s optional removed flag (T-03.6-05)', () => {
  const versionPath = '$.versions[0].rows[0].portions[0].removed';
  const snapshotPath = '$.batches[0].snapshot.rows[0].portions[0].removed';

  function versionWithFlag(value) {
    const version = makeVersion();
    version.rows[0].portions[0].removed = value;
    return version;
  }

  function batchWithFlag(value) {
    const batch = makeBatch();
    batch.snapshot.rows[0].portions[0].removed = value;
    return batch;
  }

  it('accepts true, false and an absent key in a version\'s rows', () => {
    expect(validateStoreFile(makeStoreFile([versionWithFlag(true)])).ok).toBe(true);
    expect(validateStoreFile(makeStoreFile([versionWithFlag(false)])).ok).toBe(true);
    expect(validateStoreFile(makeStoreFile([makeVersion()])).ok).toBe(true);
  });

  it('accepts a boolean in a batch\'s snapshot rows', () => {
    expect(validateStoreFile(makeStoreFile([makeVersion()], [batchWithFlag(true)])).ok).toBe(true);
  });

  it.each([
    ['the string "true"', 'true'],
    ['the number 1', 1],
    ['null', null],
  ])('refuses %s in a version\'s rows, naming the path', (_label, value) => {
    const result = validateStoreFile(makeStoreFile([versionWithFlag(value)]));
    expect(result.ok).toBe(false);
    expect(result.errors.some((error) => error.startsWith(versionPath))).toBe(true);
  });

  it.each([
    ['the string "true"', 'true'],
    ['the number 1', 1],
    ['null', null],
  ])('refuses %s in a batch\'s snapshot rows, naming the path', (_label, value) => {
    const result = validateStoreFile(makeStoreFile([makeVersion()], [batchWithFlag(value)]));
    expect(result.ok).toBe(false);
    expect(result.errors.some((error) => error.startsWith(snapshotPath))).toBe(true);
  });

  it('refuses a file carrying a bad flag whole, and writes nothing', async () => {
    const repository = createInMemoryRepository([], [], []);
    const result = await importStore(repository, makeStoreFile([versionWithFlag('true')]));
    expect(result.ok).toBe(false);
    expect(repository.importAllCalls).toBe(0);
    expect(repository.versions).toEqual([]);
  });

  it('keeps a line that is out through exportStore then importStore', async () => {
    const source = createInMemoryRepository([versionWithFlag(true)], [], [makeRecipe()]);
    const exported = JSON.parse(JSON.stringify(await exportStore(source)));
    const target = createInMemoryRepository([], [], []);
    const result = await importStore(target, exported);
    expect(result.ok).toBe(true);
    expect(target.versions[0].rows[0].portions[0].removed).toBe(true);
  });
});

// WR-01 of the Phase 5 review: a row id is used as an object key downstream
// (the batch's as-made map, the pens' drafts), so the names the key scan
// refuses as keys are refused as a row id's value too.
describe('a reserved row id is refused as a value (WR-01)', () => {
  const NAMES = ['__proto__', 'constructor', 'prototype'];

  it.each(NAMES)('refuses %s as a version row id, naming the path and the value', (name) => {
    const version = makeVersion();
    version.rows[0].id = name;
    const result = validateStoreFile(makeStoreFile([version]));
    expect(result.ok).toBe(false);
    expect(result.errors).toEqual([`$.versions[0].rows[0].id: prototype-mutating id is not allowed, got "${name}"`]);
  });

  it.each(NAMES)('refuses %s as a batch snapshot row id, naming the path and the value', (name) => {
    const batch = makeBatch();
    batch.snapshot.rows[0].id = name;
    const result = validateStoreFile(makeStoreFile([makeVersion()], [batch]));
    expect(result.ok).toBe(false);
    expect(result.errors).toEqual([`$.batches[0].snapshot.rows[0].id: prototype-mutating id is not allowed, got "${name}"`]);
  });

  it.each(['__proto__x', 'my-constructor', 'prototype-2'])('still accepts the row id %s, which only contains a reserved name', (id) => {
    const version = makeVersion();
    version.rows[0].id = id;
    expect(validateStoreFile(makeStoreFile([version])).ok).toBe(true);
  });

  it('refuses the whole file and writes nothing', async () => {
    const version = makeVersion();
    version.rows[0].id = '__proto__';
    const file = JSON.parse(JSON.stringify(makeStoreFile([version])));
    const repository = createInMemoryRepository([], [], []);
    const result = await importStore(repository, file);
    expect(result.ok).toBe(false);
    expect(repository.importAllCalls).toBe(0);
    expect(repository.versions).toEqual([]);
  });
});
