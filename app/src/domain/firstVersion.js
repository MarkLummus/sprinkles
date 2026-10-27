// Pure. No framework, no DOM, no store import. Who may edit a first version, and
// the record comparison and error the store's guarded writes share (Phase 11
// STRUCT-04, D-03, D-06). The version page, the edit route and the store's own
// transaction all call firstVersionRefusal, so the three never disagree on who
// may edit (RESEARCH G-8).

import { activeRows } from './rows.js';
import { draftMatchesEdit } from './draft.js';

/**
 * firstVersionRefusal({ version, versions, batches }) -> null when the stored
 * `version` may still be edited as a first version, else the first reason it
 * may not, checked in this order:
 *   'gone'          there is no such version
 *   'not-first'     it has a parent
 *   'has-batch'     a batch is stored for it (the edit window closes at the
 *                   first batch)
 *   'has-child'     some version names it as its parent
 *   'unlinked-row'  an ACTIVE row has no library link, so it cannot become a
 *                   create-shaped draft (RESEARCH G-8); a row the pen struck is
 *                   not read, activeRows having dropped it
 * `versions` is every stored version and `batches` any versions' batches: the
 * batch check filters by the version's id.
 */
export function firstVersionRefusal({ version, versions, batches }) {
  if (!version) return 'gone';
  if (version.parentVersionId !== null && version.parentVersionId !== undefined) return 'not-first';
  if (batches.some((batch) => batch.versionId === version.id)) return 'has-batch';
  if (versions.some((other) => other.parentVersionId === version.id)) return 'has-child';
  if (activeRows(version).some((row) => row.libraryId === null || row.libraryId === undefined)) return 'unlinked-row';
  return null;
}

/** isEditableFirstVersion(args) -> true when firstVersionRefusal(args) is null. */
export function isEditableFirstVersion(args) {
  return firstVersionRefusal(args) === null;
}

/**
 * editStateFor({ version, versions, batches, drafts }) -> 'editing' | 'editable'
 * | null, for the version page and the Notebook. Of the records in `drafts`
 * under the version's id:
 *   one that fits draftMatchesEdit -> 'editing', whatever firstVersionRefusal
 *       says: while an edit is kept the page reads Resume editing and offers no
 *       pen (D-04), and a stale edit stays reachable until Cancel (D-06)
 *   any other record -> null: a pen's draft is kept, so Edit is not offered
 *       (RESEARCH G-1c, D-23)
 *   none -> 'editable' when the version is eligible, else null
 */
export function editStateFor({ version, versions, batches, drafts }) {
  if (!version) return null;
  const kept = drafts.filter((record) => record.versionId === version.id);
  if (kept.some(draftMatchesEdit)) return 'editing';
  if (kept.length > 0) return null;
  return firstVersionRefusal({ version, versions, batches }) === null ? 'editable' : null;
}

// A value as a string that is the same for two values equal by every leaf,
// whatever the order their keys were written in. Arrays keep their order (a
// reordering is a change), a leaf carries its type (the string '5' is not the
// number 5), and a key holding undefined is not an absent key.
function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value !== null && typeof value === 'object') {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`)
      .join(',')}}`;
  }
  if (typeof value === 'string') return JSON.stringify(value);
  return `${typeof value}:${String(value)}`;
}

/**
 * sameRecord(a, b) -> true when two records are equal by every leaf, whatever
 * their key order; false when one leaf differs. The store's guards use it to
 * tell that a record is still the one a writer read (D-06).
 */
export function sameRecord(a, b) {
  return canonical(a) === canonical(b);
}

/**
 * VersionChangedError -> what the store throws when a version is no longer what
 * the writer read: `reason` is 'gone' (no version under the id), 'has-batch' (a
 * batch is stored for it) or 'changed' (the stored version is not the record
 * the writer read). Nothing is written. It lives in this pure module, beside
 * sameRecord, and not in the repository module, because the page tests mock
 * the repository module whole and the pen's instanceof test must still
 * resolve.
 */
export class VersionChangedError extends Error {
  constructor(versionId, reason) {
    super(`Version ${versionId} is no longer what the writer read (${reason}), so it was not stored.`);
    this.name = 'VersionChangedError';
    this.versionId = versionId;
    this.reason = reason;
  }
}
