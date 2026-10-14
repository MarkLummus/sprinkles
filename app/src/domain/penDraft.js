// Pure. No framework, no DOM, no store import.
// The version pen's draft, read and changed by pure functions, which
// RecipePage drives through usePenDraft (Phase 5, D-01).
import { isLineRemoved } from './rows.js';
import { blockedSaveMessage, blockedSaveRowId, blockedSaveLineIndex, parseGramsDraft } from './lineage.js';

// A draft row, found by its row id (D-03; closes T-03.6-02). Row ids come
// from stored versions, and an imported file can carry any string, so the
// lookup answers only for an own key of penDraft.rows: an id such as
// '__proto__', 'constructor' or 'toString' is never resolved against
// Object.prototype. Callers add no guard for undefined: penDraft.rows is
// built by Object.fromEntries over the same version.rows every caller
// iterates, and a restored draft must pass draftMatchesVersion, which
// requires an own key for every version row, so an undefined result is
// unreachable through the app.
export function penDraftRow(penDraft, rowId) {
  return Object.prototype.hasOwnProperty.call(penDraft.rows, rowId) ? penDraft.rows[rowId] : undefined;
}

// An absent optional field and an empty-string one are the same fact —
// nothing written — normalised on both sides before comparing, exactly as
// diff.js's buildStepDiff does for the same two fields (03-09, T-03-54): a
// first keystroke into an empty purpose/aside, deleted again, must not
// read as ink.
function normalizedText(value) {
  return value ?? '';
}

// A uses list compared as a set — order is not a fact the maker authored
// (route-recipe-version.md § 3). Reused by isDraftDirty for the record
// pen's own defects list (03.3.1-03 Task 3): picking chips in a different
// order than they were unpicked is the same set, not a difference — the
// same discipline this function already applies to a step's uses.
export function usesListsDiffer(a = [], b = []) {
  if (a.length !== b.length) return true;
  const bSet = new Set(b);
  return a.some((rowId) => !bSet.has(rowId));
}

// Targets compared by position, on both label and value — matching
// handleChangePenStepTarget's own matching rule (by index, not by label).
function targetsDiffer(a = [], b = []) {
  if (a.length !== b.length) return true;
  return a.some((target, index) => target.label !== b[index].label || target.value !== b[index].value);
}

// A step is ink the instant any of its seven writers has moved it: the
// four text fields, its removed flag, its uses list, or a target.
function isStepDirty(draftStep, baseStep) {
  return (
    draftStep.leadIn !== baseStep.leadIn ||
    draftStep.instruction !== baseStep.instruction ||
    normalizedText(draftStep.purpose) !== normalizedText(baseStep.purpose) ||
    normalizedText(draftStep.aside) !== normalizedText(baseStep.aside) ||
    (draftStep.removed ?? false) !== (baseStep.removed ?? false) ||
    usesListsDiffer(draftStep.uses, baseStep.uses) ||
    targetsDiffer(draftStep.targets, baseStep.targets)
  );
}

// An authored list is ink when its length differs or any note's text
// differs at the same index — inheritedFrom is not compared: the page
// derives it from the text (handleChangePenNoteText), so text equality
// already decides it.
function isAuthoredListDirty(draftList, baseList) {
  if (draftList.length !== baseList.length) return true;
  return draftList.some((note, index) => note.text !== baseList[index].text);
}

// The pen's own dirty check (route-recipe-version.md § 6, D-24's
// "unsaved ink" principle carried to the plan's pen): every field tested
// against '' / null / the version's own values, never truthiness, so a
// grams field typed back to the version's own value counts as clean again.
// A row's draft entry is { portions: [{ step, grams, removed }] } (D-01,
// D-02; removal rides on the lines alone, sketch 011 decision 51) — dirty
// if any portion's raw string, step or removed flag differs from that
// portion's own value, in order. A stored older whole-row flag reads as
// every line out (isLineRemoved), the same rule the draft is seeded by.
//
// Extended (03-07, T-03-42) to the three fields the pen spends most of its
// time editing — method, the Sheet title/description, authored — which
// this check omitted entirely: a maker who rewrote a step's prose or an
// authored note and then reloaded lost it with no warning of any kind.
export function isPenDraftDirty(mode, penDraft, version) {
  if (mode !== 'developing' || !penDraft || !version) return false;
  if (penDraft.versionLabel !== '') return true;
  if (penDraft.reason !== '') return true;
  if (penDraft.citedBatchId !== null) return true;
  if (penDraft.sheetTitle !== version.sheetTitle) return true;
  if (penDraft.sheetDescription !== version.sheetDescription) return true;
  const rowsDirty = version.rows.some((row) => {
    const draftRow = penDraftRow(penDraft, row.id);
    return row.portions.some((portion, i) => {
      const draftPortion = draftRow.portions[i];
      return (
        draftPortion.grams !== String(portion.grams) ||
        draftPortion.step !== portion.step ||
        Boolean(draftPortion.removed) !== isLineRemoved(row, portion)
      );
    });
  });
  if (rowsDirty) return true;
  const methodDirty = version.method.some((step) => {
    const draftStep = penDraft.method.find((candidate) => candidate.n === step.n);
    return isStepDirty(draftStep, step);
  });
  if (methodDirty) return true;
  if (isAuthoredListDirty(penDraft.authored.beforeYouStart, version.authored.beforeYouStart)) return true;
  return false;
}

// The orphaned-row flag's "remove this row" acts on every line of the
// row (plan 03.6-02 decision 4): if every line is out it puts every line
// back in, otherwise it takes every line out. Pure — returns a new draft
// row and touches nothing but the lines' removed flags.
export function toggleDraftRowLines(draftRow) {
  const everyOut = draftRow.portions.every((portion) => portion.removed === true);
  return {
    ...draftRow,
    portions: draftRow.portions.map((portion) => ({ ...portion, removed: !everyOut })),
  };
}

// "A pen is open" used to live in two unrelated states — `mode`
// ('reading'|'recording'|'developing') and `tastingDraft` (null|object) —
// and every disabled condition in Headnote and BatchMargin hand-rolled its
// own subset of those two. The tasting pen retires with 03.3.1-02 (D-01,
// D-03): the tasting section folds into the one record draft behind a
// `tastingOpen` flag, so the pens this derivation reports are now exactly
// three — `plan`, `record`, `amend` — never a fourth. `reason` is the
// words-form counterpart D-10 requires beside every control that pen
// disables ("never just visually implied"). An if-chain, not a lookup
// table (T-02-32's discipline against a bare bracket read against a key),
// so the three reason strings stay visible at the site that decides them.
export function derivePenState({ mode, amendingBatchId }) {
  if (mode === 'developing') {
    return { openPen: 'plan', reason: 'the plan is being developed' };
  }
  if (mode === 'recording') {
    if (amendingBatchId) {
      return { openPen: 'amend', reason: 'a batch is being amended' };
    }
    return { openPen: 'record', reason: 'a batch is being recorded' };
  }
  return { openPen: null, reason: null };
}

// Cancel on an open step (sketch 011 decisions_recorded 5, decision 1;
// Task 3, T-03.5-19): the version the pen opened on is the draft's own
// parent, so restoring is a structuredClone of that ONE step, replacing
// the draft's own copy of it — every other step and every other penDraft
// key stay exactly as they were. Pure, so its own immutability is
// unit-tested directly.
export function restoreStepFromVersion(penDraft, version, stepN) {
  const parentStep = version.method.find((step) => step.n === stepN);
  return {
    ...penDraft,
    method: penDraft.method.map((step) => (step.n === stepN ? structuredClone(parentStep) : step)),
  };
}

// A version-line or headnote field, written (handleChangePenField's
// updater). `field` is always a literal name passed by the pen's own
// components (VersionRow and Headnote), never a key the maker types; an
// object-literal computed key creates an own property and never reaches the
// __proto__ setter (T-05-04).
export function setPenField(draft, field, value) {
  return { ...draft, [field]: value };
}

// Seeds the draft from the version the pen opened on — a row's own
// portions mapped to { step, grams, removed }, each grams a string
// (Pitfall 5) and each removed read through isLineRemoved so a stored
// older whole-row flag opens as every line out and never resurrects a
// row the maker restored (plan 03.6-02 decision 1); the draft row holds
// no flag of its own. Everything else the maker's own to write, never defaulted from the
// parent (D-10: no default reason, citation, or version line).
export function penDraftFromVersion(version) {
  // Object.fromEntries, not a bracket write against a stored row id: an id
  // such as __proto__ becomes an own key instead of reaching the prototype
  // (T-03-10, T-04-23).
  const rows = Object.fromEntries(
    version.rows.map((row) => [
      row.id,
      {
        portions: row.portions.map((portion) => ({
          step: portion.step,
          grams: String(portion.grams),
          removed: isLineRemoved(row, portion),
        })),
      },
    ]),
  );
  return {
    versionLabel: '',
    reason: '',
    citedBatchId: null,
    sheetTitle: version.sheetTitle,
    sheetDescription: version.sheetDescription,
    rows,
    method: structuredClone(version.method),
    authored: structuredClone(version.authored),
  };
}

// The version's rows with the draft's portions applied. Each portion's grams
// string goes through parseGramsDraft, falling back to that portion's own
// stored amount when the string is blank or does not parse — never 0 or NaN,
// applied per portion. Shared by the draft version (the pen's live figures)
// and the fields a save hands the domain constructors.
function penDraftRows(version, penDraft) {
  return version.rows.map((row) => {
    const draftRow = penDraftRow(penDraft, row.id);
    return {
      ...row,
      portions: row.portions.map((portion, i) => {
        const draftPortion = draftRow.portions[i];
        return {
          step: draftPortion.step,
          grams: parseGramsDraft(draftPortion.grams) ?? portion.grams,
          removed: Boolean(draftPortion.removed),
        };
      }),
      removed: false,
    };
  });
}

// The draft version (route-recipe-version.md § 3, 03-02): built once,
// from the version the pen opened on with the draft's values applied, so
// the pen's own table, the cross-flags (uses.js) and buildDiff all read
// the same object rather than each reassembling it. Unfiltered — a removed
// row or step still appears here, struck, for the pen's own table; readers
// that want the clean figures filter through activeRows/activeSteps first.
export function penDraftVersion(version, penDraft) {
  return {
    ...version,
    rows: penDraftRows(version, penDraft),
    method: penDraft.method,
    sheetTitle: penDraft.sheetTitle,
    sheetDescription: penDraft.sheetDescription,
    authored: penDraft.authored,
  };
}

// The one message that blocks a save, computed by the tested lineage
// functions (D-04) so the same sentence can never drift between the two save
// controls, with the field it names (D-21): the same traversal that named the
// message also names the row it blocked on, so the two can never disagree
// (T-03.1-21). A row id marks and focuses that row's grams field; no row id
// means the block is the version line's own. Null when nothing blocks.
export function penSaveBlock(penDraft, version, scopedVersions) {
  const message = blockedSaveMessage(penDraft, version, scopedVersions);
  if (!message) return null;
  const rowId = blockedSaveRowId(penDraft, version, scopedVersions);
  if (!rowId) return { message, target: { kind: 'versionLine' } };
  return { message, target: { kind: 'row', rowId, index: blockedSaveLineIndex(penDraft, version, scopedVersions) } };
}

// The pen's fields coerced for the domain constructor (createChildVersion,
// saveOverVersion): rows' grams strings are parsed here, at save time, never
// on keystroke (Pitfall 5). A reason of nothing but whitespace is treated as
// blank and stored as null, exactly as an empty reason already was.
export function penFieldsFromDraft(penDraft, version) {
  return {
    versionLabel: penDraft.versionLabel,
    reason: penDraft.reason.trim() === '' ? null : penDraft.reason,
    citedBatchId: penDraft.citedBatchId,
    rows: penDraftRows(version, penDraft),
    method: penDraft.method,
    sheetTitle: penDraft.sheetTitle,
    sheetDescription: penDraft.sheetDescription,
    authored: penDraft.authored,
  };
}

// Writes exactly one portion's raw typed string, leaving every other
// portion and the removed flag untouched — the pen's amounts edit, the
// split does not (CONTEXT.md phase boundary).
export function setPenGrams(draft, rowId, portionIndex, value) {
  const draftRow = penDraftRow(draft, rowId);
  return {
    ...draft,
    rows: {
      ...draft.rows,
      [rowId]: {
        ...draftRow,
        portions: draftRow.portions.map((portion, i) => (i === portionIndex ? { ...portion, grams: value } : portion)),
      },
    },
  };
}

// Serves the orphaned-row flag's "remove this row" control only: it acts
// on every line of the row through toggleDraftRowLines, does not clear
// any grams and does not touch any step (route-recipe-version.md § 3).
// Removal never cascades, so this is always the maker's own tap.
export function togglePenRowLines(draft, rowId) {
  return {
    ...draft,
    rows: { ...draft.rows, [rowId]: toggleDraftRowLines(penDraftRow(draft, rowId)) },
  };
}

// Removing a line sets only that portion's removed flag — every other
// portion and the row-level flag stay as they are, so Step 3's milk is
// Step 3's (sketch 011 decision 51, Mark's answer 1). The same op
// restores; it is always the maker's own tap.
export function togglePenLine(draft, rowId, portionIndex) {
  const draftRow = penDraftRow(draft, rowId);
  return {
    ...draft,
    rows: {
      ...draft.rows,
      [rowId]: {
        ...draftRow,
        portions: draftRow.portions.map((portion, i) => (i === portionIndex ? { ...portion, removed: !portion.removed } : portion)),
      },
    },
  };
}

// A step field setter for leadIn/instruction/purpose/aside (03-02):
// `field` is always one of these four literal strings supplied by the
// page's own call sites, never a maker-influenced key, so a computed
// property name here carries no T-02-32 risk.
export function setPenStepField(draft, stepN, field, value) {
  return {
    ...draft,
    method: draft.method.map((step) => (step.n === stepN ? { ...step, [field]: value } : step)),
  };
}

// A target chip's label or value, matched by its index within the
// step's own targets array rather than by label — a label can itself be
// mid-edit, so matching by index avoids two chips momentarily colliding
// on the same label while the maker types.
export function setPenStepTarget(draft, stepN, targetIndex, field, value) {
  return {
    ...draft,
    method: draft.method.map((step) => {
      if (step.n !== stepN) return step;
      const targets = step.targets.map((target, index) => (index === targetIndex ? { ...target, [field]: value } : target));
      return { ...step, targets };
    }),
  };
}

// The step's uses list, written through a filter and a concat
// (route-recipe-version.md § 3), never a bare bracket write — a
// different fact from the row's own step allocation, and both are kept.
export function togglePenStepUses(draft, stepN, rowId) {
  return {
    ...draft,
    method: draft.method.map((step) => {
      if (step.n !== stepN) return step;
      const uses = step.uses ?? [];
      const nextUses = uses.includes(rowId) ? uses.filter((id) => id !== rowId) : uses.concat(rowId);
      return { ...step, uses: nextUses };
    }),
  };
}

// Removing sets only the draft step's removed flag — removal never
// cascades, so this is always the maker's own tap, whether flipping a
// step's own control or the removed-row cross-flag's "remove this step"
// control.
export function togglePenStepRemoved(draft, stepN) {
  return {
    ...draft,
    method: draft.method.map((step) => (step.n === stepN ? { ...step, removed: !step.removed } : step)),
  };
}

// An authored note's text, and the inherited-from marker it carries
// (route-recipe-version.md, "Inherited notes"): the marker persists when
// the edited text still equals the text this version inherited it with,
// and clears the instant it differs — computed once, here, so every
// reader (Authored.jsx included) can read `note.inheritedFrom` directly
// rather than re-deriving it. The note is compared with the version note it
// was opened from: by noteOrigins after a removal, otherwise by its own index
// (a kept draft from before noteOrigins compares by position, as it did).
// Mark's List bug-pen-note-delete-then-edit-provenance.
export function setPenNoteText(draft, version, listKey, index, value) {
  const origin = draft.noteOrigins?.[listKey]?.[index] ?? index;
  const originalNote = version.authored[listKey][origin];
  const notes = draft.authored[listKey].map((note, i) =>
    i === index
      ? { ...note, text: value, inheritedFrom: value === originalNote.text ? originalNote.inheritedFrom : null }
      : note,
  );
  return { ...draft, authored: { ...draft.authored, [listKey]: notes } };
}

// A note can be removed per note (route-recipe-version.md § 3) — an
// outright removal from the list, not a struck-in-place flag: an
// authored note carries no cross-flag concern the way a row or step does.
// It also records, per list, each surviving note's position in the version the
// pen opened on (noteOrigins). That key is absent until the first removal, so
// a draft with no removal (and every draft kept before this) keeps its exact
// shape, which the drafts store and the 05 walk read. penFieldsFromDraft and
// penDraftVersion pick their fields by name, so it never reaches a saved record.
export function removePenNote(draft, listKey, index) {
  const origins = draft.noteOrigins?.[listKey] ?? draft.authored[listKey].map((_, i) => i);
  return {
    ...draft,
    authored: { ...draft.authored, [listKey]: draft.authored[listKey].filter((_, i) => i !== index) },
    noteOrigins: { ...draft.noteOrigins, [listKey]: origins.filter((_, i) => i !== index) },
  };
}
