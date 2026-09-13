import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router';
import { repository } from '../store/repository.js';
import { buildFigures, figureLabelText } from '../domain/figures.js';
import { createBatch, completeRecord, sortedBatches } from '../domain/batch.js';
import { BATTERY_FIELDS, parseMeasuredDraft } from '../domain/battery.js';
import { activeRows, activeSteps } from '../domain/rows.js';
import {
  createChildVersion,
  saveOverVersion,
  versionsForRecipe,
  blockedSaveMessage,
  blockedSaveRowId,
  parseGramsDraft,
} from '../domain/lineage.js';
import { buildDiff } from '../domain/diff.js';
import { stepsWithStaleAmounts } from '../domain/uses.js';
import { displayNumbers } from '../domain/stepNumbers.js';
import { IngredientTable } from './IngredientTable.jsx';
import { Method } from './Method.jsx';
import { Authored } from './Authored.jsx';
import { FormulationNote } from './FormulationNote.jsx';
import { BasisNote } from './BasisNote.jsx';
import { BatchRow } from './BatchRow.jsx';
import { Headnote } from './Headnote.jsx';
import { VersionRow } from './VersionRow.jsx';
import { PenFoot } from './PenFoot.jsx';
import { DerivedAdvisories } from './DerivedAdvisories.jsx';

// The record pen's blocked-date sentence (D-05) — one constant, read from
// both handleSaveBatch (via validateRecordDraft) and the ceremony's own
// hint prop, so the "one state, two renderings" grep (03.3.1-02 Task 2
// acceptance) can never find it typed out a second time.
export const CHURN_DATE_BLOCKED_MESSAGE = 'Enter the date you churned.';

// The contract's verbatim form-status sentence for a malformed measurement
// ("Controls spec"), read from handleSaveBatch's own announce() call.
export const MEASURED_INVALID_STATUS = 'Check the marked measurements. Your entries have been kept.';

// Two as-made maps compared by key set and, for a shared key, by their
// arrays element-wise (D-10) — the same presence-over-truthiness
// discipline the rest of this file applies: a row present in one draft
// and absent in the other is a difference, and a portion differing at
// any index is a difference, even when the two arrays share the same
// length (Pitfall 5, every value the raw string the maker typed).
function asMadeMapsDiffer(a, b) {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return true;
  return aKeys.some((key) => {
    if (!Object.prototype.hasOwnProperty.call(b, key)) return true;
    const aValues = a[key];
    const bValues = b[key];
    if (aValues.length !== bValues.length) return true;
    return aValues.some((value, i) => value !== bValues[i]);
  });
}

// The step-changes map compared by key set and by both fields of each
// entry — an untouched step never rests at a key at all (D-13/BATCH1-01),
// so a key-set difference alone is already a real change.
function stepChangesDiffer(a, b) {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return true;
  return aKeys.some((key) => {
    if (!Object.prototype.hasOwnProperty.call(b, key)) return true;
    return a[key].struck !== b[key].struck || a[key].line !== b[key].line;
  });
}

// D-24's dirty check: true only while the record pen holds ink the maker
// has actually typed. Every field is tested against '' / {} / [] / false
// rather than truthiness (03.3.1-02 Task 1), so a written 0 (a battery
// field read as the string '0') still counts as dirty — matching the
// presence-over-truthiness discipline domain/batch.js already applies to
// the stored record. marks is compared by its own-key count and defects
// by its length (03.3.1-02-PLAN.md Task 1) — no interactive path in this
// plan edits either one, so a key-count/length check is the whole
// discipline this plan exercises; a deep comparison is plan 03/04's to add
// once the tasting section is actually writable.
//
// `baseline` is the draft-shaped object handleStartAmending pre-filled the
// draft from (draftFromBatch below), or null for a fresh recording
// (03-07, T-03-43): comparing an amend draft against blank made it read
// dirty the instant Amend opened, training the maker to dismiss a warning
// that fires on nothing. With a baseline, every field is compared against
// it instead of against blank — the same presence-over-truthiness
// discipline, applied to the record the draft actually started from.
export function isDraftDirty(mode, draft, baseline = null) {
  if (mode !== 'recording' || !draft) return false;
  if (!baseline) {
    return (
      draft.churnDate !== '' ||
      Object.keys(draft.asMade).length > 0 ||
      Object.keys(draft.stepChanges).length > 0 ||
      draft.timeToDrawTempMinutes !== '' ||
      draft.outOfMachineTempC !== '' ||
      draft.churnDurationMinutes !== '' ||
      draft.exitConsistency !== '' ||
      draft.airiness !== '' ||
      draft.atTheMachine !== '' ||
      draft.ingredientNotes !== '' ||
      draft.nextTimeNote !== '' ||
      draft.tastingOpen !== false ||
      draft.tastedDate !== '' ||
      draft.temperingMinutes !== '' ||
      draft.tastingTempC !== '' ||
      Object.keys(draft.marks).length > 0 ||
      draft.note !== '' ||
      draft.defects.length > 0 ||
      draft.bitterDeclared !== false ||
      draft.meltTestG !== '' ||
      draft.meltStyle !== ''
    );
  }
  return (
    draft.churnDate !== baseline.churnDate ||
    draft.timeToDrawTempMinutes !== baseline.timeToDrawTempMinutes ||
    draft.outOfMachineTempC !== baseline.outOfMachineTempC ||
    draft.churnDurationMinutes !== baseline.churnDurationMinutes ||
    draft.exitConsistency !== baseline.exitConsistency ||
    draft.airiness !== baseline.airiness ||
    draft.atTheMachine !== baseline.atTheMachine ||
    draft.ingredientNotes !== baseline.ingredientNotes ||
    draft.nextTimeNote !== baseline.nextTimeNote ||
    draft.tastingOpen !== baseline.tastingOpen ||
    draft.tastedDate !== baseline.tastedDate ||
    draft.temperingMinutes !== baseline.temperingMinutes ||
    draft.tastingTempC !== baseline.tastingTempC ||
    draft.note !== baseline.note ||
    draft.bitterDeclared !== baseline.bitterDeclared ||
    draft.meltTestG !== baseline.meltTestG ||
    draft.meltStyle !== baseline.meltStyle ||
    Object.keys(draft.marks).length !== Object.keys(baseline.marks).length ||
    draft.defects.length !== baseline.defects.length ||
    asMadeMapsDiffer(draft.asMade, baseline.asMade) ||
    stepChangesDiffer(draft.stepChanges, baseline.stepChanges)
  );
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
// (route-recipe-version.md § 3).
function usesListsDiffer(a = [], b = []) {
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
// A row's draft entry is { portions: [{ step, grams }], removed } (D-01,
// D-02) — dirty if the removed flag differs, or if any portion's raw
// string or step differs from that portion's own value, in order.
//
// Extended (03-07, T-03-42) to the three fields the pen spends most of its
// time editing — method, headnote, authored — which this check omitted
// entirely: a maker who rewrote a step's prose or an authored note and
// then reloaded lost it with no warning of any kind.
export function isPenDraftDirty(mode, penDraft, version) {
  if (mode !== 'developing' || !penDraft || !version) return false;
  if (penDraft.versionLabel !== '') return true;
  if (penDraft.reason !== '') return true;
  if (penDraft.citedBatchId !== null) return true;
  if (penDraft.headnote !== version.headnote) return true;
  const rowsDirty = version.rows.some((row) => {
    const draftRow = penDraft.rows[row.id];
    if (draftRow.removed !== (row.removed ?? false)) return true;
    return row.portions.some((portion, i) => {
      const draftPortion = draftRow.portions[i];
      return draftPortion.grams !== String(portion.grams) || draftPortion.step !== portion.step;
    });
  });
  if (rowsDirty) return true;
  const methodDirty = version.method.some((step) => {
    const draftStep = penDraft.method.find((candidate) => candidate.n === step.n);
    return isStepDirty(draftStep, step);
  });
  if (methodDirty) return true;
  if (isAuthoredListDirty(penDraft.authored.carriedForward, version.authored.carriedForward)) return true;
  if (isAuthoredListDirty(penDraft.authored.beforeYouStart, version.authored.beforeYouStart)) return true;
  return false;
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

// blankRecordDraft() -> the one record draft's fresh shape (03.3.1-02
// artifacts list): every churn and tasting field blank, tastingOpen false.
// The tasting fields ride along even though this plan renders no control
// for them yet (plan 03 opens the tasting section) — so the draft's shape
// never has to change again when that section arrives, and the dirty
// check and the save assembly below already know every field's name.
function blankRecordDraft() {
  return {
    churnDate: '',
    asMade: {},
    stepChanges: {},
    timeToDrawTempMinutes: '',
    outOfMachineTempC: '',
    churnDurationMinutes: '',
    exitConsistency: '',
    airiness: '',
    atTheMachine: '',
    ingredientNotes: '',
    nextTimeNote: '',
    tastingOpen: false,
    tastedDate: '',
    temperingMinutes: '',
    tastingTempC: '',
    marks: {},
    note: '',
    defects: [],
    bitterDeclared: false,
    meltTestG: '',
    meltStyle: '',
  };
}

// draftFromBatch(batch) -> the record draft handleStartAmending pre-fills
// from ("Correct reopens the same pen with everything editable", D-03).
// Every read is an own-property read off the batch's own churn/tasting
// objects — never a computed-key write against a stored key (the T-03-10
// adjacency rule this plan's threat model names) — the asMade copy below
// mirrors buildChurn's own already-reviewed shallow-copy-by-own-keys
// pattern (domain/batch.js). Exported so 03.3.1-02's Task 3 acceptance
// criteria (the seeded batch's exact pre-filled values) can be asserted
// directly, the same way this file's other pure helpers already are.
export function draftFromBatch(batch) {
  const churn = batch.churn;
  const tasting = batch.tasting;
  const asMade = {};
  for (const [rowId, values] of Object.entries(churn.asMade)) {
    asMade[rowId] = values.map((value) => (value === null ? '' : String(value)));
  }
  const toDraftString = (value) => (value == null ? '' : String(value));
  return {
    churnDate: churn.churnDate ?? '',
    asMade,
    stepChanges: structuredClone(churn.stepChanges),
    timeToDrawTempMinutes: toDraftString(churn.timeToDrawTempMinutes),
    outOfMachineTempC: toDraftString(churn.outOfMachineTempC),
    churnDurationMinutes: toDraftString(churn.churnDurationMinutes),
    exitConsistency: churn.exitConsistency ?? '',
    airiness: churn.airiness ?? '',
    atTheMachine: churn.atTheMachine ?? '',
    ingredientNotes: churn.ingredientNotes ?? '',
    nextTimeNote: churn.nextTimeNote ?? '',
    tastingOpen: tasting != null,
    tastedDate: tasting ? (tasting.tastedDate ?? '') : '',
    temperingMinutes: tasting ? toDraftString(tasting.temperingMinutes) : '',
    tastingTempC: tasting ? toDraftString(tasting.tastingTempC) : '',
    marks: tasting ? { ...tasting.marks } : {},
    note: tasting ? (tasting.note ?? '') : '',
    defects: tasting && tasting.defects ? [...tasting.defects] : [],
    bitterDeclared: tasting ? tasting.bitterDeclared === true : false,
    meltTestG: tasting ? toDraftString(tasting.meltTestG) : '',
    meltStyle: tasting ? (tasting.meltStyle ?? '') : '',
  };
}

// tastingHasInk(draft) -> whether the tasting side of the draft holds
// anything the maker wrote (D-02: "what a save persists is everything the
// record currently holds" — a tasting section open but empty persists no
// tasting at all). Any own-key mark, any picked chip, the declared toggle,
// or any non-empty tasting field counts.
export function tastingHasInk(draft) {
  return (
    Object.keys(draft.marks).length > 0 ||
    draft.defects.length > 0 ||
    draft.bitterDeclared === true ||
    draft.tastedDate !== '' ||
    draft.temperingMinutes !== '' ||
    draft.tastingTempC !== '' ||
    draft.note !== '' ||
    draft.meltTestG !== '' ||
    draft.meltStyle !== ''
  );
}

// parseAllMeasuredFields(draft) -> { fieldErrors, hasErrors, parsed }.
// Pure: walks BATTERY_FIELDS, parsing each field through
// parseMeasuredDraft. A malformed value's own contract sentence
// (BATTERY_FIELDS' own `error` string, verbatim) lands in fieldErrors;
// `parsed` is every field's own { ok, value }, reused by the save
// assembly below so a field is never parsed twice. 03.3.1-02 Task 1's own
// scope: "if any field is malformed, record per-field errors and abort —
// storing the errors and aborting is enough." The full field-level UI
// wiring (aria-invalid/describedby, the field-error line, focus-on-first-
// invalid) and the churn-date press-to-block (D-05) are Task 2's build.
export function parseAllMeasuredFields(draft) {
  const fieldErrors = {};
  const parsed = {};
  let hasErrors = false;
  for (const field of BATTERY_FIELDS) {
    const result = parseMeasuredDraft(draft[field.key], { signed: field.signed });
    parsed[field.key] = result;
    if (!result.ok) {
      fieldErrors[field.key] = field.error;
      hasErrors = true;
    }
  }
  return { fieldErrors, hasErrors, parsed };
}

// validateRecordDraft(draft) -> { fieldErrors, invalidFieldKey,
// blockedDateMessage, parsed }. Pure (03.3.1-02 Task 2): the record pen's
// one save gate. Every measurement validates first (RESEARCH.md Open
// Question 3), via parseAllMeasuredFields above; only once every
// measurement is clean does the churn date get its own press-to-block
// check (D-05) — the two blocks never fire together, so a sentence and
// its target can never disagree (one traversal). invalidFieldKey names
// the first invalid field in BATTERY_FIELDS order — Object.keys on a
// plain object preserves string-key insertion order, and fieldErrors is
// built by iterating BATTERY_FIELDS in that same order, so the first key
// is the first field the traversal found invalid.
export function validateRecordDraft(draft) {
  const { fieldErrors, hasErrors, parsed } = parseAllMeasuredFields(draft);
  if (hasErrors) {
    return { fieldErrors, invalidFieldKey: Object.keys(fieldErrors)[0], blockedDateMessage: null, parsed };
  }
  const blockedDateMessage = draft.churnDate === '' ? CHURN_DATE_BLOCKED_MESSAGE : null;
  return { fieldErrors: {}, invalidFieldKey: null, blockedDateMessage, parsed };
}

function toTextOrNull(raw) {
  return raw === '' ? null : raw;
}

// buildChurnFieldsFromDraft(draft, parsed) -> the churnFields object
// createBatch/completeRecord both take. `parsed` is
// parseAllMeasuredFields' own per-field result — reused here so a save
// never re-parses a field it has already validated. asMade parses through
// parseGramsDraft exactly as
// the plan pen's own as-made column already does (D-10): a value that
// rule rejects, or a blank portion, becomes null, the same fact as a
// portion never touched; a row whose every portion resolves to null drops
// its key entirely.
export function buildChurnFieldsFromDraft(draft, parsed) {
  const asMade = {};
  for (const [rowId, rawValues] of Object.entries(draft.asMade)) {
    const parsedValues = rawValues.map((rawValue) => parseGramsDraft(rawValue));
    if (parsedValues.some((value) => value !== null)) asMade[rowId] = parsedValues;
  }
  return {
    churnDate: draft.churnDate === '' ? null : draft.churnDate,
    asMade,
    stepChanges: draft.stepChanges,
    timeToDrawTempMinutes: parsed.timeToDrawTempMinutes.value,
    outOfMachineTempC: parsed.outOfMachineTempC.value,
    churnDurationMinutes: parsed.churnDurationMinutes.value,
    exitConsistency: draft.exitConsistency === '' ? null : draft.exitConsistency,
    airiness: draft.airiness === '' ? null : draft.airiness,
    atTheMachine: toTextOrNull(draft.atTheMachine),
    ingredientNotes: toTextOrNull(draft.ingredientNotes),
    nextTimeNote: toTextOrNull(draft.nextTimeNote),
  };
}

// buildTastingFieldsFromDraft(draft, parsed) -> the tastingFields object
// createBatch/completeRecord take when the tasting side holds ink
// (tastingHasInk above decides whether this is even called).
export function buildTastingFieldsFromDraft(draft, parsed) {
  return {
    tastedDate: draft.tastedDate === '' ? null : draft.tastedDate,
    temperingMinutes: parsed.temperingMinutes.value,
    tastingTempC: parsed.tastingTempC.value,
    marks: draft.marks,
    note: toTextOrNull(draft.note),
    defects: draft.defects.length > 0 ? draft.defects : null,
    bitterDeclared: draft.bitterDeclared === true ? true : null,
    meltTestG: parsed.meltTestG.value,
    meltStyle: draft.meltStyle === '' ? null : draft.meltStyle,
  };
}

// The brief's book spread, in semantic regions, each wearing its
// plain-language name. The margin's derived-advisories block (FORM2-02)
// renders nothing visible when the version has none — no placeholder text.
export function RecipePage() {
  const { id, batchId } = useParams();
  const navigate = useNavigate();
  // The fork's landing focus signal (D-27): read once, here, so Versions
  // stays prop-driven and testable without a router state of its own.
  const location = useLocation();
  const focusDevelopOnMount = Boolean(location.state?.focusDevelop);
  // The show-changes state (D-02): on when the `changes` key is present in
  // the URL's search parameters at all — its value is never consulted, so
  // presence is the whole signal. Composes with both /recipe/:id and
  // /recipe/:id/batch/:batchId with no new route, since both already
  // resolve to this component. setSearchParams's default history behaviour
  // (a push, not a replace) is left alone: that is what makes the browser's
  // own back button return to the clean reading, with no extra code.
  const [searchParams, setSearchParams] = useSearchParams();
  const showingChanges = searchParams.has('changes');
  const [version, setVersion] = useState(undefined);
  const [versions, setVersions] = useState([]);
  const [batches, setBatches] = useState([]);
  // The signature trace (route-recipe.md § 3, § 5): focusing a balance
  // figure marks the ingredient rows it rests on. This page is the shared
  // parent of the figures and the table, so it is the one place the
  // focused figure's key can live.
  const [focusedFigureKey, setFocusedFigureKey] = useState(null);
  // The pen layer's state (route-recipe-batch.md § 3): a mode, one of
  // 'reading' | 'recording' | 'developing', and the draft form state it is
  // recorded into. mode is never derived from the URL — only the margin's
  // own control, and now the headnote's, ask for it (D-19).
  const [mode, setMode] = useState('reading');
  const [draft, setDraft] = useState(null);
  // Non-null while `mode === 'recording'` means the pen layer is amending
  // this existing batch's record, rather than recording a new one
  // (task 3, D-06). Amending pre-fills the fields from the batch, never
  // from the version, and saving calls completeRecord, never createBatch.
  const [amendingBatchId, setAmendingBatchId] = useState(null);
  // The draft-shaped object handleStartAmending pre-filled `draft` from
  // (03-07, T-03-43) — the baseline isDraftDirty compares an amend draft
  // against, instead of blank. Cleared everywhere amendingBatchId is
  // cleared, for the same class of reason (T-02-24): a stale baseline left
  // over from a prior amendment would make a fresh recording's own dirty
  // check compare against the wrong record.
  const [amendBaseline, setAmendBaseline] = useState(null);
  // The record pen's own blocked-save state (D-05, contract "Controls
  // spec"): fieldErrors keys a battery field to its own contract sentence;
  // invalidFieldTarget names the first invalid field in BATTERY_FIELDS
  // order plus an attempt counter (WR-01's pattern) so a second
  // consecutive block on the same field still moves focus; blockedDate*
  // are the churn-date press-to-block's own message and attempt counter,
  // read by BOTH ceremonies (D-05: "a sentence beside both save sets");
  // formStatus is the form-status live region's own text.
  const [fieldErrors, setFieldErrors] = useState({});
  const [invalidFieldTarget, setInvalidFieldTarget] = useState(null);
  const invalidFieldAttemptRef = useRef(0);
  const [blockedDateMessage, setBlockedDateMessage] = useState(null);
  const [blockedDateAttempt, setBlockedDateAttempt] = useState(null);
  const dateBlockedAttemptRef = useRef(0);
  const [formStatus, setFormStatus] = useState('');
  const formStatusTimerRef = useRef(null);
  // The plan's own pen draft (03-CONTEXT.md D-01 to D-10): version line,
  // reason, citation and headnote start blank/null — never defaulted from
  // the parent — while rows is a map keyed by row id holding the raw
  // string the maker typed for grams, the draft.asMade precedent (never
  // Number() on keystroke, so a value typed finer than the display
  // survives, RESEARCH.md Pitfall 5).
  const [penDraft, setPenDraft] = useState(null);
  const [blockedMessage, setBlockedMessage] = useState(null);
  // The offending field a blocked save names (critique P1 #3, D-21): the
  // version-line field, or a row's grams field by id — read by
  // IngredientTable and Versions to mark and focus exactly the field
  // blockedSaveMessage's own sentence names, and cleared everywhere
  // blockedMessage is cleared so the two can never point at different
  // fields.
  const [blockedTarget, setBlockedTarget] = useState(null);
  // WR-01's fix (03.1 REVIEW.md, Versions.jsx's half): an incrementing
  // counter, stamped onto blockedTarget on every blocked buildPenFields
  // call, so a second consecutive blocked save on the same field re-fires
  // VersionRow's focus-return effect — a value-equal boolean cannot.
  const blockedAttemptRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    repository.getVersion(id).then((result) => {
      if (!cancelled) setVersion(result ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    repository.listBatchesForVersion(id).then((result) => {
      if (!cancelled) setBatches(result);
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  // Every stored version, loaded once beside the two effects above — the
  // strip (03-03) and the version-line uniqueness check (D-04) both read
  // this list.
  useEffect(() => {
    let cancelled = false;
    repository.listVersions().then((result) => {
      if (!cancelled) setVersions(result);
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  // The cited batch this version's lineage line names (route-recipe-version.md
  // § 3): citedBatchId is an id only — the batch itself lives on the
  // parent, never copied onto the child — so its churn date is read once
  // per version here, purely to render the lineage line's date-linked
  // clause.
  const [citedBatch, setCitedBatch] = useState(null);
  useEffect(() => {
    let cancelled = false;
    if (!version || !version.citedBatchId) {
      setCitedBatch(null);
      return undefined;
    }
    repository.getBatch(version.citedBatchId).then((result) => {
      if (!cancelled) setCitedBatch(result ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [version]);

  // The live parent read (T-03-23, T-03-24): show-changes reads the parent
  // record through the repository at render time, never a copy stored on
  // the child, so a parent saved over afterwards is reflected rather than
  // frozen. Held as null when the version has no parent, or when the read
  // comes back with nothing — either way the toggle is absent and the
  // lineage line still names the parent from the child's own
  // parentVersionLabel snapshot (D-10).
  const [parentVersion, setParentVersion] = useState(null);
  useEffect(() => {
    let cancelled = false;
    if (!version || !version.parentVersionId) {
      setParentVersion(null);
      return undefined;
    }
    repository.getVersion(version.parentVersionId).then((result) => {
      if (!cancelled) setParentVersion(result ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [version]);

  // Every batch in the store, for the Later disclosure's own cards
  // (03.3-06 checkpoint feedback, G-03.3-4): each descendant's "churned"
  // date and its cited batch's date both come out of this one read — one
  // repository.getAllBatches() read, not a query per version, since the
  // realistic range is 1–6 versions per recipe this milestone.
  const [allBatches, setAllBatches] = useState([]);
  useEffect(() => {
    let cancelled = false;
    repository.getAllBatches().then((result) => {
      if (!cancelled) setAllBatches(result);
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  // D-24: leaving the page with unsaved ink uses the browser's own leave
  // warning only, registered while recording or the plan's pen holds a
  // dirty draft, and removed as soon as neither does — no invented dialog,
  // no draft persistence across a reload (that is UX1-02, Phase 4). The
  // tasting pen's own dirty check folded into isDraftDirty above with the
  // tasting pen's retirement (03.3.1-02).
  useEffect(() => {
    if (!isDraftDirty(mode, draft, amendBaseline) && !isPenDraftDirty(mode, penDraft, version)) {
      return undefined;
    }
    const handleBeforeUnload = (event) => {
      event.preventDefault();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [mode, draft, amendBaseline, penDraft, version]);

  // Escape (D-27): closes only an untouched pen, and does nothing at all
  // once the pen holds ink — Cancel is the one exit, so a stray key can
  // never discard a sheet of transcription. Registered on `document`, not
  // the article, so an Escape pressed while focus rests on `body` (the
  // state the critique found batch Cancel leaving behind) still closes
  // the pen. Reads the same two dirty checks the beforeunload guard above
  // already reads — introducing no third notion of dirtiness. An open but
  // empty tasting section (tastingOpen true, nothing else touched) counts
  // as no ink under isDraftDirty's own baseline/blank comparisons above,
  // so Escape closes it exactly as it closes any other untouched pen
  // (RESEARCH.md Open Question 4). openPen is recomputed here via
  // derivePenState (not read as an outer variable) because this effect
  // must sit above the early returns below, where the page-level openPen
  // constant does not exist yet.
  useEffect(() => {
    const { openPen: escapeOpenPen } = derivePenState({ mode, amendingBatchId });
    if (escapeOpenPen === null) return undefined;
    function handleKeyDown(event) {
      if (event.key !== 'Escape') return;
      if (escapeOpenPen === 'plan' && !isPenDraftDirty(mode, penDraft, version)) {
        handleCancelDeveloping();
      } else if ((escapeOpenPen === 'record' || escapeOpenPen === 'amend') && !isDraftDirty(mode, draft, amendBaseline)) {
        handleCancelRecording();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [mode, amendingBatchId, penDraft, version, draft, amendBaseline]);

  if (version === undefined) return null;
  // The running head is the way home in every state, including this one
  // (route-recipe-version.md § 4): it identifies the book, never carries
  // status, and never changes with state. A mistyped or since-removed
  // version id is no longer a dead end.
  if (version === null) {
    return (
      <>
        <p className="running-head">
          <Link to="/">Sprinkles</Link>
        </p>
        <div className="not-found">
          <p>No recipe found for this version.</p>
          <Link to="/">Back to the recipe list</Link>
        </div>
      </>
    );
  }

  // The one call site (D-UAT-1): every control that disables while a pen
  // is open reads openPen/penReason from here, never mode directly.
  const { openPen, reason: penReason } = derivePenState({ mode, amendingBatchId });

  // D-01: on any version with no batch recorded, both saves are offered;
  // on a churned version only Save (a fork) exists, so a churned
  // version's own record is never written to (D04). Computed once here
  // and passed to both Versions' ceremony and PenFoot's repeated pair —
  // never twice (RESEARCH.md Pattern 2).
  const canSaveOver = batches.length === 0;

  // The one hint derivation (RESEARCH.md Pattern 2): whichever pen is open
  // owns the hint both VersionRow and PenFoot render — the plan pen's own
  // blocked-save sentence, or the record/amend pen's own blocked-date
  // sentence (D-05). Neither pen has a completeness gate (D-02 retires the
  // tasting save gate) — the record pen's Save is never disabled.
  const penHint = openPen === 'record' || openPen === 'amend' ? blockedDateMessage : blockedMessage;

  const hasRows = version.rows.length > 0;
  // The clean reading: every reader that is not the pen's own table takes
  // this, with every removed row and step already absent (RESEARCH.md
  // Pattern 2) — a removed row must never reach buildFigures/computeBalance.
  const readingVersion = { ...version, rows: activeRows(version), method: activeSteps(version) };

  // The draft version (route-recipe-version.md § 3, 03-02): built once,
  // from the version the pen opened on with the draft's values applied, so
  // the pen's own table, the cross-flags (uses.js) and buildDiff all read
  // the same object rather than each reassembling it. A row's portions
  // become the draft's portions with each `grams` parsed through
  // parseGramsDraft, falling back to that portion's own stored amount when
  // the string is blank or does not parse — never 0 or NaN, applied per
  // portion. Unfiltered — a removed row or step still appears here,
  // struck, for the pen's own table; readers that want the clean figures
  // filter through activeRows/activeSteps first.
  const draftVersion =
    mode === 'developing' && penDraft
      ? {
          ...version,
          rows: version.rows.map((row) => {
            const draftRow = penDraft.rows[row.id];
            return {
              ...row,
              portions: row.portions.map((portion, i) => {
                const draftPortion = draftRow.portions[i];
                return { step: draftPortion.step, grams: parseGramsDraft(draftPortion.grams) ?? portion.grams };
              }),
              removed: draftRow.removed,
            };
          }),
          method: penDraft.method,
          headnote: penDraft.headnote,
          authored: penDraft.authored,
        }
      : null;

  // While developing, the six rules and the basis note answer live against
  // the maker's typed grams and removed rows (route-recipe-version.md § 3).
  const liveVersion =
    mode === 'developing' && draftVersion
      ? { ...draftVersion, rows: activeRows(draftVersion), method: activeSteps(draftVersion) }
      : readingVersion;

  const figures = buildFigures(liveVersion);
  const focusedFigure = figures.find((figure) => figure.key === focusedFigureKey) ?? null;
  const markedRowIds = focusedFigure?.contributorRowIds ?? [];
  const markedFigureLabel = focusedFigure ? figureLabelText(focusedFigure.label) : '';

  // The show-changes diff (route-recipe-version.md § 3, § 6; D-02, T-03-23):
  // one buildDiff of the version against its live parent — the same
  // function the pen uses against its own baseline — computed once here and
  // threaded into every region (the table, the six rules, the method).
  // Absent whenever the toggle itself would be absent: no parent, the
  // parent record unread, or the parameter not present.
  const changeDiff =
    showingChanges && version.parentVersionId && parentVersion ? buildDiff(version, parentVersion) : null;
  const changeStaleSteps = changeDiff ? stepsWithStaleAmounts(version, parentVersion) : [];

  // The pen's own live diff (critique P1 #2, build gap 1): the draft
  // against the version the plan's pen opened on, computed once here —
  // never in Method, never in FormulationNote — from the same buildDiff
  // the show-changes comparison above already uses. This is what lets the
  // rule heads strike the parent figure and draw the hollow tick while the
  // maker is still typing, and what Method reads instead of computing its
  // own comparison a second time per keystroke (RESEARCH.md Don't
  // Hand-Roll).
  const penDiff = mode === 'developing' && draftVersion ? buildDiff(draftVersion, version) : null;
  const penStaleSteps = penDiff ? stepsWithStaleAmounts(draftVersion, version) : [];

  // The two step-position maps (domain/stepNumbers.js, 03-10), computed
  // once here and threaded to every region that names a step, the same
  // shape changeDiff already follows: one comparison, computed once, so no
  // two regions can derive a different answer. `current` is built from the
  // method the page is showing — the draft's while the pen is open, the
  // version's own otherwise; a removed step is absent from it by
  // construction, so the same call serves the reading state (where the
  // method handed down is already filtered) and the pen/show-changes
  // (where it is not). `baseline` is what a struck or removed step's
  // number comes from: the record the pen opened on (D-03) while
  // developing, or the live parent while showing changes — null wherever
  // neither state applies, and null in show-changes when the parent could
  // not be read, the same condition that already makes the toggle absent.
  const currentStepNumbers = displayNumbers(mode === 'developing' && draftVersion ? draftVersion.method : version.method);
  const baselineStepNumbers = mode === 'developing' ? displayNumbers(version.method) : changeDiff ? displayNumbers(parentVersion.method) : null;

  // The batch this page shows: the one the URL names, or — with no batch
  // named in the URL — the version's most recent batch by churn date,
  // undated last, or null when the version has no batch yet.
  let openBatch = null;
  if (batchId) {
    openBatch = batches.find((batch) => batch.id === batchId) ?? null;
  } else if (batches.length > 0) {
    openBatch = sortedBatches(batches)[0];
  }

  // announce(message, { selfClear }) -> writes the form-status live
  // region's text (contract "Feedback and undo lifecycle"). Validation and
  // block statuses never self-clear; a future toast-bearing status
  // (plan 04's tasting removal/undo) passes selfClear: true and gets the
  // guarded five-second clear — it clears only if the text on screen is
  // still the message it wrote, so a newer message is never wiped
  // (RESEARCH.md Code Example 5).
  function announce(message, { selfClear = false } = {}) {
    setFormStatus(message);
    if (formStatusTimerRef.current) clearTimeout(formStatusTimerRef.current);
    if (selfClear) {
      formStatusTimerRef.current = setTimeout(() => {
        setFormStatus((current) => (current === message ? '' : current));
      }, 5000);
    }
  }

  // Clearing the amend target here is load-bearing, not redundant: without
  // it, a maker who amends and then starts a fresh recording would leave
  // amendingBatchId set from the earlier amendment, so handleSaveBatch
  // would take the amend path — overwriting the amended batch's record and
  // stamping a false changed date on it, while the new batch is never
  // created (T-02-24).
  function handleStartRecording() {
    setAmendingBatchId(null);
    setAmendBaseline(null);
    setDraft(blankRecordDraft());
    setFieldErrors({});
    setInvalidFieldTarget(null);
    setBlockedDateMessage(null);
    setBlockedDateAttempt(null);
    setFormStatus('');
    setMode('recording');
  }

  // The one generic setter for every raw-text/date/tasting field the
  // record pen holds (03.3.1-02 artifacts: handleChangeRecordField):
  // stores the raw string the maker typed, exactly as the as-made column
  // already does, so typed precision is never lost to an early Number()
  // coercion — the conversion happens once, at save time
  // (buildChurnFieldsFromDraft/buildTastingFieldsFromDraft). Clears the
  // blocked-date sentence and every field error first (the 888-892
  // pattern) — the record the maker is now editing may no longer be the
  // one either sentence described.
  function handleChangeRecordField(field, value) {
    setFieldErrors({});
    setBlockedDateMessage(null);
    setFormStatus('');
    setDraft((prev) => ({ ...prev, [field]: value }));
  }

  // The three segmented controls (exit consistency, airiness, melt style)
  // share one handler: clicking the already-picked option clears it
  // (contract "Blank stays blank" — click-again clears), clicking any
  // other option picks it. BatchRow calls this from each option's onClick,
  // never onChange, since a native radio's onChange does not re-fire on a
  // click that leaves its value unchanged.
  function handleChangeSegment(field, value) {
    setFieldErrors({});
    setBlockedDateMessage(null);
    setFormStatus('');
    setDraft((prev) => ({ ...prev, [field]: prev[field] === value ? '' : value }));
  }

  // Clearing both the strike and the line for a step removes that step's
  // key from the draft entirely (D-13/BATCH1-01): an untouched step must
  // never rest at { struck: false, line: null }, which would be
  // indistinguishable from a step the maker deliberately marked as
  // unchanged — a fact this record never states.
  function handleChangeStepChange(stepNumber, patch) {
    setFieldErrors({});
    setBlockedDateMessage(null);
    setFormStatus('');
    setDraft((prev) => {
      const stepChanges = { ...prev.stepChanges };
      const key = String(stepNumber);
      if (!patch.struck && !patch.line) {
        delete stepChanges[key];
      } else {
        stepChanges[key] = { struck: patch.struck, line: patch.line };
      }
      return { ...prev, stepChanges };
    });
  }

  // Writes one portion's raw string (D-10). A row with no key yet is
  // seeded with an array of empty strings the length of that row's own
  // portions first, so the array is always aligned with row.portions —
  // the same alignment contract asMadeForPortion reads. Once every
  // portion of a row is back to an empty string, the row's key is deleted
  // entirely — the existing "an empty field means nothing was written"
  // rule (D-13/BATCH1-01), applied at the row level as it is today.
  function handleChangeAsMade(rowId, portionIndex, rawValue) {
    setFieldErrors({});
    setBlockedDateMessage(null);
    setFormStatus('');
    setDraft((prev) => {
      const asMade = { ...prev.asMade };
      const row = version.rows.find((candidate) => candidate.id === rowId);
      const existing = Object.prototype.hasOwnProperty.call(asMade, rowId) ? asMade[rowId] : null;
      const next = existing ? [...existing] : new Array(row.portions.length).fill('');
      next[portionIndex] = rawValue;
      if (next.every((value) => value === '')) {
        delete asMade[rowId];
      } else {
        asMade[rowId] = next;
      }
      return { ...prev, asMade };
    });
  }

  // "Correct" reopens the record pen with everything the record holds in
  // the fields — the churn side and, when the batch carries one, the
  // tasting side too (D-03) — pre-filled from the batch, never from the
  // version (task 3, draftFromBatch above).
  function handleStartAmending(batch) {
    const filledDraft = draftFromBatch(batch);
    setDraft(filledDraft);
    // The baseline isDraftDirty compares against (03-07, T-03-43) — a
    // separate clone, not the same object setDraft was just given, so a
    // later edit to draft (always a new object via setDraft's own spread)
    // can never be mistaken for a mutation of the baseline itself.
    setAmendBaseline(structuredClone(filledDraft));
    setAmendingBatchId(batch.id);
    setFieldErrors({});
    setInvalidFieldTarget(null);
    setBlockedDateMessage(null);
    setBlockedDateAttempt(null);
    setFormStatus('');
    setMode('recording');
  }

  // The one save (D-01/D-02/D-03/D-04): every battery measurement
  // validates first (RESEARCH.md Open Question 3), then the churn date
  // (D-05) — Save stays enabled through both blocks, never disabled
  // (validateRecordDraft is the one traversal both blocks flow through).
  // Only once the draft is clean does the two impure calls (a fresh id,
  // the current instant) run, here, in the one save handler — createBatch
  // and completeRecord stay deterministic. Amending (amendingBatchId set)
  // calls completeRecord on the batch being amended instead of createBatch
  // — a correction is never a new event and never retakes the snapshot
  // (BATCH2-01), and every completing save stamps `changed` (D-04). A
  // tasting object is assembled only when the section is open and holds
  // ink (D-02); a null tasting on completeRecord removes a stored one
  // (RESEARCH.md Assumption A3 — surfaced in this plan's SUMMARY for
  // end-of-phase UAT).
  function handleSaveBatch() {
    const { fieldErrors: errors, invalidFieldKey, blockedDateMessage: dateMessage, parsed } = validateRecordDraft(draft);

    if (invalidFieldKey !== null) {
      setFieldErrors(errors);
      invalidFieldAttemptRef.current += 1;
      setInvalidFieldTarget({ key: invalidFieldKey, attempt: invalidFieldAttemptRef.current });
      setBlockedDateMessage(null);
      announce(MEASURED_INVALID_STATUS);
      return;
    }
    setFieldErrors({});
    setInvalidFieldTarget(null);

    if (dateMessage) {
      dateBlockedAttemptRef.current += 1;
      setBlockedDateMessage(dateMessage);
      setBlockedDateAttempt(dateBlockedAttemptRef.current);
      return;
    }
    setBlockedDateMessage(null);

    const now = new Date().toISOString();
    const churnFields = buildChurnFieldsFromDraft(draft, parsed);
    const tasting = draft.tastingOpen && tastingHasInk(draft) ? buildTastingFieldsFromDraft(draft, parsed) : null;

    if (amendingBatchId) {
      const batchBeingAmended = batches.find((batch) => batch.id === amendingBatchId);
      const record = completeRecord(batchBeingAmended, churnFields, tasting, { now });
      repository.saveBatch(record).then(() => {
        setBatches((prev) => prev.map((batch) => (batch.id === record.id ? record : batch)));
        setMode('reading');
        setDraft(null);
        setAmendingBatchId(null);
        setAmendBaseline(null);
        setFormStatus('');
      });
      return;
    }

    const record = createBatch(version, churnFields, tasting, { id: crypto.randomUUID(), now: new Date().toISOString() });

    repository.saveBatch(record).then(() => {
      setBatches((prev) => [...prev, record]);
      setMode('reading');
      setDraft(null);
      setAmendBaseline(null);
      setFormStatus('');
      navigate(`/recipe/${id}/batch/${record.id}`);
    });
  }

  // The deliberate, in-app abandonment path (A-1): returns to reading,
  // drops the draft, and clears the amend target and every blocked/error
  // state, writing nothing. This is distinct from D-24's beforeunload
  // warning, which only guards accidental loss on document unload — the
  // brief conflated the two, but they are different requirements (see
  // pen-layer-no-cancel-save-hard-to-find.md). Nothing needs to navigate:
  // the batch on screen is derived from the URL and the loaded batch list,
  // never from the draft, so the page already shows the right thing once
  // mode returns to reading.
  function handleCancelRecording() {
    setMode('reading');
    setDraft(null);
    setAmendingBatchId(null);
    setAmendBaseline(null);
    setFieldErrors({});
    setInvalidFieldTarget(null);
    setBlockedDateMessage(null);
    setBlockedDateAttempt(null);
    setFormStatus('');
  }

  // Seeds penDraft from the version the pen opened on — a row's own
  // portions mapped to { step, grams }, each grams a string (Pitfall 5),
  // everything else the maker's own to write, never defaulted from the
  // parent (D-10: no default reason, citation, or version line). Never
  // touches draft or amendingBatchId — mode alone still decides which of
  // developing/recording is live; derivePenState above is what now
  // decides availability everywhere else (RESEARCH.md Pattern 4).
  function handleStartDeveloping() {
    const rows = {};
    for (const row of version.rows) {
      rows[row.id] = {
        portions: row.portions.map((portion) => ({ step: portion.step, grams: String(portion.grams) })),
        removed: row.removed ?? false,
      };
    }
    setPenDraft({
      versionLabel: '',
      reason: '',
      citedBatchId: null,
      headnote: version.headnote,
      rows,
      method: structuredClone(version.method),
      authored: structuredClone(version.authored),
    });
    setBlockedMessage(null);
    setBlockedTarget(null);
    setMode('developing');
  }

  // The show-changes toggle (D-02): adds or deletes the `changes` key,
  // building a new URLSearchParams from the previous one rather than
  // mutating it, and leaving setSearchParams's default push behaviour
  // alone so the browser's own back button returns to the clean reading.
  function handleToggleShowChanges() {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (next.has('changes')) next.delete('changes');
      else next.set('changes', '');
      return next;
    });
  }

  // Discards with no dialog of the app's own (D-10) — mirrors
  // handleCancelRecording exactly.
  function handleCancelDeveloping() {
    setMode('reading');
    setPenDraft(null);
    setBlockedMessage(null);
    setBlockedTarget(null);
  }

  function handleChangePenField(field, value) {
    setBlockedMessage(null);
    setBlockedTarget(null);
    setPenDraft((prev) => ({ ...prev, [field]: value }));
  }

  // Writes exactly one portion's raw typed string, leaving every other
  // portion and the removed flag untouched — the pen's amounts edit, the
  // split does not (CONTEXT.md phase boundary).
  function handleChangePenGrams(rowId, portionIndex, value) {
    setBlockedMessage(null);
    setBlockedTarget(null);
    setPenDraft((prev) => ({
      ...prev,
      rows: {
        ...prev.rows,
        [rowId]: {
          ...prev.rows[rowId],
          portions: prev.rows[rowId].portions.map((portion, i) =>
            i === portionIndex ? { ...portion, grams: value } : portion,
          ),
        },
      },
    }));
  }

  // Removing sets only the draft row's removed flag — it does not clear
  // the grams and does not touch any step (route-recipe-version.md § 3).
  // The same handler restores: removal never cascades, so this is always
  // the maker's own tap, whether flipping a row's own control or the
  // orphaned-row flag's "remove this row" control.
  function handleTogglePenRowRemoved(rowId) {
    setBlockedMessage(null);
    setBlockedTarget(null);
    setPenDraft((prev) => ({
      ...prev,
      rows: { ...prev.rows, [rowId]: { ...prev.rows[rowId], removed: !prev.rows[rowId].removed } },
    }));
  }

  // A step field setter for leadIn/instruction/purpose/aside (03-02):
  // `field` is always one of these four literal strings supplied by this
  // file's own call sites, never a maker-influenced key, so a computed
  // property name here carries no T-02-32 risk.
  function handleChangePenStepField(stepN, field, value) {
    setBlockedMessage(null);
    setBlockedTarget(null);
    setPenDraft((prev) => ({
      ...prev,
      method: prev.method.map((step) => (step.n === stepN ? { ...step, [field]: value } : step)),
    }));
  }

  // A target chip's label or value, matched by its index within the
  // step's own targets array rather than by label — a label can itself be
  // mid-edit, so matching by index avoids two chips momentarily colliding
  // on the same label while the maker types.
  function handleChangePenStepTarget(stepN, targetIndex, field, value) {
    setBlockedMessage(null);
    setBlockedTarget(null);
    setPenDraft((prev) => ({
      ...prev,
      method: prev.method.map((step) => {
        if (step.n !== stepN) return step;
        const targets = step.targets.map((target, index) => (index === targetIndex ? { ...target, [field]: value } : target));
        return { ...step, targets };
      }),
    }));
  }

  // The step's uses list, written through a filter and a concat
  // (route-recipe-version.md § 3), never a bare bracket write — a
  // different fact from the row's own step allocation, and both are kept.
  function handleTogglePenStepUses(stepN, rowId) {
    setBlockedMessage(null);
    setBlockedTarget(null);
    setPenDraft((prev) => ({
      ...prev,
      method: prev.method.map((step) => {
        if (step.n !== stepN) return step;
        const uses = step.uses ?? [];
        const nextUses = uses.includes(rowId) ? uses.filter((id) => id !== rowId) : uses.concat(rowId);
        return { ...step, uses: nextUses };
      }),
    }));
  }

  // Removing sets only the draft step's removed flag — removal never
  // cascades, so this is always the maker's own tap, whether flipping a
  // step's own control or the removed-row cross-flag's "remove this step"
  // control.
  function handleTogglePenStepRemoved(stepN) {
    setBlockedMessage(null);
    setBlockedTarget(null);
    setPenDraft((prev) => ({
      ...prev,
      method: prev.method.map((step) => (step.n === stepN ? { ...step, removed: !step.removed } : step)),
    }));
  }

  // An authored note's text, and the inherited-from marker it carries
  // (route-recipe-version.md, "Inherited notes"): the marker persists when
  // the edited text still equals the text this version inherited it with,
  // and clears the instant it differs — computed once, here, so every
  // reader (Authored.jsx included) can read `note.inheritedFrom` directly
  // rather than re-deriving it.
  function handleChangePenNoteText(listKey, index, value) {
    setBlockedMessage(null);
    setBlockedTarget(null);
    setPenDraft((prev) => {
      const originalNote = version.authored[listKey][index];
      const notes = prev.authored[listKey].map((note, i) =>
        i === index
          ? { ...note, text: value, inheritedFrom: value === originalNote.text ? originalNote.inheritedFrom : null }
          : note,
      );
      return { ...prev, authored: { ...prev.authored, [listKey]: notes } };
    });
  }

  // A note can be removed per note (route-recipe-version.md § 3) — an
  // outright removal from the list, not a struck-in-place flag: an
  // authored note carries no cross-flag concern the way a row or step does.
  function handleRemovePenNote(listKey, index) {
    setBlockedMessage(null);
    setBlockedTarget(null);
    setPenDraft((prev) => ({
      ...prev,
      authored: { ...prev.authored, [listKey]: prev.authored[listKey].filter((_, i) => i !== index) },
    }));
  }

  // Shared by both save paths: the one message that blocks the save is
  // computed by the tested domain function (D-04) — the same sentence can
  // never drift between the two save controls. `excludeId` scopes the
  // uniqueness check: null for a fresh child (compared against every
  // version of the recipe, including the one the pen opened on), the
  // current version's own id for a save-over (so keeping its own line
  // never reads as a collision with itself). Returns null when blocked, or
  // the pen's fields coerced for the domain constructor (rows' grams
  // strings are Number()'d here, at save time, never on keystroke —
  // Pitfall 5). A reason of nothing but whitespace is treated as blank and
  // stored as null, exactly as an empty reason already was.
  function buildPenFields(excludeId) {
    const scopedVersions = versionsForRecipe(versions, version.recipeId).filter((v) => v.id !== excludeId);
    const message = blockedSaveMessage(penDraft, version, scopedVersions);
    if (message) {
      setBlockedMessage(message);
      // D-21: the same traversal that named the message also names the
      // row it blocked on, so the two can never disagree (T-03.1-21) — a
      // row id marks and focuses that row's grams field; no row id means
      // the block is the version line's own. blockedAttemptRef increments
      // on every blocked press (WR-01) so a second consecutive block on
      // the same field still moves focus.
      const rowId = blockedSaveRowId(penDraft, version, scopedVersions);
      blockedAttemptRef.current += 1;
      setBlockedTarget(
        rowId ? { kind: 'row', rowId, attempt: blockedAttemptRef.current } : { kind: 'versionLine', attempt: blockedAttemptRef.current },
      );
      return null;
    }
    const rows = version.rows.map((row) => {
      const draftRow = penDraft.rows[row.id];
      return {
        ...row,
        portions: row.portions.map((portion, i) => {
          const draftPortion = draftRow.portions[i];
          return { step: draftPortion.step, grams: parseGramsDraft(draftPortion.grams) ?? portion.grams };
        }),
        removed: draftRow.removed,
      };
    });
    return {
      versionLabel: penDraft.versionLabel,
      reason: penDraft.reason.trim() === '' ? null : penDraft.reason,
      citedBatchId: penDraft.citedBatchId,
      rows,
      method: penDraft.method,
      headnote: penDraft.headnote,
      authored: penDraft.authored,
    };
  }

  // The two impure calls (a fresh id, the current instant) live here, in
  // the one save handler — createChildVersion stays deterministic. The
  // parent is never passed to repository.saveVersion (D04, T-03-03).
  function handleSaveAsNewVersion() {
    const penFields = buildPenFields(null);
    if (!penFields) return;
    const child = createChildVersion(version, penFields, { id: crypto.randomUUID(), now: new Date().toISOString() });
    repository.saveVersion(child).then(() => {
      setVersions((prev) => [...prev, child]);
      setMode('reading');
      setPenDraft(null);
      setBlockedMessage(null);
      setBlockedTarget(null);
      // D-27: focus lands on the child's Develop control on mount. The
      // router keys RecipePage by `${id}::${batchId}` (router.jsx), so
      // the child mounts fresh and this state is read exactly once.
      navigate(`/recipe/${child.id}`, { state: { focusDevelop: true } });
    });
  }

  // Available only on a version with zero batches (D-01). The control's
  // absence from the headnote is the design; this re-check is the
  // guarantee — a churned version's own record is never written to (D04)
  // even if this handler were somehow reached with the control hidden.
  function handleSaveOverVersion() {
    if (batches.length > 0) return;
    const penFields = buildPenFields(version.id);
    if (!penFields) return;
    const updated = saveOverVersion(version, penFields, { now: new Date().toISOString() });
    repository.saveVersion(updated).then(() => {
      setVersion(updated);
      setVersions((prev) => prev.map((existing) => (existing.id === updated.id ? updated : existing)));
      setMode('reading');
      setPenDraft(null);
      setBlockedMessage(null);
      setBlockedTarget(null);
    });
  }

  return (
    <>
      {/* The running head (route-recipe-version.md § 4): the way home in
          every state, identifying the book, never the recipe's name and
          never changing with state. */}
      <p className="running-head">
        <Link to="/">Sprinkles</Link>
      </p>
      <article className="recipe-page">
        {/* The front matter (sketch 003 variant B, 03.3-01): two
            full-width stacked rows — the version's row, then the batch's
            row (app.css .recipe-band). Recipe block first in DOM order,
            so the intro paragraph field precedes every save in the tab
            order (D-28). */}
        <div className="recipe-band">
          <div className="recipe-band__row-version">
            <Headnote
              version={version}
              mode={mode}
              penDraft={penDraft}
              onChangePenField={handleChangePenField}
            />

            <VersionRow
              version={version}
              versions={versions}
              mode={mode}
              penDraft={penDraft}
              batches={batches}
              allBatches={allBatches}
              citedBatch={citedBatch}
              parentVersion={parentVersion}
              showingChanges={showingChanges}
              openPen={openPen}
              penReason={penReason}
              canSaveOver={canSaveOver}
              penHint={penHint}
              versionLineBlockedAttempt={blockedTarget?.kind === 'versionLine' ? blockedTarget.attempt : null}
              onStartDeveloping={handleStartDeveloping}
              onCancelDeveloping={handleCancelDeveloping}
              onChangePenField={handleChangePenField}
              onSaveAsNewVersion={handleSaveAsNewVersion}
              onSaveOverVersion={handleSaveOverVersion}
              onToggleShowChanges={handleToggleShowChanges}
              focusDevelopOnMount={focusDevelopOnMount}
              openBatch={openBatch}
              onStartRecording={handleStartRecording}
            />
          </div>

          <BatchRow
            version={version}
            batches={batches}
            openBatch={openBatch}
            mode={mode}
            draft={draft}
            fieldErrors={fieldErrors}
            invalidFieldTarget={invalidFieldTarget}
            blockedDateMessage={blockedDateMessage}
            blockedDateAttempt={blockedDateAttempt}
            formStatus={formStatus}
            onChangeRecordField={handleChangeRecordField}
            onChangeSegment={handleChangeSegment}
            openPen={openPen}
            penReason={penReason}
            onStartAmending={handleStartAmending}
            onCancelRecording={handleCancelRecording}
            onSaveBatch={handleSaveBatch}
          />
        </div>

        <section className="ingredient-table-region" aria-label="Ingredients">
          <h2 className="region-name">Ingredients</h2>
          {hasRows ? (
            <IngredientTable
              rows={mode === 'developing' || showingChanges ? version.rows : readingVersion.rows}
              draftVersion={draftVersion}
              diff={changeDiff}
              showingChanges={showingChanges}
              blockedRowId={blockedTarget?.kind === 'row' ? blockedTarget.rowId : null}
              blockedRowAttempt={blockedTarget?.kind === 'row' ? blockedTarget.attempt : null}
              markedRowIds={markedRowIds}
              markedFigureLabel={markedFigureLabel}
              mode={mode}
              draft={draft}
              penDraft={penDraft}
              openBatch={openBatch}
              steps={mode === 'developing' || showingChanges ? version.method : readingVersion.method}
              currentStepNumbers={currentStepNumbers}
              onChangeAsMade={handleChangeAsMade}
              onChangePenGrams={handleChangePenGrams}
              onTogglePenRowRemoved={handleTogglePenRowRemoved}
            />
          ) : (
            <p>This version has no ingredient rows.</p>
          )}
        </section>

        <section className="method-region" aria-label="Method">
          <Method
            steps={mode === 'developing' || showingChanges ? version.method : readingVersion.method}
            stepChanges={mode === 'recording' ? draft.stepChanges : openBatch ? openBatch.churn.stepChanges : {}}
            mode={mode}
            onChangeStepChange={handleChangeStepChange}
            rows={version.rows}
            draftVersion={draftVersion}
            baselineVersion={version}
            penDiff={penDiff}
            penStaleSteps={penStaleSteps}
            showingChanges={showingChanges}
            changeDiff={changeDiff}
            staleSteps={changeStaleSteps}
            staleFlagVisible={mode === 'developing' || showingChanges}
            currentStepNumbers={currentStepNumbers}
            baselineStepNumbers={baselineStepNumbers}
            onChangePenStepField={handleChangePenStepField}
            onChangePenStepTarget={handleChangePenStepTarget}
            onTogglePenStepUses={handleTogglePenStepUses}
            onTogglePenStepRemoved={handleTogglePenStepRemoved}
            beforeYouStart={mode === 'developing' && penDraft ? penDraft.authored.beforeYouStart : version.authored.beforeYouStart}
            onChangeNoteText={handleChangePenNoteText}
            onRemoveNote={handleRemovePenNote}
          />
        </section>

        {/* Column two, what the sheet does not print: the formulation note
            beside the table, then the margin beneath it. One flow, so the
            method's height never separates the two. */}
        <div className="side-region">
          <section className="formulation-note-region" aria-label="Balance">
            <FormulationNote
              version={liveVersion}
              mode={mode}
              diff={mode === 'developing' ? penDiff : changeDiff}
              onFocusFigure={setFocusedFigureKey}
              onBlurFigure={() => setFocusedFigureKey(null)}
            />
            <BasisNote version={liveVersion} />
          </section>

          <div className="margin-region">
            <DerivedAdvisories version={liveVersion} />
            <Authored
              carriedForward={mode === 'developing' && penDraft ? penDraft.authored.carriedForward : version.authored.carriedForward}
              mode={mode}
              onChangeNoteText={handleChangePenNoteText}
              onRemoveNote={handleRemovePenNote}
            />
          </div>
        </div>

        <PenFoot
          openPen={openPen}
          canSaveOver={canSaveOver}
          penHint={penHint}
          onCancelDeveloping={handleCancelDeveloping}
          onSaveAsNewVersion={handleSaveAsNewVersion}
          onSaveOverVersion={handleSaveOverVersion}
          onCancelRecording={handleCancelRecording}
          onSaveBatch={handleSaveBatch}
        />
      </article>
    </>
  );
}
