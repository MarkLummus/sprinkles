// Import keeps every Sheet code as written and refuses a clash or a change
// (CODE-01, D-04a, D-07). The validator requires a canonical code on every
// version; importStore's pre-check refuses two versions in the file sharing a
// code, a file version whose code a stored version of another id holds, and a
// file version replacing a stored version with a different code; and
// repository.importAll repeats the check over the versions it reads inside its
// own transaction, so a version another tab writes between the pre-check and the
// write still aborts the import. Every refusal leaves all eight stores exactly as
// they were. Real IndexedDB through fake-indexeddb, a fresh IDBFactory per test;
// fake-indexeddb/auto comes first because repository.js opens its store on import.
import 'fake-indexeddb/auto';
import { IDBFactory } from 'fake-indexeddb';
import { describe, it, beforeEach, expect } from 'vitest';
import { createRepository } from './repository.js';
import { seedIfEmpty } from './seed.js';
import { importStore, validateStoreFile, IMPORT_STORAGE_ERROR } from './transfer.js';
import { storeFileOf, stampedSeedVersions } from './storeFile.fixtures.js';
import { SheetCodeError, codeFromVersionId } from '../domain/sheetCode.js';

// Two version ids whose id-derived codes are equal: the pair domain/sheetCode.test.js
// pins (a test file cannot be imported here, so the ids are repeated and the first
// case below proves they still collide).
const COLLIDING_ID_A = 'collide-1avm4ex8s';
const COLLIDING_ID_B = 'collide-1p5a0rvy0';

beforeEach(() => {
  globalThis.indexedDB = new IDBFactory();
});

async function seededProfile() {
  const repository = createRepository();
  await seedIfEmpty(repository);
  return repository;
}

const serialised = (value) => JSON.parse(JSON.stringify(value));

// A copy of the seeded olive oil version under its own id, carrying the code its
// id derives (as createChildVersion stores it) unless a code is given.
function versionOf(id, sheetCode = codeFromVersionId(id)) {
  const [oliveOil] = stampedSeedVersions();
  return { ...oliveOil, id, sheetCode, parentVersionId: null, parentVersionLabel: null };
}

// The arrays a file carries, as repository.importAll takes them.
const arraysOf = (file) => ({
  recipes: file.recipes,
  versions: file.versions,
  batches: file.batches,
  library: file.library,
  machines: file.machines,
  styles: file.styles,
  scales: file.scales,
  problems: file.problems,
});

describe('the import validator requires a canonical Sheet code (CODE-01, D-04a)', () => {
  it('stands on a colliding pair of ids', () => {
    expect(COLLIDING_ID_A).not.toBe(COLLIDING_ID_B);
    expect(codeFromVersionId(COLLIDING_ID_A)).toBe(codeFromVersionId(COLLIDING_ID_B));
  });

  it.each([
    ['no sheetCode', undefined],
    ['an empty one', ''],
    ['one that is too short', 'ABCD'],
    ['a lower-case one', 'abcd-efgh'],
    ['one without the hyphen', 'ABCDEFGH'],
    ['one that is not a string', 12345678],
  ])('a version with %s is refused at its path', (_label, sheetCode) => {
    const version = versionOf('typed-v1');
    if (sheetCode === undefined) delete version.sheetCode;
    else version.sheetCode = sheetCode;

    const result = validateStoreFile(storeFileOf({ versions: [version] }));

    expect(result.ok).toBe(false);
    expect(result.errors.some((error) => error.startsWith('$.versions[0].sheetCode'))).toBe(true);
  });

  it('a canonical code is accepted and kept as written', () => {
    expect(validateStoreFile(storeFileOf({ versions: [versionOf('typed-v1')] }))).toEqual({ ok: true, errors: [] });
  });
});

describe('importStore refuses a clash or a change before the write, and changes no store', () => {
  it('two versions in the file sharing a code are refused, naming both paths', async () => {
    const repository = await seededProfile();
    const before = await repository.exportAll();
    const file = serialised(storeFileOf({ versions: [versionOf(COLLIDING_ID_A), versionOf(COLLIDING_ID_B)] }));

    const result = await importStore(repository, file);

    expect(result.ok).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain('$.versions[0].sheetCode');
    expect(result.errors[0]).toContain('$.versions[1].sheetCode');
    expect(result.errors[0]).toContain(codeFromVersionId(COLLIDING_ID_A));
    expect(await repository.exportAll()).toEqual(before);
  });

  it('a file version whose code a stored version of another id holds is refused', async () => {
    const repository = await seededProfile();
    const before = await repository.exportAll();
    const file = serialised(storeFileOf({ versions: [versionOf('borrower-v1', '64JH-G408')] }));

    const result = await importStore(repository, file);

    expect(result.ok).toBe(false);
    expect(result.errors).toEqual(['$.versions[0].sheetCode: "64JH-G408" is already the Sheet code of version "olive-oil-ice-cream-v1"']);
    expect(await repository.exportAll()).toEqual(before);
  });

  it('a file version replacing a stored version of the same id with a different code is refused as a change', async () => {
    const repository = await seededProfile();
    const before = await repository.exportAll();
    const changed = versionOf('olive-oil-ice-cream-v1', codeFromVersionId('some-other-id'));
    const file = serialised(storeFileOf({ versions: [changed] }));

    const result = await importStore(repository, file);

    expect(result.ok).toBe(false);
    expect(result.errors).toEqual([
      `$.versions[0].sheetCode: "${changed.sheetCode}" would replace the Sheet code "64JH-G408" of the stored version "olive-oil-ice-cream-v1", and a Sheet code never changes`,
    ]);
    expect(await repository.exportAll()).toEqual(before);
  });

  it('a file version replacing a stored version of the same id with the same code imports, and the code is kept as written', async () => {
    const repository = await seededProfile();
    const same = { ...versionOf('olive-oil-ice-cream-v1', '64JH-G408'), versionLabel: 'Corrected label' };

    expect(await importStore(repository, serialised(storeFileOf({ versions: [same] })))).toEqual({ ok: true, errors: [] });

    const stored = await repository.getVersion('olive-oil-ice-cream-v1');
    expect(stored.versionLabel).toBe('Corrected label');
    expect(stored.sheetCode).toBe('64JH-G408');
  });

  it('a new version with its own canonical code imports, and the code is kept as written', async () => {
    const repository = await seededProfile();

    expect(await importStore(repository, serialised(storeFileOf({ versions: [versionOf('typed-v1')] })))).toEqual({ ok: true, errors: [] });

    expect((await repository.getVersion('typed-v1')).sheetCode).toBe(codeFromVersionId('typed-v1'));
  });
});

describe('repository.importAll repeats the check inside its own transaction (D-04a, D-07)', () => {
  it('when another tab stores a clashing version first, a direct importAll rejects with SheetCodeError and every store is unchanged', async () => {
    const repository = await seededProfile();
    const otherTab = createRepository();
    const file = serialised(storeFileOf({ versions: [versionOf(COLLIDING_ID_A)] }));
    await otherTab.createVersion(versionOf(COLLIDING_ID_B));
    const before = await repository.exportAll();

    const error = await repository.importAll(arraysOf(file)).catch((caught) => caught);

    expect(error).toBeInstanceOf(SheetCodeError);
    expect(error.problems).toEqual([
      { kind: 'clash', code: codeFromVersionId(COLLIDING_ID_A), versionId: COLLIDING_ID_A, otherVersionId: COLLIDING_ID_B },
    ]);
    expect(await repository.exportAll()).toEqual(before);
  });

  it('through importStore, a version another tab writes between the pre-check and the write gives the clash message, not the storage error, and leaves what the other tab wrote', async () => {
    const repository = await seededProfile();
    const otherTab = createRepository();
    const file = serialised(storeFileOf({ versions: [versionOf(COLLIDING_ID_A)] }));
    let afterCompetingWrite;
    // The real repository, its importAll first waiting for the other tab's write:
    // the pre-check has read the versions by the time it runs.
    const racing = {
      ...repository,
      async importAll(arrays) {
        await otherTab.createVersion(versionOf(COLLIDING_ID_B));
        afterCompetingWrite = await repository.exportAll();
        return repository.importAll(arrays);
      },
    };

    const result = await importStore(racing, file);

    expect(result.ok).toBe(false);
    expect(result.errors).not.toContain(IMPORT_STORAGE_ERROR);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain('$.versions[0].sheetCode');
    expect(result.errors[0]).toContain(COLLIDING_ID_B);
    expect(afterCompetingWrite.versions.map((version) => version.id)).toContain(COLLIDING_ID_B);
    expect(await repository.exportAll()).toEqual(afterCompetingWrite);
    expect(await repository.getVersion(COLLIDING_ID_A)).toBeUndefined();
  });
});
