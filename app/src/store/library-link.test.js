// The LIB-08 proof, in fake-indexeddb: a row keeps the link to the library
// entry it was copied from through the repository, the store file export and
// an import into a fresh profile, and changing that entry afterwards moves no
// stored figure, because a row's figures come from its own copy and never
// from the link. The source profile is seeded (so its export carries the four
// seed tables and four core scales) and then given one hand-built version, which
// carries a canonical Sheet code of its own id and an own serveTempC, as an
// import requires of every version.
import 'fake-indexeddb/auto';
import { IDBFactory } from 'fake-indexeddb';
import { describe, it, beforeEach, expect } from 'vitest';
import { createRepository } from './repository.js';
import { seedIfEmpty } from './seed.js';
import { exportStore, importStore, validateStoreFile } from './transfer.js';
import { oliveOilVersion } from '../data/olive-oil.js';
import { codeFromVersionId } from '../domain/sheetCode.js';
import { rowFromLibraryRecord } from '../domain/versionRow.js';
import { computeBalance } from '../domain/composition.js';
import { buildFigures } from '../domain/figures.js';

beforeEach(() => {
  globalThis.indexedDB = new IDBFactory();
});

// A copy of the olive oil version under its own id (the seeded olive oil v1
// keeps its stored code), with its Graza Drizzle row rebuilt by
// rowFromLibraryRecord from the olive oil record the store holds.
async function profileWithLinkedVersion() {
  const repository = createRepository();
  await seedIfEmpty(repository);

  const record = await repository.getLibraryEntry('oliveOil');
  const version = structuredClone(oliveOilVersion);
  version.id = 'link-olive-oil-copy';
  version.sheetCode = codeFromVersionId(version.id);
  version.serveTempC = null;
  const at = version.rows.findIndex((row) => row.id === 'row-03');
  version.rows[at] = rowFromLibraryRecord(record, {
    id: 'row-03',
    step: 8,
    grams: 40,
    ingredientName: 'Graza Drizzle',
  });
  await repository.saveVersion(version);
  return { repository, version };
}

const linksOf = (version) => Object.fromEntries(version.rows.map((row) => [row.id, row.libraryId]));

describe('a row keeps its library link (LIB-08)', () => {
  it('through saveVersion and getVersion', async () => {
    const { repository, version } = await profileWithLinkedVersion();

    const stored = await repository.getVersion(version.id);

    expect(stored.rows.find((row) => row.id === 'row-03').libraryId).toBe('oliveOil');
    expect(linksOf(stored)).toEqual(linksOf(version));
    expect(Object.values(linksOf(stored)).every((link) => typeof link === 'string')).toBe(true);
  });

  it('through exportStore and importStore into a fresh profile', async () => {
    const { repository, version } = await profileWithLinkedVersion();
    const file = JSON.parse(JSON.stringify(await exportStore(repository)));
    expect(validateStoreFile(file)).toEqual({ ok: true, errors: [] });

    globalThis.indexedDB = new IDBFactory();
    const target = createRepository();
    expect(await importStore(target, file)).toEqual({ ok: true, errors: [] });

    const imported = await target.getVersion(version.id);
    expect(linksOf(imported)).toEqual(linksOf(version));
    expect(imported.rows.find((row) => row.id === 'row-03').libraryId).toBe('oliveOil');
  });

  it('and changing that library entry afterwards moves no stored figure', async () => {
    const { repository, version } = await profileWithLinkedVersion();
    const balanceBefore = computeBalance((await repository.getVersion(version.id)).rows);
    const figuresBefore = buildFigures(await repository.getVersion(version.id));

    const { entry } = await repository.getLibraryEntry('oliveOil');
    const changed = { id: 'oliveOil', entry: { ...entry, composition: { ...entry.composition, fat: 0.5 } } };
    await repository.putAllLibrary([changed]);

    // The change landed, and a row that read the entry through its link would move.
    expect((await repository.getLibraryEntry('oliveOil')).entry.composition.fat).toBe(0.5);
    const stored = await repository.getVersion(version.id);
    const swapped = stored.rows.map((row) => (row.libraryId === 'oliveOil' ? { ...row, ingredient: changed.entry } : row));
    expect(computeBalance(swapped).grams.fat).not.toBe(balanceBefore.grams.fat);

    // The proof: the stored copy, and every figure from it, is as it was.
    expect(stored.rows.find((row) => row.id === 'row-03').libraryId).toBe('oliveOil');
    expect(computeBalance(stored.rows)).toEqual(balanceBefore);
    expect(buildFigures(stored)).toEqual(figuresBefore);
  });
});
