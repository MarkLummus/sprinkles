import { describe, it, expect } from 'vitest';
import { exportStore, importStore, validateStoreFile } from './transfer.js';

// A plain in-memory object implementing the repository seam's contract —
// no store library, no browser. Mirrors createRepository's putAll: upsert
// by id, never a wholesale replace.
function createInMemoryRepository(initial = []) {
  const versions = [...initial];
  return {
    get versions() {
      return versions;
    },
    async getAll() {
      return [...versions];
    },
    async putAll(newVersions) {
      for (const version of newVersions) {
        const i = versions.findIndex((v) => v.id === version.id);
        if (i >= 0) versions[i] = version;
        else versions.push(version);
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
    ...overrides,
  };
}

function makeStoreFile(versions = [makeVersion()]) {
  return { app: 'sprinkles', schemaVersion: 1, exportedAt: '2026-01-01T00:00:00.000Z', versions };
}

describe('exportStore', () => {
  it('returns app sprinkles, schemaVersion 1, and every record the repository held', async () => {
    const repository = createInMemoryRepository([makeVersion(), makeVersion({ id: 'v2' })]);
    const exported = await exportStore(repository);
    expect(exported.app).toBe('sprinkles');
    expect(exported.schemaVersion).toBe(1);
    expect(exported.versions).toHaveLength(2);
  });
});

describe('export then import round trip', () => {
  it('yields records deep-equal to the originals in a second empty repository', async () => {
    const source = createInMemoryRepository([makeVersion(), makeVersion({ id: 'v2' })]);
    const exported = await exportStore(source);

    const target = createInMemoryRepository([]);
    const result = await importStore(target, exported);

    expect(result.ok).toBe(true);
    expect(target.versions).toEqual(source.versions);
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

  it('rejects a payload whose schemaVersion is 2, naming the field', () => {
    const result = validateStoreFile({ ...makeStoreFile(), schemaVersion: 2 });
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

  it('reports two errors for a payload with two distinct faults, not only the first', () => {
    const result = validateStoreFile({ ...makeStoreFile(), app: 'other', schemaVersion: 2 });
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
});

describe('importStore', () => {
  it('writes nothing on an invalid payload and reports every error found', async () => {
    const repository = createInMemoryRepository([makeVersion({ id: 'existing' })]);
    const before = [...repository.versions];

    const result = await importStore(repository, { ...makeStoreFile(), app: 'other', schemaVersion: 2 });

    expect(result.ok).toBe(false);
    expect(result.errors).toHaveLength(2);
    expect(repository.versions).toEqual(before);
  });

  it('writes through repository.putAll on a valid payload', async () => {
    const repository = createInMemoryRepository([]);
    const result = await importStore(repository, makeStoreFile());
    expect(result.ok).toBe(true);
    expect(repository.versions).toEqual([makeVersion()]);
  });
});
