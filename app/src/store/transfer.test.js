import { describe, it, expect } from 'vitest';
import { exportStore, importStore, validateStoreFile, STORE_SCHEMA_VERSION, OLDER_EXPORT_MESSAGE } from './transfer.js';
import { oliveOilVersion, oliveOilRecipe } from '../data/olive-oil.js';
import { augustSecondBatch } from '../data/batch-2026-08-02.js';

// A plain in-memory object implementing the repository seam's contract —
// no store library, no browser. Mirrors createRepository's putAll/putAllBatches/
// putAllRecipes: upsert by id, never a wholesale replace. Tracks call counts
// so a test can assert a write method was never invoked (the refuse-whole-file
// gate).
function createInMemoryRepository(initialVersions = [], initialBatches = [], initialRecipes = []) {
  const versions = [...initialVersions];
  const batches = [...initialBatches];
  const recipes = [...initialRecipes];
  let putAllCalls = 0;
  let putAllBatchesCalls = 0;
  let putAllRecipesCalls = 0;
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
    get putAllCalls() {
      return putAllCalls;
    },
    get putAllBatchesCalls() {
      return putAllBatchesCalls;
    },
    get putAllRecipesCalls() {
      return putAllRecipesCalls;
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
    async listRecipes() {
      return [...recipes];
    },
    async putAllRecipes(newRecipes) {
      putAllRecipesCalls += 1;
      for (const recipe of newRecipes) {
        const i = recipes.findIndex((r) => r.id === recipe.id);
        if (i >= 0) recipes[i] = recipe;
        else recipes.push(recipe);
      }
    },
  };
}

// Schema 6-shaped by default (D-10, D-11, 03.5-CONTEXT.md): every version
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
    declaredFlaw: 'Bitter',
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
      declaredFlaw: 'Bitter',
    },
    churn: {
      churnDate: '2026-08-02',
      asMade: {},
      stepChanges: {},
      timeToDrawTempMinutes: null,
      outOfMachineTempC: null,
      churnDurationMinutes: null,
      exitConsistency: null,
      airiness: null,
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
    bitterDeclared: null,
    meltTestG: null,
    meltStyle: null,
    ...overrides,
  };
}

// The one accepted shape (D-10, D-11): schemaVersion 6, batches and
// recipes always present (arrays, never absent).
function makeStoreFile(versions = [makeVersion()], batches = [], recipes = [makeRecipe()]) {
  return { app: 'sprinkles', schemaVersion: 6, exportedAt: '2026-01-01T00:00:00.000Z', versions, batches, recipes };
}

describe('exportStore', () => {
  it('returns app sprinkles, schemaVersion 6, and every version, batch and recipe the repository held', async () => {
    const repository = createInMemoryRepository(
      [makeVersion(), makeVersion({ id: 'v2' })],
      [makeBatch()],
      [makeRecipe()],
    );
    const exported = await exportStore(repository);
    expect(exported.app).toBe('sprinkles');
    expect(exported.schemaVersion).toBe(6);
    expect(exported.schemaVersion).toBe(STORE_SCHEMA_VERSION);
    expect(exported.versions).toHaveLength(2);
    expect(exported.batches).toHaveLength(1);
    expect(exported.recipes).toHaveLength(1);
  });
});

describe('export then import round trip', () => {
  it('yields records deep-equal to the originals in a second empty repository', async () => {
    const source = createInMemoryRepository([makeVersion(), makeVersion({ id: 'v2' })], [makeBatch()], [makeRecipe()]);
    const exported = await exportStore(source);

    const target = createInMemoryRepository([], [], []);
    const result = await importStore(target, exported);

    expect(result.ok).toBe(true);
    expect(target.versions).toEqual(source.versions);
    expect(target.batches).toEqual(source.batches);
    expect(target.recipes).toEqual(source.recipes);
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

  it('accepts a payload whose schemaVersion is 6 — the schema number flips from refused to accepted (D-10, D-11)', () => {
    const result = validateStoreFile(makeStoreFile());
    expect(result.errors.some((error) => error.includes('schemaVersion'))).toBe(false);
  });

  it.each([1, 2, 3, 4, 5])(
    'rejects a payload whose schemaVersion is %i, naming the path and both the expected and received value',
    (oldSchemaVersion) => {
      const result = validateStoreFile({ ...makeStoreFile(), schemaVersion: oldSchemaVersion });
      expect(result.ok).toBe(false);
      const error = result.errors.find((message) => message.includes('$.schemaVersion'));
      expect(error).toContain('expected 6');
      expect(error).toContain(String(oldSchemaVersion));
    },
  );

  // D-10: a plain sentence goes first, before the path-named error, so an
  // older export's own maker sees words before a technical path.
  it.each([1, 2, 3, 4, 5])(
    'reports OLDER_EXPORT_MESSAGE as the first error for a payload whose schemaVersion is %i',
    (oldSchemaVersion) => {
      const result = validateStoreFile({ ...makeStoreFile(), schemaVersion: oldSchemaVersion });
      expect(result.ok).toBe(false);
      expect(result.errors[0]).toBe(OLDER_EXPORT_MESSAGE);
    },
  );

  it('does not report OLDER_EXPORT_MESSAGE for a well-formed schemaVersion 6 payload', () => {
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
    it('rejects a non-numeric value under the new churn field names — the retired numeric fields are no longer checked at all', () => {
      const batch = makeBatch({ churn: { ...makeBatch().churn, timeToDrawTempMinutes: 'cold' } });
      const result = validateStoreFile(makeStoreFile([makeVersion()], [batch]));
      expect(result.ok).toBe(false);
      expect(result.errors.some((error) => error.includes('churn.timeToDrawTempMinutes'))).toBe(true);
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
    it('accepts a batch whose tasting is null', () => {
      expect(validateStoreFile(makeStoreFile([makeVersion()], [makeBatch({ tasting: null })]))).toEqual({
        ok: true,
        errors: [],
      });
    });

    it('accepts a well-formed tasting object', () => {
      const batch = makeBatch({ tasting: makeTasting({ marks: { sweetness: 4, oil: 4 }, bitterDeclared: true, meltTestG: 3 }) });
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

    it('rejects bitterDeclared: false, naming the path — the toggle is true or null, never a stored false', () => {
      const batch = makeBatch({ tasting: makeTasting({ bitterDeclared: false }) });
      const result = validateStoreFile(makeStoreFile([makeVersion()], [batch]));
      expect(result.ok).toBe(false);
      expect(result.errors.some((error) => error.includes('tasting.bitterDeclared'))).toBe(true);
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
      '{"app":"sprinkles","schemaVersion":6,"versions":[],"batches":[],' +
        '"recipes":[{"id":"r1","name":"x","description":"x","__proto__":{"polluted":true}}]}',
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
    expect(result.errors).toHaveLength(3);
    expect(repository.versions).toEqual(before);
  });

  it('imports a well-formed schemaVersion 6 file with a batch and a recipe, round-tripping through putAllRecipes, putAll and putAllBatches', async () => {
    const repository = createInMemoryRepository([], [], []);
    const result = await importStore(repository, makeStoreFile([makeVersion()], [makeBatch()], [makeRecipe()]));
    expect(result.ok).toBe(true);
    expect(repository.recipes).toEqual([makeRecipe()]);
    expect(repository.versions).toEqual([makeVersion()]);
    expect(repository.batches).toEqual([makeBatch()]);
    expect(repository.putAllRecipesCalls).toBe(1);
  });

  it('refuses the whole file: one bad batch beside a good one writes nothing at all', async () => {
    const repository = createInMemoryRepository([], []);
    const goodBatch = makeBatch({ id: 'good' });
    const badBatch = makeBatch({ id: 'bad', versionId: undefined });

    const result = await importStore(repository, makeStoreFile([makeVersion()], [goodBatch, badBatch]));

    expect(result.ok).toBe(false);
    expect(repository.putAllCalls).toBe(0);
    expect(repository.putAllBatchesCalls).toBe(0);
    expect(repository.putAllRecipesCalls).toBe(0);
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
    expect(repository.putAllCalls).toBe(0);
    expect(repository.versions).toEqual([]);
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
    expect(repository.putAllCalls).toBe(0);
    expect(repository.putAllRecipesCalls).toBe(0);
    expect(repository.versions).toEqual([]);
    expect(repository.recipes).toEqual([]);
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

  it('accepts the battery\'s declared pair and declared flaw', () => {
    const version = makeVersion({ declaredAxes: ['Body', 'Oil'], declaredFlaw: 'Bitter' });
    expect(validateStoreFile(makeStoreFile([version]))).toEqual({ ok: true, errors: [] });
  });

  it('accepts a null declaredFlaw and an empty declaredAxes array', () => {
    const version = makeVersion({ declaredAxes: [], declaredFlaw: null });
    expect(validateStoreFile(makeStoreFile([version]))).toEqual({ ok: true, errors: [] });
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

  it('rejects a non-string, non-null declaredFlaw, naming the path', () => {
    const version = makeVersion({ declaredFlaw: 42 });
    const result = validateStoreFile(makeStoreFile([version]));
    expect(result.ok).toBe(false);
    expect(result.errors.some((error) => error.includes('.declaredFlaw'))).toBe(true);
  });

  it("rejects a file carrying __proto__ on a method step — the uses array's containing object — via the existing scanner", () => {
    const malicious = JSON.parse(
      '{"app":"sprinkles","schemaVersion":6,"versions":[{"id":"v1","schemaVersion":5,"recipeId":"r1","coefficientSetId":"c",' +
        '"parentVersionId":null,"parentVersionLabel":null,"reason":null,"citedBatchId":null,"createdAt":"2026-01-01T00:00:00.000Z",' +
        '"declaredAxes":["Body","Oil"],"declaredFlaw":"Bitter","versionLabel":"v","sheetTitle":"","sheetDescription":"",' +
        '"rows":[{"id":"r1","ingredientName":"x","portions":[{"step":1,"grams":1}],"ingredient":{"composition":{"fat":1}},"removed":false}],' +
        '"method":[{"n":1,"leadIn":"x","instruction":"x","removed":false,"uses":[],"__proto__":{"polluted":true}}],' +
        '"authored":{"beforeYouStart":[]}}],"batches":[],"recipes":[]}',
    );
    const result = validateStoreFile(malicious);
    expect(result.ok).toBe(false);
    expect(result.errors.some((error) => error.includes('__proto__'))).toBe(true);
    expect({}.polluted).toBeUndefined();
  });
});
