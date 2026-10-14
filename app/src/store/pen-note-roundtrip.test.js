// Pins Mark's List bug bug-pen-note-delete-then-edit-provenance across a real
// IndexedDB round trip: a kept draft with a removed note, and a version saved
// after a removal and an edit, are written and read back through the
// repository seam over fake-indexeddb. fake-indexeddb/auto installs indexedDB
// and every IDB constructor on the global before repository.js loads (its
// module-level singleton opens the store on import), so it must be the first
// import. A second createRepository() stands for a reopened tab.
import 'fake-indexeddb/auto';
import { IDBFactory } from 'fake-indexeddb';
import { describe, it, beforeEach, expect } from 'vitest';
import { createRepository } from './repository.js';
import { oliveOilVersion } from '../data/olive-oil.js';
import { penDraftFromVersion, removePenNote, setPenNoteText, penFieldsFromDraft } from '../domain/penDraft.js';
import { buildDraftRecord, draftMatchesVersion } from '../domain/draft.js';
import { createChildVersion } from '../domain/lineage.js';

beforeEach(() => {
  // A fresh database per test — the repository opens its connection when
  // createRepository() runs, after this reset.
  globalThis.indexedDB = new IDBFactory();
});

const NOW = '2026-10-14T12:00:00.000Z';

function markedVersion() {
  const version = structuredClone(oliveOilVersion);
  version.authored.beforeYouStart[0].inheritedFrom = 'v-a';
  version.authored.beforeYouStart[1].inheritedFrom = 'v-b';
  return version;
}

function planRecord(version, payload) {
  return buildDraftRecord({ versionId: version.id, kind: 'plan', payload, now: NOW });
}

describe('a pen note removed and edited, through the repository seam', () => {
  it('a kept draft with a removed note comes back from the store and its survivor still compares with its own original', async () => {
    const version = markedVersion();
    const textB = version.authored.beforeYouStart[1].text;
    const payload = removePenNote(penDraftFromVersion(version), 'beforeYouStart', 0);
    const record = planRecord(version, payload);

    await createRepository().saveDraft(record);
    const read = await createRepository().getDraft(version.id);

    expect(read).toEqual(record);
    expect(draftMatchesVersion(read, version, [])).toBe(true);
    const edited = setPenNoteText(read.payload, version, 'beforeYouStart', 0, 'Something else');
    const typedBack = setPenNoteText(edited, version, 'beforeYouStart', 0, textB);
    expect(typedBack.authored.beforeYouStart[0]).toEqual({ text: textB, inheritedFrom: 'v-b' });
  });

  it('a version saved after a removal and an edit reads back with notes of text and inheritedFrom only', async () => {
    const version = markedVersion();
    const textB = version.authored.beforeYouStart[1].text;
    let draft = removePenNote(penDraftFromVersion(version), 'beforeYouStart', 0);
    draft = setPenNoteText(draft, version, 'beforeYouStart', 0, 'Something else');
    draft = setPenNoteText(draft, version, 'beforeYouStart', 0, textB);
    const child = createChildVersion(version, penFieldsFromDraft(draft, version), {
      id: 'olive-oil-ice-cream-v1-e8a-child',
      now: NOW,
    });

    await createRepository().saveVersion(child);
    const read = await createRepository().getVersion(child.id);

    expect(read.authored).toEqual({ beforeYouStart: [{ text: textB, inheritedFrom: 'v-b' }] });
    expect(Object.keys(read.authored.beforeYouStart[0]).sort()).toEqual(['inheritedFrom', 'text']);
    expect(Object.prototype.hasOwnProperty.call(read, 'noteOrigins')).toBe(false);
  });

  it('a kept draft with no removal is stored with the same eight payload keys as before', async () => {
    const version = markedVersion();
    const payload = setPenNoteText(penDraftFromVersion(version), version, 'beforeYouStart', 0, 'Something else');
    const record = planRecord(version, payload);

    await createRepository().saveDraft(record);
    const read = await createRepository().getDraft(version.id);

    expect(Object.keys(read.payload).sort()).toEqual([
      'authored',
      'citedBatchId',
      'method',
      'reason',
      'rows',
      'sheetDescription',
      'sheetTitle',
      'versionLabel',
    ]);
  });
});
