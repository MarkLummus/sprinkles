// Pins Mark's List bug bug-pen-saves-step-backup-refuses across a real
// IndexedDB round trip: a version saved through the pen (Save as new version
// and Save over this version) is exported, checked by validateStoreFile and
// imported into a fresh store. The pen must never store a step that check
// refuses. fake-indexeddb/auto installs indexedDB and every IDB constructor on
// the global before repository.js loads (its module-level singleton opens the
// store on import), so it must be the first import.
import 'fake-indexeddb/auto';
import { IDBFactory } from 'fake-indexeddb';
import { describe, it, beforeEach, expect } from 'vitest';
import { createRepository } from './repository.js';
import { seedIfEmpty } from './seed.js';
import { exportStore, validateStoreFile, importStore } from './transfer.js';
import { oliveOilVersion } from '../data/olive-oil.js';
import { createChildVersion, saveOverVersion, versionsForRecipe } from '../domain/lineage.js';
import {
  penDraftFromVersion,
  penFieldsFromDraft,
  penSaveBlock,
  setPenField,
  setPenStepTarget,
} from '../domain/penDraft.js';

beforeEach(() => {
  // A fresh database per test — the repository opens its connection when
  // createRepository() runs, after this reset.
  globalThis.indexedDB = new IDBFactory();
});

const NOW = '2026-11-23T12:00:00.000Z';
const CLEAN_CHILD_ID = 'olive-oil-ice-cream-v1-bdk-clean';
const SAVED_ID = 'olive-oil-ice-cream-v1-bdk-saved';

// The pen's own save path, in the order usePenDraft.checkSave and
// useVersionPen use it: the draft is seeded from the opened version, the
// Version name is typed, the edit is made, the gate must pass, then the
// fields go through penFieldsFromDraft into the constructor and the store.
async function savedThroughPen(repository, opened, kind, edit) {
  let draft = penDraftFromVersion(opened);
  draft = setPenField(draft, 'versionLabel', kind === 'over' ? opened.versionLabel : 'Round trip');
  draft = edit(draft);
  const versions = versionsForRecipe(await repository.listVersions(), opened.recipeId).filter(
    (v) => kind !== 'over' || v.id !== opened.id,
  );
  expect(penSaveBlock(draft, opened, versions)).toBeNull();
  const fields = penFieldsFromDraft(draft, opened);
  if (kind === 'over') {
    await repository.saveVersion(saveOverVersion(opened, fields, { now: NOW }), { expected: opened });
    return opened.id;
  }
  await repository.createVersion(createChildVersion(opened, fields, { id: SAVED_ID, now: NOW }));
  return SAVED_ID;
}

// Export, JSON, check, import into a fresh store: the backup round trip.
async function roundTrip(repository) {
  const exported = JSON.parse(JSON.stringify(await exportStore(repository)));
  expect(validateStoreFile(exported)).toEqual({ ok: true, errors: [] });
  globalThis.indexedDB = new IDBFactory();
  const second = createRepository();
  expect(await importStore(second, exported)).toEqual({ ok: true, errors: [] });
  return second;
}

// The version the pen opens on for each save: the stored Olive Oil v1 for a new
// version, a stored clean child of it for save over.
async function setUp(kind) {
  const repository = createRepository();
  await seedIfEmpty(repository);
  const v1 = await repository.getVersion(oliveOilVersion.id);
  if (kind === 'new') return { repository, opened: v1 };
  const field = penFieldsFromDraft(setPenField(penDraftFromVersion(v1), 'versionLabel', 'Clean child'), v1);
  await repository.createVersion(createChildVersion(v1, field, { id: CLEAN_CHILD_ID, now: NOW }));
  return { repository, opened: await repository.getVersion(CLEAN_CHILD_ID) };
}

const SAVES = [['new'], ['over']];

function blankTarget0(draft) {
  return setPenStepTarget(setPenStepTarget(draft, 1, 0, 'label', ''), 1, 0, 'value', '');
}

describe('a live step with a target of both sides blank, saved through the pen', () => {
  it.each(SAVES)('exports, passes the store file check and imports (%s)', async (kind) => {
    const { repository, opened } = await setUp(kind);
    const id = await savedThroughPen(repository, opened, kind, blankTarget0);

    const second = await roundTrip(repository);
    const imported = await second.getVersion(id);
    expect(imported.method.find((step) => step.n === 1).targets).toEqual([]);
  });
});
