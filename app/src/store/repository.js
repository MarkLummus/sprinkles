import { openStore } from './db.js';
import { normaliseCode, sheetCodeProblems, SheetCodeError } from '../domain/sheetCode.js';
import { firstVersionRefusal, sameRecord, VersionChangedError } from '../domain/firstVersion.js';
import { draftFamily } from '../domain/draft.js';
import { catalogConflicts, mergeById, CatalogConflictError } from './seedTables.js';

// The one write both createVersion and saveVersion make: the read of every stored
// version, the pure check and the put share one readwrite transaction. A problem
// throws a SheetCodeError and aborts it by hand, as importAll does, so nothing is
// written.
//
// With `expected` (the record the writer read) the same transaction also spans the
// batches store, and the checks run before the Sheet code rule: no stored version
// under the id is a VersionChangedError 'gone', a batch stored for it is
// 'has-batch', and a stored version that is not sameRecord-equal to expected is
// 'changed'. Each goes down the same catch, so nothing is written and no
// AbortError goes unhandled. Without expected the transaction is exactly the one
// createVersion has always made.
async function putVersionChecked(db, version, expected = null) {
  const tx = expected === null ? db.transaction('versions', 'readwrite') : db.transaction(['versions', 'batches'], 'readwrite');
  const done = tx.done;
  const queued = [];
  try {
    const stored = await tx.objectStore('versions').getAll();
    if (expected !== null) {
      const batches = await tx.objectStore('batches').index('by-version').getAll(version.id);
      const current = stored.find((existing) => existing.id === version.id);
      if (!current) throw new VersionChangedError(version.id, 'gone');
      if (batches.length > 0) throw new VersionChangedError(version.id, 'has-batch');
      if (!sameRecord(current, expected)) throw new VersionChangedError(version.id, 'changed');
    }
    const problems = sheetCodeProblems(stored, [version]);
    if (problems.length > 0) throw new SheetCodeError(problems);
    queued.push(tx.objectStore('versions').put(version));
    await Promise.all([...queued, done]);
  } catch (error) {
    try {
      tx.abort();
    } catch {
      // The transaction already finished or aborted itself.
    }
    for (const request of [...queued, done]) request.catch(() => {});
    throw error;
  }
}

// The family a stored or incoming draft belongs to, or null for a record whose
// kind is not a draft kind (draftFamily throws for those).
function familyOrNull(kind) {
  try {
    return draftFamily(kind);
  } catch {
    return null;
  }
}

// The five tables the app seeds when they are empty (D-17, LIB-09).
const SEED_TABLE_NAMES = ['library', 'machines', 'styles', 'scales', 'problems'];

// The eight stores a store file carries and an import writes (LIB-09, decision
// 20). The drafts store is not among them: drafts stay on the device.
const FILE_STORES = ['recipes', 'versions', 'batches', 'library', 'machines', 'styles', 'scales', 'problems'];

// The repository seam D-06 and D-16 depend on — the only path to the store:
// versions, batches, recipes, the ingredient library, the four seed tables
// (machines, styles, scales, problems), and the drafts of unsaved pens.
// No component, no domain module, and no seed check may reach past it.
export function createRepository() {
  // Boot waits on the open, and an older tab can hold the open up (WR-08):
  // the flag and the single listener slot let main.jsx say so, whichever of
  // the event and the registration comes first.
  let blocked = false;
  let blockedListener = null;
  const dbPromise = openStore({
    onBlocked() {
      blocked = true;
      if (blockedListener) blockedListener();
    },
  });

  async function seedTable(storeName, records) {
    if (!SEED_TABLE_NAMES.includes(storeName)) {
      throw new TypeError(`${storeName} is not a seed table`);
    }
    const db = await dbPromise;
    const tx = db.transaction(storeName, 'readwrite');
    const done = tx.done;
    const queued = [];
    try {
      if ((await tx.store.count()) > 0) {
        await done;
        return false;
      }
      for (const record of records) queued.push(tx.store.put(record));
      await Promise.all([...queued, done]);
      return true;
    } catch (error) {
      try {
        tx.abort();
      } catch {
        // The transaction already finished or aborted itself.
      }
      for (const request of [...queued, done]) request.catch(() => {});
      throw error;
    }
  }

  return {
    onBlocked(listener) {
      blockedListener = listener;
      if (blocked) listener();
    },
    async listVersions() {
      const db = await dbPromise;
      return db.getAll('versions');
    },
    async getVersion(id) {
      const db = await dbPromise;
      return db.get('versions', id);
    },
    // A save over a version, like a new one below, reads every stored version,
    // runs the pure check and puts in ONE readwrite transaction (CODE-01,
    // D-04b): a stored version's code is written once, so a save carrying a
    // different code for the same id is refused, and a version's own code is
    // never a clash with itself.
    //
    // With `{ expected }`, the record the writer read, the same transaction
    // also checks that the version is still that record and has no batch, and
    // throws a VersionChangedError ('gone', 'has-batch' or 'changed') writing
    // nothing: another tab's edit route or record pen can save between the
    // pen's read and its Save over, and no live cross-tab refresh is built, so
    // the transaction is the guard (T-11-63). It throws where
    // saveFirstVersionOver resolves its refusals on purpose: saveVersion
    // already throws a SheetCodeError for a refused code, and every caller and
    // page-test stub reads its resolve as saved, so a resolved refusal would
    // read as a successful save in each of them. Called without `expected`
    // (the store's tests and fixtures) it writes as it always did.
    async saveVersion(version, { expected } = {}) {
      return putVersionChecked(await dbPromise, version, expected ?? null);
    },
    // A new version is stored the same way. IndexedDB serialises the
    // transaction against any other versions transaction, so two tabs creating
    // at once cannot both store a code the other holds (CODE-01, D-04, D-04a).
    // A clash is refused with a SheetCodeError and nothing is written: the code
    // is never re-drawn. A version without a canonical code is a caller bug,
    // refused before the transaction opens.
    async createVersion(version) {
      if (typeof version?.sheetCode !== 'string' || version.sheetCode !== normaliseCode(version.sheetCode)) {
        throw new TypeError(`version ${version?.id} needs a sheetCode in the form XXXX-XXXX`);
      }
      return putVersionChecked(await dbPromise, version);
    },
    // A creation's Save (MAKE-10): the recipe, its root version and the removal
    // of the version's create draft are ONE readwrite transaction over recipes,
    // versions and drafts, so a failed save leaves neither a recipe without its
    // version nor a version without its recipe, and the maker's draft is still
    // there to try again. A version id that is already stored is a caller bug
    // (a root is only ever created, never written over here), thrown as a
    // TypeError; a Sheet code that clashes with a stored one throws a
    // SheetCodeError, as createVersion does. A put the store cannot clone throws
    // before it queues and leaves the transaction open, so the catch aborts it
    // by hand, as importAll does, or the puts already queued would commit.
    async createRecipeWithVersion({ recipe, version }) {
      const db = await dbPromise;
      const tx = db.transaction(['recipes', 'versions', 'drafts'], 'readwrite');
      const done = tx.done;
      const queued = [];
      try {
        const storedVersions = await tx.objectStore('versions').getAll();
        if (storedVersions.some((stored) => stored.id === version.id)) {
          throw new TypeError(`version ${version.id} already exists`);
        }
        const problems = sheetCodeProblems(storedVersions, [version]);
        if (problems.length > 0) throw new SheetCodeError(problems);
        queued.push(tx.objectStore('recipes').put(recipe));
        queued.push(tx.objectStore('versions').put(version));
        queued.push(tx.objectStore('drafts').delete(version.id));
        await Promise.all([...queued, done]);
      } catch (error) {
        try {
          tx.abort();
        } catch {
          // The transaction already finished or aborted itself.
        }
        for (const request of [...queued, done]) request.catch(() => {});
        throw error;
      }
    },
    // Save over a first version (STRUCT-04, D-03, D-06): the recipe, the version
    // and the removal of the kept edit draft are ONE readwrite transaction, and
    // the checks run inside it, over what it reads, because another tab can
    // record a batch, save a child, open a pen or save over the version between
    // the edit route's read and this write. `expected` is { version, recipe }
    // as the edit route read them when it opened; without it the call is a
    // caller bug (TypeError). A business refusal is RESOLVED, never thrown, as
    // { saved: false, reason }: 'gone', 'not-first', 'has-batch', 'has-child',
    // 'unlinked-row' (firstVersionRefusal), then 'draft-held' (a draft of
    // another kind holds the version's key: restructuring the version beneath a
    // pen's draft would make its next restore delete it), then 'changed' (the
    // stored version or recipe is no longer expected). A refusal writes nothing
    // and leaves every draft where it is. Nothing has been queued when a
    // refusal aborts the transaction, and an aborted transaction rejects its
    // done promise, so done is quieted first. Save-over keeps identity: a
    // different Sheet code or createdAt is a caller bug (TypeError), and the
    // Sheet code rule is run over the stored versions as every write does.
    async saveFirstVersionOver({ recipe, version, expected }) {
      if (!expected?.version || !expected?.recipe) {
        throw new TypeError('saveFirstVersionOver needs the records the edit read, as expected');
      }
      const db = await dbPromise;
      const tx = db.transaction(['recipes', 'versions', 'batches', 'drafts'], 'readwrite');
      const done = tx.done;
      const queued = [];
      try {
        const storedVersions = await tx.objectStore('versions').getAll();
        const batches = await tx.objectStore('batches').index('by-version').getAll(version.id);
        const storedRecipe = await tx.objectStore('recipes').get(recipe.id);
        const draft = await tx.objectStore('drafts').get(version.id);
        const stored = storedVersions.find((existing) => existing.id === version.id);
        let reason = firstVersionRefusal({ version: stored, versions: storedVersions, batches });
        if (reason === null && draft && draft.kind !== 'edit') reason = 'draft-held';
        if (reason === null && (!sameRecord(stored, expected.version) || !sameRecord(storedRecipe, expected.recipe))) {
          reason = 'changed';
        }
        if (reason !== null) {
          done.catch(() => {});
          tx.abort();
          return { saved: false, reason };
        }
        if (stored.sheetCode !== version.sheetCode || stored.createdAt !== version.createdAt) {
          throw new TypeError(`version ${version.id} keeps its Sheet code and its date when it is saved over`);
        }
        const problems = sheetCodeProblems(storedVersions, [version]);
        if (problems.length > 0) throw new SheetCodeError(problems);
        queued.push(tx.objectStore('recipes').put(recipe));
        queued.push(tx.objectStore('versions').put(version));
        if (draft && draft.kind === 'edit') queued.push(tx.objectStore('drafts').delete(version.id));
        await Promise.all([...queued, done]);
        return { saved: true };
      } catch (error) {
        try {
          tx.abort();
        } catch {
          // The transaction already finished or aborted itself.
        }
        for (const request of [...queued, done]) request.catch(() => {});
        throw error;
      }
    },
    async getAll() {
      const db = await dbPromise;
      return db.getAll('versions');
    },
    async putAll(versions) {
      const db = await dbPromise;
      const tx = db.transaction('versions', 'readwrite');
      await Promise.all(versions.map((version) => tx.store.put(version)));
      return tx.done;
    },
    async listBatchesForVersion(versionId) {
      const db = await dbPromise;
      return db.getAllFromIndex('batches', 'by-version', versionId);
    },
    async getBatch(id) {
      const db = await dbPromise;
      return db.get('batches', id);
    },
    async saveBatch(batch) {
      const db = await dbPromise;
      return db.put('batches', batch);
    },
    async getAllBatches() {
      const db = await dbPromise;
      return db.getAll('batches');
    },
    async putAllBatches(batches) {
      const db = await dbPromise;
      const tx = db.transaction('batches', 'readwrite');
      await Promise.all(batches.map((batch) => tx.store.put(batch)));
      return tx.done;
    },
    async listRecipes() {
      const db = await dbPromise;
      return db.getAll('recipes');
    },
    async getRecipe(id) {
      const db = await dbPromise;
      return db.get('recipes', id);
    },
    async saveRecipe(recipe) {
      const db = await dbPromise;
      return db.put('recipes', recipe);
    },
    async putAllRecipes(recipes) {
      const db = await dbPromise;
      const tx = db.transaction('recipes', 'readwrite');
      await Promise.all(recipes.map((recipe) => tx.store.put(recipe)));
      return tx.done;
    },
    // A library record is `{ id, entry }`, `id` being the data/library.js key
    // and `entry` that entry unchanged (Phase 6 D-02). getLibraryEntry returns
    // the stored record, not the bare entry, as getRecipe returns the stored
    // recipe. putAllLibrary aborts by hand for the reason importAll gives: a
    // put the store cannot clone throws before it queues and leaves the
    // transaction open, so without the abort the puts already queued would
    // commit. It serves the tests that change an entry (this file's upsert
    // test, Plan 02's LIB-02 proof and its held-seed test); the seed gets its
    // own one-transaction method in Plan 02 (06-CONTEXT.md D-04 as amended),
    // and import writes through importAll (no other write method).
    async listLibrary() {
      const db = await dbPromise;
      return db.getAll('library');
    },
    async getLibraryEntry(id) {
      const db = await dbPromise;
      return db.get('library', id);
    },
    async putAllLibrary(records) {
      const db = await dbPromise;
      const tx = db.transaction('library', 'readwrite');
      const done = tx.done;
      const queued = [];
      try {
        for (const record of records) queued.push(tx.store.put(record));
        await Promise.all([...queued, done]);
      } catch (error) {
        try {
          tx.abort();
        } catch {
          // The transaction already finished or aborted itself.
        }
        for (const request of [...queued, done]) request.catch(() => {});
        throw error;
      }
    },
    // The seed's emptiness check and its write are one readwrite transaction,
    // so a second tab booting at the same moment cannot find an empty library
    // and then write the seed over records another tab seeded and an import
    // changed (06-CONTEXT.md D-04, amended after the Codex review of the
    // Phase 6 plans). It resolves true when it wrote and false when the
    // library already held a record. A put the store cannot clone aborts the
    // transaction, as in importAll, so a failed seed leaves the library empty
    // and the next boot seeds it again.
    async seedLibraryIfEmpty(records) {
      return seedTable('library', records);
    },
    // The same one-transaction seed for each of the five tables the app
    // seeds: the library and the four seed tables (LIB-09, D-17). Any other
    // store name is a caller bug, refused before a transaction opens. Two tabs
    // booting at once seed a table once, because the count and the puts are
    // one transaction; a failed seed leaves the table empty for the next boot.
    async seedTableIfEmpty(storeName, records) {
      return seedTable(storeName, records);
    },
    async listMachines() {
      const db = await dbPromise;
      return db.getAll('machines');
    },
    async listStyles() {
      const db = await dbPromise;
      return db.getAll('styles');
    },
    async listScales() {
      const db = await dbPromise;
      return db.getAll('scales');
    },
    async listProblems() {
      const db = await dbPromise;
      return db.getAll('problems');
    },
    // An import is one readwrite transaction over the eight stores it
    // writes: a failed put aborts it, so a storage failure part-way leaves
    // every store exactly as it was. A put replaces the row of the same id and
    // leaves the others, and nothing is ever deleted (D-14). A put the store
    // cannot clone throws before it queues and leaves the transaction open, so
    // the catch aborts it by hand or the puts already queued would commit.
    async importAll({ recipes, versions, batches, library, machines, styles, scales, problems }) {
      const db = await dbPromise;
      const tx = db.transaction(FILE_STORES, 'readwrite');
      const done = tx.done;
      // Every queued put is kept so a failure can quiet the ones the abort
      // rejects behind it.
      const queued = [];
      try {
        // The two checks importStore ran before the transaction, repeated over
        // what this transaction reads, because two imports, or an import and
        // another tab's createVersion, can each pass them: the Sheet code rule
        // over the stored and incoming versions (CODE-01, D-04a), and
        // catalogConflicts over the scales, problems and versions the store
        // would hold after the import (a file row replaces the stored row of its
        // id; stored rows it lacks stay). Either aborts before any put.
        const [storedVersions, storedScales, storedProblems] = await Promise.all([
          tx.objectStore('versions').getAll(),
          tx.objectStore('scales').getAll(),
          tx.objectStore('problems').getAll(),
        ]);
        const codeProblems = sheetCodeProblems(storedVersions, versions);
        if (codeProblems.length > 0) throw new SheetCodeError(codeProblems);
        const conflicts = catalogConflicts({
          scales: mergeById(storedScales, scales),
          problems: mergeById(storedProblems, problems),
          versions: mergeById(storedVersions, versions),
        });
        if (conflicts.length > 0) throw new CatalogConflictError(conflicts);
        const incoming = { recipes, versions, batches, library, machines, styles, scales, problems };
        for (const name of FILE_STORES) {
          for (const row of incoming[name]) queued.push(tx.objectStore(name).put(row));
        }
        await Promise.all([...queued, done]);
      } catch (error) {
        try {
          tx.abort();
        } catch {
          // The transaction already finished or aborted itself.
        }
        for (const request of [...queued, done]) request.catch(() => {});
        throw error;
      }
    },
    // D-07a: an export reads the eight stores it carries in one readonly
    // transaction, so a second tab writing mid-export cannot give a backup
    // built from two moments. The drafts store is not read: drafts stay on
    // the device.
    async exportAll() {
      const db = await dbPromise;
      const tx = db.transaction(FILE_STORES, 'readonly');
      const done = tx.done;
      // Every queued read is kept so a failure can quiet the ones the abort
      // rejects behind it.
      const queued = [];
      try {
        for (const name of FILE_STORES) queued.push(tx.objectStore(name).getAll());
        const rows = await Promise.all(queued);
        await done;
        return Object.fromEntries(FILE_STORES.map((name, index) => [name, rows[index]]));
      } catch (error) {
        try {
          tx.abort();
        } catch {
          // The transaction already finished or aborted itself.
        }
        for (const request of [...queued, done]) request.catch(() => {});
        throw error;
      }
    },
    // D-16: a draft is one unsaved pen, keyed by its version id.
    async getDraft(versionId) {
      const db = await dbPromise;
      return db.get('drafts', versionId);
    },
    // A version's one draft key is shared by the pens (plan, record, amend) and
    // the edit, and UI exclusivity is not storage exclusivity: a second tab's
    // pen writes and discards the same key. So the store guards ownership
    // (T-11-46, D-06). saveDraft reads the stored record and the put in ONE
    // readwrite transaction: when the key holds a record of another family
    // (draftFamily) it writes nothing and resolves false, else it writes and
    // resolves true. A stored record whose kind is not a draft kind belongs to
    // no family and is written over, as it always was.
    async saveDraft(record) {
      const db = await dbPromise;
      const tx = db.transaction('drafts', 'readwrite');
      const done = tx.done;
      const queued = [];
      try {
        const stored = await tx.store.get(record.versionId);
        const storedFamily = stored ? familyOrNull(stored.kind) : null;
        if (storedFamily !== null && storedFamily !== familyOrNull(record.kind)) {
          done.catch(() => {});
          tx.abort();
          return false;
        }
        queued.push(tx.store.put(record));
        await Promise.all([...queued, done]);
        return true;
      } catch (error) {
        try {
          tx.abort();
        } catch {
          // The transaction already finished or aborted itself.
        }
        for (const request of [...queued, done]) request.catch(() => {});
        throw error;
      }
    },
    // deleteDraft(versionId, kind): with a kind it deletes only when the stored
    // record's family is that kind's family, and resolves whether it deleted: a
    // pen's discard after a batch save in another tab cannot delete a kept edit
    // draft, and an edit's Cancel cannot delete a pen's (T-11-46). With no kind
    // it deletes whatever is stored, as it always did, for a caller that names
    // none.
    async deleteDraft(versionId, kind = null) {
      const db = await dbPromise;
      if (kind === null) {
        await db.delete('drafts', versionId);
        return true;
      }
      const wanted = draftFamily(kind);
      const tx = db.transaction('drafts', 'readwrite');
      const done = tx.done;
      const queued = [];
      try {
        const stored = await tx.store.get(versionId);
        if (!stored || familyOrNull(stored.kind) !== wanted) {
          done.catch(() => {});
          tx.abort();
          return false;
        }
        queued.push(tx.store.delete(versionId));
        await Promise.all([...queued, done]);
        return true;
      } catch (error) {
        try {
          tx.abort();
        } catch {
          // The transaction already finished or aborted itself.
        }
        for (const request of [...queued, done]) request.catch(() => {});
        throw error;
      }
    },
    async listDrafts() {
      const db = await dbPromise;
      return db.getAll('drafts');
    },
  };
}

// One instance for the whole app (main.jsx seeds it, the routed components
// read through it) — created once, at module load.
export const repository = createRepository();
